const { checkEndpoint } = require('../scripts/smoke-util');

test('checkEndpoint returns expected shape on success', async () => {
  const base = 'http://localhost:3000';
  const path = '/api/test';
  const mockRes = {
    ok: true,
    status: 200,
    headers: {
      get: (k) => ({
        'content-security-policy': 'default-src self',
        'strict-transport-security': 'max-age=31536000',
        'x-request-id': 'abc-123',
      })[k.toLowerCase()] || null,
    },
  };
  const fetchImpl = async () => mockRes;
  const result = await checkEndpoint(base, path, {}, fetchImpl);
  expect(result).toEqual({ ok: true, status: 200, csp: true, hsts: true, rid: true });
});

test('checkEndpoint reports failure correctly', async () => {
  const base = 'http://localhost:3000';
  const path = '/api/test';
  const mockRes = {
    ok: false,
    status: 500,
    headers: {
      get: () => null,
    },
  };
  const fetchImpl = async () => mockRes;
  const result = await checkEndpoint(base, path, {}, fetchImpl);
  expect(result.ok).toBe(false);
  expect(result.status).toBe(500);
  expect(result.csp).toBe(false);
});

