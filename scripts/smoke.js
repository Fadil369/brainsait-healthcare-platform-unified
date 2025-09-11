/* Simple smoke test script.
 * Usage: BASE_URL=http://localhost:3000 node scripts/smoke.js
 */

const BASE = process.env.BASE_URL || 'http://localhost:3000';

const { checkEndpoint } = require('./smoke-util');

(async () => {
  let fail = false;

  const endpoints = [
    { path: '/api/dashboard', name: 'dashboard' },
    { path: '/api/security/compliance', name: 'compliance', opts: { method: 'GET' } },
  ];

  for (const ep of endpoints) {
    const result = await checkEndpoint(BASE, ep.path, ep.opts || {});
    // eslint-disable-next-line no-console
    console.log(`${ep.name}:`, result);
    if (!result.ok || !result.csp || !result.hsts || !result.rid) fail = true;
  }

  if (fail) {
    // eslint-disable-next-line no-console
    console.error('Smoke tests failed');
    process.exit(1);
  } else {
    // eslint-disable-next-line no-console
    console.log('All smoke tests passed');
  }
})();
