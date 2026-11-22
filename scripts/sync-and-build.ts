import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import manifest from '../src/lib/data/meta-manifest.json';
import { syncAcademyData } from '../src/lib/server/academy-sync.js';
import type { CoachingGuide } from '../src/lib/server/coaching-localization.js';
import { publishFiles } from '../src/lib/server/publish-data.js';
import { sha256 } from '../src/lib/server/source-fetch.js';
import { verifyCandidateMeta, verifyExplorerParity, verifyMetaFiles } from './verify-meta.js';

const previousDataDir = path.resolve('src/lib/data');
const manifestPath = path.join(previousDataDir, 'meta-manifest.json');
const priorManifest = fs.readFileSync(manifestPath);
const stage = fs.mkdtempSync(path.join(os.tmpdir(), 'tft-meta-'));

try {
  const args = process.argv.slice(2);
  if (args.length && (args.length !== 2 || args[0] !== '--coaching')) {
    throw new Error('Usage: bun run sync [--coaching <reviewed-translations.json>]');
  }
  const coachingTranslations: CoachingGuide[] | undefined = args[1] ? JSON.parse(fs.readFileSync(args[1], 'utf8')) : undefined;
  const explorerFixtures = verifyExplorerParity();
  verifyMetaFiles(manifest.files, (file) => fs.readFileSync(file));
  for (const file of Object.keys(manifest.files)) fs.copyFileSync(file, path.join(stage, path.basename(file)));
  const sources: { url: string; sha256: string }[] = [];
  await syncAcademyData({ dataDir: stage, previousDataDir, coachingTranslations, onSource: (source) => sources.push(source) });
  execFileSync(process.execPath, ['scripts/build-tooltip-db.ts', stage], { stdio: 'inherit' });
  sources.push(...JSON.parse(fs.readFileSync(path.join(stage, 'tooltip-sources.json'), 'utf8')));
  execFileSync(process.execPath, ['scripts/apply-official-vi.ts', stage], { stdio: 'inherit' });
  sources.sort((a, b) => a.url.localeCompare(b.url));

  const candidates = new Map(Object.keys(manifest.files).map((file) => [file, fs.readFileSync(path.join(stage, path.basename(file)))]));
  verifyCandidateMeta((file) => candidates.get(file)!);
  const files = Object.fromEntries([...candidates].map(([file, content]) => [file, sha256(content)]));
  const changes = new Map([...candidates].filter(([file, bytes]) => !fs.existsSync(file) || !fs.readFileSync(file).equals(bytes)));
  if (changes.size || manifest.sources.some((source) => source.sha256 === null)) {
    const dataChanged = Object.keys(files).some((file) => changes.has(file));
    const updatedAt = dataChanged ? new Date().toISOString() : manifest.updatedAt;
    changes.set(manifestPath, Buffer.from(`${JSON.stringify({ ...manifest, files, sources, updatedAt }, null, 2)}\n`));
    const lockPath = path.join(previousDataDir, '.meta-publish-lock');
    try {
      fs.mkdirSync(lockPath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'EEXIST') throw new Error(`Publication lock exists: ${lockPath}. See README for recovery.`, { cause: error });
      throw error;
    }
    try {
      fs.writeFileSync(path.join(lockPath, 'owner.json'), JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() }));
      if (!fs.readFileSync(manifestPath).equals(priorManifest)) throw new Error('The published manifest changed during sync. Retry with the new data.');
      verifyMetaFiles(manifest.files, (file) => fs.readFileSync(file));
      publishFiles(changes);
    } finally {
      fs.rmSync(lockPath, { recursive: true, force: true });
    }
  }
  console.log(JSON.stringify({ status: 'PASS', set: manifest.set, patch: manifest.patch, explorerFixtures, changedFiles: changes.size }));
} catch (error) {
  console.error('[AutoSync]', error instanceof Error ? error.message : error);
  process.exitCode = 2;
} finally {
  fs.rmSync(stage, { recursive: true, force: true });
}
