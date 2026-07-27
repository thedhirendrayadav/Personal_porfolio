# Security Field Journal Visual System

**Date:** 2026-07-27
**Status:** Approved design
**Project:** Dhirendra Yadav personal portfolio

## Goal

Strengthen the portfolio's visual storytelling without replacing its established editorial identity. The finished site should feel like a coherent security field journal: dark, technical, evidence-led, precise, and visually memorable.

The work includes four original project artworks, richer visual treatments across the public site, expanded accent choices, a persistent font control, and a corrected public email address.

## Design Direction

The visual system extends the existing "Security Fieldwork" theme:

- near-black canvas, off-white type, and a configurable signal accent;
- technical grids, evidence labels, numbered markers, and system traces;
- restrained scanned-paper and monitor textures;
- bold editorial typography paired with compact monospace metadata;
- purposeful motion that reveals structure without obscuring content.

The redesign must not introduce an unrelated cyberpunk, glassmorphism, or generic dashboard aesthetic. Existing navigation, page hierarchy, writing, project evidence, and case-study structure remain intact.

## Project Artwork

Create four original landscape artworks with the built-in image-generation workflow. Generated imagery must contain no logos, watermarks, fake product screenshots, or required readable text. Labels and project names remain native HTML so they stay sharp, accessible, and editable.

### 1. Multi-Channel AI Messaging Platform

Represent secured channel adapters feeding a central orchestration boundary, with message packets moving through a queued processing path. Use modular nodes, guarded connections, and visible trust boundaries.

### 2. NEPSE Market Intelligence

Represent market traces, price movement, indicator layers, and an analytical decision engine. The image should communicate research and signal interpretation rather than promise trading performance.

### 3. Secure Portfolio Platform

Represent a layered application perimeter around public content, administrative controls, persistence, and security checks. The visual should make separation of concerns and protection boundaries legible.

### 4. RunPod Media Orchestrator

Represent a GPU pod lifecycle, media transfer path, execution stage, and returned artifact. The composition should convey temporary compute orchestration and operational flow.

### Shared Art Direction

- Landscape composition suitable for the existing work-deck media frame.
- Near-black base with off-white, cyan, and controlled secondary signals.
- Fine grid, technical linework, subtle depth, and evidence-like annotation shapes.
- High contrast at desktop and mobile crops.
- No legible generated text; no fake metrics or unverifiable claims.
- Keep important subjects inside a central safe area so `object-fit: cover` crops remain useful.

Final project-bound assets live under `static/images/projects/` with descriptive, versioned filenames. Existing screenshots are retained unless explicitly removed in a later cleanup.

## Site-Wide Visual Enhancements

Add a restrained layer of code-native editorial graphics rather than image-generation assets for simple shapes:

- schematic corner brackets on media and selected section surfaces;
- subtle grid or scan textures using CSS gradients;
- short signal traces and numbered evidence tags;
- accent-aware hover or scroll responses;
- section-specific visual motifs that reuse the same line weight and spacing rules.

Enhancements must remain decorative, use `aria-hidden="true"` where represented in markup, and never compete with headings or case-study evidence. Motion must respect `prefers-reduced-motion`.

## Appearance Controls

### Accent Control

Expand the existing accent cycle from eight to twelve curated colors. Every option must retain usable contrast against the dark and light themes for focus indicators, labels, buttons, and decorative lines. The control continues to show the active hexadecimal value and persists the choice in local storage.

### Font Control

Add a `FONT` control to the footer HUD. It cycles through three curated editorial/technical pairings:

1. Rubik + IBM Plex Mono, the existing default.
2. Space Grotesk + IBM Plex Mono, a more technical geometric option.
3. Archivo + Roboto Mono, a compact editorial option.

The active pairing is applied through CSS custom properties, displayed as a short readable name, and stored locally. If a web font is unavailable, the declared system fallbacks preserve readability.

The footer controls must remain keyboard accessible, expose descriptive labels and titles, and fit on narrow screens without horizontal overflow.

## Contact Address

Replace all public portfolio references to `Dhirendrayadav4999@gmail.com` with:

`thedhirendrayadav@gmail.com`

This includes visible footer copy and mail links such as the header call to action. The display treatment may wrap responsively, but the address itself must remain accurate.

## Architecture and Data Flow

- `templates/base.html` owns the footer HUD controls and shared email links.
- `static/css/editorial-portfolio.css` owns visual tokens, font variables, generated-art framing, code-native motifs, control layout, and responsive behavior.
- `static/js/editorial-portfolio.js` owns theme, accent, and font selection, local persistence, control-state updates, and the image-error fallback.
- `content/projects.json` references the new project artwork paths and intrinsic dimensions.
- Existing project templates consume those paths without new server-side behavior.

On load, JavaScript reads saved appearance choices, validates them against curated allowlists, applies the accepted values, and falls back to current defaults for missing or invalid values. User interaction advances one option at a time and updates both the document and visible HUD state.

## Failure Handling

- Invalid stored accent or font values fall back to defaults rather than being applied.
- A project image that fails to load is hidden and reveals its adjacent numbered placeholder.
- Font-loading failure uses CSS fallback stacks.
- JavaScript storage failures remain non-fatal through the existing guarded read/write helpers.
- Decorative motion is disabled for reduced-motion users and does not control access to content.

## Accessibility and Responsive Requirements

- Preserve meaningful `alt` text for every project artwork.
- Keep decorative additions out of the accessibility tree.
- Maintain visible keyboard focus using the selected accent.
- Ensure all HUD buttons meet the existing minimum interaction height.
- Prevent the expanded HUD from overlapping content or overflowing on mobile.
- Preserve text readability in dark and light modes across every accent choice.
- Avoid conveying project meaning through color alone.

## Verification

Completion requires evidence from:

1. Automated public-page and project-content tests.
2. A scan confirming the old email address no longer appears in public source.
3. Checks that all four referenced image files exist and load successfully.
4. Browser verification at desktop and mobile widths.
5. Keyboard verification of theme, accent, and font controls.
6. Reload verification showing persisted appearance choices.
7. Reduced-motion verification.
8. Live Flask requests returning successful responses for the homepage, portfolio, contact page, and project detail routes.

## Out of Scope

- Replacing the current navigation or page hierarchy.
- Rewriting project claims or case-study evidence.
- Adding an admin interface for visual settings.
- User-supplied arbitrary colors or fonts.
- Converting generated project artwork into functional dashboards.
