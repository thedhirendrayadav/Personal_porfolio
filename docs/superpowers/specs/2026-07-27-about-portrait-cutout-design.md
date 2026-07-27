# About Portrait Cutout Design

## Goal

Replace the About portrait with the supplied full-body photograph while removing the original boat and water background. Present the subject as a distinct editorial object that fits the existing security field-journal visual system.

## Approved Direction

Use a transparent, identity-preserving full-body cutout. Place it in a dedicated About portrait component rather than reusing the generic tinted `portrait-treatment`.

### Revision: supplied `dhirendra.jpg`

Replace the About cutout source with `dhirendra.jpg`. Preserve its natural head-and-torso crop, face, glasses, hair, scarf, and checkered shirt while removing the outdoor background. Keep the existing technical plate and do not reuse this asset in the landing hero.

Increase the landing hero portrait plate and cutout together by a small amount on desktop only, while retaining clear horizontal separation from the 3D name.

## Composition

- Keep the complete person visible from hair to shoes.
- Place the cutout over a restrained technical grid plate using the active accent color.
- Add a shallow offset silhouette and an asymmetric frame line to create separation without covering the subject.
- Keep the plate behind the cutout and leave open space around the head and shoulders.
- Do not apply the dotted overlay or duotone filter to the person.

## Usage

- Use the new cutout on the dedicated `/about` profile section.
- Use the same component in the homepage About preview so both surfaces remain visually consistent.
- Preserve the hero portrait as a separate asset and treatment.

## Responsive Behavior

- Desktop: keep the full-body portrait in the left column with the subject centered over the plate.
- Mobile: stack the portrait above the text and reduce the plate offset so it does not create horizontal overflow.
- The component must maintain a stable `4 / 5` frame and use `object-fit: contain`.

## Accessibility and Motion

- Retain the existing descriptive alternative text.
- Decorative plate, labels, and frame details remain CSS-only and are hidden from assistive technology.
- No required animation; any hover movement must be subtle and disabled by reduced-motion preferences.

## Verification

- Confirm the original background is fully transparent at the image corners.
- Confirm no chroma-key fringe is visible around hair, jacket, hands, trousers, or shoes.
- Verify both homepage and `/about` render the new cutout without overflow at desktop and mobile widths.
- Run the public-page tests and the complete test suite.
