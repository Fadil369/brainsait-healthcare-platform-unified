# Security Follow-ups Store

This folder can hold a local JSON file to track follow-ups for the auto-responder.

- File path: `.security/followups.json` (ignored by Git).
- Example: see `followups.example.json`.
- The scheduled workflow `.github/workflows/security-followups.yml` runs every 4 hours and executes `node scripts/security-followups.js` in dry-run mode by default.

Enable sending
- Set repository secrets and enable sending by setting `SEND=1` and selecting a provider via `SECURITY_SENDER` (ses|gmail) in the workflow env.
- For SES, set `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` as repo secrets.
- For Gmail, provide a workload identity or `GOOGLE_APPLICATION_CREDENTIALS` via a secret file path and configure the action accordingly.

