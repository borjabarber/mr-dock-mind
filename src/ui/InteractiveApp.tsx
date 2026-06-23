import React, { useState } from "react";
import { Box, Text, useApp, useInput } from "ink";
import TextInput from "ink-text-input";
import { loadConfig } from "../config/env.js";
import { countDocumentChunks, listEmbeddedChunks, replaceDocumentChunks } from "../db/chunks.js";
import { openDatabase } from "../db/database.js";
import { listDocuments, saveDocument } from "../db/documents.js";
import { chunkText } from "../docs/chunkText.js";
import { extractTextFromHtml } from "../docs/extractText.js";
import { fetchDocumentationPage } from "../docs/fetchPage.js";
import { answerWithContext, createEmbeddings, formatOpenAIError, isOpenAIError } from "../openai/client.js";
import { findMostSimilarChunks } from "../search/similarity.js";

interface Message {
  type: "system" | "user";
  text: string;
}

const helpText = [
  "Commands:",
  "  /help        Show available commands",
  "  /list        Show saved documentation pages",
  "  /add <url>   Add and index a documentation page",
  "  /exit        Close Mr Dock_mind",
  "",
  "Anything else is treated as a question.",
].join("\n");

const logo = String.raw`
⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣀⡀⢀⡠⠄⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢀⣠⣶⣿⣿⣿⣿⣿⣿⣶⣿⣿⣿⣧⣄⡀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⢀⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣄⡀⠀⠀⠀
⠀⠀⣾⣿⣿⣿⣿⣿⣿⠟⠋⠉⠻⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡄⠀⠀
⠀⣼⣿⣿⣿⣿⣿⠟⠁⠀⠀⠀⠀⠀⠈⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⡀⠀
⢰⣿⣿⣿⣿⣿⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⠿⢿⣿⣿⣿⣿⣿⡇⠀
⣾⣿⣿⡟⠛⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⢿⣿⣿⣿⣿⠀
⣿⣿⣿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣿⣿⣿⣿⠀
⢿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢿⣿⣿⣿⠀
⠸⣿⣿⠀⣀⣀⣀⣀⣀⣠⣄⣀⣀⣠⣶⣶⣒⣒⣲⣶⡄⢀⣼⣿⣿⣿⠀
⠀⢻⣿⡿⣿⣿⣿⡿⢿⢿⣿⠮⢿⡿⠻⠛⠿⠟⠟⠻⣍⡹⠉⣿⡿⡿⠄
⠀⠀⢿⡇⠈⠓⠈⠁⠀⢸⣿⠀⠸⣿⡀⠀⠀⠀⠀⢀⡏⠁⠀⣿⠇⠇⠀
⠀⠀⢸⣿⣦⣤⣤⣤⠴⢿⠁⠀⠀⠁⣙⠒⠒⠒⠒⠛⠁⠀⠀⣿⠁⠀⠀
⠀⠀⠀⡏⠉⠁⠀⠀⠀⠹⠷⠤⠖⠣⠃⠀⠀⠀⠀⠀⠀⠀⠀⣿⠀⠀⠀
⠀⠀⠀⢹⡀⠀⠀⠀⠀⠀⠀⠀⢀⣀⠀⠀⠀⠀⠀⠀⠀⠀⢸⡇⠀⠀⠀
⠀⠀⠀⠈⢇⠀⠀⠀⠐⠒⠉⣉⣩⡍⠉⠉⠀⠀⠀⠀⠀⢠⡟⠀⠀⠀⠀
⠀⠀⠀⠀⠈⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣰⠟⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢧⣈⣦⣀⠀⠀⠀⠀⣀⣀⣀⣤⣴⣿⠏⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠻⣯⡙⠛⠿⠿⠛⠛⠋⢉⣠⡾⠃⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠈⠛⠷⡶⠶⠶⠶⠟⠛⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀
Dock_mind
`;

export function InteractiveApp(): React.ReactElement {
  const { exit } = useApp();
  const [input, setInput] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      type: "system",
      text: "Welcome. Ask a question or type /help.",
    },
  ]);

  useInput((_input, key) => {
    if (key.return) {
      void handleSubmit(input);
    }
  });

  async function handleSubmit(value: string): Promise<void> {
    const command = value.trim();

    if (!command || isBusy) {
      return;
    }

    setMessages((current) => [...current, { type: "user", text: command }]);
    setInput("");

    if (command === "/exit") {
      exit();
      return;
    }

    if (command === "/help") {
      setMessages((current) => [...current, { type: "system", text: helpText }]);
      return;
    }

    setIsBusy(true);

    try {
      const response = command.startsWith("/add ")
        ? await addPage(command.slice(5).trim())
        : command === "/list"
          ? listPages()
          : await askQuestion(command);

      setMessages((current) => [...current, { type: "system", text: response }]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          type: "system",
          text: isOpenAIError(error) ? formatOpenAIError(error) : formatCliError(error),
        },
      ]);
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <Box flexDirection="column" paddingX={2} paddingY={1}>
      <Box flexDirection="column" marginBottom={1}>
        <Text color="gray">{logo}</Text>
        <Text color="cyan" bold>
          Local documentation memory
        </Text>
      </Box>

      <Box borderStyle="single" borderColor="cyan" paddingX={1} paddingY={1} flexDirection="column">
        <Text color="gray">Add docs with /add https://example.com/docs/page</Text>
        <Text color="gray">Ask by typing a normal question.</Text>
        <Text> </Text>
        {messages.map((message, index) => (
          <Text key={`${message.type}-${index}`} color={message.type === "user" ? "white" : "gray"}>
            {message.type === "user" ? "> " : ""}
            {message.text}
          </Text>
        ))}
      </Box>

      <Box marginTop={1}>
        <Text color="cyan">mr-dock-mind </Text>
        <TextInput value={input} onChange={setInput} />
      </Box>

      <Box marginTop={1}>
        <Text color="gray">{isBusy ? "Working..." : "/help commands  /add url  /list docs  /exit quit"}</Text>
      </Box>
    </Box>
  );
}

async function addPage(url: string): Promise<string> {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(url);
  } catch {
    return "Invalid URL. Use a full URL like https://example.com/docs/page.";
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    return "Invalid URL protocol. Only http and https URLs are supported.";
  }

  const config = loadConfig();
  const page = await fetchDocumentationPage(parsedUrl);
  const extracted = extractTextFromHtml(page.html);
  const chunks = chunkText(extracted.text);
  const embeddings = await createEmbeddings(
    config,
    chunks.map((chunk) => chunk.text),
  );

  if (embeddings.length !== chunks.length) {
    throw new Error("OpenAI returned a different number of embeddings than requested.");
  }

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

  return [
    `Saved document #${document.id}`,
    `Title: ${extracted.title}`,
    `URL: ${page.url}`,
    `Chunks saved: ${savedChunkCount}`,
  ].join("\n");
}

function listPages(): string {
  const db = openDatabase();
  const documents = listDocuments(db);
  db.close();

  if (documents.length === 0) {
    return "No documentation pages saved yet. Use /add https://example.com/docs/page";
  }

  return documents
    .map((document) => `#${document.id} ${document.title}\n${document.url}`)
    .join("\n\n");
}

async function askQuestion(question: string): Promise<string> {
  const config = loadConfig();
  const db = openDatabase();
  const chunks = listEmbeddedChunks(db);
  db.close();

  if (chunks.length === 0) {
    return "No embedded documentation found yet. Use /add https://example.com/docs/page";
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
  const uniqueSources = new Map<string, string>();

  for (const result of results) {
    uniqueSources.set(result.chunk.documentUrl, result.chunk.documentTitle);
  }

  const sources = Array.from(uniqueSources, ([url, title]) => `- ${title}\n  ${url}`).join("\n");

  return `${answer}\n\nSources:\n${sources}`;
}

function formatCliError(error: unknown): string {
  return error instanceof Error ? error.message : "Unexpected error.";
}
