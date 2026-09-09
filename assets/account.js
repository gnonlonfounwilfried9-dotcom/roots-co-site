/* ROOTS - espace client : connexion, creation de compte, historique des commandes */
(function () {
  var XOF = 655.957;
  var STATUS_LABEL = { nouveau: 'Nouvelle', confirme: 'Confirmée', en_livraison: 'En livraison', livre: 'Livrée', annule: 'Annulée' };

  var guestBox = document.getElementById('acctGuest');
  var dashBox = document.getElementById('acctDash');
  var errBox = document.getElementById('acctErr');
  var msgBox = document.getElementById('acctMsg');
  var configHint = document.getElementById('acctConfigHint');

  var cfg = window.ROOTS_SUPABASE;
  if (!cfg || !cfg.url || !cfg.anonKey || !window.supabase) {
    if (configHint) configHint.hidden = false;
    return;
  }
  var sb = window.supabase.createClient(cfg.url, cfg.anonKey);

  function fcfa(v) { return Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA'; }
  function eur(v) { return (Math.round(v * 100) / 100).toFixed(2).replace('.', ',') + ' €'; }
  function fmtDate(iso) {
    try {
      var d = new Date(iso);
      return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) { return iso; }
  }
  function clearMsg() { if (errBox) errBox.hidden = true; if (msgBox) msgBox.hidden = true; }
  function showErr(t) { clearMsg(); if (errBox) { errBox.hidden = false; errBox.textContent = t; } }
  function showMsg(t) { clearMsg(); if (msgBox) { msgBox.hidden = false; msgBox.textContent = t; } }

  /* ---------------- onglets connexion / inscription ---------------- */
  var tabs = document.querySelectorAll('.acct-tab');
  var loginForm = document.getElementById('acctLoginForm');
  var registerForm = document.getElementById('acctRegisterForm');
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      tabs.forEach(function (x) { x.classList.remove('on'); });
      t.classList.add('on');
      var isLogin = t.dataset.t === 'login';
      loginForm.hidden = !isLogin;
      registerForm.hidden = isLogin;
      clearMsg();
    });
  });

  /* ---------------- connexion / deconnexion ---------------- */
  function showDash(session) {
    guestBox.hidden = true;
    dashBox.hidden = false;
    var name = (session.user.user_metadata && session.user.user_metadata.full_name) || session.user.email;
    document.getElementById('acctName').textContent = ' ' + name.split(' ')[0];
    loadOrders(session.user.id);
  }
  function showGuest() { guestBox.hidden = false; dashBox.hidden = true; }

  sb.auth.getSession().then(function (r) {
    if (r.data && r.data.session) showDash(r.data.session); else showGuest();
  });

  if (loginForm) loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    clearMsg();
    var mail = document.getElementById('loginMail').value.trim();
    var pass = document.getElementById('loginPass').value;
    sb.auth.signInWithPassword({ email: mail, password: pass }).then(function (r) {
      if (r.error) { showErr('Connexion impossible : ' + r.error.message); return; }
      showDash(r.data.session);
    });
  });

  if (registerForm) registerForm.addEventListener('submit', function (e) {
    e.preventDefault();
    clearMsg();
    var name = document.getElementById('regName').value.trim();
    var mail = document.getElementById('regMail').value.trim();
    var tel = document.getElementById('regTel').value.trim();
    var pass = document.getElementById('regPass').value;
    sb.auth.signUp({ email: mail, password: pass, options: { data: { full_name: name, tel: tel } } }).then(function (r) {
      if (r.error) { showErr('Inscription impossible : ' + r.error.message); return; }
      if (r.data.session) { showDash(r.data.session); return; }
      showMsg('Compte créé. Vérifiez votre e-mail pour confirmer votre adresse, puis connectez-vous.');
    });
  });

  var logoutBtn = document.getElementById('acctLogout');
  if (logoutBtn) logoutBtn.addEventListener('click', function () { sb.auth.signOut().then(showGuest); });

  /* ---------------- historique des commandes (RLS : uniquement les siennes) ---------------- */
  var listBox = document.getElementById('acctList');
  var emptyBox = document.getElementById('acctEmpty');
  var tpl = document.getElementById('acctRowTpl');

  function loadOrders(uid) {
    sb.from('orders').select('*').eq('user_id', uid).order('created_at', { ascending: false }).then(function (r) {
      if (r.error) { console.warn('ROOTS compte: lecture impossible', r.error.message); return; }
      var rows = r.data || [];
      listBox.innerHTML = '';
      if (emptyBox) emptyBox.hidden = rows.length > 0;
      rows.forEach(function (o) {
        var node = tpl.content.cloneNode(true);
        node.querySelector('.adm-name').textContent = (o.items || []).map(function (it) { return it.qty + ' × ' + it.name; }).join(', ');
        node.querySelector('.adm-date').textContent = fmtDate(o.created_at);
        node.querySelector('.adm-amt').textContent = fcfa(o.total_fcfa) + ' · ' + eur(o.total_eur);
        var badge = node.querySelector('.acct-badge');
        badge.textContent = STATUS_LABEL[o.status] || o.status;
        badge.className = 'acct-badge st-' + o.status;

        var items = node.querySelector('.adm-items');
        (o.items || []).forEach(function (it) {
          var p = document.createElement('p');
          p.textContent = it.qty + ' × ' + it.name;
          items.appendChild(p);
        });
        var shipTxt = o.ship_method + (o.ship_address ? '<br>' + o.ship_address : '') + (o.ship_slot ? '<br>Créneau : ' + o.ship_slot : '');
        node.querySelector('.adm-ship').innerHTML = shipTxt;
        node.querySelector('.adm-pay').innerHTML = o.pay_method + (o.pay_detail ? '<br>' + o.pay_detail : '');

        var toggle = node.querySelector('.adm-toggle');
        var body = node.querySelector('.adm-row-body');
        toggle.addEventListener('click', function () {
          body.hidden = !body.hidden;
          toggle.classList.toggle('open', !body.hidden);
        });
        listBox.appendChild(node);
      });
    });
  }

  /* pour la boutique : expose l'utilisateur connecte, si il y en a un */
  window.ROOTS_GET_SESSION = function () { return sb.auth.getSession(); };
})();
