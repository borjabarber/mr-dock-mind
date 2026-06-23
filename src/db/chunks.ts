import type { AppDatabase } from "./database.js";

export interface SaveChunkInput {
  documentId: number;
  index: number;
  text: string;
  embedding?: number[];
}

export interface ChunkWithDocument {
  id: number;
  documentId: number;
  documentTitle: string;
  documentUrl: string;
  index: number;
  text: string;
  embedding: number[];
}

export function replaceDocumentChunks(db: AppDatabase, chunks: SaveChunkInput[]): void {
  if (chunks.length === 0) {
    return;
  }

  const documentId = chunks[0]?.documentId;

  if (documentId === undefined) {
    return;
  }

  const deleteExisting = db.prepare("DELETE FROM chunks WHERE document_id = ?");
  const insertChunk = db.prepare(`
    INSERT INTO chunks (document_id, chunk_index, text, embedding)
    VALUES (@documentId, @index, @text, @embedding)
  `);

  const replaceChunks = db.transaction((items: SaveChunkInput[]) => {
    deleteExisting.run(documentId);

    for (const item of items) {
      insertChunk.run({
        ...item,
        embedding: item.embedding ? JSON.stringify(item.embedding) : null,
      });
    }
  });

  replaceChunks(chunks);
}

export function countDocumentChunks(db: AppDatabase, documentId: number): number {
  const statement = db.prepare(`
    SELECT COUNT(*) AS count
    FROM chunks
    WHERE document_id = ?
  `);
  const row = statement.get(documentId) as { count: number };

  return row.count;
}

export function listEmbeddedChunks(db: AppDatabase): ChunkWithDocument[] {
  const statement = db.prepare(`
    SELECT
      chunks.id,
      chunks.document_id AS documentId,
      chunks.chunk_index AS "index",
      chunks.text,
      chunks.embedding,
      documents.title AS documentTitle,
      documents.url AS documentUrl
    FROM chunks
    INNER JOIN documents ON documents.id = chunks.document_id
    WHERE chunks.embedding IS NOT NULL
    ORDER BY chunks.id ASC
  `);

  const rows = statement.all() as Array<Omit<ChunkWithDocument, "embedding"> & { embedding: string }>;

  return rows.map((row) => ({
    ...row,
    embedding: JSON.parse(row.embedding) as number[],
  }));
}
