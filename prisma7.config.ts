import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // CLI (db push / migrate) memakai koneksi langsung (DIRECT_URL) —
    // pooler transaksional tidak cocok untuk perubahan schema.
    // Aplikasi saat runtime memakai DATABASE_URL (pooler 6543) lewat
    // driver adapter pg di src/lib/db/prisma.ts.
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
