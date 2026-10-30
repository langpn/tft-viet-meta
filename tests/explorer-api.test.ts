import { describe, expect, test } from "bun:test";
import { buildExplorerResponse } from "../src/server/explorer-api.js";

describe("Explorer API response", () => {
  test("normalizes a source payload into UI-ready sections", () => {
    const response = buildExplorerResponse(
      { patch: "18.5c", rank: "diamond_plus", units: ["Ahri"] },
      "https://d3.tft.tools/explorer-data/16212/1/u-TFT18_Amumu-0",
      {
        base: { count: 100, place: 325, top4: 60, won: 12 },
        units: [["Ahri", { count: 50, place: 150, top4: 30, won: 5, delta: -0.25 }]],
        traits: [],
        items: [],
        augments: [],
        star_units: [],
      },
    );

    expect(response.status).toBe("PASS");
    expect(response.base).toEqual({
      games: 100,
      averagePlacement: 3.25,
      topFourRate: 0.6,
      winRate: 0.12,
    });
    expect(response.sections.units[0]).toMatchObject({ id: "Ahri", games: 50, delta: -0.25 });
  });
});
