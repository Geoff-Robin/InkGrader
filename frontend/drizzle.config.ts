import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./auth-schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: ["public", "dev", "prod"],
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
