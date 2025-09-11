async function checkEndpoint(base, path, opts = {}, fetchImpl = fetch) {
  const res = await fetchImpl(`${base}${path}`, {
    method: opts.method || 'GET',
    headers: {
      'x-user-id': 'smoke-user',
      'x-session-id': 'smoke-session',
      ...(opts.headers || {}),
    },
  });
  const csp = res.headers.get ? res.headers.get('content-security-policy') : res.headers['content-security-policy'];
  const hsts = res.headers.get ? res.headers.get('strict-transport-security') : res.headers['strict-transport-security'];
  const rid = res.headers.get ? res.headers.get('x-request-id') : res.headers['x-request-id'];
  return { ok: !!res.ok, status: res.status || 0, csp: !!csp, hsts: !!hsts, rid: !!rid };
}

module.exports = { checkEndpoint };

