import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Les paquets du monorepo sont lus depuis leurs sources : les tests ne
// dépendent pas d'un build préalable de packages/*.
const pkg = (p: string) => fileURLToPath(new URL(`../../packages/${p}/src/index.ts`, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@movtime/config': pkg('config'),
      '@movtime/types': pkg('types'),
    },
  },
  test: {
    include: ['test/unit/**/*.spec.ts'],
    environment: 'node',
  },
});
