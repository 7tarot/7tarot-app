// --- Clean tracking params from URL (fbclid, gclid, utm_*) ---
(() => {
  try {
    const u = new URL(location.href);
    const p = u.searchParams;
    const keys = ['fbclid','gclid','utm_source','utm_medium','utm_campaign','utm_term','utm_content'];
    let changed = false;
    keys.forEach(k => { if (p.has(k)) { p.delete(k); changed = true; }});
    if (changed) {
      const newUrl = u.origin + u.pathname + (p.toString() ? '?' + p : '') + location.hash;
      history.replaceState(null, '', newUrl);
    }
  } catch {}
})();
// --------------------------------------------------------------

// Enhanced storefront features (unchanged from your working build)
const ANNOUNCEMENT = { show: true, text: "✨ New: Raffle is live — tap Raffle to enter. Good luck!" };
const RAFFLE = {
  url: "https://raffall.com/393853/enter-raffle-to-win-my-own-personal-tarot-deck-hosted-by-steven-billy-abbott",
  title: "Win my personal tarot deck",
  endsAt: "",
  image: "assets/raffle-placeholder.png"
};
const MAJORS = [
  ["0 The Fool","Fresh start, trust the path. Reversed: pause—ground before leaping."],
  ["1 The Magician","You have the tools. Reversed: focus scatters—pick one move."],
  ["2 The High Priestess","Intuition speaks softly—listen. Reversed: quiet the noise."],
  ["3 The Empress","Nurture and receive. Reversed: refill your own cup."],
  ["4 The Emperor","Boundaries, structure, leadership. Reversed: soften control."],
  ["5 The Hierophant","Learn, teach, tradition. Reversed: try your own way."],
  ["6 The Lovers","Aligned choices, heart + head. Reversed: values misaligned—realign."],
  ["7 The Chariot","Direction + will = progress. Reversed: recalibrate aim."],
  ["8 Strength","Gentle courage. Reversed: be kind to yourself."],
  ["9 The Hermit","Inner guidance, wise pause. Reversed: reconnect after rest."],
  ["10 Wheel of Fortune","Cycles turn—flow with them. Reversed: accept the lesson."],
  ["11 Justice","Truth, fairness, accountability. Reversed: review the facts."],
  ["12 The Hanged Man","Surrender to new perspective. Reversed: unstuck by release."],
  ["13 Death","Clean endings, real beginnings. Reversed: make space for growth."],
  ["14 Temperance","Balance, blend, steady healing. Reversed: reduce extremes."],
  ["15 The Devil","Release what hooks you. Reversed: freedom is a choice."],
  ["16 The Tower","Truth shakes loose what’s false. Reversed: rebuild honestly."],
  ["17 The Star","Hope, faith, gentle renewal. Reversed: let yourself receive."],
  ["18 The Moon","Feel, dream, move slowly. Reversed: name the fear."],
  ["19 The Sun","Yes. Joy, clarity, warmth. Reversed: make time for play."],
  ["20 Judgment","Answer your calling. Reversed: forgive, then choose."],
  ["21 The World","Wholeness, completion, level-up. Reversed: celebrate then begin."]
];

const SUBDOMAIN = '7tarot';
const API_BASE = `https://api.bigcartel.com/${SUBDOMAIN}`;
const $ = (sel) => document.querySelector(sel);
const grid = $('#grid'); const filters = $('#filters'); const input = $('#q'); const empty = $('#empty');
const YEAR_SPAN = document.getElementById('year'); if (YEAR_SPAN) YEAR_SPAN.textContent = new Date().getFullYear().toString();

(function setupBar(){ const el = $('#bar'); const txt = $('#bar-text'); const close = $('#bar-close'); if (!el || !ANNOUNCEMENT.show) return; txt.textContent = ANNOUNCEMENT.text || ''; el.hidden = false; close.onclick = ()=> el.remove(); })();

function money(n,currency='GBP',locale='en-GB'){ try{ return new Intl.NumberFormat(locale,{style:'currency',currency}).format(n);}catch{ return '£'+Number(n).toFixed(2);}}
async function fetchStore(){ const res=await fetch(`${API_BASE}/store.json`,{cache:'no-store',mode:'cors'}); if(!res.ok) throw new Error('Store fetch failed'); return res.json(); }
async function fetchProducts(){ const res=await fetch(`${API_BASE}/products.json`,{cache:'no-store',mode:'cors'}); if(!res.ok) throw new Error('Products fetch failed'); return res.json(); }

function renderProducts(items,currency='GBP',locale='en-GB'){ if(!grid) return; grid.innerHTML=''; if(!items.length){ empty&&(empty.style.display='block'); return;} empty&&(empty.style.display='none'); const frag=document.createDocumentFragment(); for(const p of items){ const img=(p.images&&p.images[0]&&(p.images[0].secure_url||p.images[0].url))||''; const price=p.on_sale&&p.options?.[0]?.price!==undefined?p.options[0].price:(p.price??p.default_price??0); const url=`https://${SUBDOMAIN}.bigcartel.com${p.url}?utm_source=7tarot-app&utm_medium=buy_button&utm_campaign=shop`; const soldOut=(p.options||[]).every(o=>o.sold_out); const card=document.createElement('article'); card.className='card'; card.innerHTML=`
      <a class="img-wrap" href="${url}" target="_blank" rel="noopener">
        <img alt="${p.name}" src="${img}" loading="lazy" onerror="this.src='https://dummyimage.com/600x600/0c130f/e7ffee&text=No+Image'"/>
      </a>
      <div class="name">${p.name}</div>
      <div class="price-row">
        <div class="price">${money(price,currency,locale)}</div>
      </div>
      <div class="cta-row">
        ${soldOut?`<a class="buy" href="${url}" target="_blank" rel="noopener">View (Sold Out)</a>`:`<a class="buy" href="${url}" target="_blank" rel="noopener">Buy</a>`}
      </div>`; frag.appendChild(card);} grid.appendChild(frag); }

function buildFilters(items){ if(!filters) return; const cats=new Set(); items.forEach(p=>(p.categories||[]).forEach(c=>cats.add(c.name))); filters.innerHTML=''; if(!cats.size) return; const allBtn=document.createElement('button'); allBtn.textContent='All'; allBtn.className='badge'; allBtn.onclick=()=>apply({cat:null}); filters.appendChild(allBtn); cats.forEach(name=>{ const b=document.createElement('button'); b.textContent=name; b.className='badge'; b.onclick=()=>apply({cat:name}); filters.appendChild(b); }); }

let PRODUCTS=[]; let STORE=null; let CURRENT=[];
function apply({ q=input?.value.trim().toLowerCase()||'', cat=null }={}){ let list=PRODUCTS.slice(); if(q) list=list.filter(p=>(p.name||'').toLowerCase().includes(q)||(p.description||'').toLowerCase().includes(q)); if(cat) list=list.filter(p=>(p.categories||[]).some(c=>c.name===cat)); CURRENT=list; const currency=STORE?.currency?.code||'GBP'; const locale=STORE?.currency?.locale||'en-GB'; renderProducts(list,currency,locale); }

function setupRaffleExtras(){ const enter=$('#raffle-enter'); const copy=$('#raffle-copy'); const share=$('#raffle-share'); const ends=$('#raffle-ends'); const img=$('#raffle-img'); const title=$('#raffle-title-text'); if(img) img.src=RAFFLE.image||'assets/raffle-placeholder.png'; if(title) title.textContent=RAFFLE.title||'Raffle'; if(enter) enter.href=RAFFLE.url; if(copy) copy.addEventListener('click',(e)=>{ e.preventDefault(); navigator.clipboard.writeText(RAFFLE.url).then(()=>{ copy.textContent='Link Copied!'; setTimeout(()=> copy.textContent='Copy Link',1200); }); }); const data={ title:'7TAROT Raffle', text:RAFFLE.title, url:RAFFLE.url }; if(share) share.addEventListener('click',async (e)=>{ e.preventDefault(); if(navigator.share){ try{ await navigator.share(data);}catch{} } else { navigator.clipboard.writeText(RAFFLE.url); share.textContent='Link Copied!'; setTimeout(()=> share.textContent='Share',1200); } }); const end=RAFFLE.endsAt?new Date(RAFFLE.endsAt):null; if(end && !isNaN(end.valueOf()) && ends){ const tick=()=>{ const now=new Date(); const diff=end-now; if(diff<=0){ ends.textContent='Raffle closed'; return;} const d=Math.floor(diff/(1000*60*60*24)); const h=Math.floor((diff/(1000*60*60))%24); const m=Math.floor((diff/(1000*60))%60); const s=Math.floor((diff/1000)%60); ends.textContent=`Ends in: ${d}d ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`; requestAnimationFrame(tick); }; tick(); } }

function renderMajors(){ const host=document.getElementById('majors'); if(!host) return; const frag=document.createDocumentFragment(); MAJORS.forEach(([name,meaning])=>{ const row=document.createElement('div'); row.style.padding='6px 0'; row.innerHTML=`<strong>${name}</strong> — <span style="color:var(--muted)">${meaning}</span>`; frag.appendChild(row); }); host.appendChild(frag); }

(function installTips(){ const tip=document.getElementById('install-tip'); let deferredPrompt=null; window.addEventListener('beforeinstallprompt',(e)=>{ e.preventDefault(); deferredPrompt=e; if(tip) tip.textContent='Tap the menu ⋮ and choose “Install app”.'; }); })();

async function init(){ try{ STORE=await fetchStore().catch(()=>null); PRODUCTS=await fetchProducts(); buildFilters(PRODUCTS); apply({ q:'' }); }catch(e){ console.error(e); if(grid) grid.innerHTML='<div style="padding:24px;color:#ffb3b3">Could not load products. If this persists, CORS may be blocking requests to api.bigcartel.com from your domain. I can give you a tiny Netlify proxy if needed.</div>'; } input && input.addEventListener('input',()=>apply()); setupRaffleExtras(); renderMajors(); matrixRain(); if('serviceWorker' in navigator){ navigator.serviceWorker.register('/sw.js').catch(()=>{}); }}

function matrixRain(){ const canvas=document.getElementById('matrix'); if(!canvas) return; const ctx=canvas.getContext('2d'); const resize=()=>{ canvas.width=window.innerWidth; canvas.height=window.innerHeight; }; resize(); window.addEventListener('resize',resize); const chars='アカサタナハマヤラワ0123456789abcdefghijklm'; const fontSize=16; let columns=Math.floor(canvas.width/fontSize); let drops=Array.from({length:columns},()=>Math.random()*canvas.height); function draw(){ ctx.fillStyle='rgba(10,15,10,0.07)'; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.fillStyle='#00ff9c'; ctx.font=fontSize+'px monospace'; for(let i=0;i<drops.length;i++){ const text=chars[Math.floor(Math.random()*chars.length)]; ctx.fillText(text,i*fontSize,drops[i]*fontSize); if(drops[i]*fontSize>canvas.height && Math.random()>0.975) drops[i]=0; drops[i]+=0.9; } requestAnimationFrame(draw);} draw(); }

init();
