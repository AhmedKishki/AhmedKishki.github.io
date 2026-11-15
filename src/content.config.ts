import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One markdown file per project in src/content/projects/.
// The file name becomes the page URL: projects/<file-name>/.
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    // One line, shown on the home page and under the page title.
    summary: z.string(),
    // Home-page group; the order of groups is set in src/data/areas.ts.
    area: z.enum(['professional', 'research', 'personal']),
    // Optional: a professional project may have no public repository. The first one is the main one.
    repos: z.array(z.object({ name: z.string(), url: z.string().url(), note: z.string().optional() })).default([]),
    languages: z.array(z.string()).default([]),
    // ISO year-month when the project started and when work on it last happened, e.g. "2026-10".
    started: z.string().regex(/^\d{4}-\d{2}$/),
    updated: z.string().regex(/^\d{4}-\d{2}$/),
    status: z.string().optional(),
    // Lower numbers come first within a group.
    order: z.number().default(100),
    // Drafts build locally but are left out of the published site.
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects };
