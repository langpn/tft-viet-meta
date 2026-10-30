/**
 * Asset resolution helper for TFT Academy and CommunityDragon official assets.
 */

export function resolveChampionIcon(icon?: string, id?: string): string {
  if (icon && icon.startsWith('http')) return icon;
  if (icon && icon.startsWith('assets/')) {
    return `https://raw.communitydragon.org/latest/game/${icon.toLowerCase()}`;
  }
  if (id) {
    return `https://assets.tftacademy.com/champions/champion_icons/${id}.webp`;
  }
  return '';
}

export function resolveItemIcon(icon?: string, id?: string): string {
  if (icon && icon.startsWith('http')) return icon;
  if (icon && icon.startsWith('assets/')) {
    return `https://raw.communitydragon.org/latest/game/${icon.toLowerCase()}`;
  }
  if (id) {
    return `https://assets.tftacademy.com/items/${id}.webp`;
  }
  return '';
}

export function resolveAugmentIcon(icon?: string, id?: string): string {
  if (icon && icon.startsWith('http')) return icon;
  if (icon && icon.startsWith('assets/')) {
    return `https://raw.communitydragon.org/latest/game/${icon.toLowerCase()}`;
  }
  if (id) {
    return `https://assets.tftacademy.com/augments/${id}.webp`;
  }
  return '';
}

export function resolveTraitIcon(icon?: string, id?: string): string {
  if (icon && icon.startsWith('http')) return icon;
  if (icon && icon.startsWith('assets/')) {
    return `https://raw.communitydragon.org/latest/game/${icon.toLowerCase()}`;
  }
  if (id) {
    return `https://assets.tftacademy.com/traits/${id}.webp`;
  }
  return '';
}
