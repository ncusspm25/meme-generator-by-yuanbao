// ── Caption templates ──────────────────────────────────────────────
// {k} will be replaced with the user's keyword
const CAPTION_TEMPLATES = [
  { top: "當有人提到{k}", bottom: "我的反應：👀" },
  { top: "沒有人：", bottom: "我凌晨三點在想{k}" },
  { top: "{k}？", bottom: "允許我介紹一下我自己" },
  { top: "老師：考試不會考{k}", bottom: "考試：" },
  { top: "我：我要認真面對{k}", bottom: "也是我五分鐘後：" },
  { top: "試圖理解{k}的我", bottom: "腦細胞：CTRL+ALT+DEL" },
  { top: "別人的{k}", bottom: "vs 我的{k}" },
  { top: "以為自己懂{k}", bottom: "Stack Overflow：嗯，其實不是" },
  { top: "開始接觸{k}之前", bottom: "接觸{k}之後" },
  { top: "用{k}解決問題", bottom: "結果又多了三個問題" },
  { top: "第一次聽到{k}", bottom: "現在的我：" },
  { top: "媽媽叫我放棄{k}", bottom: "但{k}叫我放棄睡眠" },
  { top: "面試官：你熟悉{k}嗎？", bottom: "我：我嘗試過一次" },
  { top: "說好只碰一下{k}", bottom: "六小時後：" },
  { top: "({k}在聊天室出現)", bottom: "我的手指：自動開始打字" },
];

// Popular meme template IDs from imgflip (static list as fallback)
const FALLBACK_TEMPLATES = [
  { id: "181913649", name: "Drake Hotline Bling",       url: "https://i.imgflip.com/30b1gx.jpg", box_count: 2 },
  { id: "87743020",  name: "Two Buttons",               url: "https://i.imgflip.com/1g8my4.jpg", box_count: 2 },
  { id: "112126428", name: "Distracted Boyfriend",      url: "https://i.imgflip.com/1ur9b0.jpg", box_count: 3 },
  { id: "131087935", name: "Running Away Balloon",      url: "https://i.imgflip.com/261o3j.jpg", box_count: 5 },
  { id: "217743513", name: "UNO Draw 25 Cards",         url: "https://i.imgflip.com/3lmzyx.jpg", box_count: 2 },
  { id: "124822590", name: "Left Exit 12 Off Ramp",     url: "https://i.imgflip.com/22bdq6.jpg", box_count: 3 },
  { id: "101470",    name: "Ancient Aliens",            url: "https://i.imgflip.com/26am.jpg",   box_count: 2 },
  { id: "438680",    name: "Batman Slapping Robin",     url: "https://i.imgflip.com/9ehk.jpg",   box_count: 2 },
  { id: "61579",     name: "One Does Not Simply",       url: "https://i.imgflip.com/1bij.jpg",   box_count: 2 },
  { id: "93895088",  name: "Expanding Brain",           url: "https://i.imgflip.com/1jwhww.jpg", box_count: 4 },
  { id: "4087833",   name: "Waiting Skeleton",          url: "https://i.imgflip.com/2fm6x.jpg",  box_count: 2 },
  { id: "55311130",  name: "This Is Fine",              url: "https://i.imgflip.com/wxica.jpg",  box_count: 2 },
  { id: "14371066",  name: "Star Wars Yoda",            url: "https://i.imgflip.com/f6gb2.jpg",  box_count: 2 },
  { id: "97984",     name: "Matrix Morpheus",           url: "https://i.imgflip.com/3fryn.jpg",  box_count: 2 },
  { id: "29617627",  name: "Unsettled Tom",             url: "https://i.imgflip.com/2wifvo.jpg", box_count: 2 },
  { id: "188390779", name: "Simu Liu - Change My Mind", url: "https://i.imgflip.com/39t1o.jpg",  box_count: 2 },
  { id: "161865971", name: "Surprised Pikachu",         url: "https://i.imgflip.com/2kbn1e.jpg", box_count: 2 },
  { id: "322841258", name: "Boardroom Meeting",         url: "https://i.imgflip.com/ti7yi.jpg",  box_count: 2 },
  { id: "247375501", name: "Buff Doge vs. Cheems",      url: "https://i.imgflip.com/43a45p.png", box_count: 4 },
  { id: "20007896",  name: "Futurama Fry",              url: "https://i.imgflip.com/1bgw.jpg",   box_count: 2 },
];

// ── Helpers ────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fillCaption(template, keyword) {
  return template.replace(/\{k\}/g, keyword);
}

function pickCaption(index, keyword) {
  const t = CAPTION_TEMPLATES[index % CAPTION_TEMPLATES.length];
  return {
    top:    fillCaption(t.top,    keyword),
    bottom: fillCaption(t.bottom, keyword),
  };
}

// ── Fetch templates from imgflip (CORS-friendly public endpoint) ───
async function fetchTemplates() {
  try {
    const res = await fetch("https://api.imgflip.com/get_memes");
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    if (data.success) return data.data.memes;
    throw new Error("API returned success=false");
  } catch (e) {
    console.warn("imgflip fetch failed, using fallback list:", e.message);
    return FALLBACK_TEMPLATES;
  }
}

// ── Build one meme card DOM element ───────────────────────────────
function buildCard(template, captions, index) {
  const card = document.createElement("div");
  card.className = "meme-card";

  const wrap = document.createElement("div");
  wrap.className = "meme-image-wrap";

  const img = document.createElement("img");
  img.src = template.url;
  img.alt = template.name;
  img.loading = "lazy";
  img.crossOrigin = "anonymous";

  // Top caption
  const topText = document.createElement("div");
  topText.className = "meme-text top";
  topText.textContent = captions.top;

  // Bottom caption
  const bottomText = document.createElement("div");
  bottomText.className = "meme-text bottom";
  bottomText.textContent = captions.bottom;

  wrap.appendChild(img);
  wrap.appendChild(topText);
  wrap.appendChild(bottomText);

  // Footer
  const footer = document.createElement("div");
  footer.className = "meme-footer";

  const name = document.createElement("span");
  name.className = "meme-name";
  name.textContent = `#${index + 1} · ${template.name}`;

  const shareBtn = document.createElement("a");
  shareBtn.className = "share-btn";
  shareBtn.href = template.url;
  shareBtn.target = "_blank";
  shareBtn.rel = "noopener";
  shareBtn.textContent = "原圖 🔗";

  footer.appendChild(name);
  footer.appendChild(shareBtn);

  card.appendChild(wrap);
  card.appendChild(footer);
  return card;
}

// ── Main generate function ─────────────────────────────────────────
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

  btn.disabled = true;
  loading.classList.remove("hidden");
  grid.innerHTML = "";

  try {
    const allTemplates = await fetchTemplates();
    const selected     = shuffle(allTemplates).slice(0, 10);
    const shuffledCaps = shuffle([...Array(CAPTION_TEMPLATES.length).keys()]);

    selected.forEach((template, i) => {
      const captions = pickCaption(shuffledCaps[i] ?? i, keyword);
      const card     = buildCard(template, captions, i);
      grid.appendChild(card);
    });
  } catch (err) {
    grid.innerHTML = `<p style="color:#e94560;padding:24px">產生失敗：${err.message}</p>`;
  } finally {
    loading.classList.add("hidden");
    btn.disabled = false;
  }
}

// ── Enter key support ──────────────────────────────────────────────
document.getElementById("keyword-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") generateMemes();
});
