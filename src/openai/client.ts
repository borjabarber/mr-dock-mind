import OpenAI from "openai";
import type { AppConfig } from "../config/env.js";

const DEFAULT_MODEL = "gpt-5.5";
const EMBEDDING_MODEL = "text-embedding-3-small";

export async function answerWithoutDocuments(
  config: AppConfig,
  question: string,
): Promise<string> {
  const client = new OpenAI({
    apiKey: config.openaiApiKey,
  });

  const response = await client.responses.create({
    model: DEFAULT_MODEL,
    instructions:
      "You are Mr Dock_mind, a local documentation assistant. Explain that no local documentation context is connected yet, then answer briefly if possible.",
    input: question,
  });

  return response.output_text;
}

export interface ContextSource {
  title: string;
  url: string;
  text: string;
}

export async function answerWithContext(
  config: AppConfig,
  question: string,
  sources: ContextSource[],
): Promise<string> {
  const client = new OpenAI({
    apiKey: config.openaiApiKey,
  });

  const context = sources
    .map((source, index) => {
      return [
        `Source ${index + 1}`,
        `Title: ${source.title}`,
        `URL: ${source.url}`,
        `Text: ${source.text}`,
      ].join("\n");
    })
    .join("\n\n");

  const response = await client.responses.create({
    model: DEFAULT_MODEL,
    instructions:
      "You are Mr Dock_mind, a local documentation assistant. Answer using only the provided documentation context. If the answer is not in the context, say that the saved documentation does not contain enough information.",
    input: `Question:\n${question}\n\nDocumentation context:\n${context}`,
  });

  return response.output_text;
}

export function formatOpenAIError(error: unknown): string {
  if (error instanceof OpenAI.APIError) {
    if (error.status === 401) {
      return "OpenAI authentication failed. Check that OPENAI_API_KEY is valid.";
    }

    if (error.status === 429) {
      return "OpenAI request failed because the account or project has no available quota.";
    }

    return `OpenAI request failed with status ${error.status}.`;
  }

  return error instanceof Error ? `OpenAI request failed: ${error.message}` : "OpenAI request failed.";
}

export function isOpenAIError(error: unknown): boolean {
  return error instanceof OpenAI.APIError;
}

export async function createEmbeddings(
  config: AppConfig,
  inputs: string[],
): Promise<number[][]> {
  if (inputs.length === 0) {
    return [];
  }

  const client = new OpenAI({
    apiKey: config.openaiApiKey,
  });

  const response = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: inputs,
    encoding_format: "float",
  });

  return response.data
    .sort((first, second) => first.index - second.index)
    .map((item) => item.embedding);
}
