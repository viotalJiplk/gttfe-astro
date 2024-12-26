// 1. Import utilities from `astro:content`
import { defineCollection, z } from 'astro:content';

// 2. Import loader(s)
import { glob } from 'astro/loaders';

// 3. Define your collection(s)
const sponsors = defineCollection({
    loader: glob({ pattern: "**/[^_]*.md", base: "./src/sponsors" }),
    schema: ({ image }) => z.object({
        title: z.string(),
        logo: image(),
        link: z.string(),
    })
});

// 4. Export a single `collections` object to register your collection(s)
export const collections = { sponsors };