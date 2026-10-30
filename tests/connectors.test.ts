import { describe, expect, test } from "bun:test";
import {
  filterTftAcademyScope,
  parseSitemapUrls,
  snapshotPublicPages,
} from "../src/connectors/tft-academy.js";
import { fetchDataDragonDataset, normalizeDataDragonCatalog } from "../src/connectors/riot-ddragon.js";
import { fetchJsonResponse } from "../src/server/http.js";

describe("source connectors", () => {
  test("parses and de-duplicates sitemap URLs", () => {
    const xml = `<?xml version="1.0"?><urlset>
      <url><loc>https://tftacademy.com/</loc></url>
      <url><loc>https://tftacademy.com/guides</loc></url>
      <url><loc>https://tftacademy.com/</loc></url>
    </urlset>`;

    expect(parseSitemapUrls(xml)).toEqual([
      "https://tftacademy.com/",
      "https://tftacademy.com/guides",
    ]);
  });

  test("keeps only the explicitly enabled TFT Academy routes", () => {
    expect(
      filterTftAcademyScope([
        "https://tftacademy.com/tierlist/comps",
        "https://tftacademy.com/tierlist/items",
        "https://tftacademy.com/tierlist/augments",
        "https://tftacademy.com/learn/new-set",
        "https://tftacademy.com/guides",
        "https://tftacademy.com/tierlist/comps/set-18-solar-kayle",
      ]),
    ).toEqual([
      "https://tftacademy.com/tierlist/comps",
      "https://tftacademy.com/tierlist/items",
      "https://tftacademy.com/tierlist/augments",
      "https://tftacademy.com/learn/new-set",
    ]);
  });

  test("normalizes Riot catalog records with Vietnamese fallback metadata", () => {
    const catalog = normalizeDataDragonCatalog(
      {
        type: "tft-champion",
        version: "0.0.0",
        data: {
          TFT_Test_Ahri: {
            id: "TFT_Test_Ahri",
            name: "Ahri",
            tier: 2,
            image: { full: "Ahri.png" },
          },
        },
      },
      {
        type: "tft-champion",
        version: "0.0.0",
        data: {
          TFT_Test_Ahri: {
            id: "TFT_Test_Ahri",
            name: "Ahri Việt",
            tier: 2,
            image: { full: "Ahri.png" },
          },
        },
      },
      { version: "16.21.1", locale: "vi_VN" },
    );

    expect(catalog).toEqual([
      expect.objectContaining({
        id: "TFT_Test_Ahri",
        entityType: "unit",
        titleEn: "Ahri",
        titleVi: "Ahri Việt",
        source: "riot-data-dragon",
        patch: "16.21.1",
        verifiedAgainstLocale: true,
      }),
    ]);
  });

  test("uses Riot's plural filename for augment catalogs", async () => {
    let requestedUrl = "";
    await fetchDataDragonDataset(
      async <T>(url: string) => {
        requestedUrl = url;
        return { type: "tft-augment", version: "16.21.1", data: {} } as T;
      },
      "16.21.1",
      "vi_VN",
      "augment",
    );

    expect(requestedUrl).toBe(
      "https://ddragon.leagueoflegends.com/cdn/16.21.1/data/vi_VN/tft-augments.json",
    );
  });

  test("reports URL, status, and content type for non-JSON responses", async () => {
    const response = new Response("<Error><Code>AccessDenied</Code></Error>", {
      status: 403,
      headers: { "content-type": "application/xml" },
    });

    await expect(fetchJsonResponse("https://example.test/catalog.json", response)).rejects.toThrow(
      "HTTP 403 application/xml from https://example.test/catalog.json",
    );
  });

  test("limits page fetch concurrency and retries a transient failure", async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    let attempts = 0;
    const urls = [
      "https://example.test/1",
      "https://example.test/2",
      "https://example.test/3",
      "https://example.test/4",
    ];

    const snapshots = await snapshotPublicPages(
      async (url) => {
        inFlight += 1;
        maxInFlight = Math.max(maxInFlight, inFlight);
        await new Promise((resolve) => setTimeout(resolve, 1));
        inFlight -= 1;
        if (url.endsWith("/2") && attempts++ === 0) throw new Error("transient");
        return url;
      },
      urls,
      "2026-10-30T00:00:00.000Z",
      { concurrency: 2, retries: 1 },
    );

    expect(maxInFlight).toBeLessThanOrEqual(2);
    expect(snapshots).toHaveLength(4);
  });
});
