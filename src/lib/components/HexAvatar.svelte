<script lang="ts">
  import { resolveChampionIcon, resolveItemIcon, resolveAugmentIcon } from '$lib/utils/assets';
  import { showTooltip, hideTooltip } from '$lib/utils/tooltip-store.svelte';

  export interface Item {
    id?: string;
    name_vi?: string;
    name_en?: string;
    icon?: string;
  }

  export interface CoreBadge {
    type?: 'item' | 'augment';
    id: string;
    name_vi?: string;
    name_en?: string;
    icon: string;
  }

  export interface PredecessorUnit {
    id?: string;
    name?: string;
    nameVi?: string;
    iconUrl?: string;
    icon?: string;
    cost?: number;
  }

  interface Props {
    id?: string;
    name?: string;
    nameVi?: string;
    iconUrl?: string;
    cost?: number;
    starLevel?: number;
    showStars?: boolean;
    items?: Item[];
    trend?: 'Rising' | 'Falling' | 'New' | null;
    sticker?: number;
    situationalTier?: 'S' | 'A' | 'B' | 'C' | null;
    coreBadges?: CoreBadge[];
    predecessor?: PredecessorUnit | null;
    emblemIcon?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showName?: boolean;
    showItems?: boolean;
    isSelected?: boolean;
    onclick?: () => void;
  }

  let {
    id = '',
    name = '',
    nameVi = name,
    iconUrl = '',
    cost = 1,
    starLevel = 1,
    showStars = false,
    items = [],
    trend = null,
    sticker = 0,
    situationalTier = null,
    coreBadges = [],
    predecessor = null,
    emblemIcon = '',
    size = 'md',
    showName = false,
    showItems = false,
    isSelected = false,
    onclick
  }: Props = $props();

  const costBorderColors: Record<number, string> = {
    0: 'bg-slate-600',
    1: 'bg-slate-400',
    2: 'bg-emerald-500',
    3: 'bg-sky-500',
    4: 'bg-fuchsia-500',
    5: 'bg-amber-400'
  };

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28'
  };

  const itemSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5.5 h-5.5',
    lg: 'w-7 h-7',
    xl: 'w-8 h-8'
  };

  const resolvedSrc = $derived(resolveChampionIcon(iconUrl, id));

  function resolveBadgeIcon(badge: CoreBadge): string {
    if (badge.type === 'augment') {
      return resolveAugmentIcon(badge.icon, badge.id);
    }
    return resolveItemIcon(badge.icon, badge.id);
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div 
  class="flex flex-col items-center group relative cursor-pointer select-none transition-transform duration-200 {isSelected ? 'scale-110' : 'hover:scale-105'}"
  {onclick}
>
  <!-- Hexagon Container -->
  <div 
    class="relative {sizeClasses[size]} flex items-center justify-center"
    onmouseenter={(e) => showTooltip({ type: 'champion', id, name: nameVi || name }, e.currentTarget)}
    onmouseleave={() => hideTooltip()}
  >
    
    <!-- Outer Hexagon Border with Cost Color (or Gold Glow if Selected) -->
    <div class="absolute inset-0 hex-border {isSelected ? 'bg-amber-400 shadow-xl shadow-amber-400/60 ring-2 ring-white/60' : costBorderColors[cost] ?? 'bg-slate-500'} opacity-95 transition-all"></div>

    <!-- Inner Hexagon Background & Champion Image -->
    <div class="absolute inset-[3px] hex-clip bg-[#0D111A] overflow-hidden">
      {#if resolvedSrc}
        <img 
          src={resolvedSrc} 
          alt={nameVi || name} 
          class="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-300"
          loading="lazy"
          onerror={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            if (!target.dataset.triedBackup) {
              target.dataset.triedBackup = 'true';
              if (id) {
                target.src = `https://assets.tftacademy.com/champions/champion_icons/${id}.webp`;
              }
            }
          }}
        />
      {:else}
        <div class="w-full h-full flex items-center justify-center font-black text-xs text-slate-400">
          {(nameVi || name || '').slice(0, 2)}
        </div>
      {/if}
    </div>

    <!-- Top-Left Predecessor Unit Badge (For Flex Units replacing another unit, matching Screenshot 2) -->
    {#if predecessor}
      <div 
        class="absolute -top-1.5 -left-2.5 z-30 w-6 h-6 flex items-center justify-center filter drop-shadow-md cursor-pointer hover:scale-125 transition-transform"
        onmouseenter={(e) => { e.stopPropagation(); showTooltip({ type: 'champion', id: predecessor.id, name: predecessor.nameVi || predecessor.name }, e.currentTarget); }}
        onmouseleave={() => hideTooltip()}
        title="Thay thế cho: {predecessor.nameVi || predecessor.name}"
        role="button"
        tabindex="0"
      >
        <div class="absolute inset-0 hex-border {costBorderColors[predecessor.cost || 1] ?? 'bg-slate-500'} opacity-95"></div>
        <div class="absolute inset-[1.5px] hex-clip bg-[#0D111A] overflow-hidden">
          {#if predecessor.iconUrl || predecessor.icon}
            <img 
              src={resolveChampionIcon(predecessor.iconUrl || predecessor.icon, predecessor.id)} 
              alt={predecessor.nameVi || predecessor.name} 
              class="w-full h-full object-cover scale-110" 
              loading="lazy" 
            />
          {:else}
            <div class="w-full h-full flex items-center justify-center font-black text-[8px] text-slate-300">
              {(predecessor.nameVi || predecessor.name || '').slice(0, 1)}
            </div>
          {/if}
        </div>
      </div>
    {:else if situationalTier}
      <!-- Situational tier badge matching Image 2 row 5 -->
      <div 
        class="absolute -top-1.5 -left-1.5 z-30 w-5 h-5 rounded-md border-2 border-black flex items-center justify-center font-black text-[11px] shadow-lg
        {situationalTier === 'S' ? 'bg-[#FE3E4B] text-white' : 
         situationalTier === 'A' ? 'bg-[#FF9C00] text-black' : 
         situationalTier === 'B' ? 'bg-[#FFDD00] text-black' : 
         'bg-[#63FC0D] text-black'}"
        title="Bậc gốc: {situationalTier} Tier"
      >
        {situationalTier}
      </div>
    {:else if trend === 'Rising' || sticker === 2}
      <div class="absolute -top-1.5 -left-1.5 z-30 w-5 h-5 rounded-full bg-emerald-500 border-2 border-black flex items-center justify-center shadow-lg" title="Rising Trend">
        <svg class="w-3 h-3 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4">
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
      </div>
    {:else if trend === 'Falling' || sticker === 3}
      <div class="absolute -top-1.5 -left-1.5 z-30 w-5 h-5 rounded-full bg-rose-500 border-2 border-black flex items-center justify-center shadow-lg" title="Falling Trend">
        <svg class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    {:else if trend === 'New' || sticker === 1}
      <div class="absolute -top-1.5 -left-1.5 z-30 w-5 h-5 rounded-full bg-amber-400 border-2 border-black flex items-center justify-center shadow-lg text-[10px] font-black text-black" title="New Comp">
        +
      </div>
    {/if}

    <!-- Single Emblem Icon (legacy fallback) -->
    {#if emblemIcon && (!coreBadges || coreBadges.length === 0)}
      <div class="absolute -bottom-2 z-30 w-6 h-6 rounded-md bg-black/95 border-2 border-amber-400/90 p-0.5 shadow-xl">
        <img src={resolveItemIcon(emblemIcon)} alt="" class="w-full h-full object-contain" />
      </div>
    {/if}

    <!-- Core Items / Emblems / Augments at bottom of hexagon (Matching Screenshot 2 exactly!) -->
    {#if coreBadges && coreBadges.length > 0}
      <div class="absolute -bottom-2.5 z-30 flex items-center justify-center gap-1">
        {#each coreBadges as badge}
          {@const bSrc = resolveBadgeIcon(badge)}
          <div 
            class="w-6 h-6 rounded-md bg-[#0A0D14] border-2 border-white/20 hover:border-amber-400 p-0.5 shadow-xl shadow-black flex items-center justify-center transition-all hover:scale-125 cursor-pointer"
            onmouseenter={(e) => { e.stopPropagation(); showTooltip({ type: badge.type || 'item', id: badge.id, name: badge.name_vi }, e.currentTarget); }}
            onmouseleave={() => hideTooltip()}
          >
            {#if bSrc}
              <img src={bSrc} alt="" class="w-full h-full object-contain rounded-xs" loading="lazy" />
            {/if}
          </div>
        {/each}
      </div>
    {/if}

    <!-- Star Level Indicator (Only shown when explicitly requested, NEVER on tier shelf) -->
    {#if showStars && starLevel > 1}
      <div class="absolute -top-1.5 z-20 flex gap-0.5 px-1.5 py-0.5 rounded-full bg-black/90 border border-amber-400/40 shadow text-[10px] font-black text-amber-300">
        {#each Array(starLevel) as _}
          <span>★</span>
        {/each}
      </div>
    {/if}
  </div>

  <!-- 3 Equipped Items under Hexagon (Only shown when showItems is true, e.g. in Modal or Board) -->
  {#if showItems && items && items.length > 0}
    <div class="flex items-center gap-0.5 -mt-2 z-30">
      {#each items.slice(0, 3) as item}
        {@const itemSrc = resolveItemIcon(item.icon, item.id)}
        <div 
          class="{itemSizeClasses[size]} rounded bg-black border border-amber-400/80 overflow-hidden shadow-md shadow-black hover:scale-125 transition-transform cursor-pointer shrink-0"
          onmouseenter={(e) => { e.stopPropagation(); showTooltip({ type: 'item', id: item.id || '', name: item.name_vi }, e.currentTarget); }}
          onmouseleave={() => hideTooltip()}
        >
          {#if itemSrc}
            <img 
              src={itemSrc} 
              alt={item.name_vi || ''} 
              class="w-full h-full object-cover"
              loading="lazy"
            />
          {:else}
            <div class="w-full h-full bg-amber-500/20"></div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}

  <!-- Champion Name Below (Wrap gracefully without truncation) -->
  {#if showName}
    <span class="mt-2 text-xs font-bold text-center leading-tight max-w-[80px] break-words text-slate-200 group-hover:text-amber-400 transition-colors">
      {nameVi || name}
    </span>
  {/if}
</div>
