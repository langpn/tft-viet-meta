import { join } from "node:path";
import { buildSearchResponse, parseExplorerQuery } from "./api.js";
import { renderExplorer, renderHome } from "./html.js";
import { loadState, statePath } from "./storage.js";

const root = process.cwd();
const state = await loadState(statePath(root));

const server = Bun.serve({
  port: Number(process.env.PORT ?? 3000),
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return new Response(renderHome({ activePatch: state.activePatch, lastSyncAt: state.lastSyncAt, documents: state.searchDocuments }), { headers: { "content-type": "text/html; charset=utf-8" } });
    }
    if (url.pathname === "/explorer") {
      return new Response(renderExplorer(), { headers: { "content-type": "text/html; charset=utf-8" } });
    }
    if (url.pathname === "/api/search") {
      return Response.json(buildSearchResponse(state.searchDocuments, url.searchParams.get("q") ?? ""));
    }
    if (url.pathname === "/api/explorer") {
      return Response.json({ query: parseExplorerQuery(url.searchParams), status: "UNVERIFIED", source: "local-explorer-contract", results: [] });
    }
    if (url.pathname === "/api/status") {
      return Response.json({ activePatch: state.activePatch, lastSyncAt: state.lastSyncAt, indexedDocuments: state.searchDocuments.length, sourceSnapshots: state.sourceSnapshots.length });
    }
    if (url.pathname === "/healthz") return Response.json({ ok: true });

    return new Response("Not found", { status: 404 });
  },
});

console.log(`TFT Việt Meta listening on http://localhost:${server.port}`);
