import assert from "node:assert/strict";
import test from "node:test";
import { chunkText } from "./chunkText.js";

test("chunkText returns no chunks for blank text", () => {
  assert.deepEqual(chunkText("   \n\t  "), []);
});

test("chunkText splits text with overlap and stable indexes", () => {
  const chunks = chunkText("abcdefghij", 4, 1);

  assert.deepEqual(chunks, [
    { index: 0, text: "abcd" },
    { index: 1, text: "defg" },
    { index: 2, text: "ghij" },
  ]);
});

test("chunkText rejects invalid chunk configuration", () => {
  assert.throws(() => chunkText("hello", 0, 0), /Chunk size/);
  assert.throws(() => chunkText("hello", 4, 4), /Overlap/);
});
