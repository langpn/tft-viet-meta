export type TftAcademyKind = "comps" | "items" | "augments" | "new-set";

export type TftAcademyCard = {
  href?: string;
  imageUrls: string[];
  text: string;
};

export type TftAcademySection = {
  tier?: string;
  title?: string;
  cards: TftAcademyCard[];
};

export type TftAcademyPage = {
  url: string;
  kind: TftAcademyKind;
  title: string;
  sections: TftAcademySection[];
  rawHtml: string;
};

export function parseTftAcademyPage(url: string, html: string): TftAcademyPage {
  const kind = classifyPage(url);
  const sections = kind === "comps" ? parseTierSections(html) : [];
  const title = stripTags(html).replace(/\s+/g, " ").trim().slice(0, 160);
  return { url, kind, title, sections, rawHtml: html };
}

function classifyPage(url: string): TftAcademyKind {
  if (url.endsWith("/tierlist/comps")) return "comps";
  if (url.endsWith("/tierlist/items")) return "items";
  if (url.endsWith("/tierlist/augments")) return "augments";
  return "new-set";
}

function parseTierSections(html: string): TftAcademySection[] {
  const sections: TftAcademySection[] = [];
  const sectionMatches = [
    ...html.matchAll(/id="([SAXBC])-tier-banner"[\s\S]*?>([SAXBC]) tier[\s\S]*?(?=id="[SAXBC]-tier-banner"|$)/gi),
    ...html.matchAll(/<span[^>]*>\s*([SAXBC])\s*Tier[^<]*<\/span>([\s\S]*?)(?=<span[^>]*>\s*[SAXBC]\s*Tier|$)/gi),
  ].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  for (const match of sectionMatches) {
    const tier = (match[1] === match[2] ? match[1] : match[1]).toUpperCase();
    const body = match[0];
    const cards: TftAcademyCard[] = [];
    for (const cardMatch of body.matchAll(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
      cards.push({
        href: cardMatch[1],
        imageUrls: [...cardMatch[2].matchAll(/<img[^>]+src="([^"]+)"/gi)].map((item) => item[1]),
        text: stripTags(cardMatch[2]).replace(/\s+/g, " ").trim(),
      });
    }
    sections.push({ tier, cards });
  }
  return sections;
}

function stripTags(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ");
}
