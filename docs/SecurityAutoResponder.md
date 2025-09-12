# Security Auto‑Responder Guide

This guide shows how to automate professional replies from `security@brainsait.com` with minimal risk and maximum clarity.

## Overview
- Webhook: POST email metadata to `POST /api/security/autoreply`.
- Engine: `src/lib/SecurityAutoResponder.ts` triages severity and generates safe replies and follow‑up plans.
- Sender: Use AWS SES or Gmail API to send the generated replies.

## Setup
1) Environment
- `SECURITY_AUTOREPLY_FROM` — sender (e.g., `security@brainsait.com`).
- `SECURITY_ESCALATE_TO` — comma‑separated escalation emails (e.g., `sec-leads@brainsait.com`).

2) Provider Integration
- AWS SES Inbound: Route inbound to an HTTPS endpoint (API Gateway/Lambda or directly to your Next app behind an ingress). Map SES payload → the webhook JSON shape below, then send via SES `SendEmail`.
- Gmail: Configure a Pub/Sub push subscription for the mailbox and forward parsed message data to the webhook; send replies via Gmail API `users.messages.send`.

3) Provider Dependencies
- SES sender: install `@aws-sdk/client-ses` (dev or prod dep as you prefer).
  - `npm i -D @aws-sdk/client-ses`
- Gmail sender: install `googleapis`.
  - `npm i -D googleapis`

## Webhook
- Endpoint: `POST /api/security/autoreply`
- Body example:
```json
{
  "subject": "Possible XSS on dashboard",
  "from": "researcher@example.com",
  "to": "security@brainsait.com",
  "body": "Found reflected XSS on /dashboard?query=...",
  "messageId": "<abc123@example.com>"
}
```
- Response: JSON with `severity`, `initialReply.text`, `followUps[]`, and `escalate` flags.

## Sending Replies
- AWS SES (Node): call `SendEmail` with the provided `initialReply.text`.
- Gmail: send a MIME message with the generated text. Both helper builders are included in the library for reference.

## Follow‑ups
- Use a scheduler (GitHub Actions cron, Cloudflare Worker, or a queue) to enact `followUps[]` by time window. Recompute with the library to avoid state drift.

## Local Test
```bash
# Start the app
npm run dev

# Simulate an inbound report
curl -sS localhost:3000/api/security/autoreply \
  -H 'content-type: application/json' \
  -d '{"subject":"SQL injection", "from":"r@example.com", "to":"security@brainsait.com", "body":"union select"}' | jq
```

Notes
- The engine is rule‑based by default for predictability; you can add LLM classification behind a feature flag.
- Never include reporter content in templates verbatim; the provided templates avoid reflection.
