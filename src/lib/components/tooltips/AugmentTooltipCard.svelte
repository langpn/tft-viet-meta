<script lang="ts">
  import { resolveAugmentIcon } from '$lib/utils/assets';

  interface Props {
    data: any;
  }

  let { data }: Props = $props();

  const iconSrc = $derived(resolveAugmentIcon(data?.icon, data?.id));
</script>

{#if data}
  <!-- Augment Tooltip (Exact Match to Image 4) -->
  <div class="w-80 sm:w-90 rounded-2xl bg-[#090C12] border-2 border-amber-400/50 p-4.5 shadow-2xl text-white flex flex-col gap-3 select-none animate-in fade-in zoom-in-95 duration-100">
    
    <!-- Top Row: Icon + Name -->
    <div class="flex items-center gap-3.5">
      <div class="w-12 h-12 rounded-xl bg-black border border-white/20 p-1 shrink-0 shadow-lg flex items-center justify-center">
        {#if iconSrc}
          <img 
            src={iconSrc} 
            alt={data.name_vi || data.name_en || ''} 
            class="w-full h-full object-contain" 
            loading="lazy"
            onerror={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              if (!target.dataset.triedBackup && data.id) {
                target.dataset.triedBackup = 'true';
                const clean = (data.id || '').replace(/^DA_/, '').replace(/^TFT_Augment_/, '').toLowerCase();
                target.src = `https://raw.communitydragon.org/latest/game/assets/maps/tft/icons/augments/hexcore/${clean}.png`;
              }
            }}
          />
        {/if}
      </div>

      <div class="flex flex-col overflow-hidden">
        <h3 class="text-base font-black text-white leading-tight truncate">
          {data.name_vi || data.name_en}
        </h3>
        {#if data.name_en && data.name_vi !== data.name_en}
          <span class="text-[11px] text-slate-400 truncate">({data.name_en})</span>
        {/if}
      </div>
    </div>

    <!-- Description -->
    {#if data.desc_vi || data.desc_en}
      <p class="text-xs text-slate-300 leading-relaxed font-normal border-t border-white/10 pt-2.5">
        {data.desc_vi || data.desc_en}
      </p>
    {/if}

    <!-- Rules / Tournament Subtitle (Matching Image 4) -->
    {#if data.subtitle_vi || data.subtitle_en}
      <span class="text-[11px] text-slate-400 italic">
        {data.subtitle_vi || data.subtitle_en}
      </span>
    {/if}

  </div>
{/if}
