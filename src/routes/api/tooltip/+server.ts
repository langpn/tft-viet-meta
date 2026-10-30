import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import tooltipDb from '$data/tooltip-db.json';

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

  const queryKeys = [
    id,
    normalizeId(id),
    id.replace(/^DA_18_/, '').replace(/^DA_/, '').replace(/18$/, ''),
    normalizeId(id.replace(/^DA_18_/, '').replace(/^DA_/, '').replace(/18$/, '')),
    name,
    normalizeId(name)
  ].filter(Boolean);

  let result: any = null;

  if (type === 'champion' || type === 'unit') {
    for (const k of queryKeys) {
      if (db.champions[k]) {
        result = db.champions[k];
        break;
      }
    }
  } else if (type === 'item') {
    for (const k of queryKeys) {
      if (db.items[k]) {
        result = db.items[k];
        break;
      }
    }
  } else if (type === 'augment') {
    for (const k of queryKeys) {
      if (db.augments[k]) {
        result = db.augments[k];
        break;
      }
    }
  } else if (type === 'trait') {
    for (const k of queryKeys) {
      if (db.traits[k]) {
        result = db.traits[k];
        break;
      }
    }
  } else {
    // Search across all
    for (const k of queryKeys) {
      if (db.champions[k]) { result = { ...db.champions[k], entityType: 'champion' }; break; }
      if (db.items[k]) { result = { ...db.items[k], entityType: 'item' }; break; }
      if (db.augments[k]) { result = { ...db.augments[k], entityType: 'augment' }; break; }
      if (db.traits[k]) { result = { ...db.traits[k], entityType: 'trait' }; break; }
    }
  }

  if (!result) {
    return json({ error: 'Tooltip not found', id, type }, { status: 404 });
  }

  return json(result, {
    headers: {
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800'
    }
  });
};
