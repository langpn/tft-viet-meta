<script lang="ts">
  import '../app.css';
  import { page } from '$app/state';
  import GlobalTooltipProvider from '$components/tooltips/GlobalTooltipProvider.svelte';
  import { ChevronDown, Globe, Flame, Shield, Sparkles } from 'lucide-svelte';

  let { children } = $props();
  let currentPath = $derived(page.url.pathname);
  let isVietnamese = $state(true);

  // Dropdown state for Tierlist
  let isTierlistOpen = $state(false);
  let tierlistRef = $state<HTMLElement | null>(null);
  let closeTimeout: ReturnType<typeof setTimeout> | null = null;

  const tierlistOptions = [
    { href: '/tierlist/comps', label: 'Đội Hình (Comps)', icon: Flame },
    { href: '/tierlist/items', label: 'Trang Bị (Items)', icon: Shield },
    { href: '/tierlist/augments', label: 'Lõi Nâng Cấp (Augments)', icon: Sparkles }
  ];

  function openTierlistDropdown() {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      closeTimeout = null;
    }
    isTierlistOpen = true;
  }

  function closeTierlistDropdown() {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      closeTimeout = null;
    }
    isTierlistOpen = false;
  }

  function handleTierlistMouseEnter() {
    openTierlistDropdown();
  }

  function handleTierlistMouseLeave() {
    if (closeTimeout) clearTimeout(closeTimeout);
    closeTimeout = setTimeout(() => {
      isTierlistOpen = false;
    }, 150);
  }

  function toggleTierlistDropdown() {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      closeTimeout = null;
    }
    isTierlistOpen = !isTierlistOpen;
  }

  function handleClickOutside(e: MouseEvent) {
    if (isTierlistOpen && tierlistRef && !tierlistRef.contains(e.target as Node)) {
      closeTierlistDropdown();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && isTierlistOpen) {
      closeTierlistDropdown();
    }
  }

  function handleFocusOut(e: FocusEvent) {
    if (tierlistRef && !tierlistRef.contains(e.relatedTarget as Node)) {
      closeTierlistDropdown();
    }
  }

  // Auto-close dropdown when route changes
  $effect(() => {
    currentPath;
    closeTierlistDropdown();
  });

  function toggleLanguage() {
    isVietnamese = !isVietnamese;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('tft_lang', isVietnamese ? 'vi' : 'en');
      window.dispatchEvent(new CustomEvent('tft_lang_change', { detail: { lang: isVietnamese ? 'vi' : 'en' } }));
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} onclick={handleClickOutside} />

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  
  <!-- Global Technical & Branding Meta Tags -->
  <meta name="keywords" content="DTCL, ĐTCL, TFT, dau truong chan ly, tft academy, doi hinh dtcl, trang bi dtcl, loi nang cap, tactics tools, meta dtcl mua 18" />
  <meta name="robots" content="index, follow" />
  <meta name="language" content="Vietnamese" />
  <meta name="author" content="Lang Pham Ngoc" />
  <meta property="og:site_name" content="TFT Academy Việt Nam" />
  <meta property="og:locale" content="vi_VN" />
  <meta property="twitter:card" content="summary_large_image" />

  <!-- Schema.org JSON-LD structured data for Google Search -->
  {@html `<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "TFT Academy Việt Nam",
    "url": "https://tft.langpn.xyz",
    "description": "Bảng xếp hạng đội hình Đấu Trường Chân Lý, trang bị, lõi nâng cấp và thống kê meta tactics.tools.",
    "inLanguage": "vi-VN"
  }
  </script>`}
</svelte:head>

<div class="min-h-screen flex flex-col bg-[#07090E] text-[#F1F5F9]">
  <!-- Top Navigation Bar (Matching Screenshot 2 exactly) -->
  <header class="sticky top-0 z-50 glass-nav border-b border-white/10 bg-[#07090E]/90 backdrop-blur-xl">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
      
      <!-- Brand & Patch Info -->
      <div class="flex items-center gap-6">
        <a href="/" class="flex items-center gap-2.5 group" aria-label="TFT Academy Việt Nam - Trang Chủ">
          <!-- Official TFT Academy Logo (Crown emblem + wordmark) -->
          <img
            src="/logo-tft-academy.webp"
            alt="TFT Academy Việt Nam"
            width="190"
            height="28"
            class="h-7 w-auto max-w-[190px] object-contain group-hover:scale-105 transition-transform duration-200"
            fetchpriority="high"
            decoding="async"
          />
        </a>

        <!-- Main Header Nav Tabs (Matching Screenshot 2) -->
        <nav class="hidden lg:flex items-center gap-2 text-xs font-black tracking-wide">
          <!-- Tierlist Dropdown Menu (Comps, Items, Augments) -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div 
            class="relative inline-block"
            bind:this={tierlistRef}
            onmouseenter={handleTierlistMouseEnter}
            onmouseleave={handleTierlistMouseLeave}
            onfocusout={handleFocusOut}
          >
            <button 
              type="button"
              onclick={toggleTierlistDropdown}
              aria-expanded={isTierlistOpen}
              aria-haspopup="true"
              class="flex items-center gap-1 px-3.5 py-1.5 rounded-full {currentPath.startsWith('/tierlist') ? 'bg-amber-400 text-black shadow-md' : isTierlistOpen ? 'bg-white/10 text-white' : 'text-slate-300 hover:text-white hover:bg-white/5'} transition-all cursor-pointer select-none"
            >
              <span>Bảng Xếp Hạng</span>
              <ChevronDown class="w-3 h-3 stroke-[3] transition-transform duration-200 {isTierlistOpen ? 'rotate-180' : ''}" />
            </button>

            {#if isTierlistOpen}
              <div 
                role="menu"
                class="absolute left-0 top-full mt-1.5 min-w-[210px] bg-[#0B0D14] border border-[#1E2330] rounded-xl p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100 flex flex-col gap-0.5 before:absolute before:-top-2 before:left-0 before:right-0 before:h-2 before:content-['']"
              >
                {#each tierlistOptions as opt}
                  {@const Icon = opt.icon}
                  {@const isActive = currentPath.startsWith(opt.href) || (opt.href === '/tierlist/comps' && currentPath === '/tierlist')}
                  <a 
                    href={opt.href}
                    role="menuitem"
                    data-sveltekit-preload-data="hover"
                    onclick={closeTierlistDropdown}
                    class="group flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap {isActive ? 'text-amber-400 bg-amber-400/10 font-black' : 'text-slate-300 hover:text-white hover:bg-white/5'}"
                  >
                    <Icon class="w-4 h-4 shrink-0 transition-colors {isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-amber-400'}" />
                    <span>{opt.label}</span>
                  </a>
                {/each}
              </div>
            {/if}
          </div>

          <a href="/learn/new-set" class="px-3 py-1.5 rounded-full {currentPath.startsWith('/learn/new-set') ? 'bg-amber-400 text-black shadow-md' : 'text-slate-300 hover:text-white hover:bg-white/5'} transition-all">
            Thông Tin Mùa 18
          </a>

          <a href="/explorer" class="px-3 py-1.5 rounded-full {currentPath.startsWith('/explorer') ? 'bg-emerald-400 text-black shadow-md' : 'text-emerald-400 hover:bg-emerald-400/10'} transition-all">
            Khám Phá Explorer
          </a>
        </nav>
      </div>

      <!-- Right Utility Actions -->
      <div class="flex items-center gap-3">
        <!-- Bilingual Switcher -->
        <button 
          onclick={toggleLanguage}
          aria-label="Chuyển đổi ngôn ngữ"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#141824] hover:bg-[#1E2538] border border-white/10 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
        >
          <Globe class="w-3.5 h-3.5 text-amber-400" />
          <span>{isVietnamese ? 'Tiếng Việt' : 'English'}</span>
        </button>

        <a 
          href="/tierlist/comps" 
          class="px-4 py-1.5 rounded-full border border-white/20 text-xs font-bold text-slate-200 hover:border-amber-400 hover:text-amber-400 transition-colors"
        >
          Đăng nhập
        </a>
      </div>

    </div>
  </header>

  <!-- Content Slot -->
  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
    {@render children?.()}
  </main>

  <!-- Global Floating Tooltip Provider (Portals above everything) -->
  <GlobalTooltipProvider />

  <!-- Footer (Matching Screenshot 2 bottom line) -->
  <footer class="border-t border-white/5 bg-[#05060A] py-8 text-xs text-slate-500 text-center flex flex-col items-center gap-3">
    <div class="flex items-center gap-4 text-slate-400 font-medium">
      <a href="/tierlist/comps" class="hover:text-amber-400">Đội Hình</a>
      <a href="/tierlist/items" class="hover:text-amber-400">Trang Bị</a>
      <a href="/tierlist/augments" class="hover:text-amber-400">Lõi Nâng Cấp</a>
      <a href="/learn/new-set" class="hover:text-amber-400">Mùa 18</a>
      <a href="/explorer" class="hover:text-emerald-400">Khám Phá Explorer</a>
    </div>
    <p>© 2023 - 2026 TFT ACADEMY. Dữ liệu đối soát tiếng Việt chính thức từ Riot Games & tactics.tools.</p>
  </footer>
</div>
