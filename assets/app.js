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

/* ---------- Lina assistant ---------- */
(function(){
  var el=document.getElementById('rooty'); if(!el) return;
  var bubble=el.querySelector('.rooty-bubble'), panel=el.querySelector('.rooty-panel');
  var current='', hideT=null, NAME='Lina', paused=false, pauseT=null;
  var touch=matchMedia('(hover:none)').matches;
  function EN(){ return document.documentElement.lang==='en'; }
  function norm(t){ return (t||'').toLowerCase().normalize('NFD').replace(/[^ -~]/g,'').replace(/[^a-z ]/g,'').replace(/ +/g,' ').trim(); }
  var RAW=[
   ['Ingenierie informatique et negoce international',
    "Bienvenue chez Roots & Co. Nous reunissons deux metiers, l'informatique d'entreprise et l'import-export de materiel. Un seul partenaire, du conseil a la livraison. Cliquez sur Demander un devis et nous vous recontactons vite.",
    "Welcome to Roots & Co. We combine two trades, corporate IT and equipment import-export. One partner, from advice to delivery. Click Request a quote and we will get back to you fast."],
   ['Deux poles',
    "Roots repose sur deux poles. A gauche l'informatique, materiel, serveurs, securite, infogerance. A droite l'import-export, sourcing, dedouanement, livraison. Cliquez sur le pole qui vous concerne.",
    "Roots stands on two divisions. On the left IT, hardware, servers, security, managed services. On the right import-export, sourcing, customs, delivery. Click the division that fits you."],
   ['Pourquoi Roots',
    "Ce qui nous distingue, un seul interlocuteur pour tout, un support local qui repond vite au Togo et au Benin, et un reseau international en France et aux Etats-Unis pour sourcer partout.",
    "What sets us apart, one contact for everything, fast local support in Togo and Benin, and an international network in France and the United States to source anywhere."],
   ['Nos services',
    "Nos expertises informatiques, materiel, maintenance, cybersecurite, infogerance, reseaux, videosurveillance, ERP Odoo et ingenierie. Survolez une carte pour le detail, ou ouvrez la page Informatique.",
    "Our IT expertise, hardware, maintenance, cybersecurity, managed IT, networks, video surveillance, Odoo ERP and engineering. Hover a card for details, or open the IT page."],
   ['Materiel',
    "Un apercu de nos ordinateurs professionnels avec les prix. Faites defiler le carrousel avec les fleches, puis ouvrez Voir tout le catalogue pour la gamme complete.",
    "A preview of our professional laptops with prices. Scroll the carousel with the arrows, then open See the full catalogue for the full range."],
   ['Notre expertise, en chiffres',
    "Nos chiffres cles et notre couverture par domaine, plus de vingt ans d'expertise, quatre pays, et la maitrise du materiel, de la securite, de l'infogerance et de la logistique.",
    "Our key figures and coverage by area, over twenty years of expertise, four countries, and command of hardware, security, managed IT and logistics."],
   ['A qui nous nous adressons',
    "Nous equipons de nombreux secteurs, banques et finance, ONG et institutions, administrations, education, PME et commerces, sante. Chaque secteur a ses exigences, nous les connaissons.",
    "We equip many sectors, banking and finance, NGOs and institutions, public administrations, education, SMEs and retail, healthcare. Each sector has its needs, and we know them."],
   ['Temoignages',
    "Quelques retours clients, pour l'instant illustratifs et a valider. Ils montrent notre reactivite et notre accompagnement de bout en bout. De vrais temoignages viendront.",
    "A few client quotes, for now illustrative and to be validated. They show our responsiveness and end to end support. Real testimonials will come."],
   ['Partenaires officiels',
    "Nous sommes agrees par les leaders du secteur, Dell, HP, Lenovo, Sophos, Odoo, Microsoft, Synology. Passez la souris sur les logos, ils defilent en continu.",
    "We are certified by the industry leaders, Dell, HP, Lenovo, Sophos, Odoo, Microsoft, Synology. Hover the logos, they scroll continuously."],
   ['Nos implantations',
    "Nous sommes presents dans quatre pays, Lome le siege, Cotonou, la France et les Etats-Unis. Local pour vous livrer vite, international pour sourcer partout.",
    "We are present in four countries, Lome the headquarters, Cotonou, France and the United States. Local to deliver fast, international to source anywhere."],
   ['Comment ca marche',
    "Le parcours de votre commande a l'import, en quatre etapes, sourcing, import, dedouanement, livraison. Vous n'avez qu'un seul interlocuteur, du debut a la fin.",
    "Your import order journey in four steps, sourcing, import, customs clearance, delivery. You have a single contact from start to finish."],
   ['Contact',
    "Pour un devis, remplissez le formulaire, votre demande s'ouvre directement dans WhatsApp, preremplie. Vous pouvez aussi nous appeler ou ecrire a sales@roots.ws.",
    "For a quote, fill in the form, your request opens directly in WhatsApp, prefilled. You can also call us or email sales@roots.ws."],
   ['Pole numero un',
    "Le pole Informatique, une seule equipe pilote tout votre systeme d'information, du materiel et des serveurs a la securite, l'infogerance et l'ERP.",
    "The IT division, one team runs your entire information system, from hardware and servers to security, managed services and ERP."],
   ['Pole numero deux',
    "Le pole Import-export, nous sourcons du materiel dans le monde entier et vous le livrons, dedouane et installe, dans toute la sous-region.",
    "The import-export division, we source equipment worldwide and deliver it, cleared and installed, across the sub region."],
   ['Catalogue materiel',
    "Notre catalogue d'ordinateurs professionnels, norme CE et garantie 12 mois, en stock en France, au Togo et au Benin. Les prix sont affiches.",
    "Our catalogue of professional computers, CE standard and 12 month warranty, in stock in France, Togo and Benin. Prices are shown."],
   ["L'entreprise",
    "L'histoire de Roots, creee en 2002 en France puis en 2009 au Togo, devenue un acteur present sur trois continents.",
    "The Roots story, created in 2002 in France then in 2009 in Togo, now present on three continents."],
   ['Actualites et conseils',
    "Notre rubrique conseils sur la securite, le materiel et l'import. La section sera bientot alimentee avec de vrais articles.",
    "Our advice section on security, hardware and import. It will soon be filled with real articles."],
   ['Lina sums it up',
    "Voici mon recap. Cliquez sur Ecouter le recap pour que je vous resume tout Roots & Co de vive voix.",
    "Here is my recap. Click Play the recap and I will sum up all of Roots & Co out loud."]
  ];
  var SAY={}; RAW.forEach(function(r){ SAY[norm(r[0])]={fr:r[1],en:r[2]}; });
  var KW=[
   ['dell',"Roots est partenaire officiel agree Dell. Nous fournissons, installons et maintenons ordinateurs, serveurs et stations de travail Dell, avec garantie et service apres-vente local. Cliquez sur Voir le materiel Dell.",
    "Roots is an official authorized Dell partner. We supply, install and maintain Dell computers, servers and workstations, with warranty and local after sales service. Click See Dell hardware."],
   ['serveur',"Un point fort de Roots, la vente et l'installation de serveurs, ideales pour les banques et grands comptes, avec renouvellement tous les deux ans pour rester sous garantie. Demandez un devis serveur.",
    "A Roots strength, server sales and installation, ideal for banks and large accounts, with renewal every two years to stay under warranty. Ask for a server quote."]
  ];
  function explain(sec){
    var k=sec.querySelector('.kicker'), h=sec.querySelector('.stitle')||sec.querySelector('h1')||sec.querySelector('h2');
    var kt=k?norm(k.textContent):'', ht=h?norm(h.textContent):'';
    if(SAY[kt]) return SAY[kt];
    if(SAY[ht]) return SAY[ht];
    var blob=kt+' '+ht;
    for(var j=0;j<KW.length;j++){ if(blob.indexOf(KW[j][0])>=0) return {fr:KW[j][1],en:KW[j][2]}; }
    var lead=sec.querySelector('.slead')||sec.querySelector('.phero p')||sec.querySelector('.hero p.sub');
    var t=lead?lead.textContent.trim():(h?h.textContent.trim():'');
    return {fr:t,en:t};
  }
  function show(text,label){ current=text; bubble.innerHTML='<b>'+(label||NAME)+'</b>'+text;
    bubble.classList.add('show'); clearTimeout(hideT); hideT=setTimeout(function(){bubble.classList.remove('show');},11000); }
  var voice=null;
  function pickVoice(){ try{ var vs=speechSynthesis.getVoices()||[]; var lg=EN()?'en':'fr';
      var pool=vs.filter(function(v){return v.lang&&v.lang.toLowerCase().indexOf(lg)===0;});
      voice=pool.filter(function(v){return /(hortense|julie|amelie|audrey|marie|celine|female|femme|google)/i.test(v.name);})[0]||pool[0]||null;
    }catch(_){} }
  if('speechSynthesis' in window){ pickVoice(); try{speechSynthesis.onvoiceschanged=pickVoice;}catch(_){} }
  function speak(text){ try{ if(window.speechSynthesis && text){ speechSynthesis.cancel();
    var u=new SpeechSynthesisUtterance(text.replace(/<[^>]+>/g,'').replace(/&[^;]+;/g,' ').replace(/@/g,' arobase ').replace(/\.ws/g,' point ws'));
    pickVoice(); if(voice)u.voice=voice; u.lang=EN()?'en-US':'fr-FR'; u.rate=0.97; u.pitch=1.12; speechSynthesis.speak(u);
  } }catch(_){} }
  setTimeout(function(){ show(EN()?"Hello, I am Lina, your Roots & Co assistant. Hover a section and I explain what you can do. Click on an empty area to open my shortcuts, or click Listen to hear me.":"Bonjour, je suis Lina, votre assistante Roots & Co. Survolez une section et je vous explique ce que vous pouvez y faire. Cliquez dans une zone vide pour ouvrir mes raccourcis, ou sur Ecouter pour m'entendre."); },1800);
  var lastSec=null;
  document.querySelectorAll('section').forEach(function(sec){
    sec.addEventListener('mouseenter',function(){ if(sec===lastSec)return; lastSec=sec; var e=explain(sec); if(e&&(e.fr||e.en)) show(EN()?e.en:e.fr); });
  });
  /* follow the cursor (never blocks: #rooty is pointer-events:none) */
  if(!touch){
    var x=innerWidth-160,y=innerHeight-170,tx=x,ty=y;
    document.addEventListener('mousemove',function(ev){ if(paused)return; tx=ev.clientX+30; ty=ev.clientY+26; });
    (function loop(){ x+=(tx-x)*.11; y+=(ty-y)*.11;
      var mx=Math.max(6,Math.min(innerWidth-84,x)), my=Math.max(70,Math.min(innerHeight-84,y));
      el.style.transform='translate3d('+mx.toFixed(1)+'px,'+my.toFixed(1)+'px,0)'; requestAnimationFrame(loop); })();
    var freeze=function(){ paused=true; clearTimeout(pauseT); pauseT=setTimeout(function(){paused=false;},5200); };
    document.addEventListener('click',function(ev){
      if(ev.target.closest('.rooty-panel')) return;
      if(ev.target.closest('a,button,input,textarea,select,label,[role=button]')) return;
      var open=panel.classList.contains('show');
      panel.classList.toggle('show',!open); bubble.classList.remove('show');
      if(!open){ speak(current); freeze(); } else { paused=false; }
    });
  } else {
    el.addEventListener('click',function(){ var open=panel.classList.contains('show'); panel.classList.toggle('show',!open); if(!open){ speak(current); } });
  }
  var lb=el.querySelector('[data-listen]');
  if(lb) lb.addEventListener('click',function(e){ e.preventDefault(); speak(current); });
  var rb=document.querySelector('[data-recap]');
  if(rb) rb.addEventListener('click',function(e){ e.preventDefault(); var t=document.querySelector('.recap-say'); if(t){ speak(t.textContent); show(t.textContent,'Lina'); } });
})();
