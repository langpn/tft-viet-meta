import { describe, expect, test } from "bun:test";
import { parseSitemapUrls } from "../src/connectors/tft-academy.js";
import { normalizeDataDragonCatalog } from "../src/connectors/riot-ddragon.js";

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
});
