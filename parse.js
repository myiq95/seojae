/* 서재 · 문서 파서
   모든 형식을 같은 블록 배열로 바꿉니다.
   ['h', 단계(1~4), 텍스트] 제목 / ['p', 텍스트] 문단 / ['q', 텍스트] 인용 / ['hr'] 장면 구분선 */
(function (global) {
  'use strict';

  const collapse = (s) => String(s).replace(/[\s\u00a0\u3000]+/g, ' ').trim();
  const blockLen = (b) => (b[0] === 'h' ? b[2].length : b[0] === 'hr' ? 0 : b[1].length);

  /* ───── 인코딩: UTF-8 → (실패 시) CP949(ANSI) ───── */
  function decodeText(buf) {
    const u8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
    if (u8[0] === 0xef && u8[1] === 0xbb && u8[2] === 0xbf) return { text: new TextDecoder('utf-8').decode(u8.subarray(3)), enc: 'utf-8' };
    if (u8[0] === 0xff && u8[1] === 0xfe) return { text: new TextDecoder('utf-16le').decode(u8.subarray(2)), enc: 'utf-16le' };
    if (u8[0] === 0xfe && u8[1] === 0xff) return { text: new TextDecoder('utf-16be').decode(u8.subarray(2)), enc: 'utf-16be' };
    try { return { text: new TextDecoder('utf-8', { fatal: true }).decode(u8), enc: 'utf-8' }; } catch (e) { /* 다음 후보 */ }
    try { return { text: new TextDecoder('euc-kr').decode(u8), enc: 'cp949' }; } catch (e) { /* 다음 후보 */ }
    return { text: new TextDecoder('utf-8').decode(u8), enc: 'utf-8' };
  }

  /* ───── 한국어 소설·문서의 제목 줄 판별 ───── */
  const NUM = '0-9０-９一二三四五六七八九十百千零〇일이삼사오육칠팔구십백천';
  const RE_HEAD = new RegExp(
    '^[\\s\\[\\(<【「『《#*=\\-–—~·.]*(?:' +
      '제\\s*[' + NUM + ']+\\s*[장화회부편절권막]' +
      '|(?:chapter|ch\\.?|part|episode|ep\\.?)\\s*[0-9ivxlc]+' +
      '|[0-9]{1,4}\\s*[장화회](?![가-힣])' +
      '|프롤로그|에필로그|서장|종장|서문|머리말|들어가며|작가의\\s*말|후기|외전|번외|prologue|epilogue' +
    ')', 'i');
  const RE_SEP = /^[\s*＊\-–—=~·•◆◇■□○●◎※_#＃]{3,}$/;

  function isHeadingLine(raw, prevBlank) {
    const s = raw.trim();
    if (!s || s.length > 60) return 0;
    const md = s.match(/^(#{1,6})\s+\S/);
    if (md) return Math.min(3, md[1].length);
    if (/[.!?…。！？”"'」』)]$/.test(s) && s.length > 24) return 0;
    const m = s.match(RE_HEAD);
    if (m) {
      const numeric = /\d|[０-９]|제\s*[一二三四五六七八九十百千零〇일이삼사오육칠팔구십백천]/.test(m[0]);
      if (numeric || s.length <= 30) return 1;
    }
    if (prevBlank && /^\d{1,3}[.)]\s+\S/.test(s) && s.length <= 40) return 1;
    return 0;
  }

  function cleanHeading(s) {
    let t = s.trim().replace(/^#{1,6}\s+/, '');
    const wrap = t.match(/^[\[\(<【「『《](.+)[\]\)>】」』》]$/);
    if (wrap) t = wrap[1];
    t = t.replace(/^[=*~\-–—\s]+|[=*~\-–—\s]+$/g, '');
    return collapse(t) || collapse(s);
  }

  /* 줄바꿈이 고정 폭으로 들어간 txt는 문단으로 다시 합칩니다 */
  function maybeUnwrap(lines) {
    const ne = lines.filter((l) => l.trim());
    if (ne.length < 40) return lines;
    const lens = ne.map((l) => l.trim().length).sort((a, b) => a - b);
    const med = lens[lens.length >> 1];
    const p90 = lens[Math.floor(lens.length * 0.9)];
    const endRe = /[.!?…。！？”"'’」』)\]]$|[다요죠까네며]$/;
    const ended = ne.filter((l) => endRe.test(l.trim())).length / ne.length;
    const blankRatio = (lines.length - ne.length) / lines.length;
    if (!(med >= 18 && med <= 90 && p90 - med <= 18 && ended < 0.5 && blankRatio < 0.2)) return lines;
    const out = []; let buf = '';
    const flush = () => { if (buf) { out.push(buf); buf = ''; } };
    for (const raw of lines) {
      const t = raw.trim();
      if (!t) { flush(); continue; }
      if (isHeadingLine(t, true) || RE_SEP.test(t)) { flush(); out.push(t); continue; }
      buf = buf ? buf + ' ' + t : t;
      if (/[.!?…。！？”"'’」』)]$/.test(t) && t.length < med * 0.85) flush();
    }
    flush();
    return out;
  }

  function parseText(text) {
    text = text.replace(/\r\n?/g, '\n').replace(/\u0000/g, '');
    const lines = maybeUnwrap(text.split('\n'));
    const blocks = [];
    let prevBlank = true;
    for (const raw of lines) {
      const s = raw.replace(/[\u3000\u00a0]/g, ' ').trim();
      if (!s) { prevBlank = true; continue; }
      if (RE_SEP.test(s)) { if (blocks.length && blocks[blocks.length - 1][0] !== 'hr') blocks.push(['hr']); prevBlank = false; continue; }
      const lv = isHeadingLine(s, prevBlank);
      if (lv) blocks.push(['h', lv, cleanHeading(s)]);
      else blocks.push(['p', s]);
      prevBlank = false;
    }
    return blocks;
  }

  /* ───── 마크다운 ───── */
  function stripMd(s) {
    return s
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/(\*\*|__)(.+?)\1/g, '$2')
      .replace(/(\*|_)(.+?)\1/g, '$2')
      .replace(/~~(.+?)~~/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/<[^>]+>/g, '');
  }
  function parseMd(text) {
    text = text.replace(/\r\n?/g, '\n');
    const out = []; let para = []; let inFence = false;
    const flush = () => { if (para.length) { const t = collapse(stripMd(para.join(' '))); if (t) out.push(['p', t]); para = []; } };
    for (const raw of text.split('\n')) {
      const line = raw.trim();
      if (/^```|^~~~/.test(line)) { flush(); inFence = !inFence; continue; }
      if (inFence) { if (line) out.push(['p', line]); continue; }
      if (!line) { flush(); continue; }
      const h = line.match(/^(#{1,6})\s+(.*?)\s*#*$/);
      if (h) { flush(); const t = collapse(stripMd(h[2])); if (t) out.push(['h', Math.min(h[1].length, 4), t]); continue; }
      if (/^([-*_]\s*){3,}$/.test(line)) { flush(); if (out.length && out[out.length - 1][0] !== 'hr') out.push(['hr']); continue; }
      if (/^>\s?/.test(line)) { flush(); const t = collapse(stripMd(line.replace(/^>\s?/, ''))); if (t) out.push(['q', t]); continue; }
      const li = line.match(/^([-*+]|\d+[.)])\s+(.*)$/);
      if (li) { flush(); const t = collapse(stripMd(li[2])); if (t) out.push(['p', '• ' + t]); continue; }
      if (/^\|?[\s:-]+\|[\s|:-]*$/.test(line)) continue;
      para.push(line);
    }
    flush();
    return out;
  }

  /* ───── HTML(화면에 보이는 글만) ───── */
  const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG', 'IMG', 'HEAD', 'RT', 'RP', 'TEMPLATE', 'IFRAME', 'CANVAS', 'AUDIO', 'VIDEO', 'OBJECT', 'FORM', 'BUTTON', 'SELECT', 'MATH']);
  const BLK = new Set(['P', 'DIV', 'UL', 'OL', 'DL', 'DT', 'DD', 'TABLE', 'TR', 'TD', 'TH', 'THEAD', 'TBODY', 'SECTION', 'ARTICLE', 'HEADER', 'FOOTER', 'MAIN', 'ASIDE', 'FIGURE', 'FIGCAPTION', 'ADDRESS', 'NAV', 'BODY', 'HTML', 'CENTER']);

  function htmlToBlocks(root) {
    const out = []; let buf = ''; let q = 0;
    const flush = () => { const t = collapse(buf); buf = ''; if (t && t !== '•') out.push([q ? 'q' : 'p', t]); };
    const walk = (n) => {
      if (n.nodeType === 3) { buf += n.nodeValue; return; }
      if (n.nodeType !== 1) return;
      const tag = n.tagName.toUpperCase();
      if (SKIP.has(tag)) return;
      if (/^H[1-6]$/.test(tag)) { flush(); const t = collapse(n.textContent); if (t) out.push(['h', +tag[1], t]); return; }
      if (tag === 'HR') { flush(); if (out.length && out[out.length - 1][0] !== 'hr') out.push(['hr']); return; }
      if (tag === 'BR') { flush(); return; }
      if (tag === 'PRE') { flush(); n.textContent.split('\n').forEach((l) => { const t = collapse(l); if (t) out.push(['p', t]); }); return; }
      if (tag === 'LI') { flush(); buf = '• '; n.childNodes.forEach(walk); flush(); return; }
      if (tag === 'BLOCKQUOTE') { flush(); q++; n.childNodes.forEach(walk); flush(); q--; return; }
      if (BLK.has(tag)) { flush(); n.childNodes.forEach(walk); flush(); return; }
      n.childNodes.forEach(walk);
    };
    walk(root); flush();
    return out;
  }

  function parseHtmlString(str) {
    const doc = new DOMParser().parseFromString(str, 'text/html');
    return { blocks: htmlToBlocks(doc.body || doc.documentElement), title: collapse(doc.title || '') };
  }

  /* ───── DOCX ───── */
  async function parseDocx(buf) {
    const styleMap = [
      "p[style-name='Title'] => h1:fresh", "p[style-name='제목'] => h1:fresh",
      "p[style-name='Chapter Heading'] => h1:fresh", "p[style-name='제목 1'] => h1:fresh",
      "p[style-name='제목 2'] => h2:fresh", "p[style-name='제목 3'] => h3:fresh",
      "p[style-name='Subtitle'] => p:fresh", "p[style-name='Dialogue'] => blockquote > p:fresh",
      "p[style-name='Scene Note'] => p:fresh"
    ];
    const r = await global.mammoth.convertToHtml({ arrayBuffer: buf }, {
      styleMap,
      convertImage: global.mammoth.images.imgElement(() => Promise.resolve({ src: '' }))
    });
    const doc = new DOMParser().parseFromString('<body>' + r.value + '</body>', 'text/html');
    return { blocks: htmlToBlocks(doc.body) };
  }

  /* ───── EPUB ───── */
  function resolvePath(base, rel) {
    let r = rel; try { r = decodeURIComponent(rel); } catch (e) { /* 그대로 */ }
    const out = [];
    for (const p of (base + r).split('/')) { if (p === '..') out.pop(); else if (p && p !== '.') out.push(p); }
    return out.join('/');
  }
  const dirOf = (p) => (p.includes('/') ? p.slice(0, p.lastIndexOf('/') + 1) : '');

  async function parseEpub(buf) {
    const zip = await global.JSZip.loadAsync(buf);
    const readStr = async (path) => {
      const f = zip.file(path) || zip.file(path.replace(/%20/g, ' '));
      return f ? f.async('string') : null;
    };
    const xml = (s) => new DOMParser().parseFromString(s, 'application/xml');
    const container = await readStr('META-INF/container.xml');
    if (!container) throw new Error('EPUB 구조를 읽을 수 없어요.');
    const opfPath = xml(container).querySelector('rootfile').getAttribute('full-path');
    const opfDir = dirOf(opfPath);
    const opf = xml(await readStr(opfPath));
    const ns = (name) => { const e = opf.getElementsByTagNameNS('*', name)[0]; return e ? collapse(e.textContent) : ''; };
    const title = ns('title'); const author = ns('creator');

    const man = {};
    opf.querySelectorAll('manifest > item').forEach((it) => {
      man[it.getAttribute('id')] = { href: it.getAttribute('href'), type: it.getAttribute('media-type') || '', props: it.getAttribute('properties') || '' };
    });
    const spine = [...opf.querySelectorAll('spine > itemref')].map((r) => r.getAttribute('idref'));

    /* 목차 라벨: nav.xhtml 우선, 없으면 toc.ncx */
    const navMap = {};
    const addNav = (path, label) => { const key = path.split('#')[0]; if (key && label && !navMap[key]) navMap[key] = label; };
    try {
      const navItem = Object.values(man).find((m) => /\bnav\b/.test(m.props));
      if (navItem) {
        const navPath = resolvePath(opfDir, navItem.href);
        const doc = new DOMParser().parseFromString(await readStr(navPath), 'text/html');
        const navs = [...doc.querySelectorAll('nav')];
        const nav = navs.find((n) => /toc/.test(n.getAttribute('epub:type') || '')) || navs[0];
        if (nav) nav.querySelectorAll('a[href]').forEach((a) => addNav(resolvePath(dirOf(navPath), a.getAttribute('href')), collapse(a.textContent)));
      }
      if (!Object.keys(navMap).length) {
        const ncxId = opf.querySelector('spine') && opf.querySelector('spine').getAttribute('toc');
        const ncx = ncxId && man[ncxId];
        if (ncx) {
          const ncxPath = resolvePath(opfDir, ncx.href);
          xml(await readStr(ncxPath)).querySelectorAll('navPoint').forEach((np) => {
            const t = np.querySelector('navLabel > text'); const c = np.querySelector('content');
            if (t && c) addNav(resolvePath(dirOf(ncxPath), c.getAttribute('src')), collapse(t.textContent));
          });
        }
      }
    } catch (e) { /* 목차 라벨 없이 진행 */ }

    const blocks = [];
    for (const id of spine) {
      const it = man[id];
      if (!it || !/html|xml/.test(it.type)) continue;
      const path = resolvePath(opfDir, it.href);
      const str = await readStr(path);
      if (!str) continue;
      const doc = new DOMParser().parseFromString(str, 'text/html');
      const bl = htmlToBlocks(doc.body);
      if (!bl.length) continue;
      const label = navMap[path];
      const fh = bl.findIndex((b) => b[0] === 'h');
      let first = false;
      if (fh !== -1 && fh <= 2) first = true;                       // 파일 맨 앞 제목 = 장 제목
      else if (label) { bl.unshift(['h', 1, label]); first = true; }  // 없으면 목차 라벨로 보충
      for (const b of bl) {
        if (b[0] !== 'h') continue;
        if (first) { b[1] = 1; first = false; } else b[1] = Math.max(2, b[1]);
      }
      blocks.push(...bl);
    }
    return { blocks, title, author };
  }

  /* ───── PDF ───── */
  async function parsePdf(buf, onProgress) {
    const pdfjs = await import('./vendor/pdf.min.mjs');
    pdfjs.GlobalWorkerOptions.workerSrc = new URL('./vendor/pdf.worker.min.mjs', location.href).href;
    const pdf = await pdfjs.getDocument({
      data: new Uint8Array(buf),
      cMapUrl: new URL('./vendor/cmaps/', location.href).href,
      cMapPacked: true, isEvalSupported: false
    }).promise;
    const n = pdf.numPages;
    const pages = [];
    let chars = 0;
    for (let p = 1; p <= n; p++) {
      const page = await pdf.getPage(p);
      const tc = await page.getTextContent();
      const lines = []; let cur = null;
      for (const it of tc.items) {
        if (!('str' in it)) continue;
        const x = it.transform[4], y = it.transform[5];
        const h = it.height || Math.abs(it.transform[3]) || 10;
        if (!cur || Math.abs(y - cur.y) > h * 0.5) { cur = { y, x0: x, x1: x + (it.width || 0), h, t: '' }; lines.push(cur); }
        cur.t += it.str;
        cur.x1 = Math.max(cur.x1, x + (it.width || 0));
        if (it.hasEOL) cur = null;
      }
      const clean = lines.map((l) => ({ ...l, t: collapse(l.t) })).filter((l) => l.t);
      chars += clean.reduce((a, l) => a + l.t.length, 0);
      pages.push(clean);
      page.cleanup();
      if (onProgress) onProgress(p, n);
    }
    if (chars < Math.max(30, n * 8)) throw new Error('NO_TEXT');

    /* 머리말·꼬리말·쪽번호 제거 */
    const freq = new Map();
    pages.forEach((ls) => new Set(ls.map((l) => l.t.replace(/\d+/g, '#'))).forEach((k) => freq.set(k, (freq.get(k) || 0) + 1)));
    const limit = Math.max(3, Math.ceil(n * 0.3));
    const isNoise = (t) => /^[-–—\s]*\d{1,4}[-–—\s]*$/.test(t) || /^\d+\s*\/\s*\d+$/.test(t) ||
      (t.length <= 80 && n >= 4 && (freq.get(t.replace(/\d+/g, '#')) || 0) >= limit);

    const paras = []; const pageStart = [];
    let para = '';
    const push = () => { const t = collapse(para); if (t) paras.push(['p', t]); para = ''; };
    pages.forEach((ls, pi) => {
      pageStart[pi] = paras.length + (para ? 1 : 0);
      const lines = ls.filter((l) => !isNoise(l.t));
      if (!lines.length) return;
      const ws = lines.map((l) => l.x1 - l.x0).sort((a, b) => a - b);
      const maxW = ws[Math.floor(ws.length * 0.9)] || 1;
      const minX = Math.min(...lines.map((l) => l.x0));
      lines.forEach((L, i) => {
        const next = lines[i + 1];
        para = para ? (/[-‐]$/.test(para) && /^[a-z]/.test(L.t) ? para.slice(0, -1) + L.t : para + ' ' + L.t) : L.t;
        const short = (L.x1 - L.x0) < maxW * 0.8;
        const termin = /[.!?…。！？”"'」』)]$/.test(L.t);
        const indentNext = next && (next.x0 - minX) > L.h * 1.2;
        const isLastOnPage = !next;
        if ((short && (termin || !isLastOnPage)) || (indentNext && termin) || (isLastOnPage && short && termin)) push();
      });
    });
    push();

    /* 북마크(아웃라인)가 있으면 그것을 목차로 */
    let outline = [];
    try {
      const raw = await pdf.getOutline();
      const walk = async (list, depth) => {
        for (const it of list || []) {
          try {
            let dest = it.dest;
            if (typeof dest === 'string') dest = await pdf.getDestination(dest);
            if (Array.isArray(dest) && dest[0] != null) {
              const idx = typeof dest[0] === 'object' ? await pdf.getPageIndex(dest[0]) : dest[0];
              const t = collapse(it.title || '');
              if (t) outline.push({ page: idx, lvl: Math.min(depth, 3), title: t });
            }
          } catch (e) { /* 건너뜀 */ }
          if (it.items && it.items.length && depth < 3) await walk(it.items, depth + 1);
        }
      };
      await walk(raw, 1);
    } catch (e) { outline = []; }

    let blocks = paras;
    let hasOutline = false;
    if (outline.length >= 2) {
      hasOutline = true;
      const at = new Map();
      outline.forEach((o) => { const k = Math.min(pageStart[o.page] ?? 0, paras.length); if (!at.has(k)) at.set(k, []); at.get(k).push(['h', o.lvl, o.title]); });
      blocks = [];
      for (let i = 0; i <= paras.length; i++) {
        if (at.has(i)) blocks.push(...at.get(i));
        if (i < paras.length) blocks.push(paras[i]);
      }
    }
    let title = '';
    try { const meta = await pdf.getMetadata(); title = collapse((meta.info && meta.info.Title) || ''); } catch (e) { /* 없음 */ }
    return { blocks, title, hasOutline };
  }

  /* 제목이 거의 없는 형식(docx, pdf, html)에서도 제목 줄을 찾아 줍니다 */
  function ensureHeadings(blocks) {
    if (blocks.filter((b) => b[0] === 'h').length >= 2) return blocks;
    let found = 0;
    const out = blocks.map((b) => {
      if (b[0] === 'p' && b[1].length <= 60 && isHeadingLine(b[1], false)) { found++; return ['h', 1, cleanHeading(b[1])]; }
      return b;
    });
    return found >= 2 ? out : blocks;
  }

  /* ───── 목차 만들기 ───── */
  const LABEL_ONLY = /^(?:제\s*[0-9一二三四五六七八九十百千零〇일이삼사오육칠팔구십백천]+\s*[장화회부편절권막]|chapter\s*[0-9ivxlc]+|part\s*\d+|[0-9]{1,4}\s*[장화회]?|[ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ]+)[.:)]?$/i;

  function sameHeading(a, b) {
    const na = (a.match(/\d+/) || [])[0], nb = (b.match(/\d+/) || [])[0];
    const ca = a.replace(/[^\p{L}\p{N}]/gu, ''), cb = b.replace(/[^\p{L}\p{N}]/gu, '');
    return (na && nb && na === nb) || (ca.length > 1 && cb.length > 1 && (ca.includes(cb) || cb.includes(ca)));
  }

  function headingEntries(blocks) {
    const E = [];
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      if (b[0] !== 'h') continue;
      let title = b[2]; let skip = i + 1;
      const prev = E[E.length - 1];
      if (prev && prev.skip === i) {                       // 바로 앞이 제목이면 중복·부제로 처리
        if (sameHeading(prev.title, title)) { prev.skip = i + 1; continue; }
        if (LABEL_ONLY.test(prev.title)) { prev.title += ' ' + title; prev.skip = i + 1; continue; }
      }
      if (LABEL_ONLY.test(title)) {                        // "제3장" 다음 줄이 짧은 제목이면 합치기
        const nb = blocks[i + 1];
        if (nb && nb[0] === 'p' && nb[1].length <= 40 && !/[.!?。]$/.test(nb[1])) { title += ' ' + nb[1]; skip = i + 2; }
      }
      E.push({ idx: i, lvl: b[1], title, skip });
    }
    return E;
  }

  function prefixSums(blocks) {
    const cum = new Float64Array(blocks.length + 1);
    for (let i = 0; i < blocks.length; i++) cum[i + 1] = cum[i] + blockLen(blocks[i]);
    return cum;
  }

  function previewOf(blocks, s, e) {
    for (let i = s; i < e; i++) if (blocks[i][0] === 'p' || blocks[i][0] === 'q') { const t = blocks[i][1]; return t.length > 28 ? t.slice(0, 28) + '…' : t; }
    return '';
  }

  function segChapters(blocks, cum, size) {
    const n = blocks.length; const out = [];
    let s = 0, k = 1;
    while (s < n) {
      let lo = s + 1, hi = n;
      while (lo < hi) { const mid = (lo + hi) >> 1; if (cum[mid] - cum[s] >= size) hi = mid; else lo = mid + 1; }
      let e = lo;
      if (e < n && cum[n] - cum[e] < size * 0.35) e = n;
      out.push({ title: '구간 ' + k, sub: previewOf(blocks, s, e), start: s, bodyStart: s, end: e, seg: true });
      s = e; k++;
    }
    return out;
  }

  function explicitChapters(blocks, cum, bookTitle) {
    const E = headingEntries(blocks);
    let L = 0;
    for (let l = 1; l <= 4 && !L; l++) if (E.filter((e) => e.lvl <= l).length >= 2) L = l;
    if (!L) return null;
    const sel = E.filter((e) => e.lvl <= L);
    if (sel.length > 20 && cum[blocks.length] / sel.length < 120) return null;   // 제목 오탐 방어
    const out = [];
    if (sel[0].idx > 0 && blocks.slice(0, sel[0].idx).some((b) => b[0] !== 'hr')) {
      out.push({ title: bookTitle || '시작', sub: previewOf(blocks, 0, sel[0].idx), start: 0, bodyStart: 0, end: sel[0].idx, preface: true });
    }
    sel.forEach((e, k) => {
      const end = k + 1 < sel.length ? sel[k + 1].idx : blocks.length;
      out.push({ title: e.title, start: e.idx, bodyStart: Math.min(e.skip, end), end });
    });
    return out;
  }

  function buildChapters(blocks, cum, meta) {
    const size = (meta && meta.seg) || 6000;
    if (!meta || meta.mode !== 'seg') {
      const ex = explicitChapters(blocks, cum, meta && meta.title);
      if (ex) return { chapters: ex, kind: 'explicit' };
      return { chapters: segChapters(blocks, cum, size), kind: 'seg', forced: true };
    }
    return { chapters: segChapters(blocks, cum, size), kind: 'seg', forced: false };
  }

  global.SJ = { collapse, blockLen, decodeText, parseText, parseMd, parseHtmlString, parseDocx, parseEpub, parsePdf, ensureHeadings, prefixSums, buildChapters, isHeadingLine };
})(window);
