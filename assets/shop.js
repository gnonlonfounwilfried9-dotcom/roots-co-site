(function(){
var K='roots_cart', XOF=655.957;
function get(){ try{return JSON.parse(localStorage.getItem(K))||[]}catch(e){return []} }
function set(c){ try{localStorage.setItem(K,JSON.stringify(c))}catch(e){} render(); }
function eur(v){ return v.toFixed(2).replace('.',',')+' \u20ac'; }
function fcfa(v){ return Math.round(v*XOF).toString().replace(/\B(?=(\d{3})+(?!\d))/g,' ')+' FCFA'; }
function render(){
  var c=get(), items=document.getElementById('cartItems'), n=0, t=0;
  if(!items) return;
  items.innerHTML = c.length? '' : '<p class="cart-empty">Votre panier est vide.</p>';
  c.forEach(function(it,idx){
    n+=it.q; t+=it.q*it.ttc;
    var d=document.createElement('div'); d.className='cart-item';
    d.innerHTML='<div class="ci-n"><strong>'+it.name+'</strong><span>'+eur(it.ttc)+'</span></div>'+
      '<div class="ci-q"><button data-m="'+idx+'">-</button><span>'+it.q+'</span><button data-p="'+idx+'">+</button>'+
      '<button class="ci-x" data-x="'+idx+'">&times;</button></div>';
    items.appendChild(d);
  });
  var cc=document.getElementById('cartCount'); if(cc){ cc.textContent=n; cc.style.display=n?'flex':'none'; }
  var ct=document.getElementById('cartTotal'); if(ct) ct.textContent=eur(t);
  var cf=document.getElementById('cartTotalF'); if(cf) cf.textContent=fcfa(t);
}
document.addEventListener('click',function(e){
  var a=e.target.closest('.sadd');
  if(a){ var c=get(), r=a.dataset.ref, f=c.filter(function(x){return x.ref===r})[0];
    if(f) f.q++; else c.push({ref:r,name:a.dataset.name,ttc:parseFloat(a.dataset.ttc),q:1});
    set(c); open_(); return; }
  var m=e.target.closest('[data-m]'); if(m){ var c=get(); var i=+m.dataset.m; c[i].q--; if(c[i].q<1)c.splice(i,1); set(c); return; }
  var p=e.target.closest('[data-p]'); if(p){ var c=get(); c[+p.dataset.p].q++; set(c); return; }
  var x=e.target.closest('[data-x]'); if(x){ var c=get(); c.splice(+x.dataset.x,1); set(c); return; }
});
function open_(){ var p=document.getElementById('cartPanel'), v=document.getElementById('cartVeil');
  if(p){p.classList.add('show');} if(v){v.classList.add('show');} }
function close_(){ var p=document.getElementById('cartPanel'), v=document.getElementById('cartVeil');
  if(p){p.classList.remove('show');} if(v){v.classList.remove('show');} }
var b=document.getElementById('cartBtn'); if(b) b.addEventListener('click',open_);
var cl=document.getElementById('cartClose'); if(cl) cl.addEventListener('click',close_);
var vl=document.getElementById('cartVeil'); if(vl) vl.addEventListener('click',close_);
var od=document.getElementById('cartOrder');
if(od) od.addEventListener('click',function(){
  var c=get(); if(!c.length){ alert('Votre panier est vide.'); return; }
  var t=0, l=c.map(function(it){ t+=it.q*it.ttc; return '- '+it.q+' x '+it.name+' ('+eur(it.ttc)+')'; }).join('\n');
  var msg='Bonjour ROOTS, je souhaite commander :\n'+l+'\n\nTotal TTC : '+eur(t)+' (environ '+fcfa(t)+')\nMerci de me confirmer la disponibilite et les delais.';
  window.open('https://wa.me/22901995652?text='+encodeURIComponent(msg),'_blank');
});
document.querySelectorAll('.sfil').forEach(function(f){
  f.addEventListener('click',function(){
    document.querySelectorAll('.sfil').forEach(function(x){x.classList.remove('on')}); f.classList.add('on');
    var v=f.dataset.f;
    document.querySelectorAll('.sprod').forEach(function(p){ p.style.display=(v==='all'||p.dataset.cat===v)?'':'none'; });
  });
});
render();
})();