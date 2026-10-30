<script lang="ts">
  import HexAvatar from './HexAvatar.svelte';
  import BoardHexMap from './BoardHexMap.svelte';
  import { resolveAugmentIcon, resolveItemIcon, resolveTraitIcon } from '$lib/utils/assets';
  import { Copy, X, Check, ShieldCheck, Zap, Sparkles, BookOpen } from 'lucide-svelte';

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

  // Trait badge colors
  const tierBg = $derived.by(() => {
    if (comp?.tier === 'S') return 'from-rose-950/40 to-[#0A0D14] border-rose-500/40';
    if (comp?.tier === 'A') return 'from-orange-950/40 to-[#0A0D14] border-orange-500/40';
    if (comp?.tier === 'B') return 'from-amber-950/40 to-[#0A0D14] border-amber-500/40';
    if (comp?.tier === 'C') return 'from-lime-950/40 to-[#0A0D14] border-lime-500/40';
    return 'from-teal-950/40 to-[#0A0D14] border-teal-500/40';
  });
</script>

{#if comp}
  <div class="w-full rounded-2xl bg-[#090C12] border border-white/10 shadow-2xl overflow-hidden mt-6 flex flex-col lg:flex-row animate-in fade-in duration-300">
    
    <!-- Left Column: Core Carry Showcase & Augments (35% width) -->
    <div class="lg:w-[35%] bg-gradient-to-b {tierBg} border-b lg:border-b-0 lg:border-r border-white/10 p-6 flex flex-col justify-between gap-6">
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

        <!-- Title & Playstyle -->
        <div class="flex flex-col gap-1 items-center">
          <h2 class="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
            {comp.title}
          </h2>
          {#if comp.metaTitle && comp.metaTitle !== comp.title}
            <span class="text-xs text-slate-400 font-semibold">{comp.metaTitle}</span>
          {/if}
          {#if comp.compStyle}
            <span class="mt-1 text-[11px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-3 py-0.5 rounded-full border border-amber-400/20">
              PLAYSTYLE: {comp.compStyle} {comp.difficulty ? `(${comp.difficulty})` : ''}
            </span>
          {/if}
        </div>

        <!-- Trait Badges Row -->
        {#if comp.traits && comp.traits.length > 0}
          <div class="flex flex-wrap items-center justify-center gap-1.5 pt-1">
            {#each comp.traits as trait}
              <div class="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/60 border border-white/10 text-xs font-bold text-slate-200">
                {#if trait.icon}
                  <img src={resolveTraitIcon(trait.icon, trait.id)} alt="" class="w-3.5 h-3.5 object-contain" />
                {/if}
                <span>{trait.count || ''} {trait.name_vi || trait.name}</span>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Augments Showcase -->
      {#if comp.augments && comp.augments.length > 0}
        <div class="flex flex-col gap-2 pt-4 border-t border-white/10">
          <span class="text-[11px] font-black uppercase tracking-wider text-slate-400 text-center">
            Augments (Lõi Khuyên Dùng)
          </span>
          <div class="flex flex-wrap items-center justify-center gap-2">
            {#each comp.augments.slice(0, 6) as aug}
              <div 
                class="w-10 h-10 rounded-xl bg-black/70 border border-white/10 overflow-hidden p-1 flex items-center justify-center hover:scale-110 transition-transform"
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
            <p class="text-[11px] text-slate-400 text-center italic leading-relaxed pt-1">
              {comp.augmentsTip}
            </p>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Right Column: Final Board, Early Units, Items, Positioning & Strategy (65% width) -->
    <div class="lg:w-[65%] p-6 flex flex-col gap-6 justify-between bg-[#0C0F17]">
      
      <!-- Top Action Bar -->
      <div class="flex items-center justify-between border-b border-white/10 pb-4">
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider {comp.tier === 'S' ? 'bg-rose-500 text-white' : comp.tier === 'A' ? 'bg-orange-500 text-white' : 'bg-amber-400 text-black'}">
            Tier {comp.tier}
          </span>
          <span class="font-extrabold text-base text-white">{comp.title}</span>
        </div>

        <div class="flex items-center gap-2">
          <button 
            type="button"
            onclick={copyCompCode}
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181F2C] hover:bg-[#20293A] border border-white/10 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
          >
            {#if copied}
              <Check class="w-3.5 h-3.5 text-emerald-400" />
              <span class="text-emerald-400">Đã chép!</span>
            {:else}
              <Copy class="w-3.5 h-3.5 text-amber-400" />
              <span>Copy</span>
            {/if}
          </button>

          {#if onclose}
            <button 
              type="button"
              onclick={onclose}
              aria-label="Đóng chi tiết"
              class="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X class="w-4 h-4" />
            </button>
          {/if}
        </div>
      </div>

      <!-- Final Board Lineup (Row of Hexagons) -->
      {#if comp.board && comp.board.length > 0}
        <div class="flex flex-col gap-2">
          <span class="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Đội Hình Hoàn Chỉnh (Final Lineup)
          </span>
          <div class="flex flex-wrap items-center gap-2.5 overflow-x-auto py-2">
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
        <div class="p-4 rounded-xl bg-[#121620] border border-white/5 flex flex-col gap-2">
          <span class="text-[11px] font-black uppercase tracking-wider text-amber-400">
            Early Units (Đầu Game)
          </span>
          <div class="flex flex-wrap items-center gap-2 pt-1">
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

        <!-- Item Priority -->
        <div class="p-4 rounded-xl bg-[#121620] border border-white/5 flex flex-col gap-2">
          <span class="text-[11px] font-black uppercase tracking-wider text-sky-400">
            Item Priority (Ưu Tiên Đồ)
          </span>
          <div class="flex flex-wrap items-center gap-1.5 pt-1">
            {#if comp.mainCarry?.items && comp.mainCarry.items.length > 0}
              {#each comp.mainCarry.items as item}
                <div class="w-8 h-8 rounded-lg bg-black/60 border border-amber-400/60 p-0.5 overflow-hidden" title={item.name_vi || item.name_en}>
                  <img src={resolveItemIcon(item.icon, item.id)} alt="" class="w-full h-full object-cover" />
                </div>
              {/each}
            {/if}
            {#if comp.mainTank?.items && comp.mainTank.items.length > 0}
              {#each comp.mainTank.items as item}
                <div class="w-8 h-8 rounded-lg bg-black/60 border border-emerald-400/60 p-0.5 overflow-hidden" title={item.name_vi || item.name_en}>
                  <img src={resolveItemIcon(item.icon, item.id)} alt="" class="w-full h-full object-cover" />
                </div>
              {/each}
            {/if}
          </div>
        </div>

        <!-- Flex Units -->
        <div class="p-4 rounded-xl bg-[#121620] border border-white/5 flex flex-col gap-2">
          <span class="text-[11px] font-black uppercase tracking-wider text-fuchsia-400">
            Flex / Kẹp Thêm (Late Game)
          </span>
          <div class="flex flex-wrap items-center gap-2 pt-1">
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

      <!-- Leveling Stages & Strategy Tips -->
      {#if comp.tips}
        <div class="flex flex-col gap-2 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
          <span class="font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <BookOpen class="w-4 h-4" /> Giáo Án & Mẹo Vận Hành:
          </span>
          <p>{comp.tips}</p>
        </div>
      {/if}

    </div>
  </div>
{/if}
