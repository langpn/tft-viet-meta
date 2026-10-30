import { join } from "node:path";
import { buildOptionResponse, buildSearchResponse, fetchExplorerView, parseExplorerQuery } from "./api.js";
import { parseTftAcademyPage } from "../core/tft-academy-parser.js";
import { renderAcademyPage, renderExplorerPage, renderHome } from "./html.js";
import { loadState, statePath } from "./storage.js";

const root = process.cwd();
const state = await loadState(statePath(root));

function scopedPage(pathname: string) {
  const url = `https://tftacademy.com${pathname}`;
  const snapshot = state.sourceSnapshots.find((item) => item.url === url);
  return snapshot ? parseTftAcademyPage(url, snapshot.content) : undefined;
}

const server = Bun.serve({
  port: Number(process.env.PORT ?? 3000),
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return new Response(renderHome({ activePatch: state.activePatch, lastSyncAt: state.lastSyncAt, documents: state.searchDocuments, explorerSnapshots: state.explorerSnapshots }), { headers: { "content-type": "text/html; charset=utf-8" } });
    }
    if (url.pathname === "/tierlist/comps" || url.pathname === "/tierlist/items" || url.pathname === "/tierlist/augments" || url.pathname === "/learn/new-set") {
      const page = scopedPage(url.pathname);
      if (!page) return new Response("Scoped source snapshot is unavailable", { status: 503 });
      return new Response(renderAcademyPage(page, { activePatch: state.activePatch, lastSyncAt: state.lastSyncAt, documents: state.searchDocuments, explorerSnapshots: state.explorerSnapshots }), { headers: { "content-type": "text/html; charset=utf-8" } });
    }
    if (url.pathname === "/explorer") {
      return new Response(renderExplorerPage({ activePatch: state.activePatch, lastSyncAt: state.lastSyncAt, documents: state.searchDocuments, explorerSnapshots: state.explorerSnapshots }), { headers: { "content-type": "text/html; charset=utf-8" } });
    }
    if (url.pathname === "/api/search") {
      return Response.json(buildSearchResponse(state.searchDocuments, url.searchParams.get("q") ?? ""));
    }
    if (url.pathname === "/api/options") {
      return Response.json(buildOptionResponse(state.searchDocuments, url.searchParams.get("q") ?? "", (url.searchParams.get("type") as never) || undefined));
    }
    if (url.pathname === "/api/explorer") {
      try {
        return Response.json(await fetchExplorerView(parseExplorerQuery(url.searchParams)));
      } catch (error) {
        return Response.json({ status: "FAIL", error: error instanceof Error ? error.message : "Explorer source unavailable" }, { status: 502 });
      }
    }
    if (url.pathname === "/api/status") {
      return Response.json({ activePatch: state.activePatch, lastSyncAt: state.lastSyncAt, indexedDocuments: state.searchDocuments.length, sourceSnapshots: state.sourceSnapshots.length, explorerSnapshots: state.explorerSnapshots.length, explorerStatus: state.explorerSnapshots.at(-1)?.status ?? "UNVERIFIED", sourceDiff: state.sourceDiff, academyUpdateTrigger: state.academyUpdateTrigger });
    }
    if (url.pathname === "/healthz") return Response.json({ ok: true });

    return new Response("Not found", { status: 404 });
  },
});

console.log(`TFT Việt Meta listening on http://localhost:${server.port}`);
