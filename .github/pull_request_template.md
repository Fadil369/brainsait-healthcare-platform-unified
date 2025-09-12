# Pull Request Template

## Summary
- What and why? Reference architecture/docs where relevant.

## Changes
- Key changes (files, APIs, behavior). Note breaking changes.

## How to Test
- Commands:
  - `npm run type-check`
  - `npm run lint`
  - `npm test` (optionally `-- --coverage`)
  - `npm run test:e2e` (if applicable)
  - `npm run build && npm start`
  - `npm run smoke` (ensure CSP/HSTS/Request-Id)
- Steps and expected results.

## Screenshots / Recordings
- UI changes only. Include before/after or short video.

## API Notes
- New/changed routes (method, path). Example requests/responses.

## Security & Compliance
- PHI logging avoided/sanitized.
- AuthZ via RBAC respected.
- Input validated (Zod) and errors sanitized.
- Security headers preserved (CSP/HSTS pass smoke).

## i18n, A11y, Perf
- i18n/RTL handled where appropriate.
- Accessibility considerations (labels, focus, contrast).
- Performance notes (bundle, lazy-loading, caching).

## Dependencies
- New deps and justification. Licenses reviewed.

## Coverage
- Current coverage: lines/branches (if measured). Internal target can be set via `COVERAGE_GLOBAL` env for Jest.

## Linked Issues
- Closes #

## Checklist
- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes (or `lint:fix` applied)
- [ ] Unit tests added/updated; `npm test` passes
- [ ] E2E added/updated if needed; `npm run test:e2e` passes
- [ ] Built locally; `npm run build && npm start`
- [ ] Smoke tests pass; `npm run smoke`
- [ ] Docs updated (README/ARCHITECTURE/AGENTS as needed)
