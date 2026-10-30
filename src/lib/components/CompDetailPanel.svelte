<script lang="ts">
  import HexAvatar from './HexAvatar.svelte';
  import BoardHexMap from './BoardHexMap.svelte';
  import { resolveAugmentIcon, resolveItemIcon, resolveTraitIcon } from '$lib/utils/assets';
  import { translatePlaystyle, translateDifficulty, translateStrategyTip } from '$lib/utils/strategy-translator';
  import { Copy, X, Check, BookOpen, Sparkles, Layers } from 'lucide-svelte';

  interface Props {
    comp: any;
    onclose?: () => void;
  }

  let { comp, onclose }: Props = $props();

  let copied = $state(false);

  function copyCompCode() {
    if (typeof navigator !== 'undefined' && comp?.title) {
      navigator.clipboard.writeText(`${comp.title} - TFT Academy Meta Comp`);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    }
  }

  const tierBg = $derived.by(() => {
    if (comp?.tier === 'S') return 'from-rose-950/40 via-[#0F131C] to-[#0A0D14] border-rose-500/40';
    if (comp?.tier === 'A') return 'from-orange-950/40 via-[#0F131C] to-[#0A0D14] border-orange-500/40';
    if (comp?.tier === 'B') return 'from-amber-950/40 via-[#0F131C] to-[#0A0D14] border-amber-500/40';
    if (comp?.tier === 'C') return 'from-lime-950/40 via-[#0F131C] to-[#0A0D14] border-lime-500/40';
    return 'from-teal-950/40 via-[#0F131C] to-[#0A0D14] border-teal-500/40';
  });
</script>

{#if comp}
  <div class="w-full rounded-2xl bg-[#090C12] border border-white/10 shadow-2xl overflow-hidden flex flex-col lg:flex-row animate-in fade-in duration-300">
    
    <!-- Left Column: Core Carry Showcase & Augments (35% width) -->
    <div class="lg:w-[35%] bg-gradient-to-b {tierBg} border-b lg:border-b-0 lg:border-r border-white/10 p-6 sm:p-8 flex flex-col justify-between gap-6">
      <div class="flex flex-col items-center text-center gap-4">
        
        <!-- Large Main Carry Hexagon -->
        {#if comp.mainCarry}
          <div class="relative py-2">
            <HexAvatar 
              id={comp.mainCarry.id}
              name={comp.mainCarry.name}
              nameVi={comp.mainCarry.nameVi}
              iconUrl={comp.mainCarry.iconUrl}
              cost={comp.mainCarry.cost}
              starLevel={comp.mainCarry.starLevel || 2}
              items={comp.mainCarry.items}
              size="xl"
            />
          </div>
        {/if}

        <!-- Title & Playstyle (100% Vietnamese translation) -->
        <div class="flex flex-col gap-1.5 items-center">
          <h2 class="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            {comp.title}
          </h2>
          {#if comp.metaTitle && comp.metaTitle !== comp.title}
            <span class="text-xs text-slate-400 font-semibold">{comp.metaTitle}</span>
          {/if}
          
          {#if comp.compStyle}
            <div class="mt-1 flex items-center gap-2">
              <span class="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                LỐI CHƠI: {translatePlaystyle(comp.compStyle)}
              </span>
              {#if comp.difficulty}
                <span class="text-[11px] font-black uppercase tracking-wider text-slate-300 bg-white/10 px-2.5 py-1 rounded-full">
                  {translateDifficulty(comp.difficulty)}
                </span>
              {/if}
            </div>
          {/if}
        </div>

        <!-- Trait Badges Row -->
        {#if comp.traits && comp.traits.length > 0}
          <div class="flex flex-wrap items-center justify-center gap-1.5 pt-2">
            {#each comp.traits as trait}
              <div class="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/70 border border-white/10 text-xs font-bold text-slate-200 shadow-sm">
                {#if trait.icon}
                  <img src={resolveTraitIcon(trait.icon, trait.id)} alt="" class="w-4 h-4 object-contain" />
                {/if}
                <span>{trait.count || ''} {trait.name_vi || trait.name}</span>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Augments Showcase -->
      {#if comp.augments && comp.augments.length > 0}
        <div class="flex flex-col gap-2.5 pt-4 border-t border-white/10">
          <span class="text-xs font-black uppercase tracking-wider text-slate-300 text-center flex items-center justify-center gap-1.5">
            <Sparkles class="w-4 h-4 text-amber-400" /> LÕI NÂNG CẤP KHUYÊN DÙNG
          </span>
          <div class="flex flex-wrap items-center justify-center gap-2 pt-1">
            {#each comp.augments.slice(0, 6) as aug}
              <div 
                class="w-11 h-11 rounded-xl bg-black/80 border border-white/10 overflow-hidden p-1 flex items-center justify-center hover:scale-115 transition-transform shadow-md"
                title={aug.name_vi || aug.name_en}
              >
                <img 
                  src={resolveAugmentIcon(aug.icon, aug.id)} 
                  alt={aug.name_vi || ''} 
                  class="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>
            {/each}
          </div>
          {#if comp.augmentsTip}
            <p class="text-xs text-slate-300 text-center italic leading-relaxed pt-1.5">
              "{translateStrategyTip(comp.augmentsTip)}"
            </p>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Right Column: Final Board, Early Units, Items, Positioning & Strategy (65% width) -->
    <div class="lg:w-[65%] p-6 sm:p-8 flex flex-col gap-6 justify-between bg-[#0B0E14]">
      
      <!-- Top Action Bar -->
      <div class="flex items-center justify-between border-b border-white/10 pb-4">
        <div class="flex items-center gap-2.5">
          <span class="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider {comp.tier === 'S' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : comp.tier === 'A' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-amber-400 text-black font-black'}">
            Tier {comp.tier}
          </span>
          <span class="font-black text-lg text-white">{comp.title}</span>
        </div>

        <div class="flex items-center gap-2">
          <button 
            type="button"
            onclick={copyCompCode}
            class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#161D2B] hover:bg-[#20293A] border border-white/10 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
          >
            {#if copied}
              <Check class="w-4 h-4 text-emerald-400" />
              <span class="text-emerald-400">Đã chép!</span>
            {:else}
              <Copy class="w-4 h-4 text-amber-400" />
              <span>Copy</span>
            {/if}
          </button>

          {#if onclose}
            <button 
              type="button"
              onclick={onclose}
              aria-label="Đóng chi tiết"
              class="w-9 h-9 rounded-xl bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 flex items-center justify-center text-slate-400 transition-colors cursor-pointer"
            >
              <X class="w-5 h-5" />
            </button>
          {/if}
        </div>
      </div>

      <!-- Final Board Lineup (Row of Hexagons with wrap) -->
      {#if comp.board && comp.board.length > 0}
        <div class="flex flex-col gap-2.5">
          <span class="text-xs font-black uppercase tracking-wider text-slate-400">
            ĐỘI HÌNH HOÀN CHỈNH (FINAL LINEUP)
          </span>
          <div class="flex flex-wrap items-center gap-3 py-2">
            {#each comp.board as unit}
              <div class="flex flex-col items-center">
                <HexAvatar 
                  id={unit.id}
                  name={unit.name_en || unit.name}
                  nameVi={unit.name_vi || unit.name}
                  iconUrl={unit.icon}
                  cost={unit.cost}
                  starLevel={unit.stars || 1}
                  items={unit.items}
                  size="md"
                  showName={true}
                />
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- 3 Split Columns: Early Units, Item Priority, Flex Units -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <!-- Early Units -->
        <div class="p-4 rounded-xl bg-[#121622] border border-white/5 flex flex-col gap-2.5">
          <span class="text-xs font-black uppercase tracking-wider text-amber-400">
            EARLY UNITS (ĐẦU GAME)
          </span>
          <div class="flex flex-wrap items-center gap-2.5 pt-1">
            {#if comp.levelingCurve?.earlyComp && comp.levelingCurve.earlyComp.length > 0}
              {#each comp.levelingCurve.earlyComp as u}
                <HexAvatar 
                  id={u.id}
                  name={u.name_en || u.name}
                  nameVi={u.name_vi || u.name}
                  iconUrl={u.icon}
                  cost={u.cost}
                  size="sm"
                  showName={true}
                />
              {/each}
            {:else}
              <span class="text-xs text-slate-500">Giữ form bài mạnh nhất có thể</span>
            {/if}
          </div>
        </div>

        <!-- Item Priority (Significantly enlarged icons) -->
        <div class="p-4 rounded-xl bg-[#121622] border border-white/5 flex flex-col gap-2.5">
          <span class="text-xs font-black uppercase tracking-wider text-sky-400">
            ITEM PRIORITY (ƯU TIÊN ĐỒ)
          </span>
          <div class="flex flex-wrap items-center gap-2 pt-1">
            {#if comp.mainCarry?.items && comp.mainCarry.items.length > 0}
              {#each comp.mainCarry.items as item}
                <div class="w-11 h-11 rounded-xl bg-black border-2 border-amber-400/80 p-0.5 overflow-hidden shadow-lg hover:scale-110 transition-transform" title={item.name_vi || item.name_en}>
                  <img src={resolveItemIcon(item.icon, item.id)} alt={item.name_vi || ''} class="w-full h-full object-cover rounded-lg" />
                </div>
              {/each}
            {/if}
            {#if comp.mainTank?.items && comp.mainTank.items.length > 0}
              {#each comp.mainTank.items as item}
                <div class="w-11 h-11 rounded-xl bg-black border-2 border-emerald-400/80 p-0.5 overflow-hidden shadow-lg hover:scale-110 transition-transform" title={item.name_vi || item.name_en}>
                  <img src={resolveItemIcon(item.icon, item.id)} alt={item.name_vi || ''} class="w-full h-full object-cover rounded-lg" />
                </div>
              {/each}
            {/if}
          </div>
        </div>

        <!-- Flex Units -->
        <div class="p-4 rounded-xl bg-[#121622] border border-white/5 flex flex-col gap-2.5">
          <span class="text-xs font-black uppercase tracking-wider text-fuchsia-400">
            FLEX / KẸP THÊM (LATE GAME)
          </span>
          <div class="flex flex-wrap items-center gap-2.5 pt-1">
            {#if comp.maxCap && comp.maxCap.length > 0}
              {#each comp.maxCap as cap}
                <HexAvatar 
                  id={cap.id}
                  name={cap.name_en || cap.name}
                  nameVi={cap.name_vi || cap.name}
                  iconUrl={cap.icon}
                  cost={cap.cost || 5}
                  size="sm"
                  showName={true}
                />
              {/each}
            {:else}
              <span class="text-xs text-slate-500">Kẹp thêm 5 vàng 2 sao</span>
            {/if}
          </div>
        </div>
      </div>

      <!-- Positioning Example: 28-Hex Board -->
      {#if comp.board && comp.board.length > 0}
        <div class="pt-2">
          <BoardHexMap units={comp.board.map((u: any) => ({
            id: u.id,
            name: u.name_en || u.name,
            nameVi: u.name_vi || u.name,
            iconUrl: u.icon,
            cost: u.cost,
            starLevel: u.stars || 1,
            position: u.boardIndex ?? (u.hex ? u.hex.row * 7 + u.hex.col : 0),
            items: u.items
          }))} />
        </div>
      {/if}

      <!-- Leveling Stages & Strategy Tips (Fix for [object Object]) -->
      {#if comp.tips && Array.isArray(comp.tips) && comp.tips.length > 0}
        <div class="flex flex-col gap-3 p-5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200/90 leading-relaxed shadow-lg">
          <span class="font-black uppercase tracking-wider text-amber-400 flex items-center gap-2 text-sm">
            <BookOpen class="w-4.5 h-4.5" /> GIÁO ÁN & MẸO VẬN HÀNH CHI TIẾT:
          </span>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {#each comp.tips as step}
              <div class="p-3.5 rounded-xl bg-black/60 border border-white/10 flex flex-col gap-1.5 shadow">
                <span class="font-black text-amber-400 text-xs tracking-wider uppercase">{step.stage}:</span>
                <p class="text-slate-200 text-xs leading-relaxed">{translateStrategyTip(step.tip)}</p>
              </div>
            {/each}
          </div>
        </div>
      {:else if typeof comp.tips === 'string' && comp.tips.length > 0}
        <div class="flex flex-col gap-2 p-5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200/90 text-xs leading-relaxed">
          <span class="font-black uppercase tracking-wider text-amber-400 flex items-center gap-2 text-sm">
            <BookOpen class="w-4.5 h-4.5" /> MẸO VẬN HÀNH:
          </span>
          <p>{translateStrategyTip(comp.tips)}</p>
        </div>
      {/if}

    </div>
  </div>
{/if}
