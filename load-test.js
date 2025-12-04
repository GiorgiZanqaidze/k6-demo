// load-test.js
import http from 'k6/http';
import { check, sleep, group } from 'k6';

// Define the aggression level
export const options = {
  stages: [
    { duration: '10s', target: 10 }, // Warm up to 10 users
    { duration: '20s', target: 50 }, // Ramp up to 50 (Breaking point approaches)
    { duration: '20s', target: 100 }, // Stress test (Should crash here)
    { duration: '10s', target: 0 },   // Cooldown
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],   // Error rate should be < 1%
    http_req_duration: ['p(95)<500'], // 95% of requests should be faster than 500ms
  },
};

const BASE_URL = 'http://localhost:3000';

export default function () {
  
  // Step 1: User browses products (Fast)
  group('Browse Products', function () {
    const res = http.get(`${BASE_URL}/products`);
    check(res, { 'status is 200': (r) => r.status === 200 });
  });

  sleep(1); 

  // Step 2: User looks at specific item (Slower)
  group('View Product Details', function () {
    const res = http.get(`${BASE_URL}/product/1`);
    check(res, { 
      'status is 200': (r) => r.status === 200,
      'latency < 300ms': (r) => r.timings.duration < 300
    });
  });

  sleep(2);

  // Step 3: User attempts to buy (The Danger Zone)
  group('Checkout', function () {
    const payload = JSON.stringify({ cartId: 123 });
    const params = { headers: { 'Content-Type': 'application/json' } };
    
    const res = http.post(`${BASE_URL}/checkout`, payload, params);
    
    check(res, { 
      'checkout success': (r) => r.status === 200 
    });
  });
}

