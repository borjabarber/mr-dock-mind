export interface FetchedPage {
  url: string;
  html: string;
}

export async function fetchDocumentationPage(url: URL): Promise<FetchedPage> {
  const response = await fetch(url, {
    headers: {
      "user-agent": "mr-dock-mind/1.0",
      accept: "text/html",
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}.`);
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("text/html")) {
    throw new Error(`Expected HTML but received "${contentType || "unknown"}".`);
  }

  return {
    url: response.url,
    html: await response.text(),
  };
}
