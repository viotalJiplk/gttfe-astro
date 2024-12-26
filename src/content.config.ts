import { defineCollection, z } from 'astro:content';

import { glob } from 'astro/loaders';

const sponsors = defineCollection({
    loader: glob({ pattern: "**/[^_]*.md", base: "./src/sponsors" }),
    schema: ({ image }) => z.object({
        title: z.string(),
        logo: image(),
        link: z.string(),
    })
});

const games = defineCollection({
    loader: glob({ pattern: "**/[^_]*.md", base: "./src/games" }),
    schema: ({ image }) => z.object({
        name: z.string(),
        logo: image(),
        picture: image(),
        id: z.number(),
    })
});

export const collections = { sponsors, games };