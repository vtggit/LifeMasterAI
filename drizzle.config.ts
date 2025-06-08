import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./server/storage/migrations",
  schema: "./server/storage/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'lifemasterai',
  },
});
