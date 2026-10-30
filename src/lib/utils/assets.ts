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
    const corrected = icon.replace('assets/maps/tft/icons/traits/trait_icon_18_', 'assets/ux/traiticons/trait_icon_18_');
    return `https://raw.communitydragon.org/latest/game/${corrected.toLowerCase()}`;
  }
  if (id) {
    const cleanId = id.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `https://raw.communitydragon.org/latest/game/assets/ux/traiticons/trait_icon_18_${cleanId}.png`;
  }
  return '';
}
