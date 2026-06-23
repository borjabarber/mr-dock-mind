import type { AppDatabase } from "./database.js";

export interface SavedDocument {
  id: number;
  url: string;
  title: string;
  text: string;
}

export interface DocumentSummary {
  id: number;
  url: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface SaveDocumentInput {
  url: string;
  title: string;
  text: string;
}

export function saveDocument(db: AppDatabase, input: SaveDocumentInput): SavedDocument {
  const statement = db.prepare(`
    INSERT INTO documents (url, title, text, updated_at)
    VALUES (@url, @title, @text, CURRENT_TIMESTAMP)
    ON CONFLICT(url) DO UPDATE SET
      title = excluded.title,
      text = excluded.text,
      updated_at = CURRENT_TIMESTAMP
    RETURNING id, url, title, text
  `);

  return statement.get(input) as SavedDocument;
}

export function listDocuments(db: AppDatabase): DocumentSummary[] {
  const statement = db.prepare(`
    SELECT id, url, title, created_at, updated_at
    FROM documents
    ORDER BY updated_at DESC, id DESC
  `);

  return statement.all() as DocumentSummary[];
}
