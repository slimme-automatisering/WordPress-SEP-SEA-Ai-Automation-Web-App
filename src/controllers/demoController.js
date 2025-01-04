import { Router } from 'express';
import { logger } from '../utils/logger';

const router = Router();

// 1. Syntax Error
router.get('/demo/syntax', (req, res) => {
  const obj = { name: "test" };  // Puntkomma toegevoegd
  
  const x = { test: "value" };  // Correcte object syntax
  
  res.json({ success: true });
});

// 2. Runtime Error (TypeError)
router.get('/demo/runtime', (req, res) => {
  const user = null;
  const name = user.profile.name;  // TypeError: Cannot read property 'profile' of null
  
  res.json({ name });
});

// 3. Unhandled Promise Rejection
router.get('/demo/promise', async (req, res) => {
  const promise = new Promise((resolve, reject) => {
    reject(new Error('Dit is een test error'));
  });
  
  // Vergeten om await te gebruiken
  promise;
  
  res.json({ success: true });
});

// 4. Reference Error
router.get('/demo/reference', (req, res) => {
  // Variabele bestaat niet
  res.json({ value: undefinedVariable });
});

// 5. Custom API Error
router.get('/demo/api-error', (req, res) => {
  throw new ApiError('Dit is een test API error', 400, 'TEST_ERROR');
});

export default router;
