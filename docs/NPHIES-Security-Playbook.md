# NPHIES Security Playbook

Guidelines, routing, and templates for handling NPHIES-related vulnerability and incident reports without exposing PHI/PII.

## Categories
- eligibility — CoverageEligibilityRequest/Response (or EligibilityInquiry/Response)
- preauth — PreAuthorizationRequest/Approval/Denial
- claims — ClaimSubmission/ClaimResponse (Item.adjudication, ClaimResponse.error.code)
- remittance — Remittance Advice (ERA/EOB, ExplanationOfBenefit)
- payment — PaymentReconciliation (PaymentReconciliation.outcome) and PaymentNotice
- compliance — Profiles/CapabilityStatement/Terminology (StructureDefinition/ValueSet/CodeSystem/ImplementationGuide)
- security — mTLS, certificates, signatures (JWS/JWT)

## Triage Checklist (no PHI)
- Record timestamps, endpoint paths, HTTP method/status, correlation/request IDs.
- Capture error codes/messages, profile names/versions, and conformance details.
- For security: certificate chain (fingerprints only), TLS versions/ciphers, JWS/JWT headers (no tokens).

## Initial Reply Templates
Generated automatically when keywords are detected. Key guidance per category is included (see scripts/lib/nphies-templates.js). All templates avoid reflecting reporter content.

## Follow-up Templates
Automated follow-ups reference category and severity, requesting non-sensitive diagnostics. See `buildFollowUpText` in templates.

## Integration
- Channel router: `npm run security:channels` routes `nphies` items to subfolders by category.
- Auto-replies: `npm run security:send` overrides subject/body with NPHIES templates when detected.
- Follow-ups: `npm run security:followups` uses NPHIES follow-up text when category is set in the thread store.

## Extending
- Update keyword lists in `scripts/lib/nphies-templates.js` and `.security/channels.json`.
- Add provider-specific fields (e.g., payer IDs) only as masked values; never include PHI.
