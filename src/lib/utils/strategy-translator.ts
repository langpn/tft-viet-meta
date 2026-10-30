/**
 * Vietnamese gamer terminology translator for TFT gameplay tips and playstyles.
 */

export function translatePlaystyle(style?: string): string {
  if (!style) return 'Tiêu Chuẩn';
  const s = style.toLowerCase();
  if (s.includes('fast 9')) return 'Lên Cấp 9 Nhanh';
  if (s.includes('fast 8') || s.includes('4-cost fast 8')) return 'Lên Cấp 8 Đánh 4 Vàng';
  if (s.includes('3-cost reroll')) return 'Reroll Tướng 3 Vàng';
  if (s.includes('2-cost reroll')) return 'Reroll Tướng 2 Vàng';
  if (s.includes('1-cost reroll')) return 'Reroll Tướng 1 Vàng';
  if (s.includes('reroll')) return 'Lối Chơi Reroll';
  if (s.includes('standard')) return 'Lối Chơi Tiêu Chuẩn';
  return style;
}

export function translateDifficulty(diff?: string): string {
  if (!diff) return '';
  const d = diff.toUpperCase();
  if (d === 'EASY') return 'DỄ';
  if (d === 'MEDIUM') return 'TRUNG BÌNH';
  if (d === 'HARD') return 'KHÓ';
  if (d === 'CONDITIONAL') return 'CẦN ĐIỀU KIỆN';
  return diff;
}

const phraseMap: Array<[RegExp, string]> = [
  [/slam items aggressively/gi, 'Ghép trang bị sớm để giữ máu'],
  [/play for full win streak/gi, 'đánh chuỗi thắng liên tục'],
  [/win streak/gi, 'chuỗi thắng'],
  [/lose streak/gi, 'chuỗi thua'],
  [/early game/gi, 'đầu trận'],
  [/mid game/gi, 'giữa trận'],
  [/end game|late game/gi, 'cuối trận'],
  [/level to 8/gi, 'Lên cấp 8'],
  [/level to 9/gi, 'Lên cấp 9'],
  [/aim to level 9/gi, 'hướng tới lên cấp 9'],
  [/focus on econ/gi, 'tập trung tích lũy lợi tức kinh tế'],
  [/rolldown|roll down/gi, 'xả tiền tìm tướng'],
  [/reroll/gi, 'reroll'],
  [/frontline/gi, 'dàn chắn tuyến đầu'],
  [/backline/gi, 'tuyến sau'],
  [/item priority/gi, 'ưu tiên trang bị'],
  [/items/gi, 'trang bị'],
  [/augments/gi, 'lõi công nghệ'],
  [/carry/gi, 'chủ lực'],
  [/tank/gi, 'chống chịu']
];

export function translateStrategyTip(tip?: string): string {
  if (!tip) return '';
  let text = tip;
  for (const [pattern, replacement] of phraseMap) {
    text = text.replace(pattern, replacement);
  }
  return text;
}
