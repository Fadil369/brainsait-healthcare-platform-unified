# BrainSAIT Unified Healthcare Platform — Architecture

This document outlines the high‑level architecture, conventions, and guardrails to keep the platform scalable, secure, and maintainable.

## Domain-Driven Design (DDD) Layout

Top-level workspace folders:

- `apps/` — Runtime entrypoints and composition layers
  - `web/` (Next.js)
  - `mobile/` (React Native/Expo)
  - `ios/` (SwiftUI)
- `services/` — Backend services and API layers (e.g., FastAPI, Node services)
- `packages/` — Shared libraries (TypeScript, Python, Swift)
- `workers/` — Background jobs (Cloudflare Workers, queues, schedulers)
- `infrastructure/` — IaC (Kubernetes, Terraform, Docker, Cloudflare Tunnel)

This repo currently hosts the `apps/web` and shared TS libraries; folders are scaffolded for forward compatibility.

## Naming Conventions

- TypeScript: camelCase vars, PascalCase types/components, strict typing, functional React.
- Python: snake_case, type hints required (PEP 484), FastAPI routing style.
- Swift: PascalCase types, camelCase vars, MVVM for views.
- Healthcare: FHIR R4 resource naming; follow clinical terminology (ICD‑10, CPT, LOINC, DICOM).

## Security & Compliance

- HIPAA & NPHIES compliance with comprehensive audit logging.
- Role-based access control (RBAC) and least-privilege defaults.
- End‑to‑end encryption for PHI; no plaintext PHI in logs.
- Strict CSP and HSTS; optional nonce CSP via middleware.

## UI/Design System

- Branding: Midnight Blue (#1a365d), Medical Blue (#2b6cb8), Signal Teal (#0ea5e9), Deep Orange (#ea580c), Professional Gray (#64748b).
- Glass morphism with adaptive RTL/LTR and Arabic support (IBM Plex Sans Arabic).
- Animation: Framer Motion with reduced‑motion support; optional mesh backgrounds.

## Tech Stack (target)

- Frontend: Next.js/React/Tailwind, React Native, SwiftUI (scoped apps/).
- Backend: FastAPI, Node services, Cloudflare Workers; LangChain/OpenAI/Anthropic.
- Infra: Docker, Kubernetes, Cloudflare Tunnel, PostgreSQL, Redis.

## Testing

- Unit tests for FHIR/clinical logic.
- Integration tests for APIs.
- Accessibility (WCAG, RTL) and performance benchmarks.

