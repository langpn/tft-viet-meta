import { createSnapshot, type SourceSnapshot } from "../core/source-lock.js";

export type FetchText = (url: string) => Promise<string>;

export type SnapshotOptions = {
  concurrency?: number;
  retries?: number;
};

export const TFT_ACADEMY_SCOPE = [
  "https://tftacademy.com/tierlist/comps",
  "https://tftacademy.com/tierlist/items",
  "https://tftacademy.com/tierlist/augments",
  "https://tftacademy.com/learn/new-set",
] as const;

export const TFT_ACADEMY_UPDATE_TRIGGER = "https://tftacademy.com/tierlist/updates/comps";

export const TFT_ACADEMY_REFRESH_TARGETS = [
  "https://tftacademy.com/tierlist/comps",
  "https://tftacademy.com/tierlist/items",
  "https://tftacademy.com/tierlist/augments",
] as const;

export function filterTftAcademyScope(urls: string[]): string[] {
  const allowed = new Set<string>(TFT_ACADEMY_SCOPE);
  return urls.filter((url) => allowed.has(url));
}

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
  options: SnapshotOptions = {},
): Promise<SourceSnapshot[]> {
  const concurrency = Math.max(1, options.concurrency ?? 8);
  const retries = Math.max(0, options.retries ?? 2);
  const results: Array<SourceSnapshot | undefined> = new Array(urls.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (true) {
      const index = nextIndex++;
      if (index >= urls.length) return;
      const url = urls[index];
      let lastError: unknown;
      for (let attempt = 0; attempt <= retries; attempt += 1) {
        try {
          const content = await fetchText(url);
          results[index] = createSnapshot({ sourceName: "tft-academy", url, content, retrievedAt });
          lastError = undefined;
          break;
        } catch (error) {
          lastError = error;
        }
      }
      if (lastError) throw new Error(`Failed to fetch ${url}: ${String(lastError)}`);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, urls.length) }, () => worker()));
  return results.filter((snapshot): snapshot is SourceSnapshot => snapshot !== undefined);
}
