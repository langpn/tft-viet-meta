import type { SearchDocument } from "../core/search.js";

type DataDragonRecord = {
  id: string;
  name: string;
  description?: string;
  tier?: number | string;
  image?: { full?: string };
};

export type DataDragonDataset = {
  type: string;
  version: string;
  data: Record<string, DataDragonRecord>;
};

export type RiotCatalogOptions = {
  version: string;
  locale: string;
};

const DATA_DRAGON_FILES: Record<"champion" | "item" | "trait" | "augment", string> = {
  champion: "tft-champion.json",
  item: "tft-item.json",
  trait: "tft-trait.json",
  augment: "tft-augments.json",
};

export function normalizeDataDragonCatalog(
  english: DataDragonDataset,
  localized: DataDragonDataset | null,
  options: RiotCatalogOptions,
): SearchDocument[] {
  return Object.values(english.data).map((record) => {
    const localizedRecord = localized?.data[record.id];
    const titleVi = localizedRecord?.name ?? record.name;
    return {
      id: record.id,
      entityType: inferEntityType(english.type),
      titleVi,
      titleEn: record.name,
      aliases: [record.name, titleVi],
      patch: options.version,
      source: "riot-data-dragon",
      locale: options.locale,
      verifiedAgainstLocale: Boolean(localizedRecord),
      iconUrl: record.image?.full,
      descriptionEn: record.description,
      descriptionVi: localizedRecord?.description ?? record.description,
    } as SearchDocument;
  });
}

export async function fetchDataDragonDataset(
  fetchJson: <T>(url: string) => Promise<T>,
  version: string,
  locale: string,
  kind: "champion" | "item" | "trait" | "augment",
): Promise<DataDragonDataset> {
  const url = `https://ddragon.leagueoflegends.com/cdn/${version}/data/${locale}/${DATA_DRAGON_FILES[kind]}`;
  return fetchJson<DataDragonDataset>(url);
}

function inferEntityType(type: string): SearchDocument["entityType"] {
  if (type.includes("champion")) return "unit";
  if (type.includes("item")) return "item";
  if (type.includes("trait")) return "trait";
  if (type.includes("augment")) return "augment";
  throw new Error(`Unsupported Data Dragon type: ${type}`);
}
