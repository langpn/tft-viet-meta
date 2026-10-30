import { syncAcademyData } from '../src/lib/server/academy-sync.js';
import { execSync } from 'node:child_process';

console.log('[AutoSync] 1/2 Fetching latest meta from TFT Academy (Comps, Items, Augments, Set Info)...');
await syncAcademyData();

console.log('[AutoSync] 2/2 Rebuilding Tooltip DB with latest assets...');
execSync('bun scripts/build-tooltip-db.ts', { stdio: 'inherit' });

console.log('[AutoSync] Done! All datasets synchronized.');
