/* ROOTS - boutique : panier, filtres, recherche, tri, fiche detaillee, commande */
(function () {
var K = 'roots_cart', XOF = 655.957, MAIL = 'sales@roots.ws';
var NL = String.fromCharCode(10);

/* la commande part toujours vers le tableau de bord (decision reunion du 2026-09-16 :
   une commande doit pouvoir passer et etre vue cote admin meme sans paiement automatique).
   Seul le paiement en ligne reste suspendu : aucune passerelle de paiement n'est branchee
   ici, le client choisit juste un mode (virement, mobile money...) regle hors ligne avec lui. */
var CART_ENABLED = true;

/* commande par WhatsApp (decision du 2026-09-25) : le panier est masque, pas supprime.
   Un clic sur un article ouvre WhatsApp avec le produit, sa reference et son prix.
   Remettre WA_MODE a false pour reafficher le panier et le parcours avec compte client. */
var WA_MODE = true, WA_NUM = '22999565252';
var WA_ICON = '<svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.3.8 3.2.7a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z"/></svg>';
function waOpen(btn) {
  var ht = parseFloat(btn.dataset.ht) || 0;
  var fc = Math.round(ht * XOF).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  var msg = 'Bonjour ROOTS, je souhaite commander cet article vu sur votre boutique :' + NL + NL
    + btn.dataset.name + NL + 'Référence : ' + btn.dataset.ref + NL
    + 'Prix affiché : ' + fc + ' FCFA HT' + NL + NL
    + 'Quantité souhaitée : ' + NL + 'Ville de livraison : ' + NL + NL
    + 'Merci de me confirmer la disponibilité et le délai.';
  window.open('https://wa.me/' + WA_NUM + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
}

/* 1 EUR = 655,957 FCFA : parite fixe, jamais lue depuis la base pour qu'un reglage
   ne puisse pas desynchroniser le panier des prix affiches sur les fiches */

function get() { try { return JSON.parse(localStorage.getItem(K)) || []; } catch (e) { return []; } }
function set(c) { try { localStorage.setItem(K, JSON.stringify(c)); } catch (e) {} render(); }
function eur(v) { return v.toFixed(2).replace('.', ',') + ' €'; }
function fcfa(v) { return Math.round(v * XOF).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA'; }

/* ---------------- panier ---------------- */
function render() {
  var c = get(), items = document.getElementById('cartItems'), n = 0, t = 0;
  var cc = document.getElementById('cartCount');
  c.forEach(function (it) { n += it.q; t += it.q * it.ht; });
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
        '<span class="ci-p">' + fcfa(it.ht) + ' <i>' + eur(it.ht) + '</i></span>' +
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
  else c.push({ ref: r, name: btn.dataset.name, ht: parseFloat(btn.dataset.ht), img: btn.dataset.img || '', q: 1 });
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
    if (!b) return;
    if (WA_MODE) { waOpen(b); return; }
    addBtn(b, true); closeDetail(); goStep(1); openCart();
  });
}

/* ---------------- clics ---------------- */
document.addEventListener('click', function (e) {
  var th = e.target.closest('.bxd-thumbs img');
  if (th) {
    var scope = th.closest('.bxd-head');
    var main = scope && scope.querySelector('.bxd-mainimg');
    if (main) main.src = th.dataset.full || th.src;
    var sibs = th.parentNode.querySelectorAll('img');
    for (var s = 0; s < sibs.length; s++) sibs[s].classList.remove('on');
    th.classList.add('on');
    return;
  }
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
  if (a && WA_MODE) { waOpen(a); return; }
  if (a) { addBtn(a, false); return; }
  /* mode WhatsApp : un clic n'importe ou sur la fiche (hors bouton Details) ouvre WhatsApp */
  var card = WA_MODE && e.target.closest('.bxcard');
  if (card && !e.target.closest('a, button')) {
    var cb = card.querySelector('.sadd');
    if (cb) { waOpen(cb); return; }
  }
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
var step4 = document.getElementById('cartStep4');
var nextBtn = document.getElementById('cartNext');
var reviewBtn = document.getElementById('cartReview');
var confirmBtn = document.getElementById('cartConfirm');
var doneClose = document.getElementById('cartDoneClose');
var footNote = document.getElementById('cartFootNote');
var cartTitle = document.getElementById('cartTitle');

var stepAuth = document.getElementById('cartStepAuth');

/* un seul client Supabase pour la page : il lit aussi le jeton present dans l'adresse
   quand le client revient du lien de confirmation de son e-mail */
var SB = null;
function client() {
  var cfg = window.ROOTS_SUPABASE;
  if (SB) return SB;
  if (!cfg || !cfg.url || !cfg.anonKey || !window.supabase) return null;
  try { SB = window.supabase.createClient(cfg.url, cfg.anonKey); } catch (e) { SB = null; }
  return SB;
}
function session(cb) {
  var sb = client();
  if (!sb) { cb(null); return; }
  sb.auth.getSession().then(function (r) { cb(r.data && r.data.session ? r.data.session : null); }, function () { cb(null); });
}

/* coordonnees pre-remplies depuis le compte ; l'e-mail est celui du compte, non modifiable,
   pour que la commande apparaisse toujours dans l'espace client */
function fillFromAccount(s) {
  var u = s.user, md = u.user_metadata || {};
  var f = function (id, v) { var el = document.getElementById(id); if (el && v && !el.value) el.value = v; };
  f('cfName', md.full_name); f('cfTel', md.tel);
  var m = document.getElementById('cfMail');
  if (m) { m.value = u.email; m.readOnly = true; }
  var who = document.getElementById('cfWho');
  if (who) {
    who.hidden = false;
    who.innerHTML = 'Connect&eacute; : <b>' + u.email.replace(/[<>&"]/g, '') + '</b> &middot; <button type="button" id="cfLogout">Changer de compte</button>';
  }
}
function toCheckout() {
  session(function (s) {
    if (s) { fillFromAccount(s); goStep(2); var f = document.getElementById('cfName'); if (f && !f.value) f.focus(); }
    else goStep('auth');
  });
}

function goStep(n) {
  if (!step2) return;
  if (stepAuth) stepAuth.hidden = (n !== 'auth');
  step1.hidden = (n !== 1);
  step2.hidden = (n !== 2);
  if (step3) step3.hidden = (n !== 3);
  if (step4) step4.hidden = (n !== 4);
  if (nextBtn) nextBtn.hidden = (n !== 1);
  if (reviewBtn) reviewBtn.hidden = (n !== 2);
  if (confirmBtn) confirmBtn.hidden = (n !== 3);
  if (backBtn) backBtn.hidden = (n !== 2 && n !== 'auth');
  if (backBtn2) backBtn2.hidden = (n !== 3);
  if (doneClose) doneClose.hidden = (n !== 4);
  if (footNote) footNote.hidden = (n === 4);
  [].slice.call(document.querySelectorAll('.cart-foot .cart-tot')).forEach(function (el) { el.hidden = (n === 4); });
  if (cartTitle) cartTitle.textContent =
    (n === 4) ? 'Merci' : (n === 3) ? 'Vérifiez et envoyez' : (n === 2) ? 'Vos coordonnées'
    : (n === 'auth') ? 'Votre compte client' : 'Votre panier';
  var pan = document.getElementById('cartPanel');
  if (pan) pan.scrollTop = 0;
}
if (nextBtn) nextBtn.addEventListener('click', function () {
  if (!get().length) return;
  toCheckout();
});

/* ------- connexion ou creation de compte, obligatoire avant toute commande ------- */
var authMode = 'in';
function authMsg(id, txt) {
  ['caErr', 'caOk'].forEach(function (k) { var e = document.getElementById(k); if (e) e.hidden = true; });
  var el = document.getElementById(id);
  if (el && txt) { el.hidden = false; el.textContent = txt; }
}
[].slice.call(document.querySelectorAll('.cf-tab')).forEach(function (t) {
  t.addEventListener('click', function () {
    authMode = t.dataset.mode;
    [].slice.call(document.querySelectorAll('.cf-tab')).forEach(function (x) { x.classList.toggle('on', x === t); });
    [].slice.call(document.querySelectorAll('.cf-up-only')).forEach(function (x) { x.hidden = authMode !== 'up'; });
    var go = document.getElementById('caGo');
    if (go) go.textContent = authMode === 'up' ? 'Créer mon compte' : 'Me connecter et continuer';
    var pw = document.getElementById('caPass');
    if (pw) pw.autocomplete = authMode === 'up' ? 'new-password' : 'current-password';
    authMsg();
  });
});
var caGo = document.getElementById('caGo');
if (caGo) caGo.addEventListener('click', function () {
  var sb = client();
  if (!sb) { authMsg('caErr', 'Service de compte momentanément indisponible. Réessayez dans un instant.'); return; }
  var mail = val('caMail'), pass = (document.getElementById('caPass') || {}).value || '';
  if (!mail || mail.indexOf('@') < 1) { authMsg('caErr', 'Indiquez une adresse e-mail valide.'); return; }
  if (pass.length < 8) { authMsg('caErr', 'Le mot de passe doit contenir au moins 8 caractères.'); return; }
  caGo.disabled = true;
  var done = function () { caGo.disabled = false; };
  if (authMode === 'in') {
    sb.auth.signInWithPassword({ email: mail, password: pass }).then(function (r) {
      done();
      if (r.error) {
        authMsg('caErr', /confirm/i.test(r.error.message)
          ? 'Votre adresse e-mail n’est pas encore confirmée. Cliquez sur le lien reçu par e-mail, puis réessayez.'
          : 'E-mail ou mot de passe incorrect.');
        return;
      }
      toCheckout();
    }, function () { done(); authMsg('caErr', 'Connexion impossible pour le moment. Réessayez.'); });
    return;
  }
  var name = val('caName'), tel = val('caTel');
  if (!name || !tel) { done(); authMsg('caErr', 'Indiquez votre nom et votre téléphone.'); return; }
  sb.auth.signUp({ email: mail, password: pass, options: {
    data: { full_name: name, tel: tel },
    emailRedirectTo: location.href.split('#')[0].split('?')[0] + '?commande=1'
  } }).then(function (r) {
    done();
    if (r.error) {
      authMsg('caErr', /registered|exists/i.test(r.error.message)
        ? 'Un compte existe déjà avec cette adresse. Choisissez « J’ai déjà un compte ».'
        : 'Création du compte impossible : ' + r.error.message);
      return;
    }
    if (r.data && r.data.session) { toCheckout(); return; }
    authMsg('caOk', 'Compte créé. Un e-mail de confirmation vient d’être envoyé à ' + mail
      + '. Cliquez sur le lien qu’il contient : vous reviendrez ici, avec votre panier, pour terminer la commande.');
  }, function () { done(); authMsg('caErr', 'Création du compte impossible pour le moment. Réessayez.'); });
});
document.addEventListener('click', function (e) {
  if (!e.target.closest || !e.target.closest('#cfLogout')) return;
  var sb = client();
  if (!sb) return;
  sb.auth.signOut().then(function () {
    var m = document.getElementById('cfMail'); if (m) { m.readOnly = false; m.value = ''; }
    var who = document.getElementById('cfWho'); if (who) who.hidden = true;
    goStep('auth');
  });
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
if (doneClose) doneClose.addEventListener('click', function () {
  closeCart();
  goStep(1);
});

function orderRef() {
  var d = new Date();
  var p = function (x) { return ('0' + x).slice(-2); };
  var rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return 'RC-' + String(d.getFullYear()).slice(2) + p(d.getMonth() + 1) + p(d.getDate()) + '-' + rnd;
}

if (confirmBtn) confirmBtn.addEventListener('click', function () {
  var d = collect();
  if (!d) return;
  var errBox = document.getElementById('cfSendErr');
  if (!CART_ENABLED) {
    var mailHref = 'mailto:' + MAIL + '?subject=' + encodeURIComponent('Commande site - ' + val('cfName'))
      + '&body=' + encodeURIComponent(d.txt);
    if (errBox) {
      errBox.hidden = false;
      errBox.innerHTML = 'L&rsquo;envoi automatique n&rsquo;est pas encore disponible. '
        + '<a href="' + mailHref + '">Cliquez ici pour nous envoyer votre commande par e-mail</a>, '
        + 'ou appelez/&eacute;crivez sur WhatsApp au +229 99 56 52 52.';
    }
    return;
  }
  var rec = buildRecord(d);
  rec.ref = orderRef();
  confirmBtn.disabled = true;
  confirmBtn.textContent = 'Envoi en cours…';
  submitOrder(rec, function (ok, msg) {
    confirmBtn.disabled = false;
    confirmBtn.textContent = 'Envoyer ma commande';
    if (!ok && msg === 'auth') { goStep('auth'); return; }
    if (!ok) {
      if (errBox) {
        errBox.hidden = false;
        errBox.textContent = 'Envoi impossible pour le moment. Réessayez, ou appelez/écrivez sur WhatsApp au +229 99 56 52 52.';
      }
      return;
    }
    if (errBox) errBox.hidden = true;
    var out = document.getElementById('cfRefOut');
    if (out) out.textContent = rec.ref;
    set([]);
    goStep(4);
  });
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
  c.forEach(function (it) { t += it.q * it.ht; });
  var name = val('cfName'), org = val('cfOrg'), tel = val('cfTel'), mail = val('cfMail'), city = val('cfCity');
  var ship = radioVal('cfShip'), pay = radioVal('cfPay'), addr = shipAddressLine(), note = val('cfNote');

  function block(title, lines) {
    return '<div class="cf-rec-b"><h4>' + title + '</h4>' + lines.map(function (l) {
      return '<p><span>' + l[0] + '</span><b>' + l[1] + '</b></p>';
    }).join('') + '</div>';
  }

  var items = c.map(function (it) {
    return '<p><span>' + it.q + ' &times; ' + it.name + '</span><b>' + fcfa(it.q * it.ht) + '</b></p>';
  }).join('');
  rows += '<div class="cf-rec-b"><h4>Articles</h4>' + items
    + '<p class="cf-rec-tot"><span>Total HT</span><b>' + fcfa(t) + ' &middot; ' + eur(t) + '</b></p></div>';

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
    t += it.q * it.ht;
    lines.push('- ' + it.q + ' x ' + it.name + ' (' + it.ref + ') : ' + fcfa(it.q * it.ht));
  });

  var org = val('cfOrg'), note = val('cfNote');
  var L = [];
  L.push('Bonjour ROOTS, je souhaite passer commande.');
  L.push('');
  L.push('COMMANDE');
  L = L.concat(lines);
  L.push('Total HT : ' + fcfa(t) + ' (soit ' + eur(t) + ')');
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
    items: c.map(function (it) { return { ref: it.ref, name: it.name, qty: it.q, unit_ht_eur: it.ht }; }),
    total_fcfa: Math.round(d.total * XOF),
    total_eur: Math.round(d.total * 100) / 100,
    note: val('cfNote') || null
  };
}
/* la commande part au tableau de bord (Supabase). done(ok, message) est rappele ensuite. */
function submitOrder(record, done) {
  var sb = client();
  if (!sb) { done(false, 'non configure'); return; }
  // compte obligatoire : la commande est toujours rattachee au compte connecte
  sb.auth.getSession().then(function (s) {
    var ses = s.data && s.data.session;
    if (!ses) { done(false, 'auth'); return; }
    record.user_id = ses.user.id;
    record.customer_mail = ses.user.email;
    function tryInsert(rec, allowRetry) {
      sb.from('orders').insert(rec).then(function (res) {
        if (!res.error) { done(true); return; }
        // si la colonne "ref" n'existe pas encore cote base, on reessaie sans elle :
        // la commande est enregistree quand meme, la reference reste affichee au client
        if (allowRetry && /'ref'|column .*ref/i.test(res.error.message || '')) {
          var noRef = {}; for (var k in rec) if (k !== 'ref') noRef[k] = rec[k];
          if (rec.ref && !rec.note) noRef.note = 'Reference ' + rec.ref;
          else if (rec.ref) noRef.note = 'Reference ' + rec.ref + ' | ' + rec.note;
          tryInsert(noRef, false);
          return;
        }
        try { console.warn('ROOTS: commande non enregistree', res.error.message); } catch (e) {}
        done(false, res.error.message);
      }, function (err) { done(false, String(err)); });
    }
    tryInsert(record, true);
  }, function (err) { done(false, String(err)); });
}

/* ---------------- filtres, recherche, tri ---------------- */
var grid = document.getElementById('bxgrid');
var cards = grid ? [].slice.call(grid.querySelectorAll('.bxcard')) : [];
var order = cards.slice();
var cat = 'all', q = '';

function norm(s) {
  s = (s || '').toLowerCase().replace(/œ/g, 'oe');
  try { s = s.normalize('NFD').replace(/[̀-ͯ]/g, ''); } catch (e) {}
  s = s.replace(/(\d+)\s*(go|gb)\b/g, '$1go').replace(/(\d+)\s*(to|tb)\b/g, '$1to');
  return s.replace(/[^a-z0-9]+/g, ' ');
}
/* mots vides ignores dans la recherche, pour que "un ecran pour la compta" fonctionne */
var STOP = ' de des du la le les un une pour avec et en a au aux d l sur par mon ma mes je cherche besoin ';
/* chaque mot tape doit se retrouver dans la fiche (debut de mot accepte, pluriel tolere) */
function words(c) {
  if (!c._w) c._w = norm(c.dataset.search + ' ' + c.dataset.name).split(' ').filter(Boolean);
  return c._w;
}
function hit(ws, tok) {
  var alt = tok.length > 3 && tok.slice(-1) === 's' ? tok.slice(0, -1) : tok;
  for (var i = 0; i < ws.length; i++) {
    if (ws[i].indexOf(tok) === 0 || ws[i].indexOf(alt) === 0) return true;
  }
  return false;
}
function apply() {
  var toks = norm(q).split(' ').filter(function (t) { return t && STOP.indexOf(' ' + t + ' ') < 0; });
  var shown = 0;
  cards.forEach(function (c) {
    var okc = (cat === 'all' || c.dataset.cat === cat);
    var ws = words(c);
    var oks = toks.every(function (t) { return hit(ws, t); });
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

/* panier enregistre avant une mise a jour du catalogue : prix et noms repris de la page,
   articles qui n'existent plus retires (sinon un ancien prix partirait avec la commande) */
(function () {
  if (!cards.length) return;
  var c = get(), changed = false;
  c = c.filter(function (it) {
    var b = document.querySelector('.sadd[data-ref="' + it.ref + '"]');
    if (!b) { changed = true; return false; }
    var ht = parseFloat(b.dataset.ht);
    if (it.ht !== ht || it.name !== b.dataset.name) { it.ht = ht; it.name = b.dataset.name; changed = true; }
    return true;
  });
  if (changed) { try { localStorage.setItem(K, JSON.stringify(c)); } catch (e) {} }
})();

render();
goStep(1);

if (WA_MODE) {
  document.body.classList.add('wa-mode');
  [].slice.call(document.querySelectorAll('.sadd')).forEach(function (b) {
    b.innerHTML = WA_ICON + '<span>Commander</span>';
    b.setAttribute('aria-label', 'Commander ' + b.dataset.name + ' sur WhatsApp');
  });
  if (modalAdd) modalAdd.innerHTML = WA_ICON + '<span>Commander sur WhatsApp</span>';
}

/* retour depuis le lien de confirmation d'e-mail : on rouvre le panier a l'etape des coordonnees */
if (!WA_MODE && (/[?&]commande=1/.test(location.search) || /access_token=/.test(location.hash))) {
  client();
  setTimeout(function () {
    session(function (s) {
      if (s && get().length) { openCart(); toCheckout(); }
      try { history.replaceState(null, '', location.pathname); } catch (e) {}
    });
  }, 300);
}
})();
