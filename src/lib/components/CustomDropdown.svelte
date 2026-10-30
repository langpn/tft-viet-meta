<script lang="ts">
  import { ChevronDown, Check } from 'lucide-svelte';

  interface Option {
    value: string;
    label: string;
  }

  interface Props {
    options: Option[];
    selected: string;
    onselect: (value: string) => void;
    title?: string;
    variant?: 'pill' | 'yellow-pill';
  }

  let { options, selected, onselect, title = 'Chọn', variant = 'pill' }: Props = $props();

  let isOpen = $state(false);

  function toggle() {
    isOpen = !isOpen;
  }

  function handleSelect(val: string) {
    onselect(val);
    isOpen = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && isOpen) {
      isOpen = false;
    }
  }

  const selectedLabel = $derived(options.find(o => o.value === selected)?.label || selected || title);
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="relative inline-block select-none">
  <!-- Trigger Button -->
  {#if variant === 'yellow-pill'}
    <button 
      type="button"
      onclick={toggle}
      class="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-black text-xs font-black tracking-wide cursor-pointer shadow-md transition-all"
    >
      <span>{selectedLabel}</span>
      <ChevronDown class="w-3.5 h-3.5 stroke-[3] transition-transform duration-200 {isOpen ? 'rotate-180' : ''}" />
    </button>
  {:else}
    <button 
      type="button"
      onclick={toggle}
      class="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#141824] hover:bg-[#1A2030] border border-white/10 text-xs font-extrabold text-white cursor-pointer transition-all shadow-sm"
    >
      <span>{selectedLabel}</span>
      <ChevronDown class="w-3 h-3 text-slate-400 transition-transform duration-200 {isOpen ? 'rotate-180' : ''}" />
    </button>
  {/if}

  <!-- Backdrop overlay to close when clicking outside -->
  {#if isOpen}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div 
      class="fixed inset-0 z-40" 
      onclick={() => (isOpen = false)}
    ></div>

    <!-- Dropdown Menu Popover (Matching Screenshot 5) -->
    <div class="absolute right-0 top-full mt-2 z-50 min-w-[170px] rounded-2xl bg-[#0E1015] border border-white/10 shadow-2xl p-1.5 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-150">
      {#each options as opt}
        <button
          type="button"
          onclick={() => handleSelect(opt.value)}
          class="flex items-center justify-between w-full px-3.5 py-2 rounded-xl text-left text-xs font-bold transition-colors cursor-pointer {selected === opt.value ? 'bg-amber-400/15 text-amber-300 font-black' : 'text-slate-200 hover:bg-white/10 hover:text-white'}"
        >
          <span>{opt.label}</span>
          {#if selected === opt.value}
            <Check class="w-3.5 h-3.5 text-amber-400" />
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>
