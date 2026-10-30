import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-node';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit({
      adapter: adapter(),
      alias: {
        '$lib': 'src/lib',
        '$components': 'src/lib/components',
        '$data': 'src/lib/data',
        '$server': 'src/lib/server'
      }
    })
  ],
  server: {
    port: 3000,
    host: '0.0.0.0'
  }
});
