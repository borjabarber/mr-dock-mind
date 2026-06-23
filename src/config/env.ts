import { config as loadDotenv } from "dotenv";

loadDotenv({ quiet: true });

export interface AppConfig {
  openaiApiKey: string;
}

export function loadConfig(): AppConfig {
  const openaiApiKey = process.env.OPENAI_API_KEY?.trim();

  if (!openaiApiKey) {
    throw new Error(
      "OPENAI_API_KEY is missing or empty. Create a .env file in the project root with OPENAI_API_KEY=your_key.",
    );
  }

  return {
    openaiApiKey,
  };
}
