/* 서재 · 오프라인 독서 앱 */
(function () {
  'use strict';
  const SJ = window.SJ;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;

  /* ═════════ 아이콘 ═════════ */
  const ICONS = {
    library: '<path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/>',
    list: '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/>',
    bookmark: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
    headphones: '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
    type: '<path d="M21 14h-5"/><path d="M16 16v-3.5a2.5 2.5 0 0 1 5 0V16"/><path d="M4.5 13h6"/><path d="m3 16 4.5-9 4.5 9"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
    folder: '<path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/>',
    clipboard: '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 12h6"/><path d="M9 16h4"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    play: '<polygon class="fill" points="7 3 20 12 7 21 7 3"/>',
    pause: '<rect class="fill" x="14" y="4" width="4" height="16" rx="1"/><rect class="fill" x="6" y="4" width="4" height="16" rx="1"/>',
    skipBack: '<polygon points="19 20 9 12 19 4 19 20"/><line x1="5" x2="5" y1="19" y2="5"/>',
    skipFwd: '<polygon points="5 4 15 12 5 20 5 4"/><line x1="19" x2="19" y1="5" y2="19"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'
  };
  const svg = (n) => '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS[n] + '</svg>';
  const setIcons = (r = document) => $$('[data-i]', r).forEach((e) => { e.innerHTML = svg(e.dataset.i); });

  /* ═════════ 설정 ═════════ */
  const DEFAULTS = { font: 'serif', size: 19, ls: 0, lh: 1.9, pad: 'normal', theme: 'auto', autohide: true, tap: false, dlg: true, justify: false, wake: false, rate: 1, voice: '', lastLight: 'light' };
  let S = Object.assign({}, DEFAULTS);
  try { Object.assign(S, JSON.parse(localStorage.getItem('seojae.settings') || '{}')); } catch (e) { /* 기본값 */ }
  const saveSettings = () => { try { localStorage.setItem('seojae.settings', JSON.stringify(S)); } catch (e) { /* 저장 불가 */ } };
  const mq = matchMedia('(prefers-color-scheme: dark)');

  function applySettings() {
    const th = S.theme === 'auto' ? (mq.matches ? 'night' : 'light') : S.theme;
    root.dataset.theme = th;
    const mc = { light: '#faf7f2', sepia: '#f1e6cf', night: '#111214' }[th];
    $('meta[name=theme-color]').content = mc;
    root.style.setProperty('--fs', S.size + 'px');
    root.style.setProperty('--lh', S.lh);
    root.style.setProperty('--ls', S.ls + 'em');
    root.style.setProperty('--fam', 'var(--f-' + S.font + ')');
    const page = $('#page');
    page.classList.remove('pad-narrow', 'pad-normal', 'pad-wide');
    page.classList.add('pad-' + S.pad);
    $('#topbar').className = 'pad-' + S.pad;
    page.classList.toggle('justify', !!S.justify);
    page.classList.toggle('dlg', !!S.dlg);
    const night = th === 'night';
    [$('#home-theme'), $('#isl-night')].forEach((b) => { b.innerHTML = svg(night ? 'sun' : 'moon'); b.firstChild.style.cssText = 'width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round'; });
    syncSettingsUI();
  }
  mq.addEventListener('change', () => { if (S.theme === 'auto') applySettings(); });

  function toggleNight() {
    const cur = root.dataset.theme;
    if (cur === 'night') S.theme = S.lastLight || 'light';
    else { S.lastLight = cur; S.theme = 'night'; }
    saveSettings(); applySettings();
  }

  function syncSettingsUI() {
    $$('#set-font button').forEach((b) => b.classList.toggle('on', b.dataset.v === S.font));
    $$('#set-pad button').forEach((b) => b.classList.toggle('on', b.dataset.v === S.pad));
    $$('#set-theme button').forEach((b) => b.classList.toggle('on', b.dataset.v === S.theme));
    $('#set-size').value = S.size; $('#set-size-o').textContent = S.size + 'px';
    $('#set-ls').value = S.ls; $('#set-ls-o').textContent = (S.ls * 100).toFixed(1).replace('-', '−');
    $('#set-lh').value = S.lh; $('#set-lh-o').textContent = Number(S.lh).toFixed(2);
    $('#set-autohide').checked = S.autohide; $('#set-tap').checked = S.tap; $('#set-dlg').checked = S.dlg;
    $('#set-justify').checked = S.justify; $('#set-wake').checked = S.wake;
    $('#tts-rate').value = S.rate; $('#tts-rate-o').textContent = Number(S.rate).toFixed(1) + '×';
  }

  function bindSettings() {
    const change = (k, v, layout) => { S[k] = v; saveSettings(); applySettings(); if (layout) realign(); };
    $('#set-font').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) change('font', b.dataset.v, true); });
    $('#set-pad').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) change('pad', b.dataset.v, true); });
    $('#set-theme').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) change('theme', b.dataset.v); });
    $('#set-size').addEventListener('input', (e) => change('size', +e.target.value, true));
    $('#set-ls').addEventListener('input', (e) => change('ls', +e.target.value, true));
    $('#set-lh').addEventListener('input', (e) => change('lh', +e.target.value, true));
    $$('.step').forEach((b) => b.addEventListener('click', () => { const [k, d] = b.dataset.step.split(':'); change(k, Math.min(34, Math.max(14, S[k] + +d)), true); }));
    $('#set-autohide').addEventListener('change', (e) => { change('autohide', e.target.checked); if (!e.target.checked) showChrome(); });
    $('#set-tap').addEventListener('change', (e) => change('tap', e.target.checked));
    $('#set-dlg').addEventListener('change', (e) => change('dlg', e.target.checked, true));
    $('#set-justify').addEventListener('change', (e) => change('justify', e.target.checked, true));
    $('#set-wake').addEventListener('change', (e) => { change('wake', e.target.checked); updateWake(); });
  }

  /* ═════════ 저장소(IndexedDB) ═════════ */
  let dbp;
  function db() {
    if (dbp) return dbp;
    dbp = new Promise((res, rej) => {
      const r = indexedDB.open('seojae', 1);
      r.onupgradeneeded = () => { const d = r.result; d.createObjectStore('meta', { keyPath: 'id' }); d.createObjectStore('docs', { keyPath: 'id' }); };
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
    return dbp;
  }
  async function idb(store, mode, fn) {
    const d = await db();
    return new Promise((res, rej) => {
      const t = d.transaction(store, mode);
      const st = Array.isArray(store) ? null : t.objectStore(store);
      const rq = fn(st, t);
      t.oncomplete = () => res(rq && 'result' in rq ? rq.result : undefined);
      t.onerror = () => rej(t.error);
      t.onabort = () => rej(t.error);
    });
  }
  const getAllMeta = () => idb('meta', 'readonly', (s) => s.getAll());
  const getMeta = (id) => idb('meta', 'readonly', (s) => s.get(id));
  const putMeta = (m) => idb('meta', 'readwrite', (s) => s.put(m));
  const getDoc = (id) => idb('docs', 'readonly', (s) => s.get(id));
  const putDoc = (d) => idb('docs', 'readwrite', (s) => s.put(d));
  const delBook = (id) => idb(['meta', 'docs'], 'readwrite', (_, t) => { t.objectStore('meta').delete(id); t.objectStore('docs').delete(id); });

  /* 닫는 순간 못 쓴 위치를 대비한 백업 */
  const readBackup = () => { try { return JSON.parse(localStorage.getItem('seojae.pos') || '{}'); } catch (e) { return {}; } };
  const writeBackup = (id, v) => { try { const o = readBackup(); o[id] = v; localStorage.setItem('seojae.pos', JSON.stringify(o)); } catch (e) { /* 무시 */ } };

  /* ═════════ 공용 UI ═════════ */
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let toastT;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2400);
  }
  const loader = {
    show(t) { $('#loader-t').textContent = t || '불러오는 중…'; $('#loader').hidden = false; },
    text(t) { $('#loader-t').textContent = t; },
    hide() { $('#loader').hidden = true; }
  };
  function modal({ title, body, buttons }) {
    return new Promise((resolve) => {
      $('#m-title').textContent = title;
      const mb = $('#m-body'); mb.textContent = ''; if (typeof body === 'string') { const p = document.createElement('p'); p.textContent = body; mb.appendChild(p); } else if (body) mb.appendChild(body);
      const bt = $('#m-btns'); bt.textContent = '';
      const close = (v) => { $('#modal').hidden = true; resolve(v); };
      buttons.forEach((b) => { const el = document.createElement('button'); el.textContent = b.label; if (b.cls) el.className = b.cls; el.onclick = () => close(b.value); bt.appendChild(el); });
      $('#modal').onclick = (e) => { if (e.target.id === 'modal') close(null); };
      $('#modal').hidden = false;
      const first = $('textarea,input', mb); if (first) setTimeout(() => first.focus(), 50);
      modal.close = close;
    });
  }
  const confirmDlg = (title, msg, ok, danger) => modal({ title, body: msg, buttons: [{ label: '취소', value: false }, { label: ok, value: true, cls: danger ? 'dng' : 'pri' }] });

  const COVERS = ['#3d4f63', '#3f5a4d', '#5b4458', '#7a5a33', '#2f3d49', '#55383d', '#33545a', '#4b4a3c'];
  const hash = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };
  function ago(ts) {
    const d = (Date.now() - ts) / 1000;
    if (d < 60) return '방금'; if (d < 3600) return Math.floor(d / 60) + '분 전';
    if (d < 86400) return Math.floor(d / 3600) + '시간 전'; if (d < 86400 * 30) return Math.floor(d / 86400) + '일 전';
    return new Date(ts).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  const shortTitle = (t, n) => (t.length > n ? t.slice(0, n - 1) + '…' : t);

  /* ═════════ 서재 화면 ═════════ */
  const metas = new Map();
  async function loadMetas() {
    const list = await getAllMeta(); const bk = readBackup();
    metas.clear();
    list.forEach((m) => { const b = bk[m.id]; if (b && b.t > (m.pos ? m.pos.t : 0)) { m.pos = { b: b.b, t: b.t }; m.pct = b.pct; m.chTitle = b.ch; } metas.set(m.id, m); });
  }

  function coverEl(m, withBar) {
    const c = document.createElement('span'); c.className = 'cover'; c.style.setProperty('--c', COVERS[m.color % COVERS.length]);
    c.innerHTML = '<span class="ct">' + esc(shortTitle(m.title, 18)) + '</span><span class="cf">' + esc(m.fmt) + '</span>' +
      (withBar ? '<span class="bar"><i style="width:' + (m.pct || 0) + '%"></i></span>' : '');
    return c;
  }

  function renderHome() {
    const list = [...metas.values()].sort((a, b) => b.opened - a.opened);
    const shelf = $('#shelf'); shelf.textContent = '';
    $('#empty').hidden = list.length > 0;
    $('#shelf-count').textContent = list.length ? list.length + '권' : '';
    list.forEach((m) => {
      const el = document.createElement('div'); el.className = 'book';
      const open = document.createElement('button'); open.className = 'open'; open.setAttribute('aria-label', m.title + ' 이어 읽기');
      open.appendChild(coverEl(m, true));
      const meta = document.createElement('div'); meta.className = 'meta';
      meta.innerHTML = '<div class="bt">' + esc(m.title) + '</div><div class="bs">' + (m.pct || 0) + '% · ' + ago(m.opened) + '</div>';
      open.appendChild(meta);
      open.onclick = () => openBook(m.id);
      const del = document.createElement('button'); del.className = 'del'; del.setAttribute('aria-label', m.title + ' 삭제'); del.innerHTML = '<span class="ico">' + svg('trash') + '</span>';
      del.onclick = async (e) => {
        e.stopPropagation();
        const ok = await confirmDlg('서재에서 삭제할까요?', '‘' + shortTitle(m.title, 30) + '’과(와) 읽던 위치, 책갈피가 함께 지워져요.', '삭제', true);
        if (ok) { await delBook(m.id); metas.delete(m.id); renderHome(); toast('삭제했어요'); }
      };
      el.append(open, del); shelf.appendChild(el);
    });
    const res = $('#resume');
    if (list.length) {
      const m = list[0]; res.hidden = false; res.textContent = '';
      const b = document.createElement('button');
      const cv = coverEl(m, false);
      const body = document.createElement('span'); body.className = 'r-body';
      body.innerHTML = '<div class="r-k">이어 읽기</div><div class="r-t">' + esc(m.title) + '</div><div class="r-s">' + esc(m.chTitle || '처음부터') + ' · ' + (m.pct || 0) + '%</div><div class="bar"><i style="width:' + (m.pct || 0) + '%"></i></div>';
      b.append(cv, body); b.onclick = () => openBook(m.id); res.appendChild(b);
    } else res.hidden = true;
  }

  /* ═════════ 파일 가져오기 ═════════ */
  const EXT = { txt: 'txt', text: 'txt', md: 'md', markdown: 'md', html: 'html', htm: 'html', xhtml: 'html', docx: 'docx', pdf: 'pdf', epub: 'epub' };
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  async function parseBuffer(fmt, buf) {
    if (fmt === 'txt') { const d = SJ.decodeText(buf); return { blocks: SJ.parseText(d.text) }; }
    if (fmt === 'md') { const d = SJ.decodeText(buf); return { blocks: SJ.parseMd(d.text) }; }
    if (fmt === 'html') { const d = SJ.decodeText(buf); return SJ.parseHtmlString(d.text); }
    if (fmt === 'docx') return SJ.parseDocx(buf);
    if (fmt === 'epub') return SJ.parseEpub(buf);
    if (fmt === 'pdf') return SJ.parsePdf(buf, (p, n) => loader.text('PDF 글자를 읽는 중… ' + p + '/' + n));
    throw new Error('지원하지 않는 형식이에요.');
  }

  async function addBook({ blocks, title, author, fmt, size, hasOutline }) {
    blocks = blocks.filter((b) => b[0] !== 'h' || b[2]);
    if (!hasOutline && fmt !== 'txt') blocks = SJ.ensureHeadings(blocks);
    if (!blocks.some((b) => b[0] === 'p' || b[0] === 'q')) throw new Error('읽을 글이 없는 파일이에요.');
    const cum = SJ.prefixSums(blocks);
    const id = uid(); const now = Date.now();
    const m = { id, title, author: author || '', fmt, size, added: now, opened: now, total: blocks.length, chars: cum[blocks.length], pos: { b: 0, t: now }, pct: 0, chTitle: '', mode: 'auto', seg: 6000, marks: [], color: hash(title) };
    await putDoc({ id, blocks }); await putMeta(m); metas.set(id, m);
    return id;
  }

  async function importFile(file, openAfter) {
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    let fmt = EXT[ext] || (/^text\//.test(file.type) ? 'txt' : '');
    if (!fmt) { toast('txt, docx, pdf, epub, md, html 파일만 열 수 있어요.'); return null; }
    const base = file.name.replace(/\.[^.]+$/, '');
    for (const m of metas.values()) if (m.title === base && m.size === file.size && m.fmt === fmt) { if (openAfter) openBook(m.id); return m.id; }
    loader.show('파일을 읽는 중…');
    try {
      const buf = await file.arrayBuffer();
      const r = await parseBuffer(fmt, buf);
      const title = (fmt === 'epub' && r.title) ? r.title : base;
      const id = await addBook({ blocks: r.blocks, title, author: r.author, fmt, size: file.size, hasOutline: r.hasOutline });
      renderHome(); loader.hide();
      if (openAfter) openBook(id);
      return id;
    } catch (err) {
      loader.hide(); console.error(err);
      toast(err.message === 'NO_TEXT' ? '글자가 없는 스캔본 PDF는 읽을 수 없어요.' : (err.message || '파일을 읽지 못했어요.'));
      return null;
    }
  }

  async function importFiles(files) {
    files = [...files]; if (!files.length) return;
    if (files.length === 1) { await importFile(files[0], true); return; }
    let ok = 0;
    for (const f of files) if (await importFile(f, false)) ok++;
    renderHome(); if (ok) toast(ok + '권을 서재에 담았어요');
  }

  async function pasteDialog() {
    const wrap = document.createElement('div');
    wrap.innerHTML = '<input type="text" id="p-title" placeholder="제목 (비워두면 첫 줄로 정해요)" maxlength="80" autocomplete="off"><textarea id="p-text" placeholder="여기에 글을 붙여넣으세요" spellcheck="false"></textarea>';
    const pb = document.createElement('button'); pb.className = 'link-btn'; pb.textContent = '클립보드에서 가져오기';
    pb.onclick = async () => { try { $('#p-text').value = await navigator.clipboard.readText(); } catch (e) { toast('붙여넣기 권한이 없어요. 입력칸을 길게 눌러 붙여넣어 주세요.'); } };
    wrap.appendChild(pb);
    const v = await modal({ title: '텍스트 붙여넣기', body: wrap, buttons: [{ label: '취소', value: false }, { label: '읽기 시작', value: true, cls: 'pri' }] });
    if (!v) return;
    const text = $('#p-text') ? $('#p-text').value : '';
    const t = $('#p-title') ? $('#p-title').value.trim() : '';
    if (!text.trim()) { toast('붙여넣은 글이 없어요.'); return; }
    try {
      const blocks = SJ.parseText(text);
      const first = (text.split('\n').find((l) => l.trim()) || '').trim();
      const title = t || shortTitle(first, 24) || '붙여넣은 글';
      const id = await addBook({ blocks, title, fmt: 'txt', size: text.length });
      renderHome(); openBook(id);
    } catch (e) { toast(e.message || '저장하지 못했어요.'); }
  }

  /* ═════════ 리더 ═════════ */
  const R = { meta: null, blocks: [], cum: null, chapters: [], kind: 'explicit', forced: false, ci: 0, els: [], tops: [], bots: [], dirty: true, b: 0, lastY: 0, lock: 0, sheet: null, saveT: 0, homeY: 0 };
  const DLG = /^[“"‘'「『]/;

  const chapterOf = (b) => { let lo = 0, hi = R.chapters.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (R.chapters[m].start <= b) lo = m; else hi = m - 1; } return lo; };
  const pctOf = (b) => (R.cum[R.blocks.length] ? Math.min(100, Math.floor((R.cum[Math.min(b, R.blocks.length)] / R.cum[R.blocks.length]) * 100)) : 0);

  function rebuild() {
    const r = SJ.buildChapters(R.blocks, R.cum, R.meta);
    R.chapters = r.chapters; R.kind = r.kind; R.forced = !!r.forced;
  }

  async function openBook(id) {
    loader.show('여는 중…');
    try {
      const meta = metas.get(id) || await getMeta(id);
      const doc = await getDoc(id);
      if (!doc || !meta) throw new Error('책을 찾을 수 없어요.');
      meta.opened = Date.now(); meta.marks = meta.marks || [];
      R.meta = meta; R.blocks = doc.blocks; R.cum = SJ.prefixSums(doc.blocks); rebuild();
      stopTts(true);
      view('reader');
      history.pushState({ r: id }, '');
      const b = Math.min(meta.pos ? meta.pos.b : 0, R.blocks.length - 1);
      renderChapter(chapterOf(b), b, true);
      showChrome();
      putMeta(meta); updateWake();
    } catch (e) { console.error(e); toast(e.message || '열지 못했어요.'); }
    loader.hide();
  }

  function view(name) {
    const reader = name === 'reader';
    if (reader) R.homeY = window.scrollY;
    $('#home').hidden = reader; $('#reader').hidden = !reader;
    document.body.classList.toggle('home-on', !reader);
    if (!reader) closeSheet();
    window.scrollTo(0, reader ? 0 : R.homeY);
  }

  async function closeReader() {
    if ($('#reader').hidden) return;
    clearTimeout(R.saveT); saveNow(true); stopTts(true); releaseWake();
    await loadMetas(); renderHome(); view('home');
  }
  function goHome() { if (history.state && history.state.r) history.back(); else closeReader(); }
  window.addEventListener('popstate', () => { if (!$('#reader').hidden) closeReader(); });

  function renderChapter(ci, targetB, restore) {
    ci = Math.max(0, Math.min(R.chapters.length - 1, ci));
    const ch = R.chapters[ci]; R.ci = ci;
    const page = $('#page'); page.textContent = '';
    const frag = document.createDocumentFragment();
    const head = document.createElement('header'); head.className = 'ch-head';
    if (ch.seg) { const sub = document.createElement('div'); sub.className = 'ch-sub'; sub.textContent = R.meta.title; head.appendChild(sub); }
    const h = document.createElement('h2'); h.className = 'ch-title'; h.textContent = ch.seg ? ch.title : ch.title; head.appendChild(h);
    frag.appendChild(head);
    const marks = new Set(R.meta.marks.map((m) => m.b));
    for (let i = ch.bodyStart; i < ch.end; i++) {
      const b = R.blocks[i]; let el;
      if (b[0] === 'p') { el = document.createElement('p'); el.textContent = b[1]; if (DLG.test(b[1])) el.className = 'dlg'; }
      else if (b[0] === 'q') { el = document.createElement('blockquote'); el.textContent = b[1]; }
      else if (b[0] === 'h') { el = document.createElement('h3'); el.className = 'sub'; el.textContent = b[2]; }
      else { el = document.createElement('div'); el.className = 'sep'; el.setAttribute('role', 'separator'); }
      el.dataset.b = i; if (marks.has(i)) el.classList.add('marked');
      frag.appendChild(el);
    }
    const nav = document.createElement('div'); nav.className = 'ch-nav';
    const prev = R.chapters[ci - 1], next = R.chapters[ci + 1];
    nav.innerHTML = '<button class="prev" data-d="-1"' + (prev ? '' : ' disabled') + '>이전<small>' + esc(prev ? prev.title : '처음이에요') + '</small></button>' +
      '<button class="next" data-d="1"' + (next ? '' : ' disabled') + '>다음<small>' + esc(next ? next.title : '마지막이에요') + '</small></button>';
    frag.appendChild(nav);
    page.appendChild(frag);
    R.els = $$('[data-b]', page); R.dirty = true;
    $('#tb-title').textContent = ch.seg ? R.meta.title : ch.title;
    const b = targetB == null ? ch.start : targetB;
    R.b = b;
    scrollToB(b);
    if (restore) lockPosition();
    updateReadout(); saveSoon();
    if (!restore || targetB == null) { /* 새 장은 맨 위부터 */ }
  }

  function scrollToB(b) {
    if (b <= R.chapters[R.ci].bodyStart) { window.scrollTo(0, 0); return; }
    let el = R.els.find((e) => +e.dataset.b >= b);
    if (!el) el = R.els[R.els.length - 1];
    if (el) window.scrollTo(0, Math.max(0, el.getBoundingClientRect().top + window.scrollY - 76));
  }
  /* 글꼴이 늦게 도착해 줄바꿈이 바뀌어도 읽던 곳을 놓치지 않도록 잠깐 고정 */
  function lockPosition() { R.lock = Date.now() + 1800; }
  function realign() { R.dirty = true; lockPosition(); requestAnimationFrame(() => scrollToB(R.b)); }
  ['touchstart', 'wheel', 'keydown', 'mousedown'].forEach((ev) => window.addEventListener(ev, () => { R.lock = 0; }, { passive: true }));
  if (window.ResizeObserver) new ResizeObserver(() => { R.dirty = true; if (R.lock > Date.now() && !$('#reader').hidden) scrollToB(R.b); }).observe($('#page'));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { R.dirty = true; });

  function measure() {
    const y = window.scrollY;
    R.tops = R.els.map((e) => e.getBoundingClientRect().top + y);
    R.bots = R.els.map((e, i) => R.tops[i] + e.offsetHeight);
    R.dirty = false;
  }
  function visibleRange() {
    if (!R.els.length) return [R.b, R.b];
    if (R.dirty) measure();
    const y = window.scrollY + 76; let lo = 0, hi = R.els.length - 1;
    while (lo < hi) { const m = (lo + hi) >> 1; if (R.bots[m] > y) hi = m; else lo = m + 1; }
    const first = lo; const yb = window.scrollY + window.innerHeight; let last = first;
    while (last + 1 < R.els.length && R.tops[last + 1] < yb) last++;
    return [+R.els[first].dataset.b, +R.els[last].dataset.b];
  }

  function updateReadout() {
    const p = pctOf(R.b);
    $('#tb-pct').textContent = p + '%';
    $('#progress i').style.width = p + '%';
    refreshMarkLit();
  }

  /* 위치 저장 */
  function saveSoon() { clearTimeout(R.saveT); R.saveT = setTimeout(() => saveNow(false), 700); }
  function saveNow(sync) {
    if (!R.meta) return;
    const ch = R.chapters[R.ci];
    R.meta.pos = { b: R.b, t: Date.now() }; R.meta.pct = pctOf(R.b); R.meta.chTitle = ch ? ch.title : '';
    writeBackup(R.meta.id, { b: R.b, t: R.meta.pos.t, pct: R.meta.pct, ch: R.meta.chTitle });
    putMeta(R.meta).catch(() => {});
  }
  window.addEventListener('pagehide', () => { if (!$('#reader').hidden) saveNow(true); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && !$('#reader').hidden) saveNow(true); else updateWake(); });

  /* 스크롤: 위치 추적 + 메뉴 자동 숨김 */
  let ticking = false;
  window.addEventListener('scroll', () => {
    if ($('#reader').hidden || ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const [a] = visibleRange();
      if (a !== R.b) { R.b = a; updateReadout(); saveSoon(); }
      const y = window.scrollY; const d = y - R.lastY;
      if (S.autohide && !R.sheet && !tts.on && Math.abs(d) > 8) { if (d > 0 && y > 90) hideChrome(); else if (d < 0) showChrome(); }
      if (y < 40 || y + innerHeight >= document.documentElement.scrollHeight - 40) showChrome();
      R.lastY = y;
    });
  }, { passive: true });

  const showChrome = () => document.body.classList.remove('chrome-off');
  const hideChrome = () => { if (!R.sheet) document.body.classList.add('chrome-off'); };

  $('#page').addEventListener('click', (e) => {
    const nb = e.target.closest('.ch-nav button');
    if (nb) { if (!nb.disabled) renderChapter(R.ci + +nb.dataset.d, null); return; }
    if (R.sheet) { closeSheet(); return; }
    const sel = window.getSelection(); if (sel && String(sel).length > 0) return;
    const fy = e.clientY / innerHeight;
    if (S.tap && fy < 0.26) { window.scrollBy({ top: -innerHeight * 0.88, behavior: 'smooth' }); return; }
    if (S.tap && fy > 0.74) { window.scrollBy({ top: innerHeight * 0.88, behavior: 'smooth' }); return; }
    document.body.classList.toggle('chrome-off');
  });

  /* ═════════ 시트(목차·책갈피·읽어주기·설정) ═════════ */
  const SHEETS = { toc: '#sheet-toc', marks: '#sheet-marks', tts: '#sheet-tts', settings: '#sheet-settings' };
  function openSheet(name) {
    if (R.sheet === name) { closeSheet(); return; }
    closeSheet(true); R.sheet = name; showChrome();
    const el = $(SHEETS[name]); el.classList.add('open'); el.setAttribute('aria-hidden', 'false'); el.scrollTop = 0;
    const sc = $('#scrim'); sc.hidden = false; requestAnimationFrame(() => sc.classList.add('show'));
    $$('#island button').forEach((b) => b.classList.toggle('on', b.dataset.act === name));
    if (name === 'toc') renderToc(); if (name === 'marks') renderMarks(); if (name === 'tts') renderTtsSheet(); if (name === 'settings') syncSettingsUI();
  }
  function closeSheet(keepScrim) {
    R.sheet = null;
    $$('.sheet.open').forEach((s) => { s.classList.remove('open'); s.setAttribute('aria-hidden', 'true'); });
    $$('#island button').forEach((b) => b.classList.remove('on'));
    if (!keepScrim) { const sc = $('#scrim'); sc.classList.remove('show'); setTimeout(() => { if (!R.sheet) sc.hidden = true; }, 250); }
  }
  $('#scrim').addEventListener('click', () => closeSheet());
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (!$('#modal').hidden) modal.close(null); else closeSheet(); } });

  $('#island').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const a = b.dataset.act;
    if (a === 'home') goHome(); else if (a === 'night') toggleNight(); else openSheet(a);
  });

  /* 목차 */
  function renderToc() {
    const list = $('#toc-list'); list.textContent = '';
    const seg = R.meta.mode === 'seg';
    $$('#toc-mode button').forEach((b) => b.classList.toggle('on', (b.dataset.mode === 'seg') === seg));
    $('#toc-seg').hidden = R.kind !== 'seg';
    $$('#toc-seg button').forEach((b) => b.classList.toggle('on', +b.dataset.seg === R.meta.seg));
    const note = $('#toc-note'); note.hidden = false;
    if (R.kind === 'explicit') note.textContent = '파일에서 찾은 제목 ' + R.chapters.length + '개로 목차를 만들었어요.';
    else if (R.forced) note.textContent = '목차로 쓸 제목을 찾지 못해 ' + R.meta.seg.toLocaleString() + '자 단위로 나눴어요.';
    else note.textContent = R.meta.seg.toLocaleString() + '자 단위로 나눈 구간이에요.';
    $('#toc-count').textContent = R.chapters.length + '개';
    const frag = document.createDocumentFragment();
    R.chapters.forEach((c, i) => {
      const li = document.createElement('li'); if (i === R.ci) li.className = 'cur';
      const b = document.createElement('button');
      b.innerHTML = '<span class="t">' + esc(c.title) + '</span>' + (c.sub ? '<span class="s">' + esc(c.sub) + '</span>' : '<span class="s">' + pctOf(c.start) + '%</span>');
      b.onclick = () => { closeSheet(); renderChapter(i, c.start); };
      li.appendChild(b); frag.appendChild(li);
    });
    list.appendChild(frag);
    const cur = $('li.cur', list); if (cur) requestAnimationFrame(() => cur.scrollIntoView({ block: 'center' }));
  }
  $('#toc-mode').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    R.meta.mode = b.dataset.mode; putMeta(R.meta); rebuild(); renderChapter(chapterOf(R.b), R.b, true); renderToc();
  });
  $('#toc-seg').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    R.meta.seg = +b.dataset.seg; putMeta(R.meta); rebuild(); renderChapter(chapterOf(R.b), R.b, true); renderToc();
  });

  /* 책갈피 */
  const visibleMarks = () => { const [a, z] = visibleRange(); return R.meta.marks.filter((m) => m.b >= a && m.b <= z); };
  function refreshMarkLit() { if (!R.meta) return; $('#isl-mark').classList.toggle('lit', visibleMarks().length > 0); }
  function snippetAt(b) {
    for (let i = b; i < Math.min(R.blocks.length, b + 6); i++) { const x = R.blocks[i]; if (x[0] === 'p' || x[0] === 'q') return shortTitle(x[1], 70); if (x[0] === 'h') return shortTitle(x[2], 70); }
    return '';
  }
  function toggleMark() {
    const vm = visibleMarks();
    if (vm.length) { R.meta.marks = R.meta.marks.filter((m) => !vm.includes(m)); toast('책갈피를 뺐어요'); }
    else { const ch = R.chapters[chapterOf(R.b)]; R.meta.marks.push({ b: R.b, t: Date.now(), ch: ch.title, s: snippetAt(R.b), pct: pctOf(R.b) }); toast('책갈피를 꽂았어요'); }
    putMeta(R.meta);
    const set = new Set(R.meta.marks.map((m) => m.b));
    R.els.forEach((e) => e.classList.toggle('marked', set.has(+e.dataset.b)));
    refreshMarkLit(); renderMarks();
  }
  function renderMarks() {
    const vm = visibleMarks().length > 0;
    const add = $('#mark-add'); add.textContent = vm ? '이 위치의 책갈피 빼기' : '지금 위치에 책갈피 꽂기'; add.classList.toggle('off', vm);
    const ul = $('#marks-list'); ul.textContent = '';
    const ms = [...R.meta.marks].sort((a, b) => a.b - b.b);
    $('#marks-count').textContent = ms.length ? ms.length + '개' : '';
    if (!ms.length) { const li = document.createElement('li'); li.innerHTML = '<p class="note" style="padding:10px">꽂아 둔 책갈피가 없어요.</p>'; ul.appendChild(li); return; }
    ms.forEach((m) => {
      const li = document.createElement('li');
      const go = document.createElement('button'); go.className = 'go';
      go.innerHTML = '<span class="mt">' + esc(m.ch) + ' · ' + m.pct + '%</span><span class="ms">' + esc(m.s) + '</span>';
      go.onclick = () => { closeSheet(); const ci = chapterOf(m.b); if (ci === R.ci) scrollToB(m.b); else renderChapter(ci, m.b); };
      const x = document.createElement('button'); x.className = 'x'; x.setAttribute('aria-label', '책갈피 삭제'); x.innerHTML = '<span class="ico">' + svg('x') + '</span>';
      x.onclick = () => {
        R.meta.marks = R.meta.marks.filter((k) => k !== m); putMeta(R.meta);
        R.els.forEach((e) => { if (+e.dataset.b === m.b) e.classList.remove('marked'); });
        refreshMarkLit(); renderMarks();
      };
      li.append(go, x); ul.appendChild(li);
    });
  }
  $('#mark-add').addEventListener('click', toggleMark);

  /* ═════════ 소리 내어 읽기(TTS) ═════════ */
  const tts = { on: false, b: 0, chunks: [], i: 0, token: 0, u: null };
  const hasTts = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

  function chunkText(t) {
    const parts = t.match(/[^.!?…。！？\n]+[.!?…。！？”"'’」』)]*\s*|[^]+$/g) || [t];
    const out = []; let cur = '';
    parts.forEach((p) => { if ((cur + p).length > 160 && cur) { out.push(cur); cur = p; } else cur += p; });
    if (cur.trim()) out.push(cur);
    return out.flatMap((s) => (s.length > 220 ? (s.match(/.{1,200}(\s|$)/g) || [s]) : [s])).map((s) => s.trim()).filter(Boolean);
  }
  function pickVoice() {
    if (!hasTts) return null;
    const vs = speechSynthesis.getVoices();
    return vs.find((v) => v.voiceURI === S.voice) || vs.find((v) => /^ko/i.test(v.lang)) || null;
  }
  function fillVoices() {
    if (!hasTts) return;
    const sel = $('#tts-voice'); const vs = speechSynthesis.getVoices();
    const ko = vs.filter((v) => /^ko/i.test(v.lang)); const list = ko.length ? ko : vs;
    sel.textContent = '';
    list.forEach((v) => { const o = document.createElement('option'); o.value = v.voiceURI; o.textContent = v.name; sel.appendChild(o); });
    const cur = pickVoice(); if (cur) sel.value = cur.voiceURI;
    const n = $('#tts-note');
    n.hidden = !!ko.length || !vs.length;
    n.textContent = '한국어 목소리를 찾지 못했어요. 기기 설정에서 한국어 음성을 내려받으면 쓸 수 있어요.';
  }
  if (hasTts) { fillVoices(); speechSynthesis.addEventListener('voiceschanged', fillVoices); }
  $('#tts-voice').addEventListener('change', (e) => { S.voice = e.target.value; saveSettings(); if (tts.on) ttsFrom(tts.b); });
  $('#tts-rate').addEventListener('input', (e) => { S.rate = +e.target.value; $('#tts-rate-o').textContent = S.rate.toFixed(1) + '×'; saveSettings(); });
  $('#tts-rate').addEventListener('change', () => { if (tts.on) ttsFrom(tts.b); });

  function ttsUI() {
    $('#tts-play').innerHTML = '<span class="ico">' + svg(tts.on ? 'pause' : 'play') + '</span>';
    $('#tts-play').setAttribute('aria-label', tts.on ? '멈춤' : '재생');
    $('#tts-state').textContent = tts.on ? '읽는 중' : '';
    $('#isl-tts').classList.toggle('lit', false);
    $('#isl-tts').style.color = tts.on && R.sheet !== 'tts' ? 'var(--accent)' : '';
    const b = R.blocks[tts.b]; const now = $('#tts-now');
    if (tts.on && b) now.textContent = b[0] === 'h' ? b[2] : (b[1] || ''); else now.textContent = '지금 보이는 곳부터 읽어 드려요.';
  }
  function renderTtsSheet() {
    if (!hasTts) { $('#tts-note').hidden = false; $('#tts-note').textContent = '이 브라우저는 소리 내어 읽기를 지원하지 않아요.'; }
    syncSettingsUI(); ttsUI();
  }
  function clearHl() { $$('.tts-on').forEach((e) => e.classList.remove('tts-on')); }

  function nextSpeakable(b, dir) {
    for (let i = b; i >= 0 && i < R.blocks.length; i += dir) { const k = R.blocks[i][0]; if (k === 'p' || k === 'q' || k === 'h') return i; }
    return -1;
  }
  function ttsFrom(b) {
    if (!hasTts) { toast('이 브라우저는 소리 내어 읽기를 지원하지 않아요.'); return; }
    const my = ++tts.token; try { speechSynthesis.cancel(); } catch (e) { /* 무시 */ }
    tts.err = 0; tts.on = true; tts.b = b; ttsUI();
    setTimeout(() => { if (my === tts.token) playBlock(my); }, 80);
  }
  function playBlock(my) {
    if (my !== tts.token) return;
    const i = nextSpeakable(tts.b, 1);
    if (i < 0) { stopTts(); toast('끝까지 읽었어요'); return; }
    tts.b = i;
    const ch = R.chapters[R.ci];
    if (i >= ch.end) { if (R.ci + 1 < R.chapters.length) renderChapter(R.ci + 1, i); else { stopTts(); return; } }
    else if (i < ch.start) renderChapter(chapterOf(i), i);
    const b = R.blocks[i];
    const el = R.els.find((e) => +e.dataset.b === i);
    clearHl();
    if (el) {
      el.classList.add('tts-on');
      const r = el.getBoundingClientRect();
      if (r.top < 90 || r.bottom > innerHeight - 130) window.scrollTo({ top: r.top + window.scrollY - 120, behavior: 'smooth' });
    }
    const text = b[0] === 'h' ? b[2] : b[1];
    tts.chunks = chunkText(text); tts.i = 0; ttsUI();
    speakChunk(my);
  }
  function speakChunk(my) {
    if (my !== tts.token) return;
    if (tts.i >= tts.chunks.length) { tts.b++; playBlock(my); return; }
    const u = new SpeechSynthesisUtterance(tts.chunks[tts.i]);
    u.lang = 'ko-KR'; u.rate = S.rate; const v = pickVoice(); if (v) u.voice = v;
    u.onend = () => { if (my !== tts.token) return; tts.err = 0; tts.i++; speakChunk(my); };
    u.onerror = (e) => {
      if (my !== tts.token) return;
      if (e.error === 'interrupted' || e.error === 'canceled') return;
      tts.err = (tts.err || 0) + 1;                       // 엔진 오류가 이어지면 멈추고 안내
      if (tts.err >= 3) { stopTts(); toast('소리를 낼 수 없어요. 기기의 음성 설정을 확인해 주세요.'); return; }
      tts.i++; speakChunk(my);
    };
    tts.u = u; speechSynthesis.speak(u);
  }
  function stopTts(silent) {
    tts.token++; tts.on = false;
    if (hasTts) try { speechSynthesis.cancel(); } catch (e) { /* 무시 */ }
    clearHl(); if (!silent) ttsUI();
  }
  $('#tts-play').addEventListener('click', () => {
    if (tts.on) { stopTts(); return; }
    const el = R.els.find((e) => +e.dataset.b === tts.b);
    let start = R.b;
    if (el) { const r = el.getBoundingClientRect(); if (r.bottom > 60 && r.top < innerHeight - 60) start = tts.b; }
    ttsFrom(start);
  });
  $('#tts-next').addEventListener('click', () => { const n = nextSpeakable((tts.on ? tts.b : R.b) + 1, 1); if (n >= 0) ttsFrom(n); });
  $('#tts-prev').addEventListener('click', () => { const n = nextSpeakable((tts.on ? tts.b : R.b) - 1, -1); if (n >= 0) ttsFrom(n); });

  /* ═════════ 화면 켜두기 ═════════ */
  let wake = null;
  async function updateWake() {
    if (!S.wake || $('#reader').hidden || document.hidden || !('wakeLock' in navigator)) { releaseWake(); return; }
    if (wake) return;
    try { wake = await navigator.wakeLock.request('screen'); wake.addEventListener('release', () => { wake = null; }); } catch (e) { wake = null; }
  }
  function releaseWake() { if (wake) { wake.release().catch(() => {}); wake = null; } }

  /* ═════════ 시작 ═════════ */
  function bindHome() {
    $('#btn-open').addEventListener('click', () => $('#file').click());
    $('#file').addEventListener('change', (e) => { const f = e.target.files; importFiles(f).finally(() => { e.target.value = ''; }); });
    $('#btn-paste').addEventListener('click', pasteDialog);
    $('#home-theme').addEventListener('click', toggleNight);
    let dc = 0;
    window.addEventListener('dragenter', (e) => { if (e.dataTransfer && [...e.dataTransfer.types].includes('Files')) { dc++; $('#drop').hidden = false; } });
    window.addEventListener('dragleave', () => { dc = Math.max(0, dc - 1); if (!dc) $('#drop').hidden = true; });
    window.addEventListener('dragover', (e) => e.preventDefault());
    window.addEventListener('drop', (e) => { e.preventDefault(); dc = 0; $('#drop').hidden = true; if (e.dataTransfer.files.length) importFiles(e.dataTransfer.files); });
  }

  async function init() {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    setIcons(); bindSettings(); bindHome(); applySettings();
    document.body.classList.add('home-on');
    $('#tts-play').innerHTML = '<span class="ico">' + svg('play') + '</span>';
    try { await loadMetas(); } catch (e) { console.error(e); toast('저장소를 열 수 없어요. 사생활 보호 모드인지 확인해 주세요.'); }
    renderHome();
    if (history.state && history.state.r) history.replaceState(null, '');
    if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
  }
  init();
})();
