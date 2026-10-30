<script lang="ts">
  import HexAvatar from './HexAvatar.svelte';

  interface BoardUnit {
    id: string;
    name: string;
    nameVi?: string;
    iconUrl?: string;
    cost?: number;
    starLevel?: number;
    position: number; // 0..27 (row = Math.floor(pos / 7), col = pos % 7)
    items?: Array<{ name_vi?: string; name_en?: string; icon?: string }>;
  }

  interface Props {
    units: BoardUnit[];
  }

  let { units = [] }: Props = $props();

  // Create a map of pos -> unit
  const unitsByPosition = $derived.by(() => {
    const map = new Map<number, BoardUnit>();
    for (const u of units) {
      map.set(u.position, u);
    }
    return map;
  });

  const rows = [0, 1, 2, 3];
  const cols = [0, 1, 2, 3, 4, 5, 6];
</script>

<div class="w-full max-w-xl mx-auto p-4 rounded-2xl bg-[#0B0D14] border border-white/10 shadow-2xl overflow-x-auto">
  <div class="text-xs font-bold text-slate-400 mb-3 flex items-center justify-between">
    <span class="uppercase tracking-wider">Vị Trí Xếp Cờ (28 Ô Bàn Đấu)</span>
    <span class="text-amber-400 text-[11px]">Hàng trước (Tank) ➔ Hàng sau (Carry)</span>
  </div>

  <div class="flex flex-col gap-1.5 min-w-[340px] select-none py-2">
    {#each rows as r}
      <div class="flex items-center justify-center gap-1.5 {r % 2 === 1 ? 'ml-6' : ''}">
        {#each cols as c}
          {@const pos = r * 7 + c}
          {@const unit = unitsByPosition.get(pos)}
          
          <div class="relative w-11 h-12 flex items-center justify-center">
            <!-- Empty Hex Cell Slot -->
            <div class="absolute inset-0 hex-clip bg-[#141923] border border-white/5 opacity-60"></div>
            
            <!-- Unit in Cell -->
            {#if unit}
              <div class="absolute inset-0 z-10 flex items-center justify-center">
                <HexAvatar 
                  name={unit.name}
                  nameVi={unit.nameVi}
                  iconUrl={unit.iconUrl}
                  cost={unit.cost}
                  starLevel={unit.starLevel}
                  items={unit.items}
                  size="sm"
                />
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/each}
  </div>
</div>
