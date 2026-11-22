import { normalizeExplorerPayload, type ExplorerPayload, type ExplorerQuery } from "../core/explorer.js";

type ExplorerRow = {
  id: string;
  games: number;
  averagePlacement: number;
  topFourRate: number;
  winRate: number;
  delta?: number;
};

export type ExplorerViewModel = {
  status: "UNVERIFIED";
  sourceUrl: string;
  query: ExplorerQuery;
  base: {
    games: number;
    averagePlacement: number;
    topFourRate: number;
    winRate: number;
  };
  sections: Record<"units" | "starUnits" | "traits" | "items" | "augments", ExplorerRow[]>;
};

export function buildExplorerResponse(
  query: ExplorerQuery,
  sourceUrl: string,
  payload: ExplorerPayload,
): ExplorerViewModel {
  const metrics = normalizeExplorerPayload(payload);
  return {
    status: "UNVERIFIED",
    sourceUrl,
    query,
    base: {
      games: metrics.games,
      averagePlacement: metrics.averagePlacement,
      topFourRate: metrics.topFourRate,
      winRate: payload.base!.won / payload.base!.count,
    },
    sections: {
      units: normalizeRows(payload.units),
      starUnits: normalizeRows(payload.star_units),
      traits: normalizeRows(payload.traits),
      items: normalizeRows(payload.items),
      augments: normalizeRows(payload.augments),
    },
  };
}

function normalizeRows(rows: unknown[] | undefined): ExplorerRow[] {
  return (rows ?? []).map((entry) => {
    const tuple = entry as unknown[];
    const id = String(tuple[0]);
    const values = tuple.at(-1) as { count: number; place: number; top4: number; won: number; delta?: number };
    return {
      id,
      games: values.count,
      averagePlacement: values.count > 0 ? values.place / values.count : 0,
      topFourRate: values.count > 0 ? values.top4 / values.count : 0,
      winRate: values.count > 0 ? values.won / values.count : 0,
      delta: values.delta,
    };
  });
}
