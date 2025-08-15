// Clean fbclid/utm_* params
(()=>{try{const u=new URL(location.href),p=u.searchParams;['fbclid','gclid','utm_source','utm_medium','utm_campaign','utm_term','utm_content'].forEach(k=>p.delete(k));history.replaceState(null,'',u.origin+u.pathname+(p.toString()?'?'+p:'')+location.hash);}catch{}})();

// Show "Open in Browser" tip for Facebook/Instagram in-app
(function(){
  const ua = navigator.userAgent || '';
  const isIAB = /FBAN|FBAV|FB_IAB|Instagram/i.test(ua);
  if(isIAB){ const tip=document.getElementById('iab-tip'); if(tip) tip.style.display='block'; }
})();

// Store + Raffle
const SUB='7tarot', API=`https://api.bigcartel.com/${SUB}`;
const RAFFLE={ url:'https://raffall.com/393853/enter-raffle-to-win-my-own-personal-tarot-deck-hosted-by-steven-billy-abbott', title:'Win my personal tarot deck', endsAt:'' };
const $=(s)=>document.querySelector(s);
const year=document.getElementById('year'); if(year) year.textContent=new Date().getFullYear().toString();

async function products(){ const r=await fetch(`${API}/products.json`,{cache:'no-store',mode:'cors'}); if(!r.ok) throw 0; return r.json(); }
function money(n){ try{return new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP'}).format(n);}catch{return '£'+Number(n).toFixed(2);} }
function render(list){
  const g=$('#grid'),e=$('#empty'); g.innerHTML='';
  if(!list.length){ e.style.display='block'; return; } e.style.display='none';
  list.forEach(p=>{
    const img=(p.images&&p.images[0]&&(p.images[0].secure_url||p.images[0].url))||'';
    const price=p.on_sale&&p.options?.[0]?.price!==undefined?p.options[0].price:(p.price??p.default_price??0);
    const url=`https://${SUB}.bigcartel.com${p.url}?utm_source=7tarot-app&utm_medium=buy_button`;
    const soldOut=(p.options||[]).every(o=>o.sold_out);
    const el=document.createElement('article'); el.className='card';
    el.innerHTML=`
      <a class="img-wrap" href="${url}" target="_blank" rel="noopener">
        <img alt="${p.name}" src="${img}" loading="lazy" onerror="this.src='https://dummyimage.com/600x600/0c130f/e7ffee&text=No+Image'"/>
      </a>
      <div class="name" style="padding:0 12px"><strong>${p.name}</strong></div>
      <div class="price" style="padding:0 12px; color:#9db8a8">${money(price)} ${soldOut?'• Sold Out':''}</div>`;
    g.appendChild(el);
  });
}

function setupRaffle(){
  const t=$('#raffle-title-text'), e=$('#raffle-enter'), c=$('#raffle-copy'), s=$('#raffle-share');
  if(t) t.textContent=RAFFLE.title;
  if(e) e.href = RAFFLE.url;
  if(c) c.addEventListener('click', ev=>{ ev.preventDefault(); navigator.clipboard.writeText(RAFFLE.url).then(()=>{ c.textContent='Copied!'; setTimeout(()=> c.textContent='Copy Link',1200); }); });
  if(s) s.addEventListener('click', async ev=>{
    ev.preventDefault();
    const data={ title:'7TAROT Raffle', text:RAFFLE.title, url:RAFFLE.url };
    if(navigator.share){ try{ await navigator.share(data); } catch{} }
    else { navigator.clipboard.writeText(RAFFLE.url); s.textContent='Copied!'; setTimeout(()=> s.textContent='Share',1200); }
  });
  const end=RAFFLE.endsAt?new Date(RAFFLE.endsAt):null;
  const meta=document.getElementById('raffle-ends');
  if(end && !isNaN(end.valueOf()) && meta){
    const tick=()=>{ const now=new Date(), diff=end-now;
      if(diff<=0){ meta.textContent='Raffle closed'; return; }
      const d=Math.floor(diff/864e5), h=Math.floor(diff/36e5)%24, m=Math.floor(diff/6e4)%60, s=Math.floor(diff/1e3)%60;
      meta.textContent=`Ends in: ${d}d ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
      requestAnimationFrame(tick);
    }; tick();
  }
}

(async()=>{
  setupRaffle();
  try{ render(await products()); }catch(e){ document.querySelector('#grid').innerHTML='<div style="padding:12px;color:#ffb3b3">Could not load products right now.</div>'; }
})();