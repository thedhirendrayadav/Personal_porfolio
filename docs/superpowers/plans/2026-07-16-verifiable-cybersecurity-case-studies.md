# Verifiable Cybersecurity Case Studies Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace fictional portfolio fallbacks with audited local projects, evidence-led case-study pages, cybersecurity-specific diagrams, and a distinct shared shell.

**Architecture:** A validated JSON registry supplies curated projects when the database has no featured records and powers stable slug detail routes. Existing integer database routes remain compatible. Jinja renders evidence modules only for present fields, while the shared shell replaces the bottom telemetry and color controls with a fixed identity and responsive evidence spine.

**Tech Stack:** Python 3.11, Flask, Jinja2, JSON, pytest, semantic HTML, layered CSS, vanilla JavaScript, Playwright browser tools.

## Global Constraints

- Do not invent roles, production usage, user counts, performance gains, security outcomes, or business impact.
- Every published technical claim must name an inspected source file, schema, test, report, or capture.
- Keep existing database tables, admin routes, contact POST/CSRF behavior, blog routes, and integer project detail routes compatible.
- Do not expose secrets, tokens, private hostnames, personal data, or absolute local filesystem paths.
- Use semantic HTML/CSS diagrams; graphics must not be required to understand the reading order.
- Remove theme/accent controls, their local-storage behavior, the local clock, and the fixed bottom status rail.
- Support 1440x900, 1024x768, 390x844, and 360x800 with no horizontal overflow.
- Do not commit automatically; leave source changes in the working tree for user review.

---

### Task 1: Curated Project Registry

**Files:**
- Create: `content/projects.json`
- Create: `project_content.py`
- Create: `tests/test_project_content.py`

**Interfaces:**
- Produces: `load_curated_projects() -> list[dict]`
- Produces: `get_curated_project(slug: str) -> dict | None`
- Produces: `get_curated_neighbors(slug: str) -> tuple[dict | None, dict | None]`
- Consumes: repository-relative `content/projects.json`

- [ ] **Step 1: Write registry validation tests**

Add tests proving that the loader returns unique slugs, required card fields, supported evidence types, safe HTTP(S) URLs, repository-relative media paths, and no terminal evidence matching common secret patterns such as `API_KEY=`, `Bearer `, private-key headers, or absolute Windows paths.

```python
def test_curated_projects_have_unique_valid_slugs():
    projects = load_curated_projects()
    slugs = [project["slug"] for project in projects]
    assert projects
    assert len(slugs) == len(set(slugs))
    assert all(re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug) for slug in slugs)


def test_terminal_evidence_contains_no_secret_patterns():
    serialized = json.dumps(load_curated_projects())
    for pattern in (r"API_KEY\s*=", r"Bearer\s+", r"BEGIN [A-Z ]*PRIVATE KEY", r"[A-Za-z]:\\"):
        assert not re.search(pattern, serialized, re.IGNORECASE)
```

- [ ] **Step 2: Run tests and verify RED**

Run: `pytest tests/test_project_content.py -q`

Expected: collection fails because `project_content` does not exist.

- [ ] **Step 3: Add the validated loader**

Implement `project_content.py` with a module-relative registry path, a small `ProjectContentError`, required key checks, slug uniqueness, URL validation using `urllib.parse.urlparse`, relative media validation, and cached immutable source loading with defensive copies returned to callers.

```python
REGISTRY_PATH = Path(__file__).with_name("content") / "projects.json"
REQUIRED_FIELDS = {"slug", "title", "description", "project_type", "status", "technologies", "evidence"}
ALLOWED_EVIDENCE_TYPES = {"source", "schema", "test", "capture", "report", "terminal"}


@lru_cache(maxsize=1)
def _load_registry() -> tuple[dict, ...]:
    raw = json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))
    _validate_registry(raw)
    return tuple(raw)


def load_curated_projects() -> list[dict]:
    return deepcopy(list(_load_registry()))
```

- [ ] **Step 4: Add audited project entries**

Create four entries: `multi-channel-ai-messaging`, `nepse-market-intelligence`, `secure-portfolio-platform`, and `runpod-media-orchestrator`. Each entry must use `Prototype`, `Research System`, or `In Development` unless deployment evidence is present. Include only claims tied to safe project-relative evidence labels such as `backend/src/app.ts`, `prisma/schema.prisma`, `src/predictor.py`, `tests/test_public_pages.py`, and `runpod_auto.py`.

- [ ] **Step 5: Run registry tests and verify GREEN**

Run: `pytest tests/test_project_content.py -q`

Expected: all registry tests pass with four curated entries.

### Task 2: Curated Fallbacks and Slug Routes

**Files:**
- Modify: `app.py`
- Modify: `templates/index.html`
- Modify: `templates/portfolio.html`
- Modify: `tests/test_public_pages.py`

**Interfaces:**
- Consumes: `load_curated_projects`, `get_curated_project`, `get_curated_neighbors`
- Produces: `GET /work/<slug>`
- Preserves: `GET /portfolio/<int:project_id>`

- [ ] **Step 1: Add failing route and precedence tests**

Add tests proving that empty database results render the four curated names, non-empty featured database results take precedence, `/work/nepse-market-intelligence` returns 200, `/work/not-real` returns the shared 404, and integer database detail tests still pass.

```python
def test_homepage_uses_curated_projects_when_database_is_empty(client):
    html = client.get("/").get_data(as_text=True)
    assert "Multi-Channel AI Messaging Platform" in html
    assert "NEPSE Market Intelligence" in html
    assert "Secure Operations Platform" not in html


def test_curated_project_slug_route(client):
    response = client.get("/work/nepse-market-intelligence")
    assert response.status_code == 200
    assert "NEPSE Market Intelligence" in response.get_data(as_text=True)
```

- [ ] **Step 2: Run focused tests and verify RED**

Run: `pytest tests/test_public_pages.py -q -k "curated or homepage_uses"`

Expected: failures show fictional fallbacks and a missing slug route.

- [ ] **Step 3: Implement curated fallback selection**

In the homepage and portfolio routes, load featured database projects inside the existing error boundary. Set `projects = database_projects or load_curated_projects()`. Add `content_source="database" if database_projects else "curated"` to template context so links use integer routes for database records and slug routes for curated records.

- [ ] **Step 4: Implement the slug route**

Add `/work/<slug>` before no catch-all route. Load the curated project and neighbors, render `project_detail.html` with `project_source="curated"`, and return the shared 404 when absent.

- [ ] **Step 5: Remove fictional template fallbacks**

Delete the three hard-coded concept names from `templates/index.html`. Render project actions using a project-provided `detail_url` or source-aware route selection. Keep missing media accessible through an architecture preview rather than an empty image.

- [ ] **Step 6: Run focused and compatibility tests**

Run: `pytest tests/test_public_pages.py -q -k "curated or project_detail or homepage or evidence_layer"`

Expected: curated fallback, database precedence, slug route, and integer route tests pass.

### Task 3: Evidence-Led Case Study Template

**Files:**
- Modify: `templates/project_detail.html`
- Modify: `static/css/editorial-portfolio.css`
- Modify: `tests/test_public_pages.py`

**Interfaces:**
- Consumes curated project keys: `problem`, `role`, `scope`, `constraints`, `architecture`, `trust_boundaries`, `security_decisions`, `evidence`, `outcomes`, `hardening`
- Preserves sparse database-project rendering

- [ ] **Step 1: Add failing complete and sparse rendering tests**

For a curated detail response, assert labeled regions for `SYSTEM QUESTION`, `ROLE & SCOPE`, `CONSTRAINTS`, `ARCHITECTURE`, `TRUST BOUNDARIES`, `SECURITY DECISIONS`, `IMPLEMENTATION EVIDENCE`, `VERIFIED OUTCOMES`, and `OPEN HARDENING`. For the existing sparse database fixture, assert absent evidence sections do not render.

- [ ] **Step 2: Run detail tests and verify RED**

Run: `pytest tests/test_public_pages.py -q -k "curated_project_detail or sparse_project_detail"`

Expected: evidence-region assertions fail against the current single-summary template.

- [ ] **Step 3: Build semantic evidence regions**

Refactor `project_detail.html` into conditional regions. Render architecture as an ordered list with explicit `from`, `to`, and `protocol` text. Render each trust boundary and risk/control/source row as a real list or table. Add evidence-type text stamps and keep external links optional.

- [ ] **Step 4: Add project-specific visual modules**

Add CSS classes for `.architecture-flow`, `.architecture-node`, `.trust-boundary`, `.security-matrix`, `.evidence-ledger`, `.terminal-capture`, and `.outcome-list`. Use dotted boundaries, cyan control accents, coral risk accents, and responsive vertical ordering. Do not use decorative cards inside cards.

- [ ] **Step 5: Verify detail behavior**

Run: `pytest tests/test_public_pages.py -q -k "project_detail or curated or evidence"`

Expected: complete curated pages and sparse database pages pass.

### Task 4: Distinct Shared Shell

**Files:**
- Modify: `templates/base.html`
- Modify: `static/js/editorial-portfolio.js`
- Modify: `static/css/editorial-portfolio.css`
- Modify: `tests/test_public_pages.py`

**Interfaces:**
- Produces: `[data-evidence-progress]`, `[data-evidence-section]`, and `.evidence-spine`
- Removes: `.status-rail`, `[data-theme-toggle]`, `[data-accent-toggle]`, `[data-local-time]`, `portfolio-theme`, and `portfolio-accent`

- [ ] **Step 1: Rewrite the shell contract test to fail**

Assert the absence of the old rail and controls and the presence of the evidence spine. Assert the rendered JavaScript source contains no theme/accent storage keys or clock update logic.

```python
def test_public_shell_uses_evidence_spine_without_reference_controls(client):
    html = client.get("/").get_data(as_text=True)
    assert 'class="evidence-spine"' in html
    assert "data-evidence-progress" in html
    assert "status-rail" not in html
    assert "data-theme-toggle" not in html
    assert "data-accent-toggle" not in html
    assert "data-local-time" not in html
```

- [ ] **Step 2: Run shell test and verify RED**

Run: `pytest tests/test_public_pages.py::test_public_shell_uses_evidence_spine_without_reference_controls -q`

Expected: failure because the current bottom status rail and controls are present.

- [ ] **Step 3: Replace shell markup**

Remove `data-theme="dark"` only if no CSS depends on it, delete the bottom rail, and add an aside containing a progress track, current section output, and `FIELD LOG / 2026`. Keep a visually hidden `aria-live="polite"` current-section output when the visible rotated label is hidden on mobile.

- [ ] **Step 4: Simplify shell JavaScript**

Delete theme/accent persistence and clock intervals. Repoint the existing requestAnimationFrame scroll calculation to the evidence spine. Reuse the IntersectionObserver for the active-section label. Preserve menu, reveals, filtering, work deck, and contact behavior.

- [ ] **Step 5: Replace shell CSS**

Remove bottom rail dimensions and footer compensation. Add a fixed right-edge spine on desktop and a fixed two-pixel top progress rule below the header on screens at or below 980px. Use one fixed token set with cyan `--accent` and coral `--signal`.

- [ ] **Step 6: Run shell and public-page tests**

Run: `pytest tests/test_public_pages.py -q`

Expected: all public rendering and shell contracts pass.

### Task 5: Genuine Evidence Captures

**Files:**
- Create: `static/images/projects/messaging-dashboard.webp`
- Create: `static/images/projects/nepse-dashboard.webp`
- Create: `static/images/projects/portfolio-system.webp`
- Create: `static/images/projects/runpod-lifecycle.webp` only if a genuine UI or sanitized generated artifact exists
- Modify: `content/projects.json`
- Test: `tests/test_project_content.py`

**Interfaces:**
- Consumes: locally runnable applications and safe generated output
- Produces: optimized local images referenced by registry `gallery` and `image_url`

- [ ] **Step 1: Add failing local-media tests**

For each registry media path, assert the resolved path exists under `static/`, has a `.webp`, `.png`, or `.jpg` suffix, and has non-zero size. Assert width and height metadata are positive when declared.

- [ ] **Step 2: Run media tests and verify RED**

Run: `pytest tests/test_project_content.py -q -k media`

Expected: failure because project captures do not yet exist.

- [ ] **Step 3: Capture messaging and NEPSE interfaces**

Run each project with its documented development command without reading or exposing `.env` values. Use demo or disconnected states when backends are unavailable. Capture a viewport that shows actual application structure, not a marketing splash. Crop only browser chrome and redact personal or secret data.

- [ ] **Step 4: Capture this portfolio and infrastructure evidence**

Capture the portfolio homepage or admin-independent project flow locally. For RunPod, do not provision paid infrastructure; use a sanitized lifecycle artifact only if the repository already generates one. If no genuine visual exists, omit RunPod media and use its semantic lifecycle diagram.

- [ ] **Step 5: Optimize and register images**

Store assets below `static/images/projects/`, declare dimensions in the registry, and use meaningful alt text. Do not include absolute source paths in metadata or captions.

- [ ] **Step 6: Run media and public tests**

Run: `pytest tests/test_project_content.py tests/test_public_pages.py -q`

Expected: all registry, media, route, and template tests pass.

### Task 6: Full Browser and Regression Verification

**Files:**
- Modify only files required to correct failures discovered by verification

**Interfaces:**
- Verifies the complete implementation

- [ ] **Step 1: Run the full automated suite**

Run: `pytest -q`

Expected: zero failures.

- [ ] **Step 2: Check syntax and editor diagnostics**

Run Python syntax diagnostics for modified Python files and retrieve VS Code errors for all modified HTML, CSS, JavaScript, JSON, and test files. Resolve only errors introduced by this work.

- [ ] **Step 3: Start the Flask application**

Run the configured virtual-environment interpreter with `app.py` in a persistent terminal. Confirm `/`, `/portfolio`, each `/work/<slug>`, and one integer `/portfolio/<id>` fixture path where data exists return expected status codes.

- [ ] **Step 4: Inspect required viewports**

At 1440x900, 1024x768, 390x844, and 360x800, inspect the homepage, portfolio index, and one complete case study. Check text fit, evidence-spine behavior, mobile progress, architecture reading order, matrices, screenshots, focus indicators, and absence of horizontal overflow.

- [ ] **Step 5: Inspect runtime quality**

Confirm no browser console errors, broken assets, secret-bearing terminal text, empty controls, overlapping fixed UI, or inaccessible links. Exercise reduced motion and keyboard navigation.

- [ ] **Step 6: Review the final diff**

Run: `git diff --check`

Expected: no whitespace errors. Review `git diff --stat` and ensure no `.env`, credentials, generated dependency folders, or unrelated user files are included.