# Reply Anywhere — Quality Bar

> The standard every deliverable is held to. Ethos: **One Man Army** — one person +
> orchestrated AI = team-grade output. Living document: re-checked at each phase boundary.

## Five pillars (all must hold)

| Pillar | Meaning | How we hit it |
|---|---|---|
| **Fast** | Ships quickly | Parallel agent fan-out; Astro SSG; one deploy |
| **Cool** | Genuinely well-made | Reusable components, clean semantics |
| **Stunning** (сног-сшибательно) | Wow-level, an exemplar | 1:1 Figma fidelity, real motion, glow/shadow detail |
| **Cheap** (недорого) | Minimal cost | $0 hosting (CF Workers), no CMS, Sonnet for mechanical QA |
| **Solo** | One person orchestrates | Agents do parallel labor; human sets direction + approves |

## Build non-negotiables

- **1:1 with Figma, meticulous.** Every radius, layered shadow, glow, spacing, line weight,
  color, gradient inspected — nothing approximate.
- **Shared styles, single source of truth.** One H2, one body, one button, one token set
  (`site/src/styles/tokens.css`). Every section/agent references `var(--…)` — a raw hex or
  off-scale pixel that isn't a token is a defect.
- **No entity explosion.** Few smart, reusable styles/components. Valid, cross-browser,
  accessible markup that passes any senior front-end review.
- **SVG icons as FILES, not inline.** Exported from Figma components into the repo (inline
  distorts/stretches). One `<Icon>` pattern, not bespoke markup per use.
- **Sanitize every Figma SVG export.** (client-caught, 2026-07-02) Figma instance exports
  BAKE parent context into the file: a full-viewBox `#1E1E1E` backdrop rect, the page
  canvas rect (`width="1440"`), pill/disc context rects — invisible on dark surfaces,
  visible on glow. After export: strip context rects, but NEVER touch rects inside
  `<clipPath>` (they're clip areas — emptying them clips the icon to nothing). Verify
  CONTENT (`grep '#1E1E1E\|width="1440"'`), not just file format.
- **Raster images: 2x sources → AVIF.** (client policy 2026-07-02) Export photos/raster
  from Figma at 2x, serve via `astro:assets` `<Image format="avif" quality={70}
  densities={[1,2]}>` — maximum compression, no visible quality loss (~90% smaller than
  PNG in practice). No raw `<img>` for raster.
- **Objective verification.** Pixel-perfect proven by a measure loop (computed-style
  assertions + pixel/ΔE diff at matched scale), not by eyeballing a screenshot. Gate =
  token-check green AND diff-gate true.

## Living best-practices check

- **When:** at each phase boundary (A Foundation → B Sections → C Assembly → D Motion →
  E Deploy) and whenever a core tool (Astro, Figma MCP, Cloudflare, GSAP) ships a major.
- **How:** targeted research (web search + MCP docs) on current best practices / mandatory
  conditions → update this bar, `tokens.css`, or the build conventions if something changed.
- **Log:** note material changes in `STATUS.md` so the bar's evolution is traceable.
