# Evidence-First Portfolio and Case Study Specification

## Objective

Extend the public editorial portfolio with original, evidence-led project, Lab, writing, and About content inspired by the information architecture observed on mauriciojuba.com. The work must use only facts, project data, and links already present in the application or supplied by the user. It must not copy proprietary imagery, client logos, wording, metrics, or visual effects from the reference.

## Scope and Order

The work ships in two dependent phases.

1. **Evidence layer:** improve the existing homepage, portfolio index, blog archive, and About page using the data already available to the templates.
2. **Case-study system:** add a public project detail route and template driven by the same project metadata, with intentional empty and incomplete-data states.

The evidence layer must land first because the detail pages reuse its factual metadata and visual vocabulary.

## Phase 1: Evidence Layer

### Shared Evidence Rules

- Every project surface must make its type, status, stack, and available destinations easy to scan.
- Optional evidence fields are omitted when unavailable. No fallback text may imply an unverified role, client, timeline, user count, rating, or outcome.
- The existing project title, description, image, `project_type`, `status`, `technologies`, `demo_url`, and `github_url` fields remain the source of truth.
- Existing public routes, contact POST/CSRF behavior, admin templates, and database schema remain unchanged.

### Homepage

- Enhance selected-work cards with a consistent evidence strip: sequence, project type, status, technology tags, and real demo/source actions.
- Replace the generic Lab notes with project-adjacent proof cards that can link to the portfolio, existing skills content, blog entries, and configured project destinations.
- Lab cards must visibly communicate their subject, technology/context, maturity or status when known, and a truthful next action.
- Keep the current six-part navigation, persisted accent control, semantic landmarks, and zero-WebGL implementation.

### Portfolio Index

- Render a compact, evidence-first summary for every dynamic project.
- Use only existing project fields: type, status, technologies, visual preview, description, live system link, and source link.
- Preserve progressive enhancement project filtering and the existing no-project empty state.
- Add a case-study action only after Phase 2 supplies a route and safely handles incomplete content.

### Writing

- Keep blog data and routes unchanged.
- Make article rows consistently show sequence, publication date when available, category, and reading time.
- Do not invent reading time or publication dates. Existing template defaults are retained only where the application already defines them.

### About

- Preserve the existing biography, journey, principles, and credential evidence.
- Make principles, capabilities, and practical toolkit scan as distinct evidence blocks without adding employment claims or unsupported education details.

### Visual and Interaction Constraints

- Continue the existing editorial design tokens, mono metadata, outlined landmarks, restrained bordered rows, and persisted accent palette.
- Do not add WebGL, Three.js, custom cursor behavior, autoplay video, third-party award badges, or copied reference imagery.
- Keep interactive controls keyboard operable and responsive at 1440px, 1024px, 390px, and 360px widths.
- Research/Lab cards must not depend on intersection reveal state for baseline visibility.

## Phase 2: Case Study System

### Route and Data Flow

- Add a public route using a stable project identifier available from the current model. If the model does not expose a safe detail lookup, add the smallest compatible lookup method rather than adding a second project store.
- Detail-page navigation must use the existing public shell and return the shared 404 page for an unknown project.
- The route passes the selected project, ordered neighboring projects when available, and only existing project attributes to the template.

### Detail Page

- A thesis-like headline uses the project title and description.
- A facts panel renders only available values: type, status, technologies, live URL, source URL, and project preview.
- The long description is shown as supplied; no project process narrative is fabricated.
- Previous/next project controls appear only when neighbors exist.
- Missing media is replaced with the established numbered placeholder, not an invented image.

### Metadata Extension Boundary

- The first case-study release does not require database migration.
- Role, timeline, scope, outcomes, gallery items, and case-study body are optional future metadata. They should be added only after factual content is provided and after a schema proposal is approved.

## Testing and Validation

- Extend Flask template tests before implementation to define the Phase 1 evidence contracts and Phase 2 route/detail contracts.
- Confirm the new detail route returns 200 for a known project and 404 for an unknown project.
- Confirm absent optional values do not render misleading labels or empty actions.
- Run the focused public-page suite and complete test suite after each phase.
- Inspect public pages at desktop and mobile widths for visible Lab content, working navigation, focusable controls, and no horizontal overflow.
- Check editor diagnostics and `git diff --check` before commit.

## Deployment

After both phases pass local validation, commit only the verified source and test files, push `main`, deploy the existing Railway `web` service, wait for a terminal `SUCCESS`, then smoke-test the live homepage, portfolio index, and one project detail page.