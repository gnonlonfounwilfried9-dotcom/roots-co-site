/* ROOTS : page Contact guidee. Quelle est votre demande ? -> precisions -> coordonnees.
   Aucune adresse e-mail ni aucun numero n'est affiche : la demande part par le formulaire (voir app.js). */
(function () {
  var root = document.getElementById('demande'); if (!root) return;
  var $ = function (s, r) { return (r || root).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || root).querySelectorAll(s)); };

  var TYPES = {
    devis: { label: 'Demande de devis', q: 'Quels produits ou services ?', hint: 'Vous pouvez en choisir plusieurs.',
      msg: 'Marques souhaitées, lieu de livraison, toute précision utile',
      groups: [
        { key: 'Produits et services', multi: true, opts: ['Ordinateurs et postes', 'Serveurs', 'Imprimantes et copieurs', 'Réseau et Wi-Fi', 'Cybersécurité', 'Sauvegarde et stockage', 'Vidéosurveillance', 'Énergie et solaire', 'Logiciels et ERP Odoo', 'Autre'] },
        { key: 'Quantité', multi: false, opts: ['1 à 5', '6 à 20', 'Plus de 20', 'À définir'] },
        { key: 'Délai souhaité', multi: false, opts: ['Urgent, moins de 2 semaines', 'Dans le mois', 'Dans les 3 mois', 'Pas de date'] }] },
    aide: { label: 'Support technique', q: 'Quel est le problème ?', hint: 'Choisissez ce qui s’en rapproche le plus.',
      msg: 'Décrivez ce qui se passe, depuis quand, sur quel équipement',
      groups: [
        { key: 'Problème', multi: false, opts: ['Panne de poste ou de serveur', 'Réseau ou Wi-Fi', 'Sécurité ou virus', 'Sauvegarde', 'Imprimante', 'Logiciel ou Odoo', 'Autre'] },
        { key: 'Urgence', multi: false, opts: ['Bloquant, l’activité est à l’arrêt', 'Gênant', 'Pas urgent'] }] },
    form: { label: 'Formation', q: 'Quelle formation vous intéresse ?', hint: 'Nous adaptons le programme à votre équipe.',
      msg: 'Niveau de l’équipe, dates souhaitées, objectifs',
      groups: [
        { key: 'Thème', multi: true, opts: ['Windows Server et Active Directory', 'Microsoft Office', 'Sécurité (RSSI)', 'Sophos', 'Sauvegarde Acronis', 'Odoo', 'Autre'] },
        { key: 'Participants', multi: false, opts: ['1 à 3', '4 à 10', 'Plus de 10'] },
        { key: 'Lieu', multi: false, opts: ['Dans vos locaux', 'Chez ROOTS', 'À distance'] }] },
    part: { label: 'Partenariat', q: 'Vous êtes ?', hint: '',
      msg: 'Présentez votre structure et ce que vous proposez',
      groups: [{ key: 'Profil', multi: false, opts: ['Fabricant ou distributeur', 'Revendeur', 'Institution ou organisation', 'Cabinet ou consultant', 'Autre'] }] },
    impex: { label: 'Import-export', q: 'Que souhaitez-vous ?', hint: '',
      msg: 'Produit recherché, quantité, pays de livraison',
      groups: [{ key: 'Besoin', multi: false, opts: ['Trouver un produit à l’import', 'Organiser un transport', 'Suivre une commande', 'Matériel industriel sur cahier des charges', 'Autre'] },
        { key: 'Destination', multi: false, opts: ['Togo', 'Bénin', 'Autre pays d’Afrique de l’Ouest', 'Europe'] }] },
    autre: { label: 'Autre demande', q: '', hint: '', msg: 'Écrivez votre question', groups: [] }
  };

  var state = { type: null, ans: {}, step: 1 };
  var bar = $('.cf-bar i'), lis = $$('.cf-prog li');

  function go(n, back) {
    state.step = n;
    $$('.cf-step').forEach(function (s) {
      var on = +s.getAttribute('data-s') === n;
      s.classList.toggle('on', on);
      s.classList.toggle('bk', !!back);
    });
    lis.forEach(function (l, i) { l.classList.toggle('on', i === n - 1); l.classList.toggle('done', i < n - 1); });
    if (bar) bar.style.width = (n === 1 ? 33 : n === 2 ? 66 : 100) + '%';
    var top = root.getBoundingClientRect().top + window.scrollY - 90;
    if (window.scrollY > top + 40) window.scrollTo({ top: top, behavior: 'smooth' });
  }

  function renderStep2() {
    var T = TYPES[state.type];
    $('#cfQ').textContent = T.q; $('#cfHint').textContent = T.hint;
    var box = $('#cfOpts'); box.innerHTML = '';
    T.groups.forEach(function (g) {
      var d = document.createElement('div'); d.className = 'cf-g';
      d.innerHTML = '<h4>' + g.key + (g.multi ? '<em>plusieurs choix possibles</em>' : '') + '</h4>';
      var row = document.createElement('div'); row.className = 'cf-ch';
      g.opts.forEach(function (o) {
        var b = document.createElement('button'); b.type = 'button'; b.textContent = o;
        if ((state.ans[g.key] || []).indexOf(o) > -1) b.className = 'on';
        b.addEventListener('click', function () {
          var cur = state.ans[g.key] || [];
          if (g.multi) { var i = cur.indexOf(o); if (i > -1) cur.splice(i, 1); else cur.push(o); }
          else cur = cur.indexOf(o) > -1 ? [] : [o];
          state.ans[g.key] = cur;
          $$('button', row).forEach(function (x) { x.classList.toggle('on', cur.indexOf(x.textContent) > -1); });
          check();
        });
        row.appendChild(b);
      });
      d.appendChild(row); box.appendChild(d);
    });
    check();
  }
  function check() {
    var T = TYPES[state.type], ok = T.groups.every(function (g) { return (state.ans[g.key] || []).length > 0; });
    $('#cfNext').disabled = !ok;
  }

  function summary() {
    var T = TYPES[state.type], parts = [];
    T.groups.forEach(function (g) { if ((state.ans[g.key] || []).length) parts.push(state.ans[g.key].join(', ')); });
    $('#cfSum').textContent = 'Votre demande : ' + T.label + (parts.length ? ' · ' + parts.join(' · ') : '');
    $('#cfMsg').setAttribute('placeholder', T.msg);
    $('#cfMsgL').textContent = state.type === 'autre' ? 'Votre question' : 'Précisions (facultatif)';
    $('#cfSubj').value = T.label;
  }

  function choose(t) {
    if (state.type !== t) state.ans = {};
    state.type = t;
    $$('.cf-t').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-t') === t); });
    if (TYPES[t].groups.length) { renderStep2(); setTimeout(function () { go(2); }, 260); }
    else { summary(); setTimeout(function () { go(3); }, 260); }
  }

  $$('.cf-t').forEach(function (b) { b.addEventListener('click', function () { choose(b.getAttribute('data-t')); }); });
  $('#cfNext').addEventListener('click', function () { summary(); go(3); });
  $$('.cf-back').forEach(function (b) {
    b.addEventListener('click', function () {
      var to = +b.getAttribute('data-go');
      if (to === 2 && !TYPES[state.type].groups.length) to = 1;
      go(to, true);
    });
  });

  /* le texte envoye = type + choix + message, assemble juste avant l'envoi (voir app.js, champ need) */
  var form = document.getElementById('quoteForm');
  if (form) form.addEventListener('click', function (e) {
    if (!e.target.closest('[data-send]')) return;
    var T = TYPES[state.type] || TYPES.autre, lines = [];
    T.groups.forEach(function (g) { var a = state.ans[g.key] || []; if (a.length) lines.push(g.key + ' : ' + a.join(', ')); });
    var m = ($('#cfMsg').value || '').trim(); if (m) lines.push('Message : ' + m);
    $('#cfNeed').value = lines.join('\n');
  }, true);

  /* succes : etape terminee */
  var ok = document.getElementById('quoteOk');
  if (ok && 'MutationObserver' in window) {
    new MutationObserver(function () {
      if (!ok.hidden) {
        lis.forEach(function (l) { l.classList.remove('on'); l.classList.add('done'); });
        if (bar) bar.style.width = '100%';
        $$('.cf-back').forEach(function (b) { b.style.display = 'none'; });
        var s = $('#cfSum'); if (s) s.style.display = 'none';
        root.classList.add('cf-sent');
      }
    }).observe(ok, { attributes: true, attributeFilter: ['hidden'] });
  }
  var again = document.getElementById('cfAgain'); if (again) again.addEventListener('click', function () { location.href = 'contact.html'; });

  /* arrivee avec un type connu : contact.html#devis, #aide, #form, #part, #impex, #autre */
  var h = (location.hash || '').replace('#', '');
  if (TYPES[h]) choose(h);
})();
