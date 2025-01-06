import mongoose from 'mongoose';
import Redis from 'ioredis';
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

async function testMongoConnection() {
  try {
    console.log('Test MongoDB verbinding...');
    // Gebruik de MONGODB_URI uit docker-compose.dev.yml
    const mongoUri = process.env.MONGODB_URI || 'mongodb://root:example@mongodb:27017/seo-sea?authSource=admin';
    console.log('Verbinden met MongoDB op:', mongoUri);
    
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB verbinding succesvol');
    return true;
  } catch (error) {
    console.error('❌ MongoDB verbinding mislukt:', error.message);
    return false;
  }
}

async function testRedisConnection() {
  try {
    console.log('Test Redis verbinding...');
    // Gebruik de REDIS_URI uit docker-compose.dev.yml
    const redisUri = process.env.REDIS_URI || 'redis://redis:6379';
    console.log('Verbinden met Redis op:', redisUri);
    
    const redis = new Redis(redisUri);
    await redis.ping();
    console.log('✅ Redis verbinding succesvol');
    redis.disconnect();
    return true;
  } catch (error) {
    console.error('❌ Redis verbinding mislukt:', error.message);
    return false;
  }
}

async function validateEnvironmentVariables() {
  console.log('\nControleren van environment variables...');
  
  const requiredVars = {
    'JWT_SECRET': process.env.JWT_SECRET,
    'CSRF_SECRET': process.env.CSRF_SECRET,
    'NODE_ENV': process.env.NODE_ENV,
    'MONGODB_URI': process.env.MONGODB_URI,
    'REDIS_URI': process.env.REDIS_URI
  };

  let allValid = true;
  
  for (const [key, value] of Object.entries(requiredVars)) {
    if (!value) {
      console.error(`❌ Ontbrekende environment variable: ${key}`);
      allValid = false;
    } else {
      console.log(`✅ ${key} is ingesteld`);
    }
  }

  return allValid;
}

async function runTests() {
  console.log('Start verbindingstests...\n');
  
  const envValid = await validateEnvironmentVariables();
  const mongoValid = await testMongoConnection();
  const redisValid = await testRedisConnection();

  console.log('\nTest Resultaten:');
  console.log('----------------');
  console.log(`Environment Variables: ${envValid ? '✅' : '❌'}`);
  console.log(`MongoDB Verbinding: ${mongoValid ? '✅' : '❌'}`);
  console.log(`Redis Verbinding: ${redisValid ? '✅' : '❌'}`);

  // Sluit mongoose verbinding
  await mongoose.disconnect();
  
  // Exit met juiste code
  if (envValid && mongoValid && redisValid) {
    console.log('\n✅ Alle tests geslaagd!');
    process.exit(0);
  } else {
    console.error('\n❌ Sommige tests zijn mislukt. Controleer de output hierboven voor details.');
    process.exit(1);
  }
}

runTests().catch(console.error);
