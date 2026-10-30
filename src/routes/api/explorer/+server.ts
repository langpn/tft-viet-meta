import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getChampionVi, getItemVi, getTraitVi, getAugmentVi } from '$lib/server/dictionary';

export const GET: RequestHandler = async ({ url }) => {
  const patch = url.searchParams.get('patch') || '16212';
  const rank = url.searchParams.get('rank') || '1';
  const tokens = url.searchParams.get('tokens') || '';

  const apiUrl = tokens 
    ? `https://d3.tft.tools/explorer-data/${patch}/${rank}/${tokens}`
    : `https://d3.tft.tools/explorer-data/${patch}/${rank}/0`;

  try {
    const res = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      return json({ error: `tactics.tools returned HTTP ${res.status}` }, { status: res.status });
    }

    const data: any = await res.json();
    const base = data.base || { count: 0, place: 0, top4: 0, won: 0 };
    const games = base.count || 1;

    // Normalize units
    const units = (data.units || []).map(([id, stats]: [string, any]) => {
      const entity = getChampionVi(id);
      return {
        id,
        nameVi: entity?.name_vi || id,
        nameEn: entity?.name_en || id,
        icon: entity?.icon || '',
        cost: entity?.cost || 1,
        games: stats.count,
        pickRate: stats.count / games,
        avgPlace: stats.place / stats.count,
        top4Rate: stats.top4 / stats.count,
        winRate: stats.won / stats.count,
        delta: stats.delta ?? 0
      };
    });

    // Normalize items
    const items = (data.items || []).map(([unitId, itemId, stats]: [string, string, any]) => {
      const unit = getChampionVi(unitId);
      const item = getItemVi(itemId);
      return {
        unitId,
        unitName: unit?.name_vi || unitId,
        itemId,
        nameVi: item?.name_vi || itemId,
        nameEn: item?.name_en || itemId,
        icon: item?.icon || '',
        games: stats.count,
        avgPlace: stats.place / stats.count,
        top4Rate: stats.top4 / stats.count,
        winRate: stats.won / stats.count,
        delta: stats.delta ?? 0
      };
    });

    // Normalize traits
    const traits = (data.traits || []).map(([traitId, tier, stats]: [string, number, any]) => {
      const trait = getTraitVi(traitId);
      return {
        id: traitId,
        tier,
        nameVi: trait?.name_vi || traitId,
        nameEn: trait?.name_en || traitId,
        icon: trait?.icon || '',
        games: stats.count,
        avgPlace: stats.place / stats.count,
        top4Rate: stats.top4 / stats.count,
        winRate: stats.won / stats.count,
        delta: stats.delta ?? 0
      };
    });

    // Normalize augments
    const augments = (data.augments || []).map(([augmentId, stats]: [string, any]) => {
      const aug = getAugmentVi(augmentId);
      return {
        id: augmentId,
        nameVi: aug?.name_vi || augmentId,
        nameEn: aug?.name_en || augmentId,
        icon: aug?.icon || '',
        games: stats.count,
        avgPlace: stats.place / stats.count,
        top4Rate: stats.top4 / stats.count,
        winRate: stats.won / stats.count,
        delta: stats.delta ?? 0
      };
    });

    return json({
      patch,
      rank,
      sourceUrl: apiUrl,
      summary: {
        games: base.count,
        avgPlace: base.count > 0 ? base.place / base.count : 0,
        top4Rate: base.count > 0 ? base.top4 / base.count : 0,
        winRate: base.count > 0 ? base.won / base.count : 0
      },
      units,
      items,
      traits,
      augments
    });

  } catch (err: any) {
    return json({ error: err.message || 'Failed to query tactics.tools explorer' }, { status: 500 });
  }
};
