// Clean URL params (fbclid/gclid/utm_*)
(()=>{try{const u=new URL(location.href),p=u.searchParams;['fbclid','gclid','utm_source','utm_medium','utm_campaign','utm_term','utm_content'].forEach(k=>p.delete(k));history.replaceState(null,'',u.origin+u.pathname+(p.toString()?'?'+p:'')+location.hash);}catch{}})();

const SUBDOMAIN='7tarot';
const API_BASE=`https://api.bigcartel.com/${SUBDOMAIN}`;
const BNPL_BADGE_TEXT='Installments available*';

const $=(s)=>document.querySelector(s);
const year=document.getElementById('year'); if(year) year.textContent=new Date().getFullYear().toString();

async function fetchProducts(){
  const res=await fetch(`${API_BASE}/products.json`,{cache:'no-store',mode:'cors'});
  if(!res.ok) throw new Error('Products fetch failed'); return res.json();
}
function money(n){ try{return new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP'}).format(n);}catch{return '£'+Number(n).toFixed(2);} }

function renderProducts(items){
  const grid=$('#grid'), empty=$('#empty'); if(!grid) return;
  grid.innerHTML='';
  if(!items.length){ if(empty) empty.style.display='block'; return; }
  if(empty) empty.style.display='none';
  const frag=document.createDocumentFragment();
  for(const p of items){
    const img=(p.images&&p.images[0]&&(p.images[0].secure_url||p.images[0].url))||'';
    const price=p.on_sale && p.options?.[0]?.price!==undefined ? p.options[0].price : (p.price??p.default_price??0);
    const url=`https://${SUBDOMAIN}.bigcartel.com${p.url}?utm_source=7tarot-app&utm_medium=buy_button&utm_campaign=shop`;
    const soldOut=(p.options||[]).every(o=>o.sold_out);
    const card=document.createElement('article');
    card.className='card';
    card.innerHTML=`
      <a class="img-wrap" href="${url}" target="_blank" rel="noopener">
        <span class="bnpl">${BNPL_BADGE_TEXT}</span>
        <img alt="${p.name}" src="${img}" loading="lazy" onerror="this.src='https://dummyimage.com/600x600/0c130f/e7ffee&text=No+Image'"/>
      </a>
      <div class="name">${p.name}</div>
      <div class="price-row" style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:0 12px;color:#9db8a8;font-size:.95rem">
        <div class="price" style="font-weight:800;color:#e7ffee">${money(price)}</div>
        <div>${soldOut?'Sold Out':'Available'}</div>
      </div>`;
    frag.appendChild(card);
  }
  grid.appendChild(frag);
}

// Init
(async function(){
  try{
    const products = await fetchProducts();
    renderProducts(products);
  }catch(e){
    console.error(e);
    const grid=$('#grid'); if(grid) grid.innerHTML='<div style="padding:24px;color:#ffb3b3">Could not load products right now.</div>';
  }
})();