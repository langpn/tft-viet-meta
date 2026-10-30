import { join } from "node:path";
import { saveState, loadState, statePath } from "./storage.js";
import { runSync } from "./sync.js";
import { syncExitCode } from "./cli-policy.js";
import { fetchJsonResponse } from "./http.js";

const root = process.cwd();
const command = process.argv[2];

if (command === "sync") {
  const target = process.argv[3] ?? "all";
  if (target !== "all" && target !== "tft-academy" && target !== "riot-localization") {
    console.error(`Unsupported sync target: ${target}`);
    process.exit(1);
  }
  const previousState = await loadState(statePath(root));
  const result = await runSync({
    fetchText: async (url) => (await fetch(url)).text(),
    fetchJson: async <T>(url: string) => fetchJsonResponse<T>(url, await fetch(url)),
  }, new Date().toISOString(), previousState);
  await saveState(statePath(root), result.state);
  console.log(JSON.stringify({ ...result.report, target, snapshot: join("data", "state.json") }, null, 2));
  process.exit(syncExitCode(result.report));
}

if (command === "verify") {
  const target = process.argv[3] ?? "all";
  const state = await loadState(statePath(root));
  console.log(JSON.stringify({ status: "UNVERIFIED", target, indexedDocuments: state.searchDocuments.length, sourceSnapshots: state.sourceSnapshots.length }, null, 2));
  process.exit(2);
}

console.error("Usage: bun run src/server/cli.ts <sync|verify> [all|tft-academy|tactics-explorer|riot-localization]");
process.exit(1);
