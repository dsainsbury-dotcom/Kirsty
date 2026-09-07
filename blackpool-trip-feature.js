(()=>{
  const poster='assets/blackpool-trip-poster.svg';
  function addBlackpoolTripLibrary(){
    const library=document.getElementById('library-grid');
    if(library && !document.getElementById('library-blackpool-poster')){
      const card=document.createElement('div');
      card.className='card library-card';
      card.id='library-blackpool-poster';
      card.innerHTML=`<img src="${poster}" alt="Blackpool trip poster" style="width:100%;height:210px;object-fit:cover;object-position:top;border-radius:10px;margin-bottom:12px"><h3>Blackpool Trip Plan</h3><p>Illustrated family trip plan for 3-6 September 2026, created to share with Mum and Dad before the holiday.</p><a href="${poster}" target="_blank" rel="noopener">Open poster</a>`;
      library.prepend(card);
    }
  }
  let tries=0;
  const timer=setInterval(()=>{addBlackpoolTripLibrary();tries++;if(document.getElementById('library-blackpool-poster')||tries>40)clearInterval(timer);},200);
})();
