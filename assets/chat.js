/* ROOTS - Assistant du site.
   Deux modes :
   - mode local (par defaut) : recherche dans window.ROOTS_KB.
   - mode modele : si window.ROOTS_CHAT_API contient l'URL d'un relais, la question
     est envoyee a Claude avec la base de connaissances en contexte. En cas d'erreur,
     on retombe automatiquement sur le mode local. Voir worker/README.md.
*/
(function () {
var WA = 'https://wa.me/22999565252';
var KB = window.ROOTS_KB || [];
var MENUS = window.ROOTS_KB_MENUS || [];
var API = (window.ROOTS_CHAT_API || '').trim();
var history = [];

/* ---------------- recherche locale ---------------- */
var STOP = ' le la les un une des du de au aux et ou en dans pour par sur avec sans vos votre notre nos que qui quoi est sont ce cette ces il elle on se ne pas plus tout tous je vous nous me ma mon mes ai avez avoir etre suis c est j ai d un d une l ';
function norm(s) {
  s = (s || '').toLowerCase();
  try { s = s.normalize('NFD').replace(/[̀-ͯ]/g, ''); } catch (e) {}
  return s.replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}
function toks(s) {
  var a = norm(s).split(' '), o = [];
  for (var i = 0; i < a.length; i++) {
    if (a[i].length > 2 && STOP.indexOf(' ' + a[i] + ' ') < 0) o.push(a[i]);
  }
  return o;
}
var IDX = KB.map(function (e) {
  return { e: e, t: ' ' + norm(e.t) + ' ', k: ' ' + norm(e.k) + ' ', a: ' ' + norm(e.a.replace(/<[^>]+>/g, ' ')) + ' ' };
});
function search(q) {
  var t = toks(q);
  if (!t.length) return [];
  var res = [];
  for (var i = 0; i < IDX.length; i++) {
    var it = IDX[i], s = 0;
    for (var j = 0; j < t.length; j++) {
      var w = t[j];
      if (it.t.indexOf(' ' + w) > -1) s += 6;
      else if (it.k.indexOf(' ' + w) > -1) s += 3;
      else if (it.a.indexOf(' ' + w) > -1) s += 1;
      else if (w.length > 4 && (it.t + it.k).indexOf(w.slice(0, w.length - 1)) > -1) s += 2;
    }
    if (s > 0) res.push({ e: it.e, s: s / Math.sqrt(t.length) });
  }
  res.sort(function (a, b) { return b.s - a.s; });
  return res;
}

/* ---------------- interface ---------------- */
var el = document.createElement('div');
el.innerHTML = ''
+ '<button class="rc-btn" id="rcBtn" data-lb="Assistant ROOTS" aria-label="Assistant ROOTS">'
+ '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'
+ '<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.5 9.5 0 0 1-2.8-.4L3 21l1.6-4.7A8.3 8.3 0 0 1 3.6 11.5a8.4 8.4 0 0 1 9-8.4 8.4 8.4 0 0 1 8.4 8.4z"/></svg></button>'
+ '<div class="rc-panel" id="rcPanel" role="dialog" aria-label="Assistant ROOTS">'
+ '<div class="rc-head"><div><strong>Assistant ROOTS</strong>'
+ '<span class="rc-sub"><i class="rc-dot"></i>En ligne, réponse immédiate</span></div>'
+ '<div class="rc-hbtns"><button id="rcHome" title="Menu" aria-label="Menu">'
+ '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>'
+ '<button id="rcClose" aria-label="Fermer">&times;</button></div></div>'
+ '<div class="rc-msgs" id="rcMsgs"></div><div class="rc-quick" id="rcQuick"></div>'
+ '<form class="rc-form" id="rcForm"><input id="rcIn" type="text" placeholder="Posez votre question..." autocomplete="off">'
+ '<button type="submit" aria-label="Envoyer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
+ '<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/></svg></button></form></div>';
document.body.appendChild(el);

var msgs = document.getElementById('rcMsgs');
var panel = document.getElementById('rcPanel');
var quickBox = document.getElementById('rcQuick');

function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

function add(html, who) {
  var d = document.createElement('div');
  d.className = 'rc-m ' + who;
  d.innerHTML = html;
  msgs.appendChild(d);
  msgs.scrollTop = msgs.scrollHeight;
  return d;
}
function links(q) {
  if (!q || !q.length) return '';
  var h = q.map(function (x) {
    if (x[1].indexOf('?menu:') === 0) return '<a href="#" data-menu="' + x[1].slice(6) + '">' + x[0] + '</a>';
    if (x[1].indexOf('?ask:') === 0) return '<a href="#" data-ask="' + esc(x[1].slice(5)) + '">' + x[0] + '</a>';
    if (x[1].indexOf('?id:') === 0) return '<a href="#" data-id="' + x[1].slice(4) + '">' + x[0] + '</a>';
    var ext = x[1].indexOf('http') === 0 ? ' target="_blank" rel="noopener"' : '';
    return '<a href="' + x[1] + '"' + ext + '>' + x[0] + '</a>';
  }).join('');
  return '<div class="rc-links">' + h + '</div>';
}
function setQuick(items) {
  quickBox.innerHTML = '';
  items.forEach(function (x) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = x[0];
    b.onclick = x[1];
    quickBox.appendChild(b);
  });
  quickBox.style.display = items.length ? '' : 'none';
}

/* ---------------- menus ---------------- */
function showHome(first) {
  if (first) {
    add('Bonjour, et bienvenue chez ROOTS.<br><br>Posez-moi votre question, simplement. '
      + 'Nos solutions et nos prix, bien sûr, mais aussi un conseil informatique, un dépannage, '
      + 'une question de sécurité. Je suis là pour ça.', 'bot');
  }
  var h = '<div class="rc-menu">';
  MENUS.forEach(function (m) {
    var n = KB.filter(function (e) { return e.g === m.g; }).length;
    h += '<a href="#" data-menu="' + m.g + '"><strong>' + m.t + ' <em>' + n + '</em></strong><span>' + m.d + '</span></a>';
  });
  h += '</div>';
  add(h, 'bot');
  setQuick([
    ['Quel ordinateur choisir ?', function () { ask('quel ordinateur choisir'); }],
    ['Mon PC est lent', function () { ask('ordinateur lent'); }],
    ['Vos prix', function () { ask('prix fcfa'); }],
    ['Livraison Togo et Bénin', function () { ask('livraison delai'); }],
    ['Demander un devis', function () { ask('devis'); }]
  ]);
}
function showMenu(g) {
  var list = KB.filter(function (e) { return e.g === g; });
  var m = MENUS.filter(function (x) { return x.g === g; })[0] || { t: g };
  var h = '<b>' + m.t + '</b> &mdash; ' + list.length + ' fiches. Choisissez, ou posez directement votre question.'
    + '<div class="rc-list">';
  list.forEach(function (e) { h += '<a href="#" data-id="' + e.id + '">' + e.t + '</a>'; });
  h += '</div>';
  add(h, 'bot');
  setQuick([['← Retour au menu', function () { showHome(false); }]]);
}

/* ---------------- reponses ---------------- */
function related(e) {
  var same = KB.filter(function (x) { return x.g === e.g && x.id !== e.id; });
  var out = [];
  for (var i = 0; i < 2 && same.length; i++) {
    var k = Math.floor(Math.random() * same.length);
    out.push(['' + same[k].t, '?id:' + same[k].id]);
    same.splice(k, 1);
  }
  return out;
}
function answerEntry(e) {
  add(e.a + links((e.q || []).concat(related(e))), 'bot');
  history.push({ q: e.t, a: e.a.replace(/<[^>]+>/g, '') });
  setQuick([['← Menu', function () { showHome(false); }],
            ['Demander un devis', function () { ask('devis'); }]]);
}
function notFound(q) {
  // jamais de message d'echec : on ouvre la conversation au lieu de la fermer
  add('Dites-m’en un peu plus et je creuse avec vous. En attendant, voici par où on peut commencer, '
    + 'et si vous préférez en parler de vive voix, un conseiller ROOTS vous répond sur WhatsApp.'
    + links([['Parcourir les thèmes', '?menu:general'], ['Écrire sur WhatsApp', WA]]), 'bot');
  setQuick([['← Menu', function () { showHome(false); }],
            ['Parler à un conseiller', function () { window.open(WA, '_blank'); }]]);
}
function localAnswer(q) {
  var r = search(q);
  if (!r.length) { notFound(q); return; }
  if (r.length === 1 || r[0].s >= r[1].s * 1.25 || r[0].s >= 9) { answerEntry(r[0].e); return; }
  var top = r.slice(0, 4);
  var h = 'Sur quoi voulez-vous que je parte ?<div class="rc-list">';
  top.forEach(function (x) { h += '<a href="#" data-id="' + x.e.id + '">' + x.e.t + '</a>'; });
  h += '</div>';
  add(h, 'bot');
  setQuick([['← Menu', function () { showHome(false); }]]);
}

function apiAnswer(q) {
  var wait = add('<span class="rc-typing"><i></i><i></i><i></i></span>', 'bot');
  var ctx = search(q).slice(0, 10).map(function (x) {
    return '### ' + x.e.t + '\n' + x.e.a.replace(/<[^>]+>/g, '');
  }).join('\n\n');
  fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: q, context: ctx, history: history.slice(-6) })
  }).then(function (r) {
    if (!r.ok) throw new Error(r.status);
    return r.json();
  }).then(function (d) {
    if (!d || !d.answer) throw new Error('vide');
    wait.innerHTML = d.answer.replace(/\n/g, '<br>')
      + links([['Demander un devis', 'contact.html'], ['Écrire sur WhatsApp', WA]]);
    history.push({ q: q, a: d.answer });
    msgs.scrollTop = msgs.scrollHeight;
  }).catch(function () {
    wait.parentNode && wait.parentNode.removeChild(wait);
    localAnswer(q);
  });
}

function logQuestion(q) {
  var cfg = window.ROOTS_SUPABASE;
  if (!cfg || !cfg.url || !cfg.anonKey || !q) return;
  try {
    fetch(cfg.url + '/rest/v1/chat_logs', {
      method: 'POST',
      headers: { 'apikey': cfg.anonKey, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: JSON.stringify({ question: String(q).slice(0, 500), page: (location.pathname.split('/').pop() || 'index.html') }),
      keepalive: true
    }).catch(function () {});
  } catch (e) {}
}

function ask(q, label) {
  add(esc(label || q), 'me');
  logQuestion(q);
  setQuick([]);
  setTimeout(function () {
    if (API) apiAnswer(q); else localAnswer(q);
  }, 220);
}

/* ---------------- evenements ---------------- */
msgs.addEventListener('click', function (ev) {
  var a = ev.target.closest('a');
  if (!a) return;
  if (a.dataset.menu) { ev.preventDefault(); showMenu(a.dataset.menu); return; }
  if (a.dataset.ask) { ev.preventDefault(); ask(a.dataset.ask); return; }
  if (a.dataset.id) {
    ev.preventDefault();
    var e = KB.filter(function (x) { return x.id === a.dataset.id; })[0];
    if (e) { add(esc(e.t), 'me'); setTimeout(function () { answerEntry(e); }, 180); }
  }
});
document.getElementById('rcBtn').onclick = function () {
  panel.classList.toggle('show');
  if (panel.classList.contains('show')) {
    var cp = document.getElementById('cartPanel'), cv = document.getElementById('cartVeil');
    if (cp) cp.classList.remove('show'); if (cv) cv.classList.remove('show');
    if (!msgs.dataset.init) { msgs.dataset.init = '1'; showHome(true); }
    var i = document.getElementById('rcIn'); if (i) i.focus();
  }
};
document.getElementById('rcHome').onclick = function () { showHome(false); };
document.getElementById('rcClose').onclick = function () { panel.classList.remove('show'); };
document.getElementById('rcForm').onsubmit = function (ev) {
  ev.preventDefault();
  var i = document.getElementById('rcIn');
  if (i.value.trim()) { ask(i.value.trim()); i.value = ''; }
};
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') panel.classList.remove('show');
});
})();
