window.addEventListener('load',()=>{
  setTimeout(()=>{
    const grid=document.getElementById('memories-grid');
    if(!grid) return;
    const m={date:'23 Aug 2026',category:'Garden & Allotment',title:'More babies to look after',image:'assets/memories/2026-08-23-plants-working.jpg',alt:'Dwarf bean plants from Ingham’s garden centre',caption:'Went to Ingham’s and picked up my dwarf beans, plus a couple of chillies and a kiwi plant. More babies to look after.',why:'A simple happy gardening moment and more things to nurture at home.',values:['Hobbies','Home','Enjoyment','Living again']};
    const card=`<article class="memory-card card"><img class="memory-image" src="${m.image}?v=20260825-2" alt="${m.alt}" loading="eager"><div class="memory-body"><div class="memory-meta">${m.date} · ${m.category}</div><h3>${m.title}</h3><p>${m.caption}</p><p><b>Why I keep it:</b> ${m.why}</p><small>Values: ${m.values.join(' · ')}</small></div></article>`;
    grid.insertAdjacentHTML('afterbegin',card);
  },300);
});
