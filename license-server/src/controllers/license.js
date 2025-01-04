const { v4: uuidv4 } = require('uuid');
const { pool } = require('../database');
const logger = require('../utils/logger');
const { generateToken } = require('../utils/jwt');

/**
 * Verifieert een licentie key
 */
async function verifyLicense(req, res) {
  const { key } = req.body;

  if (!key) {
    return res.status(400).json({ error: 'Licentiesleutel is verplicht' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM licenses WHERE key = $1 AND is_active = true AND valid_until > NOW()',
      [key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ongeldige of verlopen licentie' });
    }

    const license = result.rows[0];
    
    // Controleer API gebruik
    const today = new Date().toISOString().split('T')[0];
    const usageResult = await pool.query(
      'SELECT SUM(api_calls) as total_calls FROM license_usage WHERE license_id = $1 AND date = $2',
      [license.id, today]
    );

    const totalCalls = parseInt(usageResult.rows[0]?.total_calls || 0);
    if (totalCalls >= license.max_api_calls) {
      return res.status(429).json({ error: 'API limiet bereikt voor vandaag' });
    }

    // Genereer JWT token voor verdere authenticatie
    const token = generateToken(license);

    res.json({
      valid: true,
      type: license.type,
      features: license.features,
      token
    });
  } catch (error) {
    logger.error('Fout bij licentie verificatie:', error);
    res.status(500).json({ error: 'Interne server fout' });
  }
}

/**
 * Activeert een nieuwe licentie
 */
async function activateLicense(req, res) {
  const { key, companyName, domains } = req.body;

  if (!key || !companyName) {
    return res.status(400).json({ error: 'Licentiesleutel en bedrijfsnaam zijn verplicht' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Controleer of licentie al bestaat
    const existingLicense = await client.query(
      'SELECT * FROM licenses WHERE key = $1',
      [key]
    );

    if (existingLicense.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Licentie is al geactiveerd' });
    }

    // Maak nieuwe licentie aan
    const license = {
      id: uuidv4(),
      type: 'trial', // Standaard trial licentie
      key,
      company_name: companyName,
      domains: domains || [],
      features: {}, // Basis features
      valid_until: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 dagen trial
      max_api_calls: 1000, // Dagelijkse API limiet voor trial
      is_active: true
    };

    await client.query(
      'INSERT INTO licenses (id, type, key, company_name, domains, features, valid_until, max_api_calls, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [license.id, license.type, license.key, license.company_name, license.domains, license.features, license.valid_until, license.max_api_calls, license.is_active]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Licentie succesvol geactiveerd',
      license: {
        type: license.type,
        valid_until: license.valid_until,
        features: license.features
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Fout bij licentie activatie:', error);
    res.status(500).json({ error: 'Interne server fout' });
  } finally {
    client.release();
  }
}

/**
 * Deactiveert een licentie
 */
async function deactivateLicense(req, res) {
  const { key } = req.body;

  if (!key) {
    return res.status(400).json({ error: 'Licentiesleutel is verplicht' });
  }

  try {
    const result = await pool.query(
      'UPDATE licenses SET is_active = false, updated_at = NOW() WHERE key = $1 AND is_active = true RETURNING *',
      [key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Licentie niet gevonden of al gedeactiveerd' });
    }

    res.json({ message: 'Licentie succesvol gedeactiveerd' });
  } catch (error) {
    logger.error('Fout bij licentie deactivatie:', error);
    res.status(500).json({ error: 'Interne server fout' });
  }
}

/**
 * Haalt de status van een licentie op
 */
async function getLicenseStatus(req, res) {
  const { key } = req.params;

  try {
    const result = await pool.query(
      'SELECT type, valid_until, is_active, features FROM licenses WHERE key = $1',
      [key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Licentie niet gevonden' });
    }

    const license = result.rows[0];
    res.json({
      type: license.type,
      valid_until: license.valid_until,
      is_active: license.is_active,
      features: license.features
    });
  } catch (error) {
    logger.error('Fout bij ophalen licentie status:', error);
    res.status(500).json({ error: 'Interne server fout' });
  }
}

/**
 * Upgradet een licentie naar een hoger plan
 */
async function upgradeLicense(req, res) {
  const { key, newType } = req.body;

  if (!key || !newType) {
    return res.status(400).json({ error: 'Licentiesleutel en nieuw type zijn verplicht' });
  }

  const validTypes = ['professional', 'enterprise'];
  if (!validTypes.includes(newType)) {
    return res.status(400).json({ error: 'Ongeldig licentie type' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Haal huidige licentie op
    const currentLicense = await client.query(
      'SELECT * FROM licenses WHERE key = $1 AND is_active = true',
      [key]
    );

    if (currentLicense.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Licentie niet gevonden of niet actief' });
    }

    const license = currentLicense.rows[0];

    // Update features en limieten op basis van het nieuwe type
    const features = newType === 'professional' 
      ? {
          maxDomains: 5,
          customReports: true,
          apiLimit: 5000,
          support: 'premium'
        }
      : {
          maxDomains: -1, // onbeperkt
          customReports: true,
          apiLimit: -1, // onbeperkt
          support: 'priority',
          whiteLabel: true
        };

    // Update de licentie
    await client.query(
      'UPDATE licenses SET type = $1, features = $2, max_api_calls = $3, updated_at = NOW() WHERE key = $4',
      [newType, features, features.apiLimit, key]
    );

    await client.query('COMMIT');

    res.json({
      message: 'Licentie succesvol geüpgraded',
      type: newType,
      features
    });
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Fout bij licentie upgrade:', error);
    res.status(500).json({ error: 'Interne server fout' });
  } finally {
    client.release();
  }
}

module.exports = {
  verifyLicense,
  activateLicense,
  deactivateLicense,
  getLicenseStatus,
  upgradeLicense
};
