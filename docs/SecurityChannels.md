# Security Channels & Pipelines

This document defines channelized pipelines to route inbound security communications by domain (payers, providers, regulators, NPHIES) and lifecycle (claims, denials, billing, payments, API requests/responses).

## Channels
- `payers` — Payer integrations, treasury, issuing, bank partners.
- `providers` — Hospital/clinic integrations, clinical apps.
- `regulators` — Government agencies (e.g., MOH) and auditors.
- `nphies` — Saudi NPHIES/FHIR interoperability.
- `claims` — Claims ingestion/processing.
- `denials` — Denial analysis and remediation.
- `billing` — Invoices and charge disputes.
- `payments` — Card/ACH/Wire payment flows.
- `api-requests` — Inbound API request issues.
- `api-responses` — Response formatting/data integrity.

## Routing
- Config file: `.security/channels.json` maps keywords → channels.
- Inbox: drop parsed email JSON into `.security/inbox/*.json`.
- Pipeline: routes items into `.security/pipelines/<channel>/`.
- NPHIES sub-routing: items in the `nphies` channel are further routed by category to `.security/pipelines/nphies/<eligibility|preauth|claims|remittance|payment|compliance|security>/`.

## Commands
- Run channels pipeline (dry-run): `npm run security:channels`
- Enable sending/alerts: set `SEND=1` and provider env for email if you choose to notify.

## Extend
- Update `.security/channels.json` with new keywords or channels.
- Add automation per channel (e.g., open tickets, ping Slack) by extending `scripts/security-channels.js`. Keep PHI out of logs.
