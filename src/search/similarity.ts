import type { ChunkWithDocument } from "../db/chunks.js";

export interface SearchResult {
  chunk: ChunkWithDocument;
  score: number;
}

export function findMostSimilarChunks(
  queryEmbedding: number[],
  chunks: ChunkWithDocument[],
  limit = 3,
): SearchResult[] {
  return chunks
    .map((chunk) => ({
      chunk,
      score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }))
    .sort((first, second) => second.score - first.score)
    .slice(0, limit);
}

function cosineSimilarity(first: number[], second: number[]): number {
  if (first.length !== second.length) {
    throw new Error("Cannot compare embeddings with different dimensions.");
  }

  let dotProduct = 0;
  let firstMagnitude = 0;
  let secondMagnitude = 0;

  for (let index = 0; index < first.length; index += 1) {
    const firstValue = first[index]!;
    const secondValue = second[index]!;

    dotProduct += firstValue * secondValue;
    firstMagnitude += firstValue * firstValue;
    secondMagnitude += secondValue * secondValue;
  }

  if (firstMagnitude === 0 || secondMagnitude === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(firstMagnitude) * Math.sqrt(secondMagnitude));
}
