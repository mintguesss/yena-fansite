# YENA FANS — YENA（최예나）非官方粉絲站

純 HTML / CSS / JavaScript，不需要安裝任何套件或打包工具。

## 本機預覽

```powershell
python -m http.server 5520 --directory C:\Project\yena-fansite
```

然後打開 <http://localhost:5520>。（直接雙擊 `index.html` 也可以開，但部分瀏覽器對 `file://` 有限制，建議用上面的方式。）

## 頁面

| 頁面 | 網址 | 內容 |
| --- | --- | --- |
| 首頁 | `#home` | 下一個行程倒數、出道天數、生日 D-day、最新作品、近期行程、最新消息 |
| 簡介 | `#profile` | 基本資料、經歷年表、TMI、獲獎紀錄、綜藝 / 戲劇列表 |
| 作品 | `#music` | Discography（可依類型篩選、排序）、各平台收聽連結、精選影片、入坑歌單 |
| 行程 | `#schedule` | 月曆、分類篩選、KST 自動換算當地時間、加入 Google 日曆 / 下載 .ics |
| 相簿 | `#gallery` | 18 本相簿（頒獎典禮、畫報、日常 SNS、舞台、經典回顧），燈箱大圖、方向鍵／滑動切換 |
| 消息 | `#news` | 新聞時間軸、關鍵字搜尋、標籤篩選、原文來源連結 |
| 周邊 | `#goods` | 專輯 / 年曆等販售狀態、預購截止倒數、購買通路 |
| 社群 | `#social` | 官方帳號一覽、最新動態整理、影片 |
| 應援指南 | `#guide` | 串流打榜、MV 觀看、音樂節目投票、追星禮儀 |
| 粉絲專區 | `#fans` | 粉絲名由來、知識王測驗、入坑天數計算、用語字典、年度紀念日 |

另有深色模式、手機版選單、快訊跑馬燈。

## 如何更新內容

**所有內容都在 `js/data.js`**，改完存檔、重新整理網頁就生效。

- 新增行程 → 在 `schedule` 加一筆：
  ```js
  { date: "2026-12-05", time: "18:00", title: "MAMA AWARDS 出演", category: "award", place: "香港", note: "", link: "" },
  ```
  `time` 寫韓國時間（留空表示全天）。`category` 可用：`release` `show` `award` `variety` `concert` `goods` `live` `etc`。
- 新增消息 → `news` 最上面加一筆（新的放前面）。
- 新增作品 → `releases` 加一筆；若有 MV 的 YouTube 影片 ID，可放進 `videos` 直接嵌入播放。
- 周邊 → `goods`，`status` 可用 `preorder` `onsale` `upcoming` `soldout` `ended`。
- 新增相簿 → 在 kpopping 打開該相簿，對圖片按右鍵「複製圖片網址」（`https://cdn.kpopping.com/kpics/...`），加進 `gallery` 的 `images`；`heroPhotos` 決定首頁拍立得放哪三張。
- 生日、出道日等紀念日放在 `anniversaries`，每年會自動出現在行程表。
- 記得更新 `meta.updated` 日期。

## 資料可信度

- 資料整理自 Wikipedia 與韓國媒體英文版報導（2026-11-23），來源列在網站頁尾與每則消息下方。
- `verified: false` 的項目會在網頁上顯示「待確認」：目前只有 X（@YENA_OFFICIAL）經新聞確認；Instagram（@yena.jigumina）與應援色只有粉絲站來源；YouTube、TikTok、微博、Bilibili 沒找到可靠的帳號來源，連結先導向該平台的搜尋頁。
- 照片以連結方式引用 kpopping 整理的圖片（不另外下載），每本相簿標註原始出處；版權屬原著作權人。若要公開架站，請保留頁面上的版權聲明。小鴨插圖為原創。
