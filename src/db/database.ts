import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const DATABASE_PATH = join(process.cwd(), ".mr-dock-mind", "mr-dock-mind.sqlite");

export type AppDatabase = Database.Database;

export function openDatabase(): AppDatabase {
  mkdirSync(dirname(DATABASE_PATH), { recursive: true });

  const db = new Database(DATABASE_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  runMigrations(db);

  return db;
}

function runMigrations(db: AppDatabase): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chunks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id INTEGER NOT NULL,
      chunk_index INTEGER NOT NULL,
      text TEXT NOT NULL,
      embedding TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
      UNIQUE(document_id, chunk_index)
    );
  `);

  const chunkColumns = db.prepare("PRAGMA table_info(chunks)").all() as Array<{ name: string }>;
  const hasEmbeddingColumn = chunkColumns.some((column) => column.name === "embedding");

  if (!hasEmbeddingColumn) {
    db.exec("ALTER TABLE chunks ADD COLUMN embedding TEXT;");
  }
}
