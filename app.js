// 7TAROT Storefront + Raffle — RESET
// Edit the RAFFLE block below when you run a new raffle.

const RAFFLE = {
  url: 'https://raffall.com/393853/enter-raffle-to-win-my-own-personal-tarot-deck-hosted-by-steven-billy-abbott',
  title: 'Win my personal tarot deck',
  startsAt: '', // already open
  endsAt: '2025-09-10T11:28:00+01:00', // Wed, 10 Sept 2025, 11:28 (BST, UK)
  image: 'assets/raffle-placeholder.png' // swap later if you upload another file to /assets/
};

// Big Cartel public API (read‑only)
const SUBDOMAIN = '7tarot';
const API_BASE = `https://api.bigcartel.com/${SUBDOMAIN}`;

// Shorthands & elements
const $ = (sel) => document.querySelector(sel);
const grid = $('#grid');
const filters = $('#filters');
const input = $('#q');
const empty = $('#empty');
const YEAR_SPAN = document.getElementById('year');
if (YEAR_SPAN) YEAR_SPAN.textContent = new Date().getFullYear().toString();

function money(n, currency='GBP', locale='en-GB') {
  try { return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(n); }
  catch { return '£' + Number(n).toFixed(2); }
}

async function fetchStore() {
  const res = await fetch(`${API_BASE}/store.json`, { cache: 'no-store', mode: 'cors' });
  if (!res.ok) throw new Error('Store fetch failed');
  return res.json();
}

async function fetchProducts() {
  const res = await fetch(`${API_BASE}/products.json`, { cache: 'no-store', mode: 'cors' });
  if (!res.ok) throw new Error('Products fetch failed');
  return res.json();
}

function renderProducts(items, currency='GBP', locale='en-GB') {
  if (!grid) return;
  grid.innerHTML = '';
  if (!items.length) {
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';
  const frag = document.createDocumentFragment();
  for (const p of items) {
    const img = (p.images && p.images[0] && (p.images[0].secure_url || p.images[0].url)) || '';
    const price = p.on_sale && p.options?.[0]?.price !== undefined ? p.options[0].price : (p.price ?? p.default_price ?? 0);
    const url = `https://${SUBDOMAIN}.bigcartel.com${p.url}`;
    const soldOut = (p.options || []).every(o => o.sold_out);
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <a class="img-wrap" href="${url}" target="_blank" rel="noopener">
        <img alt="${p.name}" src="${img}" onerror="this.src='https://dummyimage.com/600x600/0c130f/e7ffee&text=No+Image'"/>
      </a>
      <div class="name">${p.name}</div>
      <div class="price-row">
        <div class="price">${money(price, currency, locale)}</div>
      </div>
      <div class="cta-row">
        ${soldOut ? `<a class="buy" href="${url}" target="_blank" rel="noopener">View (Sold Out)</a>` :
          `<a class="buy" href="${url}" target="_blank" rel="noopener">Buy</a>`}
      </div>
    `;
    frag.appendChild(card);
  }
  grid.appendChild(frag);
}

function buildFilters(items) {
  if (!filters) return;
  const cats = new Set();
  items.forEach(p => (p.categories || []).forEach(c => cats.add(c.name)));
  filters.innerHTML = '';
  if (!cats.size) return;
  const allBtn = document.createElement('button');
  allBtn.textContent = 'All';
  allBtn.className = 'badge';
  allBtn.onclick = () => apply({ cat: null });
  filters.appendChild(allBtn);
  cats.forEach(name => {
    const b = document.createElement('button');
    b.textContent = name;
    b.className = 'badge';
    b.onclick = () => apply({ cat: name });
    filters.appendChild(b);
  });
}

let PRODUCTS = [];
let STORE = null;
let CURRENT = [];

function apply({ q = (input?.value || '').trim().toLowerCase(), cat = null } = {}) {
  let list = PRODUCTS.slice();
  if (q) list = list.filter(p => (p.name || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q));
  if (cat) list = list.filter(p => (p.categories || []).some(c => c.name === cat));
  CURRENT = list;
  const currency = STORE?.currency?.code || 'GBP';
  const locale = STORE?.currency?.locale || 'en-GB';
  renderProducts(list, currency, locale);
}

function humanDate(dt) {
  try { return new Date(dt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }); }
  catch { return ''; }
}

function renderRaffle() {
  const img = $('#raffle-img');
  const title = $('#raffle-title-text');
  const ends = $('#raffle-ends');
  const enter = $('#raffle-enter');
  const copy = $('#raffle-copy');
  if (!img || !title || !ends || !enter || !copy) return;

  title.textContent = RAFFLE.title || 'Raffle';
  img.src = RAFFLE.image || 'assets/raffle-placeholder.png';

  const url = RAFFLE.url;
  enter.href = url;
  copy.addEventListener('click', (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(url).then(() => { copy.textContent = 'Link Copied!'; setTimeout(()=> copy.textContent='Copy Link', 1500); });
  });

  const startTxt = RAFFLE.startsAt ? `Opens: ${humanDate(RAFFLE.startsAt)}` : '';
  let statusLine = startTxt;

  const end = RAFFLE.endsAt ? new Date(RAFFLE.endsAt) : null;
  if (end && !isNaN(end.valueOf())) {
    const tick = () => {
      const now = new Date();
      const diff = end - now;
      if (diff <= 0) { ends.textContent = (startTxt ? `${startTxt} • ` : '') + 'Raffle closed'; return; }
      const d = Math.floor(diff / (1000*60*60*24));
      const h = Math.floor((diff / (1000*60*60)) % 24);
      const m = Math.floor((diff / (1000*60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      ends.textContent = `${statusLine ? statusLine + ' • ' : ''}Ends in: ${d}d ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
      requestAnimationFrame(tick);
    };
    tick();
  } else {
    ends.textContent = `${statusLine}${statusLine ? ' • ' : ''}Ends soon`;
  }
}

async function init() {
  try {
    STORE = await fetchStore().catch(() => null);
    PRODUCTS = await fetchProducts();
    buildFilters(PRODUCTS);
    apply({ q: '' });
  } catch (e) {
    console.error(e);
    if (grid) grid.innerHTML = '<div style="padding:24px;color:#ffb3b3">Could not load products. If this persists, CORS may be blocking requests to api.bigcartel.com from your domain. I can give you a tiny Netlify proxy if needed.</div>';
  }
  if (input) input.addEventListener('input', () => apply());
  renderRaffle();
  matrixRain();
}

function matrixRain() {
  const canvas = document.getElementById('matrix');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
  resize(); window.addEventListener('resize', resize);
  const chars = 'アカサタナハマヤラワ0123456789abcdefghijklm';
  const fontSize = 16;
  let columns = Math.floor(canvas.width / fontSize);
  let drops = Array.from({ length: columns }, () => Math.random() * canvas.height);
  function draw() {
    ctx.fillStyle = 'rgba(10,15,10,0.07)';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#00ff9c';
    ctx.font = fontSize + 'px monospace';
    for (let i=0; i<drops.length; i++) {
      const text = chars[Math.floor(Math.random()*chars.length)];
      ctx.fillText(text, i*fontSize, drops[i]*fontSize);
      if (drops[i]*fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i] += 0.9;
    }
    requestAnimationFrame(draw);
  }
  draw();
}

init();
init();
