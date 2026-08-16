import path from "node:path";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// Supabase Transaction Pooler (port 6543) requires prepared statements to be disabled.
const client = postgres(process.env.DATABASE_URL, {
  max: 1,
  prepare: false,
});

try {
  const db = drizzle(client);
  await migrate(db, {
    migrationsFolder: path.join(process.cwd(), "drizzle", "migrations"),
  });
  console.log("Database migrations applied successfully.");
} finally {
  await client.end({ timeout: 5 });
}
