(() => {
  const lang=document.documentElement.lang==='zh-CN'?'zh':'en';
  try{localStorage.setItem('portfolio-language',lang)}catch{}
  document.querySelectorAll('[data-language]').forEach(a=>a.addEventListener('click',()=>{try{localStorage.setItem('portfolio-language',a.dataset.language)}catch{}}));
  document.querySelectorAll('.mobile-nav a').forEach(a=>a.addEventListener('click',()=>a.closest('details').removeAttribute('open')));
  const buttons=[...document.querySelectorAll('[data-filter]')];
  const cards=[...document.querySelectorAll('[data-category]')];
  const count=document.querySelector('[data-count]');
  buttons.forEach(btn=>btn.addEventListener('click',()=>{
    buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));
    let visible=0;cards.forEach(card=>{card.hidden=btn.dataset.filter!=='all'&&card.dataset.category!==btn.dataset.filter;if(!card.hidden)visible++});
    if(count)count.textContent=lang==='zh'?`${visible} 个项目`:`${String(visible).padStart(2,'0')} PROJECTS`;
  }));
  const v=document.querySelector('#hero-video'), toggle=document.querySelector('#video-toggle');
  if(v&&toggle){
    const label=()=>{toggle.textContent=v.paused?'▶':'Ⅱ';toggle.setAttribute('aria-label',lang==='zh'?(v.paused?'播放作品预览':'暂停作品预览'):(v.paused?'Play artwork preview':'Pause artwork preview'))};
    toggle.addEventListener('click',()=>{v.paused?v.play().catch(()=>{}):v.pause()});v.addEventListener('play',label);v.addEventListener('pause',label);
    const music=document.querySelector('#music-toggle');
    // Always begin muted; sound requires an explicit visitor action.
    v.muted=true;
    if(music){
      const soundLabel=()=>{
        const on=!v.muted&&v.volume>0;
        music.setAttribute('aria-pressed',String(on));
        music.querySelector('[data-music-label]').textContent=lang==='zh'?(on?'关闭音乐':'播放音乐'):(on?'Mute music':'Play music');
      };
      music.addEventListener('click',()=>{
        v.muted=!v.muted;
        if(!v.muted&&v.paused)v.play().catch(()=>{v.muted=true;soundLabel()});
        soundLabel();
      });
      v.addEventListener('volumechange',soundLabel);soundLabel();
    }
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)v.pause();label();
  }
})();
