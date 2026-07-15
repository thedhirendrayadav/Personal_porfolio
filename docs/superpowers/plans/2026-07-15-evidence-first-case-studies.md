# Evidence-First Portfolio and Case Studies Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the public portfolio evidence-led and add factual, navigable project detail pages without changing the database schema or inventing project claims.

**Architecture:** Phase 1 extends current public templates with stable evidence markers and reuses fields already returned by `ProjectModel`. Phase 2 adds a numeric project-detail route that loads the requested project through `get_project_by_id`, derives adjacent projects from the ordered list, and renders a new page inside the public shell.

**Tech Stack:** Python 3.11, Flask 3, Jinja2, pytest, semantic HTML, and `static/css/editorial-portfolio.css`.

## Global Constraints

- Use only existing project, post, and About facts; never invent roles, clients, dates, metrics, outcomes, or imagery.
- Do not change the database schema, admin templates, printable CV, contact POST behavior, or six-part public navigation.
- Preserve the editorial token system, accent persistence, semantic landmarks, keyboard-operable controls, and progressive-enhancement project filters.
- Do not add WebGL, Three.js, custom cursor behavior, autoplay video, third-party badges, or copied reference assets.
- Omit unavailable optional values and their corresponding actions or labels.
- Validate at 1440px, 1024px, 390px, and 360px after both phases.

---

## File Structure

- `tests/test_public_pages.py`: contract tests for evidence markup and project-detail responses.
- `app.py`: project list normalization and public numeric detail route.
- `templates/index.html`: selected-work evidence and Lab proof cards.
- `templates/portfolio.html`: project evidence and a conditional internal case-study action.
- `templates/blog/index.html`: truthfully sequenced archive rows.
- `templates/about.html`: scan-friendly evidence blocks.
- `templates/project_detail.html`: new factual project-detail page.
- `static/css/editorial-portfolio.css`: evidence, fact-panel, and detail-navigation styles.

## Task 1: Evidence Layer

**Files:**
- Modify: `tests/test_public_pages.py`
- Modify: `app.py`
- Modify: `templates/index.html`
- Modify: `templates/portfolio.html`
- Modify: `templates/blog/index.html`
- Modify: `templates/about.html`
- Modify: `static/css/editorial-portfolio.css`

**Interfaces:**
- Consumes: `ProjectModel.get_all_projects(featured_only=False) -> list[dict]`, where `technologies` is an already-parsed list or absent.
- Produces: `data-evidence="project"`, `data-evidence="lab"`, `data-evidence="article"`, and `data-evidence-block` hooks without changing `data-project-type` filtering.

- [ ] **Step 1: Write the failing evidence tests**

Append the following tests to `tests/test_public_pages.py`:

```python
def test_evidence_layer_renders_available_project_fields_without_empty_actions(client, monkeypatch):
    project = {
        "id": 7,
        "title": "Signal Ledger",
        "description": "A verifiable security workflow.",
        "technologies": ["Python", "Flask"],
        "project_type": "web",
        "status": "in_progress",
        "image_url": None,
        "demo_url": "https://example.test/live",
        "github_url": None,
    }
    monkeypatch.setattr(portfolio_app.ProjectModel, "get_all_projects", lambda self, featured_only=False: [project])

    homepage = client.get("/").get_data(as_text=True)
    portfolio = client.get("/portfolio").get_data(as_text=True)

    for html in (homepage, portfolio):
        assert 'data-evidence="project"' in html
        assert "Signal Ledger" in html
        assert "IN_PROGRESS" in html
        assert "Python" in html
        assert "Flask" in html
        assert 'href="https://example.test/live"' in html
    assert "Source" not in portfolio


def test_evidence_layer_adds_truthful_lab_writing_and_about_markers(client, monkeypatch):
    post = {
        "title": "Practical Threat Modeling",
        "slug": "practical-threat-modeling",
        "category": "Security",
        "created_at": datetime(2025, 2, 14),
        "reading_time": 6,
    }
    monkeypatch.setattr(portfolio_app.BlogModel, "get_all_posts", lambda self, status="published", limit=None, offset=0: [post])

    homepage = client.get("/").get_data(as_text=True)
    writing = client.get("/blog").get_data(as_text=True)
    about = client.get("/about").get_data(as_text=True)

    assert homepage.count('data-evidence="lab"') == 3
    assert 'data-evidence="article"' in writing
    assert "01 / 14.02.2025" in writing
    assert "SECURITY" in writing
    assert "6 MIN" in writing
    assert about.count("data-evidence-block") == 3
```

- [ ] **Step 2: Run the new tests and observe RED**

Run:

```powershell
& "c:/Users/A C E R/OneDrive/Desktop/General projects/personal_portfolio/.venv/Scripts/python.exe" -m pytest tests/test_public_pages.py -k "evidence_layer" -v
```

Expected: FAIL because the evidence attributes and archive sequence are absent.

- [ ] **Step 3: Implement the minimum evidence layer**

Replace the current `portfolio()` implementation in `app.py` with this version, removing duplicate JSON decoding because `ProjectModel.get_all_projects()` already normalizes technology strings:

```python
@app.route("/portfolio")
def portfolio():
    project_model = ProjectModel()
    category_model = CategoryModel()
    projects = project_model.get_all_projects(featured_only=True)
    categories = category_model.get_all_categories()
    return render_template(
        "portfolio.html",
        app_name=APP_CONFIG["name"],
        projects=projects,
        categories=categories,
    )
```

In `templates/index.html` and `templates/portfolio.html`, add `data-evidence="project"` to dynamic `case-study` articles. Keep the existing type, status, chips, and conditional Live/Source actions. Do not output a Source action when `github_url` is missing.

Replace each static Lab article with the same factual subject and destination plus `data-evidence="lab"`. The first card must have this markup; retain the existing analogous automation and AI cards:

```html
<article class="lab-note" data-evidence="lab">
  <p class="meta accent">01 / SECURITY / METHOD</p>
  <h3>Threat modeling</h3>
  <p>Mapping trust boundaries, abuse paths, and controls before implementation creates safer systems with fewer surprises.</p>
  <a class="button" href="{{ url_for('skills') }}">Security methods ↗</a>
</article>
```

Do not add `data-reveal` to Lab cards. In `templates/blog/index.html`, add `data-evidence="article"` to archive rows and change the leading metadata span to:

```html
<span class="meta">{{ '%02d'|format(loop.index) }} / {{ post.created_at.strftime('%d.%m.%Y') if post.created_at else 'UNDATED' }}</span>
```

In `templates/about.html`, add `data-evidence-block` to the Journey, Principles, and Evidence sections only. Add this CSS under the existing layers:

```css
[data-evidence="project"] .case-meta,
[data-evidence="article"] .meta,
[data-evidence="lab"] .meta { color: var(--accent); }

[data-evidence-block] { scroll-margin-top: calc(var(--header-h) + 1rem); }
```

- [ ] **Step 4: Run focused evidence tests and verify GREEN**

Run the Step 2 command again.

Expected: PASS with 2 selected tests.

- [ ] **Step 5: Run the public-page suite**

Run:

```powershell
& "c:/Users/A C E R/OneDrive/Desktop/General projects/personal_portfolio/.venv/Scripts/python.exe" -m pytest tests/test_public_pages.py -v
```

Expected: PASS with 13 tests.

- [ ] **Step 6: Commit Phase 1**

```powershell
git add app.py templates/index.html templates/portfolio.html templates/blog/index.html templates/about.html static/css/editorial-portfolio.css tests/test_public_pages.py
git commit -m "feat: add evidence-first portfolio surfaces"
```

## Task 2: Public Project Case Studies

**Files:**
- Modify: `tests/test_public_pages.py`
- Modify: `app.py`
- Modify: `templates/portfolio.html`
- Create: `templates/project_detail.html`
- Modify: `static/css/editorial-portfolio.css`

**Interfaces:**
- Consumes: `ProjectModel.get_project_by_id(project_id: int) -> dict | None` and `ProjectModel.get_all_projects() -> list[dict]`.
- Produces: `project_detail(project_id: int)` at `/portfolio/<int:project_id>` with `project`, `previous_project`, and `next_project` template values.
- Error behavior: unknown IDs render `404.html` with status 404.

- [ ] **Step 1: Write the failing project-detail tests**

Append the following tests to `tests/test_public_pages.py`:

```python
def test_project_detail_renders_factual_metadata_and_adjacent_projects(client, monkeypatch):
    previous_project = {"id": 6, "title": "Earlier System"}
    project = {
        "id": 7,
        "title": "Signal Ledger",
        "description": "A verifiable security workflow.",
        "long_description": "The supplied project description is shown without invented process claims.",
        "technologies": ["Python", "Flask"],
        "project_type": "web",
        "status": "in_progress",
        "image_url": None,
        "demo_url": "https://example.test/live",
        "github_url": "https://example.test/source",
    }
    next_project = {"id": 8, "title": "Later System"}
    monkeypatch.setattr(portfolio_app.ProjectModel, "get_project_by_id", lambda self, project_id: project if project_id == 7 else None)
    monkeypatch.setattr(portfolio_app.ProjectModel, "get_all_projects", lambda self, featured_only=False: [previous_project, project, next_project])

    response = client.get("/portfolio/7")
    html = response.get_data(as_text=True)

    assert response.status_code == 200
    assert "Signal Ledger" in html
    assert "A verifiable security workflow." in html
    assert "The supplied project description" in html
    assert "WEB" in html
    assert "IN_PROGRESS" in html
    assert "Python" in html
    assert 'href="https://example.test/live"' in html
    assert 'href="https://example.test/source"' in html
    assert 'href="/portfolio/6"' in html
    assert 'href="/portfolio/8"' in html
    assert 'class="case-placeholder"' in html


def test_unknown_project_uses_shared_404_page(client, monkeypatch):
    monkeypatch.setattr(portfolio_app.ProjectModel, "get_project_by_id", lambda self, project_id: None)

    response = client.get("/portfolio/404")

    assert response.status_code == 404
    assert "Page not found" in response.get_data(as_text=True)
    assert 'class="site-header"' in response.get_data(as_text=True)
```

- [ ] **Step 2: Run the new tests and observe RED**

Run:

```powershell
& "c:/Users/A C E R/OneDrive/Desktop/General projects/personal_portfolio/.venv/Scripts/python.exe" -m pytest tests/test_public_pages.py -k "project_detail or unknown_project" -v
```

Expected: FAIL with 404 responses because the detail route does not exist.

- [ ] **Step 3: Implement the route, factual template, and navigation**

Add this route directly after `portfolio()` in `app.py`:

```python
@app.route("/portfolio/<int:project_id>")
def project_detail(project_id):
    project_model = ProjectModel()
    project = project_model.get_project_by_id(project_id)
    if not project:
        return render_template("404.html", app_name=APP_CONFIG["name"]), 404

    projects = project_model.get_all_projects()
    project_index = next((index for index, item in enumerate(projects) if item.get("id") == project_id), None)
    previous_project = projects[project_index - 1] if project_index and project_index > 0 else None
    next_project = projects[project_index + 1] if project_index is not None and project_index + 1 < len(projects) else None
    return render_template(
        "project_detail.html",
        app_name=APP_CONFIG["name"],
        project=project,
        previous_project=previous_project,
        next_project=next_project,
    )
```

Create `templates/project_detail.html` extending `base.html`. Use title and description as the thesis, conditionally render type/status/stack/live/source facts, display `long_description` only when present, and use the existing `case-placeholder` when `image_url` is absent. Render adjacent links only when `previous_project` or `next_project` is set:

```html
{% extends "base.html" %}
{% block title %}{{ project.title }} - Dhirendra Yadav{% endblock %}
{% block description %}{{ project.description }}{% endblock %}
{% block content %}
<header class="post-header editorial-grid" data-section="00 - CASE STUDY">
  <nav class="post-breadcrumb" aria-label="Breadcrumb"><a href="{{ url_for('portfolio') }}">Work</a><span>/</span><span>{{ project.title }}</span></nav>
  <div class="post-heading"><p class="eyebrow accent">{{ project.project_type or 'SYSTEM' }} / {{ project.status or 'COMPLETED' }}</p><h1>{{ project.title }}</h1><p class="post-deck">{{ project.description }}</p></div>
  <div class="project-facts" aria-label="Project facts">{% if project.technologies %}<div><span class="meta">STACK</span><div class="tag-list">{% for technology in project.technologies %}<span class="chip">{{ technology }}</span>{% endfor %}</div></div>{% endif %}{% if project.demo_url or project.github_url %}<div class="button-row">{% if project.demo_url %}<a class="button button-primary" href="{{ project.demo_url }}" target="_blank" rel="noreferrer">Live system ↗</a>{% endif %}{% if project.github_url %}<a class="button" href="{{ project.github_url }}" target="_blank" rel="noreferrer">Source ↗</a>{% endif %}</div>{% endif %}</div>
</header>
<section class="editorial-section editorial-grid project-detail-body"><div class="project-detail-media">{% if project.image_url %}<img src="{{ project.image_url }}" alt="Preview of {{ project.title }}">{% else %}<div class="case-placeholder"><span>{{ '%02d'|format(project.id) }}</span></div>{% endif %}</div>{% if project.long_description %}<div class="rich-text"><p>{{ project.long_description }}</p></div>{% endif %}</section>
<nav class="project-navigation editorial-grid" aria-label="Project navigation">{% if previous_project %}<a class="project-navigation-link" href="{{ url_for('project_detail', project_id=previous_project.id) }}"><span class="meta">PREVIOUS</span><strong>{{ previous_project.title }}</strong></a>{% endif %}{% if next_project %}<a class="project-navigation-link project-navigation-next" href="{{ url_for('project_detail', project_id=next_project.id) }}"><span class="meta">NEXT</span><strong>{{ next_project.title }}</strong></a>{% endif %}</nav>
{% endblock %}
```

In `templates/portfolio.html`, add this conditional action before external actions on dynamic cards only:

```html
{% if project.id %}<a class="button" href="{{ url_for('project_detail', project_id=project.id) }}">Case study ↗</a>{% endif %}
```

Add this CSS to the existing `@layer pages` section and include its media rules inside the existing matching breakpoints:

```css
.project-facts { display: grid; gap: 1.25rem; padding-top: 1.25rem; border-top: 1px solid var(--line); }
.project-detail-body { display: grid; gap: clamp(2rem, 6vw, 6rem); grid-template-columns: minmax(0, 1fr) minmax(16rem, .7fr); align-items: start; }
.project-detail-media { min-height: 24rem; background: var(--surface); }
.project-detail-media img { width: 100%; height: 100%; object-fit: cover; }
.project-navigation { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); border-block: 1px solid var(--line); }
.project-navigation-link { display: grid; gap: .75rem; min-height: 10rem; padding: 1.5rem; }
.project-navigation-link + .project-navigation-link { border-left: 1px solid var(--line); }
.project-navigation-next { text-align: right; }
.project-navigation-link strong { font-size: clamp(1.4rem, 3vw, 2.8rem); line-height: 1; }
@media (max-width: 820px) { .project-detail-body { grid-template-columns: 1fr; } }
@media (max-width: 520px) { .project-navigation { grid-template-columns: 1fr; } .project-navigation-link + .project-navigation-link { border-top: 1px solid var(--line); border-left: 0; } .project-navigation-next { text-align: left; } }
```

- [ ] **Step 4: Run focused project-detail tests and verify GREEN**

Run the Step 2 command again.

Expected: PASS with 2 selected tests.

- [ ] **Step 5: Run all tests and static checks**

```powershell
& "c:/Users/A C E R/OneDrive/Desktop/General projects/personal_portfolio/.venv/Scripts/python.exe" -m pytest -v
git diff --check
```

Expected: all tests PASS and no diff-check output.

- [ ] **Step 6: Commit Phase 2**

```powershell
git add app.py templates/portfolio.html templates/project_detail.html static/css/editorial-portfolio.css tests/test_public_pages.py
git commit -m "feat: add public project case studies"
```

## Task 3: Browser and Deployment Validation

**Files:**
- No source changes expected unless validation finds a reproducible defect.

- [ ] **Step 1: Run responsive browser checks**

Start Flask from the worktree with the selected Python environment. Inspect `/`, `/portfolio`, `/about`, `/blog`, and one seeded project detail at 1440px, 1024px, 390px, and 360px. Confirm Lab cards are visible before reveal state, navigation works by keyboard, controls receive focus, and pages have no horizontal overflow.

- [ ] **Step 2: Run final diagnostics**

```powershell
& "c:/Users/A C E R/OneDrive/Desktop/General projects/personal_portfolio/.venv/Scripts/python.exe" -m pytest -v
git diff --check
git status --short
```

Expected: all tests PASS, no whitespace errors, and only planned files are staged.

- [ ] **Step 3: Merge and deploy verified commits**

Fast-forward `main` to the verified feature branch, push tracked work, deploy the existing Railway `web` service, wait for status `SUCCESS`, then smoke-test the live home, portfolio, and one known project-detail URL.

## Plan Self-Review

- Spec coverage: Task 1 covers evidence rules, homepage, Lab, portfolio, writing, About, and styling. Task 2 covers stable lookup, shared 404, optional facts/actions/media, long description, and neighbors. Task 3 covers responsive, diagnostics, deployment, and live smoke tests.
- Placeholder scan: No unresolved implementation placeholders, omitted test code, or unspecified validation commands remain.
- Type consistency: The plan consistently uses existing `ProjectModel.get_project_by_id(project_id)` and `get_all_projects(featured_only=False)` APIs, integer IDs, and the `project_detail` endpoint.
