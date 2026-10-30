<script lang="ts">
  import HexAvatar from './HexAvatar.svelte';
  import BoardHexMap from './BoardHexMap.svelte';
  import { X, Trophy, ArrowUpRight, ShieldCheck, Zap, Lightbulb } from 'lucide-svelte';

  interface CompUnit {
    id: string;
    name: string;
    nameVi?: string;
    iconUrl?: string;
    cost?: number;
    starLevel?: number;
    position: number;
    items?: Array<{ name_vi?: string; name_en?: string; icon?: string }>;
  }

  interface Comp {
    id: string;
    title: string;
    metaTitle?: string;
    tier: string;
    trend?: 'Rising' | 'Falling' | 'New' | null;
    compStyle?: string;
    difficulty?: string;
    mainCarry?: {
      id: string;
      name: string;
      nameVi?: string;
      iconUrl?: string;
      cost?: number;
      starLevel?: number;
      items?: Array<{ name_vi?: string; name_en?: string; icon?: string }>;
    };
    mainTank?: {
      id: string;
      name: string;
      nameVi?: string;
      iconUrl?: string;
      cost?: number;
      starLevel?: number;
      items?: Array<{ name_vi?: string; name_en?: string; icon?: string }>;
    };
    units?: CompUnit[];
    traits?: Array<{ name: string; count?: number; icon?: string }>;
    augments?: Array<{ name_vi?: string; name_en?: string; icon?: string }>;
    augmentsTip?: string;
    stages?: {
      stage2?: string;
      stage3?: string;
      stage4?: string;
    };
    tips?: string;
  }

  interface Props {
    comp: Comp | null;
    open: boolean;
    onclose: () => void;
  }

  let { comp, open = false, onclose }: Props = $props();

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && open) {
      onclose();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open && comp}
  <!-- Backdrop -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div 
    class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
    onclick={onclose}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <!-- Modal Container -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div 
      class="relative w-full max-w-4xl bg-[#0F131C] border border-white/10 rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col gap-6 text-[#F1F5F9] my-8"
      onclick={(e) => e.stopPropagation()}
      role="document"
    >
      <!-- Close Button -->
      <button 
        onclick={onclose}
        aria-label="Đóng"
        class="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
      >
        <X class="w-5 h-5" />
      </button>

      <!-- Modal Header -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-2.5">
          <span class="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider {comp.tier === 'S' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : comp.tier === 'A' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'}">
            Tier {comp.tier}
          </span>
          {#if comp.compStyle}
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/5 text-slate-300 border border-white/10">
              {comp.compStyle}
            </span>
          {/if}
          {#if comp.difficulty}
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400">
              Độ khó: {comp.difficulty}
            </span>
          {/if}
        </div>

        <h2 class="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
          <span>{comp.title}</span>
          {#if comp.metaTitle && comp.metaTitle !== comp.title}
            <span class="text-base font-normal text-slate-400">({comp.metaTitle})</span>
          {/if}
        </h2>
      </div>

      <!-- Main Carries & Tanks Highlights -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-[#141A26] border border-white/5">
        {#if comp.mainCarry}
          <div class="flex items-center gap-4">
            <HexAvatar 
              name={comp.mainCarry.name}
              nameVi={comp.mainCarry.nameVi}
              iconUrl={comp.mainCarry.iconUrl}
              cost={comp.mainCarry.cost}
              starLevel={comp.mainCarry.starLevel || 2}
              items={comp.mainCarry.items}
              size="lg"
            />
            <div class="flex flex-col">
              <span class="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <Zap class="w-3.5 h-3.5" /> Chủ lực chính (Carry)
              </span>
              <span class="font-extrabold text-lg text-white">{comp.mainCarry.nameVi || comp.mainCarry.name}</span>
              <span class="text-xs text-slate-400">3 trang bị chuẩn trấn phái (BIS)</span>
            </div>
          </div>
        {/if}

        {#if comp.mainTank}
          <div class="flex items-center gap-4">
            <HexAvatar 
              name={comp.mainTank.name}
              nameVi={comp.mainTank.nameVi}
              iconUrl={comp.mainTank.iconUrl}
              cost={comp.mainTank.cost}
              starLevel={comp.mainTank.starLevel || 2}
              items={comp.mainTank.items}
              size="lg"
            />
            <div class="flex flex-col">
              <span class="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                <ShieldCheck class="w-3.5 h-3.5" /> Chống chịu chính (Tank)
              </span>
              <span class="font-extrabold text-lg text-white">{comp.mainTank.nameVi || comp.mainTank.name}</span>
              <span class="text-xs text-slate-400">3 trang bị thủ tối ưu</span>
            </div>
          </div>
        {/if}
      </div>

      <!-- Board Hex Map (28 Hexes) -->
      {#if comp.units && comp.units.length > 0}
        <div class="flex flex-col gap-2">
          <BoardHexMap units={comp.units} />
        </div>
      {/if}

      <!-- Recommended Augments -->
      {#if comp.augments && comp.augments.length > 0}
        <div class="flex flex-col gap-2 p-4 rounded-xl bg-[#121620] border border-white/5">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Trophy class="w-4 h-4 text-amber-400" /> Lõi Nâng Cấp Khuyên Dùng
          </span>
          <div class="flex flex-wrap gap-2 pt-1">
            {#each comp.augments as aug}
              <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-xs font-semibold">
                {#if aug.icon}
                  <img src={aug.icon.startsWith('http') ? aug.icon : `https://assets.tftacademy.com/augments/${aug.icon}`} alt="" class="w-5 h-5 rounded" />
                {/if}
                <span class="text-white">{aug.name_vi || aug.name_en}</span>
              </div>
            {/each}
          </div>
          {#if comp.augmentsTip}
            <p class="text-xs text-slate-400 italic pt-1">{comp.augmentsTip}</p>
          {/if}
        </div>
      {/if}

      <!-- Leveling Curve & Strategy Stages -->
      {#if comp.stages}
        <div class="flex flex-col gap-3 p-4 rounded-xl bg-[#121620] border border-white/5">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <ArrowUpRight class="w-4 h-4 text-sky-400" /> Giáo Án Nâng Cấp (Leveling Curve)
          </span>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {#if comp.stages.stage2}
              <div class="p-3 rounded-lg bg-black/40 border border-white/5 flex flex-col gap-1">
                <span class="font-bold text-amber-400">Giai đoạn 2 (2-1 đến 2-7):</span>
                <p class="text-slate-300 leading-relaxed">{comp.stages.stage2}</p>
              </div>
            {/if}
            {#if comp.stages.stage3}
              <div class="p-3 rounded-lg bg-black/40 border border-white/5 flex flex-col gap-1">
                <span class="font-bold text-amber-400">Giai đoạn 3 (3-1 đến 3-7):</span>
                <p class="text-slate-300 leading-relaxed">{comp.stages.stage3}</p>
              </div>
            {/if}
            {#if comp.stages.stage4}
              <div class="p-3 rounded-lg bg-black/40 border border-white/5 flex flex-col gap-1">
                <span class="font-bold text-amber-400">Giai đoạn 4+ (Roll hoàn thiện):</span>
                <p class="text-slate-300 leading-relaxed">{comp.stages.stage4}</p>
              </div>
            {/if}
          </div>
        </div>
      {/if}

      <!-- Tips & How to play -->
      {#if comp.tips}
        <div class="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
          <Lightbulb class="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span class="font-bold text-amber-300 block mb-1">Mẹo Vận Hành & Khắc Chế:</span>
            <p>{comp.tips}</p>
          </div>
        </div>
      {/if}

    </div>
  </div>
{/if}
