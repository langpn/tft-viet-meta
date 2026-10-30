export function fnv1a(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return '{' + (hash >>> 0).toString(16).padStart(8, '0') + '}';
}

/**
 * Clean and interpolate TFT augment and item descriptions replacing @Variable@ placeholders with actual numbers from effects.
 */
export function interpolateDescription(
  desc: string | undefined | null,
  effects: Record<string, any> = {},
): string {
  if (!desc) return '';

  let res = desc.replace(/@([^@]+)@/g, (match, rawVar) => {
    const parts = rawVar.split('*');
    const varName = parts[0].trim();
    const multiplier = parts[1] ? parseFloat(parts[1]) : 1;

    let val = effects[varName];
    if (val === undefined) {
      const lower = Object.keys(effects).find(k => k.toLowerCase() === varName.toLowerCase());
      if (lower) val = effects[lower];
    }
    if (val === undefined) {
      val = effects[fnv1a(varName.toLowerCase())];
    }
    if (val === undefined) {
      val = effects[fnv1a(varName)];
    }

    if (val !== undefined && val !== null) {
      const num = Number(val) * multiplier;
      if (!isNaN(num)) {
        return Number(num.toFixed(2)).toString();
      }
      return String(val);
    }
    return '';
  });

  // Clean HTML tags and tournament references
  res = res
    .replace(/Tactician's Crown Thành Phố Công Nghệ,?\s*2025/gi, 'Vương Miện Chiến Thuật Gia - Thành Phố Công Nghệ 2025')
    .replace(/Chung Kết Thế Giới Thời Đại Công Nghệ,?\s*2022/gi, 'CKTG Thời Đại Công Nghệ 2022')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/?[a-z0-9_-]+[^>]*>/gi, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/%i:[a-zA-Z0-9]+%/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // If any unhandled @Word@ remains without effects, clean it up cleanly
  res = res.replace(/@([a-zA-Z0-9_]+)@/g, '$1');

  return res;
}
