import assert from "node:assert/strict";
import test from "node:test";
import type { ChunkWithDocument } from "../db/chunks.js";
import { findMostSimilarChunks } from "./similarity.js";

function createChunk(id: number, embedding: number[], text = `chunk ${id}`): ChunkWithDocument {
  return {
    id,
    documentId: 1,
    documentTitle: "Docs",
    documentUrl: "https://example.com/docs",
    index: id,
    text,
    embedding,
  };
}

test("findMostSimilarChunks ranks chunks by cosine similarity", () => {
  const results = findMostSimilarChunks(
    [1, 0],
    [
      createChunk(1, [0, 1]),
      createChunk(2, [1, 0]),
      createChunk(3, [0.5, 0.5]),
    ],
    2,
  );

  assert.equal(results.length, 2);
  assert.equal(results[0]?.chunk.id, 2);
  assert.equal(results[1]?.chunk.id, 3);
  assert.equal(results[0]?.score, 1);
});

test("findMostSimilarChunks rejects embeddings with different dimensions", () => {
  assert.throws(
    () => findMostSimilarChunks([1, 0], [createChunk(1, [1, 0, 0])]),
    /different dimensions/,
  );
});
