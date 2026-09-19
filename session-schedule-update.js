(()=>{
  const parseKirsty=async()=>{
    const grid=document.getElementById('sessions-grid');
    if(!grid)return;
    document.getElementById('kirsty-schedule-live')?.remove();
    document.getElementById('kirsty-schedule-25aug')?.remove();
    try{
      const r=await fetch('data/home-diary.json?ts='+Date.now());
      if(!r.ok)throw new Error('diary '+r.status);
      const data=await r.json();
      const rows=(data.entries||[]).filter(x=>x.status==='planned' && /kirsty/i.test((x.title||'')+' '+(x.detail||''))).sort((a,b)=>(a.dateISO||'').localeCompare(b.dateISO||''));
      const next=rows[0];
      const homeDate=document.getElementById('next-appointment'),homeTime=document.getElementById('next-appointment-time');
      if(homeDate)homeDate.textContent=next?(next.date||next.dateISO):'None booked';
      if(homeTime)homeTime.textContent=next?(next.detail||next.title||''):'';
      const card=document.createElement('div');
      card.className='card session-card';card.id='kirsty-schedule-live';
      card.innerHTML='<span class="pill">LIVE DIARY</span><h3>Upcoming Kirsty sessions</h3>'+(rows.length?rows.map(x=>`<p><b>${x.date||x.dateISO}:</b> ${x.detail||x.title||''}</p>`).join(''):'<p>No upcoming Kirsty session is currently in the synced diary.</p>')+'<p><b>Status:</b> Automatically updated from the Google diary sync.</p>';
      grid.prepend(card);
    }catch(e){console.error('Could not build live Kirsty schedule',e);}
  };
  let tries=0;const timer=setInterval(()=>{tries++;if(document.getElementById('sessions-grid')?.children.length||tries>20){clearInterval(timer);parseKirsty();}},250);
})();