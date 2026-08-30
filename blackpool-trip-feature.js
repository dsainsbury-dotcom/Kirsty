(()=>{
  function addBlackpoolTrip(){
    const home=document.getElementById('home');
    const timeline=document.getElementById('timeline');
    const blog=document.getElementById('blog-list');
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
    if(blog && blog.children.length && !document.getElementById('blog-blackpool-plan')){
      const item=document.createElement('div');
      item.className='time-item card';
      item.id='blog-blackpool-plan';
      item.style.marginBottom='16px';
      item.innerHTML=`<span class="date">30 Aug 2026</span><h3>Making Blackpool special before we even leave</h3><p>Created a full illustrated plan for the Blackpool trip with Mum and Dad and shared it with them. I wanted it to feel like a proper little adventure rather than just a list of bookings and times. The plan covers the house, travel and the things we are looking forward to, including the tower, high tea, the seafront, illuminations, bingo and Funny Girls.</p><p><b>Avoidance:</b> None. This was choosing to put time into something that matters to me.</p><p><b>What I did:</b> Turned the practical planning into something we can all look forward to together.</p><p><b>Values showing up:</b> Family · Connection · Enjoyment · Living again</p>`;
      blog.prepend(item);
    }
  }
  let tries=0;
  const timer=setInterval(()=>{addBlackpoolTrip();tries++;if((document.getElementById('blackpool-trip-card')&&document.getElementById('journey-blackpool-plan')&&document.getElementById('blog-blackpool-plan'))||tries>30)clearInterval(timer);},200);
})();
