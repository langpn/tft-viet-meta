<script lang="ts">
  let { set, path, patch = '' }: { set: number; path: string; patch?: string } = $props();
</script>

<div class="flex flex-wrap items-center gap-3 text-xs font-bold">
  <span class="rounded-full border border-white/10 bg-[#161B26] px-3.5 py-1 text-amber-400">
    Mùa {set}{patch ? ` · Bản ${patch}` : ' · TFT Academy'}
  </span>
  <a data-sveltekit-reload href={set === 18 ? path : `${path}?set=18`} class="text-slate-300 hover:text-amber-400">
    {set === 18 ? 'Xem Mùa 19' : 'Lưu trữ Mùa 18'}
  </a>
</div>
