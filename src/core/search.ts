import { normalizeVietnamese } from "./localization.js";

export type SearchDocument = {
  id: string;
  entityType: "unit" | "item" | "trait" | "augment" | "comp" | "guide";
  titleVi: string;
  titleEn: string;
  aliases: string[];
  patch: string;
  source?: string;
  locale?: string;
  verifiedAgainstLocale?: boolean;
  iconUrl?: string;
  descriptionEn?: string;
  descriptionVi?: string;
};

export type SearchOptions = {
  entityType?: SearchDocument["entityType"];
};

export function searchDocuments(
  documents: SearchDocument[],
  query: string,
  options: SearchOptions = {},
): SearchDocument[] {
  const normalizedQuery = normalizeVietnamese(query);
  return documents
    .filter((document) => !options.entityType || document.entityType === options.entityType)
    .map((document) => {
      const terms = [document.titleVi, document.titleEn, ...document.aliases].map(
        normalizeVietnamese,
      );
      const exact = terms.some((term) => term === normalizedQuery);
      const prefix = terms.some((term) => term.startsWith(normalizedQuery));
      const fuzzy = terms.some((term) => term.includes(normalizedQuery));
      return { document, score: exact ? 3 : prefix ? 2 : fuzzy ? 1 : 0 };
    })
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)
    .map(({ document }) => document);
}
