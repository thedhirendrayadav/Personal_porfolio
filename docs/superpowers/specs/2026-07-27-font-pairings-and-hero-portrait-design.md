# Font Pairings and Hero Portrait Design

## Goal

Expand the appearance HUD from three to six curated font pairings and replace the homepage hero portrait with the user-provided photograph while preserving the existing Security Fieldwork visual system.

## Design

- Keep the existing single-button cycle interaction and localStorage persistence.
- Add Barlow Condensed + JetBrains Mono, Syne + Space Mono, and Manrope + DM Mono to the existing Rubik, Space Grotesk, and Archivo presets.
- Load the new Google Fonts in the shared base template and expose stable preset IDs/labels through the existing JavaScript allowlist.
- Copy the supplied portrait into `static/images/profile-hero.jpg` and point only the homepage hero image at it. Preserve the existing cyan treatment, halftone overlay, responsive sizing, and accessible alt text.
- Use a hero-specific object position so the face remains visible in the landscape crop; leave the about-page portrait unchanged.

## Acceptance Criteria

1. The HUD cycles through six distinct labels and persists the selected preset after reload.
2. The new fonts are requested by the shared stylesheet import and applied through the existing CSS variables.
3. The homepage hero uses the supplied portrait asset and retains the existing visual treatment.
4. Existing routes, responsive layout, and all current tests remain green.
