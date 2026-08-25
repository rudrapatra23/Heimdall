import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    // Use DIRECT_URL (session-mode pooler, port 5432) for migrations.
    // The transaction-mode pooler (DATABASE_URL, port 6543) doesn't
    // support the DDL statements that drizzle-kit needs.
    url: process.env.DIRECT_URL!,
  },
  // Only manage public schema — leave auth.* entirely to Supabase
  schemaFilter: ['public'],
});
