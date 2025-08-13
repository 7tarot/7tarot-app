
async function loadDeck(){ const r=await fetch('/data/deck.json?v='+Date.now(), {cache:'no-store'}); if(!r.ok) throw new Error('deck'); const j=await r.json(); return j.cards||[]; }
function el(t,a={},...k){const n=document.createElement(t); for(const [x,y] of Object.entries(a)){ if(x==='class') n.className=y; else if(x==='style') Object.assign(n.style,y); else if(x.startsWith('on')&&typeof y==='function') n.addEventListener(x.slice(2),y); else n.setAttribute(x,y);} for(const c of k) if(c!=null) n.appendChild(typeof c==='string'?document.createTextNode(c):c); return n; }
function isReversed(){return Math.random()<0.5}
function ui(root){
  const style = el('style',{},`
    :root{--bg:#0b0f0c;--panel:#101510;--glow:#00ff9c;--purple:#a780ff;--text:#e7ffee;--muted:#b7d9c8}
    *{box-sizing:border-box;-webkit-tap-highlight-color:transparent} html,body{margin:0;padding:0;background:var(--bg);color:var(--text);font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif}
    .wrap{min-height:100svh;display:flex;flex-direction:column;padding:16px;gap:16px}
    .title{text-align:center;letter-spacing:1px;font-weight:700} .title span{color:var(--purple);text-shadow:0 0 10px var(--glow)}
    .card{background:linear-gradient(180deg,rgba(16,21,16,.92),rgba(16,21,16,.64));border:1px solid rgba(0,255,156,.25);border-radius:18px;box-shadow:0 0 24px rgba(0,255,156,.08), inset 0 0 24px rgba(167,128,255,.05);padding:14px;display:grid;grid-template-rows:auto auto 1fr;gap:12px}
    .art-wrap{width:100%;aspect-ratio:3/5.34;border-radius:16px;overflow:hidden;border:1px solid rgba(167,128,255,.25)}
    .art-wrap img{width:100%;height:100%;object-fit:cover;transition:transform 300ms ease;filter:drop-shadow(0 0 6px rgba(0,255,156,.2))}
    .art-wrap.reversed img{transform:rotate(180deg)}
    .meta{display:flex;align-items:baseline;justify-content:space-between;gap:8px} .name{font-size:1.125rem;font-weight:700}
    .badge{font-size:.75rem;color:var(--muted);border:1px solid rgba(167,128,255,.35);padding:2px 8px;border-radius:999px}
    .text{font-size:.98rem;line-height:1.4}
    .controls{display:grid;grid-template-columns:1fr;gap:10px}
    button.draw{padding:14px 16px;border:1px solid rgba(0,255,156,.4);border-radius:12px;background:rgba(0,255,156,.08);color:var(--text);font-weight:800;letter-spacing:.5px;box-shadow:0 0 16px rgba(0,255,156,.12);transition:transform 120ms ease,box-shadow 200ms ease,background 200ms ease}
    button.draw:active{transform:translateY(1px) scale(.99)} button.draw:hover{box-shadow:0 0 24px rgba(0,255,156,.2);background:rgba(0,255,156,.12)}
    .contact{margin-top:4px;padding:12px;border-top:1px dashed rgba(0,255,156,.25);display:grid;gap:10px} .contact h3{margin:0;font-size:.95rem;color:var(--muted)}
    .cta-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    a.cta{display:inline-block;text-align:center;padding:12px 14px;border-radius:12px;text-decoration:none;color:var(--bg);background:linear-gradient(180deg,var(--glow),#72ffc9);font-weight:800}
    a.cta.messenger{background:linear-gradient(180deg,var(--purple),#c7b0ff);color:#0b0f0c}
    .footnote{text-align:center;font-size:.8rem;color:var(--muted);opacity:.85}
    @media(min-width:560px){.wrap{max-width:480px;margin:0 auto}}
  `);
  const wrap = el('div',{class:'wrap'});
  const title = el('div',{class:'title'},'🃏 ',el('span',{},'7 Tarot'),' — Daily Draw');
  const cardEl = el('div',{class:'card'});
  const artWrap = el('div',{class:'art-wrap'});
  const art = el('img',{alt:'Tarot card artwork', src:'/assets/cards/placeholder.png'});
  art.addEventListener('error',()=>{ art.src='/assets/cards/placeholder.png'; });
  artWrap.appendChild(art);
  const meta = el('div',{class:'meta'});
  const name = el('div',{class:'name'},'…');
  const badge = el('div',{class:'badge'},'upright');
  meta.append(name, badge);
  const text = el('div',{class:'text'},'Tap “Draw” to pull a card.');
  cardEl.append(artWrap, meta, text);
  const controls = el('div',{class:'controls'});
  const drawBtn = el('button',{class:'draw', onclick:()=>doDraw()},'Draw');
  controls.append(drawBtn);
  const contact = el('div',{class:'contact'});
  const contactTitle = el('h3',{},'Contact me for a private reading:');
  const ctas = el('div',{class:'cta-row'});
  const wa = el('a',{class:'cta whatsapp',href:'https://wa.me/447527171238',target:'_blank',rel:'noopener'},'WhatsApp');
  const ms = el('a',{class:'cta messenger',href:'https://m.me/sunhouse76',target:'_blank',rel:'noopener'},'Messenger');
  ctas.append(wa, ms);
  contact.append(contactTitle, ctas);
  const foot = el('div',{class:'footnote'},'© ', new Date().getFullYear().toString(),' — 7 Tarot');
  wrap.append(title, cardEl, controls, contact, foot);
  root.append(style, wrap);
  let CARDS = [];
  function pick(a){ return a[Math.floor(Math.random()*a.length)]; }
  function render(card, reversed){
    if(!card) return;
    artWrap.classList.toggle('reversed', reversed);
    const wanted = card.image ? ('/' + card.image.replace(/^\//,'')) : '/assets/cards/placeholder.png';
    art.src = wanted;
    art.onerror = () => { art.src = '/assets/cards/placeholder.png'; };
    name.textContent = card.name;
    badge.textContent = reversed ? 'reversed' : 'upright';
    text.textContent = reversed ? (card.reversed || 'Reversed meaning coming soon.') : (card.upright || 'Meaning coming soon.');
  }
  async function init(){
    try{ CARDS = await loadDeck(); doDraw(); } catch(e){ text.textContent = 'Could not load deck data. Check /data/deck.json'; console.error(e); }
  }
  function doDraw(){ if(!CARDS.length) return; const c = pick(CARDS); render(c, isReversed()); }
  init();
}
(function(){ const mount=document.getElementById('app')||document.body; ui(mount); })();
