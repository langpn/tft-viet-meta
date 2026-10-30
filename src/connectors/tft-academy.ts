import { createSnapshot, type SourceSnapshot } from "../core/source-lock.js";

export type FetchText = (url: string) => Promise<string>;

export function parseSitemapUrls(xml: string): string[] {
  const urls = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((match) => match[1]);
  return [...new Set(urls)];
}

export async function fetchSitemap(fetchText: FetchText, sitemapUrl: string): Promise<string[]> {
  return parseSitemapUrls(await fetchText(sitemapUrl));
}

export async function snapshotPublicPages(
  fetchText: FetchText,
  urls: string[],
  retrievedAt = new Date().toISOString(),
): Promise<SourceSnapshot[]> {
  const snapshots: SourceSnapshot[] = [];
  for (const url of urls) {
    const content = await fetchText(url);
    snapshots.push(createSnapshot({ sourceName: "tft-academy", url, content, retrievedAt }));
  }
  return snapshots;
}
