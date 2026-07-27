# About Portrait Cutout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the About page and homepage About-preview photo with a clean cutout of the supplied portrait, separated from its original background and integrated into the field-journal visual system.

**Architecture:** Store a project-local alpha PNG generated from the supplied photo. Add a dedicated `about-portrait-cutout` class to both About surfaces, with CSS plate/frame layers behind the transparent subject. Keep hero portrait styling independent.

**Tech Stack:** Flask/Jinja templates, layered CSS, PNG alpha asset, pytest, local browser verification.

## Revision: New About Source and Hero Scale

- Replace `static/images/profile-about-cutout.png` with an identity-preserving transparent cutout generated from `C:\Users\A C E R\Downloads\dhirendra.jpg`.
- Preserve the source image's natural head-and-torso crop; do not invent missing lower-body content.
- Keep the existing `about-portrait-cutout` markup and technical plate styling.
- Change the desktop `.hero-portrait` width from `min(36vw, 32rem)` to `min(39vw, 34rem)` and verify the portrait remains horizontally separated from the 3D heading at 1186×742.
- Leave the existing mobile portrait widths unchanged.

## Global Constraints

- Keep the complete person visible from hair to shoes.
- Do not apply the dotted overlay or duotone filter to the person.
- Keep the plate behind the cutout and leave open space around the head and shoulders.
- Preserve descriptive alternative text.
- Hide decorative plate and frame details from assistive technology.
- Disable nonessential motion under reduced-motion preferences.

### Task 1: Prepare and validate the cutout asset

**Files:**
- Create: `static/images/profile-about-cutout.png`
- Test: `tests/test_public_pages.py`

- [ ] **Step 1: Copy the generated chroma-key source into the project temp area**

Copy the generated PNG from the image-generation output into `.tmp/imagegen/about-cutout-green.png`; do not overwrite the user’s source photo.

- [ ] **Step 2: Remove the flat chroma key**

Run:

```powershell
.\.venv\Scripts\python.exe C:\Users\A C E R\.codex\skills\.system\imagegen\scripts\remove_chroma_key.py `
  --input .tmp\imagegen\about-cutout-green.png `
  --out static\images\profile-about-cutout.png `
  --auto-key border --soft-matte --transparent-threshold 12 `
  --opaque-threshold 220 --despill
```

- [ ] **Step 3: Validate alpha coverage**

Use Pillow to confirm the PNG has an alpha channel, transparent corner pixels, and no remaining bright-green pixels around the subject. If a thin green fringe remains, rerun once with `--edge-contract 1`.

- [ ] **Step 4: Add a failing asset contract test**

Add a test that requests `/static/images/profile-about-cutout.png`, checks a successful response, and asserts the About markup references that asset.

### Task 2: Add the separated About portrait composition

**Files:**
- Modify: `templates/about.html`
- Modify: `templates/index.html`
- Modify: `static/css/editorial-portfolio.css`
- Test: `tests/test_public_pages.py`

- [ ] **Step 1: Write the failing markup/CSS test**

Assert both `/about` and `/` include `about-portrait-cutout`, `profile-about-cutout.png`, and the CSS selectors `.about-portrait-cutout::before` and `.about-portrait-cutout::after`.

- [ ] **Step 2: Update both templates**

Replace the generic portrait wrappers with:

```html
<div class="portrait-treatment about-portrait-cutout" aria-hidden="true">
  <img src="{{ url_for('static', filename='images/profile-about-cutout.png', v=asset_version) }}" alt="Portrait of Dhirendra Yadav">
</div>
```

Keep the existing `alt` text on the image and preserve all surrounding copy and links.

- [ ] **Step 3: Implement the layered CSS**

Add:

```css
.about-portrait-cutout {
  position: relative;
  isolation: isolate;
  overflow: visible;
  background: transparent;
  border: 0;
}
.about-portrait-cutout::before {
  content: "";
  position: absolute;
  inset: 8% -5% 4% 8%;
  z-index: -2;
  border: 1px solid color-mix(in srgb, var(--accent) 70%, transparent);
  background:
    linear-gradient(color-mix(in srgb, var(--accent) 10%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--accent) 10%, transparent) 1px, transparent 1px);
  background-size: 2.25rem 2.25rem;
  clip-path: polygon(8% 0, 100% 0, 100% 88%, 88% 100%, 0 100%, 0 12%);
}
.about-portrait-cutout::after {
  content: "";
  position: absolute;
  inset: 5% -2% 2% 5%;
  z-index: -1;
  border-left: 3px solid var(--accent);
  border-bottom: 1px solid var(--line);
  transform: translate(0.7rem, 0.7rem);
  pointer-events: none;
}
.about-portrait-cutout img {
  position: relative;
  z-index: 1;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center bottom;
  filter: grayscale(.82) contrast(1.12) drop-shadow(.55rem .65rem 0 color-mix(in srgb, var(--accent) 28%, transparent));
}
@media (max-width: 820px) {
  .about-portrait-cutout::before { inset: 6% -3% 3% 5%; }
  .about-portrait-cutout::after { transform: translate(.4rem, .4rem); }
}
@media (prefers-reduced-motion: reduce) {
  .about-portrait-cutout img { filter: grayscale(.82) contrast(1.12); }
}
```

- [ ] **Step 4: Run the focused tests**

Run:

```powershell
.\.venv\Scripts\python.exe -m pytest tests\test_public_pages.py -k "about_portrait or homepage_has_editorial_sections" -q
```

Expected: PASS.

### Task 3: Verify the visual result and regression safety

**Files:**
- Create: `.tmp/about-portrait-cutout.png`

- [ ] **Step 1: Restart the local server**

Restart the Flask server on port 5000 and load `/about` and `/`.

- [ ] **Step 2: Check desktop and mobile composition**

At 1186×742 and a narrow mobile viewport, verify the subject is fully visible, the original boat/water background is gone, the plate remains behind the person, and `document.documentElement.scrollWidth === document.documentElement.clientWidth`.

- [ ] **Step 3: Capture a desktop screenshot**

Save the About result to `.tmp/about-portrait-cutout.png`.

- [ ] **Step 4: Run the complete suite**

```powershell
$env:TEMP=(Join-Path (Get-Location) '.tmp\pytest-runtime')
$env:TMP=$env:TEMP
.\.venv\Scripts\python.exe -m pytest -q
```

Expected: all tests pass.

- [ ] **Step 5: Commit the implementation**

```powershell
git add static/images/profile-about-cutout.png templates/about.html templates/index.html static/css/editorial-portfolio.css tests/test_public_pages.py
git commit -m "feat: separate about portrait from background"
```
