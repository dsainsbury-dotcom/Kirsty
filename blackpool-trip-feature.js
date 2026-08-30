(()=>{
  function addBlackpoolTrip(){
    const home=document.getElementById('home');
    const timeline=document.getElementById('timeline');
    if(home && window.BLACKPOOL_TRIP_POSTER && !document.getElementById('blackpool-trip-card')){
      const card=document.createElement('div');
      card.className='card';
      card.id='blackpool-trip-card';
      card.style.marginBottom='16px';
      card.innerHTML=`<span class="pill">LOOKING FORWARD TO</span><h3 style="margin:10px 0 6px">Blackpool with Mum & Dad</h3><p style="margin:0 0 14px">3-6 September 2026. A proper little family adventure, planned to make the trip feel special before we even leave.</p><img src="${window.BLACKPOOL_TRIP_POSTER}" alt="Blackpool trip plan, 3rd to 6th September 2026" style="display:block;width:min(100%,520px);height:auto;margin:0 auto;border-radius:14px;border:1px solid var(--line);box-shadow:0 12px 32px rgba(0,0,0,.24)"><small style="display:block;margin-top:12px">Family · connection · enjoyment · living again</small>`;
      const hero=home.querySelector('.hero');
      if(hero) hero.insertAdjacentElement('afterend',card); else home.prepend(card);
    }
    if(timeline && timeline.children.length && !document.getElementById('journey-blackpool-plan')){
      const item=document.createElement('div');
      item.className='time-item';
      item.id='journey-blackpool-plan';
      item.innerHTML=`<span class="date">30 August 2026</span><h3>Making Blackpool feel special before we go</h3><p>Created a full illustrated trip plan for Blackpool with Mum and Dad and shared it with them before the holiday. It turned the practical itinerary into something to look forward to together and made the family time feel important before the trip had even started.</p><small>Values showing up: Family · connection · enjoyment · living again</small>`;
      timeline.appendChild(item);
    }
  }
  let tries=0;
  const timer=setInterval(()=>{addBlackpoolTrip();tries++;if((document.getElementById('blackpool-trip-card')&&document.getElementById('journey-blackpool-plan'))||tries>30)clearInterval(timer);},200);
})();
