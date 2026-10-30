/**
 * Advanced Vietnamese gamer localization for TFT Academy coaching guides, playstyles, and stage tips.
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

// Regex replacements for full sentences and standard coaching phrases
const phraseRules: Array<[RegExp, string]> = [
  // Specific advice patterns
  [/\+1 tier in strength with Artifact or Brawler emblem/gi, '+1 bậc sức mạnh nếu có Tạo Tác hoặc Ấn Đấu Sĩ'],
  [/\+1 tier in strength with/gi, '+1 bậc sức mạnh nếu có'],
  [/Level 7 board is no Gromp/gi, 'Đội hình cấp 7 không dùng Cóc Thành Tinh'],
  [/VI 3 is stronger than Krug 3, but harder to hit because of Vi's popularity/gi, 'Vi 3 sao mạnh hơn Quái Đá Krug 3 sao, nhưng khó lên 3 sao hơn do nhiều nhà tranh Vi'],
  [/Item priority:\s*Master Yi\s*>\s*Tank\s*>\s*Kogmaw\s*>\s*Nidalee/gi, 'Thứ tự ưu tiên trang bị: Master Yi > Tướng Chống Chịu > Kog\'Maw > Nidalee'],
  [/Only take Phoenix Primal buff if ahead\.\s*Otherwise, Execute \/ Healing Primal/gi, 'Chỉ lấy bùa Phượng Hoàng nếu đang dẫn trước; nếu không hãy chọn Kết Liễu hoặc Hồi Máu'],
  
  // Stage patterns
  [/Ideally play around a Master Yi opener that can win streak/gi, 'Tối ưu khởi đầu xoay quanh Master Yi để giữ chuỗi thắng sớm'],
  [/Ideally play around a (\w+) opener that can win streak/gi, 'Tối ưu khởi đầu xoay quanh $1 để giữ chuỗi thắng sớm'],
  [/Blossom is very powerful to get early econ or item wisps/gi, 'Tộc Hoa Linh rất mạnh ở đầu trận để lấy vàng hoặc các mảnh trang bị Wisp từ sớm'],
  [/Add more Adaptors and frontline as you go/gi, 'Bổ sung thêm tướng Thích Ứng và củng cố dàn chắn phía trước'],
  [/Finish Yi items by end of stage/gi, 'Hoàn thành đủ 3 trang bị cho Master Yi trước khi kết thúc round 3'],
  [/Finish (\w+) items by end of stage/gi, 'Hoàn thành đủ trang bị cho $1 trước khi kết thúc round'],
  [/You can even play 5 Blossom for maximum Wisp greed if you highroll the 4 costs/gi, 'Có thể kích hoạt 5 Hoa Linh để tối đa hóa tài nguyên Wisp nếu may mắn ra sớm tướng 4 vàng'],
  [/Level to 7 and roll for Master Yi 2, Kogmaw 2, and a Juggernaut Tank/gi, 'Lên cấp 7 và roll tìm Master Yi 2 sao, Kog\'Maw 2 sao cùng dàn chắn Dũng Sĩ'],
  [/Econ up and slow roll for 3\*\.\s*Add Gromp or a flex unit in at 8/gi, 'Tích lũy lại kinh tế và slow roll ở 50 vàng để nâng cấp 3 sao. Bổ sung Cóc Thành Tinh hoặc tướng linh hoạt ở cấp 8'],
  
  // Common TFT Academy Patterns
  [/Only play from early win streak and lots of gold/gi, 'Chỉ nên chơi khi có chuỗi thắng sớm và lượng vàng dồi dào'],
  [/aim to level 9 around end of Stage 4 \/ beginning of Stage 5/gi, 'đặt mục tiêu lên cấp 9 vào cuối Vòng 4 hoặc đầu Vòng 5'],
  [/Best Draven quests are dealing damage for gold, but avoid the 10k damage in 1 round because you can get trapped/gi, 'Nhiệm vụ Draven tốt nhất là gây sát thương nhận vàng, nhưng tránh chọn mốc 10.000 sát thương trong 1 round vì dễ bị bẫy kẹt tiến độ'],
  [/Slam items aggressively and play for full win streak/gi, 'Ghép trang bị sớm để giữ máu và đánh chuỗi thắng liên tục'],
  [/Slam items aggressively/gi, 'Ghép trang bị sớm để giữ máu'],
  [/play for full win streak/gi, 'đánh chuỗi thắng liên tục'],
  [/Ideal opener will be/gi, 'Khung khởi đầu lý tưởng là'],
  [/Continue prioritize win streaking/gi, 'Tiếp tục ưu tiên duy trì chuỗi thắng'],
  [/maintain win streak if needed/gi, 'giữ chuỗi thắng nếu cần'],
  [/If you have an econ augment, you can go Fast 7 \(before 3-3\)/gi, 'Nếu có lõi kinh tế, bạn có thể lên cấp 7 sớm (trước 3-3)'],
  [/You can start losing rounds while focusing on econ/gi, 'Có thể chấp nhận thua vài round để tập trung tích lũy lợi tức'],
  [/Fast 9 end of Stage 4 and look for the scaling 5 costs/gi, 'Lên cấp 9 nhanh vào cuối Vòng 4 và tìm kiếm các tướng 5 vàng'],
  [/Cap the board with a (\w+) over (\w+) for end game/gi, 'Tối đa hóa sức mạnh đội hình bằng $1 thay cho $2 về cuối trận'],
  [/Always focus on unit quality over exact board units/gi, 'Luôn ưu tiên chất lượng sao của tướng hơn là cứng nhắc theo đúng form bài'],
  [/Try not to roll to 0g because we need gold to get to level (\d+)/gi, 'Tránh xả cạn về 0 vàng vì cần tích lũy kinh tế để lên cấp $1'],
  [/Position him on the weak side of the enemy so you can get jump resets quickly/gi, 'Xếp tướng ở phía bên yếu của đối thủ để nhanh chóng kích hoạt reset kỹ năng'],
  [/3\* Riftbeasts are generally bait except for frontline/gi, 'Tướng Quái Rừng 3 sao thường là cái bẫy, ngoại trừ dàn chắn'],
  [/Aim to get 7 Riftbeast online latest by Stage 3-5/gi, 'Hướng tới mốc 7 Quái Rừng muộn nhất vào round 3-5'],
  [/Use free Riftbeast shops to upgrade only instead of rerolling/gi, 'Tận dụng lượt đổi cửa hàng Quái Rừng miễn phí để nâng sao thay vì tiêu tiền roll'],
  [/Always play Elder Dragon when you hit/gi, 'Luôn đưa Rồng Ngàn Tuổi vào sân ngay khi ra'],
  [/Once stable, go 9 for another 5 cost/gi, 'Khi đội hình đã ổn định, lên cấp 9 để kẹp thêm tướng 5 vàng'],
  [/Look for 3 Blossom early and play for win streak/gi, 'Tìm mốc 3 Hoa Linh sớm và đánh giữ chuỗi thắng'],
  [/Karma can hold items for Ahri/gi, 'Karma có thể giữ trang bị hộ cho Ahri'],
  [/Itemize (\w+) or any other 2\* tank/gi, 'Ghép đồ chống chịu cho $1 hoặc bất kỳ tướng tank 2 sao nào'],
  [/Flex in more Spellweavers \+ frontline as you get them/gi, 'Kẹp thêm Thuật Sư và dàn chắn khi bốc được'],
  [/You can tank all kinds of frontline: Juggernauts, Defenders, or Vanguards/gi, 'Có thể linh hoạt dùng nhiều loại dàn chắn: Dũng Sĩ, Vệ Quân hoặc Tiên Phong'],
  [/Level and roll for (\w+), (\w+), and the 4 Spellweavers/gi, 'Lên cấp và roll tìm $1, $2 cùng mốc 4 Thuật Sư'],
  [/Can flex in Infernos over Lillia if needed/gi, 'Có thể kẹp thêm Hỏa Ngục thay cho Lillia nếu cần'],
  [/Mainly strong with Elderwood emblem/gi, 'Cực mạnh khi có Ấn Thần Rừng'],
  [/Look for Elderwood Lux/gi, 'Tìm kiếm Lux Thần Rừng'],
  [/3 Executioner is a big spike so always look to play around it if possible/gi, 'Mốc 3 Đao Phủ là ngưỡng sức mạnh rất lớn, hãy ưu tiên kích hoạt'],
  [/Can also chase 9 Elderwood if you have/gi, 'Có thể hướng tới mốc 9 Thần Rừng nếu có'],
  [/Open with upgraded Elderwood and slam items on/gi, 'Khởi đầu với Thần Rừng 2 sao và ghép trang bị cho'],
  [/Add more Elderwood as you level with Spellweavers/gi, 'Bổ sung thêm Thần Rừng khi lên cấp cùng các tướng Thuật Sư'],
  [/Level to 8 and look for/gi, 'Lên cấp 8 và tìm kiếm'],
  
  // Terms & generic vocab
  [/econ augment/gi, 'lõi kinh tế'],
  [/win streak/gi, 'chuỗi thắng'],
  [/lose streak/gi, 'chuỗi thua'],
  [/early game/gi, 'đầu trận'],
  [/mid game/gi, 'giữa trận'],
  [/late game|end game/gi, 'cuối trận'],
  [/Fast 9/gi, 'Lên cấp 9 nhanh'],
  [/Fast 8/gi, 'Lên cấp 8 nhanh'],
  [/Fast 7/gi, 'Lên cấp 7 nhanh'],
  [/frontline/gi, 'dàn chắn tuyến đầu'],
  [/backline/gi, 'tuyến sau'],
  [/Item priority:/gi, 'Thứ tự ưu tiên trang bị:'],
  [/item priority/gi, 'ưu tiên trang bị'],
  [/items/gi, 'trang bị'],
  [/augments/gi, 'lõi công nghệ'],
  [/carry/gi, 'chủ lực'],
  [/tank/gi, 'chống chịu'],
  [/rolldown|roll down/gi, 'xả tiền tìm tướng'],
  [/slow roll/gi, 'slow roll (đổi lại ở 50 vàng)'],
  [/reroll/gi, 'reroll (đổi lại)'],
  [/opener/gi, 'khởi đầu'],
  [/Resource engine/gi, 'bộ khung farm tài nguyên'],
  [/Resource/gi, 'tài nguyên'],
  [/scaling 5 costs/gi, 'các tướng 5 vàng thăng tiến sức mạnh'],
  [/5 costs/gi, 'tướng 5 vàng'],
  [/4 costs/gi, 'tướng 4 vàng'],
  [/3 costs/gi, 'tướng 3 vàng'],
  [/2 costs/gi, 'tướng 2 vàng'],
  [/1 costs/gi, 'tướng 1 vàng'],
  [/flex unit/gi, 'tướng linh hoạt'],
  [/flex in/gi, 'kẹp thêm'],
  [/Brawler emblem/gi, 'Ấn Đấu Sĩ'],
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
  let text = tip;
  for (const [pattern, replacement] of phraseRules) {
    text = text.replace(pattern, replacement);
  }
  return text;
}
