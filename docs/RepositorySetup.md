# Repository Setup and Remote Push

This guide walks through creating a new GitHub repository and pushing the current codebase, plus a quick reference for CI and common tasks.

## 1) Create the GitHub repository

Create a new repo named `brainsait-healthcare-platform-unified` under your account `fadil369`.

- Web UI: https://github.com/new
  - Owner: `fadil369`
  - Repository name: `brainsait-healthcare-platform-unified`
  - Visibility: private or public (your choice)
  - Do NOT initialize with README/license (we already have files)

Or via GitHub CLI:

```bash
# SSH example (recommended):
gh repo create fadil369/brainsait-healthcare-platform-unified --private --source . --remote origin --disable-issues --disable-wiki
```

## 2) Initialize git locally and set remote

If not already initialized:

```bash
git init -b main
git add -A
git commit -m "chore: initialize repo with security, validation, CI, and docs"
```

Add the remote (SSH recommended):

```bash
# SSH
git remote add origin git@github.com:fadil369/brainsait-healthcare-platform-unified.git

# Or HTTPS
# git remote add origin https://github.com/fadil369/brainsait-healthcare-platform-unified.git
```

## 3) Push to GitHub

```bash
git push -u origin main
```

## 4) CI and scripts

- CI workflow is included: `.github/workflows/ci.yml`
- Run locally:
  - Lint auto-fix: `npm run lint:fix`
  - CI pipeline: `npm run ci`
  - Unit tests: `npm test`
  - Smoke tests (with server running): `npm run smoke`

## 5) Environment and secrets

- Add required variables in `.env.local` for local runs.
- For GitHub Actions (if needed), set repository “Secrets and variables” → `ACTIONS` (none are strictly required to run the default CI).
- Optional strict CSP: set `ENABLE_STRICT_CSP=true` in environment; validate app before enabling in production.

## 6) Notes

- This repo uses Tailwind v3, strict TypeScript, Zod validation, RBAC, and nonce-capable CSP.
- Review `ARCHITECTURE.md` for DDD layout and conventions.

