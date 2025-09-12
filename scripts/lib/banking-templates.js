// Banking/Treasury/FinTech templates and detection

const CATS = [
  { key: 'treasury', kws: ['treasury', 'cash management', 'balance', 'ledger', 'sweep'] },
  { key: 'issuing', kws: ['issuing', 'card issuing', 'virtual card', 'pan', 'bin'] },
  { key: 'ach', kws: ['ach', 'nach', 'aba', 'routing', 'ach return', 'r01', 'r02', 'r03'] },
  { key: 'wire', kws: ['wire', 'swift', 'iban', 'mt103', 'fedwire'] },
  { key: 'reconciliation', kws: ['reconciliation', 'reconcile', 'match', 'unmatched', 'statement'] },
  { key: 'settlement', kws: ['settlement', 'settle', 'capture', 'merchant settlement'] },
  { key: 'disputes', kws: ['dispute', 'chargeback', 'retrieval', 'cbk', 'reason code'] },
  { key: 'payouts', kws: ['payout', 'payouts', 'transfer', 'pay out'] },
  { key: 'kyc', kws: ['kyc', 'identity', 'verification', 'customer due diligence'] },
  { key: 'kyb', kws: ['kyb', 'business verification', 'beneficial owner', 'ubo'] },
  { key: 'aml', kws: ['aml', 'anti money laundering', 'sanction', 'pep', 'watchlist'] },
  { key: 'fraud', kws: ['fraud', 'velocity', 'chargeback risk', 'anomaly'] },
  { key: 'pci', kws: ['pci', 'pci-dss', 'saq', 'pan storage', 'tokenization'] },
];

function detectBankingCategory(text) {
  const t = (text || '').toLowerCase();
  for (const c of CATS) {
    if (c.kws.some((k) => t.includes(k))) return c.key;
  }
  return 'other';
}

function buildInitial(subject, reporterFrom, category) {
  const cat = category || 'other';
  const subj = `[BrainSAIT Security/Banking] We received your report (${cat})`;
  const bulletsByCat = {
    treasury: [
      '- No sensitive account data. Provide timestamps and ledger IDs only.',
      '- Include reconciliation period and statement references.'
    ],
    issuing: [
      '- Do not include PAN/PII. Provide tokenized refs only.',
      '- Include BIN, last4, and error codes (no PAN).'
    ],
    ach: [
      '- Mask account/routing numbers. Provide ACH return codes (R01..).',
      '- Include submission/settlement timestamps.'
    ],
    wire: [
      '- No IBAN/SWIFT in full; mask. Provide MT103 refs only.',
      '- Include bank and message IDs.'
    ],
    reconciliation: [
      '- Provide periods and unmatched counts (no raw statements).',
      '- Include hash or checksum of files instead of contents.'
    ],
    settlement: [
      '- Provide batch IDs and totals only (no card data).',
      '- Include acquirer response codes.'
    ],
    disputes: [
      '- No cardholder data. Provide dispute IDs and reason codes.',
      '- Include timelines and evidence types (no PII).'
    ],
    payouts: [
      '- Provide payout IDs and timestamps; no account numbers.',
      '- Include statuses and error codes.'
    ],
    kyc: [
      '- Do not include identity documents. Provide check types and result codes.',
      '- Include correlation IDs and timestamps.'
    ],
    kyb: [
      '- No registration docs. Provide business verification status and IDs.',
      '- Include adverse media flags (no content).'
    ],
    aml: [
      '- Provide screening result types and list names; no subject details.',
      '- Include case IDs and timestamps.'
    ],
    fraud: [
      '- Provide risk scores and rule IDs only.',
      '- Include velocity indicators (no user data).'
    ],
    pci: [
      '- Do not transmit PAN/track data. Share SAQ type and findings.',
      '- Include tokenization/segmentation notes (no secrets).'
    ],
    other: [
      '- Avoid PII/financial data. Share timestamps, IDs, and error codes only.'
    ]
  };
  const bullets = bulletsByCat[cat] || bulletsByCat.other;
  const text = [
    'Hello,',
    '',
    'Thank you for contacting BrainSAIT Security regarding banking/fintech. We have received your report and started triage.',
    '',
    'For the next update, please provide (if possible, without sensitive data):',
    ...bullets,
    '',
    '— BrainSAIT Security Team',
  ].join('\n');
  return { subject: subj, text };
}

function buildFollowUpText(category, severity) {
  const cat = category || 'other';
  const s = String(severity || 'unknown').toUpperCase();
  const base = `We are following up on your banking report. Current status: triage in progress (severity: ${s}, area: ${cat}).`;
  const ask = 'Include timestamps, IDs, and error codes only (no PAN/PII).';
  return ['Hello,', '', base, ask, '', '— BrainSAIT Security Team'].join('\n');
}

module.exports = { detectBankingCategory, buildInitial, buildFollowUpText };

