<script lang="ts">
  import { page } from '$app/state';
  import { AlertTriangle, ArrowLeft, Home } from 'lucide-svelte';
</script>

<svelte:head>
  <title>Lỗi {page.status} · TFT Academy VI</title>
</svelte:head>

<div class="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 gap-6">
  <div class="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl">
    <AlertTriangle class="w-8 h-8" />
  </div>

  <div class="flex flex-col gap-2 max-w-md">
    <span class="text-xs font-black uppercase tracking-widest text-amber-400">
      Mã Lỗi {page.status}
    </span>
    <h1 class="text-3xl font-black text-white">
      {page.status === 404 ? 'Không Tìm Thấy Trang Yêu Cầu' : 'Đã Xảy Ra Sự Cố Máy Chủ'}
    </h1>
    <p class="text-slate-400 text-sm leading-relaxed">
      {page.error?.message || 'Đường dẫn bạn đang tìm kiếm có thể đã thay đổi hoặc đang được cập nhật dữ liệu mới từ TFT Academy.'}
    </p>
  </div>

  <div class="flex items-center gap-3">
    <a 
      href="/tierlist/comps" 
      class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 text-black font-extrabold text-sm hover:bg-amber-300 transition-all shadow-lg"
    >
      <Home class="w-4 h-4" />
      <span>Về Bảng Xếp Hạng Đội Hình</span>
    </a>
  </div>
</div>
