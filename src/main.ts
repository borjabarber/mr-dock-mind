#!/usr/bin/env node

import { Command } from "commander";
import packageJson from "../package.json" with { type: "json" };
import { loadConfig } from "./config/env.js";
import { countDocumentChunks, listEmbeddedChunks, replaceDocumentChunks } from "./db/chunks.js";
import { openDatabase } from "./db/database.js";
import { listDocuments, saveDocument } from "./db/documents.js";
import { chunkText } from "./docs/chunkText.js";
import { extractTextFromHtml } from "./docs/extractText.js";
import { fetchDocumentationPage } from "./docs/fetchPage.js";
import {
  answerWithContext,
  answerWithoutDocuments,
  createEmbeddings,
  formatOpenAIError,
  isOpenAIError,
} from "./openai/client.js";
import { findMostSimilarChunks } from "./search/similarity.js";
import { runInteractive } from "./ui/runInteractive.js";

export function main(): void {
  const program = new Command();

  program
    .name("mr-dock-mind")
    .description(
      "Local CLI for adding documentation pages and asking questions about them.",
    )
    .version(packageJson.version)
    .action(async () => {
      await runInteractive();
    });

  program
    .command("ask")
    .description("Ask a question about the saved documentation.")
    .argument("<question...>", "Question to answer")
    .action(async (questionParts: string[]) => {
      const question = questionParts.join(" ");
      let config;

      try {
        config = loadConfig();
      } catch (error) {
        console.error(error instanceof Error ? error.message : "Invalid configuration.");
        process.exitCode = 1;
        return;
      }

      try {
        const db = openDatabase();
        const chunks = listEmbeddedChunks(db);
        db.close();

        if (chunks.length === 0) {
          console.log("No embedded documentation found yet.");
          console.log("Add a documentation page first:");
          console.log("  mr-dock-mind add https://example.com/docs/page");
          return;
        }

        const [questionEmbedding] = await createEmbeddings(config, [question]);

        if (!questionEmbedding) {
          throw new Error("OpenAI did not return an embedding for the question.");
        }

        const results = findMostSimilarChunks(questionEmbedding, chunks);
        const answer = await answerWithContext(
          config,
          question,
          results.map((result) => ({
            title: result.chunk.documentTitle,
            url: result.chunk.documentUrl,
            text: result.chunk.text,
          })),
        );

        console.log(answer);
        console.log("");
        console.log("Sources:");
        const uniqueSources = new Map<string, string>();

        for (const result of results) {
          uniqueSources.set(result.chunk.documentUrl, result.chunk.documentTitle);
        }

        for (const [url, title] of uniqueSources) {
          console.log(`- ${title}`);
          console.log(`  ${url}`);
        }
      } catch (error) {
        console.error(formatOpenAIError(error));
        process.exitCode = 1;
      }
    });

  program
    .command("add")
    .description("Add a documentation page from a URL.")
    .argument("<url>", "Documentation page URL")
    .action(async (url: string) => {
      let parsedUrl: URL;

      try {
        parsedUrl = new URL(url);
      } catch {
        console.error("Invalid URL. Use a full URL like https://example.com/docs/page.");
        process.exitCode = 1;
        return;
      }

      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        console.error("Invalid URL protocol. Only http and https URLs are supported.");
        process.exitCode = 1;
        return;
      }

      try {
        const config = loadConfig();
        console.log(`Downloading: ${parsedUrl.toString()}`);
        const page = await fetchDocumentationPage(parsedUrl);
        console.log("Extracting readable text...");
        const extracted = extractTextFromHtml(page.html);
        const chunks = chunkText(extracted.text);
        console.log(`Generating embeddings for ${chunks.length} chunks...`);
        const embeddings = await createEmbeddings(
          config,
          chunks.map((chunk) => chunk.text),
        );

        if (embeddings.length !== chunks.length) {
          throw new Error("OpenAI returned a different number of embeddings than requested.");
        }

        console.log("Saving document and chunks...");
        const db = openDatabase();
        const document = saveDocument(db, {
          url: page.url,
          title: extracted.title,
          text: extracted.text,
        });
        replaceDocumentChunks(
          db,
          chunks.map((chunk) => ({
            documentId: document.id,
            index: chunk.index,
            text: chunk.text,
            embedding: embeddings[chunk.index]!,
          })),
        );
        const savedChunkCount = countDocumentChunks(db, document.id);
        db.close();

        console.log(`Downloaded: ${page.url}`);
        console.log(`HTML size: ${page.html.length} characters`);
        console.log(`Title: ${extracted.title}`);
        console.log(`Text size: ${extracted.text.length} characters`);
        console.log(`Chunks saved: ${savedChunkCount}`);
        console.log(`Saved document #${document.id}`);
      } catch (error) {
        console.error(isOpenAIError(error) ? formatOpenAIError(error) : formatCliError("Could not add page", error));
        process.exitCode = 1;
      }
    });

  program
    .command("list")
    .description("List saved documentation pages.")
    .action(() => {
      const db = openDatabase();
      const documents = listDocuments(db);
      db.close();

      if (documents.length === 0) {
        console.log("No documentation pages saved yet.");
        console.log("Add one with:");
        console.log("  mr-dock-mind add https://example.com/docs/page");
        return;
      }

      console.log(`Saved documentation pages: ${documents.length}`);
      console.log("");

      for (const document of documents) {
        console.log(`#${document.id} ${document.title}`);
        console.log(`  ${document.url}`);
        console.log(`  Updated: ${document.updated_at}`);
      }
    });

  program.parse();
}

function formatCliError(prefix: string, error: unknown): string {
  return error instanceof Error ? `${prefix}: ${error.message}` : `${prefix}.`;
}

main();
