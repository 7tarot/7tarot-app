
(async function(){
  const el = (t, a={}, ...kids) => {
    const n = document.createElement(t);
    Object.entries(a).forEach(([k,v])=>{ if(k==='class') n.className=v; else if(k==='style') Object.assign(n.style,v); else n.setAttribute(k,v); });
    for(const k of kids) n.appendChild(typeof k==='string'?document.createTextNode(k):k);
    return n;
  };
  const results = document.getElementById('results');
  const add = (title, body) => {
    const box = el('div',{class:'box'}, el('div',{class:'row'}, el('strong',{}, title)), body);
    results.appendChild(box);
  };
  const pill = (ok, text) => el('span',{class:`pill ${ok?'ok':'err'}`}, text);

  // 1) deck.json
  let deckOk=false, deck=null, deckErr=null;
  try{
    const r = await fetch('/data/deck.json?v='+Date.now(), {cache:'no-store'});
    deckOk = r.ok;
    if(deckOk){ deck = await r.json(); }
    else deckErr = 'HTTP '+r.status+' '+r.statusText;
  }catch(e){ deckErr = e.message; }
  add('deck.json', el('div',{}, 
     pill(deckOk, deckOk?'Loaded':'Failed'),
     el('div',{class:'url'}, deckOk? '/data/deck.json ✔' : '/data/deck.json ✖'),
     el('div',{}, deckOk ? `Cards found: ${Array.isArray(deck.cards)?deck.cards.length:'unknown'}` : `Error: ${deckErr || 'unknown'}`)
  ));

  // 2) placeholder
  const testImg = (url) => new Promise(res=>{
    const i = new Image();
    i.onload = () => res({ok:true, url, w:i.naturalWidth, h:i.naturalHeight});
    i.onerror = () => res({ok:false, url});
    i.src = url+'?v='+Date.now();
  });
  const ph = await testImg('/assets/cards/placeholder.png');
  add('Placeholder image', el('div',{}, pill(ph.ok, ph.ok?'Loaded':'Failed'), el('div',{class:'url'}, ph.url)));

  // 3) sample card images from deck
  let sample = [];
  try { sample = (deck && Array.isArray(deck.cards)) ? deck.cards.slice(0,8) : []; } catch{}
  const group = el('div',{});
  if(sample.length){
    for(const c of sample){
      const url = '/' + (c.image||'').replace(/^\//,'');
      const res = await testImg(url);
      group.appendChild(el('div',{}, pill(res.ok, res.ok?'OK':'Missing'), ' ', el('span',{class:'url'}, url), ' — ', c.name));
    }
  }else{
    group.appendChild(el('div',{}, 'No cards available to test.'));
  }
  add('First 8 card images', group);

  // 4) summary & tips
  const tips = el('div',{}, el('div',{class:'small'}, 'If anything failed above, fix one of the common causes:'),
    el('ul',{},
      el('li',{}, 'Publish directory mismatch — move ', el('code',{}, 'data'), ' and ', el('code',{}, 'assets'), ' into your publish folder, or change Netlify “Publish directory” to your repo root.'),
      el('li',{}, 'File names must be lowercase and match slugs exactly, e.g. ', el('code',{}, 'three-of-wands.png')),
      el('li',{}, 'Hard refresh: ', el('code',{}, 'Ctrl+F5'), ' / ', el('code',{}, 'Cmd+Shift+R'))
    )
  );
  add('Summary', tips);
})();