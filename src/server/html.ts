import type { SearchDocument } from "../core/search.js";

export function renderHome(state: {
  activePatch: string;
  lastSyncAt: string | null;
  documents: SearchDocument[];
}): string {
  const documentCount = state.documents.length;
  const syncLabel = state.lastSyncAt ?? "Chưa đồng bộ";

  return `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>TFT Việt Meta</title>
    <style>
      :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, sans-serif; background: #0d1017; color: #eef4ff; }
      * { box-sizing: border-box; }
      body { margin: 0; background: radial-gradient(circle at top right, #27335a 0, #0d1017 38rem); min-height: 100vh; }
      header { display: flex; justify-content: space-between; gap: 1rem; align-items: center; padding: 1.25rem max(1rem, calc((100vw - 1120px) / 2)); border-bottom: 1px solid #283147; background: #101522cc; backdrop-filter: blur(14px); position: sticky; top: 0; z-index: 2; }
      main { max-width: 1120px; margin: 0 auto; padding: 4rem 1rem 6rem; }
      h1 { max-width: 720px; font-size: clamp(2.4rem, 7vw, 5rem); line-height: .95; margin: 0 0 1.25rem; letter-spacing: -.06em; }
      h2 { margin-top: 0; }
      p { color: #aab7d4; line-height: 1.65; }
      .eyebrow { color: #79e2cc; text-transform: uppercase; letter-spacing: .18em; font-size: .75rem; font-weight: 700; }
      .search { display: flex; gap: .75rem; margin: 2rem 0; }
      input, button { border: 1px solid #35425e; border-radius: .8rem; background: #151d30; color: inherit; padding: .9rem 1rem; font: inherit; }
      input { flex: 1; min-width: 0; }
      button { cursor: pointer; background: #67d8bd; border-color: #67d8bd; color: #071018; font-weight: 800; }
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-top: 2rem; }
      .card { border: 1px solid #283147; border-radius: 1.1rem; padding: 1.25rem; background: #121827cc; }
      .muted { color: #8090b0; font-size: .9rem; }
      .badge { display: inline-flex; padding: .35rem .55rem; border-radius: 999px; background: #1d2942; color: #9edacb; font-size: .78rem; }
      #results { display: grid; gap: .75rem; }
      a { color: #79e2cc; }
      @media (max-width: 600px) { header { align-items: flex-start; flex-direction: column; } .search { flex-direction: column; } }
    </style>
  </head>
  <body>
    <header><strong>TFT Việt Meta</strong><span class="muted">Patch ${escapeHtml(state.activePatch)} · ${escapeHtml(syncLabel)}</span></header>
    <main>
      <div class="eyebrow">Source-locked local mirror</div>
      <h1>Tra cứu TFT bằng tiếng Việt, không đoán dữ liệu.</h1>
      <p>Search local ưu tiên dữ liệu đã chuẩn hóa theo patch. Explorer và nội dung nguồn sẽ chỉ được đánh dấu đã xác minh khi parity check có bằng chứng.</p>
      <form class="search" id="search-form"><input id="query" autocomplete="off" placeholder="Tìm Ahri, áo choàng bóng tối, fast 8..." /><button>Tìm kiếm</button></form>
      <div id="results" aria-live="polite"></div>
      <section class="grid">
        <article class="card"><span class="badge">${documentCount} entities</span><h2>Encyclopedia</h2><p>Unit, item, trait, augment và alias tiếng Việt trong local canonical index.</p></article>
        <article class="card"><span class="badge">Explorer</span><h2>Meta Explorer</h2><p>Query theo patch, rank, region, unit, item, trait và augment; output có source status.</p><a href="/explorer">Mở Explorer →</a></article>
        <article class="card"><span class="badge">Sync</span><h2>Snapshot & diff</h2><p>Mỗi lần đồng bộ tạo snapshot mới, phát hiện added/modified/deleted và giữ rollback.</p><a href="/api/status">Xem trạng thái →</a></article>
      </section>
    </main>
    <script>
      const form = document.querySelector('#search-form');
      const input = document.querySelector('#query');
      const results = document.querySelector('#results');
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const query = input.value.trim();
        if (!query) { results.innerHTML = ''; return; }
        const response = await fetch('/api/search?q=' + encodeURIComponent(query));
        const data = await response.json();
        results.innerHTML = data.results.length ? data.results.map((item) => '<div class="card"><strong>' + item.titleVi + '</strong><div class="muted">' + item.entityType + ' · ' + item.patch + ' · ' + item.source + '</div></div>').join('') : '<div class="card">Không tìm thấy kết quả canonical.</div>';
      });
    </script>
  </body>
</html>`;
}

export function renderExplorer(): string {
  return `<!doctype html><html lang="vi"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>Explorer · TFT Việt Meta</title><style>body{font-family:system-ui;background:#0d1017;color:#eef4ff;max-width:960px;margin:0 auto;padding:2rem 1rem}input,button{padding:.8rem;border-radius:.6rem;border:1px solid #35425e;background:#151d30;color:inherit}input{width:100%;margin:.5rem 0}.card{margin-top:1rem;padding:1rem;border:1px solid #283147;border-radius:1rem;background:#121827}a{color:#79e2cc}</style></head><body><a href="/">← Trang chủ</a><h1>Meta Explorer</h1><p>Local query contract. Dữ liệu chưa được đánh dấu parity nếu chưa có source fixture.</p><form id="form"><label>Patch<input name="patch" value="18.5c"/></label><label>Rank<input name="rank" value="diamond_plus"/></label><label>Units<input name="units" value="Ahri"/></label><button>Chạy query</button></form><pre id="output" class="card"></pre><script>const form=document.querySelector('#form');const output=document.querySelector('#output');form.addEventListener('submit',async(e)=>{e.preventDefault();const p=new URLSearchParams(new FormData(form));const r=await fetch('/api/explorer?'+p);output.textContent=JSON.stringify(await r.json(),null,2)});</script></body></html>`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);
}
