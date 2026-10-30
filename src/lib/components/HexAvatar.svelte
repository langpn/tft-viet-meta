<script lang="ts">
  import { resolveChampionIcon, resolveItemIcon } from '$lib/utils/assets';

  interface Item {
    id?: string;
    name_vi?: string;
    name_en?: string;
    icon?: string;
  }

  interface Props {
    id?: string;
    name?: string;
    nameVi?: string;
    iconUrl?: string;
    cost?: number;
    starLevel?: number;
    items?: Item[];
    trend?: 'Rising' | 'Falling' | 'New' | null;
    emblemIcon?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showName?: boolean;
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
    items = [],
    trend = null,
    emblemIcon = '',
    size = 'md',
    showName = false,
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

  const costTextColors: Record<number, string> = {
    0: 'text-slate-400',
    1: 'text-slate-200',
    2: 'text-emerald-400',
    3: 'text-sky-400',
    4: 'text-fuchsia-400',
    5: 'text-amber-400'
  };

  // Increased sizes for high visual impact & readability
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28'
  };

  // Substantially enlarged item icons for crisp recognition
  const itemSizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
    xl: 'w-8 h-8'
  };

  const resolvedSrc = $derived(resolveChampionIcon(iconUrl, id));
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div 
  class="flex flex-col items-center group relative cursor-pointer select-none transition-transform duration-200 {isSelected ? 'scale-110' : 'hover:scale-105'}"
  {onclick}
>
  <!-- Hexagon Container -->
  <div class="relative {sizeClasses[size]} flex items-center justify-center">
    
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

    <!-- Trend Badge (Rising green arrow, Falling red arrow, New yellow badge) -->
    {#if trend === 'Rising'}
      <div class="absolute -top-1.5 -left-1.5 z-30 w-5 h-5 rounded-full bg-emerald-500 border-2 border-black flex items-center justify-center shadow-lg">
        <svg class="w-3 h-3 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4">
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
      </div>
    {:else if trend === 'Falling'}
      <div class="absolute -top-1.5 -left-1.5 z-30 w-5 h-5 rounded-full bg-rose-500 border-2 border-black flex items-center justify-center shadow-lg">
        <svg class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    {:else if trend === 'New'}
      <div class="absolute -top-1.5 -left-1.5 z-30 w-5 h-5 rounded-full bg-amber-400 border-2 border-black flex items-center justify-center shadow-lg text-[10px] font-black text-black">
        +
      </div>
    {/if}

    <!-- Emblem Badge (if equipped with a trait emblem like Elderwood) -->
    {#if emblemIcon}
      <div class="absolute -top-2 -right-2 z-30 w-6 h-6 rounded-lg bg-black/95 border border-amber-400/90 p-0.5 shadow-xl">
        <img src={resolveItemIcon(emblemIcon)} alt="" class="w-full h-full object-contain" />
      </div>
    {/if}

    <!-- Star Level Indicator -->
    {#if starLevel > 1}
      <div class="absolute -top-1.5 z-20 flex gap-0.5 px-1.5 py-0.5 rounded-full bg-black/90 border border-amber-400/40 shadow text-[10px] font-black text-amber-300">
        {#each Array(starLevel) as _}
          <span>★</span>
        {/each}
      </div>
    {/if}
  </div>

  <!-- 3 Equipped Items under Hexagon (Significantly enlarged) -->
  {#if items && items.length > 0}
    <div class="flex items-center gap-1 -mt-3 z-30">
      {#each items.slice(0, 3) as item}
        {@const itemSrc = resolveItemIcon(item.icon, item.id)}
        <div 
          class="{itemSizeClasses[size]} rounded-md border-1.5 border-amber-400/90 bg-black overflow-hidden shadow-lg shadow-black hover:scale-125 transition-transform"
          title={item.name_vi || item.name_en}
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
    <span class="mt-1.5 text-xs font-bold tracking-tight text-center max-w-[88px] leading-tight line-clamp-2 {costTextColors[cost] ?? 'text-slate-200'}">
      {nameVi}
    </span>
  {/if}
</div>
