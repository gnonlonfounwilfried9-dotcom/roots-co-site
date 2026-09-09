/* ROOTS - boutique : panier, filtres, recherche, tri, fiche detaillee, commande */
(function () {
var K = 'roots_cart', XOF = 655.957, WA = '22901995652', MAIL = 'sales@roots.ws';
var NL = String.fromCharCode(10);

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
  var nb = document.getElementById('cartNext');
  if (nb) nb.disabled = !c.length;
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
    goStep(1);
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
    if (b) { addBtn(b, true); closeDetail(); goStep(1); openCart(); }
  });
}

/* ---------------- clics ---------------- */
document.addEventListener('click', function (e) {
  var z = e.target.closest('.bxzoom, .bxinfo');
  if (z) { openDetail(z.dataset.ref); return; }
  var pk = e.target.closest('.bxpackadd');
  if (pk) {
    pk.dataset.refs.split('|').forEach(function (r) {
      var bb = document.querySelector('.sadd[data-ref="' + r + '"]');
      if (bb) addBtn(bb, true);
    });
    goStep(1); openCart();
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

var btnCart = document.getElementById('cartBtn');
if (btnCart) btnCart.addEventListener('click', openCart);
var cl = document.getElementById('cartClose'); if (cl) cl.addEventListener('click', closeCart);
var vl = document.getElementById('cartVeil'); if (vl) vl.addEventListener('click', closeCart);
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') { closeCart(); closeDetail(); }
});

/* ---------------- commande en trois etapes : panier, coordonnees, verification ---------------- */
/* comme sur les sites marchands habituels, on ne montre "envoyer" qu'apres un ecran
   recapitulatif complet ; entre les deux, on peut toujours revenir modifier un champ */
var step1 = document.getElementById('cartStep1');
var step2 = document.getElementById('cartStep2');
var step3 = document.getElementById('cartStep3');
var sendBox = document.getElementById('cartSend');
var nextBtn = document.getElementById('cartNext');
var reviewBtn = document.getElementById('cartReview');
var cartTitle = document.getElementById('cartTitle');

function goStep(n) {
  if (!step2) return;
  step1.hidden = (n !== 1);
  step2.hidden = (n !== 2);
  if (step3) step3.hidden = (n !== 3);
  if (nextBtn) nextBtn.hidden = (n !== 1);
  if (reviewBtn) reviewBtn.hidden = (n !== 2);
  if (sendBox) sendBox.hidden = (n !== 3);
  if (backBtn) backBtn.hidden = (n !== 2);
  if (backBtn2) backBtn2.hidden = (n !== 3);
  if (cartTitle) cartTitle.textContent = (n === 3) ? 'Vérifiez et envoyez' : (n === 2) ? 'Vos coordonnées' : 'Votre panier';
  var pan = document.getElementById('cartPanel');
  if (pan) pan.scrollTop = 0;
}
if (nextBtn) nextBtn.addEventListener('click', function () {
  if (!get().length) return;
  goStep(2);
  var f = document.getElementById('cfName'); if (f) f.focus();
});
var backBtn = document.getElementById('cartBack');
if (backBtn) backBtn.addEventListener('click', function () { goStep(1); });
var backBtn2 = document.getElementById('cartBack2');
if (backBtn2) backBtn2.addEventListener('click', function () { goStep(2); });
if (reviewBtn) reviewBtn.addEventListener('click', function () {
  if (!validateForm()) return;
  renderRecap();
  goStep(3);
});

function radioVal(name) {
  var r = document.querySelector('input[name="' + name + '"]:checked');
  return r ? r.value : '';
}

/* ------- livraison et paiement : chaque choix ouvre ce qu'il faut remplir ------- */
var shipGroup = document.getElementById('cfShipGroup');
var shipDetail = document.getElementById('cfShipDetail');
var payGroup = document.getElementById('cfPayGroup');
var payDetail = document.getElementById('cfPayDetail');

var SHIP_FIELDS = {
  'Retrait a Lome (Togo)': '<div class="cf-detail-note">Indiquez si possible le jour et l&rsquo;heure qui vous '
    + 'conviennent pour le retrait, sinon nous vous proposons un cr&eacute;neau &agrave; la confirmation.</div>'
    + '<div class="cf-row"><label>Cr&eacute;neau souhait&eacute; <span>(facultatif)</span>'
    + '<input type="text" id="cfSlot" placeholder="Ex. jeudi apr&egrave;s-midi"></label></div>',
  'Retrait a Cotonou (Benin)': '<div class="cf-detail-note">Indiquez si possible le jour et l&rsquo;heure qui '
    + 'vous conviennent pour le retrait, sinon nous vous proposons un cr&eacute;neau &agrave; la confirmation.</div>'
    + '<div class="cf-row"><label>Cr&eacute;neau souhait&eacute; <span>(facultatif)</span>'
    + '<input type="text" id="cfSlot" placeholder="Ex. jeudi apr&egrave;s-midi"></label></div>',
  'Livraison au Togo': '<div class="cf-row"><label>Adresse pr&eacute;cise <b>*</b>'
    + '<input type="text" id="cfAddr" required placeholder="Quartier, rue, point de rep&egrave;re"></label></div>',
  'Livraison au Benin': '<div class="cf-row"><label>Adresse pr&eacute;cise <b>*</b>'
    + '<input type="text" id="cfAddr" required placeholder="Quartier, rue, point de rep&egrave;re"></label></div>',
  'Livraison sous-region': '<div class="cf-row"><label>Pays et adresse pr&eacute;cise <b>*</b>'
    + '<input type="text" id="cfAddr" required placeholder="Pays, ville, quartier, rue"></label></div>',
  'Livraison en France': '<div class="cf-row"><label>Adresse <b>*</b>'
    + '<input type="text" id="cfAddrStreet" required placeholder="Num&eacute;ro et rue"></label></div>'
    + '<div class="cf-row"><label>Complement d&rsquo;adresse <span>(facultatif)</span>'
    + '<input type="text" id="cfAddrExtra" placeholder="B&acirc;timent, &eacute;tage, digicode&hellip;"></label></div>'
    + '<div class="cf-row"><label>Code postal et ville <b>*</b>'
    + '<input type="text" id="cfAddrCity" required placeholder="Ex. 75011 Paris"></label></div>',
  'A definir avec le conseiller': '<div class="cf-detail-note">Un conseiller vous contacte pour d&eacute;finir '
    + 'le lieu et le d&eacute;lai exacts avec vous.</div>'
};

var PAY_FIELDS = {
  'Virement bancaire': '<div class="cf-detail-note">Nos coordonn&eacute;es bancaires (RIB) vous sont '
    + 'transmises avec la facture pro forma, d&egrave;s confirmation de la commande.</div>'
    + '<div class="cf-row"><label>Nom de la banque de votre entreprise <span>(facultatif)</span>'
    + '<input type="text" id="cfBankName" placeholder="Utile pour pr&eacute;parer la facture"></label></div>',
  'Mobile Money': '<div class="cf-2">'
    + '<label>Op&eacute;rateur <b>*</b><select id="cfMMOp" required>'
    + '<option value="">Choisir&hellip;</option><option>Flooz (Moov)</option><option>T-Money (Togocom)</option>'
    + '<option>MTN MoMo</option><option>Autre</option></select></label>'
    + '<label>Num&eacute;ro Mobile Money <b>*</b><input type="tel" id="cfMMNum" required placeholder="+228 ou +229"></label>'
    + '</div>',
  'Carte bancaire': '<div class="cf-detail-note">Nous vous envoyons un <b>lien de paiement s&eacute;curis&eacute;</b> '
    + 'par e-mail apr&egrave;s confirmation de la commande. Aucune donn&eacute;e bancaire n&rsquo;est saisie sur ce site.</div>',
  'Especes a la livraison': '<div class="cf-detail-note">Merci de pr&eacute;parer le montant exact en FCFA, '
    + 'r&eacute;glable &agrave; la r&eacute;ception ou au retrait.</div>'
};

function renderDetail(box, map, value, userTriggered) {
  if (!box) return;
  var html = map[value] || '';
  box.innerHTML = html;
  box.hidden = !html;
  // un clic sur une pastille doit se voir : on amene la nouvelle case a l'ecran et on
  // la fait clignoter brievement, sinon elle apparait hors champ et semble ne rien faire
  if (userTriggered && html) {
    box.classList.remove('cf-detail-flash');
    void box.offsetWidth;
    box.classList.add('cf-detail-flash');
    // calcul direct et immediat (pas de scrollIntoView ni de comportement "smooth" async,
    // trop peu fiables dans un panneau qui defile lui-meme) : on amene la case a l'ecran
    // tout de suite, sinon elle apparait hors champ et le clic semble ne rien faire
    var panel = document.getElementById('cartPanel');
    if (panel) {
      var delta = box.getBoundingClientRect().top - panel.getBoundingClientRect().top;
      panel.scrollTop = panel.scrollTop + delta - 18;
    }
  }
}
if (shipGroup) {
  shipGroup.addEventListener('change', function (e) { renderDetail(shipDetail, SHIP_FIELDS, e.target.value, true); });
  renderDetail(shipDetail, SHIP_FIELDS, radioVal('cfShip'), false);
}
if (payGroup) {
  payGroup.addEventListener('change', function (e) { renderDetail(payDetail, PAY_FIELDS, e.target.value, true); });
  renderDetail(payDetail, PAY_FIELDS, radioVal('cfPay'), false);
}

function val(id) { var e = document.getElementById(id); return e ? e.value.trim() : ''; }

function validateForm() {
  var err = document.getElementById('cfErr');
  var name = val('cfName'), tel = val('cfTel'), mail = val('cfMail'), city = val('cfCity');
  var ship = radioVal('cfShip'), pay = radioVal('cfPay');
  var miss = [];
  if (!name) miss.push('votre nom');
  if (!tel) miss.push('un téléphone');
  if (!mail || mail.indexOf('@') < 1 || mail.lastIndexOf('.') < mail.indexOf('@')) miss.push('une adresse e-mail valide');
  if (!city) miss.push('votre ville');
  // chaque mode de livraison ou de paiement choisi doit vraiment etre rempli, pas juste coche
  if (['Livraison au Togo', 'Livraison au Benin', 'Livraison sous-region'].indexOf(ship) > -1 && !val('cfAddr')) {
    miss.push('votre adresse précise de livraison');
  }
  if (ship === 'Livraison en France' && (!val('cfAddrStreet') || !val('cfAddrCity'))) {
    miss.push('votre adresse complète en France');
  }
  if (pay === 'Mobile Money' && (!val('cfMMOp') || !val('cfMMNum'))) {
    miss.push('l’opérateur et le numéro Mobile Money');
  }
  if (!get().length) miss.push('au moins un article dans le panier');
  if (miss.length) {
    if (err) { err.hidden = false; err.textContent = 'Il manque ' + miss.join(', ') + '.'; }
    return false;
  }
  if (err) err.hidden = true;
  return true;
}

function shipAddressLine() {
  if (val('cfAddr')) return val('cfAddr');
  if (val('cfAddrStreet') || val('cfAddrCity')) {
    var parts = [val('cfAddrStreet')];
    if (val('cfAddrExtra')) parts.push(val('cfAddrExtra'));
    parts.push(val('cfAddrCity'));
    return parts.filter(Boolean).join(', ');
  }
  return '';
}

/* recapitulatif visuel avant envoi, comme une page de verification de commande */
function renderRecap() {
  var box = document.getElementById('cfRecap');
  if (!box) return;
  var c = get(), t = 0, rows = '';
  c.forEach(function (it) { t += it.q * it.ttc; });
  var name = val('cfName'), org = val('cfOrg'), tel = val('cfTel'), mail = val('cfMail'), city = val('cfCity');
  var ship = radioVal('cfShip'), pay = radioVal('cfPay'), addr = shipAddressLine(), note = val('cfNote');

  function block(title, lines) {
    return '<div class="cf-rec-b"><h4>' + title + '</h4>' + lines.map(function (l) {
      return '<p><span>' + l[0] + '</span><b>' + l[1] + '</b></p>';
    }).join('') + '</div>';
  }

  var items = c.map(function (it) {
    return '<p><span>' + it.q + ' &times; ' + it.name + '</span><b>' + fcfa(it.q * it.ttc) + '</b></p>';
  }).join('');
  rows += '<div class="cf-rec-b"><h4>Articles</h4>' + items
    + '<p class="cf-rec-tot"><span>Total TTC</span><b>' + fcfa(t) + ' &middot; ' + eur(t) + '</b></p></div>';

  var contactLines = [['Nom', name]];
  if (org) contactLines.push(['Entreprise', org]);
  contactLines.push(['T&eacute;l&eacute;phone', tel], ['E-mail', mail], ['Ville', city]);
  rows += block('Coordonn&eacute;es', contactLines);

  var shipLines = [['Livraison', ship]];
  if (addr) shipLines.push(['Adresse', addr]);
  if (val('cfSlot')) shipLines.push(['Cr&eacute;neau', val('cfSlot')]);
  shipLines.push(['Frais', 'Chiffr&eacute;s sur devis, communiqu&eacute;s avant tout paiement']);
  rows += block('Livraison', shipLines);

  var payLines = [['R&egrave;glement', pay]];
  if (val('cfMMOp') || val('cfMMNum')) payLines.push(['Mobile Money', val('cfMMOp') + ' ' + val('cfMMNum')]);
  if (val('cfBankName')) payLines.push(['Banque', val('cfBankName')]);
  rows += block('Paiement', payLines);

  if (note) rows += block('Pr&eacute;cisions', [['Note', note]]);

  box.innerHTML = rows;
}

function collect() {
  if (!validateForm()) return null;
  var name = val('cfName'), tel = val('cfTel'), mail = val('cfMail'), city = val('cfCity');
  var ship = radioVal('cfShip'), pay = radioVal('cfPay');

  var c = get();
  if (!c.length) return null;
  var t = 0, lines = [];
  c.forEach(function (it) {
    t += it.q * it.ttc;
    lines.push('- ' + it.q + ' x ' + it.name + ' (' + it.ref + ') : ' + fcfa(it.q * it.ttc));
  });

  var org = val('cfOrg'), note = val('cfNote');
  var L = [];
  L.push('Bonjour ROOTS, je souhaite passer commande.');
  L.push('');
  L.push('COMMANDE');
  L = L.concat(lines);
  L.push('Total TTC : ' + fcfa(t) + ' (soit ' + eur(t) + ')');
  L.push('');
  L.push('COORDONNEES');
  L.push('Nom : ' + name);
  if (org) L.push('Entreprise : ' + org);
  L.push('Telephone : ' + tel);
  L.push('E-mail : ' + mail);
  L.push('Ville : ' + city);
  L.push('');
  L.push('LIVRAISON ET REGLEMENT');
  L.push('Livraison : ' + ship);
  if (shipAddressLine()) L.push('Adresse : ' + shipAddressLine());
  if (val('cfSlot')) L.push('Creneau souhaite : ' + val('cfSlot'));
  L.push('Reglement souhaite : ' + pay);
  if (val('cfMMOp') || val('cfMMNum')) L.push('Mobile Money : ' + val('cfMMOp') + ' ' + val('cfMMNum'));
  if (val('cfBankName')) L.push('Banque de l’entreprise : ' + val('cfBankName'));
  if (note) { L.push(''); L.push('PRECISIONS'); L.push(note); }
  L.push('');
  L.push('Merci de me confirmer la disponibilite, le delai et les frais de livraison.');

  var cp = document.getElementById('cfCopy');
  return { txt: L.join(NL), mail: mail, copy: cp ? cp.checked : false, total: t };
}

/* ------- enregistrement au tableau de bord (en plus de WhatsApp/e-mail, pas a la place) ------- */
function buildRecord(d) {
  var c = get();
  return {
    status: 'nouveau',
    customer_name: val('cfName'),
    customer_org: val('cfOrg') || null,
    customer_tel: val('cfTel'),
    customer_mail: val('cfMail'),
    customer_city: val('cfCity'),
    ship_method: radioVal('cfShip'),
    ship_address: shipAddressLine() || null,
    ship_slot: val('cfSlot') || null,
    pay_method: radioVal('cfPay'),
    pay_detail: (val('cfMMOp') || val('cfMMNum')) ? (val('cfMMOp') + ' ' + val('cfMMNum')).trim() : (val('cfBankName') || null),
    items: c.map(function (it) { return { ref: it.ref, name: it.name, qty: it.q, unit_ttc_eur: it.ttc }; }),
    total_fcfa: Math.round(d.total * XOF),
    total_eur: Math.round(d.total * 100) / 100,
    note: val('cfNote') || null
  };
}
function submitOrder(record) {
  var cfg = window.ROOTS_SUPABASE;
  if (!cfg || !cfg.url || !cfg.anonKey || !window.supabase) return;
  try {
    var sb = window.supabase.createClient(cfg.url, cfg.anonKey);
    // si un client est connecte a son espace (compte.html) dans ce navigateur, la
    // commande est rattachee a son compte pour apparaitre dans son historique
    sb.auth.getSession().then(function (s) {
      var uid = s.data && s.data.session ? s.data.session.user.id : null;
      if (uid) record.user_id = uid;
      sb.from('orders').insert(record).then(function (res) {
        if (res.error) { try { console.warn('ROOTS: commande non enregistree au tableau de bord', res.error.message); } catch (e) {} }
      });
    });
  } catch (e) { try { console.warn('ROOTS: tableau de bord indisponible', e); } catch (e2) {} }
}

var od = document.getElementById('cartOrder');
if (od) od.addEventListener('click', function () {
  var d = collect();
  if (!d) return;
  submitOrder(buildRecord(d));
  window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(d.txt), '_blank');
});
var om = document.getElementById('cartMail');
if (om) om.addEventListener('click', function () {
  var d = collect();
  if (!d) return;
  submitOrder(buildRecord(d));
  var url = 'mailto:' + MAIL
    + '?subject=' + encodeURIComponent('Commande depuis le site ROOTS')
    + (d.copy ? '&cc=' + encodeURIComponent(d.mail) : '')
    + '&body=' + encodeURIComponent(d.txt);
  window.location.href = url;
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
goStep(1);
})();
