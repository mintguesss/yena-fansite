/* =========================================================
   YENA 非官方粉絲站 — 內容資料
   ---------------------------------------------------------
   ★ 要更新網站內容，只需要修改這個檔案 ★
   - 日期格式一律 "YYYY-MM-DD"
   - 時間一律寫「韓國時間 KST」"HH:MM"，網站會自動換算成瀏覽者當地時間
   - verified: false 的資料會在網頁上顯示「待確認」標籤
   ========================================================= */
/* kpopping 圖片網址縮寫：kp("2026/11/xxx.jpg") → 完整網址 */
const kp = (p) => "https://cdn.kpopping.com/kpics/" + p;
const kpPost = (slug) => "https://kpopping.com/kpics/" + slug;

window.YENA_DATA = {
  meta: {
    siteName: "YENA FANS",
    updated: "2026-11-23",
    disclaimer: "本站為粉絲自製之非官方網站，與 YENA 本人及所屬公司無任何關係。所有資訊以官方公告為準。",
    repo: "mintguesss/yena-fansite", // 粉絲投稿（GitHub Issues）用
  },

  /* ---------------- 跑馬燈 ---------------- */
  ticker: [
    "🏆 2026 MAMA AWARDS Best Dance Performance Female Solo〈Catch Catch〉",
    "🇹🇼 12/5–6 AAA 2026 高雄國家體育場 YENA 出演！",
    "🍒 J-POP REMAKE〈사쿠란보 Sakuranbo〉11/17 發行！",
    "🏆 2026 MMA 獲頒 Best Solo Female",
    "📅 2027 SEASON'S GREETINGS [YENA'S STAR EXPRESS] 預購中",
    "🎉 2027/1/17 是 YENA solo 出道 5 週年",
  ],

  /* ---------------- 基本資料 ---------------- */
  profile: {
    nameKo: "최예나",
    nameEn: "Choi Ye-na",
    stageName: "YENA",
    nameZh: "崔叡娜",
    birth: "1999-09-29",
    birthplace: "韓國 首爾 江東區",
    school: "韓林藝術高中（Hanlim Multi Art School）",
    agency: "YH Entertainment（樂華娛樂韓國）",
    jpLabel: "Victor Entertainment（日本）",
    occupation: "歌手、演員、綜藝",
    family: "哥哥：崔成珉（Choi Sung-min，演員）",
    izoneDebut: "2018-10-29",
    soloDebut: "2022-01-17",
    fandom: { name: "지구미", roman: "Jigumi", zh: "地球美", meaning: "取自「예나 지금이나（無論何時都一樣）」的諧音——像 YENA 和 Jigumi，從過去到現在、一直到永遠都在一起。2022 年 1 月 17 日 solo 出道當天公布。" },
    color: { name: "Yen-low（예나 옐로）", hex: "#FFD23F", verified: false },
    intro: "YENA 以 Mnet《PRODUCE 48》第 4 名出道成為 IZ*ONE 成員，2021 年團體活動結束後，於 2022 年以首張迷你專輯《SMiLEY》solo 出道。以元氣滿滿的「小鴨」形象、超強綜藝感與充滿個性的流行舞曲著稱，2026 年以〈Catch Catch〉在韓國與中國掀起熱潮，並拿下 2026 MMA Best Solo Female。",
    facts: [
      "招牌表情是嘟起嘴的「鴨子嘴」，小鴨是粉絲圈公認的代表符號 🐥",
      "出道前曾是 Polaris Entertainment 練習生，2017 年擔任 SBS《Cooking Class》主持",
      "小時候曾被診斷出淋巴瘤，後來康復",
      "會彈吉他",
      "綜藝代表作：TVING《女高推理班》第 1–3 季固定班底",
      "2025 年與 BTS Jin 合作〈Loser〉（收錄於 Jin 專輯《Echo》）",
      "2025 年日本單曲〈STAR!〉與初音未來合作",
    ],
    timeline: [
      { date: "2018-06-15", title: "參加 Mnet《PRODUCE 48》", desc: "最終排名第 4 名，確定出道 IZ*ONE。" },
      { date: "2018-10-29", title: "IZ*ONE 出道", desc: "首張迷你專輯《COLOR*IZ》，主打〈La Vie en Rose〉。" },
      { date: "2021-04-29", title: "IZ*ONE 活動結束", desc: "團體合約期滿，成員各自展開新活動。" },
      { date: "2021-08-24", title: "個人網路綜藝《예나의 동물탐정》", desc: "Studio Waffle 製作，YENA 首次單獨主持。" },
      { date: "2022-01-17", title: "Solo 出道《SMiLEY》", desc: "主打〈SMILEY (Feat. BIBI)〉，同日公布粉絲名 지구미。" },
      { date: "2023-08", title: "日本出道", desc: "〈SMILEY〉日文版（Feat. ちゃんみな）。" },
      { date: "2025-07-29", title: "4th Mini《Blooming Wings》", desc: "主打〈착하다는 말이 제일 싫어〉。" },
      { date: "2026-03-11", title: "5th Mini《LOVE CATCHER》", desc: "主打〈Catch Catch〉成為年度話題曲，Spotify 破億、Melon TOP10。" },
      { date: "2026-04", title: "2026 亞洲巡演開跑", desc: "首爾起跑，巡迴澳門、台北、香港、東京至 6 月。" },
      { date: "2026-11-14", title: "2026 MMA Best Solo Female", desc: "於高尺巨蛋獲頒最佳女子 Solo 獎。" },
      { date: "2026-11-21", title: "2026 MAMA AWARDS 獲獎", desc: "於大阪京瓷巨蛋以〈Catch Catch〉獲頒 Best Dance Performance Female Solo。" },
    ],
    /* 英文 / 韓文版（facts、timeline 依上面的順序對應） */
    i18n: {
      en: {
        intro: "YENA finished 4th on Mnet's PRODUCE 48 and debuted as a member of IZ*ONE. After the group's activities ended in 2021, she made her solo debut in 2022 with the mini album SMiLEY. Known for her bubbly 'duck' image, top-tier variety sense and characterful pop-dance tracks, she sparked a craze in Korea and China with 'Catch Catch' in 2026 and won Best Solo Female at the 2026 MMA.",
        birthplace: "Gangdong-gu, Seoul, South Korea", school: "Hanlim Multi Art School", agency: "YH Entertainment", jpLabel: "Victor Entertainment (Japan)",
        occupation: "Singer, actress, entertainer", family: "Older brother: Choi Sung-min (actor)",
        fandomMeaning: "From the wordplay '예나 지금이나' (now as always) — YENA and Jigumi together from the past, to now, to forever. Announced on her solo debut day, January 17, 2022.",
        colorName: "Yen-low (Yena Yellow)",
        facts: ["Her signature pout — the 'duck face' — made the duckling the fandom's symbol 🐥", "Former Polaris Entertainment trainee; hosted SBS 'Cooking Class' in 2017", "Was diagnosed with lymphoma as a child and recovered", "Plays the guitar", "Variety highlight: cast member of TVING 'Girls' High School Mystery Class' seasons 1–3", "Featured on BTS Jin's 'Loser' (album 'Echo', 2025)", "2025 Japanese single 'STAR!' with Hatsune Miku"],
        timeline: [["Joins Mnet PRODUCE 48", "Finished 4th and debuted in IZ*ONE."], ["IZ*ONE debut", "First mini album COLOR*IZ, title track 'La Vie en Rose'."], ["IZ*ONE activities end", "Group contract expired; members began new chapters."], ["Web show 'Yena's Animal Detective'", "Produced by Studio Waffle — her first solo hosting gig."], ["Solo debut with SMiLEY", "Title track 'SMILEY (Feat. BIBI)'; fandom name Jigumi announced the same day."], ["Japanese debut", "'SMILEY' Japanese ver. (Feat. Chanmina)."], ["4th mini 'Blooming Wings'", "Title track 'Being a Good Girl Hurts'."], ["5th mini 'LOVE CATCHER'", "'Catch Catch' became a song of the year: 100M+ Spotify streams, Melon TOP 10."], ["2026 Asia tour begins", "Kicked off in Seoul, touring Macau, Taipei, Hong Kong and Tokyo through June."], ["2026 MMA Best Solo Female", "Won Best Female Solo at Gocheok Sky Dome."], ["2026 MAMA AWARDS win", "Won Best Dance Performance Female Solo for 'Catch Catch' at Kyocera Dome Osaka."]],
      },
      ko: {
        intro: "YENA는 Mnet 《PRODUCE 48》 최종 4위로 IZ*ONE 멤버로 데뷔했고, 2021년 그룹 활동 종료 후 2022년 첫 미니앨범 《SMiLEY》로 솔로 데뷔했다. 상큼한 '오리' 이미지와 뛰어난 예능감, 개성 있는 댄스 팝으로 사랑받으며 2026년 '캐치 캐치'로 한국과 중국에서 신드롬을 일으켰고 2026 MMA 베스트 여자 솔로상을 받았다.",
        birthplace: "대한민국 서울 강동구", school: "한림연예예술고등학교", agency: "위에화 엔터테인먼트 (YH)", jpLabel: "Victor Entertainment (일본)",
        occupation: "가수, 배우, 방송인", family: "오빠: 최성민 (배우)",
        fandomMeaning: "'예나 지금이나'에서 따온 이름 — 예나와 지구미는 예전에도, 지금도, 앞으로도 함께라는 뜻. 2022년 1월 17일 솔로 데뷔일에 공개.",
        colorName: "옌로우 (예나 옐로)",
        facts: ["트레이드마크인 오리 입술 덕분에 '오리'가 팬덤의 상징 🐥", "폴라리스 엔터테인먼트 연습생 출신, 2017년 SBS 《쿠킹클래스》 진행", "어린 시절 림프종 진단을 받았지만 완치", "기타 연주 가능", "대표 예능: TVING 《여고추리반》 시즌 1–3 고정", "2025년 BTS 진의 'Loser' 피처링 (앨범 《Echo》)", "2025년 일본 싱글 'STAR!'에서 하츠네 미쿠와 협업"],
        timeline: [["Mnet 《PRODUCE 48》 출연", "최종 4위로 IZ*ONE 데뷔 확정."], ["IZ*ONE 데뷔", "첫 미니앨범 《COLOR*IZ》, 타이틀곡 '라비앙로즈'."], ["IZ*ONE 활동 종료", "계약 만료 후 멤버들 각자 새 출발."], ["개인 웹예능 《예나의 동물탐정》", "스튜디오 와플 제작, 첫 단독 진행."], ["《SMiLEY》로 솔로 데뷔", "타이틀곡 'SMILEY (Feat. BIBI)', 같은 날 팬덤명 지구미 발표."], ["일본 데뷔", "'SMILEY' 일본어 버전 (Feat. ちゃんみな)."], ["4th 미니 《Blooming Wings》", "타이틀곡 '착하다는 말이 제일 싫어'."], ["5th 미니 《LOVE CATCHER》", "'캐치 캐치' 올해의 히트곡: 스포티파이 1억 스트리밍, 멜론 TOP 10."], ["2026 아시아 투어 시작", "서울을 시작으로 마카오·타이베이·홍콩·도쿄까지 6월까지."], ["2026 MMA 베스트 여자 솔로", "고척스카이돔에서 수상."], ["2026 MAMA AWARDS 수상", "교세라 돔 오사카에서 '캐치 캐치'로 베스트 댄스 퍼포먼스 여자 솔로 수상."]],
      },
    },
  },

  /* ---------------- 作品 Discography ----------------
     type: mini | single | digital | japan | collab
     colors: 封面漸層兩色（沒有官方圖時的替代封面）
     youtubeId: 選填，填入 YouTube 影片 ID 就會直接嵌入 MV          */
  releases: [
    { title: "사쿠란보 (Sakuranbo)", type: "digital", date: "2026-11-17", titleTrack: "사쿠란보", note: "J-POP REMAKE 企劃，翻唱大塚愛 2003 年名曲，MV 邀請日本女團 CUTIE STREET 客串。", colors: ["#ff4f7b", "#ffb3c7"], emoji: "🍒", tracks: ["사쿠란보"] },
    { title: "보기 드문 여자 (Dime Girl)", type: "digital", date: "2026-10-02", titleTrack: "보기 드문 여자 (Feat. 나우아임영)", note: "首張數位單曲。", colors: ["#3a3a3a", "#d4af37"], emoji: "💎", tracks: ["보기 드문 여자 (Feat. 나우아임영)"] },
    { title: "Mirror Mirror", type: "japan", date: "2026-06-10", titleTrack: "Mirror Mirror（ミラミラ）", note: "日本單曲，發行日期待確認。", colors: ["#9be7ff", "#e0c3ff"], emoji: "🪞", tracks: ["Mirror Mirror"], verified: false },
    { title: "LOVE CATCHER", type: "mini", date: "2026-03-11", titleTrack: "Catch Catch (캐치 캐치)", note: "第 5 張迷你專輯。〈Catch Catch〉Spotify 破 1 億、Bilibili MV 為 2026 年 K-pop 最高觀看、Melon TOP100 最高第 8 名。", colors: ["#ff6fae", "#ffd23f"], emoji: "💘", tracks: ["Catch Catch (캐치 캐치)", "봄이라서 (Feat. 딘딘, 정형돈)", "Sticker (Feat. MRCH)", "Question Marks (Feat. 폴킴)"] },
    { title: "NEMONEMO (Japanese ver.)", type: "japan", date: "2026-01-21", titleTrack: "NEMONEMO -Japanese ver.-", colors: ["#7cc8ff", "#ffe680"], emoji: "🟦", tracks: ["NEMONEMO -Japanese ver.-"] },
    { title: "STAR!", type: "japan", date: "2025-11-26", titleTrack: "STAR! (Feat. 初音ミク)", note: "Victor Entertainment 發行，與初音未來合作。", colors: ["#39c5bb", "#ffd23f"], emoji: "⭐", tracks: ["STAR! (Feat. 初音ミク)"] },
    { title: "Blooming Wings", type: "mini", date: "2025-07-29", titleTrack: "착하다는 말이 제일 싫어 (Being a Good Girl Hurts)", note: "第 4 張迷你專輯，另有中文版。", colors: ["#a8e6cf", "#ffd3b6"], emoji: "🦋", tracks: ["착하다는 말이 제일 싫어"] },
    { title: "Loser (with Jin)", type: "collab", date: "2025-05-16", titleTrack: "Loser (Feat. YENA)", note: "收錄於 BTS Jin 個人專輯《Echo》。", colors: ["#4a4e69", "#c9ada7"], emoji: "🎸", tracks: ["Loser"] },
    { title: "NEMONEMO", type: "single", date: "2024-09-30", titleTrack: "네모네모 (NEMONEMO)", note: "單曲專輯。", colors: ["#7cc8ff", "#ffd23f"], emoji: "🟨", tracks: ["네모네모"] },
    { title: "DNA", type: "japan", date: "2024-02-07", titleTrack: "DNA", note: "日本第 2 張單曲。", colors: ["#ff9a9e", "#fad0c4"], emoji: "🧬", tracks: ["DNA"] },
    { title: "GOOD MORNING", type: "mini", date: "2024-01-15", titleTrack: "Good Morning", note: "第 3 張迷你專輯。", colors: ["#ffe259", "#ffa751"], emoji: "☀️", tracks: ["Good Morning"] },
    { title: "SMILEY (Japanese ver.)", type: "japan", date: "2023-08", titleTrack: "SMILEY -Japanese ver.- (Feat. ちゃんみな)", note: "日本出道作（日期以月份為準）。", colors: ["#ffd23f", "#ff7eb6"], emoji: "😊", tracks: ["SMILEY -Japanese ver.-"] },
    { title: "HATE XX", type: "single", date: "2023-06-27", titleTrack: "Hate Rodrigo (Feat. 宋雨琦 of (G)I-DLE)", note: "單曲專輯。", colors: ["#c471f5", "#fa71cd"], emoji: "💜", tracks: ["Hate Rodrigo (Feat. YUQI)"] },
    { title: "Love War", type: "single", date: "2023-01-16", titleTrack: "Love War (Feat. BE'O)", note: "單曲專輯。", colors: ["#ff416c", "#ff4b2b"], emoji: "⚔️", tracks: ["Love War (Feat. BE'O)"] },
    { title: "SMARTPHONE", type: "mini", date: "2022-08-03", titleTrack: "SMARTPHONE", note: "第 2 張迷你專輯。", colors: ["#43cea2", "#185a9d"], emoji: "📱", tracks: ["SMARTPHONE"] },
    { title: "ˣ‿ˣ (SMiLEY)", type: "mini", date: "2022-01-17", titleTrack: "SMILEY (Feat. BIBI)", note: "Solo 出道迷你專輯。", colors: ["#ffd23f", "#ff9f43"], emoji: "😆", tracks: ["SMILEY (Feat. BIBI)"] },
  ],

  /* ---------------- 精選影片（填 YouTube ID） ---------------- */
  videos: [
    { id: "to8py-1ZxTY", title: "YENA (최예나) - 사쿠란보 MOOD FILM", date: "2026-11-17" },
  ],

  /* ---------------- 行程 Schedule ----------------
     category: release | show | award | variety | concert | goods | live | etc
     time: 韓國時間（可留空 = 全天）                            */
  schedule: [
    { date: "2026-12-05", time: "", title: "AAA 2026 Asia Artist Awards（12/5–6）", category: "award", place: "台灣 高雄國家體育場", note: "YENA 確定出演，實際出演日以主辦公告為準。門票已全數售完。", link: "https://asiaartistawards.com/" },
    { date: "2026-11-21", time: "", title: "2026 MAMA AWARDS Chapter 2", category: "award", place: "日本 大阪 京瓷巨蛋", note: "以〈Catch Catch〉獲頒 Best Dance Performance Female Solo。" },
    { date: "2026-11-25", time: "23:59", title: "2027 SEASON'S GREETINGS 預購特典截止（Ktown4u）", category: "goods", place: "線上", link: "https://www.ktown4u.com/", note: "各通路特典期限不同，請以販售頁為準。" },
    { date: "2026-11-17", time: "18:00", title: "J-POP REMAKE〈사쿠란보〉發行", category: "release", place: "各大音源平台", note: "MV 同步公開，日本女團 CUTIE STREET 客串。" },
    { date: "2026-11-14", time: "", title: "2026 Melon Music Awards（MMA）", category: "award", place: "首爾 高尺巨蛋", note: "出席紅毯與表演，獲頒 Best Solo Female。" },
    { date: "2026-11-08", time: "23:59", title: "MAMA 粉絲投票第 2 輪截止", category: "etc", place: "線上", note: "依官方帳號公告。" },
    { date: "2026-11-07", time: "", title: "2026 Korea Grand Music Awards（KGMA）Day 1", category: "award", place: "韓國", note: "11/7–8 兩天，出席日依官方公告。" },
    { date: "2026-11-08", time: "", title: "2026 Korea Grand Music Awards（KGMA）Day 2", category: "award", place: "韓國" },
    { date: "2026-10-20", time: "", title: "公開 J-POP REMAKE 企劃〈사쿠란보〉預告", category: "etc", place: "線上" },
    { date: "2026-10-18", time: "", title: "出演《성시경의 고막남친》", category: "variety", place: "YouTube" },
    { date: "2026-10-02", time: "18:00", title: "數位單曲〈보기 드문 여자 (Dime Girl)〉發行", category: "release", place: "各大音源平台" },
    { date: "2026-09-21", time: "", title: "2026 The Fact Music Awards（TMA）", category: "award", place: "韓國", note: "獲頒 Artist of the Year。" },
    { date: "2026-08-27", time: "", title: "2026 K-World Dream Awards", category: "award", place: "韓國", note: "以〈Catch Catch〉獲 K-World Dream Best Song。" },
    { date: "2026-03-11", time: "18:00", title: "5th Mini《LOVE CATCHER》發行", category: "release", place: "各大音源平台" },
  ],

  /* 每年自動出現在行程表的紀念日（月-日） */
  anniversaries: [
    { md: "09-29", title: "🎂 YENA 生日", since: 1999, unit: "歲生日" },
    { md: "01-17", title: "🎉 Solo 出道紀念日 & 지구미 誕生日", since: 2022, unit: "週年" },
    { md: "10-29", title: "🌹 IZ*ONE 出道紀念日", since: 2018, unit: "週年" },
  ],

  /* ---------------- 最新消息 News ---------------- */
  news: [
    { date: "2026-11-21", title: "2026 MAMA AWARDS 獲頒 Best Dance Performance Female Solo", summary: "在大阪京瓷巨蛋舉行的 MAMA 第二天，以〈Catch Catch〉拿下女子 Solo 最佳舞蹈表演獎，繼 TMA、MMA 後再添一座年末大獎。", tags: ["獎項"], source: "Herald Economy", url: "https://biz.heraldcorp.com/article/10944842" },
    { date: "2026-08-11", title: "確定出演 AAA 2026 高雄場", summary: "主辦單位公布 YENA 加入 AAA 2026 陣容，12/5–6 在高雄國家體育場舉行，10 萬席門票開賣 10 分鐘售罄。", tags: ["演出", "台灣"], source: "OSEN", url: "https://www.osen.co.kr/article/G1112854892" },
    { date: "2026-11-18", title: "〈사쿠란보〉MV 公開，日本女團 CUTIE STREET 驚喜客串", summary: "YENA 在 MV 中化身漢堡店店員，與 CUTIE STREET 一起帶來超可愛舞台。", tags: ["MV", "發行"], source: "Sports Kyunghyang", url: "https://sports.khan.co.kr/en/article/202611181206007" },
    { date: "2026-11-17", title: "J-POP REMAKE〈사쿠란보〉今晚 6 點發行", summary: "翻唱大塚愛經典名曲，韓文歌詞由 이세란、임성현、누비 參與。", tags: ["發行"], source: "Sports Kyunghyang", url: "https://sports.khan.co.kr/en/article/202611170851007" },
    { date: "2026-11-15", title: "2026 MMA 獲頒 Best Solo Female", summary: "於高尺巨蛋出席紅毯並表演，穿著紅色愛心禮服亮相，奪下最佳女子 Solo 獎。", tags: ["獎項"], source: "TopStarNews", url: "https://global.topstarnews.net/en/articleView.html?idxno=16277152" },
    { date: "2026-10-27", title: "確定參與韓國版〈사쿠란보〉翻唱", summary: "成為 J-POP REMAKE 企劃的下一棒，接續 Roy Kim。", tags: ["預告"], source: "Sports Kyunghyang", url: "https://sports.khan.co.kr/en/article/202610271959007" },
    { date: "2026-10-18", title: "出演《성시경의 고막남친》", summary: "在成始璄的 YouTube 節目中展現清新歌聲與好口才。", tags: ["綜藝"], source: "Sports Kyunghyang", url: "https://sports.khan.co.kr/en/article/202610181518007" },
    { date: "2026-10-02", title: "數位單曲〈보기 드문 여자〉發行", summary: "Feat. 나우아임영，YENA 首張數位單曲。", tags: ["發行"], source: "Sports Kyunghyang", url: "https://sports.khan.co.kr/en/article/202610021511007" },
    { date: "2026-09-21", title: "2026 TMA 拿下 Artist of the Year", summary: "在 The Fact Music Awards 獲得年度藝人大獎。", tags: ["獎項"], source: "Sports Kyunghyang", url: "https://sports.khan.co.kr/en/article/202609211043007" },
    { date: "2026-09-02", title: "獲 2026 Brand of the Year 女子 Solo 歌手部門", summary: "", tags: ["獎項"], source: "Sports Kyunghyang", url: "https://sports.khan.co.kr/en/article/202609021117017" },
    { date: "2026-05-06", title: "〈Catch Catch〉Bilibili MV 突破 517 萬觀看", summary: "在中國短影音平台掀起復古舞熱潮。", tags: ["紀錄"], source: "Sports Kyunghyang", url: "https://sports.khan.co.kr/en/article/202605061403007" },
    { date: "2026-04-24", title: "Korea Times 專題：〈Catch Catch〉症候群", summary: "分析 YENA 在團體主導的 K-pop 市場中的 solo 生存策略。", tags: ["專題"], source: "The Korea Times", url: "https://www.koreatimes.co.kr/entertainment/k-pop/20260424/catch-catch-syndrome-yena-core-suggest-new-survival-strategy-in-group-dominated-k-pop-scene" },
    { date: "2026-03-04", title: "宣布 2026 亞洲巡演", summary: "4 月首爾開跑，巡迴澳門、台北、香港、東京至 6 月。", tags: ["演唱會"], source: "Star News Korea", url: "https://www.starnewskorea.com/en/music/2026/03/04/2026030407011516019" },
    { date: "2026-02-23", title: "睽違 8 個月回歸！5th Mini《LOVE CATCHER》3/11 發行", summary: "主打〈Catch Catch〉，2/24 起依序公開概念照、曲目表、Highlight Medley 與 MV 預告。", tags: ["回歸"], source: "Sports Kyunghyang", url: "https://sports.khan.co.kr/en/article/202602231805007" },
  ],

  /* ---------------- 周邊 Goods ----------------
     status: preorder | onsale | soldout | ended | upcoming          */
  goods: [
    { name: "2027 SEASON'S GREETINGS [YENA'S STAR EXPRESS]", type: "年曆", emoji: "🚂", keywords: ["STAR_EXPRESS", "STAR EXPRESS", "SEASONSGREETING"], status: "preorder", release: "", preorderEnd: "2026-11-25", note: "與 YECHUNPAL 合作；ID CLIP 已公開。各通路預購特典不同。", stores: [{ name: "Ktown4u", url: "https://www.ktown4u.com/" }] },
    { name: "5th Mini Album《LOVE CATCHER》", type: "專輯", emoji: "💘", status: "onsale", release: "2026-03-11", note: "多版本，購買前請確認版本與特典。", stores: [{ name: "Ktown4u", url: "https://www.ktown4u.com/" }] },
    { name: "4th Mini Album《Blooming Wings》", type: "專輯", emoji: "🦋", status: "onsale", release: "2025-07-29", note: "", stores: [{ name: "Ktown4u", url: "https://www.ktown4u.com/" }] },
    { name: "2025 SEASON'S GREETINGS [CHECK-IN WITH YENA HOTEL]", type: "年曆", emoji: "🏨", status: "ended", release: "2024-12-01", note: "已過販售期，可留意二手平台（小心盜版）。", stores: [{ name: "Everline Shop", url: "https://everlineshop.com/" }] },
  ],

  /* ---------------- 社群媒體 ----------------
     verified: true = 已由新聞或官方連結確認；false = 待確認         */
  socials: [
    { platform: "x", name: "X (Twitter)", handle: "@YENA_OFFICIAL", url: "https://x.com/YENA_OFFICIAL", desc: "官方公告、行程、自拍更新最快", verified: true },
    { platform: "instagram", name: "Instagram", handle: "@yena.jigumina", url: "https://www.instagram.com/yena.jigumina/", desc: "本人日常、穿搭、Reels", verified: false },
    { platform: "youtube", name: "YouTube", handle: "@YENA_OFFICIAL", url: "https://www.youtube.com/@YENA_OFFICIAL", desc: "MV、Vlog、幕後花絮（訂閱破百萬）", verified: true },
    { platform: "tiktok", name: "TikTok", handle: "YENA", url: "https://www.tiktok.com/search?q=YENA%20%EC%B5%9C%EC%98%88%EB%82%98", desc: "舞蹈挑戰、短影音", verified: false },
    { platform: "weibo", name: "微博", handle: "崔叡娜", url: "https://s.weibo.com/weibo?q=%E5%B4%94%E5%8F%A1%E5%A8%9C", desc: "中文圈公告", verified: false },
    { platform: "bilibili", name: "Bilibili", handle: "崔叡娜 YENA", url: "https://search.bilibili.com/all?keyword=%E5%B4%94%E5%8F%A1%E5%A8%9C", desc: "〈Catch Catch〉MV 破 500 萬", verified: false },
  ],

  /* 最新動態（手動整理；點擊會開啟原文） */
  feed: [
    { platform: "youtube", date: "2026-11-17", text: "〈사쿠란보〉MOOD FILM 公開 🍒", url: "https://www.youtube.com/watch?v=to8py-1ZxTY" },
    { platform: "instagram", date: "2026-11-15", text: "分享 MMA 紅色愛心禮服照片 ❤️", url: "https://global.topstarnews.net/en/articleView.html?idxno=16277152" },
  ],

  /* ---------------- 獎項 ---------------- */
  awards: [
    { date: "2026-11-21", event: "2026 MAMA AWARDS", award: "Best Dance Performance Female Solo", work: "Catch Catch" },
    { date: "2026-11-14", event: "2026 Melon Music Awards", award: "Best Solo Female", work: "" },
    { date: "2026-09-21", event: "2026 The Fact Music Awards", award: "Artist of the Year", work: "" },
    { date: "2026-09-02", event: "2026 Brand of the Year Awards", award: "女子 Solo 歌手部門", work: "" },
    { date: "2026-08-27", event: "2026 K-World Dream Awards", award: "K-World Dream Best Song", work: "Catch Catch" },
  ],

  /* ---------------- 成績紀錄（排行榜、串流等；音樂節目一位與獎項會自動抓取） ---------------- */
  records: [
    { date: "2026-05-06", title: "〈Catch Catch〉Bilibili MV 突破 517 萬觀看", detail: "2026 年 K-pop MV 在 Bilibili 的最高觀看紀錄之一。", source: "Sports Kyunghyang", url: "https://sports.khan.co.kr/en/article/202605061403007" },
    { date: "2026-04-24", title: "〈Catch Catch〉Spotify 串流突破 1 億", detail: "Melon TOP100 最高第 8 名，掀起「Catch Catch 症候群」。", source: "The Korea Times", url: "https://www.koreatimes.co.kr/entertainment/k-pop/20260424/catch-catch-syndrome-yena-core-suggest-new-survival-strategy-in-group-dominated-k-pop-scene" },
    { date: "2026-08-11", title: "AAA 2026 高雄場 10 萬席 10 分鐘售罄", detail: "YENA 名列出演陣容。", source: "OSEN", url: "https://www.osen.co.kr/article/G1112854892" },
  ],

  /* ---------------- 應援活動（生日咖啡廳、應援廣告等）----------------
     粉絲也可以透過網站上的「投稿」按鈕送出，審核通過（GitHub Issue 加上 approved 標籤）後會自動出現
     { date, end, title, kind, place, host, note, link, image }                              */
  fanEvents: [],

  /* ---------------- 綜藝 / 戲劇 ---------------- */
  appearances: [
    { year: "2026", title: "《My Remaining Love》（暫名）", type: "綜藝", role: "固定班底" },
    { year: "2025", title: "《Villains Everywhere》", type: "戲劇", role: "具元熙（家庭情境劇）" },
    { year: "2023", title: "《Girls Night Out》", type: "綜藝", role: "主持" },
    { year: "2023", title: "《M Countdown》", type: "音樂節目", role: "特別 MC" },
    { year: "2023", title: "《Webtoon Singer》", type: "綜藝", role: "評審團" },
    { year: "2022", title: "《Idol Radio Season 2》", type: "電台", role: "代班 DJ（6/23–7/30）" },
    { year: "2022", title: "《The Door: To Wonderland 2》", type: "綜藝", role: "固定" },
    { year: "2022", title: "《Fantastic Family》", type: "綜藝", role: "評審團" },
    { year: "2021–2024", title: "TVING《女高推理班》第 1–3 季", type: "網路綜藝", role: "固定班底" },
    { year: "2021–2022", title: "《Idol Dictation Contest》", type: "綜藝", role: "固定" },
    { year: "2021", title: "《예나의 동물탐정》", type: "網路綜藝", role: "單獨主持" },
    { year: "2021", title: "《Game of Blood》", type: "綜藝", role: "MC" },
    { year: "2021", title: "《The World of My 17》Season 2", type: "網路劇", role: "吳娜莉（演員出道）" },
    { year: "2019", title: "《Prison Life of Fools》", type: "綜藝", role: "固定" },
    { year: "2018", title: "Mnet《PRODUCE 48》", type: "選秀", role: "練習生（最終第 4 名）" },
  ],

  /* ---------------- 新手入坑推薦歌單 ---------------- */
  starter: [
    { song: "SMILEY (Feat. BIBI)", why: "Solo 出道曲，一聽就知道什麼是「YENA 式元氣」" },
    { song: "Catch Catch", why: "2026 年代表作，復古舞曲＋超洗腦副歌" },
    { song: "네모네모 (NEMONEMO)", why: "輕快可愛，舞蹈挑戰必學" },
    { song: "Good Morning", why: "早晨叫醒你的陽光系主打" },
    { song: "착하다는 말이 제일 싫어", why: "展現更成熟一面的 Blooming Wings 主打" },
    { song: "사쿠란보", why: "最新作！韓文版大塚愛名曲" },
  ],

  /* ---------------- 小測驗 ---------------- */
  quiz: [
    { q: "YENA 的生日是哪一天？", options: ["1月17日", "9月29日", "10月29日", "3月11日"], answer: 1, explain: "1999 年 9 月 29 日出生於首爾。" },
    { q: "YENA 在《PRODUCE 48》的最終排名是？", options: ["第 1 名", "第 2 名", "第 4 名", "第 7 名"], answer: 2, explain: "以第 4 名出道 IZ*ONE。" },
    { q: "YENA 的粉絲名是？", options: ["지구미 Jigumi", "SMiLEY", "WIZ*ONE", "Duckies"], answer: 0, explain: "取自「예나 지금이나」的諧音。WIZ*ONE 是 IZ*ONE 的粉絲名。" },
    { q: "Solo 出道曲〈SMILEY〉的合作歌手是？", options: ["BE'O", "BIBI", "YUQI", "Paul Kim"], answer: 1, explain: "SMILEY (Feat. BIBI)。" },
    { q: "2026 年第 5 張迷你專輯《LOVE CATCHER》的主打是？", options: ["Love War", "Good Morning", "Catch Catch", "NEMONEMO"], answer: 2, explain: "〈Catch Catch〉在 Spotify 突破一億串流。" },
    { q: "日本單曲〈STAR!〉和誰合作？", options: ["ちゃんみな", "初音ミク", "CUTIE STREET", "大塚愛"], answer: 1, explain: "2025/11/26 發行，與初音未來合作。" },
    { q: "IZ*ONE 的出道曲是？", options: ["La Vie en Rose", "Violeta", "FIESTA", "Panorama"], answer: 0, explain: "2018/10/29 以〈La Vie en Rose〉出道。" },
    { q: "YENA 在 2026 MMA 獲得什麼獎？", options: ["年度專輯", "Best Solo Female", "新人獎", "最佳舞蹈"], answer: 1, explain: "2026/11/14 於高尺巨蛋獲頒。" },
    { q: "〈사쿠란보〉翻唱自哪位日本歌手？", options: ["宇多田光", "大塚愛", "YOASOBI", "米津玄師"], answer: 1, explain: "大塚愛 2003 年代表作。" },
    { q: "YENA 的哥哥是哪一位？", options: ["崔成珉", "崔宇植", "崔珉豪", "崔始源"], answer: 0, explain: "哥哥崔成珉是演員。" },
  ],

  /* ---------------- 粉絲用語 ---------------- */
  glossary: [
    { term: "지구미 (Jigumi)", desc: "YENA 的官方粉絲名。" },
    { term: "오리 / 小鴨", desc: "YENA 的招牌鴨子嘴，粉絲圈代表符號 🐥" },
    { term: "컴백 (回歸)", desc: "發行新作品並展開宣傳期。" },
    { term: "음방 (音放)", desc: "音樂節目，如 M Countdown、Music Bank、Show! Music Core、人氣歌謠。" },
    { term: "1위 (一位)", desc: "在音樂節目拿下當週第一名。" },
    { term: "스밍 (Streaming)", desc: "串流打榜，幫助歌曲衝上音源榜。" },
    { term: "시그 (Season's Greetings)", desc: "年度年曆周邊，通常 11–12 月預購。" },
    { term: "생카 (生日咖啡廳)", desc: "粉絲在生日期間租借咖啡廳布置應援。" },
  ],

  /* ---------------- 相簿 Gallery ----------------
     cat: award（頒獎典禮）| pictorial（畫報）| sns（日常 SNS）| stage（舞台活動）| throwback（經典回顧）
     images 放完整圖片網址；cover 為封面是第幾張（從 0 開始）
     照片版權屬原著作權人，本站以連結方式顯示並標註來源                       */
  gallery: [
    {
      title: "2026 MMA 紅毯＆舞台", date: "2026-11-14", cat: "award", credit: "Melon 官方 X", url: kpPost("261114-melon-twitter-update-with-yena-mma-2026-red-carpet-d1-performance"),
      images: ["2026/11/1794646026421-3vtm77-0.jpg", "2026/11/1794656116873-ymmco4-0.jpg", "2026/11/1794736533937-r43xzd-0.jpg", "2026/11/1794736533937-mig27b-1.jpg", "2026/11/1794736533937-m3vw61-2.jpg", "2026/11/1794736533937-bdlzfb-3.jpg", "2026/11/1794736533937-s2fnl7-4.jpg", "2026/11/1794736533937-s5ti03-5.jpg", "2026/11/1795022476563-fg5gb2-0.jpg", "2026/11/1794549632550-aq5fm4-0.jpg", "2026/11/1793707644751-eb5xnp-0.jpg"].map(kp),
    },
    {
      title: "MMA 後台 IG 更新", date: "2026-11-15", cat: "sns", credit: "YENA Instagram", url: kpPost("261115-choi-yena-instagram-update"),
      images: ["2026/11/1794732195735-j43tba-0.jpg", "2026/11/1794732195735-o9ruhx-1.jpg", "2026/11/1794732195735-4uuh6p-2.jpg", "2026/11/1794732195735-sn4q36-3.jpg", "2026/11/1794732195735-xs7v78-4.jpg", "2026/11/1794732195735-962lkk-5.jpg", "2026/11/1794732195735-n6qerr-6.jpg", "2026/11/1794732195735-98czy7-7.jpg", "2026/11/1794677069630-y2nmcr-0.jpg", "2026/11/1794677069630-a0pqui-1.jpg", "2026/11/1794677069630-ijd75g-2.jpg", "2026/11/1794677069630-ws5632-3.jpg"].map(kp),
    },
    {
      title: "11/18 Instagram 更新", date: "2026-11-18", cat: "sns", credit: "YENA Instagram", url: kpPost("261118-yena-instagram-update"),
      images: ["2026/11/1795024544423-llvhpa-0.jpg", "2026/11/1795024544423-9hls9o-1.jpg", "2026/11/1795024544423-p34m7k-2.jpg", "2026/11/1795024544423-4h4w4g-3.jpg", "2026/11/1795024544423-mlk009-4.jpg", "2026/11/1795024544423-9ribt0-5.jpg", "2026/11/1795024544423-998jmp-6.jpg", "2026/11/1795024544423-48oglh-7.jpg"].map(kp),
    },
    {
      title: "KGMA 2026 紅毯", date: "2026-11-08", cat: "award", credit: "媒體", url: kpPost("261108-yena-red-carpet-at-2026-korea-grand-music-awards-music-day"),
      images: ["2026/11/1794157140670-x2bbet-0.jpg"].map(kp),
    },
    {
      title: "Allure Korea 2026 年 11 月號 × Fingersuit", date: "2026-10", cat: "pictorial", credit: "Allure Korea", url: kpPost("yena-x-fingersuit-for-allure-korea-november-2026-issue"),
      images: ["2026/10/1793398576934-n7apu7-0.jpg", "2026/10/1793398576934-n97rsa-1.jpg", "2026/10/1793398576934-3z683p-2.jpg", "2026/10/1793398576934-nk6emo-3.jpg", "2026/10/1793398576934-9mq880-4.jpg", "2026/10/1793398576934-vor4o9-5.jpg"].map(kp),
    },
    {
      title: "10 月 X 自拍更新", date: "2026-10-28", cat: "sns", credit: "YENA 官方 X", url: kpPost("261028-yena-twitter-update"),
      images: ["2026/10/1793288289149-go1vtl-0.jpg", "2026/10/1793288289149-1mwhgn-1.jpg", "2026/10/1793040292334-qmba7y-0.jpg", "2026/10/1792500368895-wrn5rm-0.jpg"].map(kp),
    },
    {
      title: "TMA 2026 官方照", date: "2026-10-15", cat: "award", credit: "The Fact Music Awards", url: kpPost("261015-the-fact-music-awards-instagram-update-with-yena"),
      images: ["2026/09/1789806319818-oqpp4h-0.jpg", "2026/09/1789806319818-x3stee-1.jpg", "2026/10/1792102157013-ggasst-0.webp", "2026/10/1792102157014-nv1apx-1.webp", "2026/10/1792102157014-j7j83o-2.webp", "2026/10/1792102157014-iu0zf5-3.webp", "2026/10/1792102157014-qxmzvz-4.webp", "2026/10/1792102157014-qc6e2u-5.webp", "2026/10/1792102157014-is3udv-6.webp", "2026/10/1792102157014-ld2q41-7.webp"].map(kp),
    },
    {
      title: "Dime Girl 回歸期 IG", date: "2026-10-09", cat: "sns", credit: "YENA Instagram", url: kpPost("261009-yena-instagram-update"),
      images: ["2026/10/1791765097193-2crv9n-0.jpg", "2026/10/1791765097193-2esm02-1.jpg", "2026/10/1791765097193-5gf658-2.jpg", "2026/10/1791765097193-jej1eo-3.jpg", "2026/10/1791765097193-cg03g9-4.jpg", "2026/10/1791765097193-lh8dih-5.jpg", "2026/10/1791765097193-yv7r0y-6.jpg", "2026/10/1791765097193-bf1n33-7.jpg", "2026/10/1791497501110-vpj31a-0.webp", "2026/10/1791497501110-l1159m-1.webp", "2026/10/1791497501110-7eilfa-2.webp"].map(kp),
    },
    {
      title: "與 나우아임영 合照", date: "2026-10-04", cat: "sns", credit: "YENA Instagram", url: kpPost("261004-yena-instagram-update-w-nowimyoung"),
      images: ["2026/10/1791153611404-6vfb5o-0.webp", "2026/10/1791153611404-4k7jhl-1.webp", "2026/10/1791153611404-wg2u07-2.webp"].map(kp),
    },
    {
      title: "🎂 9/29 生日 IG 更新", date: "2026-09-29", cat: "sns", credit: "YENA Instagram", url: kpPost("260929-yena-instagram-update"),
      images: ["2026/10/1791764899787-7w8ska-0.jpg", "2026/10/1791764899787-kdxxfs-1.jpg", "2026/10/1791764899787-eswnx0-2.jpg", "2026/10/1791764899787-zgq88g-3.jpg", "2026/10/1791764899787-9yvxyl-4.jpg", "2026/10/1791764899787-1axec3-5.jpg"].map(kp),
    },
    {
      title: "朝鮮大學校慶", date: "2026-09-14", cat: "stage", credit: "粉絲站 / 媒體", url: kpPost("260914-yena-at-chosun-university-festival"),
      images: ["2026/09/1789398709863-vky110-0.jpg", "2026/09/1789398709863-25bwy0-1.jpg", "2026/09/1789398709863-v4k8ea-2.jpg", "2026/09/1789398709863-tj8id2-3.jpg", "2026/09/1789398709863-sv9y3a-4.jpg", "2026/09/1789398709863-9wwkyu-5.jpg", "2026/09/1789398709863-2pq6yx-6.jpg"].map(kp),
    },
    {
      title: "💗 與權恩妃同台（IZ*ONE 重逢）", date: "2026-09-14", cat: "stage", credit: "粉絲站 / 媒體", url: kpPost("260914-yena-and-kwon-eunbi-at-chosun-university-festival"),
      images: ["2026/09/1789398698776-ewsej6-0.jpg", "2026/09/1789398698776-gxtaiw-1.jpg", "2026/09/1789398698776-5ebkhh-2.jpg"].map(kp),
    },
    {
      title: "9 月大學校慶巡演", date: "2026-09-10", cat: "stage", credit: "粉絲站 / 媒體", url: kpPost("260910-yena-at-jungbu-university-goyang-campus-festival"),
      images: ["2026/09/1789398894195-slvrvk-0.jpg", "2026/09/1789398894195-k35f72-1.jpg", "2026/09/1789398782589-a8mk2p-0.jpg", "2026/09/1789398782589-3yn517-1.jpg"].map(kp),
    },
    {
      title: "2026 SPOTV K-POP AWARDS", date: "2026-09-06", cat: "award", credit: "媒體", url: kpPost("260906-yena-at-2026-spotv-k-pop-awards"),
      images: ["2026/09/1788807570716-kusrvq-0.jpg", "2026/09/1788807570716-okfl5s-1.jpg", "2026/09/1788807570716-40vee6-2.jpg", "2026/09/1788807570716-8jafhh-3.jpg", "2026/09/1788807570716-weu8cv-4.jpg", "2026/09/1788806835209-wyhy2s-6.jpg", "2026/09/1788806835209-om4wiy-1.png", "2026/09/1788806835209-87vhoe-2.png"].map(kp),
    },
    {
      title: "2026 Brand of the Year Awards", date: "2026-09-01", cat: "award", credit: "媒體", url: kpPost("260901-yena-at-2026-brand-of-the-year-awards"),
      images: ["2026/09/1788267647023-ex2ml8-0.jpg", "2026/09/1788267647024-ogwtdr-1.jpg", "2026/09/1788267647024-bth08k-2.jpg", "2026/09/1788267647024-7n770z-3.jpg", "2026/09/1788267647024-z1617e-4.jpg", "2026/09/1788267647024-rp98bs-5.jpg", "2026/09/1788267647024-jmcn8i-6.jpg", "2026/09/1788267647024-b57x9w-7.jpg"].map(kp),
    },
    {
      title: "《SMARTPHONE》專輯掃圖", date: "2022-08-03", cat: "throwback", credit: "專輯掃圖", url: kpPost("yena-2nd-mini-album-smartphone-scans"),
      images: ["2026/10/1791924421396-x0acy1-0.jpg", "2026/10/1791924421396-bd58wo-1.jpg", "2026/10/1791924421396-59x4c3-2.jpg", "2026/10/1791924421396-l4yub0-3.jpg", "2026/10/1791924421396-zdt9tp-4.jpg", "2026/10/1791924421396-ebw4i1-5.jpg", "2026/10/1791924421396-hcsp9g-6.jpg", "2026/10/1791924421396-456whb-7.jpg"].map(kp),
    },
    {
      title: "《ˣ‿ˣ (SMiLEY)》概念預告", date: "2022-01", cat: "throwback", credit: "YH Entertainment", url: kpPost("yena-smiley-concept-teasers"),
      images: ["2026/09/1788804580091-deaf3n-0.png", "2026/09/1788804580092-y93nbk-1.png", "2026/09/1788804580092-8k1olc-2.png", "2026/09/1788804580092-2r5ap5-3.png", "2026/09/1788804580092-sr55vj-4.png", "2026/09/1788804580092-ij7w5y-5.png"].map(kp),
    },
    {
      title: "PRODUCE 48 時期", date: "2018-08-31", cat: "throwback", credit: "Mnet / 媒體", url: kpPost("180831-yena-at-produce48-finale"),
      images: ["2026/09/1788440806673-ia4jkh-0.jpg", "2026/09/1788440806673-stmc2l-1.jpg", "2026/09/1788483762796-2l121i-0.jpg", "2026/09/1788483762796-e9qxuv-1.jpg", "2026/09/1788483762796-tpvueq-2.jpg", "2026/09/1788483762796-99gzfs-3.jpg", "2026/09/1788483762796-n3nypm-4.jpg", "2026/09/1788483762796-qlvk83-5.jpg"].map(kp),
    },
  ],

  /* 首頁拍立得照片牆（填 gallery 的 [相簿序號, 第幾張]） */
  heroPhotos: [[0, 0], [4, 0], [10, 0]],
  /* 簡介頁大頭照 */
  profilePhoto: [4, 1],

  /* ---------------- 參考資料來源 ---------------- */
  sources: [
    { name: "Wikipedia — Choi Ye-na", url: "https://en.wikipedia.org/wiki/Choi_Ye-na" },
    { name: "Soompi — 粉絲名公布", url: "https://www.soompi.com/article/1508760wpp/choi-ye-na-announces-official-fan-club-name" },
    { name: "Sports Kyunghyang（英文版）", url: "https://sports.khan.co.kr/en/" },
    { name: "Star News Korea（英文版）", url: "https://www.starnewskorea.com/en/" },
    { name: "kpopping — YENA 相簿", url: "https://kpopping.com/kpics?idol=d54377c7-cd98-4f16-92e7-5ec5d5b773b1&idolName=Yena" },
  ],
};
