/* =========================================================
   YENA 非官方粉絲站 — 主程式
   單頁式網站，以網址 #hash 切換頁面；內容全部來自 data.js
   ========================================================= */
(() => {
  "use strict";
  const D = window.YENA_DATA;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const app = $("#app");
  const DAY = 86400000;

  /* ---------------- 工具函式 ---------------- */
  const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pad = (n) => String(n).padStart(2, "0");
  // 以韓國時間建立 Date
  const kst = (date, time) => {
    const d = date.length === 7 ? date + "-01" : date;
    return new Date(`${d}T${time || "00:00"}:00+09:00`);
  };
  const fmtDate = (s) => s.replace(/-/g, ".");
  const kstYmd = (d) => {
    const k = new Date(d.getTime() + 9 * 3600000);
    return `${k.getUTCFullYear()}-${pad(k.getUTCMonth() + 1)}-${pad(k.getUTCDate())}`;
  };
  const todayStr = () => kstYmd(new Date());
  const localTime = (d) => d.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", hour12: false });
  const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  const isKstUser = /Seoul/.test(userTz);
  const weekday = (s) => "日一二三四五六"[new Date(kst(s).getTime() + 9 * 3600000).getUTCDay()];
  const daysFrom = (a, b) => Math.round((kst(b) - kst(a)) / DAY);
  const verifiedTag = (v) => (v === false ? ` <span class="tag gray" title="資料尚未經官方來源確認">待確認</span>` : "");

  const toast = (msg) => {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove("show"), 2200);
  };

  const CATS = {
    release: { label: "發行", color: "#ff7eb6" },
    show: { label: "音樂節目", color: "#7cc8ff" },
    award: { label: "頒獎典禮", color: "#f5b700" },
    variety: { label: "綜藝 / 廣播", color: "#3bbf86" },
    concert: { label: "演唱會 / 見面會", color: "#b18cff" },
    goods: { label: "周邊", color: "#ff9f43" },
    live: { label: "直播", color: "#ff6b6b" },
    etc: { label: "其他", color: "#9a8e72" },
    anniv: { label: "紀念日", color: "#ff4f7b" },
  };
  const TYPES = { mini: "迷你專輯", single: "單曲專輯", digital: "數位單曲", japan: "日本作品", collab: "合作 / 客串" };
  const GOODS_STATUS = {
    preorder: { label: "預購中", cls: "pink" },
    onsale: { label: "販售中", cls: "green" },
    upcoming: { label: "即將開賣", cls: "yellow" },
    soldout: { label: "已售完", cls: "gray" },
    ended: { label: "已結束", cls: "gray" },
  };

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

  /* ---------------- 行程資料整合 ---------------- */
  function allEvents(years) {
    const list = D.schedule.map((e) => ({ ...e }));
    for (const y of years) {
      for (const a of D.anniversaries) {
        const n = y - a.since;
        if (n <= 0) continue;
        list.push({ date: `${y}-${a.md}`, time: "", title: `${a.title}（${n} ${a.unit}）`, category: "anniv", place: "", note: "" });
      }
    }
    return list.sort((a, b) => kst(a.date, a.time) - kst(b.date, b.time));
  }
  const yearsAround = (y) => [y - 1, y, y + 1];
  function nextEvents(n = 3) {
    const now = new Date();
    const y = now.getFullYear();
    return allEvents(yearsAround(y)).filter((e) => {
      const end = e.time ? kst(e.date, e.time) : new Date(kst(e.date).getTime() + DAY);
      return end > now;
    }).slice(0, n);
  }

  function timeLabel(e) {
    if (!e.time) return "全天";
    const d = kst(e.date, e.time);
    return isKstUser ? `${e.time} KST` : `${e.time} KST<br><small>當地 ${localTime(d)}</small>`;
  }

  /* 加入行事曆：Google Calendar 連結 & .ics */
  const icsStamp = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  function eventRange(e) {
    if (e.time) {
      const s = kst(e.date, e.time);
      return { start: s, end: new Date(s.getTime() + 3600000), allDay: false };
    }
    return { start: kst(e.date), end: new Date(kst(e.date).getTime() + DAY), allDay: true };
  }
  function gcalUrl(e) {
    const r = eventRange(e);
    const dates = r.allDay
      ? `${e.date.replace(/-/g, "")}/${kstYmd(r.end).replace(/-/g, "")}`
      : `${icsStamp(r.start)}/${icsStamp(r.end)}`;
    const p = new URLSearchParams({ action: "TEMPLATE", text: `[YENA] ${e.title}`, dates, details: e.note || "", location: e.place || "" });
    return `https://calendar.google.com/calendar/render?${p}`;
  }
  function buildIcs(events) {
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//YENA FANS//ZH-TW", "CALSCALE:GREGORIAN"];
    const icsEsc = (s = "") => s.replace(/[\\;,]/g, (c) => "\\" + c).replace(/\n/g, "\\n");
    events.forEach((e, i) => {
      const r = eventRange(e);
      lines.push("BEGIN:VEVENT", `UID:yena-${e.date}-${i}@yena-fans`, `DTSTAMP:${icsStamp(new Date())}`);
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
    const blob = new Blob([buildIcs(events)], { type: "text/calendar;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast("已下載行事曆檔，可匯入 Google / Apple 行事曆");
  }
  // 讓事件按鈕可以透過 data-ev 找回事件
  let evRegistry = [];
  const regEv = (e) => (evRegistry.push(e), evRegistry.length - 1);

  function eventHtml(e) {
    const c = CATS[e.category] || CATS.etc;
    const past = (e.time ? kst(e.date, e.time) : new Date(kst(e.date).getTime() + DAY)) < new Date();
    const id = regEv(e);
    return `<div class="event${past ? " past" : ""}" style="border-left-color:${c.color}">
      <div class="when"><b>${e.date.slice(5).replace("-", "/")}</b>(${weekday(e.date)}) ${timeLabel(e)}</div>
      <div style="min-width:0">
        <span class="tag" style="background:${c.color}22;color:${c.color}">${c.label}</span>
        <h4>${esc(e.title)}</h4>
        ${e.place ? `<p>📍 ${esc(e.place)}</p>` : ""}
        ${e.note ? `<p>${esc(e.note)}</p>` : ""}
        ${past ? "" : `<div class="acts">
          <a class="btn ghost sm" href="${gcalUrl(e)}" target="_blank" rel="noopener">＋ Google 日曆</a>
          <button class="btn ghost sm" data-ics="${id}">下載 .ics</button>
          ${e.link ? `<a class="btn ghost sm" href="${esc(e.link)}" target="_blank" rel="noopener">相關連結 ↗</a>` : ""}
        </div>`}
      </div>
    </div>`;
  }

  /* ---------------- 共用元件 ---------------- */
  const duck = (cls = "duck-big") => `<svg class="${cls}" viewBox="0 0 200 200" aria-hidden="true"><use href="#duck"/></svg>`;
  const cover = (r) => `<div class="cover" style="background:linear-gradient(135deg,${r.colors[0]},${r.colors[1]})">
      <span class="deco">${r.emoji || "🎵"}</span>
      <span class="cy">${fmtDate(r.date)} · ${TYPES[r.type]}</span>
      <span class="ct">${esc(r.title)}</span>
    </div>`;
  const q = (s) => encodeURIComponent(s);
  const musicLinks = (r) => {
    const song = r.titleTrack.replace(/\s*\(Feat\..*?\)/i, "");
    return `<a class="btn ghost sm" href="https://www.youtube.com/results?search_query=${q("YENA " + song + " MV")}" target="_blank" rel="noopener">▶ MV</a>
      <a class="btn ghost sm" href="https://open.spotify.com/search/${q("YENA " + song)}" target="_blank" rel="noopener">Spotify</a>
      <a class="btn ghost sm" href="https://music.apple.com/search?term=${q("YENA " + song)}" target="_blank" rel="noopener">Apple</a>
      <a class="btn ghost sm" href="https://www.melon.com/search/total/index.htm?q=${q("최예나 " + song)}" target="_blank" rel="noopener">Melon</a>`;
  };
  const albumCard = (r) => `<article class="card album">
      ${cover(r)}
      <div class="album-body">
        <h4>${esc(r.title)}${verifiedTag(r.verified)}</h4>
        <div class="tt">主打：${esc(r.titleTrack)}</div>
        ${r.note ? `<div class="note">${esc(r.note)}</div>` : ""}
        ${r.tracks && r.tracks.length > 1 ? `<details><summary>收錄曲（${r.tracks.length}）</summary><ol>${r.tracks.map((t, i) => `<li class="${i === 0 ? "title-track" : ""}">${esc(t)}</li>`).join("")}</ol></details>` : ""}
        <div class="album-links">${musicLinks(r)}</div>
      </div>
    </article>`;
  const liteYt = (v) => `<div class="video-wrap"><button class="lite-yt" data-yt="${esc(v.id)}" style="background-image:url(https://i.ytimg.com/vi/${esc(v.id)}/hqdefault.jpg)" aria-label="播放 ${esc(v.title)}"></button></div>
    <p style="margin:8px 0 0;font-weight:500">${esc(v.title)}</p><p class="note" style="margin:0">${fmtDate(v.date)}</p>`;
  const newsItem = (n) => {
    const [y, m, d] = n.date.split("-");
    return `<div class="news-item">
      <div class="news-date"><b>${d}</b><span>${y}.${m}</span></div>
      <div class="news-body">
        <h4>${esc(n.title)}</h4>
        ${n.summary ? `<p>${esc(n.summary)}</p>` : ""}
        <div class="news-meta">${n.tags.map((t) => `<span class="tag">#${esc(t)}</span>`).join("")}
          ${n.url ? `<span>來源：<a href="${esc(n.url)}" target="_blank" rel="noopener">${esc(n.source)} ↗</a></span>` : ""}</div>
      </div>
    </div>`;
  };

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
    const latest = [...D.releases].sort((a, b) => (a.date < b.date ? 1 : -1))[0];
    const next = nextEvents(4);
    const target = next[0];

    return `
    <section class="hero">
      <div class="float-hearts" aria-hidden="true">${["♥", "★", "♥", "✦", "♥", "★", "♥"].map((h, i) => `<span style="left:${6 + i * 14}%;animation-delay:${i * 1.3}s;font-size:${1 + (i % 3) * 0.4}rem">${h}</span>`).join("")}</div>
      <div class="container hero-inner">
        <div>
          <span class="hero-badge">🐥 Unofficial Fan Site · 지구미</span>
          <h1>YENA<br><span class="ko">최예나 · 崔叡娜</span></h1>
          <p class="lead">${esc(P.intro.split("。")[0])}。行程、作品、照片、周邊與社群動態，和 지구미 一起追星 ♥</p>
          <div class="hero-actions">
            <a class="btn yellow" href="#schedule">📅 看行程</a>
            <a class="btn ghost" href="#gallery">📸 相簿</a>
            <a class="btn ghost" href="#music">🎵 作品集</a>
          </div>
        </div>
        <div class="collage">
          ${(D.heroPhotos || []).map(([a, i]) => {
            const g = D.gallery[a];
            return `<figure class="polaroid" data-photo="${a},${i}" style="margin:0">${imgTag(g.images[i], g.title)}<figcaption>${esc(g.title.replace(/^[^\w가-힣一-鿿]+/, "").slice(0, 14))}</figcaption></figure>`;
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
        <div class="card stat"><div class="num">${soloDays.toLocaleString()}<small> 天</small></div><div class="label">Solo 出道第幾天</div></div>
        <div class="card stat"><div class="num">${toBday === 0 ? "🎂" : "D-" + toBday}</div><div class="label">${toBday === 0 ? "今天是 YENA 生日！" : "距離 9/29 生日"}</div></div>
        <div class="card stat"><div class="num">${D.releases.length}</div><div class="label">收錄作品</div></div>
        <div class="card stat"><div class="num">${D.awards.length}<small> 座</small></div><div class="label">2026 獎項</div></div>
      </div>

      ${target ? `
      <h2 class="section-title">下一個行程 <a class="more" href="#schedule">完整行程 →</a></h2>
      <div class="card countdown-card">
        <div class="info">
          <span class="tag" style="background:${CATS[target.category].color}22;color:${CATS[target.category].color}">${CATS[target.category].label}</span>
          <h3>${esc(target.title)}</h3>
          <div class="note">${fmtDate(target.date)}（${weekday(target.date)}）${target.time ? target.time + " KST" : ""} ${target.place ? "· " + esc(target.place) : ""}</div>
        </div>
        <div class="cd" data-countdown="${eventRange(target).start.toISOString()}">
          <div><b data-u="d">0</b><span>天</span></div><div><b data-u="h">0</b><span>時</span></div>
          <div><b data-u="m">0</b><span>分</span></div><div><b data-u="s">0</b><span>秒</span></div>
        </div>
      </div>` : ""}

      <div class="grid grid-2" style="margin-top:8px">
        <div>
          <h2 class="section-title">最新作品 <a class="more" href="#music">全部作品 →</a></h2>
          <div class="grid grid-2">
            ${albumCard(latest)}
            <div class="card">${D.videos[0] ? liteYt(D.videos[0]) : ""}</div>
          </div>
        </div>
        <div>
          <h2 class="section-title">近期行程</h2>
          <div class="card">${next.length ? next.map(eventHtml).join("") : `<div class="empty">目前沒有已公布的行程</div>`}</div>
        </div>
      </div>

      <h2 class="section-title">最新照片 <a class="more" href="#gallery">進入相簿 →</a></h2>
      <div class="photo-strip">${D.gallery.slice(0, 3).flatMap((g, a) => g.images.slice(0, 4).map((u, i) => imgTag(u, g.title, `data-photo="${a},${i}"`))).join("")}</div>

      <h2 class="section-title">最新消息 <a class="more" href="#news">更多消息 →</a></h2>
      <div class="card">${D.news.slice(0, 4).map(newsItem).join("")}</div>

      <h2 class="section-title">追蹤 YENA</h2>
      <div class="grid grid-3">${D.socials.slice(0, 3).map(snsCard).join("")}</div>
    </div>`;
  };

  /* ---------- 簡介 ---------- */
  pages.profile = () => {
    const P = D.profile;
    const age = (() => {
      const t = todayStr();
      let a = +t.slice(0, 4) - +P.birth.slice(0, 4);
      if (t.slice(5) < P.birth.slice(5)) a--;
      return a;
    })();
    const rows = [
      ["本名", `${P.nameKo}（${P.nameEn}）`],
      ["藝名", P.stageName],
      ["中文", P.nameZh],
      ["生日", `${fmtDate(P.birth)}（${age} 歲）`],
      ["出生地", P.birthplace],
      ["學歷", P.school],
      ["經紀公司", P.agency],
      ["日本廠牌", P.jpLabel],
      ["身份", P.occupation],
      ["家人", P.family],
      ["IZ*ONE 出道", fmtDate(P.izoneDebut)],
      ["Solo 出道", fmtDate(P.soloDebut)],
      ["粉絲名", `${P.fandom.name}（${P.fandom.roman}）`],
      ["應援色", `<span style="display:inline-block;width:14px;height:14px;border-radius:4px;background:${P.color.hex};vertical-align:middle"></span> ${esc(P.color.name)}${verifiedTag(P.color.verified)}`],
    ];
    return `<section class="page container">
      <h1 class="page-title">🐥 YENA 簡介</h1>
      <p class="page-sub">基本資料、經歷年表與獲獎紀錄</p>
      <div class="profile-top">
        <div class="avatar">${(() => { const [a, i] = D.profilePhoto; const u = D.gallery[a].images[i]; return `<img class="photo" src="${esc(u)}" alt="YENA" referrerpolicy="no-referrer" data-photo="${a},${i}" style="cursor:zoom-in">`; })()}<span class="cap">YENA ♥ 최예나</span></div>
        <div class="card">
          <p style="margin-top:0">${esc(P.intro)}</p>
          <table class="info-table">${rows.map(([k, v]) => `<tr><th>${k}</th><td>${k === "應援色" ? v : esc(v)}</td></tr>`).join("")}</table>
        </div>
      </div>

      <div class="grid grid-2">
        <div>
          <h2 class="section-title">經歷年表</h2>
          <div class="card"><div class="timeline">${P.timeline.map((t) => `<div class="tl-item"><div class="d">${fmtDate(t.date)}</div><h4>${esc(t.title)}</h4><p>${esc(t.desc)}</p></div>`).join("")}</div></div>
        </div>
        <div>
          <h2 class="section-title">YENA 小知識 TMI</h2>
          <div class="card"><ul class="fact-list">${P.facts.map((f) => `<li>${esc(f)}</li>`).join("")}</ul></div>
          <h2 class="section-title">獲獎紀錄</h2>
          <div class="card table-wrap"><table class="tbl" style="min-width:0">
            <tr><th>日期</th><th>典禮</th><th>獎項</th></tr>
            ${D.awards.map((a) => `<tr><td>${fmtDate(a.date)}</td><td>${esc(a.event)}</td><td><b>${esc(a.award)}</b>${a.work ? `<br><span class="note">${esc(a.work)}</span>` : ""}</td></tr>`).join("")}
          </table></div>
        </div>
      </div>

      <h2 class="section-title">綜藝 / 戲劇 / 主持</h2>
      <div class="card table-wrap"><table class="tbl">
        <tr><th>年份</th><th>作品</th><th>類型</th><th>角色</th></tr>
        ${D.appearances.map((a) => `<tr><td>${esc(a.year)}</td><td>${esc(a.title)}</td><td><span class="tag">${esc(a.type)}</span></td><td>${esc(a.role)}</td></tr>`).join("")}
      </table></div>
    </section>`;
  };

  /* ---------- 作品 ---------- */
  const musicState = { type: "all", order: "new" };
  pages.music = () => {
    const chips = [["all", "全部"], ...Object.entries(TYPES)];
    let list = D.releases.filter((r) => musicState.type === "all" || r.type === musicState.type);
    list = list.sort((a, b) => (musicState.order === "new" ? (a.date < b.date ? 1 : -1) : a.date < b.date ? -1 : 1));
    return `<section class="page container">
      <h1 class="page-title">🎵 作品集 Discography</h1>
      <p class="page-sub">Solo 出道至今的韓國、日本作品與合作曲。點擊按鈕可直接前往各平台收聽。</p>
      <div class="toggle-row">
        <div class="chips" style="margin:0">${chips.map(([k, v]) => `<button class="chip${musicState.type === k ? " active" : ""}" data-mtype="${k}">${v}</button>`).join("")}</div>
        <button class="chip" data-morder style="margin-left:auto">${musicState.order === "new" ? "⬇ 由新到舊" : "⬆ 由舊到新"}</button>
      </div>
      <div class="grid grid-auto">${list.map(albumCard).join("") || `<div class="empty">沒有符合的作品</div>`}</div>

      <h2 class="section-title">精選影片</h2>
      <div class="grid grid-3">${D.videos.map((v) => `<div class="card">${liteYt(v)}</div>`).join("")}</div>

      <h2 class="section-title">新手入坑推薦 6 首</h2>
      <div class="card table-wrap"><table class="tbl">
        <tr><th>#</th><th>歌曲</th><th>推薦原因</th><th></th></tr>
        ${D.starter.map((s, i) => `<tr><td>${i + 1}</td><td><b>${esc(s.song)}</b></td><td>${esc(s.why)}</td><td><a class="btn ghost sm" href="https://www.youtube.com/results?search_query=${q("YENA " + s.song)}" target="_blank" rel="noopener">▶ 聽</a></td></tr>`).join("")}
      </table></div>
    </section>`;
  };

  /* ---------- 行程 ---------- */
  const schedState = { y: null, m: null, sel: null, cat: "all", view: "upcoming" };
  pages.schedule = () => {
    const now = new Date();
    const t = todayStr();
    if (schedState.y === null) { schedState.y = +t.slice(0, 4); schedState.m = +t.slice(5, 7); }
    const { y, m } = schedState;
    const evs = allEvents(yearsAround(y)).filter((e) => schedState.cat === "all" || e.category === schedState.cat);
    const byDay = {};
    evs.forEach((e) => (byDay[e.date] = byDay[e.date] || []).push(e));

    // 月曆
    const first = new Date(Date.UTC(y, m - 1, 1));
    const startDow = first.getUTCDay();
    const daysIn = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const cells = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(Date.UTC(y, m - 1, 1 - startDow + i));
      const ds = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
      const other = d.getUTCMonth() !== m - 1;
      const es = byDay[ds] || [];
      cells.push(`<button class="cal-day${other ? " other" : ""}${ds === t ? " today" : ""}${es.length ? " has" : ""}${schedState.sel === ds ? " selected" : ""}" data-day="${ds}" aria-label="${ds}${es.length ? `，${es.length} 個行程` : ""}">
        ${d.getUTCDate()}<span class="cal-dots">${es.slice(0, 4).map((e) => `<i style="background:${CATS[e.category].color}"></i>`).join("")}</span></button>`);
      if (i >= 34 && i % 7 === 6 && 1 - startDow + i >= daysIn) break;
    }

    // 右側列表
    let listTitle, list;
    if (schedState.sel) {
      listTitle = `${fmtDate(schedState.sel)}（${weekday(schedState.sel)}）`;
      list = byDay[schedState.sel] || [];
    } else if (schedState.view === "upcoming") {
      listTitle = "即將到來";
      list = evs.filter((e) => eventRange(e).end > now).slice(0, 12);
    } else if (schedState.view === "past") {
      listTitle = "過去行程";
      list = evs.filter((e) => eventRange(e).end <= now && e.category !== "anniv").reverse().slice(0, 20);
    } else {
      listTitle = `${y} 年 ${m} 月`;
      list = evs.filter((e) => e.date.startsWith(`${y}-${pad(m)}`));
    }

    return `<section class="page container">
      <h1 class="page-title">📅 行程表 Schedule</h1>
      <p class="page-sub">時間以韓國時間（KST）標示${isKstUser ? "" : "，並自動換算為你所在地區的時間"}。可一鍵加入 Google 日曆或下載 .ics。</p>
      <div class="chips">
        <button class="chip${schedState.cat === "all" ? " active" : ""}" data-cat="all">全部</button>
        ${Object.entries(CATS).map(([k, c]) => `<button class="chip${schedState.cat === k ? " active" : ""}" data-cat="${k}"><span style="color:${c.color}">●</span> ${c.label}</button>`).join("")}
      </div>
      <div class="sched-layout">
        <div class="card">
          <div class="cal-head">
            <button class="icon-btn" data-mon="-1" aria-label="上個月">‹</button>
            <h3>${y} 年 ${m} 月</h3>
            <button class="icon-btn" data-mon="1" aria-label="下個月">›</button>
          </div>
          <div class="cal-grid">${"日一二三四五六".split("").map((w) => `<div class="cal-dow">${w}</div>`).join("")}${cells.join("")}</div>
          <div class="cal-legend">${Object.values(CATS).map((c) => `<span><i style="background:${c.color}"></i>${c.label}</span>`).join("")}</div>
          <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">
            <button class="btn sm" data-today>回到今天</button>
            <button class="btn ghost sm" data-ics-all>📥 下載所有未來行程 (.ics)</button>
          </div>
        </div>
        <div>
          <div class="toggle-row">
            ${[["upcoming", "即將到來"], ["month", "本月"], ["past", "過去"]].map(([k, v]) => `<button class="chip${!schedState.sel && schedState.view === k ? " active" : ""}" data-view="${k}">${v}</button>`).join("")}
          </div>
          <h3 style="margin:4px 0 12px">${listTitle}</h3>
          ${list.length ? list.map(eventHtml).join("") : `<div class="card empty">這段時間沒有行程 🐥</div>`}
        </div>
      </div>
      <p class="note-box" style="margin-top:24px">行程依官方公告與新聞整理，臨時變動請以 YENA 官方 X（@YENA_OFFICIAL）公告為準。發現錯誤或新行程？歡迎編輯 <code>js/data.js</code> 的 <code>schedule</code> 區塊。</p>
    </section>`;
  };

  /* ---------- 消息 ---------- */
  const newsState = { tag: "all", kw: "" };
  pages.news = () => {
    const tags = [...new Set(D.news.flatMap((n) => n.tags))];
    const kw = newsState.kw.trim().toLowerCase();
    const list = D.news.filter((n) => (newsState.tag === "all" || n.tags.includes(newsState.tag)) && (!kw || (n.title + n.summary).toLowerCase().includes(kw)));
    return `<section class="page container">
      <h1 class="page-title">📰 最新消息</h1>
      <p class="page-sub">整理自韓國媒體報導，點擊來源可閱讀原文。</p>
      <input class="input" type="search" placeholder="🔍 搜尋消息…" value="${esc(newsState.kw)}" data-newskw style="margin-bottom:14px">
      <div class="chips">
        <button class="chip${newsState.tag === "all" ? " active" : ""}" data-ntag="all">全部</button>
        ${tags.map((t) => `<button class="chip${newsState.tag === t ? " active" : ""}" data-ntag="${esc(t)}">#${esc(t)}</button>`).join("")}
      </div>
      <div class="card" data-newslist>${list.map(newsItem).join("") || `<div class="empty">找不到符合的消息</div>`}</div>
    </section>`;
  };

  /* ---------- 周邊 ---------- */
  const goodsState = { st: "all" };
  pages.goods = () => {
    const t = todayStr();
    const list = D.goods.filter((g) => goodsState.st === "all" || g.status === goodsState.st);
    return `<section class="page container">
      <h1 class="page-title">🛍️ 周邊 & 專輯</h1>
      <p class="page-sub">官方專輯、年曆、演唱會 MD 等販售資訊。</p>
      <div class="chips">
        <button class="chip${goodsState.st === "all" ? " active" : ""}" data-gst="all">全部</button>
        ${Object.entries(GOODS_STATUS).map(([k, s]) => `<button class="chip${goodsState.st === k ? " active" : ""}" data-gst="${k}">${s.label}</button>`).join("")}
      </div>
      <div class="grid grid-auto">
        ${list.map((g, i) => {
          const s = GOODS_STATUS[g.status];
          const left = g.preorderEnd ? daysFrom(t, g.preorderEnd) : null;
          return `<article class="card goods-card">
            <div class="gimg" style="background:linear-gradient(135deg,var(--bg-soft),var(--pink-soft))">${g.emoji || "🎁"}</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap"><span class="tag ${s.cls}">${s.label}</span><span class="tag">${esc(g.type)}</span></div>
            <h4>${esc(g.name)}</h4>
            <div class="meta">
              ${g.release ? `<span>發售：${fmtDate(g.release)}</span>` : ""}
              ${g.preorderEnd ? `<span>預購截止：${fmtDate(g.preorderEnd)}</span>` : ""}
              ${g.note ? `<span>${esc(g.note)}</span>` : ""}
            </div>
            ${left !== null && left >= 0 && g.status === "preorder" ? `<div class="deadline">⏰ ${left === 0 ? "今天截止！" : `剩 ${left} 天截止`}</div>` : ""}
            <div class="album-links">${g.stores.map((st) => `<a class="btn sm" href="${esc(st.url)}" target="_blank" rel="noopener">${esc(st.name)} ↗</a>`).join("")}</div>
          </article>`;
        }).join("") || `<div class="empty">沒有符合的品項</div>`}
      </div>

      <h2 class="section-title">購買小提醒</h2>
      <div class="grid grid-3">
        <div class="card"><h4 style="margin-top:0">✅ 認明正版</h4><p class="note">優先從官方指定通路購買。二手平台購買時注意是否為盜版小卡或仿冒周邊。</p></div>
        <div class="card"><h4 style="margin-top:0">📦 特典差異</h4><p class="note">不同通路（Ktown4u、Weverse Shop、各唱片行）的預購特典小卡不同，下單前先比較。</p></div>
        <div class="card"><h4 style="margin-top:0">📊 銷量計入</h4><p class="note">想幫 YENA 衝初動銷量的話，選擇有計入 Hanteo / Circle Chart 的通路。</p></div>
      </div>
    </section>`;
  };

  /* ---------- 社群 ---------- */
  function snsCard(s) {
    return `<a class="card sns-card" href="${esc(s.url)}" target="_blank" rel="noopener">
      ${snsIcon(s.platform)}
      <div style="min-width:0"><h4>${esc(s.name)}${verifiedTag(s.verified)}</h4><div class="handle">${esc(s.handle)}</div><p>${esc(s.desc)}</p></div>
    </a>`;
  }
  pages.social = () => `<section class="page container">
      <h1 class="page-title">💬 官方社群</h1>
      <p class="page-sub">YENA 的官方帳號一覽與最新動態整理。</p>
      <div class="grid grid-3">${D.socials.map(snsCard).join("")}</div>
      <p class="note-box" style="margin-top:16px">標示「待確認」的帳號尚未經官方來源核對，連結會先帶你到該平台的搜尋結果，請認明官方認證標章 ✔️ 以免追到假帳號。</p>

      <div class="grid grid-2">
        <div>
          <h2 class="section-title">最新動態</h2>
          <div class="card">${D.feed.map((f) => `<a class="feed-item" href="${esc(f.url)}" target="_blank" rel="noopener" style="text-decoration:none">
            ${snsIcon(f.platform)}
            <div><span class="note">${fmtDate(f.date)}</span><p>${esc(f.text)}</p></div></a>`).join("")}</div>
        </div>
        <div>
          <h2 class="section-title">最新影片</h2>
          <div class="card">${D.videos[0] ? liteYt(D.videos[0]) : ""}</div>
        </div>
      </div>
    </section>`;

  /* ---------- 應援指南 ---------- */
  pages.guide = () => `<section class="page container">
      <h1 class="page-title">📣 應援指南</h1>
      <p class="page-sub">新粉也能馬上上手：打榜、投票、追星禮儀一次看懂。</p>

      <div class="grid grid-2">
        <div class="card">
          <h2 class="section-title" style="margin-top:0">🎧 串流打榜</h2>
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

      <h2 class="section-title">🗳️ 音樂節目投票</h2>
      <div class="card table-wrap"><table class="tbl">
        <tr><th>節目</th><th>電視台</th><th>播出（KST）</th><th>投票方式</th></tr>
        <tr><td>THE SHOW</td><td>SBS M</td><td>週二</td><td>依節目公告的投票 App</td></tr>
        <tr><td>Show Champion</td><td>MBC M</td><td>週三</td><td>IDOLCHAMP App</td></tr>
        <tr><td>M Countdown</td><td>Mnet</td><td>週四</td><td>Mnet Plus App</td></tr>
        <tr><td>Music Bank</td><td>KBS2</td><td>週五</td><td>依節目公告（海外粉絲部分可參與）</td></tr>
        <tr><td>Show! Music Core</td><td>MBC</td><td>週六</td><td>依節目公告的投票 App</td></tr>
        <tr><td>人氣歌謠</td><td>SBS</td><td>週日</td><td>依節目公告的投票 App</td></tr>
      </table></div>
      <p class="note">各節目的投票平台與計分方式每年可能調整，回歸期間請以節目與 YENA 官方帳號公告為準。</p>

      <h2 class="section-title">💛 追星禮儀</h2>
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
      return `<div style="text-align:center;padding:16px 0">
        <div style="font-size:3rem">${s === Q.length ? "🏆" : "🐥"}</div>
        <h3 style="margin:8px 0">${s} / ${Q.length} 分</h3><p>${msg}</p>
        <button class="btn" data-quiz-restart>再玩一次</button></div>`;
    }
    const item = Q[quizState.i];
    return `<div class="progress"><div style="width:${(quizState.i / Q.length) * 100}%"></div></div>
      <p class="note" style="margin:10px 0 0">第 ${quizState.i + 1} / ${Q.length} 題 · 目前 ${quizState.score} 分</p>
      <p class="quiz-q">${esc(item.q)}</p>
      <div class="quiz-opts">${item.options.map((o, i) => `<button class="quiz-opt" data-opt="${i}">${esc(o)}</button>`).join("")}</div>
      <p class="note" data-quiz-explain style="min-height:1.5em;margin:12px 0 0"></p>
      <button class="btn sm" data-quiz-next style="display:none;margin-top:8px">下一題 →</button>`;
  }
  pages.fans = () => {
    const P = D.profile;
    let saved = "";
    try { saved = localStorage.getItem("yena-fan-since") || ""; } catch (e) {}
    return `<section class="page container">
      <h1 class="page-title">💛 지구미 粉絲專區</h1>
      <p class="page-sub">粉絲名由來、用語小字典、YENA 知識王測驗。</p>

      <div class="card fandom-banner">
        <div class="color-swatch" style="background:${P.color.hex}"></div>
        <div style="flex:1 1 280px">
          <span class="tag" style="background:rgba(255,255,255,.7)">Official Fandom Name</span>
          <h3>${esc(P.fandom.name)} · ${esc(P.fandom.roman)}</h3>
          <p style="margin:6px 0 0">${esc(P.fandom.meaning)}</p>
        </div>
      </div>

      <div class="grid grid-2">
        <div>
          <h2 class="section-title">🎓 YENA 知識王</h2>
          <div class="card" data-quiz>${quizHtml()}</div>

          <h2 class="section-title">📆 我和 YENA 的第幾天</h2>
          <div class="card">
            <label for="fanSince" class="note">你是哪一天入坑的？</label>
            <div style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap">
              <input type="date" id="fanSince" class="input" style="flex:1 1 180px" value="${esc(saved)}" max="${todayStr()}">
            </div>
            <p data-fan-days style="font-size:1.1rem;font-weight:700;margin:12px 0 0"></p>
          </div>
        </div>
        <div>
          <h2 class="section-title">📖 粉絲用語小字典</h2>
          <div class="card"><table class="tbl" style="min-width:0">${D.glossary.map((g) => `<tr><td style="white-space:nowrap"><b>${esc(g.term)}</b></td><td>${esc(g.desc)}</td></tr>`).join("")}</table></div>

          <h2 class="section-title">🎂 每年紀念日</h2>
          <div class="card">${D.anniversaries.map((a) => {
            const t = todayStr();
            let next = `${t.slice(0, 4)}-${a.md}`;
            if (next < t) next = `${+t.slice(0, 4) + 1}-${a.md}`;
            const left = daysFrom(t, next);
            return `<div class="news-item"><div class="news-date"><b>${a.md.slice(3)}</b><span>${+a.md.slice(0, 2)} 月</span></div>
              <div class="news-body"><h4>${esc(a.title)}</h4><p>${left === 0 ? "就是今天！🎉" : `還有 ${left} 天`}（${next.slice(0, 4)} 年為第 ${+next.slice(0, 4) - a.since} ${a.unit}）</p></div></div>`;
          }).join("")}</div>
        </div>
      </div>
    </section>`;
  };

  /* ---------- 相簿 ---------- */
  const GCATS = { award: "頒獎典禮", pictorial: "畫報", sns: "日常 SNS", stage: "舞台活動", throwback: "經典回顧" };
  const thumb = (u) => `https://kpopping.com/api/kpics-image?url=${encodeURIComponent(u)}&size=medium&v=3`;
  const imgTag = (u, alt, extra = "") => `<img src="${esc(thumb(u))}" data-full="${esc(u)}" alt="${esc(alt)}" loading="lazy" referrerpolicy="no-referrer" onerror="if(this.src!==this.dataset.full)this.src=this.dataset.full" ${extra}>`;
  const galleryState = { cat: "all" };
  pages.gallery = () => {
    const list = D.gallery.map((g, i) => ({ ...g, i })).filter((g) => galleryState.cat === "all" || g.cat === galleryState.cat).sort((a, b) => (a.date < b.date ? 1 : -1));
    const total = D.gallery.reduce((n, g) => n + g.images.length, 0);
    return `<section class="page container">
      <h1 class="page-title">📸 YENA 相簿</h1>
      <p class="page-sub">${D.gallery.length} 本相簿、${total} 張照片。點擊相簿開啟大圖，可用方向鍵或滑動切換，也能下載單張或整本打包成 zip。</p>
      <div class="chips">
        <button class="chip${galleryState.cat === "all" ? " active" : ""}" data-gcat="all">全部</button>
        ${Object.entries(GCATS).map(([k, v]) => `<button class="chip${galleryState.cat === k ? " active" : ""}" data-gcat="${k}">${v}</button>`).join("")}
      </div>
      <div class="gal-grid">${list.map((g) => `<button class="card gal-card" data-album="${g.i}">
        <div class="gal-thumb">${imgTag(g.images[0], g.title)}<span class="gal-count">📷 ${g.images.length}</span></div>
        <div class="gb"><span class="tag pink">${GCATS[g.cat]}</span><h4>${esc(g.title)}</h4><span class="note">${fmtDate(g.date)} · ${esc(g.credit)}</span></div>
      </button>`).join("")}</div>
      <p class="note-box" style="margin-top:20px">照片版權屬原著作權人（所屬公司、媒體、Melon 等），經 <a href="https://kpopping.com/kpics?idol=d54377c7-cd98-4f16-92e7-5ec5d5b773b1&idolName=Yena" target="_blank" rel="noopener">kpopping</a> 整理，本站僅以連結方式顯示並標註來源；若有疑慮將立即移除。</p>
    </section>`;
  };

  /* 燈箱 */
  const lb = { a: 0, i: 0 };
  function lbShow() {
    const g = D.gallery[lb.a], el = $("#lb");
    el.innerHTML = `<div class="lb-tools">
        <button class="lb-tool" data-dl-one>⬇ 下載這張</button>
        ${g.images.length > 1 ? `<button class="lb-tool" data-dl-all>${dlBusy ? "📦 打包中…" : `📦 整本下載（${g.images.length} 張 zip）`}</button>` : ""}
      </div>
      <button class="lb-btn lb-close" data-lb-close aria-label="關閉">✕</button>
      <button class="lb-btn lb-prev" data-lb="-1" aria-label="上一張">‹</button>
      <img class="main" src="${esc(g.images[lb.i])}" alt="${esc(g.title)}" referrerpolicy="no-referrer">
      <button class="lb-btn lb-next" data-lb="1" aria-label="下一張">›</button>
      <div class="cap"><b>${esc(g.title)}</b>（${lb.i + 1} / ${g.images.length}）· ${fmtDate(g.date)} · 來源：${esc(g.credit)} via <a href="${esc(g.url)}" target="_blank" rel="noopener">kpopping ↗</a></div>
      <div class="lb-thumbs">${g.images.map((u, k) => `<img src="${esc(thumb(u))}" data-lbi="${k}" class="${k === lb.i ? "on" : ""}" alt="" referrerpolicy="no-referrer">`).join("")}</div>`;
    el.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  const lbOpen = (a, i = 0) => { lb.a = a; lb.i = i; lbShow(); };
  const lbMove = (d) => { const n = D.gallery[lb.a].images.length; lb.i = (lb.i + d + n) % n; lbShow(); };
  const lbClose = () => { $("#lb").classList.remove("open"); document.body.style.overflow = ""; };

  /* 下載：kpopping CDN 有開 CORS，可直接抓成 blob 存檔 */
  const safeName = (s) => s.replace(/[\\/:*?"<>|]+/g, "").replace(/\s+/g, "_").slice(0, 60);
  const extOf = (u) => (u.split("?")[0].match(/\.(jpe?g|png|webp|gif)$/i) || [, "jpg"])[1].toLowerCase();
  const photoName = (g, k, u) => `YENA_${g.date}_${safeName(g.title)}_${pad(k + 1)}.${extOf(u)}`;
  const fetchBlob = async (u) => {
    const r = await fetch(u, { mode: "cors", referrerPolicy: "no-referrer" });
    if (!r.ok) throw new Error(r.status);
    return r.blob();
  };
  const saveBlob = (blob, name) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  };
  let dlBusy = false;
  async function downloadOne(a, k) {
    const g = D.gallery[a], u = g.images[k];
    toast("下載原圖中…");
    try { saveBlob(await fetchBlob(u), photoName(g, k, u)); toast("已下載 💖"); }
    catch { window.open(u, "_blank", "noopener"); toast("已在新分頁開啟原圖，可長按或右鍵另存"); }
  }
  let jszip;
  const loadJSZip = () => jszip || (jszip = new Promise((ok, no) => {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
    s.onload = () => ok(window.JSZip);
    s.onerror = () => { jszip = null; no(new Error("JSZip")); };
    document.head.appendChild(s);
  }));
  async function downloadAlbum(a) {
    if (dlBusy) return toast("上一個相簿還在打包中…");
    dlBusy = true;
    const g = D.gallery[a];
    try {
      const JSZip = await loadJSZip();
      const zip = new JSZip();
      let done = 0, failed = 0;
      toast(`打包中 0 / ${g.images.length}（原圖較大，請稍候）`);
      await Promise.all(g.images.map(async (u, k) => {
        try { zip.file(photoName(g, k, u), await fetchBlob(u)); } catch { failed++; }
        const msg = `打包中 ${++done} / ${g.images.length}`;
        toast(msg);
        const b = $("[data-dl-all]"); if (b) b.textContent = "📦 " + msg;
      }));
      zip.file("來源.txt", `${g.title}\n${g.date}\n來源：${g.credit}\n${g.url}\n\n照片版權屬原著作權人，僅供個人收藏，請勿商用。\n`);
      saveBlob(await zip.generateAsync({ type: "blob" }), `YENA_${g.date}_${safeName(g.title)}.zip`);
      toast(failed ? `已下載，${failed} 張抓取失敗` : `已下載 ${g.images.length} 張 💖`);
    } catch { toast("打包失敗，請改用單張下載"); }
    finally {
      dlBusy = false;
      const b = $("[data-dl-all]"); if (b) b.textContent = `📦 整本下載（${D.gallery[lb.a].images.length} 張 zip）`;
    }
  }
  addEventListener("keydown", (e) => {
    if (!$("#lb").classList.contains("open")) return;
    if (e.key === "Escape") lbClose();
    if (e.key === "ArrowLeft") lbMove(-1);
    if (e.key === "ArrowRight") lbMove(1);
  });
  let tx = null;
  addEventListener("touchstart", (e) => { if ($("#lb").classList.contains("open")) tx = e.touches[0].clientX; }, { passive: true });
  addEventListener("touchend", (e) => { if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; tx = null; if (Math.abs(dx) > 50) lbMove(dx < 0 ? 1 : -1); });

  /* =========================================================
     路由與事件
     ========================================================= */
  const NAV = [["home", "首頁"], ["profile", "簡介"], ["music", "作品"], ["schedule", "行程"], ["gallery", "相簿"], ["news", "消息"], ["goods", "周邊"], ["social", "社群"], ["guide", "應援指南"], ["fans", "粉絲專區"]];
  const TITLES = Object.fromEntries(NAV);

  function render(keepScroll) {
    const route = (location.hash.slice(1) || "home").split("?")[0];
    const key = pages[route] ? route : "home";
    evRegistry = [];
    app.innerHTML = pages[key]();
    document.title = key === "home" ? `${D.meta.siteName} | YENA 非官方粉絲站` : `${TITLES[key]} | ${D.meta.siteName}`;
    $$(".nav a").forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + key));
    $("#nav").classList.remove("open");
    if (!keepScroll) window.scrollTo({ top: 0, behavior: "instant" });
    afterRender(key);
  }

  function afterRender(key) {
    startCountdowns();
    if (key === "fans") updateFanDays();
  }

  /* 倒數計時 */
  let cdTimer;
  function startCountdowns() {
    clearInterval(cdTimer);
    const els = $$("[data-countdown]");
    if (!els.length) return;
    const tick = () => els.forEach((el) => {
      let diff = Math.max(0, new Date(el.dataset.countdown) - new Date());
      const u = { d: Math.floor(diff / DAY), h: Math.floor((diff % DAY) / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) };
      Object.entries(u).forEach(([k, v]) => { const b = el.querySelector(`[data-u="${k}"]`); if (b) b.textContent = k === "d" ? v : pad(v); });
    });
    tick();
    cdTimer = setInterval(tick, 1000);
  }

  function updateFanDays() {
    const inp = $("#fanSince"), out = $("[data-fan-days]");
    if (!inp || !out) return;
    if (!inp.value) { out.textContent = "選擇日期後，看看你陪伴 YENA 多久了！"; return; }
    const n = daysFrom(inp.value, todayStr()) + 1;
    out.textContent = n > 0 ? `💛 今天是你成為 지구미 的第 ${n.toLocaleString()} 天！` : "日期不能是未來喔 🐥";
  }

  // 事件委派
  document.addEventListener("click", (ev) => {
    if (ev.target.id === "lb") return lbClose();
    const el = ev.target.closest("button, [data-day], [data-lbi], [data-photo]");
    if (!el) return;
    const ds = el.dataset;

    if (ds.album !== undefined) return lbOpen(+ds.album);
    if (ds.photo !== undefined) { const [a, i] = ds.photo.split(",").map(Number); return lbOpen(a, i); }
    if (ds.lb) return lbMove(+ds.lb);
    if (ds.lbi !== undefined) { lb.i = +ds.lbi; return lbShow(); }
    if (ds.lbClose !== undefined) return lbClose();
    if (ds.dlOne !== undefined) return downloadOne(lb.a, lb.i);
    if (ds.dlAll !== undefined) return downloadAlbum(lb.a);
    if (ds.gcat) { galleryState.cat = ds.gcat; return render(true); }
    if (ds.yt !== undefined) {
      el.parentElement.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(ds.yt)}?autoplay=1" title="YouTube" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
      return;
    }
    if (ds.ics !== undefined) { const e = evRegistry[+ds.ics]; if (e) downloadIcs([e], `yena-${e.date}.ics`); return; }
    if (ds.icsAll !== undefined) {
      const now = new Date();
      const list = allEvents(yearsAround(new Date().getFullYear())).filter((e) => eventRange(e).end > now);
      downloadIcs(list, "yena-schedule.ics");
      return;
    }
    // 作品
    if (ds.mtype) { musicState.type = ds.mtype; return render(true); }
    if (ds.morder !== undefined) { musicState.order = musicState.order === "new" ? "old" : "new"; return render(true); }
    // 行程
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
    if (ds.today !== undefined) { const t = todayStr(); Object.assign(schedState, { y: +t.slice(0, 4), m: +t.slice(5, 7), sel: null, view: "upcoming" }); return render(true); }
    if (ds.view) { schedState.view = ds.view; schedState.sel = null; return render(true); }
    // 消息
    if (ds.ntag) { newsState.tag = ds.ntag; return render(true); }
    // 周邊
    if (ds.gst) { goodsState.st = ds.gst; return render(true); }
    // 測驗
    if (ds.opt !== undefined && !quizState.answered) {
      const item = D.quiz[quizState.i];
      const pick = +ds.opt;
      quizState.answered = true;
      if (pick === item.answer) quizState.score++;
      $$(".quiz-opt").forEach((b, i) => { b.disabled = true; if (i === item.answer) b.classList.add("right"); else if (i === pick) b.classList.add("wrong"); });
      $("[data-quiz-explain]").textContent = (pick === item.answer ? "⭕ 答對了！" : "❌ 答錯了～") + item.explain;
      $("[data-quiz-next]").style.display = "";
      return;
    }
    if (ds.quizNext !== undefined) {
      quizState.answered = false;
      quizState.i++;
      if (quizState.i >= D.quiz.length) quizState.done = true;
      $("[data-quiz]").innerHTML = quizHtml();
      return;
    }
    if (ds.quizRestart !== undefined) { Object.assign(quizState, { i: 0, score: 0, answered: false, done: false }); $("[data-quiz]").innerHTML = quizHtml(); }
  });

  document.addEventListener("input", (ev) => {
    if (ev.target.matches("[data-newskw]")) {
      newsState.kw = ev.target.value;
      const kw = newsState.kw.trim().toLowerCase();
      const list = D.news.filter((n) => (newsState.tag === "all" || n.tags.includes(newsState.tag)) && (!kw || (n.title + n.summary).toLowerCase().includes(kw)));
      $("[data-newslist]").innerHTML = list.map(newsItem).join("") || `<div class="empty">找不到符合的消息</div>`;
    }
    if (ev.target.id === "fanSince") {
      try { localStorage.setItem("yena-fan-since", ev.target.value); } catch (e) {}
      updateFanDays();
    }
  });

  /* ---------------- 外框初始化 ---------------- */
  function initShell() {
    $("#nav").innerHTML = NAV.map(([k, v]) => `<a href="#${k}">${v}</a>`).join("");
    const items = D.ticker.map((t) => `<span>${esc(t)}</span>`).join("");
    $("#ticker").innerHTML = `<div class="ticker-track">${items}${items}</div>`;
    $("#updated").textContent = fmtDate(D.meta.updated);
    $("#disclaimer").textContent = D.meta.disclaimer;
    $("#sources").innerHTML = D.sources.map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)} ↗</a></li>`).join("");

    $("#menuBtn").addEventListener("click", () => $("#nav").classList.toggle("open"));

    // 深色模式
    const root = document.documentElement;
    let theme = null;
    try { theme = localStorage.getItem("yena-theme"); } catch (e) {}
    if (!theme) theme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const applyTheme = (t) => { root.dataset.theme = t; $("#themeBtn").textContent = t === "dark" ? "☀️" : "🌙"; };
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

  initShell();
  addEventListener("hashchange", () => render(false));
  render(false);
})();
