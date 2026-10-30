import { searchDocuments, type SearchDocument } from "../core/search.js";
import type { ExplorerQuery } from "../core/explorer.js";

const arrayKeys = ["units", "traits", "items", "augments", "include", "exclude"] as const;

export function parseExplorerQuery(params: URLSearchParams): ExplorerQuery {
  const query: ExplorerQuery = {};
  const scalarKeys = ["patch", "set", "region", "rank", "queue", "timeRange", "placement"] as const;

  for (const key of scalarKeys) {
    const value = params.get(key);
    if (value) query[key] = value;
  }

  for (const key of arrayKeys) {
    const values = params.getAll(key);
    if (values.length > 0) query[key] = values;
  }

  return query;
}

export function buildSearchResponse(documents: SearchDocument[], query: string) {
  return {
    query,
    source: "local-canonical-index",
    results: searchDocuments(documents, query).map((document) => ({
      ...document,
      source: "local-canonical-index",
    })),
  };
}
