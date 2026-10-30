import { describe, expect, test } from "bun:test";
import { parseTftAcademyPage, type TftAcademyPage } from "../src/core/tft-academy-parser.js";

const compsHtml = `
  <div><span>S Tier</span>
    <a href="/tierlist/comps/set-18-test-comp">
      <img src="https://assets.tftacademy.com/champions/champion_icons/Ahri.webp" />
      <img src="https://assets.tftacademy.com/items/JeweledGauntlet.webp" />
    </a>
  </div>
  <div><span>A Tier</span>
    <a href="/tierlist/comps/set-18-another-comp">
      <img src="https://assets.tftacademy.com/champions/champion_icons/Garen.webp" />
    </a>
  </div>`;

describe("TFT Academy page parser", () => {
  test("extracts tier sections and comp cards from a snapshot", () => {
    const page: TftAcademyPage = parseTftAcademyPage(
      "https://tftacademy.com/tierlist/comps",
      compsHtml,
    );

    expect(page.kind).toBe("comps");
    expect(page.sections).toEqual([
      expect.objectContaining({
        tier: "S",
        cards: [
          expect.objectContaining({
            href: "/tierlist/comps/set-18-test-comp",
            imageUrls: [
              "https://assets.tftacademy.com/champions/champion_icons/Ahri.webp",
              "https://assets.tftacademy.com/items/JeweledGauntlet.webp",
            ],
          }),
        ],
      }),
      expect.objectContaining({ tier: "A" }),
    ]);
  });

  test("classifies the scoped pages without inventing content", () => {
    expect(parseTftAcademyPage("https://tftacademy.com/tierlist/items", "Items").kind).toBe("items");
    expect(parseTftAcademyPage("https://tftacademy.com/tierlist/augments", "Augments").kind).toBe("augments");
    expect(parseTftAcademyPage("https://tftacademy.com/learn/new-set", "Set 18").kind).toBe("new-set");
  });
});
