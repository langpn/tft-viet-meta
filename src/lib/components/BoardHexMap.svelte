<script lang="ts">
  import HexAvatar from './HexAvatar.svelte';
  import { settingsStore } from '$lib/utils/settings-store.svelte';

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

<div class="w-full max-w-2xl mx-auto p-5 rounded-2xl bg-[#090C12] border border-white/10 shadow-2xl overflow-x-auto">
  <div class="text-xs font-black text-slate-400 mb-4 flex items-center justify-between">
    <span class="uppercase tracking-widest text-slate-300">VỊ TRÍ XẾP CỜ (28 Ô BÀN ĐẤU)</span>
    <span class="text-amber-400 font-bold text-xs">Hàng trước (Tank) ➔ Hàng sau (Carry)</span>
  </div>

  <div class="flex flex-col gap-2 min-w-[420px] select-none py-2 items-center justify-center">
    {#each rows as r}
      <div class="flex items-center justify-center gap-2 {r % 2 === 1 ? 'ml-8' : ''}">
        {#each cols as c}
          {@const pos = r * 7 + c}
          {@const unit = unitsByPosition.get(pos)}
          
          <div class="relative w-13 h-14 sm:w-14 sm:h-15 flex items-center justify-center">
            <!-- Empty Hex Cell Slot -->
            <div class="absolute inset-0 hex-clip bg-[#121622] border border-white/10 opacity-70"></div>
            
            <!-- Unit in Cell -->
            {#if unit}
              <div class="absolute inset-0 z-10 flex items-center justify-center">
                <HexAvatar 
                  id={unit.id}
                  name={unit.name}
                  nameVi={unit.nameVi}
                  iconUrl={unit.iconUrl}
                  cost={unit.cost}
                  starLevel={unit.starLevel}
                  items={unit.items}
                  showItems={true}
                  size="sm"
                  showName={settingsStore.showNames}
                />
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/each}
  </div>
</div>
