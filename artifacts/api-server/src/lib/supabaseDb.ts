import pg from "pg";
import { logger } from "./logger.js";

const { Pool } = pg;

function buildSupabaseUrl(): string {
  const password = process.env["SUPABASE_DB_PASSWORD"];
  if (!password) {
    throw new Error("SUPABASE_DB_PASSWORD must be set");
  }
  return `postgresql://postgres.dooezhzybvvxfejviasg:${encodeURIComponent(password)}@aws-1-ap-south-1.pooler.supabase.com:5432/postgres`;
}

let pool: InstanceType<typeof Pool> | null = null;

export function getSupabasePool(): InstanceType<typeof Pool> {
  if (!pool) {
    const connectionString = buildSupabaseUrl();
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 5,
    });
    pool.on("error", (err) => {
      logger.error({ err }, "Supabase pool error");
    });
  }
  return pool;
}

/**
 * Ensures the students table has a linked_email column.
 * Safe to run on every startup — uses IF NOT EXISTS.
 */
export async function runMigrations(): Promise<void> {
  const db = getSupabasePool();
  try {
    await db.query(`
      ALTER TABLE students
      ADD COLUMN IF NOT EXISTS linked_email VARCHAR(255)
    `);
    logger.info("DB migration: linked_email column ensured");
  } catch (err: unknown) {
    // If the table doesn't exist yet or the column already exists, log and continue
    logger.warn({ err }, "DB migration warning (non-fatal)");
  }
}
