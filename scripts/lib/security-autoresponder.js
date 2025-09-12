// JS helper for Node scripts (no TS runtime dependency)

const KEYWORDS = {
  critical: [
    'rce',
    'remote code',
    'data leak',
    'prod credential',
    'private key',
    'ssrf',
    'supply chain',
  ],
  high: ['sql injection', 'sqli', 'xss', 'csrf', 'privilege escalation', 'auth bypass'],
  medium: ['open redirect', 'clickjacking', 'dos', 'rate limit', 'insecure default'],
  low: ['info disclosure', 'banner', 'version', 'typo'],
};

const SLAS = { critical: 24, high: 72, medium: 168, low: 336, unknown: 168 };

function classifySeverity(input) {
  const text = (input || '').toLowerCase();
  for (const s of ['critical', 'high', 'medium', 'low']) {
    if (KEYWORDS[s].some((k) => text.includes(k))) return s;
  }
  return 'unknown';
}

function generateInitialReply(evt) {
  const severity = classifySeverity(`${evt.subject || ''} ${evt.body || ''}`);
  const sla = SLAS[severity];
  const to = evt.from;
  const subject = `[BrainSAIT Security] We received your report (ref: pending)`;
  const text = [
    'Hello,',
    '',
    'Thank you for contacting BrainSAIT Security. We have received your report and begun triage.',
    '',
    `Reference: temporary (${evt.messageId || 'n/a'}); severity (preliminary): ${String(severity).toUpperCase()}.`,
    `Acknowledgement SLA: within ${sla} hours. We will follow up with next steps or questions.`,
    '',
    'Please avoid sharing PHI/PII or secrets over email. If needed, we can provide a secure channel and a PGP key.',
    '',
    '— BrainSAIT Security Team',
  ].join('\n');
  const ccList = (process.env.SECURITY_ESCALATE_TO || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return { to, cc: ccList.length ? ccList : undefined, subject, text };
}

function planFollowUps(severity) {
  switch (severity) {
    case 'critical':
      return [
        { inHours: 4, reason: 'Initial triage update' },
        { inHours: 24, reason: 'Mitigation or status' },
        { inHours: 72, reason: 'Full remediation plan' },
      ];
    case 'high':
      return [
        { inHours: 24, reason: 'Triage update' },
        { inHours: 72, reason: 'Mitigation or status' },
      ];
    case 'medium':
      return [{ inHours: 72, reason: 'Status update' }];
    case 'low':
    default:
      return [{ inHours: 120, reason: 'Status update' }];
  }
}

function autoReply(evt = {}) {
  const severity = classifySeverity(`${evt.subject || ''} ${evt.body || ''}`);
  const slaHours = SLAS[severity];
  const initialReply = generateInitialReply(evt);
  const followUps = planFollowUps(severity);
  const escalate = severity === 'critical' || severity === 'high';
  return { severity, slaHours, initialReply, followUps, escalate };
}

function buildSESSendEmailParams(result) {
  const from = process.env.SECURITY_AUTOREPLY_FROM || 'security@brainsait.com';
  return {
    Source: from,
    Destination: { ToAddresses: [result.initialReply.to], CcAddresses: result.initialReply.cc || [] },
    Message: {
      Subject: { Data: result.initialReply.subject },
      Body: { Text: { Data: result.initialReply.text } },
    },
  };
}

function buildGmailSendPayload(result) {
  const from = process.env.SECURITY_AUTOREPLY_FROM || 'security@brainsait.com';
  const raw = [
    `From: ${from}`,
    `To: ${result.initialReply.to}`,
    result.initialReply.cc && result.initialReply.cc.length ? `Cc: ${result.initialReply.cc.join(', ')}` : undefined,
    `Subject: ${result.initialReply.subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    '',
    result.initialReply.text,
  ]
    .filter(Boolean)
    .join('\r\n');
  return { raw: Buffer.from(raw).toString('base64') };
}

module.exports = {
  autoReply,
  planFollowUps,
  buildSESSendEmailParams,
  buildGmailSendPayload,
};

