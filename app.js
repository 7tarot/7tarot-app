
// 7 Tarot — Daily Draw (v2)
// - Adds index.html
// - Cache-busting on deck load
// - Optional "Daily Lock" toggle storing today's card in localStorage
// - "Force New" button to ignore the lock
// - Robust image fallback

const VERSION = 'v2';

async function loadDeck() {
  const url = `data/deck.json?v=${Date.now()}`; // bust caches hard
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load deck.json');
  const json = await res.json();
  return json.cards || [];
}

function todayKey() {
  const d = new Date();
  return d.toISOString().slice(0,10); // YYYY-MM-DD
}

function storeDaily(card, reversed) {
  const key = 'dailyDraw';
  const payload = { date: todayKey(), slug: card.slug, reversed };
  localStorage.setItem(key, JSON.stringify(payload));
}

function getDaily() {
  const raw = localStorage.getItem('dailyDraw');
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw);
    if (obj.date === todayKey()) return obj;
  } catch {}
  return null;
}

// Utility
function isReversed() { return Math.random() < 0.5; }
function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'class') node.className = v;
    else if (k === 'style') Object.assign(node.style, v);
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  });
  for (const child of children) {
    if (child == null) continue;
    node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return node;
}

function ui(root) {
  const style = el('style', {}, `
    :root {
      --bg: #0b0f0c;
      --panel: #101510;
      --glow: #00ff9c;
      --purple: #a780ff;
      --text: #e7ffee;
      --muted: #b7d9c8;
    }
    * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    html, body { margin: 0; padding: 0; background: var(--bg); color: var(--text); font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; }
    .wrap { min-height: 100svh; display: flex; flex-direction: column; padding: 16px; gap: 16px; }
    .title { text-align: center; letter-spacing: 1px; font-weight: 700; }
    .title span { text-shadow: 0 0 10px var(--glow); color: var(--purple); }
    .card {
      background: linear-gradient(180deg, rgba(16,21,16,0.9), rgba(16,21,16,0.6));
      border: 1px solid rgba(0,255,156,0.25);
      border-radius: 18px;
      box-shadow: 0 0 24px rgba(0,255,156,0.08), inset 0 0 24px rgba(167,128,255,0.05);
      padding: 14px;
      display: grid;
      grid-template-rows: auto auto 1fr;
      gap: 12px;
      overflow: hidden;
    }
    .art-wrap { width: 100%; aspect-ratio: 3 / 5.34; border-radius: 16px; overflow: hidden; border: 1px solid rgba(167,128,255,0.25); position: relative; }
    .art-wrap img { width: 100%; height: 100%; object-fit: cover; transition: transform 300ms ease; filter: drop-shadow(0 0 6px rgba(0,255,156,0.2)); }
    .art-wrap.reversed img { transform: rotate(180deg); }
    .meta { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
    .name { font-size: 1.125rem; font-weight: 700; }
    .badge { font-size: 0.75rem; color: var(--muted); border: 1px solid rgba(167,128,255,0.35); padding: 2px 8px; border-radius: 999px; }
    .text { font-size: 0.98rem; line-height: 1.4; color: var(--text); }
    .controls { display: grid; grid-template-columns: 1fr; gap: 10px; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    button.btn {
      padding: 12px 14px; border: 1px solid rgba(0,255,156,0.4);
      border-radius: 12px; background: rgba(0,255,156,0.08); color: var(--text);
      font-weight: 700; letter-spacing: .5px;
      box-shadow: 0 0 16px rgba(0,255,156,0.12);
      transition: transform 120ms ease, box-shadow 200ms ease, background 200ms ease;
    }
    button.btn:active { transform: translateY(1px) scale(.99); }
    button.btn:hover { box-shadow: 0 0 24px rgba(0,255,156,0.2); background: rgba(0,255,156,0.12); }
    .toggle { display: flex; align-items: center; gap: 10px; font-size: .9rem; color: var(--muted); }
    .contact { margin-top: 4px; padding: 12px; border-top: 1px dashed rgba(0,255,156,0.25); display: grid; gap: 10px; }
    .contact h3 { margin: 0; font-size: 0.95rem; color: var(--muted); }
    .cta-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    a.cta { display: inline-block; text-align: center; padding: 12px 14px; border-radius: 12px; text-decoration: none; color: var(--bg);
      background: linear-gradient(180deg, var(--glow), #72ffc9); font-weight: 800; }
    a.cta.messenger { background: linear-gradient(180deg, var(--purple), #c7b0ff); color: #0b0f0c; }
    .footnote { text-align: center; font-size: 0.8rem; color: var(--muted); opacity: .85; }
    @media (min-width: 560px) { .wrap { max-width: 480px; margin: 0 auto; } }
  `);

  const wrap = el('div', { class: 'wrap' });
  const title = el('div', { class: 'title' }, '🃏 ', el('span', {}, '7 Tarot'), ' — Daily Draw');
  const cardEl = el('div', { class: 'card' });
  const artWrap = el('div', { class: 'art-wrap' });
  const art = el('img', { alt: 'Tarot card artwork', src: 'assets/cards/placeholder.png' });
  art.addEventListener('error', () => { art.src = 'assets/cards/placeholder.png'; });
  artWrap.appendChild(art);

  const meta = el('div', { class: 'meta' });
  const name = el('div', { class: 'name' }, '…');
  const badge = el('div', { class: 'badge' }, 'upright');
  meta.append(name, badge);

  const text = el('div', { class: 'text' }, 'Tap “Draw” to pull a card.');
  cardEl.append(artWrap, meta, text);

  const controls = el('div', { class: 'controls' });
  const row = el('div', { class: 'row' });
  const drawBtn = el('button', { class: 'btn', onclick: () => doDraw() }, 'Draw');
  const forceBtn = el('button', { class: 'btn', onclick: () => doDraw(true) }, 'Force New');
  row.append(drawBtn, forceBtn);

  const toggleWrap = el('label', { class: 'toggle' });
  const toggle = el('input', { type: 'checkbox' });
  toggle.checked = localStorage.getItem('dailyLock') === '1';
  toggle.addEventListener('change', () => {
    localStorage.setItem('dailyLock', toggle.checked ? '1' : '0');
    doDraw(true); // refresh draw
  });
  toggleWrap.append(toggle, document.createTextNode('Daily Lock (one card per day)'));

  controls.append(row, toggleWrap);

  const contact = el('div', { class: 'contact' });
  const contactTitle = el('h3', {}, 'Contact me for a private reading:');
  const ctas = el('div', { class: 'cta-row' });
  const wa = el('a', { class: 'cta whatsapp', href: 'https://wa.me/447527171238', target: '_blank', rel: 'noopener' }, 'WhatsApp');
  const ms = el('a', { class: 'cta messenger', href: 'https://m.me/sunhouse76', target: '_blank', rel: 'noopener' }, 'Messenger');
  ctas.append(wa, ms);
  contact.append(contactTitle, ctas);

  const foot = el('div', { class: 'footnote' }, '© ', new Date().getFullYear().toString(), ' — 7 Tarot ', VERSION);
  wrap.append(title, cardEl, controls, contact, foot);
  root.append(style, wrap);

  let CARDS = [];

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  async function init() {
    try {
      CARDS = await loadDeck();
      doDraw(true); // initial draw
    } catch (e) {
      text.textContent = 'Could not load deck data. Please check data/deck.json.';
      console.error(e);
    }
  }

  function findBySlug(slug) {
    return CARDS.find(c => c.slug === slug);
  }

  function render(card, reversed) {
    if (!card) return;
    artWrap.classList.toggle('reversed', reversed);
    art.src = card.image || 'assets/cards/placeholder.png';
    art.onerror = () => { art.src = 'assets/cards/placeholder.png'; };
    name.textContent = card.name;
    badge.textContent = reversed ? 'reversed' : 'upright';
    text.textContent = reversed ? (card.reversed || 'Reversed meaning coming soon.') : (card.upright || 'Meaning coming soon.');
  }

  function doDraw(forceNew = false) {
    if (!CARDS.length) return;
    const locked = localStorage.getItem('dailyLock') === '1';
    if (locked && !forceNew) {
      const saved = getDaily();
      if (saved) {
        const card = findBySlug(saved.slug) || pickRandom(CARDS);
        render(card, !!saved.reversed);
        return;
      }
    }
    const card = pickRandom(CARDS);
    const reversed = isReversed();
    render(card, reversed);
    if (locked) storeDaily(card, reversed);
  }

  init();
  return { doDraw };
}

(function bootstrap() {
  const mount = document.getElementById('app') || document.body;
  ui(mount);
})();
