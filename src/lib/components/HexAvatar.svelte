<script lang="ts">
  interface Item {
    name_vi?: string;
    name_en?: string;
    icon?: string;
  }

  interface Props {
    name?: string;
    nameVi?: string;
    iconUrl?: string;
    cost?: number;
    starLevel?: number;
    items?: Item[];
    size?: 'sm' | 'md' | 'lg';
    showName?: boolean;
  }

  let {
    name = '',
    nameVi = name,
    iconUrl = '',
    cost = 1,
    starLevel = 2,
    items = [],
    size = 'md',
    showName = false
  }: Props = $props();

  const costBorderColors: Record<number, string> = {
    1: 'bg-slate-500',
    2: 'bg-emerald-500',
    3: 'bg-sky-500',
    4: 'bg-fuchsia-500',
    5: 'bg-amber-400'
  };

  const costTextColors: Record<number, string> = {
    1: 'text-slate-400',
    2: 'text-emerald-400',
    3: 'text-sky-400',
    4: 'text-fuchsia-400',
    5: 'text-amber-400'
  };

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-18 h-18'
  };

  const itemSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };
</script>

<div class="flex flex-col items-center group relative cursor-pointer">
  <!-- Hexagon Container -->
  <div class="relative {sizeClasses[size]} flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
    
    <!-- Outer Hexagon Border with Cost Color -->
    <div class="absolute inset-0 hex-border {costBorderColors[cost] ?? 'bg-slate-500'} opacity-90 transition-opacity group-hover:opacity-100"></div>

    <!-- Inner Hexagon Background & Image -->
    <div class="absolute inset-[2px] hex-clip bg-[#12161E] overflow-hidden">
      {#if iconUrl}
        <img 
          src={iconUrl.startsWith('http') ? iconUrl : `https://assets.tftacademy.com/champions/champion_icons/${iconUrl}`} 
          alt={nameVi} 
          class="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-300"
          loading="lazy"
          onerror={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            if (!target.dataset.triedFallback) {
              target.dataset.triedFallback = 'true';
              target.src = `https://ddragon.leagueoflegends.com/cdn/16.21.1/img/champion/${name}.png`;
            }
          }}
        />
      {:else}
        <div class="w-full h-full flex items-center justify-center font-bold text-xs text-slate-400">
          {(name || nameVi || '').slice(0, 2)}
        </div>
      {/if}
    </div>

    <!-- Star level indicator -->
    {#if starLevel > 1}
      <div class="absolute -top-1 z-10 flex gap-0.5 px-1 py-0.2 rounded-full bg-black/80 backdrop-blur-sm shadow text-[9px] font-black text-amber-300">
        {#each Array(starLevel) as _}
          <span>★</span>
        {/each}
      </div>
    {/if}
  </div>

  <!-- 3 Equipped Items under Hexagon -->
  {#if items && items.length > 0}
    <div class="flex items-center gap-0.5 -mt-2 z-20">
      {#each items.slice(0, 3) as item}
        <div 
          class="{itemSizeClasses[size]} rounded border border-amber-400/60 bg-black/90 overflow-hidden shadow-md shadow-black/80 hover:scale-125 transition-transform"
          title={item.name_vi || item.name_en}
        >
          {#if item.icon}
            <img 
              src={item.icon.startsWith('http') ? item.icon : `https://assets.tftacademy.com/items/${item.icon}`} 
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

  <!-- Champion Name (Optional) -->
  {#if showName}
    <span class="mt-1 text-[11px] font-bold tracking-tight truncate max-w-[70px] {costTextColors[cost] ?? 'text-slate-300'}">
      {nameVi}
    </span>
  {/if}
</div>
