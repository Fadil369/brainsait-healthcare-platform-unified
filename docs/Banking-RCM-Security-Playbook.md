# Banking & RCM Security Playbook

Templates and routing to handle banking/fintech and revenue cycle issues without exposing sensitive data.

## Banking Categories
- treasury — Cash management, ledger, balance, sweeps
- issuing — Card issuing (no PAN), BIN/last4, tokenization
- ach — ACH returns (R01..), routing/ABA
- wire — SWIFT/IBAN, MT103, Fedwire
- reconciliation — File/statement reconciliation
- settlement — Batch/capture settlement
- disputes — Disputes/chargebacks (reason codes)
- payouts — Payouts/transfers
- kyc/kyb — Identity/Business verification
- aml — Screening/sanctions/PEP
- fraud — Risk signals/rules
- pci — PCI-DSS compliance

Initial/follow-up templates live in `scripts/lib/banking-templates.js`.

## RCM Categories
- registration — Patient registration (no PHI)
- eligibility — Coverage/benefits (status only)
- preauth — Authorizations (codes/statuses)
- charge-capture — Encounter/charge entry
- coding — ICD/CPT/HCPCS validation
- claim-submission — 837 submissions (control numbers)
- adjudication — Payer responses
- denial-management — Denials/appeals
- patient-billing — Statements/invoices
- payment-posting — 835 posting
- reconciliation — GL/balance reconciliation
- refunds — Refunds/credits
- collections — Dunning/collections
- reporting — KPIs/aging
- audit — Audits/compliance reviews

Initial/follow-up templates live in `scripts/lib/rcm-templates.js`.

## Routing
- Channel router maps keywords to `banking` and `rcm` and sub-routes per category.
- See `.security/channels.json` and `scripts/security-channels.js`.

## Usage
- Auto-replies: `npm run security:send` detects banking/rcm and applies safe templates.
- Follow-ups: `npm run security:followups` uses category-based follow-ups.
- Channelization: `npm run security:channels` routes to `.security/pipelines/banking/<cat>/...` and `.security/pipelines/rcm/<cat>/...`.
