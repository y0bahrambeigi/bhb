# Smart Structures — private Persian release audit

An RTL audit workspace for `y0bahrambeigi/bhb`, PR #82, target v1.0.1.

## Behavior

- Ten evidence-backed gates, with status, required evidence, stop rule, responsible role, evidence URL, and update date.
- The release decision is permanently **NO-GO** in this implementation. External merge, tag/release, email, and Figshare operations have no integration or action endpoint.
- Append-only D1 audit events, optimistic conflict handling, owner-scoped data, and R2 evidence attachments with server-computed SHA-256.
- Forty-page, eight-criterion QA, bound to an immutable PDF hash, full source commit, renderer version, and named reviewer. Revoking a prerequisite or correcting a page suspends effective approval.
- Source-version comparison and browser SHA-256 comparison, with the ability to record hash results without uploading the book files.
- Downloadable Persian HTML (printable to PDF), UTF-8 CSV gate matrix, and comprehensive JSON archive with a dataset digest.
- A permission-request draft addressed to `info@bornaray.com` is an unsent reminder, never accepted as permission evidence.

The initial source snapshot was read with the connected GitHub read tools on 2026-11-07. It is pinned to `253fe38a2283dc07990f1b02ebdf3efaeeb3659d`. The app does not claim continuous GitHub synchronization. In the 2026-11-06 source evidence, official independent Regular/Bold faces are documented; written embedding permission, stable production rendering and full-page QA remain open. Source statements are distinguished from new auditor approvals. Roles are proposed responsibilities, not confirmed assignments.

The original repository, its PR, historical assets, v1.0.0 tag, and Figshare v2 are never modified by this app. The Site has no GitHub, email, or Figshare runtime connector. ChatGPT Sites owns private access and injects authenticated identity headers; API mutations require authenticated identity and scope records to that owner. Browser-local preferences are not used for audit persistence.

## Development and verification

Use the Sites project, dependency, build, preview, source, and publication helpers. `.openai/hosting.json` declares D1 `DB` and R2 `BUCKET`. Apply schema-only Drizzle migrations through the supported workflow. Seed evidence is immutable source data in `lib/audit-model.ts`, backed by `data/repository-snapshot.json`.

- `pnpm exec tsc --noEmit`
- `node tests/route-verification.mjs`
- Supported `build-site.mjs` helper

The route test runs real API handlers and migration SQL against isolated SQLite (D1-compatible) and an in-memory R2 adapter. It verifies authentication, owner isolation, permission-draft rejection, optimistic concurrency, attachment hashing, forty-page QA, approval revocation, report digests and exports. It changes no hosted records or external system. Hosted resource provisioning is checked by the Sites deployment workflow. Browser QA uses the managed Sites preview.

The UI uses unmodified Noto Sans Arabic (OFL 1.1); attribution and full license are in `public/fonts/OFL.txt`. No B Nazanin binary is bundled. The dashboard's font choice is independent of the book's font licensing gate.
