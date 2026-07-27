# Hero Depth and Slug System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the hero visual treatment and add maintainable, backwards-compatible slug handling.

**Architecture:** Add a small shared slug utility used by admin write paths and curated route alias resolution. Keep curated slugs as stable source-of-truth identifiers while redirecting title-derived aliases. Add a transparent portrait asset and scope all visual changes to hero-specific classes.

**Tech Stack:** Flask/Jinja, vanilla CSS/JavaScript, Pillow/image generation asset workflow, pytest, Playwright.

## Global Constraints

- Preserve existing canonical project slugs and old links.
- Never expose credentials or invent project/blog claims.
- Keep the hero accessible and responsive; respect `prefers-reduced-motion`.
- Do not alter the about-page portrait treatment unless explicitly requested.

---

### Task 1: Add failing tests

**Files:**
- Modify: `tests/test_public_pages.py`
- Modify: `tests/test_project_content.py`
- Create: `tests/test_slug_utils.py`

- [ ] Assert hero hooks for transparent portrait, depth layers, and mission brief.
- [ ] Assert server-side empty-title slug generation through the utility.
- [ ] Assert a title-derived curated alias redirects to its canonical slug.
- [ ] Run focused tests and confirm expected failures before implementation.

### Task 2: Create the transparent portrait asset

**Files:**
- Create: `static/images/profile-hero-cutout.png`
- Modify: `templates/index.html`

- [ ] Inspect the supplied source image.
- [ ] Use the built-in image generation/editing workflow to remove the background and preserve the subject as a transparent PNG.
- [ ] Register the new PNG in the hero template with the existing portrait alt text.

### Task 3: Implement the hero visual treatment

**Files:**
- Modify: `static/css/editorial-portfolio.css`

- [ ] Replace the generic portrait dot overlay with scanlines, edge glow, and a technical backing plate on `.hero-portrait` only.
- [ ] Add layered `.hero-name-depth` pseudo-elements or data attributes for the DHIRENDRA outline depth.
- [ ] Add mission-brief panel styles for `.hero-bottom > p` and a mono label in the template.
- [ ] Add reduced-motion and mobile rules.

### Task 4: Implement maintainable slugs

**Files:**
- Create: `slug_utils.py`
- Modify: `app.py`
- Modify: `templates/admin/add_blog_post.html`
- Modify: `templates/admin/edit_blog_post.html`
- Modify: `templates/index.html`
- Test: `tests/test_slug_utils.py`

- [ ] Implement `slugify_text(value: str) -> str` with Unicode normalization, lowercase kebab-case output, and a safe fallback.
- [ ] Generate an empty blog slug server-side before `BlogModel.add_post`/`update_post`.
- [ ] Add title-derived curated project alias lookup and `301` redirect to canonical `/work/<slug>`.
- [ ] Use canonical slug links for curated projects and generated slug metadata for database projects where available.
- [ ] Keep the existing client-side admin helper as a convenience and add a visible “generated from title” hint.

### Task 5: Verify and commit

**Files:**
- No additional files.

- [ ] Restart the Flask server.
- [ ] Verify the hero PNG loads with transparency and the old pattern is absent.
- [ ] Verify the 3D name and mission brief at desktop/mobile and light/dark themes.
- [ ] Verify canonical project links, alias redirects, and empty blog slug generation.
- [ ] Run the full pytest suite and commit intended files.
