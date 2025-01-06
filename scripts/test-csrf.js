import { doubleCsrf } from 'csrf-csrf';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Laad environment variables
const envPath = process.env.NODE_ENV === 'production' 
  ? join(__dirname, '..', '.env.prod')
  : join(__dirname, '..', '.env');

if (fs.existsSync(envPath)) {
  console.log(`Laden van environment variables uit: ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.error(`Environment bestand niet gevonden: ${envPath}`);
  process.exit(1);
}

async function testCsrfModule() {
  try {
    console.log('Test CSRF module configuratie...');
    
    const { generateToken, doubleCsrfProtection } = doubleCsrf({
      getSecret: () => process.env.CSRF_SECRET || 'default-secret-key',
      cookieName: "XSRF-TOKEN",
      cookieOptions: {
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
      },
      size: 64,
      getTokenFromRequest: (req) => req.headers["x-csrf-token"]
    });

    // Test token generatie
    const mockRequest = { 
      headers: {},
      cookies: {} // Voeg cookies object toe
    };
    const mockResponse = {
      cookie: (name, value, options) => {
        console.log(`✅ Cookie '${name}' zou worden ingesteld met opties:`, options);
        // Simuleer het instellen van de cookie
        mockRequest.cookies[name] = value;
      }
    };

    // Genereer een test token
    const token = generateToken(mockResponse);
    console.log('✅ Token generatie succesvol:', token ? 'Token gegenereerd' : 'Geen token gegenereerd');

    // Stel de token in op het request object
    mockRequest.headers["x-csrf-token"] = token;
    
    // Test de middleware functie
    const middleware = doubleCsrfProtection;
    
    // Simuleer een middleware call
    await new Promise((resolve, reject) => {
      try {
        middleware(mockRequest, mockResponse, () => {
          console.log('✅ CSRF middleware validatie succesvol');
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });

    return true;
  } catch (error) {
    console.error('❌ CSRF test mislukt:', error.message);
    console.error('Stack trace:', error.stack);
    return false;
  }
}

async function runTests() {
  console.log('Start CSRF module tests...\n');
  
  const csrfValid = await testCsrfModule();

  console.log('\nTest Resultaten:');
  console.log('----------------');
  console.log(`CSRF Module Test: ${csrfValid ? '✅' : '❌'}`);

  if (csrfValid) {
    console.log('\n✅ CSRF module test geslaagd!');
    process.exit(0);
  } else {
    console.error('\n❌ CSRF module test mislukt. Controleer de output hierboven voor details.');
    process.exit(1);
  }
}

runTests().catch(console.error);
