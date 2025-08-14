
// iPhone-friendly share wiring (keeps copy fallback + explicit share links)
const RAFFLE = {
  url: 'https://raffall.com/393853/enter-raffle-to-win-my-own-personal-tarot-deck-hosted-by-steven-billy-abbott',
  title: 'Win my personal tarot deck',
  endsAt: '',
  image: 'assets/raffle-placeholder.png'
};

function $(s){ return document.querySelector(s); }
function toast(msg){ const t=$('#toast'); if(!t) return; t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'), 1400); }

function setup(){
  const enter=$('#raffle-enter'), copy=$('#raffle-copy'), wa=$('#share-wa'), tw=$('#share-tw'), fb=$('#share-fb');
  if(enter) enter.href = RAFFLE.url;
  if(copy) copy.addEventListener('click', (e)=>{ e.preventDefault(); navigator.clipboard.writeText(RAFFLE.url).then(()=> toast('Link copied')); });
  // Explicit share links for iPhone
  const msg = encodeURIComponent(`${RAFFLE.title} — ${RAFFLE.url}`);
  if(wa) wa.href = `https://wa.me/?text=${msg}`;
  if(tw) tw.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(RAFFLE.title)}&url=${encodeURIComponent(RAFFLE.url)}`;
  if(fb) fb.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(RAFFLE.url)}`;
}

document.addEventListener('DOMContentLoaded', setup);
