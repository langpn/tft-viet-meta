import type { ParsedAcademyComp } from './academy-sync.js';
import { validateTranslation } from '../../core/localization.js';

export type CoachingGuide = Pick<ParsedAcademyComp, 'id' | 'tips' | 'augmentsTip' | 'augmentsTip_en'>;

export function applyCoachingTranslations(comps: ParsedAcademyComp[], translations: CoachingGuide[], reviewed: CoachingGuide[] = []) {
  if (!Array.isArray(reviewed)) throw new Error('Reviewed coaching must be an array of guides');
  const byGuide = new Map<string, CoachingGuide>();
  for (const guide of translations) byGuide.set(guide.id, guide);
  const reviewedIds = new Set<string>();
  for (const guide of reviewed) {
    if (!guide?.id || reviewedIds.has(guide.id) || !Array.isArray(guide.tips) || typeof guide.augmentsTip !== 'string' ||
        typeof guide.augmentsTip_en !== 'string' ||
        guide.tips.some((tip) => typeof tip?.stage !== 'string' || typeof tip.tip !== 'string' || typeof tip.tip_en !== 'string')) {
      throw new Error('Reviewed coaching must have a unique guide ID and bilingual tips');
    }
    for (const { tip_en, tip } of [...guide.tips, { tip_en: guide.augmentsTip_en, tip: guide.augmentsTip }]) {
      if (!validateTranslation(tip_en!, tip).ok) throw new Error(`Reviewed coaching changed numeric values for guide ${guide.id}`);
    }
    reviewedIds.add(guide.id);
    const previous = byGuide.get(guide.id);
    byGuide.set(guide.id, {
      id: guide.id,
      tips: [...(previous?.tips ?? []), ...guide.tips],
      augmentsTip: guide.augmentsTip_en ? guide.augmentsTip : previous?.augmentsTip ?? '',
      augmentsTip_en: guide.augmentsTip_en || previous?.augmentsTip_en,
    });
  }
  const missing: string[] = [];
  for (const comp of comps) {
    const previous = byGuide.get(comp.id);
    const tipMap = new Map(previous?.tips.filter((tip) => tip.tip_en && tip.tip.trim())
      .map((tip) => [JSON.stringify([tip.stage, tip.tip_en?.trim()]), tip.tip]));
    for (const tip of comp.tips) {
      const original = tip.tip.trim();
      if (!original) continue;
      const translation = tipMap.get(JSON.stringify([tip.stage, original]));
      if (translation) {
        tip.tip_en = tip.tip;
        tip.tip = translation;
      } else {
        missing.push(`${comp.id} ${tip.stage}: ${original}`);
      }
    }
    const original = comp.augmentsTip.trim();
    if (!original) continue;
    if (previous?.augmentsTip_en?.trim() === original && previous.augmentsTip.trim()) {
      comp.augmentsTip_en = comp.augmentsTip;
      comp.augmentsTip = previous.augmentsTip;
    } else {
      missing.push(`${comp.id} augmentsTip: ${original}`);
    }
  }
  if (missing.length) throw new Error(`Missing Vietnamese coaching (${missing.length}):\n${missing.join('\n')}`);
}
