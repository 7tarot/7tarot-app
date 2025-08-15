// --- URL cleaner (fbclid/gclid/utm_*)
(()=>{try{const u=new URL(location.href),p=u.searchParams;['fbclid','gclid','utm_source','utm_medium','utm_campaign','utm_term','utm_content'].forEach(k=>p.delete(k));history.replaceState(null,'',u.origin+u.pathname+(p.toString()?'?'+p:'')+location.hash);}catch{}})();

// --- Detect FB/IG in-app and show tip bar
(()=>{ const ua=navigator.userAgent||''; const isIAB=/FBAN|FBAV|FB_IAB|Instagram/i.test(ua); if(isIAB){ const tip=document.getElementById('iab-tip'); if(tip) tip.style.display='block'; } })();

// --- "Open in Browser" helpers
(function(){ 
  const btn=document.getElementById('open-browser');
  const copy=document.getElementById('copy-link');
  const url=window.location.origin+window.location.pathname;
  if(btn) btn.addEventListener('click', async ()=>{
    if(navigator.share){ try{ await navigator.share({ title:'7TAROT', url }); return; }catch{} }
    window.open(url,'_blank');
    alert('If this still opens inside the app: tap ••• / menu → Open in Browser.');
  });
  if(copy) copy.addEventListener('click', async ()=>{
    try{ await navigator.clipboard.writeText(url); copy.textContent='Copied!'; setTimeout(()=>copy.textContent='Copy Link',1200); }catch{ alert('Copied link: '+url); }
  });
})();

// --- Tip jar links (PayPal wired)
const TIPJAR={ paypal:'https://www.paypal.com/donate?hosted_button_id=PQYG35KEQ8DT2&source=url', kofi:'', bmac:'' };

// --- Store + Raffle config
const SUBDOMAIN='7tarot';
const API_BASE=`https://api.bigcartel.com/${SUBDOMAIN}`;
const RAFFLE={ url:'https://raffall.com/393853/enter-raffle-to-win-my-own-personal-tarot-deck-hosted-by-steven-billy-abbott', title:'Win my personal tarot deck', endsAt:'', image:'assets/raffle-placeholder.png' };

const $=(s)=>document.querySelector(s);
const year=document.getElementById('year'); if(year) year.textContent=new Date().getFullYear().toString();

// Matrix rain
function matrixRain(){
  const canvas=document.getElementById('matrix'); if(!canvas) return;
  const ctx=canvas.getContext('2d');
  const resize=()=>{ canvas.width=window.innerWidth; canvas.height=window.innerHeight; };
  resize(); window.addEventListener('resize', resize);
  const chars='アカサタナハマヤラワ0123456789abcdefghijklm';
  const fontSize=16; let drops=[];
  function reset(){ const columns=Math.floor(canvas.width/fontSize); drops=Array.from({length:columns},()=>Math.random()*canvas.height); }
  reset(); window.addEventListener('resize', reset);
  (function draw(){
    ctx.fillStyle='rgba(10,15,10,0.07)'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='#00ff9c'; ctx.font=fontSize+'px monospace';
    for(let i=0;i<drops.length;i++){ const t=chars[Math.floor(Math.random()*chars.length)]; ctx.fillText(t,i*fontSize,drops[i]*fontSize); if(drops[i]*fontSize>canvas.height && Math.random()>0.975) drops[i]=0; drops[i]+=0.9; }
    requestAnimationFrame(draw);
  })();
}

// Tip Jar
function setupTipJar(){ const map=[['paypal','tip-paypal'],['kofi','tip-kofi'],['bmac','tip-bmac']]; let shown=0; map.forEach(([k,id])=>{ const url=(TIPJAR[k]||'').trim(); const el=document.getElementById(id); if(el && url){ el.href=url; el.style.display='inline-block'; shown++; } }); if(!shown){ document.getElementById('tip')?.remove(); } }

// Products
async function fetchProducts(){ const res=await fetch(`${API_BASE}/products.json`,{cache:'no-store',mode:'cors'}); if(!res.ok) throw new Error('Products fetch failed'); return res.json(); }
function money(n){ try{return new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP'}).format(n);}catch{return '£'+Number(n).toFixed(2);} }
function renderProducts(items){ const grid=$('#grid'), empty=$('#empty'); if(!grid) return; grid.innerHTML=''; if(!items.length){ empty&&(empty.style.display='block'); return; } empty&&(empty.style.display='none'); const frag=document.createDocumentFragment(); for(const p of items){ const img=(p.images&&p.images[0]&&(p.images[0].secure_url||p.images[0].url))||''; const price=p.on_sale&&p.options?.[0]?.price!==undefined?p.options[0].price:(p.price??p.default_price??0); const url=`https://${SUBDOMAIN}.bigcartel.com${p.url}?utm_source=7tarot-app&utm_medium=buy_button`; const soldOut=(p.options||[]).every(o=>o.sold_out); const el=document.createElement('article'); el.className='card'; el.innerHTML=`
      <a class="img-wrap" href="${url}" target="_blank" rel="noopener">
        <span class="bnpl">Finance available*</span>
        <img alt="${p.name}" src="${img}" onerror="this.src='https://dummyimage.com/600x600/0c130f/e7ffee&text=No+Image'">
      </a>
      <div class="name" style="padding:0 12px"><strong>${p.name}</strong></div>
      <div class="price-row" style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:0 12px;color:#9db8a8;font-size:.95rem">
        <div class="price" style="font-weight:800;color:#e7ffee">${money(price)}</div>
        <div>${soldOut?'Sold Out':'Available'}</div>
      </div>`; 
    frag.appendChild(el); } 
  grid.appendChild(frag); }

// Raffle
function setupRaffle(){ const img=$('#raffle-img'), title=$('#raffle-title-text'), ends=$('#raffle-ends'); const enter=$('#raffle-enter'), copy=$('#raffle-copy'), share=$('#raffle-share'); if(img) img.src = RAFFLE.image || 'assets/raffle-placeholder.png'; if(title) title.textContent = RAFFLE.title || 'Raffle'; if(enter) enter.href = RAFFLE.url; if(copy) copy.addEventListener('click',(e)=>{ e.preventDefault(); navigator.clipboard.writeText(RAFFLE.url).then(()=>{ copy.textContent='Link Copied!'; setTimeout(()=> copy.textContent='Copy Link',1200); }); }); if(share) share.addEventListener('click', async (e)=>{ e.preventDefault(); const data={ title:'7TAROT Raffle', text:RAFFLE.title, url:RAFFLE.url }; if(navigator.share){ try{ await navigator.share(data);}catch{} } else { navigator.clipboard.writeText(RAFFLE.url); share.textContent='Link Copied!'; setTimeout(()=> share.textContent='Share',1200); } }); const end = RAFFLE.endsAt ? new Date(RAFFLE.endsAt) : null; if(end && !isNaN(end.valueOf()) && ends){ const tick=()=>{ const now=new Date(); const diff=end-now; if(diff<=0){ ends.textContent='Raffle closed'; return; } const d=Math.floor(diff/(1000*60*60*24)); const h=Math.floor((diff/(1000*60*60))%24); const m=Math.floor((diff/(1000*60))%60); const s=Math.floor((diff/1000)%60); ends.textContent=`Ends in: ${d}d ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`; requestAnimationFrame(tick); }; tick(); } }

// Init
(async function(){
  matrixRain();
  setupTipJar();
  try{ const products=await fetchProducts(); renderProducts(products); }catch(e){ console.error(e); const grid=$('#grid'); if(grid) grid.innerHTML='<div style="padding:24px;color:#ffb3b3">Could not load products right now.</div>'; }
  setupRaffle();
})();
