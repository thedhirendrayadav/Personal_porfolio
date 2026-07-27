# Security Field Manual Content Design

## Objective

Deepen the Work, Expertise, Writing, Lab, and Contact experiences with credible editorial content and reusable technical graphics. The redesign must extend the existing Security Fieldwork identity rather than introduce a separate visual language.

## Editorial Contract

- Use evidence-based language for documented work and capabilities.
- Label unverified or future work as `IN DEVELOPMENT`, `RESEARCH HYPOTHESIS`, or `PROTOTYPE`.
- Explain how work is approached, verified, and communicated; avoid skill percentages and unsupported performance claims.
- Keep paragraphs concise and use structured labels, matrices, ledgers, and routes for depth.

## Page Architecture

### Work (`/#work`)

Retain the twelve-card project deck. Follow it with a Fieldwork Protocol section explaining the portfolio evidence model, status vocabulary, and delivery loop. Add a horizontal system-flow graphic connecting `OBSERVE`, `MODEL`, `BUILD`, and `VERIFY`.

### Expertise (`/skills`)

Retain the capability groups and method. Add a detailed capability matrix with columns for operating question, practices, outputs, and evidence. Add a trust-boundary visual showing how identity, application, data, and operations controls connect. Finish with working principles and toolchain groupings.

### Writing (`/blog`)

Retain real featured/archive posts. Add a Research Compass with four editorial themes, a signal-map graphic, and a publishing standard describing question, evidence, limits, and operational takeaway. Do not invent article titles or publication counts.

### Lab (`/#lab`)

Replace generic notes with four research dossiers: threat-model workbench, detection workflow, retrieval-grounded AI, and deployment observability. Each dossier includes hypothesis, method, evidence target, constraint, and explicit `IN DEVELOPMENT` status. Add a lab pipeline graphic from intake through observation.

### Contact (`/contact`)

Retain the accessible contact form. Add engagement-fit cards, a brief-preparation checklist, and a four-step response route. Clearly state that sensitive credentials or production secrets must not be submitted through the form.

## Visual System

- Create graphics with semantic HTML and CSS rather than generic stock imagery.
- Reuse the accent color, dotted grid, mono labels, outline typography, line tokens, and field-journal corners.
- New primitives: `manual-panel`, `system-flow`, `signal-node`, `capability-matrix`, `trust-map`, `research-compass`, `lab-dossier`, and `response-route`.
- Graphics must remain legible in light/dark themes and collapse without horizontal overflow below 760px.
- Decorative connectors are hidden from assistive technology; meaningful labels remain real text.

## Acceptance Criteria

1. Each requested route or anchor contains at least two new layers of structured editorial detail.
2. Work, Expertise, Writing, Lab, and Contact each include a distinct theme-consistent graphic.
3. Future Lab work is explicitly labeled and no unsupported claims are introduced.
4. All new content is responsive, keyboard-safe, theme-compatible, and free from horizontal overflow.
5. Existing routes, forms, project data, blog data, appearance controls, and animations continue to work.
