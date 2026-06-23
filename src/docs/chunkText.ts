export interface TextChunk {
  index: number;
  text: string;
}

const DEFAULT_CHUNK_SIZE = 1_200;
const DEFAULT_OVERLAP = 200;

export function chunkText(
  text: string,
  chunkSize = DEFAULT_CHUNK_SIZE,
  overlap = DEFAULT_OVERLAP,
): TextChunk[] {
  if (chunkSize <= 0) {
    throw new Error("Chunk size must be greater than 0.");
  }

  if (overlap < 0 || overlap >= chunkSize) {
    throw new Error("Overlap must be greater than or equal to 0 and smaller than chunk size.");
  }

  const normalizedText = text.replace(/\s+/g, " ").trim();

  if (!normalizedText) {
    return [];
  }

  const chunks: TextChunk[] = [];
  let start = 0;

  while (start < normalizedText.length) {
    const end = Math.min(start + chunkSize, normalizedText.length);
    const chunk = normalizedText.slice(start, end).trim();

    if (chunk) {
      chunks.push({
        index: chunks.length,
        text: chunk,
      });
    }

    if (end === normalizedText.length) {
      break;
    }

    start = end - overlap;
  }

  return chunks;
}
