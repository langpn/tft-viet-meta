<script lang="ts">
  import '../app.css';
  import { page } from '$app/state';
  import { ChevronDown, Globe } from 'lucide-svelte';

  let { children } = $props();
  let currentPath = $derived(page.url.pathname);
  let isVietnamese = $state(true);

  function toggleLanguage() {
    isVietnamese = !isVietnamese;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('tft_lang', isVietnamese ? 'vi' : 'en');
      window.dispatchEvent(new CustomEvent('tft_lang_change', { detail: { lang: isVietnamese ? 'vi' : 'en' } }));
    }
  }
</script>

<div class="min-h-screen flex flex-col bg-[#07090E] text-[#F1F5F9]">
  <!-- Top Navigation Bar (Matching Screenshot 2 exactly) -->
  <header class="sticky top-0 z-50 glass-nav border-b border-white/10 bg-[#07090E]/90 backdrop-blur-xl">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
      
      <!-- Brand & Patch Info -->
      <div class="flex items-center gap-6">
        <a href="/" class="flex items-center gap-2.5 group">
          <!-- Gold TFT Academy Logo Crown -->
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-400/20 group-hover:scale-105 transition-transform">
            <span class="font-black text-black text-base tracking-wider">T</span>
          </div>
          <span class="font-black text-xl tracking-tight text-white group-hover:text-amber-400 transition-colors">
            TFT<span class="text-amber-400">Academy</span>
          </span>
        </a>

        <!-- Main Header Nav Tabs (Matching Screenshot 2) -->
        <nav class="hidden lg:flex items-center gap-2 text-xs font-black tracking-wide">
          <!-- Tierlist active button -->
          <a 
            href="/tierlist/comps" 
            class="flex items-center gap-1 px-3.5 py-1.5 rounded-full {currentPath.startsWith('/tierlist') ? 'bg-amber-400 text-black shadow-md' : 'text-slate-300 hover:text-white hover:bg-white/5'} transition-all"
          >
            <span>Tierlist</span>
            <ChevronDown class="w-3 h-3 stroke-[3]" />
          </a>

          <a href="/learn/new-set" class="px-3 py-1.5 rounded-full {currentPath.startsWith('/learn/new-set') ? 'bg-amber-400 text-black shadow-md' : 'text-slate-300 hover:text-white hover:bg-white/5'} transition-all">
            Set 18 Info
          </a>

          <a href="/explorer" class="px-3 py-1.5 rounded-full {currentPath.startsWith('/explorer') ? 'bg-emerald-400 text-black shadow-md' : 'text-emerald-400 hover:bg-emerald-400/10'} transition-all">
            Explorer
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
          Log in
        </a>
      </div>

    </div>
  </header>

  <!-- Content Slot -->
  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
    {@render children?.()}
  </main>

  <!-- Footer (Matching Screenshot 2 bottom line) -->
  <footer class="border-t border-white/5 bg-[#05060A] py-8 text-xs text-slate-500 text-center flex flex-col items-center gap-3">
    <div class="flex items-center gap-4 text-slate-400 font-medium">
      <a href="/tierlist/comps" class="hover:text-amber-400">Comps</a>
      <a href="/tierlist/items" class="hover:text-amber-400">Items</a>
      <a href="/tierlist/augments" class="hover:text-amber-400">Augments</a>
      <a href="/learn/new-set" class="hover:text-amber-400">Set 18</a>
      <a href="/explorer" class="hover:text-emerald-400">Explorer</a>
    </div>
    <p>© 2023 - 2026 TFT ACADEMY. Dữ liệu đối soát tiếng Việt chính thức từ Riot Games & tactics.tools.</p>
  </footer>
</div>
