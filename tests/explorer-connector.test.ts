import { describe, expect, test } from "bun:test";
import { fetchExplorerSnapshot } from "../src/connectors/tactics-tools.js";

describe("tactics.tools Explorer connector", () => {
  test("fetches and validates a public explorer payload", async () => {
    const snapshot = await fetchExplorerSnapshot(
      async (url) => {
        expect(url).toBe("https://d3.tft.tools/explorer-data/16212/1/u-TFT18_Amumu-0");
        return { base: { count: 100, place: 325, top4: 60, won: 12 }, units: [] };
      },
      {
        patchId: "16212",
        rankGroup: 1,
        query: { units: ["TFT18_Amumu"] },
      },
    );

    expect(snapshot.status).toBe("PASS");
    expect(snapshot.metrics).toEqual({ averagePlacement: 3.25, topFourRate: 0.6, games: 100 });
  });

  test("fails closed when the source payload has no base aggregate", async () => {
    await expect(
      fetchExplorerSnapshot(async () => ({ units: [] }), {
        patchId: "16212",
        rankGroup: 1,
        query: {},
      }),
    ).rejects.toThrow("missing base aggregate");
  });
});
