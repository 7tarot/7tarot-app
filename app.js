
// 7 Tarot — Classic Look (v3)
// Restores the earlier minimal layout & styling
// Adds cache-busting, image fallback, and optional Daily Lock hidden in a small menu

async function loadDeck() {
  const res = await fetch('data/deck.json?v=' + Date.now(), { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load deck.json');
  const json = await res.json();
  return json.cards || [];
}

function isReversed(){ return Math.random() < 0.5; }
function todayKey(){ return new Date().toISOString().slice(0,10); }
function saveDaily(card, reversed){
  localStorage.setItem('dailyDraw', JSON.stringify({date: todayKey(), slug: card.slug, reversed}));
}
function readDaily(){
  try{
    const v = JSON.parse(localStorage.getItem('dailyDraw')||'null');
    if (v && v.date === todayKey()) return v;
  }catch{}; return null;
}

function el(tag, attrs={}, ...kids){
  const n = document.createElement(tag);
  for (const [k,v] of Object.entries(attrs)){
    if (k==='class') n.className=v;
    else if (k==='style') Object.assign(n.style, v);
    else if (k.startsWith('on') && typeof v==='function') n.addEventListener(k.slice(2), v);
    else n.setAttribute(k,v);
  }
  for (const k of kids) n.appendChild(typeof k==='string'?document.createTextNode(k):k);
  return n;
}

function ui(root){
  const style = el('style', {}, `
    :root {
      --bg:#0b0f0c; --panel:#101510; --glow:#00ff9c; --purple:#a780ff; --text:#e7ffee; --muted:#b7d9c8;
    }
    *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
    html,body{margin:0;padding:0;background:var(--bg);color:var(--text);font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif}
    .wrap{min-height:100svh;display:flex;flex-direction:column;padding:16px;gap:16px}
    .title{text-align:center;letter-spacing:1px;font-weight:700}
    .title span{color:var(--purple);text-shadow:0 0 10px var(--glow)}
    .card{
      background:linear-gradient(180deg,rgba(16,21,16,.92),rgba(16,21,16,.64));
      border:1px solid rgba(0,255,156,.25); border-radius:18px;
      box-shadow:0 0 24px rgba(0,255,156,.08), inset 0 0 24px rgba(167,128,255,.05);
      padding:14px; display:grid; grid-template-rows:auto auto 1fr; gap:12px;
    }
    .art-wrap{width:100%; aspect-ratio:3 / 5.34; border-radius:16px; overflow:hidden; border:1px solid rgba(167,128,255,.25); position:relative}
    .art-wrap img{width:100%;height:100%;object-fit:cover; transition:transform 300ms ease; filter:drop-shadow(0 0 6px rgba(0,255,156,.2))}
    .art-wrap.reversed img{transform:rotate(180deg)}
    .meta{display:flex; align-items:baseline; justify-content:space-between; gap:8px}
    .name{font-size:1.125rem;font-weight:700}
    .badge{font-size:.75rem;color:var(--muted); border:1px solid rgba(167,128,255,.35); padding:2px 8px; border-radius:999px}
    .text{font-size:.98rem;line-height:1.4;color:var(--text)}
    .controls{display:grid;grid-template-columns:1fr; gap:10px}
    button.draw{
      padding:14px 16px; border:1px solid rgba(0,255,156,.4); border-radius:12px;
      background:rgba(0,255,156,.08); color:var(--text); font-weight:800; letter-spacing:.5px;
      box-shadow:0 0 16px rgba(0,255,156,.12); transition:transform 120ms ease, box-shadow 200ms ease, background 200ms ease;
    }
    button.draw:active{transform:translateY(1px) scale(.99)}
    button.draw:hover{box-shadow:0 0 24px rgba(0,255,156,.2); background:rgba(0,255,156,.12)}
    .gear{justify-self:end; opacity:.7; font-size:.9rem; cursor:pointer; color:var(--muted)}
    .menu{display:none; font-size:.9rem; color:var(--muted)}
    .menu.show{display:block}
    .contact{margin-top:4px; padding:12px; border-top:1px dashed rgba(0,255,156,.25); display:grid; gap:10px}
    .contact h3{margin:0; font-size:.95rem; color:var(--muted)}
    .cta-row{display:grid; grid-template-columns:1fr 1fr; gap:10px}
    a.cta{display:inline-block;text-align:center;padding:12px 14px;border-radius:12px;text-decoration:none;color:var(--bg);
      background:linear-gradient(180deg,var(--glow),#72ffc9); font-weight:800}
    a.cta.messenger{background:linear-gradient(180deg,var(--purple),#c7b0ff); color:#0b0f0c}
    .footnote{text-align:center;font-size:.8rem;color:var(--muted);opacity:.85}
    @media(min-width:560px){.wrap{max-width:480px;margin:0 auto}}
  `);

  const wrap = el('div',{class:'wrap'});
  const title = el('div',{class:'title'},'🃏 ',el('span',{},'7 Tarot'),' — Daily Draw');
  const cardEl = el('div',{class:'card'});
  const artWrap = el('div',{class:'art-wrap'});
  const art = el('img',{alt:'Tarot card artwork', src:'assets/cards/placeholder.png'});
  art.addEventListener('error',()=>{ art.src='assets/cards/placeholder.png'; });
  artWrap.appendChild(art);

  const meta = el('div',{class:'meta'});
  const name = el('div',{class:'name'},'…');
  const badge = el('div',{class:'badge'},'upright');
  meta.append(name, badge);

  const text = el('div',{class:'text'},'Tap “Draw” to pull a card.');
  cardEl.append(artWrap, meta, text);

  const controls = el('div',{class:'controls'});
  const drawBtn = el('button',{class:'draw', onclick:()=>doDraw()},'Draw');
  const gear = el('div',{class:'gear', onclick:()=>menu.classList.toggle('show')},'⚙ Options');
  const menu = el('div',{class:'menu'});
  const lockLbl = el('label',{}, el('input',{type:'checkbox', id:'lockToggle'}), ' Daily Lock (one card per day)');
  const forceBtn = el('button',{class:'draw', onclick:()=>doDraw(true)},'Force New (ignore lock)');
  menu.append(lockLbl, forceBtn);

  controls.append(drawBtn, gear, menu);

  const contact = el('div',{class:'contact'});
  const contactTitle = el('h3',{},'Contact me for a private reading:');
  const ctas = el('div',{class:'cta-row'});
  const wa = el('a',{class:'cta whatsapp',href:'https://wa.me/447527171238',target:'_blank',rel:'noopener'},'WhatsApp');
  const ms = el('a',{class:'cta messenger',href:'https://m.me/sunhouse76',target:'_blank',rel:'noopener'},'Messenger');
  ctas.append(wa, ms);
  contact.append(contactTitle, ctas);

  const foot = el('div',{class:'footnote'},'© ',new Date().getFullYear().toString(),' — 7 Tarot');

  wrap.append(title, cardEl, controls, contact, foot);
  root.append(style, wrap);

  let CARDS = [];

  function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

  async function init(){
    try{
      CARDS = await loadDeck();
      // restore toggles
      document.getElementById('lockToggle').checked = localStorage.getItem('dailyLock')==='1';
      document.getElementById('lockToggle').addEventListener('change', e=>{
        localStorage.setItem('dailyLock', e.target.checked ? '1':'0');
      });
      doDraw(true);
    }catch(e){
      text.textContent='Could not load deck data. Please check data/deck.json.';
      console.error(e);
    }
  }

  function bySlug(slug){ return CARDS.find(c=>c.slug===slug); }

  function render(card, reversed){
    if (!card) return;
    artWrap.classList.toggle('reversed', reversed);
    art.src = card.image || 'assets/cards/placeholder.png';
    art.onerror = () => { art.src = 'assets/cards/placeholder.png'; };
    name.textContent = card.name;
    badge.textContent = reversed ? 'reversed' : 'upright';
    text.textContent = reversed ? (card.reversed || 'Reversed meaning coming soon.') : (card.upright || 'Meaning coming soon.');
  }

  function doDraw(forceNew=false){
    if (!CARDS.length) return;
    const locked = localStorage.getItem('dailyLock')==='1';
    if (locked && !forceNew){
      const saved = readDaily();
      if (saved){
        render(bySlug(saved.slug) || pick(CARDS), !!saved.reversed);
        return;
      }
    }
    const card = pick(CARDS);
    const reversed = isReversed();
    render(card, reversed);
    if (locked) saveDaily(card, reversed);
  }

  init();
}

(function(){ const mount = document.getElementById('app') || document.body; ui(mount); })();
