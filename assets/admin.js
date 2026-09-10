/* ROOTS - tableau de bord commandes (assets/orders.sql pour le schema) */
(function () {
  var XOF = 655.957;
  var STATUS_LABEL = { nouveau: 'Nouvelle', confirme: 'Confirmée', en_livraison: 'En livraison', livre: 'Livrée', annule: 'Annulée' };

  var loginBox = document.getElementById('admLogin');
  var dashBox = document.getElementById('admDash');
  var logoutBtn = document.getElementById('admLogout');
  var form = document.getElementById('admForm');
  var errBox = document.getElementById('admErr');
  var configHint = document.getElementById('admConfigHint');

  var cfg = window.ROOTS_SUPABASE;
  if (!cfg || !cfg.url || !cfg.anonKey || !window.supabase) {
    if (configHint) configHint.hidden = false;
    if (form) { [].slice.call(form.querySelectorAll('input,button')).forEach(function (e) { e.disabled = true; }); }
    return;
  }
  var sb = window.supabase.createClient(cfg.url, cfg.anonKey);

  function fcfa(v) { return Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA'; }
  function eur(v) { return (Math.round(v * 100) / 100).toFixed(2).replace('.', ',') + ' €'; }
  function fmtDate(iso) {
    try {
      var d = new Date(iso);
      return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
        + ' · ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch (e) { return iso; }
  }

  /* ---------------- connexion ---------------- */
  function showDash() { loginBox.hidden = true; dashBox.hidden = false; if (logoutBtn) logoutBtn.hidden = false; loadOrders(); }
  function showLogin() { loginBox.hidden = false; dashBox.hidden = true; if (logoutBtn) logoutBtn.hidden = true; }

  sb.auth.getSession().then(function (r) {
    if (r.data && r.data.session) showDash(); else showLogin();
  });

  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var mail = document.getElementById('admMail').value.trim();
    var pass = document.getElementById('admPass').value;
    if (errBox) errBox.hidden = true;
    sb.auth.signInWithPassword({ email: mail, password: pass }).then(function (r) {
      if (r.error) {
        if (errBox) { errBox.hidden = false; errBox.textContent = 'Connexion impossible : ' + r.error.message; }
        return;
      }
      showDash();
    });
  });
  if (logoutBtn) logoutBtn.addEventListener('click', function () {
    sb.auth.signOut().then(showLogin);
  });

  /* ---------------- donnees ---------------- */
  var ALL = [];
  var filter = 'all', search = '';

  function loadOrders() {
    sb.from('orders').select('*').order('created_at', { ascending: false }).then(function (r) {
      if (r.error) { console.warn('ROOTS admin: lecture impossible', r.error.message); return; }
      ALL = r.data || [];
      renderStats();
      renderList();
    });
  }
  var refreshBtn = document.getElementById('admRefresh');
  if (refreshBtn) refreshBtn.addEventListener('click', loadOrders);

  function renderStats() {
    var live = ALL.filter(function (o) { return o.status !== 'annule'; });
    document.getElementById('stAll').textContent = ALL.length;
    document.getElementById('stNew').textContent = ALL.filter(function (o) { return o.status === 'nouveau'; }).length;
    document.getElementById('stProg').textContent = ALL.filter(function (o) { return o.status === 'confirme' || o.status === 'en_livraison'; }).length;
    document.getElementById('stDone').textContent = ALL.filter(function (o) { return o.status === 'livre'; }).length;
    var total = live.reduce(function (s, o) { return s + (o.total_fcfa || 0); }, 0);
    document.getElementById('stTotal').textContent = fcfa(total);
  }

  function matches(o) {
    if (filter !== 'all' && o.status !== filter) return false;
    if (!search) return true;
    var hay = [o.customer_name, o.customer_city, o.customer_org, o.customer_tel]
      .concat((o.items || []).map(function (it) { return it.name + ' ' + it.ref; }))
      .join(' ').toLowerCase();
    return hay.indexOf(search) > -1;
  }

  var listBox = document.getElementById('admList');
  var emptyBox = document.getElementById('admEmpty');
  var tpl = document.getElementById('admRowTpl');

  function renderList() {
    var rows = ALL.filter(matches);
    listBox.innerHTML = '';
    emptyBox.hidden = rows.length > 0;
    rows.forEach(function (o) {
      var node = tpl.content.cloneNode(true);
      var art = node.querySelector('.adm-row');
      art.dataset.id = o.id;
      node.querySelector('.adm-name').textContent = o.customer_name + (o.customer_org ? ' · ' + o.customer_org : '');
      node.querySelector('.adm-city').textContent = o.customer_city;
      node.querySelector('.adm-date').textContent = fmtDate(o.created_at);
      node.querySelector('.adm-amt').textContent = fcfa(o.total_fcfa) + ' · ' + eur(o.total_eur);
      var sel = node.querySelector('.adm-status');
      sel.value = o.status;
      sel.className = 'adm-status st-' + o.status;
      sel.addEventListener('change', function () { updateStatus(o.id, sel.value, sel); });

      var items = node.querySelector('.adm-items');
      (o.items || []).forEach(function (it) {
        var p = document.createElement('p');
        p.textContent = it.qty + ' × ' + it.name;
        items.appendChild(p);
      });
      node.querySelector('.adm-contact').innerHTML = [o.customer_tel, o.customer_mail].join('<br>');
      var shipTxt = o.ship_method + (o.ship_address ? '<br>' + o.ship_address : '') + (o.ship_slot ? '<br>Créneau : ' + o.ship_slot : '');
      node.querySelector('.adm-ship').innerHTML = shipTxt;
      node.querySelector('.adm-pay').innerHTML = o.pay_method + (o.pay_detail ? '<br>' + o.pay_detail : '');
      var noteEl = node.querySelector('.adm-note');
      if (o.note) { noteEl.hidden = false; noteEl.textContent = o.note; }

      var toggle = node.querySelector('.adm-toggle');
      var body = node.querySelector('.adm-row-body');
      toggle.addEventListener('click', function () {
        body.hidden = !body.hidden;
        toggle.classList.toggle('open', !body.hidden);
      });

      listBox.appendChild(node);
    });
  }

  function updateStatus(id, status, sel) {
    sel.className = 'adm-status st-' + status;
    sb.from('orders').update({ status: status }).eq('id', id).then(function (r) {
      if (r.error) { console.warn('ROOTS admin: statut non enregistré', r.error.message); return; }
      var o = ALL.filter(function (x) { return x.id === id; })[0];
      if (o) o.status = status;
      logAction('statut de commande', (o && o.ref) || id, { statut: status });
      renderStats();
    });
  }

  var filtersBox = document.getElementById('admFilters');
  if (filtersBox) filtersBox.addEventListener('click', function (e) {
    var b = e.target.closest('.adm-filter');
    if (!b) return;
    [].slice.call(filtersBox.querySelectorAll('.adm-filter')).forEach(function (x) { x.classList.remove('on'); });
    b.classList.add('on');
    filter = b.dataset.f;
    renderList();
  });
  var searchBox = document.getElementById('admSearch');
  if (searchBox) searchBox.addEventListener('input', function () {
    search = searchBox.value.trim().toLowerCase();
    renderList();
  });

  /* ================= onglets ================= */
  var tabs = document.getElementById('admTabs');
  var panels = {
    commandes: document.getElementById('panelCommandes'),
    produits: document.getElementById('panelProduits'),
    clients: document.getElementById('panelClients'),
    analyse: document.getElementById('panelAnalyse'),
    reglages: document.getElementById('panelReglages')
  };
  var editor = document.getElementById('prodEditor');
  var prodLoaded = false;
  if (tabs) tabs.addEventListener('click', function (e) {
    var b = e.target.closest('.adm-tab');
    if (!b) return;
    [].slice.call(tabs.querySelectorAll('.adm-tab')).forEach(function (x) { x.classList.remove('on'); });
    b.classList.add('on');
    var t = b.dataset.tab;
    Object.keys(panels).forEach(function (k) { if (panels[k]) panels[k].hidden = (k !== t); });
    if (editor) editor.hidden = true;
    var cd = document.getElementById('cliDetail'); if (cd) cd.hidden = true;
    if (t === 'produits' && !prodLoaded) loadProducts();
    if (t === 'analyse') { if (!anLoaded) loadAnalyse(); else renderAnalyse(); }
    if (t === 'clients') { closeCli(); buildClients(); }
    if (t === 'reglages') loadReglages();
  });

  /* ================= produits ================= */
  var PRODS = [], CATS = [], psearch = '';
  var prodList = document.getElementById('prodList');
  var prodEmpty = document.getElementById('prodEmpty');
  var prodHint = document.getElementById('prodConfigHint');

  function loadCats() {
    return sb.from('categories').select('*').order('rang').then(function (r) {
      CATS = (r && r.data) || [];
    });
  }
  function loadProducts() {
    loadCats().then(function () {
      return sb.from('products').select('*').order('categorie_id').order('nom_fr');
    }).then(function (r) {
      if (r && r.error) {
        if (prodHint) prodHint.hidden = false;
        console.warn('ROOTS admin: catalogue', r.error.message);
        return;
      }
      if (prodHint) prodHint.hidden = true;
      prodLoaded = true;
      PRODS = (r && r.data) || [];
      renderProdStats();
      renderProds();
    });
  }
  var prodRefresh = document.getElementById('prodRefresh');
  if (prodRefresh) prodRefresh.addEventListener('click', loadProducts);
  var prodSearchBox = document.getElementById('prodSearch');
  if (prodSearchBox) prodSearchBox.addEventListener('input', function () {
    psearch = prodSearchBox.value.trim().toLowerCase();
    renderProds();
  });

  function renderProdStats() {
    document.getElementById('stProdAll').textContent = PRODS.length;
    document.getElementById('stProdActive').textContent = PRODS.filter(function (p) { return p.actif; }).length;
    document.getElementById('stProdLow').textContent = PRODS.filter(function (p) { return p.stock <= (p.seuil_alerte || 3); }).length;
  }
  function catName(id) {
    var c = CATS.filter(function (x) { return x.id === id; })[0];
    return c ? c.nom_fr : (id || 'Sans cat&eacute;gorie');
  }
  function renderProds() {
    var rows = PRODS.filter(function (p) {
      if (!psearch) return true;
      return (p.nom_fr + ' ' + p.ref + ' ' + (p.spec_fr || '')).toLowerCase().indexOf(psearch) > -1;
    });
    prodList.innerHTML = '';
    prodEmpty.hidden = rows.length > 0;
    rows.forEach(function (p) {
      var low = p.stock <= (p.seuil_alerte || 3);
      var d = document.createElement('article');
      d.className = 'adm-prod' + (p.actif ? '' : ' off');
      d.innerHTML =
        '<div class="adm-prod-img">' + (p.images && p.images[0] ? '<img src="' + p.images[0] + '" alt="">' : '') + '</div>' +
        '<div class="adm-prod-main"><strong>' + p.nom_fr + '</strong>' +
          '<span class="adm-prod-meta">' + p.ref + ' &middot; ' + catName(p.categorie_id) + '</span></div>' +
        '<div class="adm-prod-num"><b>' + fcfa(p.prix_ttc_fcfa) + '</b>' +
          '<span>HT ' + fcfa(p.prix_ht_fcfa || Math.round(p.prix_ttc_fcfa / 1.18)) + '</span></div>' +
        '<div class="adm-prod-stock ' + (low ? 'low' : '') + '">' + p.stock + ' en stock' +
          (p.actif ? '' : '<span class="adm-prod-tag">Masqu&eacute;</span>') + '</div>' +
        '<button class="btn btn-line adm-prod-edit" type="button">Modifier</button>';
      d.querySelector('.adm-prod-edit').addEventListener('click', function () { openEditor(p); });
      prodList.appendChild(d);
    });
  }

  /* ---------------- editeur produit ---------------- */
  var form2 = document.getElementById('prodForm');
  var editing = null;
  var F = {
    ref: document.getElementById('pfRef'), nom: document.getElementById('pfNom'),
    cat: document.getElementById('pfCat'), stock: document.getElementById('pfStock'),
    prix: document.getElementById('pfPrix'), seuil: document.getElementById('pfSeuil'),
    spec: document.getElementById('pfSpec'), desc: document.getElementById('pfDesc'),
    img: document.getElementById('pfImg'), actif: document.getElementById('pfActif'),
    ht: document.getElementById('pfHt'), err: document.getElementById('pfErr'),
    del: document.getElementById('pfDelete'), title: document.getElementById('prodEditTitle')
  };
  function fillCats() {
    F.cat.innerHTML = CATS.map(function (c) {
      return '<option value="' + c.id + '">' + c.nom_fr + '</option>';
    }).join('');
  }
  function showHt() {
    var v = parseInt(F.prix.value, 10);
    F.ht.textContent = v ? 'Hors taxe : ' + fcfa(Math.round(v / 1.18)) : 'Hors taxe : —';
  }
  if (F.prix) F.prix.addEventListener('input', showHt);

  function openEditor(p) {
    editing = p || null;
    fillCats();
    F.err.hidden = true;
    F.title.textContent = p ? 'Modifier ' + p.nom_fr : 'Nouveau produit';
    F.ref.value = p ? p.ref : '';
    F.ref.disabled = !!p;
    F.nom.value = p ? p.nom_fr : '';
    F.cat.value = p ? (p.categorie_id || 'divers') : 'portables';
    F.stock.value = p ? p.stock : 0;
    F.prix.value = p ? p.prix_ttc_fcfa : '';
    F.seuil.value = p ? (p.seuil_alerte || 3) : 3;
    F.spec.value = p ? (p.spec_fr || '') : '';
    F.desc.value = p ? (p.desc_fr || '') : '';
    F.img.value = p && p.images && p.images[0] ? p.images[0] : '';
    F.actif.checked = p ? !!p.actif : true;
    F.del.hidden = !p;
    showHt();
    panels.produits.hidden = true;
    editor.hidden = false;
    editor.scrollIntoView({ block: 'start' });
  }
  document.getElementById('prodNew').addEventListener('click', function () { openEditor(null); });
  document.getElementById('prodCancel').addEventListener('click', closeEditor);
  function closeEditor() {
    editor.hidden = true;
    panels.produits.hidden = false;
  }

  if (form2) form2.addEventListener('submit', function (e) {
    e.preventDefault();
    var ref = F.ref.value.trim(), nom = F.nom.value.trim(), prix = parseInt(F.prix.value, 10);
    if (!ref || !nom || !prix) {
      F.err.hidden = false; F.err.textContent = 'R&eacute;f&eacute;rence, nom et prix TTC sont obligatoires.';
      return;
    }
    var img = F.img.value.trim();
    var rec = {
      ref: ref, nom_fr: nom, categorie_id: F.cat.value,
      stock: parseInt(F.stock.value, 10) || 0, seuil_alerte: parseInt(F.seuil.value, 10) || 3,
      prix_ttc_fcfa: prix, prix_ht_fcfa: Math.round(prix / 1.18),
      spec_fr: F.spec.value.trim() || null, desc_fr: F.desc.value.trim() || null,
      images: img ? [img] : [], actif: F.actif.checked, maj_le: new Date().toISOString()
    };
    F.err.hidden = true;
    var q = editing
      ? sb.from('products').update(rec).eq('id', editing.id)
      : sb.from('products').insert(rec);
    q.then(function (r) {
      if (r.error) {
        F.err.hidden = false; F.err.textContent = 'Enregistrement impossible : ' + r.error.message;
        return;
      }
      logAction(editing ? 'produit modifie' : 'produit cree', ref, { prix: prix });
      closeEditor();
      loadProducts();
    });
  });

  if (F.del) F.del.addEventListener('click', function () {
    if (!editing) return;
    if (!window.confirm('Supprimer ' + editing.nom_fr + ' du catalogue ?')) return;
    var delRef = editing.ref;
    sb.from('products').delete().eq('id', editing.id).then(function (r) {
      if (r.error) {
        F.err.hidden = false; F.err.textContent = 'Suppression impossible : ' + r.error.message;
        return;
      }
      logAction('produit supprime', delRef);
      closeEditor();
      loadProducts();
    });
  });

  /* ================= journal des actions ================= */
  var ME = { id: null, nom: null };
  sb.auth.getUser().then(function (r) {
    if (r.data && r.data.user) { ME.id = r.data.user.id; ME.nom = r.data.user.email; }
  });
  function logAction(action, cible, details) {
    if (!ME.id) return;
    sb.from('audit_log').insert({
      user_id: ME.id, user_nom: ME.nom, action: action, cible: cible || null, details: details || null
    }).then(function () {}, function () {});
  }

  /* ================= reglages ================= */
  var RG_ROLE = { admin: 'Administrateur', manager: 'Manager', support: 'Support' };
  var rgHint = document.getElementById('rgHint');
  var STAFF = [], ZONES = [], PARAMS = {};

  function loadReglages() {
    Promise.all([
      sb.from('staff').select('*').order('role'),
      sb.from('parametres').select('*'),
      sb.from('zones_livraison').select('*').order('rang'),
      sb.from('audit_log').select('*').order('quand', { ascending: false }).limit(40)
    ]).then(function (res) {
      var anyErr = res.some(function (r) { return r.error; });
      if (rgHint) rgHint.hidden = !anyErr;
      STAFF = (res[0].data) || [];
      PARAMS = {}; ((res[1].data) || []).forEach(function (p) { PARAMS[p.cle] = p.valeur; });
      ZONES = (res[2].data) || [];
      renderStaff();
      renderParams();
      renderZones();
      renderAudit((res[3].data) || []);
    });
  }

  function renderStaff() {
    var box = document.getElementById('staffList');
    box.innerHTML = STAFF.map(function (s) {
      return '<div class="rg-row"><div><strong>' + (s.nom || s.user_id.slice(0, 8)) + '</strong>' +
        '<span>' + s.user_id + '</span></div>' +
        '<select data-uid="' + s.user_id + '" class="rg-srole">' +
        Object.keys(RG_ROLE).map(function (r) { return '<option value="' + r + '"' + (r === s.role ? ' selected' : '') + '>' + RG_ROLE[r] + '</option>'; }).join('') +
        '</select><button type="button" class="rg-x" data-uid="' + s.user_id + '" aria-label="Retirer">Retirer</button></div>';
    }).join('') || '<p class="rg-lead">Personne pour l’instant.</p>';
    [].slice.call(box.querySelectorAll('.rg-srole')).forEach(function (sel) {
      sel.addEventListener('change', function () {
        sb.from('staff').update({ role: sel.value }).eq('user_id', sel.dataset.uid).then(function (r) {
          if (!r.error) { logAction('role modifie', sel.dataset.uid, { role: sel.value }); loadReglages(); }
        });
      });
    });
    [].slice.call(box.querySelectorAll('.rg-x')).forEach(function (b) {
      b.addEventListener('click', function () {
        if (!window.confirm('Retirer cette personne de l’equipe ?')) return;
        sb.from('staff').delete().eq('user_id', b.dataset.uid).then(function (r) {
          if (!r.error) { logAction('membre retire', b.dataset.uid); loadReglages(); }
        });
      });
    });
  }
  var staffForm = document.getElementById('staffForm');
  if (staffForm) staffForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var uid = document.getElementById('sfUid').value.trim();
    var err = document.getElementById('staffErr');
    if (!/^[0-9a-f-]{30,40}$/i.test(uid)) { err.hidden = false; err.textContent = 'Identifiant Supabase invalide.'; return; }
    err.hidden = true;
    sb.from('staff').insert({
      user_id: uid, nom: document.getElementById('sfNom').value.trim() || null, role: document.getElementById('sfRole').value
    }).then(function (r) {
      if (r.error) { err.hidden = false; err.textContent = r.error.message; return; }
      logAction('membre ajoute', uid, { role: document.getElementById('sfRole').value });
      staffForm.reset();
      loadReglages();
    });
  });

  function renderParams() {
    document.getElementById('pTva').value = PARAMS.tva != null ? (parseFloat(PARAMS.tva) * 100) : 18;
    document.getElementById('pEur').value = PARAMS.taux_eur_fcfa || 655.957;
    document.getElementById('pUsd').value = PARAMS.taux_usd_fcfa || 600;
  }
  var paramForm = document.getElementById('paramForm');
  if (paramForm) paramForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var err = document.getElementById('paramErr');
    var rows = [
      { cle: 'tva', valeur: String((parseFloat(document.getElementById('pTva').value) || 18) / 100) },
      { cle: 'taux_eur_fcfa', valeur: String(parseFloat(document.getElementById('pEur').value) || 655.957) },
      { cle: 'taux_usd_fcfa', valeur: String(parseFloat(document.getElementById('pUsd').value) || 600) }
    ];
    sb.from('parametres').upsert(rows.map(function (r) { r.maj_le = new Date().toISOString(); return r; })).then(function (r) {
      if (r.error) { err.hidden = false; err.textContent = r.error.message; return; }
      err.hidden = true;
      logAction('reglages modifies', 'tva et devises');
      paramForm.querySelector('button').textContent = 'Enregistré';
      setTimeout(function () { paramForm.querySelector('button').textContent = 'Enregistrer'; }, 1500);
    });
  });

  function renderZones() {
    var box = document.getElementById('zoneList');
    box.innerHTML = ZONES.map(function (z) {
      return '<div class="rg-row"><div><strong>' + z.nom + '</strong>' +
        '<span>' + (z.pays || '') + (z.delai ? ' · ' + z.delai : '') + '</span></div>' +
        '<input type="number" class="rg-ztarif" data-id="' + z.id + '" value="' + (z.tarif_fcfa || 0) + '" min="0"> FCFA' +
        '<button type="button" class="rg-x" data-id="' + z.id + '" aria-label="Retirer">Retirer</button></div>';
    }).join('') || '<p class="rg-lead">Aucune zone.</p>';
    [].slice.call(box.querySelectorAll('.rg-ztarif')).forEach(function (inp) {
      inp.addEventListener('change', function () {
        sb.from('zones_livraison').update({ tarif_fcfa: parseInt(inp.value, 10) || 0 }).eq('id', inp.dataset.id).then(function (r) {
          if (!r.error) logAction('tarif de livraison modifie', inp.dataset.id, { tarif: inp.value });
        });
      });
    });
    [].slice.call(box.querySelectorAll('.rg-x')).forEach(function (b) {
      b.addEventListener('click', function () {
        sb.from('zones_livraison').delete().eq('id', b.dataset.id).then(function (r) {
          if (!r.error) { logAction('zone supprimee', b.dataset.id); loadReglages(); }
        });
      });
    });
  }
  var zoneForm = document.getElementById('zoneForm');
  if (zoneForm) zoneForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var err = document.getElementById('zoneErr');
    sb.from('zones_livraison').insert({
      nom: document.getElementById('zfNom').value.trim(),
      pays: document.getElementById('zfPays').value.trim() || null,
      tarif_fcfa: parseInt(document.getElementById('zfTarif').value, 10) || 0,
      delai: document.getElementById('zfDelai').value.trim() || null,
      rang: ZONES.length + 1
    }).then(function (r) {
      if (r.error) { err.hidden = false; err.textContent = r.error.message; return; }
      err.hidden = true;
      logAction('zone ajoutee', document.getElementById('zfNom').value.trim());
      zoneForm.reset();
      loadReglages();
    });
  });

  function renderAudit(rows) {
    var box = document.getElementById('auditList');
    box.innerHTML = rows.map(function (a) {
      return '<div class="rg-logrow"><span>' + fmtDate(a.quand) + '</span>' +
        '<span>' + (a.user_nom || 'système') + '</span>' +
        '<span>' + a.action + (a.cible ? ' · ' + a.cible : '') + '</span></div>';
    }).join('') || '<p class="rg-lead">Rien encore.</p>';
  }

  /* ---- double authentification (TOTP) ---- */
  var mfaFactorId = null, mfaChallengeId = null;
  function refreshMfaState() {
    sb.auth.mfa.listFactors().then(function (r) {
      var el = document.getElementById('mfaState'); if (!el) return;
      var verified = r.data && r.data.totp && r.data.totp.filter(function (f) { return f.status === 'verified'; });
      if (verified && verified.length) {
        el.innerHTML = '<p class="rg-ok">Second facteur actif sur ce compte.</p>';
        document.getElementById('mfaStart').hidden = true;
      } else {
        el.innerHTML = '';
        document.getElementById('mfaStart').hidden = false;
      }
    }, function () {});
  }
  var mfaStart = document.getElementById('mfaStart');
  if (mfaStart) {
    refreshMfaState();
    mfaStart.addEventListener('click', function () {
      var err = document.getElementById('mfaErr'); err.hidden = true;
      sb.auth.mfa.enroll({ factorType: 'totp' }).then(function (r) {
        if (r.error) { err.hidden = false; err.textContent = r.error.message + ' (activez TOTP dans Supabase, Authentication)'; return; }
        mfaFactorId = r.data.id;
        document.getElementById('mfaQr').innerHTML = '<img alt="QR code" style="max-width:200px" src="' + r.data.totp.qr_code + '">';
        document.getElementById('mfaSecret').textContent = 'Clé : ' + r.data.totp.secret;
        document.getElementById('mfaEnroll').hidden = false;
        mfaStart.hidden = true;
      });
    });
  }
  var mfaVerify = document.getElementById('mfaVerify');
  if (mfaVerify) mfaVerify.addEventListener('click', function () {
    var err = document.getElementById('mfaErr'); err.hidden = true;
    var code = document.getElementById('mfaCode').value.trim();
    sb.auth.mfa.challenge({ factorId: mfaFactorId }).then(function (c) {
      if (c.error) { err.hidden = false; err.textContent = c.error.message; return; }
      mfaChallengeId = c.data.id;
      sb.auth.mfa.verify({ factorId: mfaFactorId, challengeId: mfaChallengeId, code: code }).then(function (v) {
        if (v.error) { err.hidden = false; err.textContent = 'Code refusé, réessayez.'; return; }
        document.getElementById('mfaEnroll').hidden = true;
        logAction('double authentification activee', ME.nom);
        refreshMfaState();
      });
    });
  });
  var mfaCancel = document.getElementById('mfaCancel');
  if (mfaCancel) mfaCancel.addEventListener('click', function () {
    if (mfaFactorId) sb.auth.mfa.unenroll({ factorId: mfaFactorId });
    document.getElementById('mfaEnroll').hidden = true;
    document.getElementById('mfaStart').hidden = false;
  });

  /* ================= clients ================= */
  var CLIENTS = [], csearch = '';
  var cliList = document.getElementById('clList');
  var cliEmpty = document.getElementById('clEmpty');
  var cliDetail = document.getElementById('cliDetail');
  var panelClients = document.getElementById('panelClients');

  function segment(nb, total) {
    if (nb >= 5 || total >= 2000000) return 'vip';
    if (nb >= 2) return 'regulier';
    return 'nouveau';
  }
  var SEG_LABEL = { vip: 'VIP', regulier: 'Régulier', nouveau: 'Nouveau' };

  function buildClients() {
    var by = {};
    ALL.forEach(function (o) {
      var k = (o.customer_mail || o.customer_tel || o.id).toLowerCase();
      if (!by[k]) by[k] = { key: k, name: o.customer_name, org: o.customer_org, tel: o.customer_tel,
        mail: o.customer_mail, city: o.customer_city, orders: [], total: 0, first: o.created_at, last: o.created_at };
      var c = by[k];
      c.orders.push(o);
      if (o.status !== 'annule') c.total += (o.total_fcfa || 0);
      if (o.created_at < c.first) c.first = o.created_at;
      if (o.created_at > c.last) { c.last = o.created_at; c.name = o.customer_name; c.org = o.customer_org; c.city = o.customer_city; c.tel = o.customer_tel; }
    });
    CLIENTS = Object.keys(by).map(function (k) {
      var c = by[k]; c.nb = c.orders.length; c.seg = segment(c.nb, c.total); return c;
    }).sort(function (a, b) { return b.total - a.total; });
    document.getElementById('clAll').textContent = CLIENTS.length;
    document.getElementById('clVip').textContent = CLIENTS.filter(function (c) { return c.seg === 'vip'; }).length;
    document.getElementById('clReg').textContent = CLIENTS.filter(function (c) { return c.seg === 'regulier'; }).length;
    document.getElementById('clNew').textContent = CLIENTS.filter(function (c) { return c.seg === 'nouveau'; }).length;
    renderClients();
  }
  function renderClients() {
    var rows = CLIENTS.filter(function (c) {
      if (!csearch) return true;
      return ((c.name || '') + ' ' + (c.org || '') + ' ' + (c.mail || '') + ' ' + (c.city || '')).toLowerCase().indexOf(csearch) > -1;
    });
    cliList.innerHTML = '';
    cliEmpty.hidden = rows.length > 0;
    rows.forEach(function (c) {
      var d = document.createElement('article');
      d.className = 'adm-cli';
      d.innerHTML =
        '<div class="adm-cli-main"><strong>' + (c.name || 'Client') + (c.org ? ' · ' + c.org : '') + '</strong>' +
          '<span class="adm-cli-meta">' + (c.city || '') + (c.mail ? ' · ' + c.mail : '') + '</span></div>' +
        '<span class="adm-cli-seg seg-' + c.seg + '">' + SEG_LABEL[c.seg] + '</span>' +
        '<div class="adm-cli-num"><b>' + fcfa(c.total) + '</b><span>' + c.nb + (c.nb > 1 ? ' commandes' : ' commande') + '</span></div>';
      d.addEventListener('click', function () { openCli(c); });
      cliList.appendChild(d);
    });
  }
  var clSearchBox = document.getElementById('clSearch');
  if (clSearchBox) clSearchBox.addEventListener('input', function () { csearch = clSearchBox.value.trim().toLowerCase(); renderClients(); });

  function openCli(c) {
    document.getElementById('cliName').textContent = (c.name || 'Client') + (c.org ? ' · ' + c.org : '');
    document.getElementById('cliMeta').innerHTML =
      [c.tel, c.mail, c.city].filter(Boolean).join(' · ') +
      '<br>' + SEG_LABEL[c.seg] + ' · ' + c.nb + (c.nb > 1 ? ' commandes' : ' commande') +
      ' · ' + fcfa(c.total) + ' au total · depuis le ' + fmtDate(c.first).split(' ·')[0];
    var box = document.getElementById('cliOrders');
    box.innerHTML = '';
    c.orders.slice().sort(function (a, b) { return b.created_at.localeCompare(a.created_at); }).forEach(function (o) {
      var el = document.createElement('div');
      el.className = 'cli-ord';
      el.innerHTML =
        '<div><strong>' + fmtDate(o.created_at) + '</strong>' +
        '<span class="cli-ord-items">' + (o.items || []).map(function (it) { return it.qty + ' × ' + it.name; }).join(', ') + '</span></div>' +
        '<div class="cli-ord-r"><span class="acct-badge st-' + o.status + '">' + (STATUS_LABEL[o.status] || o.status) + '</span>' +
        '<b>' + fcfa(o.total_fcfa) + '</b></div>';
      box.appendChild(el);
    });
    panelClients.hidden = true;
    cliDetail.hidden = false;
    cliDetail.scrollIntoView({ block: 'start' });
  }
  function closeCli() { if (cliDetail) cliDetail.hidden = true; if (panelClients) panelClients.hidden = false; }
  var cliBack = document.getElementById('cliBack');
  if (cliBack) cliBack.addEventListener('click', closeCli);

  var clExport = document.getElementById('clExport');
  if (clExport) clExport.addEventListener('click', function () {
    var head = ['Nom', 'Entreprise', 'E-mail', 'Telephone', 'Ville', 'Commandes', 'Total FCFA', 'Segment', 'Premiere commande', 'Derniere commande'];
    var lines = [head.join(';')];
    CLIENTS.forEach(function (c) {
      lines.push([
        c.name || '', c.org || '', c.mail || '', c.tel || '', c.city || '',
        c.nb, c.total, SEG_LABEL[c.seg],
        (c.first || '').slice(0, 10), (c.last || '').slice(0, 10)
      ].map(function (x) { return '"' + String(x).replace(/"/g, '""') + '"'; }).join(';'));
    });
    var blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'clients-roots-' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });

  /* ================= analyse ================= */
  var anLoaded = false, charts = {}, VISITS = [], CHATS = [];
  var anHint = document.getElementById('anHint');

  function themeColors() {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark'
      || (!document.documentElement.getAttribute('data-theme') && window.matchMedia
          && window.matchMedia('(prefers-color-scheme: dark)').matches);
    return {
      text: dark ? '#93a6bc' : '#58697e',
      grid: dark ? 'rgba(255,255,255,.08)' : 'rgba(10,30,60,.08)',
      cyan: '#22c3e6', navy: dark ? '#4fd1e8' : '#123a6b', teal: '#0f92b8'
    };
  }
  function dayKey(d) { return d.toISOString().slice(0, 10); }
  function lastDays(n) {
    var out = [], d = new Date();
    d.setHours(0, 0, 0, 0);
    for (var i = n - 1; i >= 0; i--) {
      var x = new Date(d); x.setDate(d.getDate() - i);
      out.push(dayKey(x));
    }
    return out;
  }
  function labelShort(k) { var p = k.split('-'); return p[2] + '/' + p[1]; }

  function loadAnalyse() {
    var since = new Date(Date.now() - 31 * 864e5).toISOString();
    Promise.all([
      sb.from('visites').select('quand').gte('quand', since),
      sb.from('chat_logs').select('quand').gte('quand', since)
    ]).then(function (res) {
      var vErr = res[0].error, cErr = res[1].error;
      if (vErr || cErr) {
        if (anHint) anHint.hidden = false;
        console.warn('ROOTS admin: analyse', (vErr || cErr).message);
      } else if (anHint) anHint.hidden = true;
      VISITS = (res[0].data) || [];
      CHATS = (res[1].data) || [];
      anLoaded = true;
      renderAnalyse();
    });
  }
  var anRefresh = document.getElementById('anRefresh');
  if (anRefresh) anRefresh.addEventListener('click', function () { loadOrders(); loadAnalyse(); });

  function mk(id, cfg2) {
    var el = document.getElementById(id);
    if (!el || !window.Chart) return;
    if (charts[id]) charts[id].destroy();
    charts[id] = new window.Chart(el.getContext('2d'), cfg2);
  }

  function renderAnalyse() {
    var C = themeColors();
    window.Chart && (window.Chart.defaults.color = C.text, window.Chart.defaults.font.family = 'Manrope, sans-serif');
    var d30 = lastDays(30), d14 = lastDays(14);

    // ventes par jour
    var vday = {};
    ALL.filter(function (o) { return o.status !== 'annule'; }).forEach(function (o) {
      var k = (o.created_at || '').slice(0, 10);
      vday[k] = (vday[k] || 0) + (o.total_fcfa || 0);
    });
    document.getElementById('anRev').textContent = fcfa(d30.reduce(function (s, k) { return s + (vday[k] || 0); }, 0));
    mk('chVentes', {
      type: 'bar',
      data: { labels: d30.map(labelShort), datasets: [{ data: d30.map(function (k) { return vday[k] || 0; }), backgroundColor: C.cyan, borderRadius: 4 }] },
      options: { plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: C.grid }, ticks: { callback: function (v) { return v >= 1000 ? Math.round(v / 1000) + 'k' : v; } } } } }
    });

    // visites et commandes 14j
    var vv = {}, oo = {};
    VISITS.forEach(function (v) { var k = (v.quand || '').slice(0, 10); vv[k] = (vv[k] || 0) + 1; });
    ALL.forEach(function (o) { var k = (o.created_at || '').slice(0, 10); oo[k] = (oo[k] || 0) + 1; });
    var totV = d30.reduce(function (s, k) { return s + (vv[k] || 0); }, 0);
    var totO = d30.reduce(function (s, k) { return s + (oo[k] || 0); }, 0);
    document.getElementById('anVisits').textContent = totV;
    document.getElementById('anConv').textContent = totV ? (Math.round(totO / totV * 1000) / 10) + ' %' : '—';
    document.getElementById('anChat').textContent = CHATS.filter(function (c) { return d30.indexOf((c.quand || '').slice(0, 10)) > -1; }).length;
    mk('chConv', {
      type: 'line',
      data: {
        labels: d14.map(labelShort),
        datasets: [
          { label: 'Visites', data: d14.map(function (k) { return vv[k] || 0; }), borderColor: C.navy, backgroundColor: 'transparent', tension: .3 },
          { label: 'Commandes', data: d14.map(function (k) { return oo[k] || 0; }), borderColor: C.cyan, backgroundColor: 'transparent', tension: .3 }
        ]
      },
      options: { plugins: { legend: { position: 'bottom' } }, scales: { x: { grid: { display: false } }, y: { grid: { color: C.grid }, ticks: { precision: 0 } } } }
    });

    // top produits
    var top = {};
    ALL.filter(function (o) { return o.status !== 'annule'; }).forEach(function (o) {
      (o.items || []).forEach(function (it) { top[it.name] = (top[it.name] || 0) + (it.qty || 0); });
    });
    var tl = Object.keys(top).map(function (k) { return [k, top[k]]; }).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 8);
    mk('chTop', {
      type: 'bar',
      data: { labels: tl.map(function (x) { return x[0]; }), datasets: [{ data: tl.map(function (x) { return x[1]; }), backgroundColor: C.teal, borderRadius: 4 }] },
      options: { indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { grid: { color: C.grid }, ticks: { precision: 0 } }, y: { grid: { display: false } } } }
    });

    // statuts
    var st = { nouveau: 0, confirme: 0, en_livraison: 0, livre: 0, annule: 0 };
    ALL.forEach(function (o) { if (st[o.status] != null) st[o.status]++; });
    mk('chStatut', {
      type: 'doughnut',
      data: {
        labels: ['Nouvelles', 'Confirmées', 'En livraison', 'Livrées', 'Annulées'],
        datasets: [{ data: [st.nouveau, st.confirme, st.en_livraison, st.livre, st.annule],
          backgroundColor: ['#22c3e6', '#0f92b8', '#f59e0b', '#15803d', '#9f1239'] }]
      },
      options: { plugins: { legend: { position: 'bottom' } }, cutout: '58%' }
    });
  }
})();
