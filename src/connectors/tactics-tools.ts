import {
  buildExplorerUrl,
  normalizeExplorerPayload,
  type ExplorerPathInput,
  type ExplorerPayload,
  type ExplorerResult,
} from "../core/explorer.js";

export type ExplorerSnapshot = {
  status: "UNVERIFIED";
  url: string;
  payload: ExplorerPayload;
  metrics: ExplorerResult;
  retrievedAt: string;
  source: "tactics.tools-public-explorer-runtime";
};

export async function fetchExplorerSnapshot(
  fetchJson: (url: string) => Promise<unknown>,
  input: ExplorerPathInput,
  retrievedAt = new Date().toISOString(),
): Promise<ExplorerSnapshot> {
  const url = buildExplorerUrl(input);
  const payload = (await fetchJson(url)) as ExplorerPayload;
  return {
    status: "UNVERIFIED",
    url,
    payload,
    metrics: normalizeExplorerPayload(payload),
    retrievedAt,
    source: "tactics.tools-public-explorer-runtime",
  };
}
