import fs from 'node:fs';
import path from 'node:path';
import manifest from '../src/lib/data/meta-manifest.json';
import type { ParsedAcademyComp, Set18Info } from '../src/lib/server/academy-sync.js';
import { publishFiles } from '../src/lib/server/publish-data.js';

export function generateLlmsText(comps: ParsedAcademyComp[], newSet: Set18Info) {
  const origin = 'https://tft.langpn.xyz';
  const compUrl = (comp: ParsedAcademyComp) => `${origin}/tierlist/comps?comp=${encodeURIComponent(comp.slug || comp.id)}&set=${newSet.set}`;
  const llms = `# TFT Academy Việt Nam (tft.langpn.xyz)

> Cẩm nang Đấu Trường Chân Lý bằng tiếng Việt. Nội dung lấy từ TFT Academy. Mùa ${newSet.set} dùng bản địa hóa MetaTFT khi có. Explorer lấy thống kê Mùa ${manifest.set} từ tactics.tools.

## Bộ dữ liệu đang phục vụ
- ĐTCL Mùa ${newSet.set} (${newSet.setName})${newSet.patch ? `, bản ${newSet.patch}` : ''}
- ${comps.length} đội hình, ${newSet.champions.length} tướng, ${newSet.traits.length} tộc hệ và ${newSet.augments.length} lõi trong cẩm nang

## Các trang chính
- [Bảng xếp hạng đội hình](${origin}/tierlist/comps)
- [Bảng xếp hạng trang bị](${origin}/tierlist/items)
- [Bảng xếp hạng lõi nâng cấp](${origin}/tierlist/augments)
- [Thống kê Explorer Mùa ${manifest.set}](${origin}/explorer)
- [Thông tin Mùa ${newSet.set}](${origin}/learn/new-set)
- [Đội hình lưu trữ Mùa ${manifest.set}](${origin}/tierlist/comps?set=${manifest.set})
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
  const { comps, learning } = JSON.parse(fs.readFileSync('src/lib/data/academy-set19.json', 'utf8'));
  const { llms, full } = generateLlmsText(comps, learning);
  publishFiles(new Map([[path.resolve('static/llms.txt'), llms], [path.resolve('static/llms-full.txt'), full]]));
}
