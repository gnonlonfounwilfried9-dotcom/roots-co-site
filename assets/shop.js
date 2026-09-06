/* ROOTS - panier boutique (localStorage, sans back-office) */
(function () {
var K = 'roots_cart', XOF = 655.957, WA = '22901995652';

function get() { try { return JSON.parse(localStorage.getItem(K)) || []; } catch (e) { return []; } }
function set(c) { try { localStorage.setItem(K, JSON.stringify(c)); } catch (e) {} render(); }
function eur(v) { return v.toFixed(2).replace('.', ',') + ' €'; }
function fcfa(v) {
  return Math.round(v * XOF).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA';
}

function render() {
  var c = get(), items = document.getElementById('cartItems'), n = 0, t = 0;
  var cc = document.getElementById('cartCount');
  c.forEach(function (it) { n += it.q; t += it.q * it.ttc; });
  if (cc) { cc.textContent = n; cc.style.display = n ? 'flex' : 'none'; }
  if (!items) return;
  items.innerHTML = '';
  if (!c.length) {
    items.innerHTML = '<p class="cart-empty">Votre panier est vide.<br><span>Ajoutez des articles depuis la boutique pour composer votre commande.</span></p>';
  }
  c.forEach(function (it, idx) {
    var d = document.createElement('div');
    d.className = 'cart-item';
    d.innerHTML =
      (it.img ? '<div class="ci-img"><img src="' + it.img + '" alt=""></div>' : '') +
      '<div class="ci-main">' +
        '<strong>' + it.name + '</strong>' +
        '<span class="ci-p">' + fcfa(it.ttc) + ' <i>' + eur(it.ttc) + '</i></span>' +
        '<div class="ci-q"><button data-m="' + idx + '" aria-label="Retirer">&minus;</button>' +
        '<span>' + it.q + '</span>' +
        '<button data-p="' + idx + '" aria-label="Ajouter">+</button>' +
        '<button class="ci-x" data-x="' + idx + '" aria-label="Supprimer">Retirer</button></div>' +
      '</div>';
    items.appendChild(d);
  });
  var ct = document.getElementById('cartTotal'); if (ct) ct.textContent = eur(t);
  var cf = document.getElementById('cartTotalF'); if (cf) cf.textContent = fcfa(t);
}

function open_() {
  var p = document.getElementById('cartPanel'), v = document.getElementById('cartVeil');
  if (p) p.classList.add('show'); if (v) v.classList.add('show');
}
function close_() {
  var p = document.getElementById('cartPanel'), v = document.getElementById('cartVeil');
  if (p) p.classList.remove('show'); if (v) v.classList.remove('show');
}

document.addEventListener('click', function (e) {
  var a = e.target.closest('.sadd');
  if (a) {
    var c = get(), r = a.dataset.ref, f = null;
    for (var i = 0; i < c.length; i++) if (c[i].ref === r) f = c[i];
    if (f) f.q++;
    else c.push({ ref: r, name: a.dataset.name, ttc: parseFloat(a.dataset.ttc), img: a.dataset.img || '', q: 1 });
    set(c); open_();
    a.classList.add('added');
    setTimeout(function () { a.classList.remove('added'); }, 900);
    return;
  }
  var m = e.target.closest('[data-m]');
  if (m) { var cm = get(), im = +m.dataset.m; cm[im].q--; if (cm[im].q < 1) cm.splice(im, 1); set(cm); return; }
  var p = e.target.closest('[data-p]');
  if (p) { var cp = get(); cp[+p.dataset.p].q++; set(cp); return; }
  var x = e.target.closest('[data-x]');
  if (x) { var cx = get(); cx.splice(+x.dataset.x, 1); set(cx); return; }
});

var b = document.getElementById('cartBtn'); if (b) b.addEventListener('click', open_);
var cl = document.getElementById('cartClose'); if (cl) cl.addEventListener('click', close_);
var vl = document.getElementById('cartVeil'); if (vl) vl.addEventListener('click', close_);
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close_(); });

var od = document.getElementById('cartOrder');
if (od) od.addEventListener('click', function () {
  var c = get();
  if (!c.length) { open_(); return; }
  var t = 0;
  var l = c.map(function (it) {
    t += it.q * it.ttc;
    return '- ' + it.q + ' x ' + it.name + ' (' + it.ref + ') : ' + fcfa(it.q * it.ttc);
  }).join('\n');
  var msg = 'Bonjour ROOTS, je souhaite commander :\n' + l +
    '\n\nTotal TTC : ' + fcfa(t) + ' (soit ' + eur(t) + ')' +
    '\nMerci de me confirmer la disponibilite, le delai et les frais de livraison.';
  window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(msg), '_blank');
});

var fils = document.querySelectorAll('.sfil');
for (var i = 0; i < fils.length; i++) {
  fils[i].addEventListener('click', function () {
    for (var j = 0; j < fils.length; j++) fils[j].classList.remove('on');
    this.classList.add('on');
    var v = this.dataset.f, cards = document.querySelectorAll('.bxcard');
    for (var k = 0; k < cards.length; k++) {
      cards[k].style.display = (v === 'all' || cards[k].dataset.cat === v) ? '' : 'none';
    }
  });
}

render();
})();
