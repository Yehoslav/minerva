// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

import node from '@astrojs/node';

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
    integrations: [react(), mdx()],
    output: 'server',

    adapter: node({
        mode: 'standalone',
    }),
});
