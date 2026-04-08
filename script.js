// ── 中文關鍵字翻譯表（補充常見詞） ─────────────────────────────────
const ZH_TO_EN = {
  狗: "dog", 貓: "cat", 柯基: "corgi", 柴犬: "shiba inu",
  貓咪: "cat", 兔子: "rabbit", 熊貓: "panda", 老虎: "tiger",
  程式: "programming", 程式設計: "coding", 寫程式: "coding",
  工程師: "software engineer", 除蟲: "debugging", 開發: "developer",
  老闆: "boss", 工作: "work", 上班: "office", 加班: "overtime",
  考試: "exam", 讀書: "studying", 學校: "school", 作業: "homework",
  咖啡: "coffee", 睡覺: "sleep", 錢: "money", 失戀: "breakup",
  宿醉: "hangover", 健身: "gym", 減肥: "diet", 美食: "food",
  星期一: "monday", 週末: "weekend", 星期五: "friday",
  netflix: "netflix", 遊戲: "gaming", 手機: "phone",
};

function toSearchTerm(keyword) {
  const lower = keyword.toLowerCase().trim();
  return ZH_TO_EN[lower] || ZH_TO_EN[keyword] || keyword;
}

// ── Reddit 搜尋真實迷因 ────────────────────────────────────────────
async function fetchRedditMemes(keyword) {
  const term = toSearchTerm(keyword);
  // 搜尋多個 meme 子版
  const subreddits = "memes+dankmemes+me_irl+AdviceAnimals+funny";
  const url =
    `https://www.reddit.com/r/${subreddits}/search.json` +
    `?q=${encodeURIComponent(term)}&sort=top&t=month&limit=50&restrict_sr=1&type=link`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Reddit HTTP ${res.status}`);
  const data = await res.json();

  const posts = data.data.children
    .map((c) => c.data)
    .filter((p) => isImagePost(p));

  return posts;
}

function isImagePost(post) {
  const url = post.url || "";
  return (
    /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url) ||
    url.startsWith("https://i.redd.it/") ||
    url.startsWith("https://i.imgur.com/")
  );
}

// ── imgflip fallback（關鍵字對不上時） ───────────────────────────
const FALLBACK_TEMPLATES = [
  { url: "https://i.imgflip.com/30b1gx.jpg",  name: "Drake" },
  { url: "https://i.imgflip.com/1ur9b0.jpg",  name: "Distracted BF" },
  { url: "https://i.imgflip.com/3lmzyx.jpg",  name: "UNO Draw 25" },
  { url: "https://i.imgflip.com/1bij.jpg",     name: "One Does Not Simply" },
  { url: "https://i.imgflip.com/1jwhww.jpg",  name: "Expanding Brain" },
  { url: "https://i.imgflip.com/2wifvo.jpg",  name: "Unsettled Tom" },
  { url: "https://i.imgflip.com/2kbn1e.jpg",  name: "Surprised Pikachu" },
  { url: "https://i.imgflip.com/wxica.jpg",   name: "This Is Fine" },
  { url: "https://i.imgflip.com/1bgw.jpg",    name: "Futurama Fry" },
  { url: "https://i.imgflip.com/2fm6x.jpg",   name: "Waiting Skeleton" },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── 建立迷因卡片 ──────────────────────────────────────────────────
function buildCard(imageUrl, title, index, sourceUrl) {
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
  name.textContent = `#${index + 1} · ${title || "meme"}`;
  name.title = title;

  const link = document.createElement("a");
  link.className = "share-btn";
  link.href = sourceUrl || imageUrl;
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

  const btn     = document.getElementById("generate-btn");
  const loading = document.getElementById("loading");
  const grid    = document.getElementById("meme-grid");
  const info    = document.getElementById("search-info");

  btn.disabled = true;
  loading.classList.remove("hidden");
  grid.innerHTML = "";
  if (info) info.textContent = "";

  try {
    let posts = await fetchRedditMemes(keyword);
    const searchTerm = toSearchTerm(keyword);

    if (posts.length === 0) {
      // fallback：imgflip 隨機
      if (info) info.textContent = `找不到「${keyword}」相關迷因，改顯示熱門迷因`;
      shuffle(FALLBACK_TEMPLATES).slice(0, 10).forEach((t, i) => {
        grid.appendChild(buildCard(t.url, t.name, i, t.url));
      });
    } else {
      const selected = shuffle(posts).slice(0, 10);
      const label = searchTerm !== keyword ? `"${keyword}" → 搜尋 "${searchTerm}"` : `"${keyword}"`;
      if (info) info.textContent = `找到 ${posts.length} 張，顯示 ${selected.length} 張 · 關鍵字 ${label}`;
      selected.forEach((post, i) => {
        const redditUrl = `https://www.reddit.com${post.permalink}`;
        grid.appendChild(buildCard(post.url, post.title, i, redditUrl));
      });
    }
  } catch (err) {
    console.error(err);
    grid.innerHTML = `<p style="color:#e94560;padding:24px">搜尋失敗（${err.message}），請稍後再試</p>`;
  } finally {
    loading.classList.add("hidden");
    btn.disabled = false;
  }
}

// Enter 鍵觸發
document.getElementById("keyword-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") generateMemes();
});
