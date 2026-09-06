/* ROOTS - boutique : panier, filtres, recherche, tri, fiche detaillee */
(function () {
var K = 'roots_cart', XOF = 655.957, WA = '22901995652';

function get() { try { return JSON.parse(localStorage.getItem(K)) || []; } catch (e) { return []; } }
function set(c) { try { localStorage.setItem(K, JSON.stringify(c)); } catch (e) {} render(); }
function eur(v) { return v.toFixed(2).replace('.', ',') + ' €'; }
function fcfa(v) { return Math.round(v * XOF).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA'; }

/* ---------------- panier ---------------- */
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
      '<div class="ci-main"><strong>' + it.name + '</strong>' +
        '<span class="ci-p">' + fcfa(it.ttc) + ' <i>' + eur(it.ttc) + '</i></span>' +
        '<div class="ci-q"><button data-m="' + idx + '" aria-label="Retirer">&minus;</button>' +
        '<span>' + it.q + '</span>' +
        '<button data-p="' + idx + '" aria-label="Ajouter">+</button>' +
        '<button class="ci-x" data-x="' + idx + '" aria-label="Supprimer">Retirer</button></div></div>';
    items.appendChild(d);
  });
  var ct = document.getElementById('cartTotal'); if (ct) ct.textContent = eur(t);
  var cf = document.getElementById('cartTotalF'); if (cf) cf.textContent = fcfa(t);
}
function openCart() {
  var p = document.getElementById('cartPanel'), v = document.getElementById('cartVeil');
  var ch = document.getElementById('rcPanel'); if (ch) ch.classList.remove('show');
  if (p) p.classList.add('show'); if (v) v.classList.add('show');
}
function closeCart() {
  var p = document.getElementById('cartPanel'), v = document.getElementById('cartVeil');
  if (p) p.classList.remove('show'); if (v) v.classList.remove('show');
}
function addBtn(btn, silent) {
  var c = get(), r = btn.dataset.ref, f = null;
  for (var i = 0; i < c.length; i++) if (c[i].ref === r) f = c[i];
  if (f) f.q++;
  else c.push({ ref: r, name: btn.dataset.name, ttc: parseFloat(btn.dataset.ttc), img: btn.dataset.img || '', q: 1 });
  set(c);
  if (!silent) {
    openCart();
    btn.classList.add('added');
    setTimeout(function () { btn.classList.remove('added'); }, 900);
  }
}

/* ---------------- fiche detaillee ---------------- */
var modal = document.getElementById('bxModal');
var modalBody = document.getElementById('bxModalBody');
var modalAdd = document.getElementById('bxModalAdd');
var currentRef = null;
function openDetail(ref) {
  var card = document.querySelector('.bxcard [data-ref="' + ref + '"]');
  card = card && card.closest('.bxcard');
  if (!card || !modal) return;
  var d = card.querySelector('.bxdetail');
  if (!d) return;
  modalBody.innerHTML = d.innerHTML;
  currentRef = ref;
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeDetail() {
  if (!modal) return;
  modal.classList.remove('show');
  document.body.style.overflow = '';
}
if (modal) {
  document.getElementById('bxModalX').addEventListener('click', closeDetail);
  modal.addEventListener('click', function (e) { if (e.target === modal) closeDetail(); });
  modalAdd.addEventListener('click', function () {
    if (!currentRef) return;
    var b = document.querySelector('.sadd[data-ref="' + currentRef + '"]');
    if (b) { addBtn(b, true); closeDetail(); openCart(); }
  });
}

/* ---------------- clics ---------------- */
document.addEventListener('click', function (e) {
  var z = e.target.closest('.bxzoom, .bxinfo');
  if (z) { openDetail(z.dataset.ref); return; }
  var pk = e.target.closest('.bxpackadd');
  if (pk) {
    pk.dataset.refs.split('|').forEach(function (r) {
      var b = document.querySelector('.sadd[data-ref="' + r + '"]');
      if (b) addBtn(b, true);
    });
    openCart();
    pk.textContent = 'Pack ajouté';
    setTimeout(function () { pk.textContent = 'Ajouter le pack'; }, 1400);
    return;
  }
  var a = e.target.closest('.sadd');
  if (a) { addBtn(a, false); return; }
  var m = e.target.closest('[data-m]');
  if (m) { var cm = get(), im = +m.dataset.m; cm[im].q--; if (cm[im].q < 1) cm.splice(im, 1); set(cm); return; }
  var p = e.target.closest('[data-p]');
  if (p) { var cp = get(); cp[+p.dataset.p].q++; set(cp); return; }
  var x = e.target.closest('[data-x]');
  if (x) { var cx = get(); cx.splice(+x.dataset.x, 1); set(cx); return; }
});

var b = document.getElementById('cartBtn'); if (b) b.addEventListener('click', openCart);
var cl = document.getElementById('cartClose'); if (cl) cl.addEventListener('click', closeCart);
var vl = document.getElementById('cartVeil'); if (vl) vl.addEventListener('click', closeCart);
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') { closeCart(); closeDetail(); }
});

var od = document.getElementById('cartOrder');
if (od) od.addEventListener('click', function () {
  var c = get();
  if (!c.length) { openCart(); return; }
  var t = 0;
  var l = c.map(function (it) {
    t += it.q * it.ttc;
    return '- ' + it.q + ' x ' + it.name + ' (' + it.ref + ') : ' + fcfa(it.q * it.ttc);
  }).join('\n');
  var msg = 'Bonjour ROOTS, je souhaite commander :\n' + l +
    '\n\nTotal TTC : ' + fcfa(t) + ' (soit ' + eur(t) + ')' +
    '\nMerci de me confirmer le delai et les frais de livraison.';
  window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(msg), '_blank');
});

/* ---------------- filtres, recherche, tri ---------------- */
var grid = document.getElementById('bxgrid');
var cards = grid ? [].slice.call(grid.querySelectorAll('.bxcard')) : [];
var order = cards.slice();
var cat = 'all', q = '';

function norm(s) {
  s = (s || '').toLowerCase();
  try { s = s.normalize('NFD').replace(/[̀-ͯ]/g, ''); } catch (e) {}
  return s.replace(/[^a-z0-9]+/g, ' ');
}
function apply() {
  var nq = norm(q).trim(), shown = 0;
  cards.forEach(function (c) {
    var okc = (cat === 'all' || c.dataset.cat === cat);
    var oks = !nq || norm(c.dataset.search + ' ' + c.dataset.name).indexOf(nq) > -1;
    var on = okc && oks;
    c.style.display = on ? '' : 'none';
    if (on) shown++;
  });
  var em = document.getElementById('bxempty');
  if (em) em.hidden = shown > 0;
}
function sortBy(mode) {
  var arr = order.slice();
  if (mode === 'asc') arr.sort(function (a, b) { return a.dataset.price - b.dataset.price; });
  else if (mode === 'desc') arr.sort(function (a, b) { return b.dataset.price - a.dataset.price; });
  else if (mode === 'az') arr.sort(function (a, b) { return a.dataset.name.localeCompare(b.dataset.name, 'fr'); });
  arr.forEach(function (c) { grid.appendChild(c); });
}
var fils = document.querySelectorAll('.sfil');
for (var i = 0; i < fils.length; i++) {
  fils[i].addEventListener('click', function () {
    for (var j = 0; j < fils.length; j++) fils[j].classList.remove('on');
    this.classList.add('on');
    cat = this.dataset.f;
    apply();
  });
}
var qi = document.getElementById('bxq');
if (qi) qi.addEventListener('input', function () { q = this.value; apply(); });
var so = document.getElementById('bxsort');
if (so) so.addEventListener('change', function () { sortBy(this.value); });

render();
})();
