import { defineConfig } from "tsup";


export default defineConfig({
  entry: ["src/server.ts"],
  format: ["esm"], // Keep this as ESM
  target: "esnext",
  outDir: "dist",
  clean: true,
  bundle: true,
  splitting: false,
  sourcemap: true,
  // Externalize Prisma packages — they need to be installed in node_modules at runtime
  external: [
    "@prisma/client",
    "@prisma/adapter-pg",
    "pg",
  ],
  // Add this banner to shim require() for CJS dependencies
  banner: {
    js: `
      import { createRequire } from 'module';
      const require = createRequire(import.meta.url);
    `,
  },
});