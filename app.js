async function boot(){
  const res = await fetch('data/site-data.json');
  const d = await res.json();

  document.getElementById('site-title').textContent=d.site.title;
  document.getElementById('site-subtitle').textContent=d.site.subtitle;
  document.getElementById('updated').textContent='Updated '+d.site.updated;
  document.getElementById('week-title').textContent=d.thisWeek.title;
  document.getElementById('week-summary').textContent=d.thisWeek.summary;
  document.getElementById('reading-count').textContent=d.progress.readingConfirmed;

  if(d.nextAppointment){
    document.getElementById('next-appointment').textContent=d.nextAppointment.date;
    document.getElementById('next-appointment-time').textContent=d.nextAppointment.time;
  }

  const item=(x)=>`<div class="item"><span class="dot"></span><div><div>${x.text}</div>${x.status?`<span class="status ${x.status}">${x.status}</span>`:''}${x.note?`<small>${x.note}</small>`:''}</div></div>`;
  document.getElementById('week-asks').innerHTML=d.thisWeek.asks.map(item).join('');
  document.getElementById('week-discussion').innerHTML=d.thisWeek.discussion.map(x=>item({text:x})).join('');
  document.getElementById('personal-goals').innerHTML=d.currentGoals.personal.map(item).join('');
  document.getElementById('work-goals').innerHTML=d.currentGoals.work.map(item).join('');
  document.getElementById('values-grid').innerHTML=d.values.map(v=>`<div class="card value-card"><h3>${v.name}</h3><p>${v.text}</p></div>`).join('');
  document.getElementById('principles').innerHTML=d.principles.map(p=>`<div class="chip"><b>${p.title}</b><span>${p.text}</span></div>`).join('');
  document.getElementById('avoidance-wins').innerHTML=d.progress.avoidanceWins.map(x=>item({text:x})).join('');
  document.getElementById('recent-wins').innerHTML=d.progress.recentWins.map(x=>item({text:x})).join('');
  document.getElementById('timeline').innerHTML=d.timeline.map(t=>`<div class="time-item"><span class="date">${t.date}</span><h3>${t.title}</h3><p>${t.text}</p></div>`).join('');

  const daily=[...d.dailyLog].reverse();
  document.getElementById('daily-log').innerHTML=daily.map(r=>`<tr><td>${r.date}</td><td>${r.personal||''}</td><td>${r.work||''}</td><td>${r.avoidance||''}</td><td>${r.response||''}</td></tr>`).join('');

  if(d.sessions){
    document.getElementById('sessions-grid').innerHTML=[...d.sessions].reverse().map(s=>`<div class="card session-card"><span class="pill">${s.date}</span><h3>${s.title}</h3><p><b>Session / ask:</b> ${s.ask}</p><p><b>What I did:</b> ${s.progress}</p><p><b>Next focus:</b> ${s.next}</p>${s.source?`<small>${s.source}</small>`:''}</div>`).join('');
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

  document.getElementById('diary-done-count').textContent=done.length;
  document.getElementById('diary-planned-count').textContent=planned.length;
  document.getElementById('diary-waiting-count').textContent=waiting.length;

  const renderEntry=(x)=>`<div class="diary-entry">
    <div class="diary-date">${x.date||'No date'}</div>
    <div class="diary-main">
      <div class="diary-title-row"><h3>${x.title}</h3><span class="status ${x.status}">${x.status}</span></div>
      <p>${x.detail||''}</p>${x.category?`<small>${x.category}</small>`:''}
    </div>
  </div>`;

  const renderList=(id,rows,emptyText)=>{
    const el=document.getElementById(id);
    if(el) el.innerHTML=rows.length?rows.map(renderEntry).join(''):`<p>${emptyText}</p>`;
  };

  renderList('diary-planned-list',planned,'Nothing planned.');
  renderList('diary-done-list',done.slice(0,20),'Nothing completed yet.');
  renderList('diary-waiting-list',waiting,'Nothing waiting.');
  renderList('home-upcoming',planned.slice(0,5),'Nothing planned.');
  renderList('home-recent',done.slice(0,5),'Nothing completed yet.');

  if(!waiting.length){
    const waitingSection=document.getElementById('diary-waiting-section');
    if(waitingSection) waitingSection.style.display='none';
  }

  document.getElementById('library-grid').innerHTML=d.library.map(x=>`<div class="card library-card"><h3>${x.title}</h3><p>${x.desc}</p><a href="${x.file}" target="_blank">Open PDF</a></div>`).join('');

  document.querySelectorAll('.nav button').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('.nav button').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.target).classList.add('active');
    window.scrollTo({top:0,behavior:'smooth'});
  }));
}

boot().catch(err=>{
  document.body.insertAdjacentHTML('beforeend',`<p style="padding:20px;color:#ffc76b">Could not load site data: ${err.message}</p>`);
});
