import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

export let options = {
  stages: [
    { duration: '1m', target: 20 }, // Opbouw naar 20 gebruikers
    { duration: '3m', target: 20 }, // Blijf op 20 gebruikers
    { duration: '1m', target: 0 },  // Afbouw naar 0 gebruikers
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'], // 95% van requests onder 500ms
    'errors': ['rate<0.1'],            // Error rate onder 10%
  },
};

const BASE_URL = 'http://localhost:3000'; // Aanpassen naar juiste URL

export default function () {
  // Test scenario's
  let responses = {
    budget: http.get(`${BASE_URL}/api/google-ads/123/campaigns/456/budget`),
    experiments: http.get(`${BASE_URL}/api/google-ads/123/experiments`),
    rules: http.get(`${BASE_URL}/api/google-ads/123/automation/rules`),
    roi: http.get(`${BASE_URL}/api/google-ads/123/campaigns/456/roi`),
  };

  // Check responses
  Object.keys(responses).forEach(endpoint => {
    const response = responses[endpoint];
    const checkResult = check(response, {
      'status is 200': (r) => r.status === 200,
      'response time < 500ms': (r) => r.timings.duration < 500,
    });
    errorRate.add(!checkResult);
  });

  sleep(1);
}
