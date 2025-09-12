# Security Policy

## Reporting a Vulnerability
- Preferred: use GitHub’s Security tab — “Report a vulnerability” to open a private advisory.
- Or email security@brainsait.com. Do not open a public issue.
- Include: affected versions/commit SHA, impact, reproduction steps or PoC, logs or screenshots with sensitive data removed, and any temporary mitigations.

## Sensitive Data Handling (HIPAA/NPHIES)
- Never include PHI/PII, secrets, access tokens, or keys in reports.
- Redact URLs, request/response bodies, and identifiers. If needed, replace with synthetic data.
- If you require encryption, request our PGP key via the Security tab before sending details.

## Scope
- In scope: this repository’s code (Next.js app, API routes under `src/app/api`, libraries in `src/lib`, utilities in `src/utils`), deployment scripts and IaC in `deploy/` and `infrastructure/`.
- Out of scope: third‑party services and dependencies unless a clear exploit is demonstrated in this project’s usage.

## Triage & Disclosure
- Acknowledgement target: within 72 hours. We will collaborate on validation, impact, and a fix plan.
- Coordinated disclosure: please keep reports private until a fix is released. We will provide advisories and credit (with your consent).

## Helpful Artifacts
- Commands: `npm run smoke` output, `npm run build && npm start` reproduction steps, `curl`/Playwright/Jest snippets that demonstrate the issue.
- Environment: OS/browser, Node/npm versions, app config (sanitized), and whether the issue occurs in `dev`, `start`, or production build.

## Automated Security Inbox Agent (Optional)
This repo includes patterns and example code to automate timely, professional responses from security@brainsait.com while preserving privacy and compliance.

- Docs: see `docs/SecurityAutoResponder.md`.
- Sample code: `src/lib/SecurityAutoResponder.ts` and an API webhook at `src/app/api/security/autoreply/route.ts`.
- Providers: works with AWS SES (inbound -> webhook) or Gmail API (Pub/Sub push). Replies should be sent via your email provider (examples included).

- Channeled pipelines: domain routing for payers/providers/regulators/NPHIES and claims/denials/billing/payments/api via `docs/SecurityChannels.md`, `scripts/security-channels.js`, and scheduled workflow `.github/workflows/security-channels.yml`.
  - NPHIES playbook: category-specific guidance and templates in `docs/NPHIES-Security-Playbook.md` with templates in `scripts/lib/nphies-templates.js`.
  - Banking & RCM playbook: see `docs/Banking-RCM-Security-Playbook.md` with templates in `scripts/lib/banking-templates.js` and `scripts/lib/rcm-templates.js`.

Compliance reminder: automated messages must not echo PHI/PII or secrets; templates in the example explicitly avoid reflecting back reporter content.
