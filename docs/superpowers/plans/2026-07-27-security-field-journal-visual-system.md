# Security Field Journal Visual System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the existing Security Fieldwork portfolio theme with four original project artworks, richer code-native visual motifs, twelve accent choices, three persistent font pairings, and the corrected public email address.

**Architecture:** Shared appearance controls remain in `base.html`, with curated allowlists and persistence in `editorial-portfolio.js` and tokens in `editorial-portfolio.css`. Generated artwork is static project content referenced by `content/projects.json`; templates retain native text and reveal a numbered fallback if an asset fails to load.

**Tech Stack:** Flask, Jinja, HTML, layered CSS, vanilla JavaScript, pytest, built-in image generation.

## Global Constraints

- Preserve the established "Security Fieldwork" navigation, page hierarchy, evidence structure, dark editorial layout, and project claims.
- Use exactly twelve curated accent choices.
- Use exactly three font pairings: Rubik + IBM Plex Mono, Space Grotesk + IBM Plex Mono, and Archivo + Roboto Mono.
- Persist theme, accent, and font choices in local storage and reject values outside their curated allowlists.
- Use `thedhirendrayadav@gmail.com` for every public email link and visible address.
- Generated artwork must contain no logos, watermarks, fake product screenshots, required readable text, fake metrics, or unverifiable claims.
- Keep generated subjects inside a central crop-safe area.
- Decorative additions must be hidden from assistive technology and must respect `prefers-reduced-motion`.
- Preserve a numbered fallback for absent or failed project images.
- Do not delete or overwrite the existing project screenshots; add versioned artwork filenames.

## File Structure

- Modify `templates/base.html`: shared font imports, corrected email links, and the new font HUD control.
- Modify `templates/index.html`: project-art frame, evidence label, and adjacent fallback markup.
- Modify `templates/portfolio.html`: the same resilient project-art contract for the portfolio index.
- Modify `templates/project_detail.html`: resilient case-study hero art and native evidence label.
- Modify `static/css/editorial-portfolio.css`: font variables, HUD layout, artwork framing, field-journal motifs, motion, and responsive behavior.
- Modify `static/js/editorial-portfolio.js`: validated accent/font state, local persistence, HUD updates, and image-error handling.
- Modify `content/projects.json`: four new project artwork paths and 1536 × 1024 intrinsic dimensions.
- Create four versioned files in `static/images/projects/`: final generated artwork.
- Modify `tests/test_public_pages.py`: public shell, contact, appearance controls, motif, and fallback contracts.
- Modify `tests/test_project_content.py`: curated artwork existence and metadata contract.

---

### Task 1: Correct Contact Identity and Add the Font HUD Contract

**Files:**
- Modify: `tests/test_public_pages.py`
- Modify: `templates/base.html`

**Interfaces:**
- Consumes: the existing shared `base.html` shell.
- Produces: `[data-font-cycle]`, `[data-font-value]`, corrected public mail links, and Google Fonts declarations used by Task 2.

- [ ] **Step 1: Write failing public-shell tests**

Append:

```python
def test_public_shell_uses_current_contact_address(client):
    html = client.get("/").get_data(as_text=True)

    assert "thedhirendrayadav@gmail.com" in html
    assert "THEDHIRENDRAYADAV@<br>GMAIL.COM" in html
    assert "Dhirendrayadav4999@gmail.com" not in html
    assert "DHIRENDRAYADAV4999@" not in html


def test_public_shell_exposes_font_appearance_control(client):
    html = client.get("/").get_data(as_text=True)

    assert 'data-font-cycle' in html
    assert 'data-font-value' in html
    assert 'aria-label="Cycle the site font pairing"' in html
    assert "Space+Grotesk" in html
    assert "Archivo" in html
    assert "Roboto+Mono" in html
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run:

```powershell
.\.venv\Scripts\python.exe -m pytest tests/test_public_pages.py::test_public_shell_uses_current_contact_address tests/test_public_pages.py::test_public_shell_exposes_font_appearance_control -v
```

Expected: both tests fail because the old address remains and the font control does not exist.

- [ ] **Step 3: Update the shared font request and contact links**

Replace the Google Fonts link in `templates/base.html` with:

```html
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@75..125,300..900&family=IBM+Plex+Mono:wght@400;500&family=Roboto+Mono:wght@400;500&family=Rubik:ital,wght@0,300..900;1,300..900&family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet">
```

Replace the header CTA with:

```html
<a class="header-cta" href="mailto:thedhirendrayadav@gmail.com">LET'S TALK <span aria-hidden="true">↗</span></a>
```

Replace the footer email with:

```html
<a class="footer-email" href="mailto:thedhirendrayadav@gmail.com">THEDHIRENDRAYADAV@<br>GMAIL.COM <span aria-hidden="true">↗</span></a>
```

- [ ] **Step 4: Add the font control after the accent control**

Add:

```html
<button type="button" class="footer-hud-font" data-font-cycle title="Cycle font pairing" aria-label="Cycle the site font pairing">
  <span>FONT</span>
  <span data-font-value>RUBIK</span>
</button>
```

- [ ] **Step 5: Run the focused tests**

Run the command from Step 2.

Expected: `2 passed`.

- [ ] **Step 6: Commit the contact and markup contract**

```powershell
git add tests/test_public_pages.py templates/base.html
git commit -m "feat: add portfolio font control and current contact address"
```

---

### Task 2: Implement Validated Accent and Font State

**Files:**
- Modify: `tests/test_public_pages.py`
- Modify: `static/js/editorial-portfolio.js`
- Modify: `static/css/editorial-portfolio.css`

**Interfaces:**
- Consumes: `[data-font-cycle]` and `[data-font-value]` from Task 1.
- Produces: `portfolio-font`, `applyFont(fontId)`, twelve allowed accents, and the `--display`/`--mono` font variables consumed by every public page.

- [ ] **Step 1: Write failing source-contract tests**

Append:

```python
def test_appearance_script_declares_curated_accent_and_font_allowlists(client):
    javascript = client.get("/static/js/editorial-portfolio.js").get_data(as_text=True)

    for token in (
        'const accents = [',
        '"#9df9f3"',
        '"#79c7ff"',
        '"#b8a1ff"',
        '"#ff8fc8"',
        '"#ff7f73"',
        '"#f4bf4f"',
        '"#d7f171"',
        '"#75e6a4"',
        '"#64d8cb"',
        '"#a8c7fa"',
        '"#f7a76c"',
        '"#c4f0c5"',
        'const fontPresets = [',
        'id: "rubik"',
        'id: "space"',
        'id: "archivo"',
        '"portfolio-font"',
    ):
        assert token in javascript


def test_editorial_css_uses_variable_font_contract(client):
    css = client.get("/static/css/editorial-portfolio.css").get_data(as_text=True)

    assert '--display: "Rubik", Arial, sans-serif;' in css
    assert '--mono: "IBM Plex Mono", Consolas, monospace;' in css
    assert ".footer-hud-font" in css
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run:

```powershell
.\.venv\Scripts\python.exe -m pytest tests/test_public_pages.py::test_appearance_script_declares_curated_accent_and_font_allowlists tests/test_public_pages.py::test_editorial_css_uses_variable_font_contract -v
```

Expected: failures for the missing font presets, new accents, and `.footer-hud-font`.

- [ ] **Step 3: Replace appearance setup with explicit allowlists**

In `static/js/editorial-portfolio.js`, keep the existing guarded `store` and `read` helpers, then declare:

```javascript
const accents = [
  "#9df9f3", "#79c7ff", "#b8a1ff", "#ff8fc8",
  "#ff7f73", "#f4bf4f", "#d7f171", "#75e6a4",
  "#64d8cb", "#a8c7fa", "#f7a76c", "#c4f0c5",
];
const fontPresets = [
  {
    id: "rubik",
    label: "RUBIK",
    display: '"Rubik", Arial, sans-serif',
    mono: '"IBM Plex Mono", Consolas, monospace',
  },
  {
    id: "space",
    label: "SPACE",
    display: '"Space Grotesk", Arial, sans-serif',
    mono: '"IBM Plex Mono", Consolas, monospace',
  },
  {
    id: "archivo",
    label: "ARCHIVO",
    display: '"Archivo", Arial, sans-serif',
    mono: '"Roboto Mono", Consolas, monospace',
  },
];
```

Add the font element references:

```javascript
const fontCycle = document.querySelector("[data-font-cycle]");
const fontValue = document.querySelector("[data-font-value]");
```

- [ ] **Step 4: Validate and apply saved appearance state**

Use:

```javascript
const applyAccent = (candidate) => {
  const color = accents.includes(candidate?.toLowerCase()) ? candidate.toLowerCase() : accents[0];
  document.documentElement.style.setProperty("--accent", color);
  if (accentCode) accentCode.textContent = color.toUpperCase();
  return color;
};

const applyFont = (candidate) => {
  const preset = fontPresets.find(({ id }) => id === candidate) || fontPresets[0];
  document.documentElement.style.setProperty("--display", preset.display);
  document.documentElement.style.setProperty("--mono", preset.mono);
  document.documentElement.dataset.font = preset.id;
  if (fontValue) fontValue.textContent = preset.label;
  return preset.id;
};

let activeAccent = applyAccent(read("portfolio-accent"));
accentCycle?.addEventListener("click", () => {
  const next = accents[(accents.indexOf(activeAccent) + 1) % accents.length];
  activeAccent = applyAccent(next);
  store("portfolio-accent", activeAccent);
});

let activeFont = applyFont(read("portfolio-font"));
fontCycle?.addEventListener("click", () => {
  const currentIndex = fontPresets.findIndex(({ id }) => id === activeFont);
  activeFont = applyFont(fontPresets[(currentIndex + 1) % fontPresets.length].id);
  store("portfolio-font", activeFont);
});
```

Remove the earlier duplicate `applyAccent` implementation and accent click handler.

- [ ] **Step 5: Extend HUD styling**

Update shared selectors so `.footer-hud-font` receives the same layout, hover, and focus-visible treatment as the mode and theme buttons:

```css
.footer-hud-scroll span,
.footer-hud-section,
.footer-hud-mode > span:last-child,
.footer-hud-theme > span:last-child,
.footer-hud-font > span:last-child { color: var(--accent); }

.footer-hud-mode,
.footer-hud-theme,
.footer-hud-font {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  min-height: 44px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--muted);
  font: inherit;
  letter-spacing: inherit;
  cursor: pointer;
}

.footer-hud-mode:hover,
.footer-hud-theme:hover,
.footer-hud-font:hover { color: var(--ink); }

.footer-hud-mode:focus-visible,
.footer-hud-theme:focus-visible,
.footer-hud-font:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}
```

At widths below 720px, reduce the HUD gap and hide the static `MODE`, `THEME`, and `FONT` label spans while retaining each active value and accessible button label.

- [ ] **Step 6: Run focused and full public-page tests**

Run:

```powershell
.\.venv\Scripts\python.exe -m pytest tests/test_public_pages.py -v
```

Expected: all tests in `tests/test_public_pages.py` pass.

- [ ] **Step 7: Commit appearance persistence**

```powershell
git add tests/test_public_pages.py static/js/editorial-portfolio.js static/css/editorial-portfolio.css
git commit -m "feat: persist curated portfolio appearance settings"
```

---

### Task 3: Generate and Register Four Field-Journal Artworks

**Files:**
- Create: `static/images/projects/multi-channel-ai-messaging-field-journal.png`
- Create: `static/images/projects/nepse-market-intelligence-field-journal.png`
- Create: `static/images/projects/secure-portfolio-platform-field-journal.png`
- Create: `static/images/projects/runpod-media-orchestrator-field-journal.png`
- Modify: `content/projects.json`
- Modify: `tests/test_project_content.py`

**Interfaces:**
- Consumes: the approved Security Field Journal art direction.
- Produces: four 1536 × 1024 crop-safe raster assets and curated-project metadata used by every work and detail template.

- [ ] **Step 1: Write the failing artwork metadata test**

Add `from pathlib import Path` if it is not already imported, then append:

```python
def test_curated_projects_reference_field_journal_artwork():
    expected = {
        "multi-channel-ai-messaging": "static/images/projects/multi-channel-ai-messaging-field-journal.png",
        "nepse-market-intelligence": "static/images/projects/nepse-market-intelligence-field-journal.png",
        "secure-portfolio-platform": "static/images/projects/secure-portfolio-platform-field-journal.png",
        "runpod-media-orchestrator": "static/images/projects/runpod-media-orchestrator-field-journal.png",
    }

    projects = load_curated_projects()
    assert {project["slug"]: project["image_url"] for project in projects} == expected
    for project in projects:
        path = Path(project["image_url"])
        assert path.is_file()
        assert path.stat().st_size > 50_000
        assert project["image_width"] == 1536
        assert project["image_height"] == 1024
```

- [ ] **Step 2: Run the artwork metadata test and confirm failure**

Run:

```powershell
.\.venv\Scripts\python.exe -m pytest tests/test_project_content.py::test_curated_projects_reference_field_journal_artwork -v
```

Expected: failure because the four versioned artwork files and metadata are absent.

- [ ] **Step 3: Generate the AI Messaging artwork with built-in image generation**

Use this exact prompt:

```text
Use case: stylized-concept
Asset type: landscape project artwork for an editorial cybersecurity portfolio
Primary request: Visualize a multi-channel AI messaging architecture as secured channel adapters feeding a central orchestration boundary, with message packets moving through a queued processing path.
Scene/backdrop: Near-black technical field-journal surface with a fine modular grid, subtle paper grain, scan texture, and evidence-like marks.
Subject: Abstract channel nodes, guarded connections, a central orchestrator, queue lanes, and clearly visible trust boundaries.
Style/medium: Premium editorial systems illustration, precise technical linework with restrained dimensional depth.
Composition/framing: 3:2 landscape, crop-safe central composition, generous border space, strong left-to-right flow.
Lighting/mood: Controlled cyan signal glow, off-white linework, very small coral warning accents; analytical and credible.
Constraints: no logos, no watermark, no people, no fake interface screenshot, no readable words, no numbers that imply real metrics, no unverifiable claims.
Avoid: generic hacker imagery, hooded figures, neon cityscapes, excessive glow, clutter.
```

Inspect the result, iterate only if it violates the constraints, then copy the accepted output to `static/images/projects/multi-channel-ai-messaging-field-journal.png`.

- [ ] **Step 4: Generate the NEPSE artwork**

Use:

```text
Use case: stylized-concept
Asset type: landscape project artwork for an editorial cybersecurity and AI portfolio
Primary request: Visualize market research as layered price traces, candlestick abstractions, indicator bands, and an analytical decision engine that interprets signals without promising performance.
Scene/backdrop: Near-black technical field-journal surface with a fine grid, subtle scanned texture, and evidence notation shapes.
Subject: Abstract market trace entering layered indicator modules and a transparent analytical core, with an output confidence path.
Style/medium: Premium editorial data illustration, exact technical linework with subtle dimensional depth.
Composition/framing: 3:2 landscape, crop-safe central composition, diagonal signal movement balanced by quiet negative space.
Lighting/mood: Cyan and off-white data marks with restrained amber and coral signal accents; investigative, measured, credible.
Constraints: no logos, no watermark, no people, no fake dashboard screenshot, no readable words, no currency claims, no profit claims, no real company marks.
Avoid: stock-photo traders, money piles, rockets, casino imagery, exaggerated growth arrows, clutter.
```

Copy the accepted output to `static/images/projects/nepse-market-intelligence-field-journal.png`.

- [ ] **Step 5: Generate the Secure Portfolio artwork**

Use:

```text
Use case: stylized-concept
Asset type: landscape project artwork for an editorial cybersecurity portfolio
Primary request: Visualize a secure portfolio platform as concentric application boundaries protecting public content, administrative controls, persistence, and validation checkpoints.
Scene/backdrop: Near-black technical field-journal surface with fine grid coordinates, subtle paper grain, and scan texture.
Subject: Layered application perimeter, public content plane, guarded admin plane, persistence core, and small security checkpoints joined by precise traces.
Style/medium: Premium editorial architecture illustration, restrained isometric depth with crisp technical linework.
Composition/framing: 3:2 landscape, crop-safe central composition, clear layered hierarchy with quiet margins.
Lighting/mood: Cyan boundary glow, off-white structural lines, tiny coral control points; secure, calm, systematic.
Constraints: no logos, no watermark, no people, no browser screenshot, no login form, no readable words, no fake metrics.
Avoid: padlock clip art, shields as the main subject, generic hacker imagery, excessive neon, clutter.
```

Copy the accepted output to `static/images/projects/secure-portfolio-platform-field-journal.png`.

- [ ] **Step 6: Generate the RunPod artwork**

Use:

```text
Use case: stylized-concept
Asset type: landscape project artwork for an editorial systems-engineering portfolio
Primary request: Visualize a temporary GPU media orchestration workflow: pod lifecycle activation, media transfer, execution stage, and returned artifact.
Scene/backdrop: Near-black technical field-journal surface with a fine grid, subtle scanned texture, operational trace marks, and quiet negative space.
Subject: A modular GPU compute pod connected to an inbound media packet, controlled execution chamber, lifecycle ring, and returned output artifact.
Style/medium: Premium editorial systems illustration, crisp linework with restrained mechanical dimensionality.
Composition/framing: 3:2 landscape, crop-safe central composition, circular lifecycle motion crossed by a clear transfer path.
Lighting/mood: Cyan and off-white operational signals with tiny amber state transitions; controlled, efficient, credible.
Constraints: no brand logos, no watermark, no people, no fake dashboard screenshot, no readable words, no fake speed or cost metrics.
Avoid: gaming-PC imagery, sci-fi spaceships, excessive neon, server-room stock photography, clutter.
```

Copy the accepted output to `static/images/projects/runpod-media-orchestrator-field-journal.png`.

- [ ] **Step 7: Verify exact dimensions before registering the files**

Run:

```powershell
Add-Type -AssemblyName System.Drawing
Get-ChildItem static\images\projects\*-field-journal.png | ForEach-Object {
  $image = [System.Drawing.Image]::FromFile($_.FullName)
  try { [pscustomobject]@{ Name = $_.Name; Width = $image.Width; Height = $image.Height; Bytes = $_.Length } }
  finally { $image.Dispose() }
}
```

Expected: four images, each `1536 × 1024`, each larger than 50,000 bytes. If the built-in output is a different common 3:2 size, resize non-destructively to 1536 × 1024 with the bundled workspace image library before continuing.

- [ ] **Step 8: Update project metadata**

In `content/projects.json`, set each top-level project to its matching versioned filename and:

```json
"image_width": 1536,
"image_height": 1024
```

The RunPod project currently has no image fields; add all three fields immediately after `"featured": true`.

- [ ] **Step 9: Run project-content tests**

Run:

```powershell
.\.venv\Scripts\python.exe -m pytest tests/test_project_content.py -v
```

Expected: all project-content tests pass.

- [ ] **Step 10: Commit generated project artwork**

```powershell
git add content/projects.json tests/test_project_content.py static/images/projects/*-field-journal.png
git commit -m "feat: add security field journal project artwork"
```

---

### Task 4: Add Resilient Artwork Frames and Site-Wide Field-Journal Motifs

**Files:**
- Modify: `tests/test_public_pages.py`
- Modify: `templates/index.html`
- Modify: `templates/portfolio.html`
- Modify: `templates/project_detail.html`
- Modify: `static/css/editorial-portfolio.css`
- Modify: `static/js/editorial-portfolio.js`

**Interfaces:**
- Consumes: project image metadata from Task 3.
- Produces: `.field-art`, `[data-project-image]`, `.case-placeholder[data-image-fallback]`, `[data-field-mark]`, and accessible runtime image fallback behavior.

- [ ] **Step 1: Write failing markup tests**

Append:

```python
def test_project_artwork_uses_resilient_field_journal_frame(client):
    homepage = client.get("/").get_data(as_text=True)
    portfolio = client.get("/portfolio").get_data(as_text=True)
    detail = client.get("/work/multi-channel-ai-messaging").get_data(as_text=True)

    for html in (homepage, portfolio, detail):
        assert "field-art" in html
        assert "data-project-image" in html
        assert "data-image-fallback" in html
    assert 'aria-hidden="true"' in homepage
    assert "SYSTEM MAP" in homepage


def test_public_shell_loads_image_fallback_and_field_motifs(client):
    javascript = client.get("/static/js/editorial-portfolio.js").get_data(as_text=True)
    css = client.get("/static/css/editorial-portfolio.css").get_data(as_text=True)

    assert 'document.querySelectorAll("[data-project-image]")' in javascript
    assert 'image.addEventListener("error"' in javascript
    assert ".field-art::before" in css
    assert ".field-art::after" in css
    assert ".section-head::after" in css
    assert "@media (prefers-reduced-motion: reduce)" in css
```

- [ ] **Step 2: Run the focused tests and confirm failure**

Run:

```powershell
.\.venv\Scripts\python.exe -m pytest tests/test_public_pages.py::test_project_artwork_uses_resilient_field_journal_frame tests/test_public_pages.py::test_public_shell_loads_image_fallback_and_field_motifs -v
```

Expected: failures because the field-art contract does not exist.

- [ ] **Step 3: Apply the resilient image contract to homepage cards**

Replace each current `.case-media` body in `templates/index.html` with:

```html
<div class="case-media field-art">
  <span class="field-art-label meta" data-field-mark aria-hidden="true">{{ '%02d'|format(loop.index) }} / SYSTEM MAP</span>
  {% if project.image_url %}
  <img data-project-image src="{% if project.image_url.startswith('static/') %}/{% endif %}{{ project.image_url }}" alt="Technical systems artwork for {{ project.title }}" width="{{ project.image_width or 1536 }}" height="{{ project.image_height or 1024 }}" loading="lazy">
  <div class="case-placeholder" data-image-fallback hidden aria-hidden="true"><span>{{ '%02d'|format(loop.index) }}</span></div>
  {% else %}
  <div class="case-placeholder" data-image-fallback aria-hidden="true"><span>{{ '%02d'|format(loop.index) }}</span></div>
  {% endif %}
</div>
```

- [ ] **Step 4: Apply the same contract to portfolio and detail templates**

Use the same `.field-art`, `data-project-image`, adjacent `[data-image-fallback]`, native label, dimensions, and technical alt-text pattern in `templates/portfolio.html`.

In `templates/project_detail.html`, use:

```html
<figure class="post-image field-art">
  <span class="field-art-label meta" data-field-mark aria-hidden="true">CASE FILE / SYSTEM MAP</span>
  <img data-project-image src="{% if project.image_url.startswith('static/') %}/{% endif %}{{ project.image_url }}" alt="Technical systems artwork for {{ project.title }}" width="{{ project.image_width or 1536 }}" height="{{ project.image_height or 1024 }}">
  <div class="case-placeholder" data-image-fallback hidden aria-hidden="true"><span>00</span></div>
</figure>
```

Keep the entire figure conditional on `project.image_url`; the templates for homepage and portfolio continue to handle absent URLs.

- [ ] **Step 5: Add deterministic image-error behavior**

In `static/js/editorial-portfolio.js`, add:

```javascript
document.querySelectorAll("[data-project-image]").forEach((image) => {
  image.addEventListener("error", () => {
    image.hidden = true;
    const fallback = image.parentElement?.querySelector("[data-image-fallback]");
    if (fallback) fallback.hidden = false;
  }, { once: true });
});
```

- [ ] **Step 6: Add the field-art visual layer**

Add to `static/css/editorial-portfolio.css`:

```css
.field-art {
  isolation: isolate;
  background:
    linear-gradient(rgba(157, 249, 243, .045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(157, 249, 243, .045) 1px, transparent 1px),
    var(--surface);
  background-size: 28px 28px;
}
.field-art::before,
.field-art::after {
  content: "";
  position: absolute;
  z-index: 2;
  width: 2.25rem;
  height: 2.25rem;
  pointer-events: none;
}
.field-art::before {
  inset: 1rem auto auto 1rem;
  border-top: 1px solid var(--accent);
  border-left: 1px solid var(--accent);
}
.field-art::after {
  inset: auto 1rem 1rem auto;
  border-right: 1px solid var(--accent);
  border-bottom: 1px solid var(--accent);
}
.field-art-label {
  position: absolute;
  z-index: 3;
  inset: 1rem 1rem auto auto;
  padding: .4rem .55rem;
  background: color-mix(in srgb, var(--canvas) 82%, transparent);
  color: var(--accent);
  backdrop-filter: blur(8px);
}
.field-art img {
  aspect-ratio: 3 / 2;
  object-position: center;
}
```

- [ ] **Step 7: Add restrained section motifs**

Make `.section-head` positioned and add:

```css
.section-head::after {
  content: "";
  position: absolute;
  top: -.75rem;
  right: 0;
  width: clamp(3rem, 8vw, 7rem);
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent));
  box-shadow: 0 .45rem 0 color-mix(in srgb, var(--accent) 32%, transparent);
  pointer-events: none;
}
.capability-row,
.lab-note,
.article-row {
  background-image: linear-gradient(90deg, color-mix(in srgb, var(--accent) 8%, transparent), transparent 18%);
  background-repeat: no-repeat;
  background-size: 0 100%;
  transition: background-size .45s ease, color .2s ease;
}
.capability-row:hover,
.lab-note:hover,
.article-row:hover { background-size: 100% 100%; }
```

Inside the existing reduced-motion media query, disable these new transitions and keep image transforms off.

- [ ] **Step 8: Run public-page tests**

Run:

```powershell
.\.venv\Scripts\python.exe -m pytest tests/test_public_pages.py -v
```

Expected: all public-page tests pass.

- [ ] **Step 9: Commit resilient frames and motifs**

```powershell
git add tests/test_public_pages.py templates/index.html templates/portfolio.html templates/project_detail.html static/css/editorial-portfolio.css static/js/editorial-portfolio.js
git commit -m "feat: add field journal artwork frames and visual motifs"
```

---

### Task 5: Verify the Complete Visual System

**Files:**
- Verify only: all files changed by Tasks 1–4.
- Modify only if a verification failure identifies a scoped defect.

**Interfaces:**
- Consumes: the complete visual system.
- Produces: test, asset, accessibility, responsive, persistence, and live-route evidence.

- [ ] **Step 1: Run the full automated suite**

Run:

```powershell
.\.venv\Scripts\python.exe -m pytest -q
```

Expected: all tests pass with zero failures.

- [ ] **Step 2: Confirm identity and asset integrity**

Run:

```powershell
rg -n -i "Dhirendrayadav4999|DHIRENDRAYADAV4999" templates static content app.py
```

Expected: no matches.

Run:

```powershell
Get-ChildItem static\images\projects\*-field-journal.png | Select-Object Name,Length
```

Expected: four files, each larger than 50,000 bytes.

- [ ] **Step 3: Confirm the live Flask routes**

With the existing Flask process running on port 5000, request:

```powershell
$paths = @('/', '/portfolio', '/contact', '/work/multi-channel-ai-messaging', '/work/nepse-market-intelligence', '/work/secure-portfolio-platform', '/work/runpod-media-orchestrator')
$paths | ForEach-Object {
  $response = Invoke-WebRequest -Uri ("http://127.0.0.1:5000" + $_) -UseBasicParsing -TimeoutSec 10
  [pscustomobject]@{ Path = $_; Status = $response.StatusCode; Bytes = $response.RawContentLength }
}
```

Expected: every route returns HTTP 200 and non-empty content.

- [ ] **Step 4: Verify desktop behavior in the browser**

At approximately 1440 × 900:

- Confirm all four artwork frames load with no broken-image icons.
- Confirm native labels remain crisp and generated artwork contains no required readable text.
- Cycle all twelve accents and inspect dark and light modes for usable focus, label, and button contrast.
- Cycle all three fonts and confirm headings, body text, and HUD metadata change as intended.
- Reload after selecting a non-default theme, accent, and font; confirm all three persist.
- Use Tab and Enter/Space to operate mode, accent, and font controls.
- Confirm artwork hover and section signals remain restrained.

- [ ] **Step 5: Verify mobile and reduced motion**

At approximately 390 × 844:

- Confirm the footer HUD does not overflow or cover essential content.
- Confirm each artwork maintains a useful crop and labels do not cover the main subject.
- Confirm the footer email wraps without changing the address.
- Emulate `prefers-reduced-motion: reduce`; confirm new transforms and transitions are removed while content remains visible.

- [ ] **Step 6: Verify runtime image fallback**

In browser developer tools, temporarily replace one `[data-project-image]` `src` with `/static/images/projects/not-present.png`.

Expected: the failed image hides and the adjacent numbered fallback becomes visible without a page error.

- [ ] **Step 7: Review the final diff and commit any verification-only fixes**

Run:

```powershell
git diff --check
git status --short
git log -5 --oneline
```

Expected: no whitespace errors; only intended files remain changed. If verification required a scoped fix, stage only those fix files and commit:

```powershell
git commit -m "fix: resolve visual system verification findings"
```
