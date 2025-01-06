import express from 'express';
import { spawn } from 'child_process';
import { authMiddleware } from '../../middleware/auth.js';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Map van script namen naar bestandspaden en configuratie
const SCRIPTS = {
    'test-connections': {
        path: '../../../scripts/test-connections.js',
        type: 'node'
    },
    'check-dependencies': {
        path: '../../../scripts/check-dependencies.js',
        type: 'node'
    },
    'test-csrf': {
        path: '../../../scripts/test-csrf.js',
        type: 'node'
    },
    'backup-database': {
        path: '../../../scripts/backup_database.sh',
        type: 'bash'
    },
    'update-hosts': {
        path: '../../../scripts/update-hosts.ps1',
        type: 'powershell'
    }
};

router.post('/:scriptName', authMiddleware, (req, res) => {
    const { scriptName } = req.params;
    const scriptConfig = SCRIPTS[scriptName];

    if (!scriptConfig) {
        return res.status(404).json({ error: 'Script niet gevonden' });
    }

    const fullPath = path.join(__dirname, scriptConfig.path);
    let child;

    // Start het script op basis van het type
    switch (scriptConfig.type) {
        case 'node':
            child = spawn('node', [fullPath], { shell: true });
            break;
        case 'bash':
            child = spawn('bash', [fullPath], { shell: true });
            break;
        case 'powershell':
            // PowerShell moet met specifieke parameters worden gestart om het script uit te voeren
            child = spawn('powershell.exe', [
                '-NoProfile',
                '-ExecutionPolicy', 'Bypass',
                '-File', fullPath
            ], { shell: true });
            break;
        default:
            return res.status(500).json({ error: 'Onbekend script type' });
    }

    // Zet headers voor streaming response
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Stream output naar de client
    child.stdout.on('data', (data) => {
        res.write(data);
    });

    child.stderr.on('data', (data) => {
        res.write(`Error: ${data}`);
    });

    child.on('close', (code) => {
        res.write(`\nScript beëindigd met code ${code}`);
        res.end();
    });

    // Handle errors
    child.on('error', (error) => {
        res.write(`\nError bij uitvoeren script: ${error.message}`);
        res.end();
    });
});

export default router;
