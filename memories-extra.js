window.addEventListener('load',()=>{
  setTimeout(async()=>{
    try{
      const res=await fetch('data/memories-extra.json?ts='+Date.now());
      if(!res.ok) return;
      const data=await res.json();
      const grid=document.getElementById('memories-grid');
      if(!grid) return;
      const cards=(data.entries||[]).slice().reverse().map(m=>`<article class="memory-card card">
        ${m.image?`<img class="memory-image" src="${m.image}?v=1" alt="${m.alt||m.title||'Memory photo'}" loading="lazy">`:''}
        <div class="memory-body">
          <div class="memory-meta">${m.date||'Date not needed'}${m.category?` · ${m.category}`:''}</div>
          <h3>${m.title||'A good memory'}</h3>
          ${m.caption?`<p>${m.caption}</p>`:''}
          ${m.why?`<p><b>Why I keep it:</b> ${m.why}</p>`:''}
          ${(m.values||[]).length?`<small>Values: ${(m.values||[]).join(' · ')}</small>`:''}
        </div>
      </article>`).join('');
      if(cards) grid.insertAdjacentHTML('afterbegin',cards);
    }catch(e){console.warn('Extra memories unavailable',e);}
  },700);
});
