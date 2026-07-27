# Font Pairings and Hero Portrait Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three cohesive font presets and replace the homepage hero portrait with the supplied user photo.

**Architecture:** Extend the existing shared Google Fonts import and JavaScript `fontPresets` allowlist; keep the current localStorage cycle contract. Add a dedicated hero asset and template reference, with a narrowly scoped object-position rule so the existing portrait treatment remains unchanged.

**Tech Stack:** Flask/Jinja templates, vanilla JavaScript, layered CSS, Google Fonts, pytest, Playwright.

## Global Constraints

- Preserve the existing Security Fieldwork dark/light theme, HUD interaction, and localStorage keys.
- Do not alter the about-page portrait.
- Keep the hero photo accessible with descriptive alt text and responsive without horizontal overflow.

---

### Task 1: Add regression coverage for six presets and the hero asset

**Files:**
- Modify: `tests/test_public_pages.py`

- [ ] **Step 1: Write the failing assertions**

Add assertions for the three new Google Font names, three new preset IDs, six total preset labels, and the new hero asset reference.

- [ ] **Step 2: Run the focused test**

Run: `./.venv/Scripts/python.exe -m pytest tests/test_public_pages.py -k "font or hero" -q`

Expected: FAIL because the new preset IDs and hero asset are not present yet.

- [ ] **Step 3: Confirm the failure targets missing behavior**

Verify the failure is an assertion about the missing font/asset tokens, not a test collection or fixture error.

### Task 2: Register the photo and update the homepage hero

**Files:**
- Create: `static/images/profile-hero.jpg` (copy of `C:\Users\A C E R\Downloads\IMG20251014151803.jpg`)
- Modify: `templates/index.html`
- Modify: `static/css/editorial-portfolio.css`

- [ ] **Step 1: Copy the supplied photo**

Copy the user-provided JPEG to `static/images/profile-hero.jpg` and confirm it is readable.

- [ ] **Step 2: Point only the homepage hero at the new asset**

Change the hero image source to `images/profile-hero.jpg`; leave the about-section `images/profile.png` source untouched.

- [ ] **Step 3: Tune the hero crop**

Add a hero-specific object position rule:

```css
.hero-portrait img { object-position: center 42%; }
```

Keep the existing `portrait-treatment` filter and overlay rules.

- [ ] **Step 4: Run the hero-focused test**

Run: `./.venv/Scripts/python.exe -m pytest tests/test_public_pages.py -k hero -q`

Expected: PASS.

### Task 3: Add the three font pairings

**Files:**
- Modify: `templates/base.html`
- Modify: `static/js/editorial-portfolio.js`

- [ ] **Step 1: Extend the shared Google Fonts import**

Add `Barlow+Condensed`, `DM+Mono`, `JetBrains+Mono`, `Manrope`, `Space+Mono`, and `Syne` to the existing import URL.

- [ ] **Step 2: Extend `fontPresets`**

Add these exact records:

```js
{ id: "barlow", label: "BARLOW", display: '"Barlow Condensed", Arial, sans-serif', mono: '"JetBrains Mono", Consolas, monospace' }
{ id: "syne", label: "SYNE", display: '"Syne", Arial, sans-serif', mono: '"Space Mono", Consolas, monospace' }
{ id: "manrope", label: "MANROPE", display: '"Manrope", Arial, sans-serif', mono: '"DM Mono", Consolas, monospace' }
```

- [ ] **Step 3: Run the focused appearance tests**

Run: `./.venv/Scripts/python.exe -m pytest tests/test_public_pages.py -k "font or hero" -q`

Expected: PASS.

### Task 4: Verify live behavior and finish

**Files:**
- No additional files.

- [ ] **Step 1: Restart the Flask server**

Stop the verified listener on port 5000 and start the project `.venv` Python process with the existing output logs.

- [ ] **Step 2: Verify the six-step cycle in Playwright**

Click `[data-font-cycle]` five times, record six distinct labels including the initial label, reload, and assert the sixth label persists.

- [ ] **Step 3: Verify the hero asset and layout**

Assert the homepage hero image URL contains `profile-hero.jpg`, the image loads, and mobile `document.body.scrollWidth <= innerWidth`.

- [ ] **Step 4: Run the full suite**

Run: `$env:TEMP=(Join-Path (Get-Location) '.tmp\\pytest-runtime'); $env:TMP=$env:TEMP; .\\.venv\\Scripts\\python.exe -m pytest -q`

Expected: all tests pass.

- [ ] **Step 5: Commit the implementation**

```powershell
git add templates/base.html templates/index.html static/css/editorial-portfolio.css static/js/editorial-portfolio.js static/images/profile-hero.jpg tests/test_public_pages.py
git commit -m "feat: expand font styles and refresh hero portrait"
```
