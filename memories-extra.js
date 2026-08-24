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

  setTimeout(()=>{
    const diary=document.getElementById('diary');
    if(!diary || document.getElementById('diary-view-switcher')) return;

    const plannedSection=document.getElementById('diary-planned-list')?.closest('.diary-section');
    const doneSection=document.getElementById('diary-done-list')?.closest('.diary-section');
    const waitingSection=document.getElementById('diary-waiting-section');
    if(!plannedSection || !doneSection) return;

    const switcher=document.createElement('div');
    switcher.id='diary-view-switcher';
    switcher.style.cssText='display:flex;gap:10px;flex-wrap:wrap;margin:0 0 16px';
    switcher.innerHTML=`
      <button type="button" data-diary-view="planned" style="border:1px solid var(--accent);background:var(--panel2);color:var(--text);padding:10px 14px;border-radius:999px;font-weight:800;cursor:pointer">Planned</button>
      <button type="button" data-diary-view="done" style="border:1px solid var(--line);background:transparent;color:var(--muted);padding:10px 14px;border-radius:999px;font-weight:800;cursor:pointer">View completed</button>`;

    const stats=diary.querySelector('.stats');
    if(stats) stats.insertAdjacentElement('afterend',switcher);
    else diary.querySelector('.section-head')?.insertAdjacentElement('afterend',switcher);

    const buttons=[...switcher.querySelectorAll('button')];
    const showView=(view)=>{
      const showDone=view==='done';
      plannedSection.style.display=showDone?'none':'';
      doneSection.style.display=showDone?'':'none';
      if(waitingSection) waitingSection.style.display=showDone?'none':(document.getElementById('diary-waiting-count')?.textContent==='0'?'none':'');
      buttons.forEach(btn=>{
        const active=btn.dataset.diaryView===view;
        btn.style.borderColor=active?'var(--accent)':'var(--line)';
        btn.style.background=active?'var(--panel2)':'transparent';
        btn.style.color=active?'var(--text)':'var(--muted)';
      });
    };

    buttons.forEach(btn=>btn.addEventListener('click',()=>showView(btn.dataset.diaryView)));
    showView('planned');
  },900);
});
