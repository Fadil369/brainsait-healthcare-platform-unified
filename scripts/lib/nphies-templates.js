// NPHIES-specific detection and templates for security replies and follow-ups

const CATS = [
  {
    key: 'eligibility',
    kws: [
      'eligibility',
      'e-eligibility',
      'eligibilityrequest', // legacy naming
      'eligibilityresponse',
      'coverageeligibilityrequest',
      'coverageeligibilityresponse',
    ],
  },
  {
    key: 'preauth',
    kws: [
      'preauth',
      'pre-authorization',
      'pre authorization',
      'authorization',
      'preauthorizationrequest',
      'preauthorizationapproval',
      'preauthorizationdenial',
    ],
  },
  {
    key: 'claims',
    kws: [
      'claim submission',
      'claim',
      'claims',
      'claimresponse',
      'adjudication',
      'claimresponse.error.code',
      'item.adjudication',
    ],
  },
  {
    key: 'remittance',
    kws: ['remittance', 'era', 'eob', 'payment advice', 'explanationofbenefit'],
  },
  {
    key: 'payment',
    kws: ['payment', 'reconciliation', 'paymentreconciliation', 'paymentnotice', 'paymentreconciliation.outcome'],
  },
  {
    key: 'compliance',
    kws: [
      'profile',
      'conformance',
      'capabilitystatement',
      'implementationguide',
      'structuredefinition',
      'valueset',
      'codesystem',
      'terminology',
      'loinc',
      'icd-10',
      'icd10',
      'snomed',
      'coding',
    ],
  },
  {
    key: 'security',
    kws: [
      'mtls',
      'mutual tls',
      'tls',
      'certificate',
      'client certificate',
      'jws',
      'jwt',
      'signature',
      'bundle.signature',
      'kid',
      'alg',
      'digest',
    ],
  },
];

function detectNphiesCategory(text) {
  const t = (text || '').toLowerCase();
  for (const c of CATS) {
    if (c.kws.some((k) => t.includes(k))) return c.key;
  }
  return 'other';
}

function buildInitial(subject, reporterFrom, category) {
  const cat = category || 'other';
  const subj = `[BrainSAIT Security/NPHIES] We received your report (${cat})`;
  const bulletsByCat = {
    eligibility: [
      '- Do not include PHI; use synthetic member IDs.',
      '- Share request/response timestamps and HTTP status only.',
      '- Endpoints: CoverageEligibilityRequest/Response (or EligibilityInquiry/Response).',
    ],
    preauth: [
      '- Omit PHI and attachments; share resource types only.',
      '- Provide error codes/messages and correlation IDs.',
      '- Endpoints: PreAuthorizationRequest/Approval/Denial.',
    ],
    claims: [
      '- No PHI: mask claim references and IDs.',
      '- Include validation errors and profile names (R4).',
      '- If relevant, include ClaimResponse.error.code and Item.adjudication (no raw patient data).',
      '- Endpoints: ClaimSubmission / ClaimResponse.',
    ],
    remittance: [
      '- Share ERA identifiers (masked), totals only (no line items).',
      '- Include signature/verification errors if any.',
      '- Endpoint: Remittance Advice.',
    ],
    payment: [
      '- Provide reconciliation IDs and timestamps; no account numbers.',
      '- Include hash of payload if relevant (no raw data).',
      '- If relevant, include PaymentReconciliation.outcome (no payload data).',
      '- Endpoint: PaymentReconciliation.',
    ],
    compliance: [
      '- Reference profile and version; attach non-sensitive logs.',
      '- Include terminology system and code sets (no patient data).',
      '- CapabilityStatement/Conformance details welcome.',
    ],
    security: [
      '- Certificate chain details; no private keys.',
      '- mTLS handshake errors and time windows.',
      '- JWS/JWT header/alg info (no tokens).',
    ],
    other: [
      '- Avoid PHI/PII. Provide timestamps, status codes, and endpoint paths only.',
    ],
  };
  const bullets = bulletsByCat[cat] || bulletsByCat.other;
  const text = [
    'Hello,',
    '',
    'Thank you for contacting BrainSAIT Security regarding NPHIES. We have received your report and started triage.',
    '',
    'For the next update, please provide (if possible, without PHI):',
    ...bullets,
    '',
    '— BrainSAIT Security Team',
  ].join('\n');
  return { subject: subj, text };
}

function buildFollowUpText(category, severity) {
  const cat = category || 'other';
  const s = String(severity || 'unknown').toUpperCase();
  const base = `We are following up on your NPHIES report. Current status: triage in progress (severity: ${s}, area: ${cat}).`;
  const ask =
    cat === 'security'
      ? 'If you can, include certificate chain fingerprints and error messages (no private keys or secrets).'
      : 'If you can, include timestamps and error codes (no PHI/PII).';
  return ['Hello,', '', base, ask, '', '— BrainSAIT Security Team'].join('\n');
}

module.exports = { detectNphiesCategory, buildInitial, buildFollowUpText };
