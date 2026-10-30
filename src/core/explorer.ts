import { createHash } from "node:crypto";

export type ExplorerQuery = {
  patch?: string;
  set?: string;
  region?: string;
  rank?: string;
  queue?: string;
  timeRange?: string;
  placement?: string;
  units?: string[];
  traits?: string[];
  items?: string[];
  augments?: string[];
  include?: string[];
  exclude?: string[];
};

export type ExplorerResult = {
  averagePlacement: number;
  topFourRate: number;
  games: number;
};

export type ExplorerComparison = {
  status: "PASS" | "FAIL";
  mismatches: string[];
};

export type ExplorerPathInput = {
  patchId: string;
  rankGroup: number;
  query: ExplorerQuery;
};

export type ExplorerPayload = {
  base?: { count: number; place: number; top4: number; won: number };
  units?: unknown[];
  star_units?: unknown[];
  traits?: unknown[];
  augments?: unknown[];
  items?: unknown[];
};

const arrayKeys = [
  "units",
  "traits",
  "items",
  "augments",
  "include",
  "exclude",
] as const;

export function normalizeExplorerQuery(query: ExplorerQuery): ExplorerQuery {
  const normalized: ExplorerQuery = {};
  for (const key of Object.keys(query).sort()) {
    const value = query[key as keyof ExplorerQuery];
    if (value === undefined) continue;
    if (arrayKeys.includes(key as (typeof arrayKeys)[number])) {
      normalized[key as (typeof arrayKeys)[number]] = [...(value as string[])].sort();
    } else {
      normalized[key as keyof ExplorerQuery] = value as never;
    }
  }
  return normalized;
}

export function queryHash(query: ExplorerQuery): string {
  return createHash("sha256")
    .update(JSON.stringify(normalizeExplorerQuery(query)))
    .digest("hex");
}

export function buildExplorerUrl(input: ExplorerPathInput): string {
  const segments: string[] = [];
  for (const unit of input.query.units ?? []) segments.push(`u-${unit}-0`);
  for (const trait of input.query.traits ?? []) segments.push(`t-${trait}-1`);
  for (const item of input.query.items ?? []) {
    segments.push(item.startsWith("i-") ? item : `i-${item}`);
  }
  for (const augment of input.query.augments ?? []) {
    segments.push(augment.startsWith("a-") ? augment : `a-${augment}`);
  }
  return `https://d3.tft.tools/explorer-data/${input.patchId}/${input.rankGroup}/${segments.join("/")}`;
}

export function normalizeExplorerPayload(payload: ExplorerPayload): ExplorerResult {
  if (!payload.base) throw new Error("Explorer payload missing base aggregate");
  if (payload.base.count <= 0) throw new Error("Explorer payload base aggregate is empty");
  return {
    averagePlacement: payload.base.place / payload.base.count,
    topFourRate: payload.base.top4 / payload.base.count,
    games: payload.base.count,
  };
}

export function compareExplorerResults(
  source: ExplorerResult,
  local: ExplorerResult,
): ExplorerComparison {
  const mismatches = (Object.keys(source) as Array<keyof ExplorerResult>).filter(
    (key) => source[key] !== local[key],
  );
  return { status: mismatches.length === 0 ? "PASS" : "FAIL", mismatches };
}
