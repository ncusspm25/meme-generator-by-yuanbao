// ── 中文 → 英文關鍵字 ─────────────────────────────────────────────
const ZH_TO_EN = {
  狗: "dog", 貓: "cat", 柯基: "corgi", 柴犬: "shiba inu",
  貓咪: "cat", 兔子: "rabbit", 熊貓: "panda", 老虎: "tiger",
  程式: "programming", 程式設計: "programming", 寫程式: "coding",
  工程師: "developer", 除蟲: "debugging", 開發: "developer",
  老闆: "boss", 工作: "work", 上班: "office", 加班: "overtime",
  考試: "exam", 讀書: "studying", 學校: "school", 作業: "homework",
  咖啡: "coffee", 睡覺: "sleep", 錢: "money", 失戀: "breakup",
  健身: "gym", 減肥: "diet", 美食: "food",
  星期一: "monday", 週末: "weekend", 星期五: "friday",
  遊戲: "gaming", 手機: "phone", 貓狗: "pets",
};

// ── 關鍵字 → subreddit 對照 ───────────────────────────────────────
const KEYWORD_SUBREDDIT = {
  // 動物
  "dog":         "rarepuppers+dogpics+WhatsWrongWithYourDog",
  "cat":         "cats+Catmemes+catsarefunny",
  "corgi":       "corgi+rarepuppers",
  "shiba inu":   "shiba+rarepuppers",
  "rabbit":      "Rabbits+Bunnies",
  "panda":       "aww",
  "tiger":       "aww",
  "pets":        "aww+rarepuppers+cats",
  // 科技
  "programming": "ProgrammerHumor",
  "coding":      "ProgrammerHumor",
  "developer":   "ProgrammerHumor",
  "debugging":   "ProgrammerHumor",
  "overtime":    "ProgrammerHumor+antiwork",
  // 工作
  "boss":        "antiwork",
  "work":        "antiwork+workmemes",
  "office":      "antiwork",
  // 學校
  "exam":        "college+Students",
  "studying":    "college+Students",
  "school":      "college+Students",
  "homework":    "college+Students",
  // 生活
  "coffee":      "coffee+me_irl",
  "sleep":       "me_irl",
  "monday":      "me_irl+AdviceAnimals",
  "friday":      "me_irl",
  "weekend":     "me_irl",
  "diet":        "dieting+me_irl",
  "gym":         "gymmemes",
  "food":        "foodmemes",
  "money":       "povertyfinance+me_irl",
  "breakup":     "me_irl",
  "gaming":      "gamingmemes+gaming",
  "phone":       "me_irl",
};

function toEnglish(keyword) {
  return ZH_TO_EN[keyword.trim()] || ZH_TO_EN[keyword.toLowerCase().trim()] || keyword;
}

function getSubreddit(keyword) {
  const en = toEnglish(keyword).toLowerCase();
  return KEYWORD_SUBREDDIT[en] || "memes+dankmemes";
}

// ── 抓迷因（meme-api.com，有 CORS 支援） ─────────────────────────
async function fetchMemes(keyword) {
  const subreddit = getSubreddit(keyword);
  const url = `https://meme-api.com/gimme/${subreddit}/20`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`meme-api HTTP ${res.status}`);
  const data = await res.json();
  // 過濾掉 NSFW 和非圖片
  return (data.memes || []).filter(
    (m) => !m.nsfw && !m.spoiler && m.url && /\.(jpg|jpeg|png|gif|webp)/i.test(m.url)
  );
}

// ── fallback：imgflip 熱門模板 ────────────────────────────────────
const FALLBACK = [
  { url: "https://i.imgflip.com/30b1gx.jpg",  title: "Drake" },
  { url: "https://i.imgflip.com/1ur9b0.jpg",  title: "Distracted BF" },
  { url: "https://i.imgflip.com/3lmzyx.jpg",  title: "UNO Draw 25" },
  { url: "https://i.imgflip.com/1bij.jpg",     title: "One Does Not Simply" },
  { url: "https://i.imgflip.com/1jwhww.jpg",  title: "Expanding Brain" },
  { url: "https://i.imgflip.com/2wifvo.jpg",  title: "Unsettled Tom" },
  { url: "https://i.imgflip.com/2kbn1e.jpg",  title: "Surprised Pikachu" },
  { url: "https://i.imgflip.com/wxica.jpg",   title: "This Is Fine" },
  { url: "https://i.imgflip.com/1bgw.jpg",    title: "Futurama Fry" },
  { url: "https://i.imgflip.com/2fm6x.jpg",   title: "Waiting Skeleton" },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── 建立卡片 ──────────────────────────────────────────────────────
function buildCard(imageUrl, title, index, linkUrl) {
  const card = document.createElement("div");
  card.className = "meme-card";

  const wrap = document.createElement("div");
  wrap.className = "meme-image-wrap";

  const img = document.createElement("img");
  img.src = imageUrl;
  img.alt = title;
  img.loading = "lazy";
  wrap.appendChild(img);

  const footer = document.createElement("div");
  footer.className = "meme-footer";

  const name = document.createElement("span");
  name.className = "meme-name";
  name.textContent = `#${index + 1} · ${title}`;
  name.title = title;

  const link = document.createElement("a");
  link.className = "share-btn";
  link.href = linkUrl || imageUrl;
  link.target = "_blank";
  link.rel = "noopener";
  link.textContent = "來源 🔗";

  footer.appendChild(name);
  footer.appendChild(link);
  card.appendChild(wrap);
  card.appendChild(footer);
  return card;
}

// ── 主程式 ────────────────────────────────────────────────────────
async function generateMemes() {
  const input   = document.getElementById("keyword-input");
  const keyword = input.value.trim();

  if (!keyword) {
    input.focus();
    input.style.borderColor = "#e94560";
    setTimeout(() => (input.style.borderColor = ""), 800);
    return;
  }

  const btn   = document.getElementById("generate-btn");
  const load  = document.getElementById("loading");
  const grid  = document.getElementById("meme-grid");
  const info  = document.getElementById("search-info");

  btn.disabled = true;
  load.classList.remove("hidden");
  grid.innerHTML = "";
  info.textContent = "";

  try {
    const memes = await fetchMemes(keyword);
    const en = toEnglish(keyword);
    const sub = getSubreddit(keyword);

    if (memes.length === 0) {
      info.textContent = `找不到「${keyword}」相關迷因，改顯示熱門迷因`;
      shuffle(FALLBACK).slice(0, 10).forEach((m, i) =>
        grid.appendChild(buildCard(m.url, m.title, i, m.url))
      );
    } else {
      const selected = shuffle(memes).slice(0, 10);
      const label = en !== keyword ? `「${keyword}」→ ${en}` : `「${keyword}」`;
      info.textContent = `搜尋 ${label}，找到 ${memes.length} 張，從 r/${sub.replace(/\+/g, ", r/")} 隨機選 ${selected.length} 張`;
      selected.forEach((m, i) =>
        grid.appendChild(buildCard(m.url, m.title, i, m.postLink))
      );
    }
  } catch (err) {
    console.error(err);
    grid.innerHTML = `<p style="color:#e94560;padding:24px">出錯了：${err.message}</p>`;
  } finally {
    load.classList.add("hidden");
    btn.disabled = false;
  }
}

document.getElementById("keyword-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") generateMemes();
});
