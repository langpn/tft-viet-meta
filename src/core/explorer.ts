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

export function compareExplorerResults(
  source: ExplorerResult,
  local: ExplorerResult,
): ExplorerComparison {
  const mismatches = (Object.keys(source) as Array<keyof ExplorerResult>).filter(
    (key) => source[key] !== local[key],
  );
  return { status: mismatches.length === 0 ? "PASS" : "FAIL", mismatches };
}
