# Reply Anywhere — design language

Dark violet SaaS landing language for **Reply Anywhere** (a SemanticForce product — omnichannel review/message reply tool). This project ships the **design language only** — tokens, fonts, base styles, guidelines. No component library is bundled (the production site is Astro): build every screen from your own generic components, styled **exclusively** through the CSS custom properties below. All of them live in `tokens/tokens.css`, loaded via `styles.css` — read that file before styling anything.

## Setup

- Dark theme ONLY. Page background `var(--bg)` (#111322), default text `var(--text-hi)` on `body`. Never use light backgrounds.
- Font is `var(--font-sans)` → 'Inter Variable' (self-hosted in `fonts/`). No other typefaces.

## Styling idiom — CSS variables, real names

- **Brand:** `--violet` (#AB0DFF, THE accent — buttons, accent words, highlights), `--violet-light` (subtitles/focus), `--violet-pulse`, `--violet-soft`, `--magenta-deep`.
- **Surfaces:** `--bg`, `--surface-card` (cards), `--surface-tile` (icon tiles), `--surface-bubble` (channel-logo discs), `--surface-island` (floating menu islands), `--surface-pill`, `--surface-pill-social`, `--surface-fade`, `--black` (hero bubbles, app tile).
- **Borders (violet-tint family):** `--border-soft`, `--border-line`, `--border-card`, `--border-strong`, `--border-white`. Cards = 1px `--border-card` on `--surface-card`, radius `--r-md`.
- **Text:** `--text-hi` (white), `--text-body` (80%), `--text-dim` (50%), `--text-tagline`.
- **Type scale:** `--fs-h1` 48 / `--fs-h2` 40 / `--fs-card-title` 24 / `--fs-lead` 18 / `--fs-card-sub` 16 / `--fs-ui` 14 / `--fs-chip` 12 / `--fs-pill-label` 10; line-heights `--lh-h1`+`--lh-h2` 1.05, `--lh-body` 1.4, `--lh-chip` 1.2; weights `--fw-regular/medium/semibold/bold`. Headline idiom: Regular white line + **violet bold/semibold accent phrase** (H1 uses semibold, H2 bold).
- **Spacing:** `--sp-1` 4 → `--sp-2` 8, `--sp-3` 12, `--sp-4` 16, `--sp-5` 20, `--sp-6` 24, `--sp-8` 32, `--sp-10` 40, `--sp-12` 48, `--sp-16` 64, `--sp-20` 80, `--sp-24` 96. Also `--sp-25` 10, `--sp-45` 18.
- **Radii:** `--r-item` 4, `--r-md` 8 (buttons/cards/islands), `--r-tile` 12, `--r-app` 24, `--r-pill` 1000 (pills, discs, avatars). Nothing outside this scale.
- **Layout:** `--container` 1280px centered, side margins `--margin-desktop` (fluid clamp 20→80px).
- **Effects:** shadows `--shadow-app-tile`, `--shadow-app-tile-hero`; violet glows `--glow-blur-wide/mid/tight` + hero scale `--glow-hero-tight/mid/wide/extra` (pre-blurred stacked squares — animate opacity/scale, never blur); gradients `--grad-cta` (CTA band), `--grad-card-fade`; menu blur `--island-blur`.
- **Motion:** `--ease-out`, `--dur-fast` 180ms, `--dur-normal` 280ms. Subtle, transform/opacity only.

## Idiomatic snippet

```html
<section style="background:var(--bg); padding:var(--sp-10) var(--margin-desktop);">
  <h2 style="font-size:var(--fs-h2); line-height:var(--lh-h2); color:var(--text-body);">
    Everything you need <strong style="color:var(--violet); font-weight:var(--fw-bold);">to respond at scale</strong>
  </h2>
  <div style="background:var(--surface-card); border:1px solid var(--border-card); border-radius:var(--r-md); padding:var(--sp-8);">
    <p style="font-size:var(--fs-ui); line-height:var(--lh-body); color:var(--text-hi);">Card body</p>
  </div>
  <a style="display:inline-flex; padding:var(--sp-4) var(--sp-4); background:var(--violet); border-radius:var(--r-md); font-size:var(--fs-ui); font-weight:var(--fw-medium); color:var(--text-hi);">Request a free demo</a>
</section>
```

## Where the truth lives

- `tokens/tokens.css` — every variable above, with Figma-sourced comments.
- `guidelines/reply-anywhere.md` — composition motifs (orbit, pills, islands, glow) and don'ts.
- `guidelines/comparison-table-ux.md` — researched UX rules for the upcoming comparison-table section.
