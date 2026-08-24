import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/infrastructure/database/schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
}

const globalForDb = globalThis as unknown as { postgresClient?: ReturnType<typeof postgres> };

const postgresClient =
    globalForDb.postgresClient ??
    postgres(connectionString, {
        max: 10,
        prepare: false,
        idle_timeout: 20,
        connect_timeout: 15,
    });

if (process.env.NODE_ENV !== "production") {
    globalForDb.postgresClient = postgresClient;
}

export const db = drizzle(postgresClient, {
    schema,
    casing: "snake_case",
});
