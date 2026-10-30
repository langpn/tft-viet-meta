<script lang="ts">
  import { resolveTraitIcon } from '$lib/utils/assets';

  interface Props {
    data: any;
  }

  let { data }: Props = $props();

  const iconSrc = $derived(resolveTraitIcon(data?.icon, data?.name_en));
</script>

{#if data}
  <!-- Trait Tooltip -->
  <div class="w-80 sm:w-90 rounded-2xl bg-[#090C12] border-2 border-white/20 p-4 shadow-2xl text-white flex flex-col gap-3 select-none animate-in fade-in zoom-in-95 duration-100">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-black border border-white/10 p-1 shrink-0 flex items-center justify-center shadow">
        {#if iconSrc}
          <img src={iconSrc} alt="" class="w-full h-full object-contain" />
        {/if}
      </div>

      <div class="flex flex-col">
        <h3 class="text-base font-black text-white leading-tight">
          {data.name_vi || data.name_en}
        </h3>
        {#if data.name_en && data.name_vi !== data.name_en}
          <span class="text-[11px] text-slate-400">({data.name_en})</span>
        {/if}
      </div>
    </div>

    {#if data.desc_vi || data.desc_en}
      <p class="text-xs text-slate-300 leading-relaxed font-normal border-t border-white/10 pt-2.5">
        {data.desc_vi || data.desc_en}
      </p>
    {/if}
  </div>
{/if}
