import { defineCollection, z } from 'astro:content';
import { file } from 'astro/loaders';

// Typed content layer — all landing copy lives in src/data/*.json, validated by
// a Zod schema, separated from markup. This keeps the "no CMS" decision (zero
// runtime cost, git-edited) AND makes a future visual git-CMS (Decap / Sveltia,
// which edit exactly these files) a zero-code bolt-on if self-serve editing is
// ever needed. Convention: **word** inside a headline marks the accent span.
const landing = defineCollection({
  loader: file('src/data/landing.json'),
  schema: z.object({
    eyebrow: z.string(),
    headline: z.string(),
    sub: z.string(),
    ctaPrimary: z.string(),
    ctaSecondary: z.string(),
    channels: z.array(z.string()),
  }),
});

export const collections = { landing };
