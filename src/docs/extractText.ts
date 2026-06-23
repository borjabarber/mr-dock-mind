import * as cheerio from "cheerio";

export interface ExtractedPageText {
  title: string;
  text: string;
}

export function extractTextFromHtml(html: string): ExtractedPageText {
  const $ = cheerio.load(html);

  $("script, style, noscript, svg, nav, footer, aside").remove();

  const title = normalizeWhitespace($("title").first().text()) || "Untitled page";
  const mainText = normalizeWhitespace($("main").first().text());
  const bodyText = normalizeWhitespace($("body").text());
  const text = mainText || bodyText;

  if (!text) {
    throw new Error("No readable text found in the HTML.");
  }

  return {
    title,
    text,
  };
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}
