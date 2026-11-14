(() => {
 const hero=document.getElementById('home'),slides=[...document.querySelectorAll('.campus-slide')],dots=[...document.querySelectorAll('[data-campus-slide]')],toggle=document.getElementById('campus-slide-toggle'),count=document.getElementById('campus-slide-count');
 if(!hero||!slides.length||!toggle)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let current=0,paused=reduced.matches,timer=null,inView=true,hover=false,focused=false,request=0;
 const hydrate=img=>{if(img.dataset.src){img.src=img.dataset.src;delete img.dataset.src;}};
 function schedule(){clearTimeout(timer);if(!paused&&!document.hidden&&inView&&!hover&&!focused)timer=setTimeout(()=>show((current+1)%slides.length),9000);}
 function label(){toggle.textContent=paused?'Putar foto':'Jeda foto';toggle.setAttribute('aria-label',paused?'Putar pergantian foto latar':'Jeda pergantian foto latar');}
 async function show(next){const id=++request;hydrate(slides[next]);try{await slides[next].decode();}catch(e){schedule();return;}if(id!==request)return;slides[current].classList.remove('is-visible');current=next;slides[current].classList.add('is-visible');dots.forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===current)));count.textContent=`${String(current+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;schedule();}
 dots.forEach((dot,i)=>dot.addEventListener('click',()=>{paused=true;label();show(i);}));
 toggle.addEventListener('click',()=>{paused=!paused;label();schedule();});
 hero.addEventListener('mouseenter',()=>{hover=true;schedule();});hero.addEventListener('mouseleave',()=>{hover=false;schedule();});
 hero.addEventListener('focusin',()=>{focused=true;schedule();});hero.addEventListener('focusout',()=>{setTimeout(()=>{focused=hero.contains(document.activeElement);schedule();},0);});
 document.addEventListener('visibilitychange',schedule);reduced.addEventListener('change',()=>{paused=reduced.matches;label();schedule();});
 if('IntersectionObserver'in window)new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;schedule();},{threshold:.1}).observe(hero);
 label();schedule();
})();
