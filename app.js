function setupNavigation(){
  document.querySelectorAll('.nav button').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const target=btn.dataset.target;
      const page=document.getElementById(target);
      if(!page) return;
      document.querySelectorAll('.nav button').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
      btn.classList.add('active');
      page.classList.add('active');
      window.scrollTo({top:0,behavior:'smooth'});
    });
  });
}

setupNavigation();

async function boot(){
  const res = await fetch('data/site-data.json?ts='+Date.now());
  if(!res.ok) throw new Error(`site-data.json returned ${res.status}`);
  const d = await res.json();

  let live={};
  try{
    const liveRes=await fetch('data/live-updates.json?ts='+Date.now());
    if(liveRes.ok) live=await liveRes.json();
  }catch(e){
    console.warn('Live updates unavailable',e);
  }

  const setText=(id,value)=>{const el=document.getElementById(id);if(el) el.textContent=value??'';};
  const setHTML=(id,value)=>{const el=document.getElementById(id);if(el) el.innerHTML=value??'';};

  setText('site-title',d.site?.title);
  setText('site-subtitle',d.site?.subtitle);
  setText('updated',(live.updated||d.site?.updated)?'Updated '+(live.updated||d.site?.updated):'');
  setText('week-title',d.thisWeek?.title);
  setText('week-summary',d.thisWeek?.summary);
  setText('reading-count',live.reading?.confirmed ?? d.progress?.readingConfirmed);

  if(d.nextAppointment){
    setText('next-appointment',d.nextAppointment.date);
    setText('next-appointment-time',d.nextAppointment.time);
  }

  const item=(x)=>`<div class="item"><span class="dot"></span><div><div>${x.text}</div>${x.status?`<span class="status ${x.status}">${x.status}</span>`:''}${x.note?`<small>${x.note}</small>`:''}</div></div>`;
  setHTML('week-asks',(d.thisWeek?.asks||[]).map(item).join(''));
  setHTML('week-discussion',(d.thisWeek?.discussion||[]).map(x=>item({text:x})).join(''));

  let personalGoals=[...(d.currentGoals?.personal||[])];
  const completed=new Set(live.completedGoals||[]);
  personalGoals=personalGoals.filter(g=>!completed.has(g.text));
  if(live.reading?.goalNote){
    personalGoals=personalGoals.map(g=>g.text==='Continue reading The Secret of Secrets'?{...g,note:live.reading.goalNote}:g);
  }
  setHTML('personal-goals',personalGoals.map(item).join(''));
  setHTML('work-goals',(d.currentGoals?.work||[]).map(item).join(''));
  setHTML('values-grid',(d.values||[]).map(v=>`<div class="card value-card"><h3>${v.name}</h3><p>${v.text}</p></div>`).join(''));
  setHTML('principles',(d.principles||[]).map(p=>`<div class="chip"><b>${p.title}</b><span>${p.text}</span></div>`).join(''));
  setHTML('avoidance-wins',(d.progress?.avoidanceWins||[]).map(x=>item({text:x})).join(''));

  const recentWins=[...(live.recentWins||[]),...(d.progress?.recentWins||[])];
  setHTML('recent-wins',recentWins.map(x=>item({text:x})).join(''));
  setHTML('timeline',(d.timeline||[]).map(t=>`<div class="time-item"><span class="date">${t.date}</span><h3>${t.title}</h3><p>${t.text}</p></div>`).join(''));

  const daily=[...(d.dailyLog||[]),...(live.dailyLog||[])].reverse();
  setHTML('daily-log',daily.map(r=>`<tr><td>${r.date}</td><td>${r.personal||''}</td><td>${r.work||''}</td><td>${r.avoidance||''}</td><td>${r.response||''}</td></tr>`).join(''));

  if(Array.isArray(live.lookingForward) && live.lookingForward.length){
    const home=document.getElementById('home');
    if(home && !document.getElementById('looking-forward-card')){
      const card=document.createElement('div');
      card.className='card';
      card.id='looking-forward-card';
      card.style.marginBottom='16px';
      card.innerHTML=`<span class="pill">LOOKING FORWARD TO</span><div style="margin-top:10px">${live.lookingForward.map(x=>`<div class="item"><span class="dot"></span><div><div><b>${x.title}</b></div><small>${x.detail||''}${x.values?`<br>${x.values}`:''}</small></div></div>`).join('')}</div>`;
      const currentAsk=[...home.querySelectorAll('.grid.two')].find(el=>el.textContent.includes('Current ask'));
      if(currentAsk) home.insertBefore(card,currentAsk); else home.appendChild(card);
    }
  }

  if(d.sessions){
    setHTML('sessions-grid',[...d.sessions].reverse().map(s=>`<div class="card session-card"><span class="pill">${s.date}</span><h3>${s.title}</h3><p><b>Session / ask:</b> ${s.ask}</p><p><b>What I did:</b> ${s.progress}</p><p><b>Next focus:</b> ${s.next}</p>${s.source?`<small>${s.source}</small>`:''}</div>`).join(''));
  }

  let diaryPayload=null;
  try{
    const diaryRes=await fetch('data/home-diary.json?ts='+Date.now());
    if(diaryRes.ok) diaryPayload=await diaryRes.json();
  }catch(e){
    console.warn('Synced diary unavailable',e);
  }

  const diary=(diaryPayload?.entries?.length?diaryPayload.entries:(d.homeDiary||[])).map(x=>({...x}));
  const sortKey=(x)=>x.dateISO||'';
  const planned=diary.filter(x=>x.status==='planned').sort((a,b)=>sortKey(a).localeCompare(sortKey(b)));
  const done=diary.filter(x=>x.status==='done').sort((a,b)=>sortKey(b).localeCompare(sortKey(a)));
  const waiting=diary.filter(x=>x.status==='waiting');

  setText('diary-done-count',done.length);
  setText('diary-planned-count',planned.length);
  setText('diary-waiting-count',waiting.length);

  const renderEntry=(x)=>`<div class="diary-entry"><div class="diary-date">${x.date||''}</div><div class="diary-main"><div class="diary-title-row"><h3>${x.title}</h3><span class="status ${x.status}">${x.status}</span></div><p>${x.detail||''}</p>${x.category?`<small>${x.category}</small>`:''}</div></div>`;
  const renderList=(id,rows,emptyText)=>setHTML(id,rows.length?rows.map(renderEntry).join(''):`<p>${emptyText}</p>`);

  renderList('diary-planned-list',planned,'Nothing planned.');
  renderList('diary-done-list',done.slice(0,20),'Nothing completed yet.');
  renderList('diary-waiting-list',waiting,'Nothing waiting.');
  renderList('home-upcoming',planned.slice(0,5),'Nothing planned.');
  renderList('home-recent',done.slice(0,5),'Nothing completed yet.');

  const waitingSection=document.getElementById('diary-waiting-section');
  if(waitingSection) waitingSection.style.display=waiting.length?'':'none';

  setHTML('library-grid',(d.library||[]).map(x=>`<div class="card library-card"><h3>${x.title}</h3><p>${x.desc}</p><a href="${x.file}" target="_blank">Open PDF</a></div>`).join(''));
}

boot().catch(err=>{
  console.error(err);
  const existing=document.getElementById('data-error');
  if(!existing){
    document.body.insertAdjacentHTML('beforeend',`<p id="data-error" style="padding:20px;color:#ffc76b">Some dashboard data could not load: ${err.message}. Navigation will still work.</p>`);
  }
});
