import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import tooltipDb from '$data/tooltip-db.json';
import manifest from '$data/meta-manifest.json';

const db = tooltipDb as {
  champions: Record<string, any>;
  items: Record<string, any>;
  augments: Record<string, any>;
  traits: Record<string, any>;
};

function normalizeId(id: string): string {
  return id.toLowerCase().trim();
}

export const GET: RequestHandler = async ({ url }) => {
  const type = (url.searchParams.get('type') || '').toLowerCase();
  const id = url.searchParams.get('id') || '';
  const name = url.searchParams.get('name') || '';
  if (id.length > 160 || name.length > 160 || type.length > 24) {
    return json({ error: 'Truy vấn tooltip quá dài' }, { status: 400 });
  }

  const queryKeys = [
    id,
    normalizeId(id),
    id.replace(/^DA_18_/, '').replace(/^DA_/, '').replace(/18$/, ''),
    normalizeId(id.replace(/^DA_18_/, '').replace(/^DA_/, '').replace(/18$/, '')),
    name,
    normalizeId(name)
  ].filter(Boolean);

  const categories = [
    ['champion', db.champions], ['item', db.items], ['augment', db.augments], ['trait', db.traits],
  ] as const;
  const requestedType = type === 'unit' ? 'champion' : type;
  const requested = categories.find(([entityType]) => entityType === requestedType);
  for (const key of queryKeys) {
    for (const [entityType, entries] of requested ? [requested] : categories) {
      if (!Object.hasOwn(entries, key)) continue;
      const payload = requested ? entries[key] : { ...entries[key], entityType };
      return json(payload, {
        headers: { 'Cache-Control': 'public, max-age=300', 'X-TFT-Patch': manifest.patch }
      });
    }
  }
  return json({ error: 'Tooltip not found', id, type }, { status: 404 });
};
