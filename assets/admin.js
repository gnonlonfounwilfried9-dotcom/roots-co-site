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
    produits: document.getElementById('panelProduits')
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
    if (t === 'produits' && !prodLoaded) loadProducts();
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
      closeEditor();
      loadProducts();
    });
  });

  if (F.del) F.del.addEventListener('click', function () {
    if (!editing) return;
    if (!window.confirm('Supprimer ' + editing.nom_fr + ' du catalogue ?')) return;
    sb.from('products').delete().eq('id', editing.id).then(function (r) {
      if (r.error) {
        F.err.hidden = false; F.err.textContent = 'Suppression impossible : ' + r.error.message;
        return;
      }
      closeEditor();
      loadProducts();
    });
  });
})();
