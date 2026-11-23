/* =========================================================
   YENA 非官方粉絲站 — 主程式
   單頁式網站，以網址 #頁面?d=詳細 切換。
   人工資料：js/data.js　自動資料：data/auto.json（GitHub Actions 定時更新）
   ========================================================= */
(() => {
  "use strict";
  const D = window.YENA_DATA;
  const I18N = window.YENA_I18N || {};
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const app = $("#app");
  const DAY = 86400000;
  let A = {}; // 自動資料
  const M = {}; // 合併後資料

  /* ---------------- 語言 ---------------- */
  const LANGS = { zh: "中文", en: "EN", ko: "한국어" };
  let LANG = (() => {
    try { const s = localStorage.getItem("yena-lang"); if (LANGS[s]) return s; } catch (e) {}
    const n = (navigator.language || "").toLowerCase();
    return n.startsWith("ko") ? "ko" : n.startsWith("en") ? "en" : "zh";
  })();
  const t = (s, v) => {
    let r = LANG === "zh" ? s : (I18N[LANG] && I18N[LANG][s]) || s;
    if (v) r = r.replace(/\{(\w+)\}/g, (_, k) => (v[k] ?? ""));
    return r;
  };
  const P_L = (k) => (D.profile.i18n && D.profile.i18n[LANG] && D.profile.i18n[LANG][k]) || null;
  const locale = () => ({ zh: "zh-TW", en: "en-US", ko: "ko-KR" }[LANG]);

  /* ---------------- 工具函式 ---------------- */
  const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const safeUrl = (u) => (/^https?:\/\//i.test(u || "") ? u : "");
  const pad = (n) => String(n).padStart(2, "0");
  const hid = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); };
  const kst = (date, time) => { const d = date.length === 7 ? date + "-01" : date; return new Date(`${d}T${time || "00:00"}:00+09:00`); };
  const fmtDate = (s = "") => s.slice(0, 10).replace(/-/g, ".");
  const kstYmd = (d) => { const k = new Date(d.getTime() + 9 * 3600000); return `${k.getUTCFullYear()}-${pad(k.getUTCMonth() + 1)}-${pad(k.getUTCDate())}`; };
  const todayStr = () => kstYmd(new Date());
  const localTime = (d) => d.toLocaleTimeString(locale(), { hour: "2-digit", minute: "2-digit", hour12: false });
  const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  const isKstUser = /Seoul/.test(userTz);
  const WD = { zh: "日一二三四五六".split(""), en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], ko: "일월화수목금토".split("") };
  const weekday = (s) => WD[LANG][new Date(kst(s).getTime() + 9 * 3600000).getUTCDay()];
  const ym = (y, m) => (LANG === "en" ? new Date(Date.UTC(y, m - 1, 1)).toLocaleString("en", { month: "long", year: "numeric", timeZone: "UTC" }) : t("{y} 年 {m} 月", { y, m }));
  const daysFrom = (a, b) => Math.round((kst(b) - kst(a)) / DAY);
  const verifiedTag = (v) => (v === false ? ` <span class="tag gray" title="${esc(t("資料尚未經官方來源確認"))}">${t("待確認")}</span>` : "");
  const sortKey = (x) => x.iso || (x.date ? x.date + "T12:00:00+09:00" : "");
  const byNew = (a, b) => (sortKey(a) < sortKey(b) ? 1 : -1);
  const ago = (iso) => {
    const m = Math.round((Date.now() - new Date(iso)) / 60000);
    if (!(m >= 0)) return fmtDate(iso);
    if (m < 60) return t("{n} 分鐘前", { n: Math.max(1, m) });
    if (m < 1440) return t("{n} 小時前", { n: Math.round(m / 60) });
    if (m < 1440 * 7) return t("{n} 天前", { n: Math.round(m / 1440) });
    return fmtDate(iso);
  };
  const norm = (s) => (s || "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");

  const toast = (msg, ms = 2200) => {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("show"), ms);
  };

  window.__imgErr = (el) => {
    const fb = el.dataset.fb;
    if (fb && el.src !== fb) { el.src = fb; return; }
    el.classList.add("img-broken");
    el.closest("[data-imgbox]")?.classList.add("no-img");
  };
  const img = (u, alt = "", { fb = "", cls = "", attrs = "", lazy = true } = {}) =>
    u ? `<img src="${esc(u)}" ${fb ? `data-fb="${esc(fb)}"` : ""} alt="${esc(alt)}" ${lazy ? 'loading="lazy"' : ""} referrerpolicy="no-referrer" onerror="__imgErr(this)" ${cls ? `class="${cls}"` : ""} ${attrs}>` : "";

  const CATS = {
    release: { label: "發行", color: "#ff7eb6" },
    show: { label: "音樂節目", color: "#7cc8ff" },
    award: { label: "頒獎典禮", color: "#f5b700" },
    variety: { label: "綜藝 / 廣播", color: "#3bbf86" },
    concert: { label: "演唱會 / 見面會", color: "#b18cff" },
    goods: { label: "周邊", color: "#ff9f43" },
    live: { label: "直播", color: "#ff6b6b" },
    fan: { label: "應援活動", color: "#ff4f9a" },
    etc: { label: "其他", color: "#9a8e72" },
    anniv: { label: "紀念日", color: "#ff4f7b" },
  };
  const TYPES = { mini: "迷你專輯", single: "單曲專輯", digital: "數位單曲", japan: "日本作品", collab: "合作 / 客串", version: "其他版本" };
  const GOODS_STATUS = {
    preorder: { label: "預購中", cls: "pink" },
    onsale: { label: "販售中", cls: "green" },
    upcoming: { label: "即將開賣", cls: "yellow" },
    soldout: { label: "已售完", cls: "gray" },
    ended: { label: "已結束", cls: "gray" },
  };
  const GCATS = { award: "頒獎典禮", pictorial: "畫報", sns: "日常 SNS", stage: "舞台活動", throwback: "經典回顧", news: "新聞照片", video: "官方影片", cc: "CC 授權" };
  const NEWS_LANGS = { zh: "中文", ko: "한국어", en: "English" };

  /* ---------------- SVG 圖示 ---------------- */
  const ICONS = {
    x: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
    instagram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>`,
    youtube: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.75 15.02V8.98L15.5 12z"/></svg>`,
    tiktok: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.6 2h-3.4v13.4a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9.1a6.4 6.4 0 1 0 5.4 6.3V8.6a8.3 8.3 0 0 0 4.9 1.6V6.8a4.9 4.9 0 0 1-4.9-4.8z"/></svg>`,
    weibo: `<svg viewBox="0 0 24 24" aria-hidden="true"><text x="12" y="17" text-anchor="middle" font-size="14" font-weight="900" fill="currentColor" font-family="sans-serif">微</text></svg>`,
    bilibili: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2.5" y="6" width="19" height="14" rx="3"/><path d="M7 2.5 9.5 6M17 2.5 14.5 6M8.5 12v2M15.5 12v2" stroke-linecap="round"/></svg>`,
  };
  const SNS_BG = { x: "#111", instagram: "linear-gradient(45deg,#f9a825,#e91e63,#7b1fa2)", youtube: "#ff0033", tiktok: "#111", weibo: "#e6162d", bilibili: "#00a1d6" };
  const snsIcon = (p) => `<span class="sns-icon" style="background:${SNS_BG[p] || "#999"}">${ICONS[p] || ""}</span>`;

  /* =========================================================
     資料合併（人工 data.js ＋ 自動 auto.json）
     ========================================================= */
  const kpThumb = (u) => (/cdn\.kpopping\.com/.test(u) ? `https://kpopping.com/api/kpics-image?url=${encodeURIComponent(u)}&size=medium&v=3` : u);
  const ytThumb = (v, big) => (v.short ? `https://i.ytimg.com/vi/${v.id}/oar2.jpg` : `https://i.ytimg.com/vi/${v.id}/${big ? "maxresdefault" : "hqdefault"}.jpg`);
  const ytFb = (v) => `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`;

  function autoType(a) {
    if (/japanese|日本|[ぁ-んァ-ン]/i.test(a.title)) return "japan";
    if (/chinese|sped up|remix|ver\.|version|instrumental/i.test(a.title)) return "version";
    if (a.kind === "EP") return "mini";
    if (a.kind === "Single" && a.trackCount >= 3) return "single";
    return "digital";
  }
  function buildReleases() {
    const it = (A.releases || []).map((a) => ({ ...a, used: false }));
    const nm = (s) => norm((s || "").replace(/\(.*?\)/g, ""));
    const out = D.releases.map((r) => {
      const names = [nm(r.title), norm((r.title.match(/\(([^)]+)\)/) || [])[1]), nm(r.titleTrack)].filter((x) => x && x.length > 1);
      const itn = (a) => [nm(a.title), norm(a.title)];
      const mid = r.date.length === 7 ? new Date(r.date + "-15") : new Date(r.date);
      const dateHit = (a) => (r.date.length === 7 ? a.date.startsWith(r.date) : Math.abs(new Date(a.date) - mid) <= DAY * 1.5);
      const nameHit = (a) => names.some((n) => itn(a).some((m) => m && (m.includes(n) || n.includes(m))));
      const a = it.find((a) => !a.used && dateHit(a) && nameHit(a)) || it.find((a) => !a.used && dateHit(a)) || it.find((a) => !a.used && nameHit(a) && Math.abs(new Date(a.date) - mid) < DAY * 45);
      if (a) a.used = true;
      const tt = nm(r.titleTrack);
      let tracks = (r.tracks || []).map((name, i) => ({ n: i + 1, name, title: i === 0 }));
      if (a && a.tracks && a.tracks.length) {
        const ti = Math.max(0, a.tracks.findIndex((x) => !/instrumental|inst\.|mr\b/i.test(x.name) && tt && (nm(x.name) === tt || nm(x.name).includes(tt) || tt.includes(nm(x.name)))));
        tracks = a.tracks.map((x, i) => ({ ...x, title: i === ti }));
      }
      return { ...r, id: "r" + hid(r.title), date: r.date.length === 7 && a ? a.date : r.date, cover: r.cover || (a && a.cover) || "", tracks, apple: a && a.url, it: a || null };
    });
    for (const a of it.filter((a) => !a.used)) {
      out.push({ id: "r" + hid("it" + a.id), title: a.title, type: autoType(a), date: a.date, titleTrack: (a.tracks && a.tracks[0] && a.tracks[0].name) || a.title, note: "", colors: ["#ff7eb6", "#ffd23f"], emoji: "🎵", cover: a.cover, tracks: (a.tracks || []).map((x, i) => ({ ...x, title: i === 0 })), apple: a.url, it: a, auto: true });
    }
    return out.sort(byNew);
  }

  function buildNews() {
    const og = A.og || {};
    const manual = D.news.map((n) => ({ id: "n" + hid(n.url || n.title), title: n.title, date: n.date, desc: n.summary, url: n.url, source: n.source, tags: n.tags || [], image: (og[n.url] && og[n.url].image) || "", lang: "zh", curated: true }));
    const urls = new Set(manual.map((n) => n.url));
    const auto = Object.keys(NEWS_LANGS).flatMap((l) => ((A.news && A.news[l]) || []).filter((n) => !urls.has(n.url)).map((n) => ({ id: "n" + hid(n.url), title: n.title, date: (n.date || "").slice(0, 10), iso: n.date, desc: n.desc, url: n.url, source: n.source, tags: [], image: n.image || n.thumb || "", fb: n.thumb || "", lang: l })));
    return [...manual, ...auto].sort(byNew);
  }

  function buildAlbums() {
    const al = D.gallery.map((g) => ({ ...g, id: "a" + hid(g.url || g.title), images: g.images.map((u) => ({ u, th: kpThumb(u), link: g.url, src: g.credit, cors: true })) }));
    // 新聞照片：依月份成冊
    const months = new Map();
    const seen = new Set();
    for (const n of M.news) {
      if (!n.image || n.curated || seen.has(n.image)) continue;
      seen.add(n.image);
      const k = n.date.slice(0, 7);
      if (!months.has(k)) months.set(k, []);
      months.get(k).push({ u: n.image, th: n.image, fb: n.fb, cap: n.title, link: n.url, src: n.source, date: n.date, news: n.id });
    }
    for (const [k, imgs] of months) {
      al.push({ id: "an" + k, title: t("{m} 新聞照片", { m: ym(+k.slice(0, 4), +k.slice(5)) }), date: imgs[0].date, cat: "news", credit: t("各家媒體"), url: "", images: imgs.slice(0, 80), auto: true });
    }
    // 官方 YouTube
    const vm = new Map();
    for (const v of (A.youtube && A.youtube.videos) || []) {
      const k = v.date.slice(0, 7);
      if (!vm.has(k)) vm.set(k, []);
      vm.get(k).push({ u: ytThumb(v, true), th: ytThumb(v), fb: ytFb(v), cap: v.title, link: `https://www.youtube.com/watch?v=${v.id}`, src: "YENA OFFICIAL", date: v.date.slice(0, 10), video: v.id });
    }
    for (const [k, imgs] of vm) al.push({ id: "ay" + k, title: t("{m} 官方 YouTube", { m: ym(+k.slice(0, 4), +k.slice(5)) }), date: imgs[0].date, cat: "video", credit: "YouTube @YENA_OFFICIAL", url: "https://www.youtube.com/@YENA_OFFICIAL", images: imgs, auto: true });
    if (A.commons && A.commons.length) {
      al.push({ id: "acc", title: "Wikimedia Commons", date: A.commons.map((c) => c.date).sort().pop() || "", cat: "cc", credit: "Wikimedia Commons", url: "https://commons.wikimedia.org/wiki/Category:Choi_Ye-na", auto: true,
        images: A.commons.map((c) => ({ u: c.u, th: c.u, cap: `${c.title} · © ${c.artist} · ${c.license}`, link: c.page, src: `${c.artist} (${c.license})`, cors: true })) });
    }
    return al;
  }

  function buildGoods() {
    const list = D.goods.map((g) => ({ ...g }));
    for (const g of (A.community && A.community.goods) || []) list.push({ ...g, emoji: "🎁", community: true });
    // iTunes 新的 EP / 單曲專輯 → 自動加入（實體版請以通路為準）
    for (const r of M.releases) {
      if (!r.auto || !["mini", "single"].includes(r.type)) continue;
      if (list.some((g) => g.release === r.date)) continue;
      const q = encodeURIComponent("최예나 " + r.title);
      list.push({ name: r.title, type: TYPES[r.type], emoji: "💿", status: r.date > todayStr() ? "preorder" : "onsale", release: r.date, note: t("自動從 iTunes 新作品加入，實體專輯版本請以各通路為準。"), stores: [{ name: "YES24", url: `https://www.yes24.com/Product/Search?domain=ALL&query=${q}` }, { name: "Aladin", url: `https://www.aladin.co.kr/search/wsearchresult.aspx?SearchTarget=All&SearchWord=${q}` }], auto: true });
    }
    for (const g of list) {
      g.id = "g" + hid(g.name);
      g.img = g.image || goodsImage(g);
    }
    return list;
  }
  function goodsImage(g) {
    const r = g.release && M.releases.find((r) => r.date === g.release && r.cover);
    if (r) return r.cover;
    if (g.keywords && g.keywords.length) {
      const re = new RegExp(g.keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "i");
      const v = ((A.youtube && A.youtube.videos) || []).find((v) => re.test(v.title + " " + v.desc));
      if (v) return ytThumb(v, true);
      const n = M.news.find((n) => n.image && re.test(n.title));
      if (n) return n.image;
    }
    return "";
  }

  function buildFanEvents() {
    return [...(D.fanEvents || []), ...((A.community && A.community.events) || []).map((e) => ({ ...e, community: true }))]
      .map((e) => ({ ...e, id: "f" + hid(e.date + e.title) })).sort((a, b) => (a.date < b.date ? 1 : -1));
  }

  function buildAwards() {
    const manual = D.awards.map((a) => ({ date: a.date, year: a.date.slice(0, 4), event: a.event, award: a.award, work: a.work, result: "Won" }));
    const mk = (s) => norm(s.replace(/\d{4}/g, ""));
    const wiki = (A.awards || []).filter((w) => !manual.some((m) => m.year === w.year && (mk(m.event).includes(mk(w.ceremony)) || mk(w.ceremony).includes(mk(m.event))) && w.result === "Won"))
      .map((w) => ({ date: "", year: w.year, event: w.ceremony, award: w.category, work: /ye-?na/i.test(w.work) ? "" : w.work, result: w.result }));
    return [...manual, ...wiki].sort((a, b) => ((a.date || a.year + "-00") < (b.date || b.year + "-00") ? 1 : -1));
  }

  function mergeAll() {
    M.releases = buildReleases();
    M.news = buildNews();
    M.albums = buildAlbums();
    M.goods = buildGoods();
    M.fanEvents = buildFanEvents();
    M.awards = buildAwards();
    M.wins = A.wins || [];
    M.videos = ((A.youtube && A.youtube.videos) || []).slice();
    for (const v of D.videos) if (!M.videos.some((x) => x.id === v.id)) M.videos.push({ ...v, desc: "", short: false });
    M.videos.sort(byNew);
  }

  /* ---------------- 行程資料整合 ---------------- */
  function extraEvents() {
    const ev = [];
    for (const r of M.releases) {
      if (!r.it || D.schedule.some((e) => e.category === "release" && e.date === r.date)) continue;
      ev.push({ key: "rel" + r.id, date: r.date, time: "", title: t("發行：{x}", { x: r.title }), category: "release", place: t("各大音源平台"), note: "", rel: r.id, auto: true });
    }
    for (const w of M.wins) ev.push({ key: "win" + w.show + w.date, date: w.date, time: "", title: t("🏆 {show} 一位〈{song}〉", { show: w.show, song: w.song }), category: "show", place: "", note: w.episode ? `EP.${w.episode}` : "", auto: true });
    for (const e of (A.community && A.community.schedule) || []) ev.push({ ...e, community: true });
    for (const f of M.fanEvents) ev.push({ key: "fan" + f.id, date: f.date, time: "", title: "💛 " + f.title, category: "fan", place: f.place, note: f.note, link: f.link, fe: f.id });
    return ev;
  }
  function allEvents(years) {
    const list = [...D.schedule.map((e) => ({ ...e })), ...extraEvents()];
    for (const y of years) {
      for (const a of D.anniversaries) {
        const n = y - a.since;
        if (n <= 0) continue;
        list.push({ key: `anniv${a.md}${y}`, date: `${y}-${a.md}`, time: "", title: `${t(a.title)}（${t("{n} " + a.unit, { n })}）`, category: "anniv", place: "", note: "" });
      }
    }
    for (const e of list) e.id = "e" + hid(e.key || e.date + e.title);
    return list.sort((a, b) => kst(a.date, a.time) - kst(b.date, b.time));
  }
  const yearsAround = (y) => [y - 1, y, y + 1];
  function eventRange(e) {
    if (e.time) { const s = kst(e.date, e.time); return { start: s, end: new Date(s.getTime() + 3600000), allDay: false }; }
    return { start: kst(e.date), end: new Date(kst(e.date).getTime() + DAY), allDay: true };
  }
  const nextEvents = (n = 3) => { const now = new Date(); return allEvents(yearsAround(now.getFullYear())).filter((e) => eventRange(e).end > now).slice(0, n); };
  const findEvent = (id) => { const y = new Date().getFullYear(); return allEvents([y - 2, ...yearsAround(y)]).find((e) => e.id === id); };
  function timeLabel(e) {
    if (!e.time) return t("全天");
    const d = kst(e.date, e.time);
    return isKstUser ? `${e.time} KST` : `${e.time} KST<br><small>${t("當地")} ${localTime(d)}</small>`;
  }

  /* 加入行事曆 */
  const icsStamp = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  function gcalUrl(e) {
    const r = eventRange(e);
    const dates = r.allDay ? `${e.date.replace(/-/g, "")}/${kstYmd(r.end).replace(/-/g, "")}` : `${icsStamp(r.start)}/${icsStamp(r.end)}`;
    const p = new URLSearchParams({ action: "TEMPLATE", text: `[YENA] ${e.title}`, dates, details: e.note || "", location: e.place || "" });
    return `https://calendar.google.com/calendar/render?${p}`;
  }
  function buildIcs(events) {
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//YENA FANS//ZH-TW", "CALSCALE:GREGORIAN"];
    const icsEsc = (s = "") => s.replace(/[\\;,]/g, (c) => "\\" + c).replace(/\n/g, "\\n");
    events.forEach((e) => {
      const r = eventRange(e);
      lines.push("BEGIN:VEVENT", `UID:${e.id}@yena-fans`, `DTSTAMP:${icsStamp(new Date())}`);
      if (r.allDay) lines.push(`DTSTART;VALUE=DATE:${e.date.replace(/-/g, "")}`, `DTEND;VALUE=DATE:${kstYmd(r.end).replace(/-/g, "")}`);
      else lines.push(`DTSTART:${icsStamp(r.start)}`, `DTEND:${icsStamp(r.end)}`);
      lines.push(`SUMMARY:${icsEsc("[YENA] " + e.title)}`);
      if (e.place) lines.push(`LOCATION:${icsEsc(e.place)}`);
      if (e.note) lines.push(`DESCRIPTION:${icsEsc(e.note)}`);
      lines.push("END:VEVENT");
    });
    lines.push("END:VCALENDAR");
    return lines.join("\r\n");
  }
  function downloadIcs(events, name) {
    saveBlob(new Blob([buildIcs(events)], { type: "text/calendar;charset=utf-8" }), name);
    toast(t("已下載行事曆檔，可匯入 Google / Apple 行事曆"));
  }

  /* ---------------- 共用元件 ---------------- */
  const duck = (cls = "duck-big") => `<svg class="${cls}" viewBox="0 0 200 200" aria-hidden="true"><use href="#duck"/></svg>`;
  const q = (s) => encodeURIComponent(s);
  const catTag = (k) => { const c = CATS[k] || CATS.etc; return `<span class="tag" style="background:${c.color}22;color:${c.color}">${t(c.label)}</span>`; };
  const autoBadge = (x) => (x.community ? `<span class="tag yellow" title="${esc(t("粉絲投稿，經審核後刊登"))}">${t("投稿")}</span>` : x.auto ? `<span class="tag gray" title="${esc(t("由自動更新程式整理"))}">${t("自動")}</span>` : "");

  function eventHtml(e) {
    const past = eventRange(e).end < new Date();
    return `<div class="event clickable${past ? " past" : ""}" style="border-left-color:${(CATS[e.category] || CATS.etc).color}" data-open="e.${e.id}" tabindex="0" role="button">
      <div class="when"><b>${e.date.slice(5).replace("-", "/")}</b>(${weekday(e.date)}) ${timeLabel(e)}</div>
      <div style="min-width:0;flex:1">
        ${catTag(e.category)} ${autoBadge(e)}
        <h4>${esc(e.title)}</h4>
        ${e.place ? `<p>📍 ${esc(e.place)}</p>` : ""}
        ${e.note ? `<p>${esc(e.note)}</p>` : ""}
      </div>
      <span class="chev" aria-hidden="true">›</span>
    </div>`;
  }

  const coverBox = (r, big) => r.cover
    ? `<div class="cover img" data-imgbox>${img(r.cover.replace("600x600", big ? "1000x1000" : "600x600"), r.title, { fb: r.cover })}<span class="cy">${fmtDate(r.date)} · ${t(TYPES[r.type] || "")}</span></div>`
    : `<div class="cover" style="background:linear-gradient(135deg,${r.colors[0]},${r.colors[1]})"><span class="deco">${r.emoji || "🎵"}</span><span class="cy">${fmtDate(r.date)} · ${t(TYPES[r.type] || "")}</span><span class="ct">${esc(r.title)}</span></div>`;
  const albumCard = (r) => `<article class="card album clickable" data-open="r.${r.id}" tabindex="0" role="button">
      ${coverBox(r)}
      <div class="album-body">
        <h4>${esc(r.title)}${verifiedTag(r.verified)} ${autoBadge(r)}</h4>
        <div class="tt">${t("主打")}：${esc(r.titleTrack)}</div>
        ${r.note ? `<div class="note">${esc(r.note)}</div>` : ""}
        <div class="album-foot"><span>🎵 ${t("{n} 首", { n: r.tracks.length || 1 })}</span>${r.tracks.some((x) => x.preview) ? `<span>▶ ${t("可試聽")}</span>` : ""}<span class="more-link">${t("詳細")} ›</span></div>
      </div>
    </article>`;
  const musicLinks = (r) => {
    const song = (r.titleTrack || r.title).replace(/\s*\((Feat|feat)\..*?\)/, "");
    return `${r.apple ? `<a class="btn sm" href="${esc(r.apple)}" target="_blank" rel="noopener">Apple Music</a>` : ""}
      <a class="btn ghost sm" href="https://www.youtube.com/results?search_query=${q("YENA " + song + " MV")}" target="_blank" rel="noopener">▶ MV</a>
      <a class="btn ghost sm" href="https://open.spotify.com/search/${q("YENA " + song)}" target="_blank" rel="noopener">Spotify</a>
      <a class="btn ghost sm" href="https://www.melon.com/search/total/index.htm?q=${q("최예나 " + song)}" target="_blank" rel="noopener">Melon</a>`;
  };
  const videoCard = (v) => `<button class="card video-card clickable" data-open="v.${esc(v.id)}">
      <div class="vthumb${v.short ? " short" : ""}" data-imgbox>${img(ytThumb(v), v.title, { fb: ytFb(v) })}<span class="play">▶</span>${v.short ? `<span class="vbadge">Shorts</span>` : ""}</div>
      <p class="vt">${esc(v.title)}</p><p class="note">${fmtDate(v.date)}${v.views ? ` · 👀 ${v.views.toLocaleString()}` : ""}</p>
    </button>`;
  const langTag = (l) => (l && l !== "zh" ? `<span class="tag gray">${NEWS_LANGS[l]}</span>` : "");
  const newsItem = (n) => {
    const [y, m, d] = n.date.split("-");
    return `<div class="news-item clickable" data-open="n.${n.id}" tabindex="0" role="button">
      <div class="news-date"><b>${d}</b><span>${y}.${m}</span></div>
      <div class="news-body">
        <h4>${esc(n.title)}</h4>
        ${n.desc ? `<p class="clamp2">${esc(n.desc)}</p>` : ""}
        <div class="news-meta">${n.curated ? `<span class="tag pink">${t("精選")}</span>` : ""}${langTag(n.lang)}${n.tags.map((x) => `<span class="tag">#${esc(t(x))}</span>`).join("")}<span>${esc(n.source)}</span>${n.iso ? `<span>· ${ago(n.iso)}</span>` : ""}</div>
      </div>
      ${n.image ? `<div class="news-thumb" data-imgbox>${img(n.image, "", { fb: n.fb })}</div>` : ""}
    </div>`;
  };
  const newsCard = (n) => `<article class="card news-card clickable" data-open="n.${n.id}" tabindex="0" role="button">
      <div class="nc-img" data-imgbox>${n.image ? img(n.image, "", { fb: n.fb }) : ""}<span class="nc-src">${esc(n.source)}</span></div>
      <div class="nc-body"><div class="news-meta">${n.curated ? `<span class="tag pink">${t("精選")}</span>` : ""}${langTag(n.lang)}<span>${n.iso ? ago(n.iso) : fmtDate(n.date)}</span></div><h4 class="clamp3">${esc(n.title)}</h4></div>
    </article>`;
  function snsCard(s) {
    return `<a class="card sns-card" href="${esc(s.url)}" target="_blank" rel="noopener">
      ${snsIcon(s.platform)}
      <div style="min-width:0"><h4>${esc(t(s.name))}${verifiedTag(s.verified)}</h4><div class="handle">${esc(s.handle)}</div><p>${esc(t(s.desc))}</p>${s.platform === "youtube" && A.youtube && A.youtube.subscribers ? `<p><b>${esc(A.youtube.subscribers)}</b> ${t("訂閱")}</p>` : ""}</div>
    </a>`;
  }
  const submitUrl = (tpl) => `https://github.com/${D.meta.repo}/issues/new?template=${tpl}.yml`;
  const submitBtn = (tpl, label) => `<a class="btn yellow sm" href="${submitUrl(tpl)}" target="_blank" rel="noopener">✍️ ${label}</a>`;
  const langNotice = () => (LANG === "zh" ? "" : `<p class="note-box">🌐 ${t("本區內容目前僅提供中文。")}</p>`);

  /* =========================================================
     頁面
     ========================================================= */
  const pages = {};

  /* ---------- 首頁 ---------- */
  pages.home = () => {
    const P = D.profile;
    const today = todayStr();
    const soloDays = daysFrom(P.soloDebut, today) + 1;
    const now = new Date();
    let bday = `${now.getFullYear()}-${P.birth.slice(5)}`;
    if (bday < today) bday = `${now.getFullYear() + 1}-${P.birth.slice(5)}`;
    const toBday = daysFrom(today, bday);
    const latest = M.releases.filter((r) => r.date <= today)[0] || M.releases[0];
    const next = nextEvents(4);
    const target = next[0];
    const wonCount = M.awards.filter((a) => a.result === "Won").length;
    const vid = M.videos.find((v) => !v.short) || M.videos[0];
    const photoAlbums = [...M.albums].sort(byNew).filter((a) => a.cat !== "video").slice(0, 4);

    return `
    <section class="hero">
      <div class="float-hearts" aria-hidden="true">${["♥", "★", "♥", "✦", "♥", "★", "♥"].map((h, i) => `<span style="left:${6 + i * 14}%;animation-delay:${i * 1.3}s;font-size:${1 + (i % 3) * 0.4}rem">${h}</span>`).join("")}</div>
      <div class="container hero-inner">
        <div>
          <span class="hero-badge">🐥 Unofficial Fan Site · 지구미</span>
          <h1>YENA<br><span class="ko">최예나 · 崔叡娜</span></h1>
          <p class="lead">${esc((P_L("intro") || P.intro).split(/[。.]\s?/)[0])}${LANG === "zh" ? "。" : ". "}${t("行程、作品、照片、周邊與社群動態，和 지구미 一起追星 ♥")}</p>
          <div class="hero-actions">
            <a class="btn yellow" href="#schedule">📅 ${t("看行程")}</a>
            <a class="btn ghost" href="#gallery">📸 ${t("相簿")}</a>
            <a class="btn ghost" href="#music">🎵 ${t("作品集")}</a>
          </div>
        </div>
        <div class="collage">
          ${(D.heroPhotos || []).map(([a, i]) => {
            const g = M.albums[a];
            return `<figure class="polaroid" data-photo="${g.id},${i}" style="margin:0">${img(g.images[i].th, g.title, { fb: g.images[i].u })}<figcaption>${esc(g.title.replace(/^[^\w가-힣一-鿿]+/, "").slice(0, 14))}</figcaption></figure>`;
          }).join("")}
          ${duck()}
          <span class="sticker" style="top:-6px;left:2%">💖</span>
          <span class="sticker" style="bottom:28px;right:4%;animation-delay:.9s">⭐</span>
          <span class="sticker" style="top:4px;right:18%;animation-delay:1.6s">🍒</span>
        </div>
      </div>
      <svg class="hero-wave" viewBox="0 0 1440 46" preserveAspectRatio="none" aria-hidden="true"><path d="M0 46V24c120-20 240-20 360 0s240 20 360 0 240-20 360 0 240 20 360 0v22z" fill="var(--bg)"/></svg>
    </section>

    <div class="container">
      <div class="stat-row">
        <div class="card stat"><div class="num">${soloDays.toLocaleString()}<small> ${t("天")}</small></div><div class="label">${t("Solo 出道第幾天")}</div></div>
        <div class="card stat"><div class="num">${toBday === 0 ? "🎂" : "D-" + toBday}</div><div class="label">${toBday === 0 ? t("今天是 YENA 生日！") : t("距離 9/29 生日")}</div></div>
        <a class="card stat" href="#music"><div class="num">${M.releases.length}</div><div class="label">${t("收錄作品")}</div></a>
        <a class="card stat" href="#records"><div class="num">${wonCount}<small> ${t("座")}</small></div><div class="label">${t("得獎紀錄")}</div></a>
      </div>

      ${target ? `
      <h2 class="section-title">${t("下一個行程")} <a class="more" href="#schedule">${t("完整行程")} →</a></h2>
      <div class="card countdown-card clickable" data-open="e.${target.id}" tabindex="0" role="button">
        <div class="info">
          ${catTag(target.category)}
          <h3>${esc(target.title)}</h3>
          <div class="note">${fmtDate(target.date)}（${weekday(target.date)}）${target.time ? target.time + " KST" : ""} ${target.place ? "· " + esc(target.place) : ""}</div>
        </div>
        <div class="cd" data-countdown="${eventRange(target).start.toISOString()}">
          <div><b data-u="d">0</b><span>${t("天")}</span></div><div><b data-u="h">0</b><span>${t("時")}</span></div>
          <div><b data-u="m">0</b><span>${t("分")}</span></div><div><b data-u="s">0</b><span>${t("秒")}</span></div>
        </div>
      </div>` : ""}

      <h2 class="section-title">${t("最新消息")} <a class="more" href="#news">${t("更多消息")} →</a></h2>
      <div class="grid news-grid">${M.news.filter((n) => n.image).slice(0, 4).map(newsCard).join("")}</div>

      <div class="grid grid-2" style="margin-top:8px">
        <div>
          <h2 class="section-title">${t("最新作品")} <a class="more" href="#music">${t("全部作品")} →</a></h2>
          <div class="grid grid-2">${latest ? albumCard(latest) : ""}${vid ? videoCard(vid) : ""}</div>
        </div>
        <div>
          <h2 class="section-title">${t("近期行程")}</h2>
          <div class="card">${next.length ? next.map(eventHtml).join("") : `<div class="empty">${t("目前沒有已公布的行程")}</div>`}</div>
        </div>
      </div>

      <h2 class="section-title">${t("最新照片")} <a class="more" href="#gallery">${t("進入相簿")} →</a></h2>
      <div class="photo-strip">${photoAlbums.flatMap((g) => g.images.slice(0, 4).map((p, i) => img(p.th, p.cap || g.title, { fb: p.fb || p.u, attrs: `data-photo="${g.id},${i}"` }))).join("")}</div>

      <h2 class="section-title">${t("追蹤 YENA")}</h2>
      <div class="grid grid-3">${D.socials.slice(0, 3).map(snsCard).join("")}</div>
    </div>`;
  };

  /* ---------- 簡介 ---------- */
  pages.profile = () => {
    const P = D.profile;
    const age = (() => { const tt = todayStr(); let a = +tt.slice(0, 4) - +P.birth.slice(0, 4); if (tt.slice(5) < P.birth.slice(5)) a--; return a; })();
    const facts = P_L("facts") || P.facts;
    const tl = P_L("timeline");
    const rows = [
      [t("本名"), `${P.nameKo}（${P.nameEn}）`],
      [t("藝名"), P.stageName],
      [t("中文名"), P.nameZh],
      [t("生日"), `${fmtDate(P.birth)}（${t("{n} 歲", { n: age })}）`],
      [t("出生地"), P_L("birthplace") || P.birthplace],
      [t("學歷"), P_L("school") || P.school],
      [t("經紀公司"), P_L("agency") || P.agency],
      [t("日本廠牌"), P_L("jpLabel") || P.jpLabel],
      [t("身份"), P_L("occupation") || P.occupation],
      [t("家人"), P_L("family") || P.family],
      [t("IZ*ONE 出道"), fmtDate(P.izoneDebut)],
      [t("Solo 出道"), fmtDate(P.soloDebut)],
      [t("粉絲名"), `${P.fandom.name}（${P.fandom.roman}）`],
    ];
    const [pa, pi] = D.profilePhoto;
    const pg = M.albums[pa];
    return `<section class="page container">
      <h1 class="page-title">🐥 ${t("YENA 簡介")}</h1>
      <p class="page-sub">${t("基本資料、經歷年表與獲獎紀錄")}</p>
      <div class="profile-top">
        <div class="avatar"><img class="photo" src="${esc(pg.images[pi].u)}" alt="YENA" referrerpolicy="no-referrer" data-photo="${pg.id},${pi}" style="cursor:zoom-in"><span class="cap">YENA ♥ 최예나</span></div>
        <div class="card">
          <p style="margin-top:0">${esc(P_L("intro") || P.intro)}</p>
          <table class="info-table">${rows.map(([k, v]) => `<tr><th>${k}</th><td>${esc(v)}</td></tr>`).join("")}
            <tr><th>${t("應援色")}</th><td><span style="display:inline-block;width:14px;height:14px;border-radius:4px;background:${P.color.hex};vertical-align:middle"></span> ${esc(P_L("colorName") || P.color.name)}${verifiedTag(P.color.verified)}</td></tr></table>
        </div>
      </div>

      <div class="grid grid-2">
        <div>
          <h2 class="section-title">${t("經歷年表")}</h2>
          <div class="card"><div class="timeline">${P.timeline.map((x, i) => `<div class="tl-item"><div class="d">${fmtDate(x.date)}</div><h4>${esc(tl && tl[i] ? tl[i][0] : x.title)}</h4><p>${esc(tl && tl[i] ? tl[i][1] : x.desc)}</p></div>`).join("")}</div></div>
        </div>
        <div>
          <h2 class="section-title">${t("YENA 小知識 TMI")}</h2>
          <div class="card"><ul class="fact-list">${facts.map((f) => `<li>${esc(f)}</li>`).join("")}</ul></div>
          <h2 class="section-title">${t("獲獎紀錄")} <a class="more" href="#records">${t("完整成績")} →</a></h2>
          <div class="card table-wrap"><table class="tbl" style="min-width:0">
            <tr><th>${t("日期")}</th><th>${t("典禮")}</th><th>${t("獎項")}</th></tr>
            ${M.awards.filter((a) => a.result === "Won").slice(0, 8).map((a) => `<tr><td>${a.date ? fmtDate(a.date) : a.year}</td><td>${esc(a.event)}</td><td><b>${esc(t(a.award))}</b>${a.work ? `<br><span class="note">${esc(a.work)}</span>` : ""}</td></tr>`).join("")}
          </table></div>
        </div>
      </div>

      <h2 class="section-title">${t("綜藝 / 戲劇 / 主持")}</h2>
      <div class="card table-wrap"><table class="tbl">
        <tr><th>${t("年份")}</th><th>${t("作品")}</th><th>${t("類型")}</th><th>${t("角色")}</th></tr>
        ${D.appearances.map((a) => `<tr><td>${esc(a.year)}</td><td>${esc(a.title)}</td><td><span class="tag">${esc(t(a.type))}</span></td><td>${esc(a.role)}</td></tr>`).join("")}
      </table></div>
    </section>`;
  };

  /* ---------- 作品 ---------- */
  const musicState = { type: "all", order: "new" };
  pages.music = () => {
    const chips = [["all", "全部"], ...Object.entries(TYPES)];
    let list = M.releases.filter((r) => musicState.type === "all" || r.type === musicState.type);
    list = list.slice().sort((a, b) => (musicState.order === "new" ? byNew(a, b) : -byNew(a, b)));
    return `<section class="page container">
      <h1 class="page-title">🎵 ${t("作品集 Discography")}</h1>
      <p class="page-sub">${t("點擊專輯可看曲目、試聽 30 秒與各平台連結。封面與曲目由 iTunes 自動更新。")}</p>
      <div class="toggle-row">
        <div class="chips" style="margin:0">${chips.map(([k, v]) => `<button class="chip${musicState.type === k ? " active" : ""}" data-mtype="${k}">${t(v)}</button>`).join("")}</div>
        <button class="chip" data-morder style="margin-left:auto">${musicState.order === "new" ? "⬇ " + t("由新到舊") : "⬆ " + t("由舊到新")}</button>
      </div>
      <div class="grid grid-auto">${list.map(albumCard).join("") || `<div class="empty">${t("沒有符合的作品")}</div>`}</div>

      <h2 class="section-title">${t("官方最新影片")} <a class="more" href="https://www.youtube.com/@YENA_OFFICIAL" target="_blank" rel="noopener">YouTube ↗</a></h2>
      <div class="grid video-grid">${M.videos.slice(0, 8).map(videoCard).join("")}</div>

      <h2 class="section-title">${t("新手入坑推薦 6 首")}</h2>
      <div class="card table-wrap"><table class="tbl">
        <tr><th>#</th><th>${t("歌曲")}</th><th>${t("推薦原因")}</th><th></th></tr>
        ${D.starter.map((s, i) => `<tr><td>${i + 1}</td><td><b>${esc(s.song)}</b></td><td>${esc(s.why)}</td><td><a class="btn ghost sm" href="https://www.youtube.com/results?search_query=${q("YENA " + s.song)}" target="_blank" rel="noopener">▶ ${t("聽")}</a></td></tr>`).join("")}
      </table></div>
    </section>`;
  };

  /* ---------- 行程 ---------- */
  const schedState = { y: null, m: null, sel: null, cat: "all", view: "upcoming" };
  pages.schedule = () => {
    const now = new Date();
    const td = todayStr();
    if (schedState.y === null) { schedState.y = +td.slice(0, 4); schedState.m = +td.slice(5, 7); }
    const { y, m } = schedState;
    const evs = allEvents(yearsAround(y)).filter((e) => schedState.cat === "all" || e.category === schedState.cat);
    const byDay = {};
    evs.forEach((e) => (byDay[e.date] = byDay[e.date] || []).push(e));
    const first = new Date(Date.UTC(y, m - 1, 1));
    const startDow = first.getUTCDay();
    const daysIn = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const cells = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(Date.UTC(y, m - 1, 1 - startDow + i));
      const ds = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
      const es = byDay[ds] || [];
      cells.push(`<button class="cal-day${d.getUTCMonth() !== m - 1 ? " other" : ""}${ds === td ? " today" : ""}${es.length ? " has" : ""}${schedState.sel === ds ? " selected" : ""}" data-day="${ds}" aria-label="${ds}${es.length ? ` (${es.length})` : ""}">
        ${d.getUTCDate()}<span class="cal-dots">${es.slice(0, 4).map((e) => `<i style="background:${(CATS[e.category] || CATS.etc).color}"></i>`).join("")}</span></button>`);
      if (i >= 34 && i % 7 === 6 && 1 - startDow + i >= daysIn) break;
    }
    let listTitle, list;
    if (schedState.sel) { listTitle = `${fmtDate(schedState.sel)}（${weekday(schedState.sel)}）`; list = byDay[schedState.sel] || []; }
    else if (schedState.view === "upcoming") { listTitle = t("即將到來"); list = evs.filter((e) => eventRange(e).end > now).slice(0, 12); }
    else if (schedState.view === "past") { listTitle = t("過去行程"); list = evs.filter((e) => eventRange(e).end <= now && e.category !== "anniv").reverse().slice(0, 30); }
    else { listTitle = ym(y, m); list = evs.filter((e) => e.date.startsWith(`${y}-${pad(m)}`)); }

    return `<section class="page container">
      <h1 class="page-title">📅 ${t("行程表 Schedule")}</h1>
      <p class="page-sub">${t("時間以韓國時間（KST）標示")}${isKstUser ? "" : t("，並自動換算為你所在地區的時間")}。${t("點擊行程可看詳細資訊、地圖與相關新聞。")}</p>
      <div class="chips">
        <button class="chip${schedState.cat === "all" ? " active" : ""}" data-cat="all">${t("全部")}</button>
        ${Object.entries(CATS).map(([k, c]) => `<button class="chip${schedState.cat === k ? " active" : ""}" data-cat="${k}"><span style="color:${c.color}">●</span> ${t(c.label)}</button>`).join("")}
      </div>
      <div class="sched-layout">
        <div class="card">
          <div class="cal-head">
            <button class="icon-btn" data-mon="-1" aria-label="${t("上個月")}">‹</button>
            <h3>${ym(y, m)}</h3>
            <button class="icon-btn" data-mon="1" aria-label="${t("下個月")}">›</button>
          </div>
          <div class="cal-grid">${WD[LANG].map((w) => `<div class="cal-dow">${w}</div>`).join("")}${cells.join("")}</div>
          <div class="cal-legend">${Object.values(CATS).map((c) => `<span><i style="background:${c.color}"></i>${t(c.label)}</span>`).join("")}</div>
          <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">
            <button class="btn sm" data-today>${t("回到今天")}</button>
            <button class="btn ghost sm" data-ics-all>📥 ${t("下載所有未來行程 (.ics)")}</button>
            ${submitBtn("schedule", t("投稿行程"))}
          </div>
        </div>
        <div>
          <div class="toggle-row">
            ${[["upcoming", "即將到來"], ["month", "本月"], ["past", "過去"]].map(([k, v]) => `<button class="chip${!schedState.sel && schedState.view === k ? " active" : ""}" data-view="${k}">${t(v)}</button>`).join("")}
          </div>
          <h3 style="margin:4px 0 12px">${listTitle}</h3>
          ${list.length ? list.map(eventHtml).join("") : `<div class="card empty">${t("這段時間沒有行程")} 🐥</div>`}
        </div>
      </div>
      <p class="note-box" style="margin-top:24px">${t("行程依官方公告與新聞整理；新作品發行、音樂節目一位會自動加入，粉絲投稿經審核後也會自動出現。臨時變動請以 YENA 官方 X（@YENA_OFFICIAL）公告為準。")}</p>
    </section>`;
  };

  /* ---------- 消息 ---------- */
  const newsState = { lang: "all", kw: "", n: 30 };
  const newsFilter = () => {
    const kw = newsState.kw.trim().toLowerCase();
    return M.news.filter((n) => (newsState.lang === "all" || (newsState.lang === "curated" ? n.curated : n.lang === newsState.lang)) && (!kw || (n.title + " " + n.desc + " " + n.source).toLowerCase().includes(kw)));
  };
  const newsListHtml = () => { const l = newsFilter(); return (l.slice(0, newsState.n).map(newsItem).join("") || `<div class="empty">${t("找不到符合的消息")}</div>`) + (l.length > newsState.n ? `<div style="text-align:center;margin-top:14px"><button class="btn ghost" data-news-more>${t("載入更多")}（${l.length - newsState.n}）</button></div>` : ""); };
  pages.news = () => `<section class="page container">
      <h1 class="page-title">📰 ${t("最新消息")}</h1>
      <p class="page-sub">${t("每隔幾小時自動收集韓、英、中文新聞；點擊可看配圖、摘要與原文連結。")}${A.updatedAt ? ` ${t("最後更新")}：${ago(A.updatedAt)}` : ""}</p>
      <input class="input" type="search" placeholder="🔍 ${t("搜尋消息…")}" value="${esc(newsState.kw)}" data-newskw style="margin-bottom:14px">
      <div class="chips">
        ${[["all", "全部"], ["curated", "精選"], ["zh", "中文"], ["ko", "한국어"], ["en", "English"]].map(([k, v]) => `<button class="chip${newsState.lang === k ? " active" : ""}" data-nlang="${k}">${t(v)}</button>`).join("")}
      </div>
      <div class="card" data-newslist>${newsListHtml()}</div>
      <p class="note">${t("自動收集的新聞僅顯示標題、媒體提供的摘要與配圖，完整內容請至原文閱讀；版權屬各媒體所有。")}</p>
    </section>`;

  /* ---------- 周邊 ---------- */
  const goodsState = { st: "all" };
  const goodsCard = (g) => {
    const s = GOODS_STATUS[g.status] || GOODS_STATUS.onsale;
    const left = g.preorderEnd ? daysFrom(todayStr(), g.preorderEnd) : null;
    return `<article class="card goods-card clickable" data-open="g.${g.id}" tabindex="0" role="button">
      <div class="gimg${g.img ? " has" : ""}" data-imgbox>${g.img ? img(g.img, g.name) : ""}<span class="gemoji">${g.emoji || "🎁"}</span></div>
      <div style="display:flex;gap:6px;flex-wrap:wrap"><span class="tag ${s.cls}">${t(s.label)}</span><span class="tag">${esc(t(g.type || ""))}</span>${autoBadge(g)}</div>
      <h4>${esc(g.name)}</h4>
      <div class="meta">
        ${g.release ? `<span>${t("發售")}：${fmtDate(g.release)}</span>` : ""}
        ${g.preorderEnd ? `<span>${t("預購截止")}：${fmtDate(g.preorderEnd)}</span>` : ""}
      </div>
      ${left !== null && left >= 0 && g.status === "preorder" ? `<div class="deadline">⏰ ${left === 0 ? t("今天截止！") : t("剩 {n} 天截止", { n: left })}</div>` : ""}
    </article>`;
  };
  pages.goods = () => {
    const list = M.goods.filter((g) => goodsState.st === "all" || g.status === goodsState.st);
    return `<section class="page container">
      <h1 class="page-title">🛍️ ${t("周邊 & 專輯")}</h1>
      <p class="page-sub">${t("官方專輯、年曆、演唱會 MD 等販售資訊。新專輯會自動加入，點擊可看詳細資訊與購買通路。")}</p>
      <div class="toggle-row">
        <div class="chips" style="margin:0">
          <button class="chip${goodsState.st === "all" ? " active" : ""}" data-gst="all">${t("全部")}</button>
          ${Object.entries(GOODS_STATUS).map(([k, s]) => `<button class="chip${goodsState.st === k ? " active" : ""}" data-gst="${k}">${t(s.label)}</button>`).join("")}
        </div>
        <span style="margin-left:auto">${submitBtn("goods", t("投稿周邊"))}</span>
      </div>
      <div class="grid grid-auto">${list.map(goodsCard).join("") || `<div class="empty">${t("沒有符合的品項")}</div>`}</div>
      <h2 class="section-title">${t("購買小提醒")}</h2>
      ${langNotice()}
      <div class="grid grid-3">
        <div class="card"><h4 style="margin-top:0">✅ 認明正版</h4><p class="note">優先從官方指定通路購買。二手平台購買時注意是否為盜版小卡或仿冒周邊。</p></div>
        <div class="card"><h4 style="margin-top:0">📦 特典差異</h4><p class="note">不同通路（Ktown4u、Weverse Shop、各唱片行）的預購特典小卡不同，下單前先比較。</p></div>
        <div class="card"><h4 style="margin-top:0">📊 銷量計入</h4><p class="note">想幫 YENA 衝初動銷量的話，選擇有計入 Hanteo / Circle Chart 的通路。</p></div>
      </div>
    </section>`;
  };

  /* ---------- 成績 ---------- */
  const recState = { res: "Won" };
  pages.records = () => {
    const won = M.awards.filter((a) => a.result === "Won");
    const list = M.awards.filter((a) => recState.res === "all" || (recState.res === "Won" ? a.result === "Won" : a.result !== "Won"));
    const RES = { Won: "得獎", Nominated: "入圍", Longlisted: "初選入圍", Pending: "待公布", Shortlisted: "決選入圍" };
    return `<section class="page container">
      <h1 class="page-title">🏆 ${t("成績紀錄")}</h1>
      <p class="page-sub">${t("音樂節目一位、頒獎典禮與排行榜紀錄。獎項與一位資料自動取自維基百科，新紀錄會自動補上。")}</p>
      <div class="stat-row flat">
        <div class="card stat"><div class="num">${won.length}</div><div class="label">${t("得獎")}</div></div>
        <div class="card stat"><div class="num">${M.wins.length}</div><div class="label">${t("音樂節目一位")}</div></div>
        <div class="card stat"><div class="num">${M.releases.length}</div><div class="label">${t("發行作品")}</div></div>
        <div class="card stat"><div class="num">${esc((A.youtube && A.youtube.subscribers) || "—")}</div><div class="label">${t("YouTube 訂閱")}</div></div>
      </div>

      <div class="grid grid-2">
        <div>
          <h2 class="section-title">${t("🥇 音樂節目一位")}</h2>
          <div class="card table-wrap"><table class="tbl" style="min-width:0">
            <tr><th>${t("日期")}</th><th>${t("節目")}</th><th>${t("歌曲")}</th></tr>
            ${M.wins.map((w) => `<tr><td>${fmtDate(w.date)}</td><td>${esc(w.show)}${w.episode ? ` <span class="note">EP.${esc(w.episode)}</span>` : ""}</td><td><b>${esc(w.song)}</b></td></tr>`).join("") || `<tr><td colspan="3" class="empty">${t("尚無資料")}</td></tr>`}
          </table></div>
          <h2 class="section-title">${t("📈 排行榜與紀錄")}</h2>
          <div class="card">${(D.records || []).slice().sort(byNew).map((r) => `<div class="news-item"><div class="news-date"><b>${r.date.slice(8)}</b><span>${r.date.slice(0, 7).replace("-", ".")}</span></div><div class="news-body"><h4>${esc(r.title)}</h4><p>${esc(r.detail)}</p><div class="news-meta"><a href="${esc(safeUrl(r.url))}" target="_blank" rel="noopener">${esc(r.source)} ↗</a></div></div></div>`).join("")}</div>
        </div>
        <div>
          <h2 class="section-title">${t("🏆 頒獎典禮")}</h2>
          <div class="chips">${[["Won", "得獎"], ["nom", "入圍"], ["all", "全部"]].map(([k, v]) => `<button class="chip${recState.res === k ? " active" : ""}" data-rres="${k}">${t(v)}</button>`).join("")}</div>
          <div class="card table-wrap"><table class="tbl" style="min-width:0">
            <tr><th>${t("年份")}</th><th>${t("典禮")}</th><th>${t("獎項")}</th><th>${t("結果")}</th></tr>
            ${list.map((a) => `<tr><td>${a.date ? fmtDate(a.date) : a.year}</td><td>${esc(a.event)}</td><td>${esc(t(a.award))}${a.work ? `<br><span class="note">${esc(a.work)}</span>` : ""}</td><td><span class="tag ${a.result === "Won" ? "yellow" : "gray"}">${t(RES[a.result] || a.result)}</span></td></tr>`).join("")}
          </table></div>
          <p class="note">${t("來源：英文維基百科（{t}）與本站整理。", { t: A.updatedAt ? fmtDate(A.updatedAt) : "—" })}</p>
        </div>
      </div>
    </section>`;
  };

  /* ---------- 應援活動 ---------- */
  pages.events = () => {
    const td = todayStr();
    const up = M.fanEvents.filter((e) => (e.end || e.date) >= td).reverse();
    const past = M.fanEvents.filter((e) => (e.end || e.date) < td);
    const card = (e) => `<article class="card goods-card clickable" data-open="f.${e.id}" tabindex="0" role="button">
      <div class="gimg${e.image ? " has" : ""}" data-imgbox>${e.image ? img(e.image, e.title) : ""}<span class="gemoji">💛</span></div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">${e.kind ? `<span class="tag pink">${esc(e.kind)}</span>` : ""}${autoBadge(e)}</div>
      <h4>${esc(e.title)}</h4>
      <div class="meta"><span>📅 ${fmtDate(e.date)}${e.end ? " – " + fmtDate(e.end) : ""}</span>${e.place ? `<span>📍 ${esc(e.place)}</span>` : ""}${e.host ? `<span>🙋 ${esc(e.host)}</span>` : ""}</div>
    </article>`;
    return `<section class="page container">
      <h1 class="page-title">💛 ${t("應援活動")}</h1>
      <p class="page-sub">${t("生日咖啡廳、應援廣告、應援物發放等粉絲活動。任何人都能投稿，審核通過後自動刊登並加入行程表。")}</p>
      <div class="card submit-cta">
        <div style="flex:1 1 280px"><h3 style="margin:0 0 4px">${t("有應援活動想讓更多 지구미 知道？")}</h3><p class="note" style="margin:0">${t("透過 GitHub 表單投稿（需要 GitHub 帳號），站長審核後約數分鐘內就會出現在網站上。")}</p></div>
        ${submitBtn("fan-event", t("投稿應援活動"))}
      </div>
      <h2 class="section-title">${t("即將舉行")}</h2>
      ${up.length ? `<div class="grid grid-auto">${up.map(card).join("")}</div>` : `<div class="card empty">${t("目前沒有已登記的應援活動，歡迎投稿！")} 🐥</div>`}
      ${past.length ? `<h2 class="section-title">${t("過去的活動")}</h2><div class="grid grid-auto">${past.map(card).join("")}</div>` : ""}
      <h2 class="section-title">${t("常見應援活動")}</h2>
      ${langNotice()}
      <div class="grid grid-3">
        <div class="card"><h4 style="margin-top:0">☕ 生日咖啡廳（생카）</h4><p class="note">9/29 生日前後，粉絲租借咖啡廳布置成 YENA 主題，消費可領杯套、貼紙等應援小物。</p></div>
        <div class="card"><h4 style="margin-top:0">🚇 應援廣告</h4><p class="note">在地鐵站、公車、大型看板刊登生日或出道紀念日廣告，常見於首爾江南、弘大一帶。</p></div>
        <div class="card"><h4 style="margin-top:0">🎁 應援物發放</h4><p class="note">演唱會、頒獎典禮現場免費發放手幅、貼紙等，數量有限請遵守主辦規則。</p></div>
      </div>
    </section>`;
  };

  /* ---------- 社群 ---------- */
  pages.social = () => {
    const feed = [
      ...M.videos.slice(0, 12).map((v) => ({ platform: "youtube", date: v.date.slice(0, 10), iso: v.date, text: v.title, open: "v." + v.id, thumb: ytThumb(v), fb: ytFb(v) })),
      ...D.feed.map((f) => ({ ...f, thumb: (A.og && A.og[f.url] && A.og[f.url].image) || "" })),
    ].sort(byNew).filter((f, i, arr) => arr.findIndex((x) => x.url && x.url === f.url) === i || !f.url);
    return `<section class="page container">
      <h1 class="page-title">💬 ${t("官方社群")}</h1>
      <p class="page-sub">${t("YENA 的官方帳號一覽；YouTube 動態會自動更新。")}</p>
      <div class="grid grid-3">${D.socials.map(snsCard).join("")}</div>
      <p class="note-box" style="margin-top:16px">${t("標示「待確認」的帳號尚未經官方來源核對，連結會先帶你到該平台的搜尋結果，請認明官方認證標章 ✔️ 以免追到假帳號。")}</p>
      <h2 class="section-title">${t("最新動態")}</h2>
      <div class="card">${feed.slice(0, 16).map((f) => `<${f.open ? "button" : "a"} class="feed-item clickable" ${f.open ? `data-open="${esc(f.open)}"` : `href="${esc(safeUrl(f.url))}" target="_blank" rel="noopener"`}>
          ${snsIcon(f.platform)}
          <div style="min-width:0;flex:1"><span class="note">${f.iso ? ago(f.iso) : fmtDate(f.date)}</span><p>${esc(f.text)}</p></div>
          ${f.thumb ? `<div class="news-thumb" data-imgbox>${img(f.thumb, "", { fb: f.fb })}</div>` : ""}
        </${f.open ? "button" : "a"}>`).join("")}</div>
    </section>`;
  };

  /* ---------- 應援指南 ---------- */
  pages.guide = () => `<section class="page container">
      <h1 class="page-title">📣 ${t("應援指南")}</h1>
      <p class="page-sub">${t("新粉也能馬上上手：打榜、投票、追星禮儀一次看懂。")}</p>
      ${langNotice()}
      <div class="grid grid-2">
        <div class="card">
          <h2 class="section-title" style="margin-top:0">🎧 ${t("串流打榜")}</h2>
          <ol class="guide-steps">
            <li><div><b>韓國音源平台</b><br><span class="note">Melon、Genie、Bugs、FLO、VIBE 是 Circle Chart 與音樂節目計分來源，有帳號的話優先使用。</span></div></li>
            <li><div><b>建立歌單播放</b><br><span class="note">主打曲搭配收錄曲與其他歌手歌曲交錯播放，避免同一首單曲無限循環被判定為異常。</span></div></li>
            <li><div><b>音量不要調成 0</b><br><span class="note">部分平台會不計入靜音播放。</span></div></li>
            <li><div><b>全球平台</b><br><span class="note">Spotify、Apple Music、YouTube Music 也算數，Spotify 可加入 YENA 的「This Is YENA」歌單。</span></div></li>
          </ol>
        </div>
        <div class="card">
          <h2 class="section-title" style="margin-top:0">▶ YouTube MV</h2>
          <ol class="guide-steps">
            <li><div><b>登入帳號觀看</b><br><span class="note">未登入或無痕模式的觀看數計入率較低。</span></div></li>
            <li><div><b>不要調到最低畫質、不要靜音</b></div></li>
            <li><div><b>觀看間穿插其他影片</b><br><span class="note">連續重播同一支 MV 可能被過濾。</span></div></li>
            <li><div><b>按讚、留言、分享</b><br><span class="note">互動有助於推薦演算法。</span></div></li>
          </ol>
        </div>
      </div>
      <h2 class="section-title">🗳️ ${t("音樂節目投票")}</h2>
      <div class="card table-wrap"><table class="tbl">
        <tr><th>${t("節目")}</th><th>${t("電視台")}</th><th>${t("播出（KST）")}</th><th>${t("投票方式")}</th></tr>
        <tr><td>THE SHOW</td><td>SBS M</td><td>${WD[LANG][2]}</td><td>依節目公告的投票 App</td></tr>
        <tr><td>Show Champion</td><td>MBC M</td><td>${WD[LANG][3]}</td><td>IDOLCHAMP App</td></tr>
        <tr><td>M Countdown</td><td>Mnet</td><td>${WD[LANG][4]}</td><td>Mnet Plus App</td></tr>
        <tr><td>Music Bank</td><td>KBS2</td><td>${WD[LANG][5]}</td><td>依節目公告（海外粉絲部分可參與）</td></tr>
        <tr><td>Show! Music Core</td><td>MBC</td><td>${WD[LANG][6]}</td><td>依節目公告的投票 App</td></tr>
        <tr><td>Inkigayo</td><td>SBS</td><td>${WD[LANG][0]}</td><td>依節目公告的投票 App</td></tr>
      </table></div>
      <p class="note">各節目的投票平台與計分方式每年可能調整，回歸期間請以節目與 YENA 官方帳號公告為準。</p>
      <h2 class="section-title">💛 ${t("追星禮儀")}</h2>
      <div class="grid grid-3">
        <div class="card"><h4 style="margin-top:0">🚫 拒絕私生</h4><p class="note">不跟蹤、不打探私人行程、不在非公開場合打擾 YENA 與工作人員。</p></div>
        <div class="card"><h4 style="margin-top:0">🔍 不傳謠言</h4><p class="note">未經官方證實的消息不散布，發現惡意留言請檢舉而非回應。</p></div>
        <div class="card"><h4 style="margin-top:0">📸 尊重版權</h4><p class="note">轉載站姐、媒體照片時標註出處，不擅自去浮水印或商用。</p></div>
      </div>
    </section>`;

  /* ---------- 粉絲專區 ---------- */
  const quizState = { i: 0, score: 0, answered: false, done: false };
  function quizHtml() {
    const Q = D.quiz;
    if (quizState.done) {
      const s = quizState.score;
      const msg = s === Q.length ? "滿分！你是真正的 지구미 👑" : s >= Q.length * 0.7 ? "很厲害！YENA 會為你驕傲 💛" : s >= Q.length * 0.4 ? "還不錯，多逛逛本站會更懂 YENA 🐥" : "沒關係，從今天開始認識 YENA 吧！";
      return `<div style="text-align:center;padding:16px 0"><div style="font-size:3rem">${s === Q.length ? "🏆" : "🐥"}</div>
        <h3 style="margin:8px 0">${s} / ${Q.length}</h3><p>${msg}</p><button class="btn" data-quiz-restart>${t("再玩一次")}</button></div>`;
    }
    const item = Q[quizState.i];
    return `<div class="progress"><div style="width:${(quizState.i / Q.length) * 100}%"></div></div>
      <p class="note" style="margin:10px 0 0">${quizState.i + 1} / ${Q.length} · ${t("目前 {n} 分", { n: quizState.score })}</p>
      <p class="quiz-q">${esc(item.q)}</p>
      <div class="quiz-opts">${item.options.map((o, i) => `<button class="quiz-opt" data-opt="${i}">${esc(o)}</button>`).join("")}</div>
      <p class="note" data-quiz-explain style="min-height:1.5em;margin:12px 0 0"></p>
      <button class="btn sm" data-quiz-next style="display:none;margin-top:8px">${t("下一題")} →</button>`;
  }
  pages.fans = () => {
    const P = D.profile;
    let saved = "";
    try { saved = localStorage.getItem("yena-fan-since") || ""; } catch (e) {}
    return `<section class="page container">
      <h1 class="page-title">💛 ${t("지구미 粉絲專區")}</h1>
      <p class="page-sub">${t("粉絲名由來、用語小字典、YENA 知識王測驗。")}</p>
      <div class="card fandom-banner">
        <div class="color-swatch" style="background:${P.color.hex}"></div>
        <div style="flex:1 1 280px">
          <span class="tag" style="background:rgba(255,255,255,.7)">Official Fandom Name</span>
          <h3>${esc(P.fandom.name)} · ${esc(P.fandom.roman)}</h3>
          <p style="margin:6px 0 0">${esc(P_L("fandomMeaning") || P.fandom.meaning)}</p>
        </div>
      </div>
      ${langNotice()}
      <div class="grid grid-2">
        <div>
          <h2 class="section-title">🎓 ${t("YENA 知識王")}</h2>
          <div class="card" data-quiz>${quizHtml()}</div>
          <h2 class="section-title">📆 ${t("我和 YENA 的第幾天")}</h2>
          <div class="card">
            <label for="fanSince" class="note">${t("你是哪一天入坑的？")}</label>
            <div style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap"><input type="date" id="fanSince" class="input" style="flex:1 1 180px" value="${esc(saved)}" max="${todayStr()}"></div>
            <p data-fan-days style="font-size:1.1rem;font-weight:700;margin:12px 0 0"></p>
          </div>
        </div>
        <div>
          <h2 class="section-title">📖 ${t("粉絲用語小字典")}</h2>
          <div class="card"><table class="tbl" style="min-width:0">${D.glossary.map((g) => `<tr><td style="white-space:nowrap"><b>${esc(g.term)}</b></td><td>${esc(g.desc)}</td></tr>`).join("")}</table></div>
          <h2 class="section-title">🎂 ${t("每年紀念日")}</h2>
          <div class="card">${D.anniversaries.map((a) => {
            const tt = todayStr();
            let next = `${tt.slice(0, 4)}-${a.md}`;
            if (next < tt) next = `${+tt.slice(0, 4) + 1}-${a.md}`;
            const left = daysFrom(tt, next);
            return `<div class="news-item"><div class="news-date"><b>${a.md.slice(3)}</b><span>${+a.md.slice(0, 2)}${LANG === "en" ? "" : t("月")}</span></div>
              <div class="news-body"><h4>${esc(t(a.title))}</h4><p>${left === 0 ? t("就是今天！🎉") : t("還有 {n} 天", { n: left })}（${t("{y} 年為第 {n} " + a.unit, { y: next.slice(0, 4), n: +next.slice(0, 4) - a.since })}）</p></div></div>`;
          }).join("")}</div>
        </div>
      </div>
    </section>`;
  };

  /* ---------- 相簿 ---------- */
  const galleryState = { cat: "all" };
  pages.gallery = () => {
    const list = M.albums.filter((g) => galleryState.cat === "all" || g.cat === galleryState.cat).sort(byNew);
    const total = M.albums.reduce((n, g) => n + g.images.length, 0);
    const cats = Object.keys(GCATS).filter((k) => M.albums.some((g) => g.cat === k));
    return `<section class="page container">
      <h1 class="page-title">📸 ${t("YENA 相簿")}</h1>
      <p class="page-sub">${t("{a} 本相簿、{n} 張照片。新聞照片與官方影片會自動更新；點開可下載、分享單張照片連結。", { a: M.albums.length, n: total })}</p>
      <div class="chips">
        <button class="chip${galleryState.cat === "all" ? " active" : ""}" data-gcat="all">${t("全部")}</button>
        ${cats.map((k) => `<button class="chip${galleryState.cat === k ? " active" : ""}" data-gcat="${k}">${t(GCATS[k])}</button>`).join("")}
      </div>
      <div class="gal-grid">${list.map((g) => `<button class="card gal-card" data-album="${g.id}">
        <div class="gal-thumb" data-imgbox>${img(g.images[0].th, g.title, { fb: g.images[0].fb || g.images[0].u })}<span class="gal-count">📷 ${g.images.length}</span></div>
        <div class="gb"><span class="tag pink">${t(GCATS[g.cat])}</span> ${autoBadge(g)}<h4>${esc(g.title)}</h4><span class="note">${fmtDate(g.date)} · ${esc(g.credit)}</span></div>
      </button>`).join("")}</div>
      <p class="note-box" style="margin-top:20px">${t("照片版權屬原著作權人（所屬公司、媒體等）。人工相簿經 kpopping 整理，新聞照片取自各媒體報導，本站僅以連結方式顯示並標註來源；若有疑慮將立即移除。")}</p>
    </section>`;
  };

  /* =========================================================
     燈箱 & 下載
     ========================================================= */
  const lb = { al: null, i: 0 };
  const albumById = (id) => M.albums.find((a) => a.id === id);
  function lbShow() {
    const g = lb.al, p = g.images[lb.i], el = $("#lb");
    el.innerHTML = `<div class="lb-tools">
        <button class="lb-tool" data-dl-one>⬇ ${t("下載這張")}</button>
        ${g.images.length > 1 ? `<button class="lb-tool" data-dl-all>${dlBusy ? "📦 " + t("打包中…") : `📦 ${t("整本下載（{n} 張 zip）", { n: g.images.length })}`}</button>` : ""}
        <button class="lb-tool" data-share-photo>🔗 ${t("分享")}</button>
      </div>
      <button class="lb-btn lb-close" data-lb-close aria-label="${t("關閉")}">✕</button>
      ${g.images.length > 1 ? `<button class="lb-btn lb-prev" data-lb="-1" aria-label="${t("上一張")}">‹</button>` : ""}
      <img class="main" src="${esc(p.u)}" ${p.fb ? `data-fb="${esc(p.fb)}"` : ""} alt="${esc(p.cap || g.title)}" referrerpolicy="no-referrer" onerror="__imgErr(this)">
      ${g.images.length > 1 ? `<button class="lb-btn lb-next" data-lb="1" aria-label="${t("下一張")}">›</button>` : ""}
      <div class="cap"><b>${esc(p.cap || g.title)}</b>（${lb.i + 1} / ${g.images.length}）· ${fmtDate(p.date || g.date)} · ${t("來源")}：${esc(p.src || g.credit)}
        ${safeUrl(p.link) ? ` · <a href="${esc(p.link)}" target="_blank" rel="noopener">${p.video ? "YouTube" : p.news ? t("原文") : "kpopping"} ↗</a>` : ""}
        ${p.news ? ` · <a href="#news?d=n.${p.news}">${t("看新聞")}</a>` : ""}</div>
      ${g.images.length > 1 ? `<div class="lb-thumbs">${g.images.map((x, k) => `<img src="${esc(x.th)}" ${x.fb ? `data-fb="${esc(x.fb)}"` : ""} data-lbi="${k}" class="${k === lb.i ? "on" : ""}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="__imgErr(this)">`).join("")}</div>` : ""}`;
    el.classList.add("open");
    document.body.style.overflow = "hidden";
    setDetail(`p.${g.id}.${lb.i}`);
    $(".lb-thumbs .on", el)?.scrollIntoView({ block: "nearest", inline: "center" });
  }
  const lbOpen = (aid, i = 0) => { const al = albumById(aid); if (!al) return false; lb.al = al; lb.i = Math.min(Math.max(0, i), al.images.length - 1); lbShow(); return true; };
  const lbMove = (d) => { const n = lb.al.images.length; lb.i = (lb.i + d + n) % n; lbShow(); };
  const lbClose = () => { $("#lb").classList.remove("open"); if (!$("#modal").classList.contains("open")) document.body.style.overflow = ""; clearDetail(); };
  addEventListener("keydown", (e) => {
    if ($("#lb").classList.contains("open")) {
      if (e.key === "Escape") lbClose();
      if (e.key === "ArrowLeft") lbMove(-1);
      if (e.key === "ArrowRight") lbMove(1);
      return;
    }
    if ($("#modal").classList.contains("open") && e.key === "Escape") return closeModal();
    if ((e.key === "/" || (e.key === "k" && (e.ctrlKey || e.metaKey))) && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); }
    if (e.key === "Enter" && document.activeElement.matches("[data-open][tabindex]")) document.activeElement.click();
  });
  let tx = null;
  addEventListener("touchstart", (e) => { if ($("#lb").classList.contains("open")) tx = e.touches[0].clientX; }, { passive: true });
  addEventListener("touchend", (e) => { if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; tx = null; if (Math.abs(dx) > 50) lbMove(dx < 0 ? 1 : -1); });

  const safeName = (s) => s.replace(/[\\/:*?"<>|]+/g, "").replace(/\s+/g, "_").slice(0, 60);
  const extOf = (u) => ((u.split("?")[0].match(/\.(jpe?g|png|webp|gif)$/i) || [, "jpg"])[1]).toLowerCase();
  const photoName = (g, k, u) => `YENA_${g.date}_${safeName(g.title)}_${pad(k + 1)}.${extOf(u)}`;
  const fetchBlob = async (u) => { const r = await fetch(u, { mode: "cors", referrerPolicy: "no-referrer" }); if (!r.ok) throw new Error(r.status); return r.blob(); };
  function saveBlob(blob, name) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  let dlBusy = false;
  async function downloadOne() {
    const g = lb.al, p = g.images[lb.i];
    toast(t("下載原圖中…"));
    try { saveBlob(await fetchBlob(p.u), photoName(g, lb.i, p.u)); toast(t("已下載 💖")); }
    catch { window.open(p.u, "_blank", "noopener"); toast(t("此圖片來源不允許直接下載，已在新分頁開啟原圖，可長按或右鍵另存"), 4000); }
  }
  let jszip;
  const loadJSZip = () => jszip || (jszip = new Promise((ok, no) => {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
    s.onload = () => ok(window.JSZip);
    s.onerror = () => { jszip = null; no(new Error("JSZip")); };
    document.head.appendChild(s);
  }));
  async function downloadAlbum() {
    if (dlBusy) return toast(t("上一個相簿還在打包中…"));
    dlBusy = true;
    const g = lb.al;
    const setBtn = (s) => { const b = $("[data-dl-all]"); if (b) b.textContent = s; };
    try {
      const JSZip = await loadJSZip();
      const zip = new JSZip();
      let done = 0, failed = 0;
      toast(t("打包中 {a} / {b}（原圖較大，請稍候）", { a: 0, b: g.images.length }));
      await Promise.all(g.images.map(async (p, k) => {
        try { zip.file(photoName(g, k, p.u), await fetchBlob(p.u)); } catch { failed++; }
        const msg = t("打包中 {a} / {b}", { a: ++done, b: g.images.length });
        toast(msg);
        setBtn("📦 " + msg);
      }));
      if (failed === g.images.length) throw new Error("all failed");
      zip.file("source.txt", `${g.title}\n${g.date}\n${g.credit}\n${g.url || ""}\n\n${g.images.map((p, k) => `${pad(k + 1)} ${p.src || ""} ${p.link || ""}`).join("\n")}\n\n照片版權屬原著作權人，僅供個人收藏，請勿商用。 / All rights belong to the original copyright holders. Personal use only.\n`);
      saveBlob(await zip.generateAsync({ type: "blob" }), `YENA_${g.date}_${safeName(g.title)}.zip`);
      toast(failed ? t("已下載，{n} 張來源不允許下載", { n: failed }) : t("已下載 {n} 張 💖", { n: g.images.length }), 3500);
    } catch { toast(t("這本相簿的來源不允許打包下載，請改用單張下載"), 3500); }
    finally { dlBusy = false; setBtn(`📦 ${t("整本下載（{n} 張 zip）", { n: g.images.length })}`); }
  }

  /* =========================================================
     詳細頁（彈出視窗）
     ========================================================= */
  let curRoute = "home";
  const detailHref = (d) => `${location.origin}${location.pathname}#${curRoute}?d=${d}`;
  function setDetail(d) { history.replaceState(null, "", `#${curRoute}?d=${d}`); }
  function clearDetail() { history.replaceState(null, "", `#${curRoute}`); }

  const shareRow = (d, title) => `<div class="share-row">
      <button class="btn ghost sm" data-copy="${esc(detailHref(d))}">🔗 ${t("複製連結")}</button>
      ${navigator.share ? `<button class="btn ghost sm" data-native-share="${esc(detailHref(d))}" data-title="${esc(title)}">📤 ${t("分享")}</button>` : ""}
      <a class="btn ghost sm" href="https://twitter.com/intent/tweet?text=${q(title + " #YENA #최예나")}&url=${q(detailHref(d))}" target="_blank" rel="noopener">X</a>
      <a class="btn ghost sm" href="https://social-plugins.line.me/lineit/share?url=${q(detailHref(d))}" target="_blank" rel="noopener">LINE</a>
      <a class="btn ghost sm" href="https://www.facebook.com/sharer/sharer.php?u=${q(detailHref(d))}" target="_blank" rel="noopener">Facebook</a>
    </div>`;
  const heroImg = (u, alt, fb, cls = "") => (u ? `<div class="detail-img ${cls}" data-imgbox>${img(u, alt, { fb, lazy: false })}</div>` : "");
  const relatedNews = (list, title = t("相關新聞")) => (list.length ? `<h3 class="detail-h">${title}</h3><div class="mini-list">${list.map((n) => `<button class="mini-item" data-open="n.${n.id}">${n.image ? `<span class="mi-img" data-imgbox>${img(n.image, "", { fb: n.fb })}</span>` : ""}<span><b>${esc(n.title)}</b><small>${esc(n.source)} · ${fmtDate(n.date)}</small></span></button>`).join("")}</div>` : "");
  const newsMatching = (re, except, n = 4) => M.news.filter((x) => x.id !== except && re.test(x.title + " " + x.desc)).slice(0, n);
  const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const keyRe = (...words) => { const w = words.flatMap((s) => (s || "").replace(/\(.*?\)|〈|〉|《|》/g, " ").split(/[\/·,]/)).map((s) => s.trim()).filter((s) => s.length >= 3 && !/^(yena|최예나|崔叡娜|feat\.?)$/i.test(s)); return w.length ? new RegExp(w.map(reEsc).join("|"), "i") : null; };
  const fmtMs = (ms) => (ms ? `${Math.floor(ms / 60000)}:${pad(Math.round((ms % 60000) / 1000))}` : "");
  const mapEmbed = (place) => (!place || /線上|online|온라인|平台|platform|YouTube|各大/i.test(place) ? "" : `<div class="map-box"><iframe loading="lazy" referrerpolicy="no-referrer" src="https://www.google.com/maps?q=${q(place)}&output=embed" title="map"></iframe></div><a class="btn ghost sm" href="https://www.google.com/maps/search/?api=1&query=${q(place)}" target="_blank" rel="noopener">🗺️ ${t("在 Google 地圖開啟")}</a>`);

  const DETAIL = {
    n(id) {
      const n = M.news.find((x) => x.id === id);
      if (!n) return null;
      const re = keyRe(...n.title.split(/[\s,，、…·'"‘’“”]+/).filter((w) => w.length >= 4).slice(0, 4));
      const rel = re ? newsMatching(re, n.id) : [];
      return { title: n.title, html: `
        ${heroImg(n.image, n.title, n.fb)}
        <div class="news-meta" style="margin-bottom:6px">${n.curated ? `<span class="tag pink">${t("精選")}</span>` : ""}${langTag(n.lang)}${n.tags.map((x) => `<span class="tag">#${esc(t(x))}</span>`).join("")}<span>${esc(n.source)} · ${fmtDate(n.date)}${n.iso ? ` (${ago(n.iso)})` : ""}</span></div>
        <h2 class="detail-title">${esc(n.title)}</h2>
        ${n.desc ? `<p class="detail-desc">${esc(n.desc)}</p>` : ""}
        ${safeUrl(n.url) ? `<a class="btn" href="${esc(n.url)}" target="_blank" rel="noopener">📰 ${t("閱讀原文")} ↗</a>` : ""}
        ${n.lang !== LANG && safeUrl(n.url) ? ` <a class="btn ghost" href="https://translate.google.com/translate?sl=auto&tl=${{ zh: "zh-TW", en: "en", ko: "ko" }[LANG]}&u=${q(n.url)}" target="_blank" rel="noopener">🌐 ${t("翻譯原文")}</a>` : ""}
        <p class="note">${n.curated ? t("本站整理摘要，詳細內容請見原文。") : t("摘要與配圖由媒體提供，完整內容與版權屬原媒體所有。")}</p>
        ${relatedNews(rel)}` };
    },
    r(id) {
      const r = M.releases.find((x) => x.id === id);
      if (!r) return null;
      const re = keyRe(r.title, r.titleTrack);
      const vids = re ? M.videos.filter((v) => re.test(v.title)).slice(0, 4) : [];
      return { title: r.title, html: `
        <div class="rel-head">
          ${coverBox(r, true)}
          <div>
            <span class="tag pink">${t(TYPES[r.type] || "")}</span> ${autoBadge(r)}
            <h2 class="detail-title">${esc(r.title)}${verifiedTag(r.verified)}</h2>
            <p class="note" style="margin:0">${fmtDate(r.date)}${r.it && r.it.genre ? " · " + esc(r.it.genre) : ""}${r.tracks.length ? " · " + t("{n} 首", { n: r.tracks.length }) : ""}</p>
            <p><b>${t("主打")}：</b>${esc(r.titleTrack)}</p>
            ${r.note ? `<p class="detail-desc">${esc(r.note)}</p>` : ""}
            <div class="album-links">${musicLinks(r)}</div>
          </div>
        </div>
        ${r.tracks.length ? `<h3 class="detail-h">${t("收錄曲")}</h3><ol class="track-list">${r.tracks.map((x, i) => `<li class="${x.title ? "title-track" : ""}"><span class="tn">${x.n || i + 1}</span><span class="tname">${esc(x.name)}${x.title ? ` <span class="tag pink">${t("主打")}</span>` : ""}${x.artist && !/^YENA$|^최예나$/i.test(x.artist) ? `<small>${esc(x.artist)}</small>` : ""}</span><span class="tdur">${fmtMs(x.ms)}</span>${x.preview ? `<button class="play-btn" data-preview="${esc(x.preview)}" aria-label="${t("試聽")}">▶</button>` : "<span></span>"}</li>`).join("")}</ol>
          ${r.tracks.some((x) => x.preview) ? `<p class="note">${t("試聽片段由 Apple Music 提供（30 秒）。")}</p>` : ""}` : ""}
        ${vids.length ? `<h3 class="detail-h">${t("相關影片")}</h3><div class="grid video-grid sm">${vids.map(videoCard).join("")}</div>` : ""}
        ${relatedNews(re ? newsMatching(re) : [])}
        ${r.it && r.it.copyright ? `<p class="note">${esc(r.it.copyright)}</p>` : ""}` };
    },
    e(id) {
      const e = findEvent(id);
      if (!e) return null;
      const r = eventRange(e);
      const future = r.end > new Date();
      const og = (e.link && A.og && A.og[e.link]) || {};
      const near = M.news.filter((n) => Math.abs(kst(n.date) - kst(e.date)) <= 3 * DAY);
      const re = keyRe(...e.title.split(/[\s（）()〈〉]+/).filter((w) => w.length >= 3));
      const rel = (re ? near.filter((n) => re.test(n.title + " " + n.desc)) : []).concat(near).filter((n, i, a) => a.indexOf(n) === i).slice(0, 4);
      const relImg = og.image || (rel.find((n) => n.image) || {}).image || "";
      const rel2 = e.rel && M.releases.find((x) => x.id === e.rel);
      return { title: e.title, html: `
        ${heroImg(rel2 && rel2.cover ? rel2.cover : relImg, e.title)}
        ${catTag(e.category)} ${autoBadge(e)}
        <h2 class="detail-title">${esc(e.title)}</h2>
        <div class="kv">
          <div><span>📅 ${t("日期")}</span><b>${fmtDate(e.date)}（${weekday(e.date)}）</b></div>
          <div><span>🕒 ${t("時間")}</span><b>${e.time ? `${e.time} KST${isKstUser ? "" : ` · ${t("當地")} ${localTime(r.start)}`}` : t("全天")}</b></div>
          ${e.place ? `<div><span>📍 ${t("地點")}</span><b>${esc(e.place)}</b></div>` : ""}
        </div>
        ${future ? `<div class="cd sm" data-countdown="${r.start.toISOString()}"><div><b data-u="d">0</b><span>${t("天")}</span></div><div><b data-u="h">0</b><span>${t("時")}</span></div><div><b data-u="m">0</b><span>${t("分")}</span></div><div><b data-u="s">0</b><span>${t("秒")}</span></div></div>` : ""}
        ${e.note ? `<p class="detail-desc">${esc(e.note)}</p>` : ""}
        ${og.desc ? `<blockquote class="og-quote">${esc(og.desc)}</blockquote>` : ""}
        <div class="album-links">
          ${future ? `<a class="btn sm" href="${gcalUrl(e)}" target="_blank" rel="noopener">＋ Google ${t("日曆")}</a><button class="btn ghost sm" data-ics="${e.id}">${t("下載 .ics")}</button>` : ""}
          ${safeUrl(e.link) ? `<a class="btn ghost sm" href="${esc(e.link)}" target="_blank" rel="noopener">${t("相關連結")} ↗</a>` : ""}
          ${rel2 ? `<button class="btn ghost sm" data-open="r.${rel2.id}">🎵 ${t("看作品")}</button>` : ""}
          ${e.fe ? `<button class="btn ghost sm" data-open="f.${e.fe}">💛 ${t("活動詳情")}</button>` : ""}
          ${e.issueUrl ? `<a class="btn ghost sm" href="${esc(e.issueUrl)}" target="_blank" rel="noopener">${t("投稿來源")} ↗</a>` : ""}
        </div>
        ${mapEmbed(e.place)}
        ${relatedNews(rel, t("同期新聞"))}` };
    },
    g(id) {
      const g = M.goods.find((x) => x.id === id);
      if (!g) return null;
      const s = GOODS_STATUS[g.status] || GOODS_STATUS.onsale;
      const left = g.preorderEnd ? daysFrom(todayStr(), g.preorderEnd) : null;
      const re = g.keywords ? new RegExp(g.keywords.map(reEsc).join("|"), "i") : keyRe(g.name.replace(/\d+(st|nd|rd|th)\s+Mini Album/i, ""));
      const rel = re ? newsMatching(re) : [];
      const r = g.release && M.releases.find((x) => x.date === g.release);
      return { title: g.name, html: `
        ${heroImg(g.img, g.name)}
        <span class="tag ${s.cls}">${t(s.label)}</span> <span class="tag">${esc(t(g.type || ""))}</span> ${autoBadge(g)}
        <h2 class="detail-title">${esc(g.name)}</h2>
        <div class="kv">
          ${g.release ? `<div><span>${t("發售")}</span><b>${fmtDate(g.release)}</b></div>` : ""}
          ${g.preorderEnd ? `<div><span>${t("預購截止")}</span><b>${fmtDate(g.preorderEnd)}${left !== null && left >= 0 ? ` · ${left === 0 ? t("今天截止！") : t("剩 {n} 天截止", { n: left })}` : ""}</b></div>` : ""}
        </div>
        ${g.note ? `<p class="detail-desc">${esc(g.note)}</p>` : ""}
        <h3 class="detail-h">${t("購買通路")}</h3>
        <div class="album-links">${(g.stores || []).filter((st) => safeUrl(st.url)).map((st) => `<a class="btn sm" href="${esc(st.url)}" target="_blank" rel="noopener">${esc(st.name)} ↗</a>`).join("")}${r ? `<button class="btn ghost sm" data-open="r.${r.id}">🎵 ${t("看收錄曲")}</button>` : ""}</div>
        ${relatedNews(rel)}` };
    },
    f(id) {
      const e = M.fanEvents.find((x) => x.id === id);
      if (!e) return null;
      return { title: e.title, html: `
        ${heroImg(e.image, e.title)}
        ${e.kind ? `<span class="tag pink">${esc(e.kind)}</span>` : ""} ${autoBadge(e)}
        <h2 class="detail-title">${esc(e.title)}</h2>
        <div class="kv">
          <div><span>📅 ${t("日期")}</span><b>${fmtDate(e.date)}${e.end ? " – " + fmtDate(e.end) : ""}</b></div>
          ${e.place ? `<div><span>📍 ${t("地點")}</span><b>${esc(e.place)}</b></div>` : ""}
          ${e.host ? `<div><span>🙋 ${t("主辦")}</span><b>${esc(e.host)}</b></div>` : ""}
        </div>
        ${e.note ? `<p class="detail-desc">${esc(e.note)}</p>` : ""}
        <div class="album-links">${safeUrl(e.link) ? `<a class="btn sm" href="${esc(e.link)}" target="_blank" rel="noopener">${t("活動公告")} ↗</a>` : ""}${e.issueUrl ? `<a class="btn ghost sm" href="${esc(e.issueUrl)}" target="_blank" rel="noopener">${t("投稿來源")} ↗</a>` : ""}</div>
        ${mapEmbed(e.place)}
        <p class="note">${t("應援活動由粉絲自行舉辦，與 YENA 及所屬公司無關，請以主辦公告為準。")}</p>` };
    },
    v(id) {
      const v = M.videos.find((x) => x.id === id) || { id, title: "YouTube", date: "", desc: "" };
      return { title: v.title, html: `
        <div class="video-wrap${v.short ? " short" : ""}"><iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.id)}?autoplay=1" title="YouTube" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>
        <h2 class="detail-title">${esc(v.title)}</h2>
        <p class="note">${fmtDate(v.date)}${v.views ? ` · 👀 ${v.views.toLocaleString()}` : ""}</p>
        ${v.desc ? `<p class="detail-desc pre">${esc(v.desc)}</p>` : ""}
        <a class="btn ghost sm" href="https://www.youtube.com/watch?v=${encodeURIComponent(v.id)}" target="_blank" rel="noopener">${t("在 YouTube 觀看")} ↗</a>` };
    },
  };

  let audio = null;
  function stopAudio() { if (audio) { audio.pause(); audio = null; } $$(".play-btn.on").forEach((b) => { b.classList.remove("on"); b.textContent = "▶"; }); }
  function openDetail(d, push = true) {
    const [type, ...rest] = d.split(".");
    if (type === "p") return lbOpen(rest[0], +rest[1] || 0);
    const fn = DETAIL[type];
    const r = fn && fn(rest.join("."));
    if (!r) return false;
    stopAudio();
    const box = $("#modal");
    box.innerHTML = `<div class="modal-box" role="document"><button class="icon-btn modal-close" data-modal-close aria-label="${t("關閉")}">✕</button><div class="modal-body">${r.html}${shareRow(d, r.title)}</div></div>`;
    box.classList.add("open");
    box.scrollTop = 0;
    document.body.style.overflow = "hidden";
    if (push) setDetail(d);
    startCountdowns();
    return true;
  }
  function closeModal() {
    stopAudio();
    const box = $("#modal");
    box.classList.remove("open");
    box.innerHTML = "";
    document.body.style.overflow = "";
    clearDetail();
  }

  /* =========================================================
     全站搜尋
     ========================================================= */
  function searchAll(qs) {
    const k = qs.trim().toLowerCase();
    if (!k) return [];
    const hit = (...s) => s.some((x) => x && String(x).toLowerCase().includes(k));
    const y = new Date().getFullYear();
    const g = [];
    const add = (title, items) => items.length && g.push({ title, items: items.slice(0, 6), more: items.length - 6 });
    add(t("頁面"), NAV.filter(([key, v]) => hit(t(v), key)).map(([key, v]) => ({ href: "#" + key, t: t(v), s: "" })));
    add(t("作品"), M.releases.filter((r) => hit(r.title, r.titleTrack, r.note, ...r.tracks.map((x) => x.name))).map((r) => ({ d: "r." + r.id, route: "music", t: r.title, s: `${fmtDate(r.date)} · ${t(TYPES[r.type] || "")}`, img: r.cover })));
    add(t("行程"), allEvents([y - 2, ...yearsAround(y)]).filter((e) => e.category !== "anniv" && hit(e.title, e.place, e.note)).reverse().map((e) => ({ d: "e." + e.id, route: "schedule", t: e.title, s: fmtDate(e.date) })));
    add(t("消息"), M.news.filter((n) => hit(n.title, n.desc, n.source)).map((n) => ({ d: "n." + n.id, route: "news", t: n.title, s: `${n.source} · ${fmtDate(n.date)}`, img: n.image })));
    add(t("周邊"), M.goods.filter((x) => hit(x.name, x.note, x.type)).map((x) => ({ d: "g." + x.id, route: "goods", t: x.name, s: t((GOODS_STATUS[x.status] || {}).label || ""), img: x.img })));
    add(t("相簿"), M.albums.filter((a) => hit(a.title, a.credit) || a.images.some((p) => hit(p.cap))).map((a) => { const i = Math.max(0, a.images.findIndex((p) => hit(p.cap))); return { d: `p.${a.id}.${i}`, route: "gallery", t: a.title, s: `${fmtDate(a.date)} · ${a.images.length}`, img: a.images[i].th }; }));
    add(t("影片"), M.videos.filter((v) => hit(v.title, v.desc)).map((v) => ({ d: "v." + v.id, route: "social", t: v.title, s: fmtDate(v.date), img: ytThumb(v) })));
    add(t("成績"), [...M.awards.filter((a) => hit(a.event, a.award, a.work)).map((a) => ({ href: "#records", t: `${a.event} — ${t(a.award)}`, s: a.date ? fmtDate(a.date) : a.year })), ...M.wins.filter((w) => hit(w.show, w.song)).map((w) => ({ href: "#records", t: `${w.show} 1st — ${w.song}`, s: fmtDate(w.date) }))]);
    add(t("應援活動"), M.fanEvents.filter((e) => hit(e.title, e.place, e.host)).map((e) => ({ d: "f." + e.id, route: "events", t: e.title, s: fmtDate(e.date) })));
    add(t("用語"), D.glossary.filter((x) => hit(x.term, x.desc)).map((x) => ({ href: "#fans", t: x.term, s: x.desc })));
    return g;
  }
  function openSearch() {
    const box = $("#modal");
    box.innerHTML = `<div class="modal-box search-box" role="search"><button class="icon-btn modal-close" data-modal-close aria-label="${t("關閉")}">✕</button>
      <input class="input search-input" type="search" placeholder="🔍 ${t("搜尋歌曲、行程、新聞、周邊、照片…")}" data-search autofocus>
      <div class="search-results" data-search-results><p class="note">${t("提示：按 / 或 Ctrl+K 隨時開啟搜尋")}</p></div></div>`;
    box.classList.add("open");
    document.body.style.overflow = "hidden";
    setTimeout(() => $("[data-search]").focus(), 30);
  }
  function renderSearch(v) {
    const groups = searchAll(v);
    $("[data-search-results]").innerHTML = !v.trim() ? "" : groups.length ? groups.map((g) => `<h4 class="sr-h">${g.title}</h4>${g.items.map((it) => `<a class="mini-item" href="${it.href || `#${it.route}?d=${it.d}`}" data-search-go>${it.img ? `<span class="mi-img" data-imgbox>${img(it.img)}</span>` : ""}<span><b>${esc(it.t)}</b><small>${esc(it.s || "")}</small></span></a>`).join("")}${g.more > 0 ? `<p class="note">${t("還有 {n} 筆", { n: g.more })}</p>` : ""}`).join("") : `<div class="empty">${t("找不到「{q}」相關內容", { q: esc(v) })}</div>`;
  }

  /* =========================================================
     路由與事件
     ========================================================= */
  const NAV = [["home", "首頁"], ["profile", "簡介"], ["music", "作品"], ["schedule", "行程"], ["gallery", "相簿"], ["news", "消息"], ["goods", "周邊"], ["records", "成績"], ["events", "應援活動"], ["social", "社群"], ["guide", "應援指南"], ["fans", "粉絲專區"]];
  const parseHash = () => {
    const [r, qs] = location.hash.slice(1).split("?");
    return { route: pages[r] ? r : "home", d: new URLSearchParams(qs || "").get("d") };
  };
  function render(keepScroll) {
    const { route, d } = parseHash();
    const changed = route !== curRoute;
    curRoute = route;
    evRegistry = [];
    app.innerHTML = pages[route]();
    document.title = route === "home" ? `${D.meta.siteName} | ${t("YENA 非官方粉絲站")}` : `${t(Object.fromEntries(NAV)[route])} | ${D.meta.siteName}`;
    $$(".nav a").forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + route));
    $("#nav").classList.remove("open");
    if (!keepScroll && (changed || !d)) window.scrollTo({ top: 0, behavior: "instant" });
    startCountdowns();
    if (route === "fans") updateFanDays();
    if (d && !$("#modal").classList.contains("open") && !$("#lb").classList.contains("open")) openDetail(d, false);
  }
  let evRegistry = [];

  let cdTimer;
  function startCountdowns() {
    clearInterval(cdTimer);
    const els = $$("[data-countdown]");
    if (!els.length) return;
    const tick = () => els.forEach((el) => {
      const diff = Math.max(0, new Date(el.dataset.countdown) - new Date());
      const u = { d: Math.floor(diff / DAY), h: Math.floor((diff % DAY) / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) };
      Object.entries(u).forEach(([k, v]) => { const b = el.querySelector(`[data-u="${k}"]`); if (b) b.textContent = k === "d" ? v : pad(v); });
    });
    tick();
    cdTimer = setInterval(tick, 1000);
  }
  function updateFanDays() {
    const inp = $("#fanSince"), out = $("[data-fan-days]");
    if (!inp || !out) return;
    if (!inp.value) { out.textContent = t("選擇日期後，看看你陪伴 YENA 多久了！"); return; }
    const n = daysFrom(inp.value, todayStr()) + 1;
    out.textContent = n > 0 ? t("💛 今天是你成為 지구미 的第 {n} 天！", { n: n.toLocaleString() }) : t("日期不能是未來喔 🐥");
  }

  // 事件委派
  document.addEventListener("click", async (ev) => {
    if (ev.target.id === "lb") return lbClose();
    if (ev.target.id === "modal") return closeModal();
    if (ev.target.closest("a[href]:not([data-search-go])")) return;
    const go = ev.target.closest("[data-search-go]");
    if (go) { closeModal(); return; }
    const el = ev.target.closest("button, [data-day], [data-lbi], [data-photo], [data-open]");
    if (!el) return;
    const ds = el.dataset;

    if (ds.modalClose !== undefined) return closeModal();
    if (ds.open) { if ($("#lb").classList.contains("open")) lbClose(); return openDetail(ds.open); }
    if (ds.album !== undefined) return lbOpen(ds.album, 0);
    if (ds.photo !== undefined) { const [a, i] = ds.photo.split(","); return lbOpen(a, +i); }
    if (ds.lb) return lbMove(+ds.lb);
    if (ds.lbi !== undefined) { lb.i = +ds.lbi; return lbShow(); }
    if (ds.lbClose !== undefined) return lbClose();
    if (ds.dlOne !== undefined) return downloadOne();
    if (ds.dlAll !== undefined) return downloadAlbum();
    if (ds.sharePhoto !== undefined) { const u = detailHref(`p.${lb.al.id}.${lb.i}`); if (navigator.share) { try { await navigator.share({ title: lb.al.title, url: u }); } catch (e) {} } else copyText(u); return; }
    if (ds.copy) return copyText(ds.copy);
    if (ds.nativeShare) { try { await navigator.share({ title: ds.title, url: ds.nativeShare }); } catch (e) {} return; }
    if (ds.preview) {
      const was = el.classList.contains("on");
      stopAudio();
      if (!was) { audio = new Audio(ds.preview); audio.play().catch(() => toast(t("無法播放試聽"))); audio.onended = stopAudio; el.classList.add("on"); el.textContent = "❚❚"; }
      return;
    }
    if (ds.gcat) { galleryState.cat = ds.gcat; return render(true); }
    if (ds.ics) { const e = findEvent(ds.ics); if (e) downloadIcs([e], `yena-${e.date}.ics`); return; }
    if (ds.icsAll !== undefined) { const now = new Date(); downloadIcs(allEvents(yearsAround(now.getFullYear())).filter((e) => eventRange(e).end > now), "yena-schedule.ics"); return; }
    if (ds.mtype) { musicState.type = ds.mtype; return render(true); }
    if (ds.morder !== undefined) { musicState.order = musicState.order === "new" ? "old" : "new"; return render(true); }
    if (ds.cat) { schedState.cat = ds.cat; return render(true); }
    if (ds.mon) {
      let m = schedState.m + +ds.mon, y = schedState.y;
      if (m < 1) { m = 12; y--; } if (m > 12) { m = 1; y++; }
      Object.assign(schedState, { y, m, sel: null, view: "month" });
      return render(true);
    }
    if (ds.day) {
      schedState.sel = schedState.sel === ds.day ? null : ds.day;
      const [y, m] = ds.day.split("-").map(Number);
      if (m !== schedState.m) Object.assign(schedState, { y, m });
      return render(true);
    }
    if (ds.today !== undefined) { const td = todayStr(); Object.assign(schedState, { y: +td.slice(0, 4), m: +td.slice(5, 7), sel: null, view: "upcoming" }); return render(true); }
    if (ds.view) { schedState.view = ds.view; schedState.sel = null; return render(true); }
    if (ds.nlang) { newsState.lang = ds.nlang; newsState.n = 30; return render(true); }
    if (ds.newsMore !== undefined) { newsState.n += 30; $("[data-newslist]").innerHTML = newsListHtml(); return; }
    if (ds.gst) { goodsState.st = ds.gst; return render(true); }
    if (ds.rres) { recState.res = ds.rres; return render(true); }
    if (ds.opt !== undefined && !quizState.answered) {
      const item = D.quiz[quizState.i];
      const pick = +ds.opt;
      quizState.answered = true;
      if (pick === item.answer) quizState.score++;
      $$(".quiz-opt").forEach((b, i) => { b.disabled = true; if (i === item.answer) b.classList.add("right"); else if (i === pick) b.classList.add("wrong"); });
      $("[data-quiz-explain]").textContent = (pick === item.answer ? "⭕ " : "❌ ") + item.explain;
      $("[data-quiz-next]").style.display = "";
      return;
    }
    if (ds.quizNext !== undefined) { quizState.answered = false; quizState.i++; if (quizState.i >= D.quiz.length) quizState.done = true; $("[data-quiz]").innerHTML = quizHtml(); return; }
    if (ds.quizRestart !== undefined) { Object.assign(quizState, { i: 0, score: 0, answered: false, done: false }); $("[data-quiz]").innerHTML = quizHtml(); }
  });
  async function copyText(s) {
    try { await navigator.clipboard.writeText(s); toast(t("已複製連結 💖")); }
    catch { prompt(t("複製這個連結："), s); }
  }

  document.addEventListener("input", (ev) => {
    if (ev.target.matches("[data-newskw]")) { newsState.kw = ev.target.value; newsState.n = 30; $("[data-newslist]").innerHTML = newsListHtml(); }
    if (ev.target.matches("[data-search]")) renderSearch(ev.target.value);
    if (ev.target.id === "fanSince") { try { localStorage.setItem("yena-fan-since", ev.target.value); } catch (e) {} updateFanDays(); }
  });

  /* ---------------- 外框 ---------------- */
  function renderShell() {
    document.documentElement.lang = { zh: "zh-Hant-TW", en: "en", ko: "ko" }[LANG];
    $("#nav").innerHTML = NAV.map(([k, v]) => `<a href="#${k}">${t(v)}</a>`).join("");
    const latest = Object.keys(NEWS_LANGS).flatMap((l) => ((A.news && A.news[l]) || []).slice(0, 2).map((n) => ({ ...n, lang: l }))).filter((n) => n.lang === LANG || (LANG === "zh" && n.lang === "zh")).slice(0, 2);
    const items = [...latest.map((n) => `📰 ${n.title}`), ...D.ticker].map((x) => `<span>${esc(x)}</span>`).join("");
    $("#ticker").innerHTML = `<div class="ticker-track">${items}${items}</div>`;
    $("#langSel").value = LANG;
    $("#searchBtn").setAttribute("aria-label", t("搜尋"));
    $("#footer").innerHTML = `<div class="container footer-inner">
      <div>
        <h5>🐥 YENA FANS</h5>
        <p style="margin:0 0 8px">${esc(t(D.meta.disclaimer))}</p>
        <p style="margin:0 0 8px">${t("人工資料更新：{a}　·　自動資料更新：{b}", { a: fmtDate(D.meta.updated), b: A.updatedAt ? `${fmtDate(A.updatedAt)} (${ago(A.updatedAt)})` : "—" })}</p>
        <p style="margin:0 0 12px">${t("照片與新聞版權屬原著作權人，本站以連結方式引用並標註來源；小鴨插圖為原創。")}</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn ghost sm" data-install hidden>📲 ${t("加到主畫面")}</button>
          <a class="btn ghost sm" href="https://github.com/${D.meta.repo}/issues/new/choose" target="_blank" rel="noopener">✍️ ${t("投稿 / 回報錯誤")}</a>
        </div>
      </div>
      <div>
        <h5>${t("資料來源")}</h5>
        <ul>${[...D.sources, { name: "Bing News RSS", url: "https://www.bing.com/news" }, { name: "iTunes / Apple Music", url: "https://music.apple.com/kr/artist/1605086668" }, { name: "YouTube @YENA_OFFICIAL", url: "https://www.youtube.com/@YENA_OFFICIAL" }, { name: "Wikimedia Commons", url: "https://commons.wikimedia.org/wiki/Category:Choi_Ye-na" }].filter((s, i, a) => a.findIndex((x) => x.name === s.name) === i).map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)} ↗</a></li>`).join("")}</ul>
      </div>
    </div>`;
    if (installEvt) $("[data-install]").hidden = false;
  }

  let installEvt = null;
  addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); installEvt = e; const b = $("[data-install]"); if (b) b.hidden = false; });
  document.addEventListener("click", async (e) => {
    if (!e.target.closest("[data-install]") || !installEvt) return;
    installEvt.prompt();
    await installEvt.userChoice.catch(() => {});
    installEvt = null;
    $("[data-install]").hidden = true;
  });

  function initShell() {
    $("#menuBtn").addEventListener("click", () => $("#nav").classList.toggle("open"));
    $("#searchBtn").addEventListener("click", openSearch);
    $("#langSel").addEventListener("change", (e) => {
      LANG = e.target.value;
      try { localStorage.setItem("yena-lang", LANG); } catch (err) {}
      mergeAll();
      renderShell();
      render(true);
    });
    const root = document.documentElement;
    let theme = null;
    try { theme = localStorage.getItem("yena-theme"); } catch (e) {}
    if (!theme) theme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const applyTheme = (th) => { root.dataset.theme = th; $("#themeBtn").textContent = th === "dark" ? "☀️" : "🌙"; };
    applyTheme(theme);
    $("#themeBtn").addEventListener("click", () => {
      theme = root.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(theme);
      try { localStorage.setItem("yena-theme", theme); } catch (e) {}
    });
    const top = $("#toTop");
    addEventListener("scroll", () => top.classList.toggle("show", scrollY > 600), { passive: true });
    top.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* ---------------- 啟動 ---------------- */
  async function loadAuto() {
    try {
      const r = await fetch(`data/auto.json?t=${Math.floor(Date.now() / 600000)}`, { cache: "no-cache" });
      if (r.ok) return await r.json();
    } catch (e) {}
    return {};
  }
  initShell();
  mergeAll();
  renderShell();
  addEventListener("hashchange", () => {
    const { d } = parseHash();
    if ($("#modal").classList.contains("open")) { stopAudio(); $("#modal").classList.remove("open"); $("#modal").innerHTML = ""; document.body.style.overflow = ""; }
    if ($("#lb").classList.contains("open")) { $("#lb").classList.remove("open"); document.body.style.overflow = ""; }
    render(!!d && parseHash().route === curRoute);
  });
  const autoP = loadAuto();
  Promise.race([autoP, new Promise((r) => setTimeout(() => r(null), 2500))]).then((first) => {
    if (first) { A = first; mergeAll(); renderShell(); }
    render(false);
    if (!first) autoP.then((a) => { if (a && a.updatedAt) { A = a; mergeAll(); renderShell(); if (!$("#modal").classList.contains("open") && !$("#lb").classList.contains("open")) render(true); } });
  });

  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
})();
