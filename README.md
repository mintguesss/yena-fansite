# YENA FANS — YENA（최예나）非官方粉絲站

🌐 線上版：<https://mintguesss.github.io/yena-fansite/>

純 HTML / CSS / JavaScript，不需要安裝套件或打包。內容分兩種：

| 來源 | 檔案 | 怎麼更新 |
| --- | --- | --- |
| 人工整理 | `js/data.js` | 你手動編輯 |
| 自動抓取 | `data/auto.json` | GitHub Actions 每 4 小時自動更新，不用動 |

網站載入時會把兩者合併；自動資料抓不到時，網站照樣用人工資料運作。

## 自動更新了什麼

| 項目 | 來源 | 出現在 |
| --- | --- | --- |
| 韓 / 英 / 中文新聞（含配圖、摘要） | Bing News RSS ＋ 原文的 og 標籤 | 消息、首頁、相簿「新聞照片」、行程詳細頁的相關新聞 |
| 作品封面、曲目、30 秒試聽 | iTunes API | 作品、周邊（專輯封面）、行程（發行日） |
| 官方 YouTube 影片、訂閱數 | YouTube RSS | 作品、社群、相簿「官方 YouTube」、周邊配圖 |
| 頒獎典禮、音樂節目一位 | 英文維基百科 | 成績、簡介、行程（一位紀錄） |
| CC 授權照片 | Wikimedia Commons | 相簿 |
| 粉絲投稿的行程 / 應援活動 / 周邊 | GitHub Issues（加上 `approved` 標籤的） | 行程、應援活動、周邊 |

腳本在 `scripts/update.mjs`，排程在 `.github/workflows/update.yml`。每個來源各自獨立，某一個失敗時會保留上一次的資料。

- 想馬上更新：到 GitHub 的 **Actions → Auto update & deploy → Run workflow**。
- 在本機手動跑一次：`node scripts/update.mjs`（需要 Node 20 以上）。

## 粉絲投稿怎麼審核

1. 粉絲在網站按「投稿行程 / 投稿應援活動 / 投稿周邊」，會開啟 GitHub 的表單（需要 GitHub 帳號）。
2. 你在 repo 的 **Issues** 看到投稿，確認內容沒問題後加上 **`approved`** 標籤。
3. 幾分鐘內自動出現在網站上。要撤下就拿掉標籤或關閉 issue。

## 頁面

首頁、簡介、作品、行程、相簿、消息、周邊、成績、應援活動、社群、應援指南、粉絲專區。

- 作品、行程、消息、周邊、應援活動、影片、單張照片都能點開看詳細內容，而且每個都有自己的網址可以分享（例如 `#news?d=n.xxxx`）。
- 右上角 🔍 是全站搜尋（快捷鍵 `/` 或 `Ctrl+K`）；語言可切換中文 / English / 한국어。
- 可以「加到主畫面」當 App 用，離線時也能看到上次載入的內容。
- **分享預覽**：詳細頁的「複製連結 / 分享」用的是 `s/<類型>.<id>.html`，貼到 LINE、Discord、X、Facebook 會顯示那則內容自己的標題和照片，點開會自動轉回網站。這些頁面在部署時由 `scripts/build-share.mjs` 產生（不進 git）；還沒產生的連結會由 `404.html` 導回。首頁本身的預覽圖是 `assets/og.png`。
- **特別日主題**：生日（9/29）、Solo 出道紀念日（1/17）、IZ*ONE 出道紀念日（10/29）和新作品發行當天會出現專屬橫幅與彩帶，生日前 7 天顯示倒數。想預覽可以在網址加 `?today=2026-09-29`。
- **多語言**：介面文字在 `js/i18n.js`；應援指南、購買提醒、測驗、用語字典等長篇內容在 `js/content.js`（測驗和用語字典依 `data.js` 的順序對應，新增題目時記得一起補英韓版，沒補的會顯示中文）。

## 本機預覽

```powershell
python -m http.server 5520 --directory C:\Project\yena-fansite
```

然後打開 <http://localhost:5520>。

## 手動更新內容（`js/data.js`）

- 新增行程 → `schedule` 加一筆：
  ```js
  { date: "2026-12-05", time: "18:00", title: "MAMA AWARDS 出演", category: "award", place: "香港", note: "", link: "" },
  ```
  `time` 寫韓國時間（留空表示全天）。`category`：`release` `show` `award` `variety` `concert` `goods` `live` `etc`。
- 新增精選消息 → `news` 最上面加一筆（會標上「精選」，配圖會自動抓）。
- 作品 → `releases`；封面和曲目會自動從 iTunes 對應上，沒有對應到的新作品也會自動出現。
- 周邊 → `goods`，`status`：`preorder` `onsale` `upcoming` `soldout` `ended`。沒有圖片時可加 `keywords`，會自動找相關影片或新聞當配圖。
- 成績 → `records`（排行榜、串流紀錄）；獎項和一位會自動抓，不用手動加。
- 應援活動 → `fanEvents`，或請粉絲用投稿表單。
- 相簿 → 在 kpopping 對圖片按右鍵「複製圖片網址」，加進 `gallery` 的 `images`；`heroPhotos` 決定首頁拍立得放哪三張。
- 英文 / 韓文介面文字在 `js/i18n.js`；簡介的英韓版在 `profile.i18n`。
- 記得更新 `meta.updated`。

改了 `css/` 或 `js/` 之後，把 `index.html` 裡 `?v=` 的數字加 1，然後推上 GitHub：

```powershell
git add -A; git commit -m "update"; git push
```

## 資料可信度與版權

- `verified: false` 的項目會顯示「待確認」。目前 X（@YENA_OFFICIAL）與 YouTube（@YENA_OFFICIAL）已確認；Instagram 與應援色只有粉絲站來源；TikTok、微博、Bilibili 沒找到可靠來源，連結先導向該平台的搜尋頁。
- 自動新聞只顯示標題、媒體提供的摘要（og:description）與配圖，並連回原文，不轉載全文。
- 照片以連結方式引用（kpopping、各媒體、YouTube 縮圖、Wikimedia Commons），每張都標註來源；版權屬原著作權人。kpopping 有機器人驗證，所以不會自動抓取，只能手動加入。小鴨插圖為原創。
- 自動更新的 commit 使用 repo 擁有者的 noreply 信箱，Contributors 不會多出 bot 帳號。
