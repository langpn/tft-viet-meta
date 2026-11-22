import fs from 'node:fs';
import path from 'node:path';
import manifest from '../src/lib/data/meta-manifest.json';
import type { ParsedAcademyComp, Set18Info } from '../src/lib/server/academy-sync.js';
import { publishFiles } from '../src/lib/server/publish-data.js';

type SeasonSummary = Pick<Set18Info, 'set' | 'setName' | 'patch'> & {
  champions: readonly unknown[];
  traits: readonly unknown[];
  augments: readonly unknown[];
};

export function generateLlmsText(comps: ParsedAcademyComp[], newSet: SeasonSummary) {
  const origin = 'https://tft.langpn.xyz';
  const compUrl = (comp: ParsedAcademyComp) => `${origin}/tierlist/comps?comp=${encodeURIComponent(comp.slug || comp.id)}`;
  const llms = `# TFT Academy Việt Nam (tft.langpn.xyz)

> Cẩm nang Đấu Trường Chân Lý bằng tiếng Việt. Bảng xếp hạng lấy từ TFT Academy. Explorer lấy thống kê Mùa ${manifest.set} từ tactics.tools.

## Bộ dữ liệu đang phục vụ
- ĐTCL Mùa ${newSet.set} (${newSet.setName})${newSet.patch ? `, bản ${newSet.patch}` : ''}
- ${comps.length} đội hình, ${newSet.champions.length} tướng, ${newSet.traits.length} tộc hệ và ${newSet.augments.length} lõi trong cẩm nang

## Các trang chính
- [Bảng xếp hạng đội hình](${origin}/tierlist/comps)
- [Bảng xếp hạng trang bị](${origin}/tierlist/items)
- [Bảng xếp hạng lõi nâng cấp](${origin}/tierlist/augments)
- [Thống kê Explorer Mùa ${manifest.set}](${origin}/explorer)
- [Thông tin Mùa ${newSet.set}](${origin}/learn/new-set)
- [Đội hình Mùa 19 PBE](${origin}/tierlist/comps?set=19)
- [Danh sách chi tiết](${origin}/llms-full.txt)

## Đội hình bậc S và A
${comps.filter((comp) => ['S', 'A'].includes(comp.tier) || comp.situationalTier === 'S')
  .map((comp) => `- [${comp.title.trim()}](${compUrl(comp)}) (${comp.situationalTier === 'S' ? 'S tình huống' : comp.tier})`).join('\n')}
`;
  const detail = comps.map((comp) => `### [${comp.tier}] ${comp.title.trim()}
- Link ${compUrl(comp)}
- Tướng gánh chính ${comp.mainCarry.name_vi || comp.mainCarry.name_en} (${comp.mainCarry.items.map((item) => item.name_vi || item.name_en).join(', ') || 'chưa có trang bị'})
- Tướng chống chịu ${comp.mainTank.name_vi || comp.mainTank.name_en} (${comp.mainTank.items.map((item) => item.name_vi || item.name_en).join(', ') || 'chưa có trang bị'})
- Lối chơi ${comp.compStyle} (${comp.difficulty})`).join('\n\n');
  return { llms, full: `${llms}\n## Danh sách ${comps.length} đội hình\n\n${detail}\n` };
}

if (import.meta.main) {
  const { comps, patch } = JSON.parse(fs.readFileSync('src/lib/data/academy-live.json', 'utf8'));
  const learning = JSON.parse(fs.readFileSync('src/lib/data/academy-new-set.json', 'utf8'));
  const { llms, full } = generateLlmsText(comps, { ...learning, patch });
  publishFiles(new Map([[path.resolve('static/llms.txt'), llms], [path.resolve('static/llms-full.txt'), full]]));
}
