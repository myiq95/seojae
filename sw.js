/* 서재 · 서비스 워커
   파일을 고쳐서 다시 올릴 때마다 VERSION 숫자를 올려 주세요.
   (올리지 않으면 기기에 저장된 옛 파일이 계속 보일 수 있어요) */
const VERSION = 'v1.0.1';
const CACHE = 'seojae-' + VERSION;

const CORE = ["./", "index.html", "styles.css", "app.js", "parse.js", "manifest.webmanifest", "fonts/fonts.css", "vendor/jszip.min.js", "vendor/mammoth.browser.min.js", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "icons/apple-touch-icon.png", "apple-touch-icon.png"];
const LAZY = ["fonts/PretendardVariable.woff2", "fonts/serif/noto-serif-kr-0-wght-normal.woff2", "fonts/serif/noto-serif-kr-1-wght-normal.woff2", "fonts/serif/noto-serif-kr-10-wght-normal.woff2", "fonts/serif/noto-serif-kr-100-wght-normal.woff2", "fonts/serif/noto-serif-kr-101-wght-normal.woff2", "fonts/serif/noto-serif-kr-102-wght-normal.woff2", "fonts/serif/noto-serif-kr-103-wght-normal.woff2", "fonts/serif/noto-serif-kr-104-wght-normal.woff2", "fonts/serif/noto-serif-kr-105-wght-normal.woff2", "fonts/serif/noto-serif-kr-106-wght-normal.woff2", "fonts/serif/noto-serif-kr-107-wght-normal.woff2", "fonts/serif/noto-serif-kr-108-wght-normal.woff2", "fonts/serif/noto-serif-kr-109-wght-normal.woff2", "fonts/serif/noto-serif-kr-11-wght-normal.woff2", "fonts/serif/noto-serif-kr-110-wght-normal.woff2", "fonts/serif/noto-serif-kr-111-wght-normal.woff2", "fonts/serif/noto-serif-kr-112-wght-normal.woff2", "fonts/serif/noto-serif-kr-113-wght-normal.woff2", "fonts/serif/noto-serif-kr-114-wght-normal.woff2", "fonts/serif/noto-serif-kr-115-wght-normal.woff2", "fonts/serif/noto-serif-kr-116-wght-normal.woff2", "fonts/serif/noto-serif-kr-117-wght-normal.woff2", "fonts/serif/noto-serif-kr-118-wght-normal.woff2", "fonts/serif/noto-serif-kr-119-wght-normal.woff2", "fonts/serif/noto-serif-kr-12-wght-normal.woff2", "fonts/serif/noto-serif-kr-13-wght-normal.woff2", "fonts/serif/noto-serif-kr-14-wght-normal.woff2", "fonts/serif/noto-serif-kr-15-wght-normal.woff2", "fonts/serif/noto-serif-kr-16-wght-normal.woff2", "fonts/serif/noto-serif-kr-17-wght-normal.woff2", "fonts/serif/noto-serif-kr-18-wght-normal.woff2", "fonts/serif/noto-serif-kr-19-wght-normal.woff2", "fonts/serif/noto-serif-kr-2-wght-normal.woff2", "fonts/serif/noto-serif-kr-20-wght-normal.woff2", "fonts/serif/noto-serif-kr-21-wght-normal.woff2", "fonts/serif/noto-serif-kr-22-wght-normal.woff2", "fonts/serif/noto-serif-kr-23-wght-normal.woff2", "fonts/serif/noto-serif-kr-24-wght-normal.woff2", "fonts/serif/noto-serif-kr-25-wght-normal.woff2", "fonts/serif/noto-serif-kr-26-wght-normal.woff2", "fonts/serif/noto-serif-kr-27-wght-normal.woff2", "fonts/serif/noto-serif-kr-28-wght-normal.woff2", "fonts/serif/noto-serif-kr-29-wght-normal.woff2", "fonts/serif/noto-serif-kr-3-wght-normal.woff2", "fonts/serif/noto-serif-kr-30-wght-normal.woff2", "fonts/serif/noto-serif-kr-31-wght-normal.woff2", "fonts/serif/noto-serif-kr-32-wght-normal.woff2", "fonts/serif/noto-serif-kr-33-wght-normal.woff2", "fonts/serif/noto-serif-kr-34-wght-normal.woff2", "fonts/serif/noto-serif-kr-35-wght-normal.woff2", "fonts/serif/noto-serif-kr-36-wght-normal.woff2", "fonts/serif/noto-serif-kr-37-wght-normal.woff2", "fonts/serif/noto-serif-kr-38-wght-normal.woff2", "fonts/serif/noto-serif-kr-39-wght-normal.woff2", "fonts/serif/noto-serif-kr-4-wght-normal.woff2", "fonts/serif/noto-serif-kr-40-wght-normal.woff2", "fonts/serif/noto-serif-kr-41-wght-normal.woff2", "fonts/serif/noto-serif-kr-42-wght-normal.woff2", "fonts/serif/noto-serif-kr-43-wght-normal.woff2", "fonts/serif/noto-serif-kr-44-wght-normal.woff2", "fonts/serif/noto-serif-kr-45-wght-normal.woff2", "fonts/serif/noto-serif-kr-46-wght-normal.woff2", "fonts/serif/noto-serif-kr-47-wght-normal.woff2", "fonts/serif/noto-serif-kr-48-wght-normal.woff2", "fonts/serif/noto-serif-kr-49-wght-normal.woff2", "fonts/serif/noto-serif-kr-5-wght-normal.woff2", "fonts/serif/noto-serif-kr-50-wght-normal.woff2", "fonts/serif/noto-serif-kr-51-wght-normal.woff2", "fonts/serif/noto-serif-kr-52-wght-normal.woff2", "fonts/serif/noto-serif-kr-53-wght-normal.woff2", "fonts/serif/noto-serif-kr-54-wght-normal.woff2", "fonts/serif/noto-serif-kr-55-wght-normal.woff2", "fonts/serif/noto-serif-kr-56-wght-normal.woff2", "fonts/serif/noto-serif-kr-57-wght-normal.woff2", "fonts/serif/noto-serif-kr-58-wght-normal.woff2", "fonts/serif/noto-serif-kr-59-wght-normal.woff2", "fonts/serif/noto-serif-kr-6-wght-normal.woff2", "fonts/serif/noto-serif-kr-60-wght-normal.woff2", "fonts/serif/noto-serif-kr-61-wght-normal.woff2", "fonts/serif/noto-serif-kr-62-wght-normal.woff2", "fonts/serif/noto-serif-kr-63-wght-normal.woff2", "fonts/serif/noto-serif-kr-64-wght-normal.woff2", "fonts/serif/noto-serif-kr-65-wght-normal.woff2", "fonts/serif/noto-serif-kr-66-wght-normal.woff2", "fonts/serif/noto-serif-kr-67-wght-normal.woff2", "fonts/serif/noto-serif-kr-68-wght-normal.woff2", "fonts/serif/noto-serif-kr-69-wght-normal.woff2", "fonts/serif/noto-serif-kr-7-wght-normal.woff2", "fonts/serif/noto-serif-kr-70-wght-normal.woff2", "fonts/serif/noto-serif-kr-71-wght-normal.woff2", "fonts/serif/noto-serif-kr-72-wght-normal.woff2", "fonts/serif/noto-serif-kr-73-wght-normal.woff2", "fonts/serif/noto-serif-kr-74-wght-normal.woff2", "fonts/serif/noto-serif-kr-75-wght-normal.woff2", "fonts/serif/noto-serif-kr-76-wght-normal.woff2", "fonts/serif/noto-serif-kr-77-wght-normal.woff2", "fonts/serif/noto-serif-kr-78-wght-normal.woff2", "fonts/serif/noto-serif-kr-79-wght-normal.woff2", "fonts/serif/noto-serif-kr-8-wght-normal.woff2", "fonts/serif/noto-serif-kr-80-wght-normal.woff2", "fonts/serif/noto-serif-kr-81-wght-normal.woff2", "fonts/serif/noto-serif-kr-82-wght-normal.woff2", "fonts/serif/noto-serif-kr-83-wght-normal.woff2", "fonts/serif/noto-serif-kr-84-wght-normal.woff2", "fonts/serif/noto-serif-kr-85-wght-normal.woff2", "fonts/serif/noto-serif-kr-86-wght-normal.woff2", "fonts/serif/noto-serif-kr-87-wght-normal.woff2", "fonts/serif/noto-serif-kr-88-wght-normal.woff2", "fonts/serif/noto-serif-kr-89-wght-normal.woff2", "fonts/serif/noto-serif-kr-9-wght-normal.woff2", "fonts/serif/noto-serif-kr-90-wght-normal.woff2", "fonts/serif/noto-serif-kr-91-wght-normal.woff2", "fonts/serif/noto-serif-kr-92-wght-normal.woff2", "fonts/serif/noto-serif-kr-93-wght-normal.woff2", "fonts/serif/noto-serif-kr-94-wght-normal.woff2", "fonts/serif/noto-serif-kr-95-wght-normal.woff2", "fonts/serif/noto-serif-kr-96-wght-normal.woff2", "fonts/serif/noto-serif-kr-97-wght-normal.woff2", "fonts/serif/noto-serif-kr-98-wght-normal.woff2", "fonts/serif/noto-serif-kr-99-wght-normal.woff2", "fonts/serif/noto-serif-kr-cyrillic-wght-normal.woff2", "fonts/serif/noto-serif-kr-latin-ext-wght-normal.woff2", "fonts/serif/noto-serif-kr-latin-wght-normal.woff2", "fonts/serif/noto-serif-kr-vietnamese-wght-normal.woff2", "vendor/cmaps/Adobe-Korea1-0.bcmap", "vendor/cmaps/Adobe-Korea1-1.bcmap", "vendor/cmaps/Adobe-Korea1-2.bcmap", "vendor/cmaps/Adobe-Korea1-UCS2.bcmap", "vendor/cmaps/KSC-EUC-H.bcmap", "vendor/cmaps/KSC-EUC-V.bcmap", "vendor/cmaps/KSC-H.bcmap", "vendor/cmaps/KSC-Johab-H.bcmap", "vendor/cmaps/KSC-Johab-V.bcmap", "vendor/cmaps/KSC-V.bcmap", "vendor/cmaps/KSCms-UHC-H.bcmap", "vendor/cmaps/KSCms-UHC-HW-H.bcmap", "vendor/cmaps/KSCms-UHC-HW-V.bcmap", "vendor/cmaps/KSCms-UHC-V.bcmap", "vendor/cmaps/KSCpc-EUC-H.bcmap", "vendor/cmaps/KSCpc-EUC-V.bcmap", "vendor/cmaps/UniKS-UCS2-H.bcmap", "vendor/cmaps/UniKS-UCS2-V.bcmap", "vendor/cmaps/UniKS-UTF16-H.bcmap", "vendor/cmaps/UniKS-UTF16-V.bcmap", "vendor/cmaps/UniKS-UTF32-H.bcmap", "vendor/cmaps/UniKS-UTF32-V.bcmap", "vendor/cmaps/UniKS-UTF8-H.bcmap", "vendor/cmaps/UniKS-UTF8-V.bcmap", "vendor/pdf.min.mjs", "vendor/pdf.worker.min.mjs"];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(CORE);                                   // 핵심 파일은 모두 성공해야 설치
    for (let i = 0; i < LAZY.length; i += 8) {               // 글꼴·PDF 엔진은 가능한 만큼 미리 저장
      await Promise.all(LAZY.slice(i, i + 8).map((u) => c.add(u).catch(() => {})));
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith('seojae-') && k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    const hit = await c.match(req, { ignoreSearch: true });
    if (hit) return hit;
    try {
      const res = await fetch(req);
      if (res && res.ok) c.put(req, res.clone());
      return res;
    } catch (err) {
      if (req.mode === 'navigate') return (await c.match('index.html')) || (await c.match('./'));
      throw err;
    }
  })());
});
