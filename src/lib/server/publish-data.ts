import fs from 'node:fs';
import path from 'node:path';

export function jsonIfChanged(file: string, data: unknown): string | null {
  const stripTimestamp = (value: unknown) => {
    if (Array.isArray(value)) return value;
    const { updatedAt: _ignored, ...rest } = value as Record<string, unknown>;
    return rest;
  };
  if (fs.existsSync(file)) {
    const previous = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (JSON.stringify(stripTimestamp(previous)) === JSON.stringify(stripTimestamp(data))) return null;
  }
  return JSON.stringify(data, null, 2);
}

export function publishFiles(files: ReadonlyMap<string, string | Buffer>) {
  const staged: { target: string; dir: string; previous: boolean }[] = [];
  const published: typeof staged = [];
  const retained = new Set<string>();
  try {
    for (const [target, content] of files) {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      const dir = fs.mkdtempSync(path.join(path.dirname(target), '.meta-stage-'));
      const previous = fs.existsSync(target);
      staged.push({ target, dir, previous });
      fs.writeFileSync(path.join(dir, 'next'), content);
      if (previous) fs.linkSync(target, path.join(dir, 'previous'));
    }
    for (const entry of staged) {
      fs.renameSync(path.join(entry.dir, 'next'), entry.target);
      published.push(entry);
    }
  } catch (error) {
    const rollbackErrors: string[] = [];
    for (const { dir, target, previous } of published.reverse()) {
      try {
        if (previous) fs.renameSync(path.join(dir, 'previous'), target);
        else fs.unlinkSync(target);
      } catch (rollbackError) {
        retained.add(dir);
        rollbackErrors.push(`${target} (staged files in ${dir}): ${String(rollbackError)}`);
      }
    }
    if (rollbackErrors.length) throw new Error(`Publishing failed: ${String(error)}\nRollback incomplete:\n${rollbackErrors.join('\n')}`, { cause: error });
    throw error;
  } finally {
    for (const { dir } of staged) {
      if (!retained.has(dir)) fs.rmSync(dir, { recursive: true, force: true });
    }
  }
}
