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
  status: "PASS";
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
    status: "PASS",
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
    const [id, values] = entry as [string, { count: number; place: number; top4: number; won: number; delta?: number }];
    return {
      id,
      games: values.count,
      averagePlacement: values.place / values.count,
      topFourRate: values.top4 / values.count,
      winRate: values.won / values.count,
      delta: values.delta,
    };
  });
}
