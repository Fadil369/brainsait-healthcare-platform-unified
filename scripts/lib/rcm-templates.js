// Revenue Cycle Management templates and detection

const CATS = [
  { key: 'registration', kws: ['registration', 'patient registration', 'demographics'] },
  { key: 'eligibility', kws: ['eligibility', 'coverage', 'benefits'] },
  { key: 'preauth', kws: ['preauth', 'authorization', 'prior auth'] },
  { key: 'charge-capture', kws: ['charge capture', 'encounter', 'charges', 'charge entry'] },
  { key: 'coding', kws: ['coding', 'icd-10', 'icd10', 'cpt', 'hcpcs'] },
  { key: 'claim-submission', kws: ['claim submission', '837', 'x12 837'] },
  { key: 'adjudication', kws: ['adjudication', 'payer response', 'remit'] },
  { key: 'denial-management', kws: ['denial', 'appeal', 'rework'] },
  { key: 'patient-billing', kws: ['patient billing', 'statement', 'invoice'] },
  { key: 'payment-posting', kws: ['payment posting', '835', 'x12 835', 'posting'] },
  { key: 'reconciliation', kws: ['reconciliation', 'balance', 'gl', 'ledger'] },
  { key: 'refunds', kws: ['refund', 'overpayment', 'credit'] },
  { key: 'collections', kws: ['collection', 'collections', 'dunning'] },
  { key: 'reporting', kws: ['report', 'kpi', 'aging', 'dashboard'] },
  { key: 'audit', kws: ['audit', 'compliance review', 'sox', 'hipaa audit'] },
];

function detectRCMCategory(text) {
  const t = (text || '').toLowerCase();
  for (const c of CATS) {
    if (c.kws.some((k) => t.includes(k))) return c.key;
  }
  return 'other';
}

function buildInitial(subject, reporterFrom, category) {
  const cat = category || 'other';
  const subj = `[BrainSAIT Security/RCM] We received your report (${cat})`;
  const bulletsByCat = {
    registration: [
      '- Do not include PHI; use synthetic demographics.',
      '- Provide error codes and timestamps only.'
    ],
    eligibility: [
      '- No PHI. Share request/response status and timing.',
      '- Include endpoint paths (no identifiers).'
    ],
    preauth: [
      '- Avoid PHI. Provide authorization statuses and codes.',
      '- Include timestamps and request IDs.'
    ],
    'charge-capture': [
      '- Do not include clinical notes. Provide encounter IDs only.',
      '- Include charge batch references and error messages.'
    ],
    coding: [
      '- No patient data. Provide code sets and validation errors.',
      '- Include rule IDs and versions.'
    ],
    'claim-submission': [
      '- Avoid PHI. Share 837 control numbers and ack codes.',
      '- Include submission times and errors.'
    ],
    adjudication: [
      '- Provide payer response statuses and code families.',
      '- No patient info; include correlation IDs.'
    ],
    'denial-management': [
      '- Share denial reasons/codes and counts (no PHI).',
      '- Include appeal timelines (no documents).'
    ],
    'patient-billing': [
      '- Do not include statements. Provide template/version IDs.',
      '- Include error codes and dates.'
    ],
    'payment-posting': [
      '- Provide 835 refs and batch IDs (no amounts per patient).',
      '- Include errors and summaries only.'
    ],
    reconciliation: [
      '- Share unmatched counts and periods (no details).',
      '- Include GL references.'
    ],
    refunds: [
      '- Provide refund IDs and totals; exclude patient details.',
      '- Include authorization codes if applicable.'
    ],
    collections: [
      '- Avoid PII. Provide dunning stage counts and dates.',
      '- Include vendor IDs (no account data).'
    ],
    reporting: [
      '- Provide KPI names, report IDs, and date ranges.',
      '- No underlying row data.'
    ],
    audit: [
      '- Share audit finding IDs and scope.',
      '- No records or PHI.'
    ],
    other: [
      '- Avoid PHI. Provide timestamps, status codes, and endpoints.'
    ]
  };
  const bullets = bulletsByCat[cat] || bulletsByCat.other;
  const text = [
    'Hello,',
    '',
    'Thank you for contacting BrainSAIT Security regarding revenue cycle. We have received your report and started triage.',
    '',
    'For the next update, please provide (no PHI):',
    ...bullets,
    '',
    '— BrainSAIT Security Team',
  ].join('\n');
  return { subject: subj, text };
}

function buildFollowUpText(category, severity) {
  const cat = category || 'other';
  const s = String(severity || 'unknown').toUpperCase();
  const base = `We are following up on your RCM report. Current status: triage in progress (severity: ${s}, area: ${cat}).`;
  const ask = 'Please share IDs, codes, and timestamps only (no PHI).';
  return ['Hello,', '', base, ask, '', '— BrainSAIT Security Team'].join('\n');
}

module.exports = { detectRCMCategory, buildInitial, buildFollowUpText };

