import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const migrationsFolder = path.join(process.cwd(), "drizzle", "migrations");
const migrationTag = "0000_absurd_warlock";
const journal = JSON.parse(fs.readFileSync(path.join(migrationsFolder, "meta", "_journal.json"), "utf8"));
const migration = journal.entries.find((entry) => entry.tag === migrationTag);

if (!migration) {
  throw new Error(`Migration ${migrationTag} is missing from the journal.`);
}

const migrationSql = fs.readFileSync(path.join(migrationsFolder, `${migrationTag}.sql`), "utf8");
const migrationHash = crypto.createHash("sha256").update(migrationSql).digest("hex");
const client = postgres(process.env.DATABASE_URL, { max: 1, prepare: false });

try {
  // Keep these sequential: Supabase Transaction Pooler uses a single transaction connection.
  const existingTables = await client.unsafe(`
      select table_name
      from information_schema.tables
      where table_schema = 'public'
        and table_name in ('account', 'session', 'user', 'verification')
      order by table_name
    `);
  const columnCounts = await client.unsafe(`
      select table_name, count(*)::int as column_count
      from information_schema.columns
      where table_schema = 'public'
        and table_name in ('account', 'session', 'user', 'verification')
      group by table_name
      order by table_name
    `);
  const researchHistory = await client.unsafe("select to_regclass('public.research_history') as research_history");
  const recordedMigrations = await client.unsafe(
    'select hash, created_at from drizzle.__drizzle_migrations order by created_at',
  );

  const expectedColumnCounts = new Map([
    ["account", 13],
    ["session", 8],
    ["user", 7],
    ["verification", 6],
  ]);
  const matchesExpectedTables =
    existingTables.length === expectedColumnCounts.size &&
    columnCounts.length === expectedColumnCounts.size &&
    columnCounts.every((row) => expectedColumnCounts.get(row.table_name) === row.column_count);

  if (!matchesExpectedTables || researchHistory[0]?.research_history) {
    throw new Error(
      "Baseline stopped: this database does not match the expected pre-migration Better Auth schema.",
    );
  }

  if (recordedMigrations.length > 0) {
    const alreadyBaselined = recordedMigrations.some(
      (row) => row.hash === migrationHash && Number(row.created_at) === migration.when,
    );

    if (alreadyBaselined) {
      console.log(`${migrationTag} is already recorded as a baseline.`);
    } else {
      throw new Error("Baseline stopped: the Drizzle migration ledger already contains different records.");
    }
  } else {
    await client.begin(async (tx) => {
      await tx`
        insert into drizzle.__drizzle_migrations (hash, created_at)
        values (${migrationHash}, ${migration.when})
      `;
    });

    console.log(`Baselined ${migrationTag}; run pnpm db:migrate next.`);
  }
} finally {
  await client.end({ timeout: 5 });
}
