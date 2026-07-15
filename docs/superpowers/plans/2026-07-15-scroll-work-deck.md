# Scroll-Driven Work Deck Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the desktop home-page selected-work list into an accessible, scroll-driven project deck while retaining stacked cards on mobile and for reduced motion.

**Architecture:** `templates/index.html` provides semantic deck hooks around the existing truthful project cards. `editorial-portfolio.css` owns the sticky layout and responsive fallback. `editorial-portfolio.js` maps native scroll position to local deck state, CSS progress variables, active-card semantics, and progress ticks with no external animation dependency.

**Tech Stack:** Flask/Jinja, CSS custom properties, vanilla JavaScript, pytest.

## Global Constraints

- Use only existing project fields; do not add fictional metrics, outcomes, client claims, or imagery.
- Do not introduce WebGL, canvas, GSAP, or external animation dependencies.
- Preserve all existing project actions, case-study links, theme/accent controls, header, footer, and portfolio index.
- Use a normal stacked layout at `980px` and below and when `prefers-reduced-motion: reduce` is enabled.
- Retain native scrolling; do not intercept wheel/touch events or scroll-jack.

---

### Task 1: Define the rendered work-deck contract

**Files:**
- Modify: `tests/test_public_pages.py`
- Modify: `templates/index.html`

**Interfaces:**
- Consumes: `featured_projects` supplied by `index()`.
- Produces: `[data-work-deck]`, `[data-work-card]`, `[data-work-progress]`, `[data-work-index]`, and `[data-work-tick]` hooks for CSS and JavaScript.

- [ ] **Step 1: Write the failing test**

```python
def test_homepage_exposes_scroll_work_deck_hooks(client, monkeypatch):
    projects = [
        {"id": 1, "title": "Access Map", "description": "First.", "technologies": ["Python"]},
        {"id": 2, "title": "Signal Ledger", "description": "Second.", "technologies": ["Flask"]},
    ]
    monkeypatch.setattr(
        portfolio_app.ProjectModel,
        "get_all_projects",
        lambda self, featured_only=False: projects,
    )

    html = client.get("/").get_data(as_text=True)

    assert 'data-work-deck' in html
    assert html.count('data-work-card') == 2
    assert 'data-work-progress' in html
    assert 'data-work-index' in html
    assert html.count('data-work-tick') == 2
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run:

```powershell
& ".venv/Scripts/python.exe" -m pytest tests/test_public_pages.py -k "scroll_work_deck" -v
```

Expected: FAIL because the home page has no work-deck hooks.

- [ ] **Step 3: Add semantic deck markup around the existing project list**

```jinja2
<section class="work-deck" id="work" data-section="01 — WORK" data-work-deck>
  <div class="work-deck-sticky editorial-grid">
    <div class="work-deck-heading">
      <h2 id="work-title" class="sr-only">Selected work</h2>
      <div class="work-deck-marquee" aria-hidden="true" data-work-marquee>
        <span><b class="outline-text">SELECTED</b> <b class="accent">WORK</b></span>
        <span><b class="outline-text">SELECTED</b> <b class="accent">WORK</b></span>
      </div>
    </div>
    <div class="work-deck-cards">
      <article class="case-study" data-work-card data-evidence="project">...</article>
    </div>
    <div class="work-deck-footer" data-work-progress>
      <span class="meta"><b data-work-index>01</b> / <b data-work-total>01</b></span>
      <span class="work-deck-ticks" aria-hidden="true"><i data-work-tick></i></span>
    </div>
  </div>
</section>
```

Use identical hooks in the existing fallback-card branch. Retain all existing title, description, technology, detail, live, and source markup.

- [ ] **Step 4: Run the focused test to verify it passes**

Run:

```powershell
& ".venv/Scripts/python.exe" -m pytest tests/test_public_pages.py -k "scroll_work_deck" -v
```

Expected: PASS.

### Task 2: Add the sticky deck and responsive fallback styles

**Files:**
- Modify: `static/css/editorial-portfolio.css`

**Interfaces:**
- Consumes: deck hooks from Task 1 and `--work-deck-count` / `--work-deck-progress` set by Task 3.
- Produces: desktop sticky frame, active/future/past card states, and a normal-flow mobile/reduced-motion layout.

- [ ] **Step 1: Add the desktop deck CSS**

```css
.work-deck { --work-deck-count: 1; --work-deck-progress: 0; min-height: calc((var(--work-deck-count) + 1) * 100svh); position: relative; border-block: 1px dotted var(--line-strong); }
.work-deck-sticky { position: sticky; top: var(--header-h); height: calc(100svh - var(--header-h)); display: grid; grid-template-rows: auto auto minmax(0, 1fr) auto; overflow: hidden; }
.work-deck-marquee { display: flex; width: max-content; transform: translate3d(calc(var(--work-deck-progress) * -18%), 0, 0); }
.work-deck-cards { position: relative; min-height: 0; }
.work-deck [data-work-card] { position: absolute; inset: 0; opacity: 0; pointer-events: none; transform: translateY(14%); transition: opacity .45s ease, transform .55s ease; }
.work-deck [data-work-card].is-active { opacity: 1; pointer-events: auto; transform: none; }
.work-deck [data-work-card].is-past { transform: translateY(-14%); }
```

- [ ] **Step 2: Add responsive and motion-safe overrides**

```css
@media (max-width: 980px), (prefers-reduced-motion: reduce) {
  .work-deck { min-height: 0; }
  .work-deck-sticky { position: static; height: auto; overflow: visible; }
  .work-deck-cards { display: grid; }
  .work-deck [data-work-card] { position: relative; opacity: 1; pointer-events: auto; transform: none; }
  .work-deck-footer { display: none; }
}
```

- [ ] **Step 3: Run the public-page suite**

Run:

```powershell
& ".venv/Scripts/python.exe" -m pytest tests/test_public_pages.py -v
```

Expected: PASS.

### Task 3: Map native scrolling to deck state

**Files:**
- Modify: `static/js/editorial-portfolio.js`

**Interfaces:**
- Consumes: `[data-work-deck]`, `[data-work-card]`, `[data-work-index]`, `[data-work-total]`, and `[data-work-tick]` from Task 1.
- Produces: `--work-deck-count`, `--work-deck-progress`, `is-active`, `is-past`, `is-future`, `aria-hidden`, and `inert` state.

- [ ] **Step 1: Add the controller after the existing project-filter setup**

```javascript
const workDeck = document.querySelector("[data-work-deck]");
const deckCards = workDeck ? [...workDeck.querySelectorAll("[data-work-card]")] : [];
const deckMotionQuery = matchMedia("(min-width: 981px) and (prefers-reduced-motion: no-preference)");

const syncWorkDeck = () => {
  if (!workDeck || !deckCards.length) return;
  const enabled = deckMotionQuery.matches;
  workDeck.style.setProperty("--work-deck-count", deckCards.length);
  if (!enabled) {
    deckCards.forEach((card) => {
      card.classList.remove("is-active", "is-past", "is-future");
      card.removeAttribute("aria-hidden");
      card.inert = false;
    });
    return;
  }
  const range = Math.max(1, workDeck.offsetHeight - innerHeight);
  const progress = Math.min(1, Math.max(0, (scrollY - workDeck.offsetTop) / range));
  const activeIndex = Math.min(deckCards.length - 1, Math.floor(progress * deckCards.length));
  workDeck.style.setProperty("--work-deck-progress", progress.toFixed(3));
  deckCards.forEach((card, index) => {
    const active = index === activeIndex;
    card.classList.toggle("is-active", active);
    card.classList.toggle("is-past", index < activeIndex);
    card.classList.toggle("is-future", index > activeIndex);
    card.setAttribute("aria-hidden", String(!active));
    card.inert = !active;
  });
};

addEventListener("scroll", () => requestAnimationFrame(syncWorkDeck), { passive: true });
addEventListener("resize", syncWorkDeck);
deckMotionQuery.addEventListener("change", syncWorkDeck);
syncWorkDeck();
```

Update the current index text and tick classes inside the same loop.

- [ ] **Step 2: Run the public-page suite**

Run:

```powershell
& ".venv/Scripts/python.exe" -m pytest tests/test_public_pages.py -v
```

Expected: PASS.

### Task 4: Browser QA and regression verification

**Files:**
- Verify: `templates/index.html`
- Verify: `static/css/editorial-portfolio.css`
- Verify: `static/js/editorial-portfolio.js`

- [ ] **Step 1: Verify populated desktop and mobile home pages**

Run a temporary local Flask fixture with at least three projects. At desktop width, confirm scroll advances exactly one active card, the masthead moves, progress ticks update, and only the active card can be clicked. At 390px, confirm source-order cards remain visible with no sticky frame.

- [ ] **Step 2: Verify reduced-motion behavior**

Enable `prefers-reduced-motion: reduce`, reload the home page, and confirm the stacked layout remains readable with no transformed cards.

- [ ] **Step 3: Run final checks**

Run:

```powershell
& ".venv/Scripts/python.exe" -m pytest tests/test_public_pages.py -v
git diff --check
```

Expected: all tests pass and `git diff --check` produces no output.