# Scroll-Driven Work Deck

## Goal

Make the home page feel more deliberate and professionally paced by replacing the desktop selected-work list with a focused scroll sequence. The design takes structural inspiration from the reference site's pinned project deck without copying its content, metrics, media, or implementation.

## Scope

- Modify only the home page's selected-work presentation, its shared editorial CSS, and the existing vanilla JavaScript runtime.
- Preserve current project data, project detail links, live/source actions, theme/accent controls, header, footer, and global status rail.
- Keep the portfolio index as a standard filterable list.
- Do not add dependencies, WebGL, canvas, fabricated metrics, or unverified imagery.

## Desktop Interaction

- The work section becomes a scroll track on viewports wider than 980px.
- A sticky frame holds the work introduction, an outlined/accent masthead, one active project card, and progress ticks.
- Each project card is positioned in the same visual frame. Scrolling through equal track segments advances the active card with a vertical slide and opacity transition.
- The masthead drifts horizontally in proportion to the section's local scroll progress.
- The active project has the only enabled pointer events; actions remain ordinary links.
- The current project number is announced in a compact progress label.

## Responsive and Accessible Behavior

- At 980px and below, disable the pinned track and show the existing stacked cards in source order.
- When `prefers-reduced-motion: reduce` is enabled, disable the pinned track and show the stacked cards on all viewport sizes.
- The original semantic article/card markup remains in document order. JavaScript only adds state classes and CSS custom properties.
- No scroll-jacking: browser scrolling remains native and all transitions map directly to the work section's scroll position.

## Validation

- Add a public-page test asserting the work-deck hooks are rendered for dynamic projects.
- Test desktop, mobile, and reduced-motion rendering with the existing Flask test suite plus browser screenshots.
- Confirm project actions and case-study links continue to work and no project metric is synthesized.