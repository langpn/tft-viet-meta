import type { PageServerLoad } from './$types';
import { getChampionVi, getItemVi, getTraitVi, getAugmentVi } from '$lib/server/dictionary';

export const load: PageServerLoad = async ({ fetch, url }) => {
  const patch = '16212';
  const rank = '1';
  const apiUrl = `https://d3.tft.tools/explorer-data/${patch}/${rank}/0`;

  try {
    const res = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      return { initialData: null };
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
        pickRate: games > 0 ? stats.count / games : 0,
        avgPlace: stats.count > 0 ? stats.place / stats.count : 0,
        top4Rate: stats.count > 0 ? stats.top4 / stats.count : 0,
        winRate: stats.count > 0 ? stats.won / stats.count : 0,
        delta: stats.delta ?? 0
      };
    });

    // Normalize star_units
    const starUnits = (data.star_units || []).map(([id, star, stats]: [string, number, any]) => {
      const entity = getChampionVi(id);
      return {
        id,
        star,
        nameVi: entity?.name_vi || id,
        nameEn: entity?.name_en || id,
        icon: entity?.icon || '',
        cost: entity?.cost || 1,
        games: stats.count,
        pickRate: games > 0 ? stats.count / games : 0,
        avgPlace: stats.count > 0 ? stats.place / stats.count : 0,
        top4Rate: stats.count > 0 ? stats.top4 / stats.count : 0,
        winRate: stats.count > 0 ? stats.won / stats.count : 0,
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
        avgPlace: stats.count > 0 ? stats.place / stats.count : 0,
        top4Rate: stats.count > 0 ? stats.top4 / stats.count : 0,
        winRate: stats.count > 0 ? stats.won / stats.count : 0,
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
        pickRate: games > 0 ? stats.count / games : 0,
        avgPlace: stats.count > 0 ? stats.place / stats.count : 0,
        top4Rate: stats.count > 0 ? stats.top4 / stats.count : 0,
        winRate: stats.count > 0 ? stats.won / stats.count : 0,
        delta: stats.delta ?? 0
      };
    });

    return {
      initialData: {
        patch,
        rank,
        summary: {
          games: base.count,
          avgPlace: base.count > 0 ? base.place / base.count : 0,
          top4Rate: base.count > 0 ? base.top4 / base.count : 0,
          winRate: base.count > 0 ? base.won / base.count : 0
        },
        units,
        starUnits,
        items,
        traits
      },
      initialTab: (url.searchParams.get('tab') === 'traits' || url.searchParams.get('tab') === 'items') ? url.searchParams.get('tab') : 'units'
    };
  } catch (e: any) {
    console.error('[/explorer/+page.server.ts] Error:', e?.message || e);
    return { 
      initialData: null,
      initialTab: 'units'
    };
  }
};
