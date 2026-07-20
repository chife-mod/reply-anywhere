# Reply Anywhere — visual language guidelines

The look of the production site (replyanywhere.com, by SemanticForce). Design new sections so they read as siblings of the existing ones.

## Character

Dark, calm, premium SaaS. Deep navy-black canvas (`--bg` #111322), violet (`--violet` #AB0DFF) as the single accent. Generous air, few colors, no noise. Reference mood: semanticforce.ai.

## Composition motifs (used across existing sections)

- **Floating islands** — the menu is a row of separate rounded islands (`--surface-island` rgba(0,0,0,.85) + backdrop blur `--island-blur`, radius `--r-md`), not a bar.
- **Channel discs** — 64px circles (`--surface-bubble`, radius `--r-pill`) with brand logos inside (Google, Amazon, WhatsApp, Instagram…), orbiting on thin rings around a central black app tile with layered violet glow behind it.
- **Channel pills** — small rounded chips: icon disc + tiny top label (`--fs-pill-label`) + name (`--fs-ui`); dark variant `--surface-pill` and violet variant `--surface-pill-social`.
- **Cards** — `--surface-card` (violet-tinted 5% white) + 1px `--border-card`, radius `--r-md`, padding `--sp-8`; title 24 bold + violet-light subtitle + 14px body.
- **Headlines** — one Regular line in white/80% + one bold/semibold phrase in `--violet`. H1 48, H2 40, line-height 1.05.
- **CTA band** — full-width rounded band with `--grad-cta` magenta gradient, white 20% border, avatars row, dark button.
- **Buttons** — primary: violet fill, radius `--r-md`, 14 Medium label, height 46; secondary: 46px square outline icon button (arrow ↗).

## Do / Don't

- DO keep everything on the dark canvas; violet is an accent, never a page background.
- DO use quantitative facts as design elements (big numbers, counts) — the brand argues with numbers.
- DO use the glow tokens for focal energy (behind tiles/hero objects), sparingly — one glow center per screen.
- DON'T introduce new colors, light themes, gradient text fills, non-Inter typefaces, or radii outside the `--r-*` scale.
- DON'T crowd: sections breathe with `--sp-10`+ vertical padding; content stays inside `--container` 1280.
