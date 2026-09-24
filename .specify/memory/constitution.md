# Planejador BNCC Constitution

## Core Principles

### I. Security by Default

Every input MUST be validated. Authentication MUST use secure mechanisms; the
backend MUST enforce RBAC and ownership for every private resource independently
of the interface. Secrets, credentials, integration keys, and private keys MUST
never be exposed, committed, or returned to the browser. Integration secrets MUST
remain in the backend or an approved secret store.

### II. Specification-Driven Delivery

Every functional change MUST begin in one numbered specification and follow the
Specify, Clarify, Plan, Checklist, Tasks, Analyze, Implement, and Converge flow.
Each feature MUST have exactly one specification, one `feat/<numero>-<nome>`
branch, and one pull request. The feature branch MUST be created automatically
immediately before Implement.

### III. Authoritative Data and Contractual API

PostgreSQL accessed through Prisma is the authoritative persistent store, and all
schema changes MUST use versioned migrations. The BNCC catalog is global and
read-only to teachers. The API MUST be RESTful and documented in OpenAPI/Swagger;
the frontend MUST NOT access the database, n8n, Gemini, or Qdrant directly.

### IV. Responsible AI with Human Authorship

Every AI-produced result MUST begin as an editable draft. Human authorship and
control MUST be preserved, and the system MUST NOT automatically finalize an AI
result. AI integrations MUST be called only through approved backend boundaries.

### V. Verifiable Quality

Relevant unit, integration, and critical end-to-end tests MUST be maintained.
Linting, type checking, and production builds MUST pass before a pull request is
opened. A failing quality gate blocks publication until it is resolved.

## Architecture and Data Boundaries

Private data belongs to its owner. The backend MUST verify ownership for every
read, write, update, deletion, or operation affecting private data. Client-side
visibility, route guards, and UI restrictions are convenience controls only and
MUST NOT replace backend authorization. External integration access is mediated
by backend services that validate requests, protect secrets, and return only the
data appropriate for the authenticated user.

## Delivery Workflow and Quality Gates

Work proceeds in small, reviewable increments. Implementation MUST use the active
numbered specification and its generated plan and tasks. Before publication, the
feature workflow MUST inspect the proposed changes, reject unexpected or sensitive
files, run available quality gates, and create a PR targeting `main`. Merge
approval remains a human decision.

## Governance

This constitution supersedes conflicting project practices. Any amendment MUST be
documented in `.specify/memory/constitution.md`, include a Sync Impact Report,
and follow semantic versioning: MAJOR for incompatible governance changes, MINOR
for new or materially expanded principles, and PATCH for clarifications. Pull
request reviews MUST verify compliance with these principles, especially security,
ownership, API boundaries, AI reviewability, and quality gates.

**Version**: 1.0.0 | **Ratified**: 2026-09-23 | **Last Amended**: 2026-09-23
