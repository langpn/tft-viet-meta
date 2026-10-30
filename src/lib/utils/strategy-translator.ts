/**
 * Advanced Vietnamese gamer localization for TFT Academy coaching guides, playstyles, and stage tips.
 */

import { COACHING_SENTENCE_DICT } from './coaching-dict.ts';

export function translatePlaystyle(style?: string): string {
  if (!style) return 'Tiêu Chuẩn';
  const s = style.toLowerCase();
  if (s.includes('fast 9')) return 'Lên Cấp 9 Nhanh';
  if (s.includes('fast 8') || s.includes('4-cost fast 8')) return 'Lên Cấp 8 Đánh 4 Vàng';
  if (s.includes('3-cost reroll')) return 'Reroll Tướng 3 Vàng';
  if (s.includes('2-cost reroll')) return 'Reroll Tướng 2 Vàng';
  if (s.includes('1-cost reroll')) return 'Reroll Tướng 1 Vàng';
  if (s.includes('reroll')) return 'Lối Chơi Reroll';
  if (s.includes('standard') || s.includes('tempo')) return 'Lối Chơi Tiêu Chuẩn';
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

const grammarPatterns: Array<[RegExp, string]> = [
  [/Only play from early win streak and lots of gold/gi, 'Chỉ nên chơi khi có chuỗi thắng sớm và lượng vàng dồi dào'],
  [/Because you are aiming for scaling 5 costs/gi, 'Vì đội hình hướng tới các tướng 5 vàng thăng tiến sức mạnh về late'],
  [/aim to level 9 around end of Stage 4 \/ beginning of Stage 5/gi, 'hãy đặt mục tiêu lên cấp 9 vào cuối Vòng 4 hoặc đầu Vòng 5'],
  [/Slam items aggressively and play for full win streak with/gi, 'Ghép trang bị sớm để giữ máu và đánh chuỗi thắng liên tục với'],
  [/Slam items aggressively and play for win streak with/gi, 'Ghép trang bị sớm và đánh chuỗi thắng với'],
  [/Slam items aggressively/gi, 'Ghép trang bị sớm để giữ máu'],
  [/play for full win streak/gi, 'đánh chuỗi thắng liên tục'],
  [/play for win streak/gi, 'đánh chuỗi thắng'],
  [/Ideal opener will be/gi, 'Khung khởi đầu lý tưởng là'],
  [/Continue prioritize win streaking/gi, 'Tiếp tục ưu tiên duy trì chuỗi thắng'],
  [/maintain win streak if needed/gi, 'giữ chuỗi thắng nếu cần'],
  [/If you have an econ augment, you can go Fast (\d+) \(before ([^)]+)\)/gi, 'Nếu có lõi kinh tế, bạn có thể lên cấp $1 nhanh (trước $2)'],
  [/You can start losing rounds while focusing on econ/gi, 'Có thể chấp nhận thua vài round để tập trung tích lũy lợi tức'],
  [/Fast 9 end of Stage 4 and look for the scaling 5 costs like/gi, 'Lên cấp 9 nhanh vào cuối Vòng 4 và tìm kiếm các tướng 5 vàng thăng tiến sức mạnh như'],
  [/Fast 9 by the beginning of Stage 5 and look for your 5 costs/gi, 'Lên cấp 9 nhanh vào đầu Vòng 5 và tìm kiếm các chủ lực 5 vàng hoàn thiện đội hình'],
  [/Fast 9/gi, 'Lên cấp 9 nhanh'],
  [/Fast 8/gi, 'Lên cấp 8 nhanh'],
  [/Fast 7/gi, 'Lên cấp 7 nhanh'],
  [/Cap the board with a (\w+) over (\w+) for end game/gi, 'Tối đa hóa sức mạnh đội hình bằng $1 thay cho $2 về cuối trận'],
  [/Always focus on unit quality over exact board units/gi, 'Luôn ưu tiên chất lượng sao của tướng trên sân hơn là cứng nhắc bám theo đúng form bài'],
  [/Try not to roll to 0g because we need gold to get to level (\d+)/gi, 'Tránh xả cạn về 0 vàng vì đội hình cần tích lũy kinh tế để lên cấp $1'],
  [/Position (him|her|them) on the weak side of the enemy so you can get jump resets quickly/gi, 'Xếp vị trí ở phía đội hình yếu hơn của đối thủ để nhanh chóng kích hoạt cơ chế reset nhảy'],
  [/3\* Riftbeasts are generally bait except for frontline/gi, 'Các tướng Quái Rừng 3 sao thường là cái bẫy tốn tiền, ngoại trừ dàn chắn tuyến đầu'],
  [/Aim to get (\d+) Riftbeast online latest by Stage ([^.]+)/gi, 'Đặt mục tiêu kích hoạt mốc $1 Quái Rừng muộn nhất vào round $2'],
  [/Use free Riftbeast shops to upgrade only instead of rerolling/gi, 'Tận dụng các lượt đổi cửa hàng Quái Rừng miễn phí để nâng cấp sao thay vì tiêu tiền roll'],
  [/Always play Elder Dragon when you hit/gi, 'Luôn đưa Elder Dragon vào sân ngay khi ra'],
  [/Once stable, go 9 for another 5 cost/gi, 'Khi đội hình đã ổn định, lên cấp 9 để kẹp thêm một tướng 5 vàng'],
  [/Look for 3 Blossom early and play for win streak/gi, 'Tìm mốc 3 Hoa Linh từ sớm và thi đấu xoay quanh chuỗi thắng'],
  [/Itemize (\w+) or any other 2\* tank/gi, 'Ghép trang bị thủ cho $1 hoặc bất kỳ tướng tank 2 sao nào'],
  [/Flex in more Spellweavers \+ frontline as you get them/gi, 'Kẹp thêm Thuật Sư và củng cố dàn chắn tuyến đầu khi bốc được'],
  [/You can tank all kinds of frontline: Juggernauts, Defenders, or Vanguards/gi, 'Có thể linh hoạt dùng nhiều dạng dàn chắn: Dũng Sĩ, Vệ Quân hoặc Tiên Phong'],
  [/Level and roll for (\w+), (\w+), and the 4 Spellweavers/gi, 'Lên cấp và roll tìm $1, $2 cùng mốc 4 Thuật Sư'],
  [/Play Cassio or LeBlanc until you find Alune/gi, 'Sử dụng tạm Cassiopeia hoặc LeBlanc cho đến khi tìm thấy Alune'],
  [/Can flex in Infernos over Lillia if needed/gi, 'Có thể kẹp thêm Hỏa Ngục thay thế cho Lillia nếu cần'],
  [/Mainly strong with Elderwood emblem/gi, 'Cực mạnh khi sở hữu Ấn Thần Rừng'],
  [/Look for Elderwood Lux/gi, 'Tìm kiếm biến thể Lux Thần Rừng'],
  [/3 Executioner is a big spike so always look to play around it if possible/gi, 'Mốc 3 Đao Phủ là ngưỡng gia tăng sức mạnh đột biến, hãy luôn ưu tiên kích hoạt mốc này nếu có thể'],
  [/Can also chase 9 Elderwood if you have Elderwood Lux/gi, 'Bạn cũng có thể hướng tới mốc tối thượng 9 Thần Rừng nếu có Lux Thần Rừng'],
  [/Open with upgraded Elderwood and slam items on/gi, 'Khởi đầu với Thần Rừng 2 sao và ghép đồ giữ máu cho'],
  [/LeBlanc can farm copies of units on your board so avoid fielding unwanted units/gi, 'LeBlanc có thể nhân bản các tướng trên sân, vì vậy tránh đưa vào sân các quân bài rác không mong muốn'],
  [/Add more Elderwood as you level with Spellweavers/gi, 'Bổ sung thêm Thần Rừng khi lên cấp cùng các tướng Thuật Sư'],
  [/If you start getting AD items, play them on Xayah \/ Rapidfires/gi, 'Nếu bắt đầu nhận được các món đồ STVL, hãy ghép cho Xayah hoặc các tướng Liên Kích'],
  [/Level to 8 and look for/gi, 'Lên cấp 8 và roll tìm'],
  [/Level to 7 and roll for/gi, 'Lên cấp 7 và roll tìm'],
  [/Level to 6 and roll for/gi, 'Lên cấp 6 và roll tìm'],
  [/Econ up and slow roll for 3\*/gi, 'Tích lũy lại kinh tế và slow roll ở 50 vàng để nâng cấp 3 sao'],
  [/slow roll for 3\*/gi, 'slow roll ở 50 vàng để nâng cấp 3 sao'],
  [/Add Gromp or a flex unit in at 8/gi, 'Bổ sung Gromp hoặc một tướng linh hoạt khi lên cấp 8'],
  [/You want around 70g\+ minimum for the rolldown/gi, 'Cần tích lũy tối thiểu khoảng 70 vàng trở lên trước khi xả tiền tìm tướng'],

  // Phrases & terms
  [/econ augment/gi, 'lõi kinh tế'],
  [/resource engine/gi, 'bộ khung farm tài nguyên'],
  [/scaling 5 costs/gi, 'các tướng 5 vàng thăng tiến sức mạnh'],
  [/5 costs/gi, 'tướng 5 vàng'],
  [/4 costs/gi, 'tướng 4 vàng'],
  [/3 costs/gi, 'tướng 3 vàng'],
  [/2 costs/gi, 'tướng 2 vàng'],
  [/1 costs/gi, 'tướng 1 vàng'],
  [/win streak/gi, 'chuỗi thắng'],
  [/lose streak/gi, 'chuỗi thua'],
  [/early game/gi, 'đầu trận'],
  [/mid game/gi, 'giữa trận'],
  [/late game|end game/gi, 'cuối trận'],
  [/frontline/gi, 'dàn chắn tuyến đầu'],
  [/backline/gi, 'tuyến sau'],
  [/flex unit/gi, 'tướng linh hoạt'],
  [/flex in/gi, 'kẹp thêm'],
  [/item priority/gi, 'ưu tiên trang bị'],
  [/rolldown|roll down/gi, 'xả tiền tìm tướng'],
  [/slow roll/gi, 'slow roll (đổi lại ở 50 vàng)'],
  [/reroll/gi, 'reroll'],
  [/opener/gi, 'khởi đầu'],
  [/Brawler emblem/gi, 'Ấn Đấu Sĩ'],
  [/Elderwood emblem/gi, 'Ấn Thần Rừng'],
  [/Artifact/gi, 'Tạo Tác'],
  [/emblem/gi, 'Ấn'],
  [/Spellweavers/gi, 'Thuật Sư'],
  [/Spellweaver/gi, 'Thuật Sư'],
  [/Executioners/gi, 'Đao Phủ'],
  [/Executioner/gi, 'Đao Phủ'],
  [/Juggernauts/gi, 'Dũng Sĩ'],
  [/Juggernaut/gi, 'Dũng Sĩ'],
  [/Defenders/gi, 'Vệ Quân'],
  [/Defender/gi, 'Vệ Quân'],
  [/Vanguards/gi, 'Tiên Phong'],
  [/Vanguard/gi, 'Tiên Phong'],
  [/Hunters/gi, 'Thợ Săn'],
  [/Hunter/gi, 'Thợ Săn'],
  [/Blossom/gi, 'Hoa Linh'],
  [/Adaptors/gi, 'Thích Ứng'],
  [/Adaptor/gi, 'Thích Ứng'],
  [/Riftbeasts/gi, 'Quái Rừng'],
  [/Riftbeast/gi, 'Quái Rừng'],
  [/Elderwood/gi, 'Thần Rừng'],
  [/Infernos/gi, 'Hỏa Ngục'],
  [/Inferno/gi, 'Hỏa Ngục'],
  [/Coven/gi, 'Tiên Hắc Ám'],
  [/Lunar/gi, 'Mặt Trăng'],
  [/Blackthorn/gi, 'Gai Đen'],
  [/Sprykin/gi, 'Tinh Nghịch'],
  [/Fae/gi, 'Tiên Linh'],
  [/Ravager/gi, 'Tàn Phá'],
  [/Rapidfires/gi, 'Liên Kích'],
  [/Rapidfire/gi, 'Liên Kích']
];

export function translateStrategyTip(tip?: string): string {
  if (!tip) return '';
  const trimmed = tip.trim();
  if (COACHING_SENTENCE_DICT[trimmed]) return COACHING_SENTENCE_DICT[trimmed];

  const sentences = trimmed.split(/(?<=[.!?])\s+/);
  return sentences.map((sent) => {
    const s = sent.trim();
    if (COACHING_SENTENCE_DICT[s]) return COACHING_SENTENCE_DICT[s];
    let res = s;
    for (const [re, rep] of grammarPatterns) {
      res = res.replace(re, rep);
    }
    return res;
  }).join(' ');
}
