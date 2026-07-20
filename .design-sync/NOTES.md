# design-sync notes — Reply Anywhere

- The production site is **Astro** — `.astro` components cannot execute in Claude
  Design's React runtime, so a full component sync is impossible by nature.
  2026-07-09 (Oleg's call): ship the **design language only** — hand-authored
  layout: `styles.css` (import closure) → `tokens/tokens.css` (verbatim copy of
  `site/src/styles/tokens.css`) + `fonts/` (same woff2 the site ships) +
  `guidelines/`. No `_ds_bundle.js`, no `_ds_sync.json` (honest omission — any
  future sync re-verifies everything).
- Re-sync = re-copy tokens/global from `site/src/styles/`, re-validate README
  token names (every `--*` named in README/guidelines must exist in tokens.css),
  re-upload the same paths, re-arm `_ds_needs_recompile`.
- `guidelines/comparison-table-ux.md` sources from the comparison-table refboard
  research (mod-manager/templates/reference-finder/runs/comparison-table/PRACTICES.md,
  2026-07-08) — regenerate from there if the research updates.
- If the site ever grows a React component layer, redo as a proper package-shape sync.
