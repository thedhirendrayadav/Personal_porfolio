# Verifiable Cybersecurity Case Studies Design

## Objective

Replace generic portfolio fallbacks with real projects supported by inspectable local source, genuine captures, and explicitly bounded claims. Expand project detail pages into evidence-led technical narratives, introduce a cybersecurity-specific visual vocabulary, and remove the two shell behaviors most closely associated with the Mauricio Juba reference.

The result must preserve the existing Flask application, dynamic project support, admin routes, blog, contact behavior, and deployment targets. It must not invent roles, production usage, user counts, performance gains, security outcomes, or business impact.

## Authoritative Evidence

Public GitHub currently contains only the portfolio repository. The local `General projects` directory is therefore the source for additional project evidence. Only source files, manifests, schemas, tests, generated reports, and locally runnable interfaces may support public claims.

Initial candidates are:

1. **Multi-Channel AI Messaging Platform** from `AUtomatic_Messaging_system`.
2. **NEPSE Market Intelligence** from `stock_market_predictor`.
3. **Secure Portfolio Platform** from this repository.
4. **RunPod Media Orchestrator** from `runpod automation`.

A candidate is omitted if source inspection cannot verify a coherent architecture and at least one meaningful implementation artifact. A project may be labeled `Prototype`, `Research System`, or `In Development`; it must not be presented as production software unless deployment evidence exists.

## Chosen Architecture

Use a hybrid content model:

- Add a version-controlled case-study registry in the portfolio repository.
- Give each curated project a stable string slug independent of database IDs.
- Store evidence-specific fields in the registry: thesis, problem, scope, constraints, architecture, trust boundaries, controls, artifacts, outcomes, and local media.
- Keep existing database projects and admin fields unchanged.
- On the homepage and portfolio index, use featured database projects when available and curated projects when the database is empty.
- Project detail routing supports curated slugs while retaining the existing integer route for database projects.
- Database metadata may override matching display fields in a future iteration, but it cannot override or synthesize evidence sections implicitly.

This avoids a database migration, works in local and deployed empty-data environments, and keeps factual narrative under source control where it can be reviewed with the code.

## Registry Contract

Each project entry contains:

- `slug`, `title`, `short_title`, `description`, `project_type`, `status`, and `featured`.
- `technologies`, `repository_url`, `demo_url`, `source_path`, and `image_url` when available.
- `problem`, `role`, `scope`, and `constraints` as concise factual prose.
- `architecture` as ordered nodes with labels, categories, and relationships.
- `trust_boundaries` as named boundaries with the data or privilege crossing them.
- `security_decisions` as observed risk/control pairs with source references.
- `implementation_evidence` as code, schema, test, report, terminal, or screenshot artifacts.
- `outcomes` as verified capabilities or measured results. Capabilities must not be phrased as business impact.
- `gallery` as local screenshots, diagrams, or sanitized terminal captures.

Optional fields are omitted from rendered output. The loader validates required keys, unique slugs, local asset paths, allowed evidence types, and safe external URLs.

## Content Rules

### Multi-Channel AI Messaging Platform

Audit the TypeScript monorepo, Fastify API, React dashboard, PostgreSQL/Prisma model, Redis/BullMQ queue, channel abstractions, role model, conversation states, message statuses, Helmet, rate limiting, bcrypt, JWT, Zod, metrics integration, and audit-log schema. Publish each technical claim only when a registry evidence item names the source file that implements it; package-manifest presence alone is insufficient.

The case study must not claim live customers, delivered messages, uptime, conversion impact, or production deployment without evidence.

### NEPSE Market Intelligence

Audit the ingestion pipeline, technical indicators, sentiment component, XGBoost/LSTM/Transformer ensemble design, backtesting engine, Streamlit dashboard, FastAPI surface, report generation, and educational disclaimer. Publish each technical claim only when a registry evidence item names the implementing source or generated report.

The case study must not publish model accuracy, returns, alpha, or reliability unless reproducible result files and their test conditions are inspected.

### Secure Portfolio Platform

Audit Flask routing, database-manager fallbacks, CSRF handling, contact rate limiting, security headers, content management, responsive public templates, tests, Railway/Vercel entry points, and evidence-led rendering. Publish each technical claim only when a registry evidence item names the implementing source or test.

The case study must not call the platform secure solely because controls exist. Copy must name the specific controls and their boundary.

### RunPod Media Orchestrator

Audit RunPod GraphQL provisioning, secure-cloud GPU selection, readiness polling, SSH/SFTP transfer, remote pipeline execution, output retrieval, explicit confirmation, and pod termination. Publish each technical claim only when a registry evidence item names the implementing source.

The case study must label host-key auto-acceptance and broad exception handling as constraints or hardening opportunities, not security strengths. It must not claim cost savings, viral performance, or unattended reliability.

## Homepage and Portfolio Index

- Remove fictional fallback names and descriptions.
- Render up to four curated projects when no featured database projects exist.
- Use real project names, truthful statuses, verified technologies, and local preview media.
- Each card includes one concise architecture cue rather than generic numbered placeholder art.
- The primary action opens the local case study. Source and demo actions appear only when valid URLs exist.
- The work deck remains progressive enhancement: all projects remain readable when JavaScript or motion is unavailable.

## Case-Study Page

The page follows this order:

1. Breadcrumb, type/status, title, and evidence-based thesis.
2. Facts ledger for status, stack, source, and inspected evidence count.
3. Problem, role/scope, and constraints.
4. Architecture flow with text labels and directional relationships.
5. Trust-boundary and security-decision matrix.
6. Implementation evidence gallery containing screenshots, sanitized terminal excerpts, code/schema facts, and system-flow diagrams.
7. Verified outcomes and open hardening work.
8. Previous/next project navigation.

All diagrams use semantic HTML and CSS. Connector lines are supplementary; reading order and accessible labels communicate the same information without graphics. Raster screenshots use declared dimensions and lazy loading below the fold.

## Cybersecurity Visual Vocabulary

The design uses technical evidence rather than decorative hacker imagery:

- **Architecture maps:** solid nodes for internal components, outlined nodes for external systems, dotted enclosures for trust boundaries.
- **Threat/control matrix:** asset or boundary, observed risk, implemented control, and evidence source.
- **Terminal evidence:** sanitized command/output excerpts with explicit labels and no secrets, tokens, hostnames, personal data, or private paths.
- **System flows:** numbered request or job lifecycles with failure and recovery paths.
- **Evidence stamps:** `SOURCE`, `SCHEMA`, `TEST`, `CAPTURE`, and `REPORT`, each paired with text rather than color alone.
- **Security signal color:** coral identifies risk or unresolved hardening; cyan identifies implemented controls and verified paths.

No fake scanning animation, matrix rain, shield icon collage, radar decoration, or unsupported security score is permitted.

## Distinct Shell Identity

### Remove Color Controls

- Remove theme and accent controls from the shared shell.
- Remove their local-storage behavior and alternate accent token sets.
- Use a fixed dark canvas with cyan for verified controls and coral for risks or open constraints.
- Retain reduced-motion behavior and visible focus treatment.

### Replace Bottom Telemetry Rail

- Remove the fixed bottom status rail, local clock, theme readout, and accent readout.
- Add a narrow right-edge **evidence spine** on desktop with a vertical progress rule, current section number, and rotated `FIELD LOG / 2026` label.
- On mobile, collapse it to a two-pixel progress rule below the fixed header; do not reserve a bottom safe area.
- The active section remains available to assistive technology through a polite status element.

This preserves useful orientation while changing both the composition and meaning of the reference-inspired telemetry.

## Error Handling

- Unknown curated slugs and unknown database IDs use the shared 404 template.
- Invalid registry entries fail closed during loading and are logged with the slug and invalid field.
- Missing optional media renders a project-specific architecture preview, not a generic number.
- Missing source or demo URLs omit those controls.
- A missing local screenshot omits the gallery item rather than rendering a broken image.
- Sanitization is manual and test-enforced for known secret patterns before terminal excerpts are committed.

## Accessibility and Responsive Behavior

- Preserve skip navigation, semantic landmarks, sequential headings, focus-visible styles, and 44px touch targets.
- Architecture and threat information remains understandable in DOM reading order without connector styling.
- Evidence types include visible text labels; color never carries meaning alone.
- At 980px and below, diagrams become ordered vertical flows and matrices become stacked evidence records.
- At 390px and 360px, no fixed bottom UI remains and no horizontal scrolling is permitted.
- Reduced-motion users receive immediate content and static project transitions.

## Testing

Write tests before production changes for:

- Curated registry validation and unique slugs.
- Curated fallback rendering when the database is empty.
- Database project precedence when featured records exist.
- Slug detail routes and shared 404 behavior.
- Omission of absent optional evidence and links.
- Presence of problem, constraints, architecture, trust-boundary, security-decision, implementation-evidence, and outcome regions for complete entries.
- Removal of `status-rail`, theme controls, accent controls, clock, and related local-storage keys.
- Presence of the evidence spine, scroll progress, active section status, and mobile progress fallback.
- No secret-like values in committed terminal evidence.
- Existing contact, blog, admin-facing model, and integer project-route contracts remain intact.

Run the focused public-page suite after each behavior slice, then the complete test suite. Finish with browser inspection at 1440x900, 1024x768, 390x844, and 360x800, checking screenshots, keyboard navigation, console errors, missing assets, and horizontal overflow.

## Scope Boundary

This iteration does not migrate the project database, redesign admin templates, invent outcome metrics, publish private repositories, deploy external project applications, or expose local filesystem paths. It may capture local application screens and add sanitized, derivative evidence assets to this repository.