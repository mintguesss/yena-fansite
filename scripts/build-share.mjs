#!/usr/bin/env node
/* =========================================================
   產生分享預覽頁 s/<類型>.<id>.html
   LINE / Discord / X / Facebook 抓預覽時看不到 #hash 之後的內容，
   所以替每則新聞、作品、行程、周邊、應援活動、影片、照片各產生一個
   帶有 og 標籤的小頁面；真人點開會立刻轉回網站上的詳細內容。
   ID 的算法必須和 js/app.js 一致。
   部署時由 GitHub Actions 執行（s/ 不進 git）。
   ========================================================= */
import fs from "node:fs/promises";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "s");
const DAY = 86400000;

const ctx = { window: {} };
vm.runInNewContext(await fs.readFile(path.join(ROOT, "js", "data.js"), "utf8"), ctx);
const D = ctx.window.YENA_DATA;
let A = {};
try { A = JSON.parse(await fs.readFile(path.join(ROOT, "data", "auto.json"), "utf8")); } catch {}
const SITE = (process.env.SITE_URL || D.meta.siteUrl).replace(/\/?$/, "/");
const DEFAULT_IMG = SITE + "assets/og.png";

/* ---- 和 app.js 相同的工具 ---- */
const hid = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); };
const norm = (s) => (s || "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
const sortKey = (x) => x.iso || (x.date ? x.date + "T12:00:00+09:00" : "");
const byNew = (a, b) => (sortKey(a) < sortKey(b) ? 1 : -1);
const fmtDate = (s = "") => s.slice(0, 10).replace(/-/g, ".");
const ytThumb = (v, big) => (v.short ? `https://i.ytimg.com/vi/${v.id}/oar2.jpg` : `https://i.ytimg.com/vi/${v.id}/${big ? "maxresdefault" : "hqdefault"}.jpg`);
const httpsUrl = (u) => (/^https?:\/\//i.test(u || "") ? u.replace(/^http:/i, "https:") : "");

/* ---- 合併（與 app.js 的 build* 對應） ---- */
const og = A.og || {};
const manualNews = D.news.map((n) => ({ id: "n" + hid(n.url || n.title), title: n.title, date: n.date, desc: n.summary, image: (og[n.url] && og[n.url].image) || "", source: n.source, curated: true }));
const urls = new Set(manualNews.map((n, i) => D.news[i].url));
const autoNews = ["zh", "ko", "en"].flatMap((l) => ((A.news && A.news[l]) || []).filter((n) => !urls.has(n.url)).map((n) => ({ id: "n" + hid(n.url), title: n.title, date: (n.date || "").slice(0, 10), iso: n.date, desc: n.desc, image: n.image || n.thumb || "", source: n.source })));
const news = [...manualNews, ...autoNews].sort(byNew);

const it = (A.releases || []).map((a) => ({ ...a, used: false }));
const nm = (s) => norm((s || "").replace(/\(.*?\)/g, ""));
const releases = D.releases.map((r) => {
  const names = [nm(r.title), norm((r.title.match(/\(([^)]+)\)/) || [])[1]), nm(r.titleTrack)].filter((x) => x && x.length > 1);
  const itn = (a) => [nm(a.title), norm(a.title)];
  const mid = r.date.length === 7 ? new Date(r.date + "-15") : new Date(r.date);
  const dateHit = (a) => (r.date.length === 7 ? a.date.startsWith(r.date) : Math.abs(new Date(a.date) - mid) <= DAY * 1.5);
  const nameHit = (a) => names.some((n) => itn(a).some((m) => m && (m.includes(n) || n.includes(m))));
  const a = it.find((a) => !a.used && dateHit(a) && nameHit(a)) || it.find((a) => !a.used && dateHit(a)) || it.find((a) => !a.used && nameHit(a) && Math.abs(new Date(a.date) - mid) < DAY * 45);
  if (a) a.used = true;
  return { id: "r" + hid(r.title), title: r.title, date: r.date.length === 7 && a ? a.date : r.date, cover: r.cover || (a && a.cover) || "", note: r.note, titleTrack: r.titleTrack, it: a };
});
for (const a of it.filter((a) => !a.used)) {
  const type = /japanese|日本|[ぁ-んァ-ン]/i.test(a.title) ? "japan" : /chinese|sped up|remix|ver\.|version|instrumental/i.test(a.title) ? "version" : a.kind === "EP" ? "mini" : a.kind === "Single" && a.trackCount >= 3 ? "single" : "digital";
  releases.push({ id: "r" + hid("it" + a.id), title: a.title, date: a.date, cover: a.cover, note: "", titleTrack: (a.tracks && a.tracks[0] && a.tracks[0].name) || a.title, it: a, auto: true, type });
}

const videos = ((A.youtube && A.youtube.videos) || []).slice();
for (const v of D.videos) if (!videos.some((x) => x.id === v.id)) videos.push({ ...v, desc: "", short: false });

const items = [];
const add = (d, route, title, desc, image) => items.push({ d, route, title, desc: (desc || "").replace(/\s+/g, " ").trim().slice(0, 200), image: httpsUrl(image) || DEFAULT_IMG });

for (const n of news) add(`n.${n.id}`, "news", n.title, `${n.source} · ${fmtDate(n.date)} — ${n.desc || ""}`, n.image);
for (const r of releases) add(`r.${r.id}`, "music", `${r.title} — YENA`, `${fmtDate(r.date)} · ${r.titleTrack || ""}${r.note ? " · " + r.note : ""}`, r.cover ? r.cover.replace("600x600", "1000x1000") : "");
for (const v of videos) add(`v.${v.id}`, "social", v.title, `${fmtDate(v.date)} · YouTube @YENA_OFFICIAL`, ytThumb(v, true));

// 行程
const evs = D.schedule.map((e) => ({ ...e }));
for (const r of releases) if (r.it && !D.schedule.some((e) => e.category === "release" && e.date === r.date)) evs.push({ key: "rel" + r.id, date: r.date, title: `發行 Release：${r.title}`, place: "", note: "", image: r.cover });
for (const w of A.wins || []) evs.push({ key: "win" + w.show + w.date, date: w.date, title: `🏆 ${w.show} 1st —〈${w.song}〉`, place: "", note: "" });
for (const e of (A.community && A.community.schedule) || []) evs.push({ ...e });
const fanEvents = [...(D.fanEvents || []), ...((A.community && A.community.events) || [])].map((e) => ({ ...e, id: "f" + hid(e.date + e.title) }));
for (const f of fanEvents) evs.push({ key: "fan" + f.id, date: f.date, title: "💛 " + f.title, place: f.place, note: f.note, image: f.image });
const y = new Date().getFullYear();
for (const yy of [y - 2, y - 1, y, y + 1]) for (const a of D.anniversaries) { const n = yy - a.since; if (n > 0) evs.push({ key: `anniv${a.md}${yy}`, date: `${yy}-${a.md}`, title: `${a.title}（${n} ${a.unit}）`, place: "", note: "" }); }
for (const e of evs) {
  const id = "e" + hid(e.key || e.date + e.title);
  add(`e.${id}`, "schedule", e.title, `📅 ${fmtDate(e.date)}${e.time ? " " + e.time + " KST" : ""}${e.place ? " · 📍 " + e.place : ""}${e.note ? " · " + e.note : ""}`, e.image || (e.link && og[e.link] && og[e.link].image));
}
for (const f of fanEvents) add(`f.${f.id}`, "events", f.title, `📅 ${fmtDate(f.date)}${f.end ? " – " + fmtDate(f.end) : ""}${f.place ? " · 📍 " + f.place : ""}${f.note ? " · " + f.note : ""}`, f.image);

// 周邊
const goods = D.goods.map((g) => ({ ...g }));
for (const g of (A.community && A.community.goods) || []) goods.push({ ...g });
for (const r of releases) if (r.auto && ["mini", "single"].includes(r.type) && !goods.some((g) => g.release === r.date)) goods.push({ name: r.title, release: r.date, note: "" });
for (const g of goods) {
  let img = g.image || (g.release && (releases.find((r) => r.date === g.release && r.cover) || {}).cover) || "";
  if (!img && g.keywords && g.keywords.length) {
    const re = new RegExp(g.keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "i");
    const v = ((A.youtube && A.youtube.videos) || []).find((v) => re.test(v.title + " " + v.desc));
    if (v) img = ytThumb(v, true);
  }
  add(`g.${"g" + hid(g.name)}`, "goods", g.name, `${g.release ? fmtDate(g.release) + " · " : ""}${g.note || ""}`, img);
}

// 照片（相簿 id 與 app.js 的 buildAlbums 相同）
for (const g of D.gallery) g.images.forEach((u, i) => add(`p.${"a" + hid(g.url || g.title)}.${i}`, "gallery", `${g.title} (${i + 1}/${g.images.length})`, `${fmtDate(g.date)} · ${g.credit}`, u));
const months = new Map(), seen = new Set();
for (const n of news) {
  if (!n.image || n.curated || seen.has(n.image)) continue;
  seen.add(n.image);
  const k = n.date.slice(0, 7);
  if (!months.has(k)) months.set(k, []);
  months.get(k).push(n);
}
for (const [k, list] of months) list.slice(0, 80).forEach((n, i) => add(`p.an${k}.${i}`, "gallery", n.title, `${n.source} · ${fmtDate(n.date)}`, n.image));
const vm2 = new Map();
for (const v of (A.youtube && A.youtube.videos) || []) { const k = v.date.slice(0, 7); if (!vm2.has(k)) vm2.set(k, []); vm2.get(k).push(v); }
for (const [k, list] of vm2) list.forEach((v, i) => add(`p.ay${k}.${i}`, "gallery", v.title, "YouTube @YENA_OFFICIAL", ytThumb(v, true)));
(A.commons || []).forEach((c, i) => add(`p.acc.${i}`, "gallery", c.title, `© ${c.artist} · ${c.license}`, c.u));

/* ---- 輸出 ---- */
const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const page = (it) => {
  const target = `../#${it.route}?d=${it.d}`;
  return `<!doctype html>
<html lang="zh-Hant-TW"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(it.title)} | YENA FANS</title>
<meta name="description" content="${esc(it.desc)}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="YENA FANS — 최예나 Unofficial">
<meta property="og:title" content="${esc(it.title)}">
<meta property="og:description" content="${esc(it.desc)}">
<meta property="og:image" content="${esc(it.image)}">
<meta property="og:url" content="${esc(SITE + "s/" + it.d + ".html")}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(it.title)}">
<meta name="twitter:description" content="${esc(it.desc)}">
<meta name="twitter:image" content="${esc(it.image)}">
<meta name="theme-color" content="#ff4f9a">
<meta name="robots" content="noindex">
<link rel="canonical" href="${esc(SITE + "#" + it.route + "?d=" + it.d)}">
<meta http-equiv="refresh" content="0; url=${esc(target)}">
<script>location.replace(${JSON.stringify(target)})</script>
</head><body style="font-family:sans-serif;background:#fff4f9;color:#2d1020;text-align:center;padding:40px">
<p>🐥 <a href="${esc(target)}">${esc(it.title)}</a></p>
</body></html>
`;
};
await fs.rm(OUT, { recursive: true, force: true });
await fs.mkdir(OUT, { recursive: true });
const done = new Set();
for (const it of items) {
  if (done.has(it.d) || !/^[\w.-]+$/.test(it.d)) continue;
  done.add(it.d);
  await fs.writeFile(path.join(OUT, `${it.d}.html`), page(it));
}
console.log(`[share] 產生 ${done.size} 個分享預覽頁 → s/`);
