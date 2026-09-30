(()=>{
  const item=(text,status='',note='')=>`<div class="item"><span class="dot"></span><div><div>${text}</div>${status?`<span class="status ${status}">${status}</span>`:''}${note?`<small>${note}</small>`:''}</div></div>`;

  const applyUpdate=()=>{
    const weekTitle=document.getElementById('week-title');
    if(weekTitle) weekTitle.textContent='Observing the Stream';

    const weekSummary=document.getElementById('week-summary');
    if(weekSummary) weekSummary.textContent='The new homework is not about making my mind go quiet. It is about stepping back from the thought stream, noticing what my mind is doing, and letting the chatter carry on in the background without getting dragged along by it.';

    const asks=document.getElementById('week-asks');
    if(asks) asks.innerHTML=[
      item('Practise Observing the Stream for 2–3 minutes','open'),
      item('Notice where thoughts seem to show up and whether they feel still or moving','open'),
      item('Notice whether thoughts arrive as words, pictures, sounds or a mixture','open'),
      item('Let the thought stream carry on without trying to stop, fix or fight it','open')
    ].join('');

    const discussion=document.getElementById('week-discussion');
    if(discussion) discussion.innerHTML=[
      item('What did I notice about how my thoughts actually show up?'),
      item('Did the stream speed up, slow down or have any gaps?'),
      item('Could I let the thoughts be there without following every one of them?'),
      item('Did stepping back make it easier to get on with what I was doing?')
    ].join('');

    const themeCard=[...document.querySelectorAll('#home .stats .stat')].find(c=>c.querySelector('span')?.textContent.trim()==='Current theme');
    if(themeCard){
      const strong=themeCard.querySelector('strong');
      const small=themeCard.querySelector('small');
      if(strong) strong.textContent='Observing thoughts';
      if(small) small.textContent='step back, notice, let it flow';
    }

    const personalGoals=document.getElementById('personal-goals');
    if(personalGoals && !document.getElementById('goal-observing-stream')){
      const holder=document.createElement('div');
      holder.innerHTML=item('Practise Observing the Stream for 2–3 minutes','active','New homework from the 28 September Kirsty session.');
      const goal=holder.firstElementChild;
      goal.id='goal-observing-stream';
      personalGoals.prepend(goal);
    }

    const principles=document.getElementById('principles');
    if(principles && !document.getElementById('principle-thought-stream')){
      const chip=document.createElement('div');
      chip.className='chip';
      chip.id='principle-thought-stream';
      chip.innerHTML='<b>Thoughts can stay in the background</b><span>I do not have to silence every thought or follow it. I can notice the stream and still carry on with my life.</span>';
      principles.prepend(chip);
    }

    const sessions=document.getElementById('sessions-grid');
    if(sessions && !document.getElementById('kirsty-session-28sep')){
      const card=document.createElement('div');
      card.className='card session-card';
      card.id='kirsty-session-28sep';
      card.innerHTML='<span class="pill">28 Sep 2026 · COMPLETED</span><h3>Observing the Stream and the final stretch</h3><p><b>Session:</b> The previous homework was not completed because Kirsty and I agreed it was not really relevant, and I had not properly understood what it was asking me to do. This is not being treated as avoidance.</p><p><b>New homework:</b> Practise <b>Observing the Stream</b> for 2–3 minutes. Step back from the flow of thoughts, notice how and where they show up, and let them continue without trying to stop or fight them.</p><p><b>Next:</b> One final Kirsty session is booked for 14 October at 14:30. We are into the meditation/closing stage now. After the formal sessions finish, the logs and check-ins carry on.</p>';
      sessions.prepend(card);
    }

    const library=document.getElementById('library-grid');
    if(library && !document.getElementById('library-observing-stream')){
      const card=document.createElement('div');
      card.className='card library-card';
      card.id='library-observing-stream';
      card.innerHTML='<span class="pill">CURRENT HOMEWORK</span><h3>Observing the Stream</h3><p>Two to three minutes of stepping back from the stream of thoughts. Notice where thoughts seem to be, how they move and whether they show up as words, pictures, sounds or a mixture. The aim is to make room for the chatter, not shut it down.</p><a href="observing-the-stream.html" target="_blank">Open homework summary</a>';
      library.prepend(card);
    }

    const valuesPage=document.getElementById('values');
    if(valuesPage && !document.getElementById('values-current-practice')){
      const head=valuesPage.querySelector('.section-head');
      const card=document.createElement('div');
      card.className='card';
      card.id='values-current-practice';
      card.style.marginBottom='16px';
      card.innerHTML='<span class="pill">CURRENT PRACTICE</span><h3>What Observing the Stream supports</h3><p>Peace, health without obsession and living again. Thoughts can be present without having to run the whole show.</p>';
      head?.insertAdjacentElement('afterend',card);
    }

    const blog=document.getElementById('blog-list');
    if(blog && !document.getElementById('blog-28sep-final-stretch')){
      const entry=document.createElement('div');
      entry.className='time-item card';
      entry.id='blog-28sep-final-stretch';
      entry.style.marginBottom='16px';
      entry.innerHTML='<span class="date">28 Sep 2026</span><h3>The final stretch with Kirsty</h3><p>Met with Kirsty this week. I had not done the previous homework because we agreed it was not really relevant and I had not properly understood it. That is not going down as avoidance. The new homework is Observing the Stream: spend two or three minutes stepping back from the thoughts, noticing what they are doing, and letting them carry on in the background instead of trying to shut them up. I have one more session with Kirsty, then the meditation/closing work and that is the end of the formal journey. The logs are staying. I will keep recording what I am doing, how I am feeling, what I have done and anything that needs chasing.</p><p><b>Goals crossed:</b> Practise Observing the Stream · Keep the ongoing logs going after therapy ends</p><p><b>Avoidance:</b> The previous homework is not being treated as avoidance. It was not relevant and I had not understood it properly.</p><p><b>What I did:</b> Talked it through with Kirsty, dropped what was not useful and replaced it with a clearer exercise.</p><p><b>Values showing up:</b> Peace · Trust · Health without obsession · Living again</p>';
      blog.prepend(entry);
    }

    document.querySelectorAll('#diary .diary-entry').forEach(entry=>{
      const title=entry.querySelector('h3')?.textContent||'';
      const date=entry.querySelector('.diary-date')?.textContent||'';
      if(/Kirsty session/i.test(title) && /28 Sep 2026/.test(date) && !entry.querySelector('.therapy-note-28sep')){
        const note=document.createElement('small');
        note.className='therapy-note-28sep';
        note.textContent='Therapy update: previous homework dropped as not relevant; new homework is Observing the Stream.';
        entry.querySelector('.diary-main')?.appendChild(note);
      }
      if(/Kirsty session/i.test(title) && /14 Oct 2026/.test(date) && !entry.querySelector('.therapy-note-14oct')){
        const note=document.createElement('small');
        note.className='therapy-note-14oct';
        note.textContent='Final Kirsty session. Meditation/closing stage, then the formal sessions end and the ongoing logs continue.';
        entry.querySelector('.diary-main')?.appendChild(note);
      }
    });
  };

  let tries=0;
  const timer=setInterval(()=>{
    applyUpdate();
    if(++tries>=30) clearInterval(timer);
  },300);
  applyUpdate();
})();