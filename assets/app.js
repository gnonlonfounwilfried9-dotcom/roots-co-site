document.documentElement.classList.add('js');

/* ---------- theme (persistent) ---------- */
(function(){
  var saved='light'; try{saved=localStorage.getItem('rootsco_theme')||'light';}catch(e){}
  if(saved==='dark') document.documentElement.setAttribute('data-theme','dark');
  function toggle(){
    var d=document.documentElement.getAttribute('data-theme')==='dark';
    if(d) document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme','dark');
    try{localStorage.setItem('rootsco_theme', d?'light':'dark');}catch(e){}
  }
  document.addEventListener('click',function(e){ if(e.target.closest('.themebtn')) toggle(); });
})();

/* ---------- language (persistent) ---------- */
(function(){
  document.querySelectorAll('[data-en]').forEach(function(el){el.setAttribute('data-fr', el.textContent);});
  document.querySelectorAll('[data-en-ph]').forEach(function(el){el.setAttribute('data-fr-ph', el.getAttribute('placeholder')||'');});
  function setLang(l){
    document.querySelectorAll('[data-en]').forEach(function(el){el.textContent = l==='en'?el.getAttribute('data-en'):el.getAttribute('data-fr');});
    document.querySelectorAll('[data-en-ph]').forEach(function(el){el.placeholder = l==='en'?el.getAttribute('data-en-ph'):el.getAttribute('data-fr-ph');});
    document.documentElement.lang=l;
    document.querySelectorAll('#lang button').forEach(function(b){b.classList.toggle('on', b.dataset.l===l);});
    try{localStorage.setItem('rootsco_lang', l);}catch(e){}
    if(window.__setHeroWords) window.__setHeroWords(l);
  }
  window.__setLang=setLang;
  var saved='fr'; try{saved=localStorage.getItem('rootsco_lang')||'fr';}catch(e){}
  document.querySelectorAll('#lang button').forEach(function(b){b.addEventListener('click',function(){setLang(b.dataset.l);});});
  window.addEventListener('DOMContentLoaded',function(){ if(saved==='en') setLang('en'); });
})();

/* ---------- nav + progress + back-to-top ---------- */
(function(){
  var nav=document.getElementById('nav'), bar=document.querySelector('.progress'), tt=document.querySelector('.totop');
  function onScroll(){
    var y=window.scrollY;
    if(nav) nav.classList.toggle('scrolled', y>40);
    if(bar){var h=document.documentElement.scrollHeight-window.innerHeight; bar.style.width=(h>0?y/h*100:0)+'%';}
    if(tt) tt.classList.toggle('show', y>560);
  }
  window.addEventListener('scroll',onScroll,{passive:true}); onScroll();
  if(tt) tt.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'});});
})();

/* ---------- mobile menu ---------- */
(function(){
  var b=document.getElementById('burger'), l=document.getElementById('navlinks');
  if(!b||!l) return;
  b.addEventListener('click',function(){l.classList.toggle('open'); b.classList.toggle('x');});
  l.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){l.classList.remove('open'); b.classList.remove('x');});});
})();

/* ---------- active nav link ---------- */
(function(){
  var path=(location.pathname.split('/').pop()||'index.html');
  document.querySelectorAll('#navlinks a').forEach(function(a){
    if((a.getAttribute('href')||'')===path) a.classList.add('active');
  });
})();

/* ---------- reveal ---------- */
(function(){
  var els=document.querySelectorAll('[data-reveal]');
  if(!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('is-in');}); return;}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('is-in'); io.unobserve(e.target);}});},{threshold:.1,rootMargin:'0px 0px -5% 0px'});
  els.forEach(function(e){io.observe(e);});
})();

/* ---------- count up ---------- */
(function(){
  function up(el){var t=+el.dataset.count,dur=1700,t0=performance.now();(function s(n){var p=Math.min((n-t0)/dur,1),e=1-Math.pow(1-p,3);el.textContent=Math.round(e*t);if(p<1)requestAnimationFrame(s);})(t0);}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.querySelectorAll('.ct').forEach(up); io.unobserve(e.target);}});},{threshold:.5});
  document.querySelectorAll('.stat,[data-counters]').forEach(function(s){io.observe(s);});
})();

/* ---------- donut + bars ---------- */
(function(){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('on'); io.unobserve(e.target);}});},{threshold:.4});
  document.querySelectorAll('.donut,.bar').forEach(function(el){io.observe(el);});
})();

/* ---------- process diagram ---------- */
(function(){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('on'); io.unobserve(e.target);}});},{threshold:.3});
  document.querySelectorAll('.process').forEach(function(el){io.observe(el);});
})();

/* ---------- rotating hero words ---------- */
(function(){
  var el=document.querySelector('.rot'); if(!el) return;
  var fr=(el.getAttribute('data-words-fr')||'').split('|');
  var en=(el.getAttribute('data-words-en')||'').split('|');
  var i=0;
  function arr(){ return (document.documentElement.lang==='en' && en.length)?en:fr; }
  function tick(){ var a=arr(); el.style.opacity='0'; el.style.transform='translateY(12px)';
    setTimeout(function(){ el.textContent=a[i%a.length]; el.style.opacity='1'; el.style.transform='none'; i++; },600); }
  el.textContent=fr[0]||el.textContent;
  setTimeout(tick,1800); setInterval(tick,3400);
})();

/* ---------- parallax ---------- */
(function(){
  var els=[].slice.call(document.querySelectorAll('[data-parallax]'));
  if(!els.length) return; var ticking=false;
  function upd(){var vh=window.innerHeight; els.forEach(function(el){var sp=parseFloat(el.dataset.parallax)||.12; var r=el.getBoundingClientRect(); var off=(r.top+r.height/2-vh/2); el.style.transform='translate3d(0,'+(off*-sp).toFixed(1)+'px,0)';}); ticking=false;}
  window.addEventListener('scroll',function(){if(!ticking){requestAnimationFrame(upd); ticking=true;}},{passive:true});
  window.addEventListener('resize',upd); upd();
})();

/* ---------- tilt ---------- */
(function(){
  if(matchMedia('(hover:none)').matches) return;
  document.querySelectorAll('.tilt').forEach(function(c){
    c.addEventListener('mousemove',function(e){var r=c.getBoundingClientRect();var x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.style.transform='perspective(820px) rotateX('+(-y*5).toFixed(2)+'deg) rotateY('+(x*5).toFixed(2)+'deg) translateY(-6px)';});
    c.addEventListener('mouseleave',function(){c.style.transform='';});
  });
})();

/* ---------- generic carousel (px based, responsive) ---------- */
function initCarousel(root){
  var view=root.querySelector('[data-view]'), track=root.querySelector('[data-track]');
  var slides=track?track.children.length:0;
  if(!track||!slides) return;
  var idx=0, auto=+root.dataset.auto||0, timer=null;
  var dotsWrap=root.querySelector('[data-dots]');
  function gap(){ var g=parseFloat(getComputedStyle(track).columnGap||getComputedStyle(track).gap||'0'); return isNaN(g)?0:g; }
  function step(){ return track.children[0].getBoundingClientRect().width + gap(); }
  function visible(){ return Math.max(1, Math.round(view.getBoundingClientRect().width / step())); }
  function maxIdx(){ return Math.max(0, slides - visible()); }
  function render(){ track.style.transform='translateX(-'+(idx*step())+'px)'; if(dotsWrap){dotsWrap.querySelectorAll('button').forEach(function(d,k){d.classList.toggle('on',k===idx);});} }
  function go(i){ idx=Math.max(0,Math.min(i,maxIdx())); render(); }
  function next(){ go(idx>=maxIdx()?0:idx+1); }
  function prev(){ go(idx<=0?maxIdx():idx-1); }
  function buildDots(){ if(!dotsWrap) return; dotsWrap.innerHTML=''; for(var k=0;k<=maxIdx();k++){(function(k){var d=document.createElement('button');d.className='car-dot'+(k===0?' on':'');d.setAttribute('aria-label','slide');d.addEventListener('click',function(){go(k);restart();});dotsWrap.appendChild(d);})(k);} }
  root.querySelectorAll('[data-next]').forEach(function(b){b.addEventListener('click',function(){next();restart();});});
  root.querySelectorAll('[data-prev]').forEach(function(b){b.addEventListener('click',function(){prev();restart();});});
  function start(){ if(auto>0) timer=setInterval(next,auto); }
  function restart(){ if(timer)clearInterval(timer); start(); }
  root.addEventListener('mouseenter',function(){if(timer)clearInterval(timer);});
  root.addEventListener('mouseleave',start);
  window.addEventListener('resize',function(){ buildDots(); go(Math.min(idx,maxIdx())); });
  buildDots(); render(); start();
}
(function(){ document.querySelectorAll('[data-carousel]').forEach(initCarousel); })();

/* ---------- hero particle network ---------- */
(function(){
  var c=document.getElementById('heroCanvas'); if(!c) return;
  if(matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  var ctx=c.getContext('2d'), pts=[], W,H, raf;
  function size(){ var r=c.parentElement.getBoundingClientRect(); W=c.width=r.width; H=c.height=r.height; var n=Math.min(64,Math.round(W*H/26000)); pts=[]; for(var i=0;i<n;i++){pts.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35});} }
  function draw(){
    ctx.clearRect(0,0,W,H);
    for(var i=0;i<pts.length;i++){var p=pts[i];p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;
      ctx.beginPath();ctx.arc(p.x,p.y,1.6,0,6.28);ctx.fillStyle='rgba(140,233,255,.75)';ctx.fill();}
    for(var a=0;a<pts.length;a++)for(var b=a+1;b<pts.length;b++){var dx=pts[a].x-pts[b].x,dy=pts[a].y-pts[b].y,d=dx*dx+dy*dy;
      if(d<17000){ctx.beginPath();ctx.moveTo(pts[a].x,pts[a].y);ctx.lineTo(pts[b].x,pts[b].y);ctx.strokeStyle='rgba(34,195,230,'+(1-d/17000)*.32+')';ctx.lineWidth=1;ctx.stroke();}}
    raf=requestAnimationFrame(draw);
  }
  size(); draw(); window.addEventListener('resize',function(){cancelAnimationFrame(raf);size();draw();});
})();

/* ---------- contact form -> WhatsApp ---------- */
(function(){
  var box=document.getElementById('quoteForm'); if(!box) return;
  var btn=box.querySelector('[data-send]'); if(!btn) return;
  btn.addEventListener('click',function(){
    var v=function(sel){var el=box.querySelector(sel);return el?el.value.trim():'';};
    var lang=document.documentElement.lang==='en'?'en':'fr';
    var L=lang==='en'
      ?{h:'Quote request',n:'Name',c:'Company',m:'Need'}
      :{h:'Demande de devis',n:'Nom',c:'Societe',m:'Besoin'};
    var txt=L.h+' - Roots & Co%0A'
      +L.n+': '+v('[name=name]')+'%0A'
      +'Email: '+v('[name=email]')+'%0A'
      +L.c+': '+v('[name=company]')+'%0A'
      +L.m+': '+v('[name=need]');
    window.open('https://wa.me/22893078787?text='+txt,'_blank');
  });
})();
