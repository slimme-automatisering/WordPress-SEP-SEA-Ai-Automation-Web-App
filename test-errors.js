import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/demo';

async function testEndpoints() {
  const endpoints = [
    '/syntax',
    '/runtime',
    '/promise',
    '/reference',
    '/api-error'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\nTesting ${endpoint}...`);
      await axios.get(BASE_URL + endpoint);
    } catch (error) {
      console.log('Expected error occurred');
    }
    
    // Wacht even tussen requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

testEndpoints();
