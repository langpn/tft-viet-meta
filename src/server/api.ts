import { searchDocuments, type SearchDocument } from "../core/search.js";
import type { ExplorerQuery } from "../core/explorer.js";
import { buildExplorerUrl } from "../core/explorer.js";
import { fetchJsonResponse } from "./http.js";
import { buildExplorerResponse } from "./explorer-api.js";

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

export function buildOptionResponse(documents: SearchDocument[], query: string, entityType?: SearchDocument["entityType"]) {
  const response = buildSearchResponse(documents, query);
  return {
    ...response,
    results: response.results.filter((item) => !entityType || item.entityType === entityType).slice(0, 12),
  };
}

export async function fetchExplorerView(query: ExplorerQuery) {
  const patchId = query.patch === "18.5c" ? "16212" : "16212";
  const rankGroup = query.rank === "gm_plus" ? 4 : query.rank === "master_plus" ? 0 : 1;
  const sourceUrl = buildExplorerUrl({ patchId, rankGroup, query });
  const payload = await fetchJsonResponse<unknown>(sourceUrl, await fetch(sourceUrl));
  return buildExplorerResponse(query, sourceUrl, payload as never);
}
