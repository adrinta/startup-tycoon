import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  serverExternalPackages: ["pg", "@prisma/adapter-pg"],
  turbopack: {
    // OnlyPHP 8.3's WebAssembly build is bundled; the web runtime's other
    // version imports (8.0-8.5, 7.4, 5.2) are redirected to the 8.3 package
    // so a single ~25MB wasm ships instead of dozens.
    resolveAlias: {
      "@php-wasm/web-8-0": "@php-wasm/web-8-3",
      "@php-wasm/web-8-1": "@php-wasm/web-8-3",
      "@php-wasm/web-8-2": "@php-wasm/web-8-3",
      "@php-wasm/web-8-4": "@php-wasm/web-8-3",
      "@php-wasm/web-8-5": "@php-wasm/web-8-3",
      "@php-wasm/web-7-4": "@php-wasm/web-8-3",
      "@php-wasm/web-5-2": "@php-wasm/web-8-3",
      // Jalur Node-only yang tidak pernah dieksekusi di browser.
      worker_threads: "./loaders/node-builtin-stub.cjs",
      "node:worker_threads": "./loaders/node-builtin-stub.cjs",
    },
    rules: {
      // Aset PHP-WASM yang hanya dipakai jalur ekstensi (intl) — distub agar
      // Turbopack tidak gagal pada tipe file .dat/.so/.la.
      "*.dat": {
        loaders: ["./loaders/php-wasm-asset-stub.cjs"],
        as: "*.js",
      },
      "*.so": {
        loaders: ["./loaders/php-wasm-asset-stub.cjs"],
        as: "*.js",
      },
      "*.la": {
        loaders: ["./loaders/php-wasm-asset-stub.cjs"],
        as: "*.js",
      },
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
