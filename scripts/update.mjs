#!/usr/bin/env node
/* =========================================================
   YENA FANS 自動更新腳本
   由 GitHub Actions 定時執行（也可在本機 `node scripts/update.mjs`）
   產出 data/auto.json，網站載入時會和 js/data.js 的人工資料合併。

   來源（皆為公開、免金鑰的 RSS / API）：
   - 新聞：Bing News RSS（韓 / 英 / 中），並讀取原文的 og:image、og:description
   - 作品：iTunes Search API（封面、曲目、試聽）
   - 影片：YouTube 官方頻道 RSS、訂閱數
   - 獎項 / 音樂節目一位：英文維基百科 API
   - CC 授權照片：Wikimedia Commons
   - 粉絲投稿：GitHub Issues（標上 approved 標籤的投稿）
   每個來源各自獨立，失敗時保留上一次的資料。
   ========================================================= */
import fs from "node:fs/promises";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "data", "auto.json");
const REPO = process.env.GITHUB_REPOSITORY || "mintguesss/yena-fansite";
const UA = `Mozilla/5.0 (compatible; YenaFansBot/1.0; +https://github.com/${REPO})`;

const ITUNES_ARTIST = "1605086668";
const YT_CHANNEL = "UCkrDEGNM3mqZXHk2MfnOjMw";
const WIKI_PAGE = "Choi_Ye-na";
const COMMONS_CAT = "Category:Choi_Ye-na";
const NEWS_FEEDS = {
  ko: { q: "최예나", mkt: "ko-KR", match: /최예나|예나|YENA/i },
  en: { q: ["Choi Yena", "YENA kpop", "Yena IZ*ONE"], mkt: "en-US", match: /yena|ye-na/i },
  zh: { q: "崔叡娜", mkt: "zh-TW", match: /崔叡娜|叡娜|YENA/i },
};
const MUSIC_SHOWS = ["The Show", "Show Champion", "M Countdown", "Music Bank", "Show! Music Core", "Inkigayo"];
const FIRST_WIN_YEAR = 2022;
const KEEP_NEWS = 120;
const OG_FETCH_LIMIT = 40;

const log = (...a) => console.log("[update]", ...a);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------------- 基本工具 ---------------- */
async function get(url, { type = "text", timeout = 20000, headers = {}, raw = false } = {}) {
  const res = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "en,ko;q=0.8,zh-TW;q=0.6", ...headers }, signal: AbortSignal.timeout(timeout), redirect: "follow" });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  if (raw) return res;
  return type === "json" ? res.json() : res.text();
}

const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", "#39": "'" };
const decode = (s = "") => s
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
  .replace(/&([a-z#0-9]+);/gi, (m, k) => ENT[k.toLowerCase()] ?? m);
const strip = (s = "") => decode(s.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const tag = (xml, name) => { const m = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i")); return m ? decode(m[1]).trim() : ""; };
const attr = (xml, name, a) => { const m = xml.match(new RegExp(`<${name}\\s[^>]*${a}="([^"]*)"`, "i")); return m ? decode(m[1]) : ""; };
const isoDate = (d) => { const t = new Date(d); return isNaN(t) ? "" : t.toISOString(); };
const https = (u) => (u || "").replace(/^http:\/\//i, "https://");
// 去掉 [N초점]、【獨家】、" - 媒體名" 等裝飾後再比對，避免同一則新聞重複
const normTitle = (s) => s.toLowerCase().replace(/\[[^\]]*\]|【[^】]*】|\s[-|]\s[^-|]{1,30}$/g, "").replace(/[\s\p{P}\p{S}]+/gu, "");

async function readJson(file, fallback) {
  try { return JSON.parse(await fs.readFile(file, "utf8")); } catch { return fallback; }
}

/* 讀人工資料 js/data.js（在沙盒裡執行，只取資料） */
async function loadManual() {
  const code = await fs.readFile(path.join(ROOT, "js", "data.js"), "utf8");
  const ctx = { window: {} };
  vm.runInNewContext(code, ctx, { timeout: 2000 });
  return ctx.window.YENA_DATA;
}

/* 讀網頁的 og 標籤（自動判斷 EUC-KR 等編碼） */
async function fetchOg(url) {
  const res = await get(url, { raw: true, timeout: 12000, headers: { Accept: "text/html" } });
  const buf = Buffer.from(await res.arrayBuffer()).subarray(0, 600000);
  let cs = (res.headers.get("content-type") || "").match(/charset=([\w-]+)/i)?.[1];
  if (!cs) cs = buf.toString("latin1").match(/<meta[^>]+charset=["']?([\w-]+)/i)?.[1];
  let html;
  try { html = new TextDecoder((cs || "utf-8").toLowerCase()).decode(buf); } catch { html = buf.toString("utf8"); }
  const meta = (k) => {
    const re1 = new RegExp(`<meta[^>]+(?:property|name)=["']${k}["'][^>]*content=["']([^"']*)["']`, "i");
    const re2 = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${k}["']`, "i");
    return decode((html.match(re1) || html.match(re2) || [])[1] || "").trim();
  };
  let image = meta("og:image") || meta("twitter:image") || meta("twitter:image:src");
  if (image) { try { image = https(new URL(image, res.url).href); } catch { image = ""; } }
  return {
    image,
    desc: (meta("og:description") || meta("description")).slice(0, 400),
    title: meta("og:title"),
    site: meta("og:site_name"),
  };
}

/* 併發限制 */
async function pool(items, n, fn) {
  const out = [];
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < items.length) { const k = i++; out[k] = await fn(items[k], k); }
  }));
  return out;
}

/* ---------------- 維基表格解析 ---------------- */
function protectPipes(s) {
  let out = "", sq = 0, cu = 0;
  for (let i = 0; i < s.length; i++) {
    const two = s.slice(i, i + 2);
    if (two === "[[") { sq++; out += two; i++; continue; }
    if (two === "]]" && sq) { sq--; out += two; i++; continue; }
    if (two === "{{") { cu++; out += two; i++; continue; }
    if (two === "}}" && cu) { cu--; out += two; i++; continue; }
    out += s[i] === "|" && (sq || cu) ? "\u0001" : s[i];
  }
  return out;
}
const RESULT_TPL = { won: "Won", nom: "Nominated", longlisted: "Longlisted", pending: "Pending", shortlisted: "Shortlisted", yes: "Won", "n/a": "" };
function cleanWiki(s) {
  let t = s.replace(/\u0001/g, "|");
  for (let k = 0; k < 4; k++) {
    t = t.replace(/\{\{([^{}]*)\}\}/g, (_, inner) => {
      const parts = inner.split("|").map((x) => x.trim());
      const name = parts[0].toLowerCase();
      if (RESULT_TPL[name] !== undefined) return RESULT_TPL[name];
      if (name === "dts" || name === "date table sorting") return parts.slice(1).filter((p) => !p.includes("=")).join(" ");
      if (["sort", "sortname", "hs"].includes(name)) return parts[parts.length - 1];
      if (["nowrap", "nobr", "small", "lang", "korean", "transl", "nihongo", "abbr", "efn", "flagicon"].includes(name)) {
        if (name === "efn" || name === "flagicon") return "";
        const vals = parts.slice(1).filter((p) => !p.includes("="));
        return name === "lang" || name === "transl" ? vals[1] || vals[0] || "" : vals[0] || "";
      }
      return "";
    });
  }
  return t
    .replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, "$1")
    .replace(/\[https?:\/\/\S+\s+([^\]]+)\]/g, "$1")
    .replace(/'{2,}/g, "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
function parseTables(wikitext) {
  const text = protectPipes(wikitext
    .replace(/<ref[^>]*\/>/gi, "")
    .replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, ""));
  const tables = [];
  const re = /\{\|[\s\S]*?\n\|\}/g;
  let m;
  while ((m = re.exec(text))) {
    const lines = m[0].split("\n").slice(1, -1);
    const rows = [];
    let cur = null;
    const pushCells = (line, header) => {
      const body = line.slice(1);
      const cells = body.split(header ? /!!|\|\|/ : /\|\|/);
      for (const c of cells) {
        let attrs = "", content = c;
        const p = c.indexOf("|");
        if (p >= 0 && /=|^\s*$/.test(c.slice(0, p)) && !/\[\[/.test(c.slice(0, p))) { attrs = c.slice(0, p); content = c.slice(p + 1); }
        cur.push({
          header,
          rs: +(attrs.match(/rowspan\s*=\s*"?(\d+)/i)?.[1] || 1),
          cs: +(attrs.match(/colspan\s*=\s*"?(\d+)/i)?.[1] || 1),
          raw: content,
        });
      }
    };
    for (const line of lines) {
      if (line.startsWith("|-")) { if (cur && cur.length) rows.push(cur); cur = []; continue; }
      if (line.startsWith("|+")) continue;
      if (!cur) cur = [];
      if (line.startsWith("!")) pushCells(line, true);
      else if (line.startsWith("|")) pushCells(line, false);
      else if (cur.length) cur[cur.length - 1].raw += "\n" + line;
    }
    if (cur && cur.length) rows.push(cur);
    // 展開 rowspan / colspan
    const grid = [];
    const carry = [];
    for (const r of rows) {
      const out = [];
      let col = 0;
      const next = () => { while (carry[col] && carry[col].left > 0) { out[col] = carry[col].cell; carry[col].left--; col++; } };
      next();
      for (const c of r) {
        next();
        const cell = { header: c.header, text: cleanWiki(c.raw) };
        for (let k = 0; k < c.cs; k++) {
          out[col] = cell;
          if (c.rs > 1) carry[col] = { cell, left: c.rs - 1 };
          col++;
        }
      }
      next();
      grid.push(out);
    }
    tables.push(grid);
  }
  return tables;
}

async function wikiText(title, section) {
  const u = `https://en.wikipedia.org/w/api.php?action=parse&format=json&formatversion=2&prop=wikitext&redirects=1&page=${encodeURIComponent(title)}${section !== undefined ? `&section=${section}` : ""}`;
  const j = await get(u, { type: "json", headers: { "Api-User-Agent": UA } });
  if (j.error) { const e = new Error(j.error.info); e.code = j.error.code; throw e; }
  return j.parse.wikitext;
}

/* ---------------- 各來源 ---------------- */
async function newsFor(lang, prev) {
  const f = NEWS_FEEDS[lang];
  let xml = "";
  for (const q of [].concat(f.q)) xml += await get(`https://www.bing.com/news/search?format=rss&q=${encodeURIComponent(q)}&setlang=${f.mkt}&mkt=${f.mkt}`);
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, it]) => {
    let link = tag(it, "link");
    try { const u = new URL(link); if (u.searchParams.get("url")) link = u.searchParams.get("url"); } catch {}
    return {
      title: strip(tag(it, "title")),
      url: link,
      desc: strip(tag(it, "description")).slice(0, 400),
      date: isoDate(tag(it, "pubDate")),
      source: strip(tag(it, "News:Source")),
      thumb: https(tag(it, "News:Image")),
      lang,
    };
  }).filter((n) => n.url && n.title && f.match.test(n.title + " " + n.desc));
  const byUrl = new Map((prev || []).map((n) => [n.url, n]));
  const seenTitle = new Set((prev || []).map((n) => normTitle(n.title)));
  for (const n of items) {
    if (byUrl.has(n.url)) { Object.assign(byUrl.get(n.url), { ...n, image: byUrl.get(n.url).image, desc: byUrl.get(n.url).desc || n.desc }); continue; }
    if (seenTitle.has(normTitle(n.title))) continue;
    seenTitle.add(normTitle(n.title));
    byUrl.set(n.url, n);
  }
  // 同標題只留一則（優先保留有圖、非 MSN 轉載的）
  const best = new Map();
  for (const n of byUrl.values()) {
    const k = normTitle(n.title);
    const o = best.get(k);
    const score = (x) => (x.image ? 2 : 0) + (/msn\.com/.test(x.url) ? 0 : 1);
    if (!o || score(n) > score(o)) best.set(k, n);
  }
  return [...best.values()].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, KEEP_NEWS);
}

async function itunes(prev) {
  const j = await get(`https://itunes.apple.com/lookup?id=${ITUNES_ARTIST}&entity=album&country=kr&limit=200`, { type: "json" });
  const albums = j.results.filter((r) => r.wrapperType === "collection");
  const prevById = new Map((prev || []).map((a) => [a.id, a]));
  const recent = Date.now() - 90 * 86400000;
  const toTrack = (r) => ({ n: r.trackNumber, d: r.discNumber || 1, name: r.trackName, ms: r.trackTimeMillis || 0, preview: r.previewUrl || "", artist: r.artistName });
  const sortTracks = (l) => l.sort((x, y) => x.d - y.d || x.n - y.n);
  // 韓國商店不能逐張查曲目，先用歌手的全部歌曲（韓文曲名）分組
  const byAlbum = new Map();
  try {
    const s = await get(`https://itunes.apple.com/lookup?id=${ITUNES_ARTIST}&entity=song&country=kr&limit=200`, { type: "json" });
    for (const r of s.results.filter((r) => r.wrapperType === "track")) {
      if (!byAlbum.has(r.collectionId)) byAlbum.set(r.collectionId, []);
      byAlbum.get(r.collectionId).push(toTrack(r));
    }
  } catch (e) { log("itunes songs", e.message); }
  const out = await pool(albums, 3, async (a) => {
    const old = prevById.get(a.collectionId);
    let tracks = byAlbum.get(a.collectionId) || [];
    if (tracks.length < a.trackCount) {
      if (old?.tracks?.length >= a.trackCount && new Date(a.releaseDate) < recent) tracks = old.tracks;
      else {
        try {
          const t = await get(`https://itunes.apple.com/lookup?id=${a.collectionId}&entity=song&country=us`, { type: "json" });
          const more = t.results.filter((r) => r.wrapperType === "track").map(toTrack);
          const have = new Set(tracks.map((x) => `${x.d}-${x.n}`));
          tracks = tracks.concat(more.filter((x) => !have.has(`${x.d}-${x.n}`)));
        } catch (e) { log("itunes tracks", a.collectionId, e.message); if (old?.tracks?.length > tracks.length) tracks = old.tracks; }
      }
    }
    tracks = sortTracks(tracks);
    const name = a.collectionName;
    return {
      id: a.collectionId,
      title: name.replace(/\s+-\s+(Single|EP)$/i, ""),
      kind: /-\s+EP$/i.test(name) ? "EP" : /-\s+Single$/i.test(name) ? "Single" : "Album",
      date: a.releaseDate.slice(0, 10),
      cover: (a.artworkUrl100 || "").replace(/\/\d+x\d+bb\./, "/600x600bb."),
      trackCount: a.trackCount,
      genre: a.primaryGenreName,
      copyright: a.copyright || "",
      url: a.collectionViewUrl,
      tracks,
    };
  });
  return out.sort((a, b) => (a.date < b.date ? 1 : -1));
}

async function youtube(prev) {
  const xml = await get(`https://www.youtube.com/feeds/videos.xml?channel_id=${YT_CHANNEL}`);
  const items = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(([, e]) => {
    const id = tag(e, "yt:videoId");
    const href = attr(e, "link", "href");
    return {
      id,
      title: strip(tag(e, "title")),
      date: isoDate(tag(e, "published")),
      desc: strip(tag(e, "media:description")).slice(0, 600),
      views: +attr(e, "media:statistics", "views") || 0,
      short: /\/shorts\//.test(href),
    };
  }).filter((v) => v.id);
  const map = new Map((prev?.videos || []).map((v) => [v.id, v]));
  for (const v of items) map.set(v.id, { ...map.get(v.id), ...v });
  const videos = [...map.values()].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 200);
  let subscribers = prev?.subscribers || "";
  try {
    const html = await get(`https://www.youtube.com/channel/${YT_CHANNEL}`, { headers: { "Accept-Language": "en-US,en;q=0.9" } });
    subscribers = html.match(/"(\d[\d.,]*\s?[KMB]?) subscribers"/)?.[1] || subscribers;
  } catch (e) { log("yt subscribers", e.message); }
  return { subscribers, videos };
}

async function wikiAwards() {
  const text = await wikiText(WIKI_PAGE);
  const sec = text.split(/\n==\s*Awards and nominations\s*==/i)[1]?.split(/\n==[^=]/)[0];
  if (!sec) throw new Error("找不到 Awards and nominations 段落");
  const out = [];
  for (const grid of parseTables(sec)) {
    const head = grid[0]?.map((c) => c?.text.toLowerCase() || "") || [];
    const ix = (re) => head.findIndex((h) => re.test(h));
    const ci = { ceremony: ix(/award|ceremony/), year: ix(/year/), cat: ix(/category/), work: ix(/nominee|work/), result: ix(/result/) };
    if (ci.ceremony < 0 || ci.result < 0) continue;
    for (const r of grid.slice(1)) {
      const g = (k) => (ci[k] >= 0 ? r[ci[k]]?.text || "" : "");
      if (!g("ceremony")) continue;
      out.push({ ceremony: g("ceremony"), year: g("year").match(/\d{4}/)?.[0] || "", category: g("cat"), work: g("work").replace(/^"|"$/g, ""), result: g("result") });
    }
  }
  return out;
}

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
function parseWinDate(s, year) {
  const t = s.toLowerCase();
  let m = t.match(/(\d{4})\s+(\d{1,2})\s+(\d{1,2})/);
  if (m) return `${m[1]}-${String(m[2]).padStart(2, "0")}-${String(m[3]).padStart(2, "0")}`;
  m = t.match(/([a-z]+)\.?\s+(\d{1,2})/);
  if (m) { const mi = MONTHS.findIndex((x) => x.startsWith(m[1].slice(0, 3))); if (mi >= 0) return `${year}-${String(mi + 1).padStart(2, "0")}-${String(m[2]).padStart(2, "0")}`; }
  m = t.match(/(\d{1,2})\s+([a-z]+)/);
  if (m) { const mi = MONTHS.findIndex((x) => x.startsWith(m[2].slice(0, 3))); if (mi >= 0) return `${year}-${String(mi + 1).padStart(2, "0")}-${String(m[1]).padStart(2, "0")}`; }
  return "";
}
async function musicShowWins(prevCache) {
  const cache = { ...(prevCache || {}) };
  const thisYear = new Date().getUTCFullYear();
  let blocked = false;
  for (const show of MUSIC_SHOWS) {
    for (let y = FIRST_WIN_YEAR; y <= thisYear; y++) {
      const page = `List of ${show} Chart winners (${y})`;
      if (blocked || (cache[page] && y < thisYear)) continue;
      try {
        const text = await wikiText(page);
        const wins = [];
        for (const grid of parseTables(text)) {
          const head = (grid.find((r) => r.every((c) => c?.header)) || grid[0] || []).map((c) => c?.text.toLowerCase() || "");
          const ix = (re) => head.findIndex((h) => re.test(h));
          const di = ix(/date/), ai = ix(/artist/), si = ix(/song|title/), ei = ix(/episode|^no/);
          if (di < 0 || ai < 0) continue;
          for (const r of grid) {
            const artist = r[ai]?.text || "";
            if (r[ai]?.header && !/ye-?na/i.test(artist)) continue;
            if (!/\bye-?na\b|최예나/i.test(artist)) continue;
            const date = parseWinDate(r[di]?.text || "", y);
            if (!date) continue;
            wins.push({ show, date, song: (r[si]?.text || "").replace(/^"|"$/g, ""), episode: ei >= 0 ? r[ei]?.text || "" : "" });
          }
        }
        cache[page] = wins;
      } catch (e) {
        if (e.code === "missingtitle") cache[page] = [];
        else { log("wins", page, e.message); if (/429|too many/i.test(e.message)) blocked = true; }
      }
      await sleep(1200);
    }
  }
  const all = Object.values(cache).flat();
  const seen = new Set();
  const wins = all.filter((w) => { const k = w.show + w.date; if (seen.has(k)) return false; seen.add(k); return true; }).sort((a, b) => (a.date < b.date ? 1 : -1));
  return { wins, cache };
}

async function commons() {
  const u = `https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2&generator=categorymembers&gcmtitle=${encodeURIComponent(COMMONS_CAT)}&gcmtype=file&gcmlimit=100&prop=imageinfo&iiprop=url|extmetadata|timestamp&iiurlwidth=900`;
  const j = await get(u, { type: "json", headers: { "Api-User-Agent": UA } });
  return (j.query?.pages || []).map((p) => {
    const ii = p.imageinfo?.[0] || {};
    const md = ii.extmetadata || {};
    return {
      u: ii.thumburl || ii.url,
      full: ii.url,
      page: ii.descriptionurl,
      title: p.title.replace(/^File:/, "").replace(/\.\w+$/, ""),
      date: (md.DateTimeOriginal?.value || ii.timestamp || "").replace(/<[^>]+>/g, "").slice(0, 10),
      artist: strip(md.Artist?.value || ""),
      license: strip(md.LicenseShortName?.value || ""),
    };
  }).filter((p) => p.u);
}

/* GitHub Issue Forms：### 欄位名稱\n\n內容 */
function parseIssueForm(body = "") {
  const out = {};
  for (const part of body.split(/^###\s+/m).slice(1)) {
    const [head, ...rest] = part.split("\n");
    const v = rest.join("\n").trim();
    out[head.trim()] = v === "_No response_" ? "" : v;
  }
  return out;
}
async function community() {
  const headers = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const issues = await get(`https://api.github.com/repos/${REPO}/issues?labels=approved&state=all&per_page=100`, { type: "json", headers });
  const out = { schedule: [], events: [], goods: [] };
  for (const is of issues) {
    if (is.pull_request) continue;
    const labels = is.labels.map((l) => l.name);
    const f = parseIssueForm(is.body);
    const base = { issue: is.number, issueUrl: is.html_url, by: is.user?.login || "" };
    const pick = (...keys) => { for (const k of keys) { const hit = Object.keys(f).find((h) => h.includes(k)); if (hit && f[hit]) return f[hit]; } return ""; };
    const date = (pick("日期", "Date").match(/\d{4}-\d{2}-\d{2}/) || [""])[0];
    if (labels.includes("schedule") && date) {
      out.schedule.push({ ...base, date, time: (pick("時間", "Time").match(/\d{1,2}:\d{2}/) || [""])[0], title: pick("標題", "Title") || is.title, category: (pick("分類", "Category").match(/\b(release|show|award|variety|concert|goods|live|etc)\b/) || ["", "etc"])[1], place: pick("地點", "Place"), note: pick("說明", "Note"), link: pick("連結", "Link") });
    } else if (labels.includes("fan-event") && date) {
      out.events.push({ ...base, date, end: (pick("結束", "End").match(/\d{4}-\d{2}-\d{2}/) || [""])[0], title: pick("活動名稱", "Title") || is.title, kind: pick("類型", "Type"), place: pick("地點", "Place"), host: pick("主辦", "Host"), note: pick("說明", "Note"), link: pick("連結", "Link"), image: pick("圖片", "Image").match(/https?:\/\/\S+?\.(?:jpe?g|png|webp|gif)/i)?.[0] || "" });
    } else if (labels.includes("goods")) {
      out.goods.push({ ...base, name: pick("品名", "Name") || is.title, type: pick("類型", "Type"), status: (pick("狀態", "Status").match(/\b(preorder|onsale|upcoming|soldout|ended)\b/) || ["", "onsale"])[1], release: date, preorderEnd: (pick("截止", "Deadline").match(/\d{4}-\d{2}-\d{2}/) || [""])[0], note: pick("說明", "Note"), stores: (pick("購買連結", "Store").match(/https?:\/\/\S+/g) || []).map((u) => ({ name: new URL(u).hostname.replace(/^www\./, ""), url: u })), image: pick("圖片", "Image").match(/https?:\/\/\S+?\.(?:jpe?g|png|webp|gif)/i)?.[0] || "" });
    }
  }
  return out;
}

/* ---------------- 主流程 ---------------- */
async function main() {
  const prev = await readJson(OUT, {});
  const manual = await loadManual();
  const data = { ...prev, errors: [] };
  const run = async (name, fn) => {
    const t = Date.now();
    try { await fn(); log(`✓ ${name} (${Date.now() - t}ms)`); }
    catch (e) { data.errors.push(`${name}: ${e.message}`); log(`✗ ${name}: ${e.message}`); }
  };

  data.news = { ...(prev.news || {}) };
  await Promise.all(Object.keys(NEWS_FEEDS).map((lang) => run(`news.${lang}`, async () => { data.news[lang] = await newsFor(lang, prev.news?.[lang]); })));
  await run("itunes", async () => { data.releases = await itunes(prev.releases); });
  await run("youtube", async () => { data.youtube = await youtube(prev.youtube); });
  await run("wiki.awards", async () => { data.awards = await wikiAwards(); });
  await run("wiki.wins", async () => { const r = await musicShowWins(prev.winsCache); data.wins = r.wins; data.winsCache = r.cache; });
  await run("commons", async () => { data.commons = await commons(); });
  await run("community", async () => { data.community = await community(); });

  // og:image / 摘要：新聞（新的優先）＋人工資料裡的連結
  const og = { ...(prev.og || {}) };
  const want = [];
  for (const lang of Object.keys(data.news || {})) for (const n of data.news[lang] || []) if (!og[n.url]) want.push(n.url);
  for (const n of manual.news || []) if (n.url && !og[n.url]) want.push(n.url);
  for (const e of manual.schedule || []) if (e.link && !og[e.link]) want.push(e.link);
  for (const f of manual.feed || []) if (f.url && !og[f.url] && !/youtube\.com/.test(f.url)) want.push(f.url);
  await run("og", async () => {
    const list = [...new Set(want)].slice(0, OG_FETCH_LIMIT);
    await pool(list, 6, async (u) => {
      try { og[u] = { ...(await fetchOg(u)), at: new Date().toISOString().slice(0, 10) }; }
      catch (e) { og[u] = { image: "", desc: "", failed: true, at: new Date().toISOString().slice(0, 10) }; }
    });
    log(`og fetched ${list.length}, pending ${Math.max(0, new Set(want).size - list.length)}`);
  });
  // 清掉 30 天前失敗的，下次重試
  for (const [u, v] of Object.entries(og)) if (v.failed && Date.now() - new Date(v.at) > 30 * 86400000) delete og[u];
  data.og = og;
  for (const lang of Object.keys(data.news || {})) for (const n of data.news[lang]) { const o = og[n.url]; if (o?.image) n.image = o.image; if (o?.desc && o.desc.length > (n.desc || "").length) n.desc = o.desc; }

  const before = JSON.stringify({ ...prev, updatedAt: 0, errors: 0 });
  data.updatedAt = new Date().toISOString();
  const after = JSON.stringify({ ...data, updatedAt: 0, errors: 0 });
  if (before === after) { log("資料沒有變化"); return; }
  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, JSON.stringify(data) + "\n");
  log(`已寫入 ${path.relative(ROOT, OUT)}（${(JSON.stringify(data).length / 1024).toFixed(0)} KB）${data.errors.length ? `，${data.errors.length} 個來源失敗` : ""}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
