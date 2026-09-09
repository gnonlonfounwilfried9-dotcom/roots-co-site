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
})();
