# Security Field Manual Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add evidence-led depth and theme-consistent technical graphics to Work, Expertise, Writing, Lab, and Contact.

**Architecture:** Extend the existing Jinja templates with semantic field-manual components and implement their visual language in the existing layered stylesheet. Keep all content static and truthful while preserving dynamic project/blog data and the current JavaScript behavior.

**Tech Stack:** Flask, Jinja, vanilla CSS/JavaScript, pytest, Playwright.

## Global Constraints

- All future-facing Lab content must be labeled `IN DEVELOPMENT` or `RESEARCH HYPOTHESIS`.
- Do not invent article titles, client results, metrics, certifications, or deployment claims.
- Reuse existing CSS tokens and preserve dark/light/accent/font controls.
- New graphics must use semantic HTML/CSS and must not create mobile horizontal overflow.

---

### Task 1: Define cross-page regression coverage

**Files:**
- Modify: `tests/test_public_pages.py`

- [ ] Add a test that requests `/`, `/skills`, `/blog`, and `/contact` and asserts the new section labels: `FIELDWORK PROTOCOL`, `CAPABILITY MATRIX`, `RESEARCH COMPASS`, `LAB PIPELINE`, and `RESPONSE ROUTE`.
- [ ] Add assertions for `IN DEVELOPMENT`, the contact secret-warning copy, and the shared CSS component selectors.
- [ ] Run `./.venv/Scripts/python.exe -m pytest tests/test_public_pages.py -k field_manual -q` and confirm it fails on missing content.

### Task 2: Deepen Work and Lab

**Files:**
- Modify: `templates/index.html`

- [ ] Add the Fieldwork Protocol after the project deck with evidence/status/delivery panels.
- [ ] Add an accessible four-node system flow: `OBSERVE`, `MODEL`, `BUILD`, `VERIFY`.
- [ ] Replace the three generic Lab notes with four dossiers containing hypothesis, method, evidence target, constraint, and explicit development status.
- [ ] Add the Lab Pipeline graphic: `INTAKE`, `ISOLATE`, `TEST`, `OBSERVE`.
- [ ] Run the focused field-manual test and confirm homepage assertions pass.

### Task 3: Deepen Expertise

**Files:**
- Modify: `templates/skills.html`

- [ ] Add a five-row capability matrix covering Security, AI/ML, Engineering, Infrastructure, and Investigation.
- [ ] Add the trust map linking Identity, Application, Data, and Operations.
- [ ] Add working-principle and toolchain panels without unsupported proficiency claims.
- [ ] Run the focused test and confirm Expertise assertions pass.

### Task 4: Deepen Writing

**Files:**
- Modify: `templates/blog/index.html`

- [ ] Add a four-theme Research Compass without inventing posts.
- [ ] Add a CSS signal-map visual connecting Security, Systems, AI, and Operations.
- [ ] Add the publishing standard: question, evidence, limits, operational takeaway.
- [ ] Preserve featured/archive loops and empty states.
- [ ] Run the focused test and confirm Writing assertions pass.

### Task 5: Deepen Contact

**Files:**
- Modify: `templates/contact.html`

- [ ] Add four engagement-fit cards and a concise project-brief checklist.
- [ ] Add a warning not to submit passwords, API keys, credentials, or production secrets.
- [ ] Add the Response Route graphic: `RECEIVE`, `CLARIFY`, `SCOPE`, `RESPOND`.
- [ ] Preserve form fields, CSRF behavior, and live status region.
- [ ] Run the focused test and confirm Contact assertions pass.

### Task 6: Implement the shared visual system

**Files:**
- Modify: `static/css/editorial-portfolio.css`

- [ ] Add component styles for manual panels, system flows, matrices, trust maps, compass cards, dossiers, and response routes using existing tokens.
- [ ] Add light-theme-safe color mixing and field-journal corner marks.
- [ ] Add responsive rules below 980px and 680px so matrices become stacked cards and flows wrap vertically.
- [ ] Run the focused test and the complete pytest suite.

### Task 7: Live verification and commit

**Files:**
- No additional files.

- [ ] Restart the Flask listener on port 5000.
- [ ] Verify `/`, `/skills`, `/blog`, and `/contact` return 200.
- [ ] Use Playwright to inspect `/#work`, `/skills`, `/blog`, `/#lab`, and `/contact` at 1440×900 and 390×844.
- [ ] Confirm every page has `document.body.scrollWidth <= innerWidth`, the new section labels are visible, and no browser errors occur.
- [ ] Capture representative desktop screenshots.
- [ ] Run the complete pytest suite and commit the intended files.
