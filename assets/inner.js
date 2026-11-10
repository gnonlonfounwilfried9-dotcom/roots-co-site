/* Pages intérieures ROOTS : héros animé avec boucle, décor vivant sur toute la page, halos, bandeau final */
(function () {
  var path = location.pathname.split('/').pop() || 'index.html';
  var PARTNERS = ['dell', 'hp', 'microsoft', 'fortinet', 'sophos', 'synology', 'ubiquiti', 'huawei', 'hikvision', 'axis', 'acronis', 'apc', 'odoo', 'sap'];
  var SETS = {
    'informatique.html': [['cpu', 'Ordinateurs'], ['printer', 'Imprimantes'], ['stack', 'Serveurs'], ['wifi', 'Réseau'], ['shield', 'Cybersécurité'], ['gear', 'Infogérance'], ['eye', 'Vidéosurveillance'], ['chart', 'Gestion']],
    'import-export.html': [['box', 'Sourcing'], ['ship', 'Transport'], ['shield', 'Dédouanement'], ['truck', 'Livraison'], ['globe', 'International'], ['stack', 'Approvisionnement']],
    'blog.html': [['news', 'Actualités'], ['shield', 'Sécurité'], ['cpu', 'Matériel'], ['wifi', 'Réseaux'], ['chart', 'Bonnes pratiques'], ['gear', 'Guides']],
    'contact.html': [['pin', 'Lomé'], ['phone', 'Téléphone'], ['mail', 'Courriel'], ['pin', 'Cotonou'], ['globe', 'France'], ['phone', 'WhatsApp'], ['pin', 'États-Unis'], ['mail', 'Devis']],
    'a-propos.html': [['globe', 'Depuis 2002'], ['pin', 'Togo'], ['pin', 'Bénin'], ['pin', 'France'], ['pin', 'États-Unis'], ['gear', 'Équipes'], ['shield', 'Confiance'], ['chart', 'Croissance']]
  };
  var BG = { 'partenaires.html': 'assets/stock/network.jpg', 'references.html': 'assets/stock/handshake.jpg' };

  /* pages sans héros (partenaires, références) : on en crée un à partir de leur titre */
  var pg = document.querySelector('.pghero'), top = document.querySelector('.pnr-top');
  if (pg && top && !document.querySelector('.phero')) {
    var kick = (pg.querySelector('.kicker') || {}).textContent || '', h1 = pg.querySelector('h1'), lead = pg.querySelector('.slead');
    var hs = document.createElement('section'); hs.className = 'phero ix-conv';
    hs.innerHTML = '<div class="phero-bg"><img src="' + (BG[path] || 'assets/stock/network.jpg') + '" alt=""></div><div class="wrap"><div class="crumb"><a href="index.html">Accueil</a> <span>' + kick + '</span></div><span class="kicker">' + kick + '</span><h1>' + (h1 ? h1.innerHTML : '') + '</h1><p>' + (lead ? lead.innerHTML : '') + '</p></div>';
    top.parentNode.insertBefore(hs, top);
    if (pg.firstElementChild) pg.firstElementChild.style.display = 'none';
    pg.style.gridTemplateColumns = '1fr';
    document.body.classList.remove('nohero');
  }
  var hero = document.querySelector('.phero');
  if (hero) {
    var net = document.createElement('canvas'); net.className = 'ix-net';
    var grid = document.createElement('div'); grid.className = 'ix-grid';
    var glow = document.createElement('div'); glow.className = 'ix-glow';
    var loop = document.createElement('div'); loop.className = 'lp-host';
    hero.insertBefore(loop, hero.firstChild); hero.insertBefore(glow, hero.firstChild); hero.insertBefore(grid, hero.firstChild); hero.insertBefore(net, hero.firstChild);
    if (window.rootsNet) window.rootsNet(net, { max: 80, density: 15000, link: 130 });
    var KIND = { 'import-export.html': 'cargo', 'blog.html': 'news', 'contact.html': 'chat', 'a-propos.html': 'globe', 'references.html': 'logos' }[path] || 'loop';
    if (KIND === 'cargo' && window.rootsCargo) window.rootsCargo(loop);
    else if (KIND === 'chat' && window.rootsChat) window.rootsChat(loop);
    else if (KIND === 'news' && window.rootsNewsWall) window.rootsNewsWall(loop);
    else if (KIND === 'radar' && window.rootsRadar) window.rootsRadar(loop);
    else if (KIND === 'globe' && window.rootsGlobe) window.rootsGlobe(loop);
    else if (KIND === 'logos' && window.rootsLogoRows) {
      var li = Array.prototype.slice.call(document.querySelectorAll('.rwtile img')).map(function (im) { return im.getAttribute('src'); }).slice(0, 12);
      if (li.length < 6) li = li.concat(PARTNERS.map(function (x) { return 'assets/partners/' + x + '.png'; }));
      window.rootsLogoRows(loop, li);
    } else {
      var items;
      if (path === 'partenaires.html') items = PARTNERS.slice(0, 10).map(function (p) { return { img: 'assets/partners/' + p + '.png', label: p }; });
      else items = (SETS[path] || SETS['informatique.html']).map(function (x) { return { icon: x[0], label: x[1] }; });
      if (items.length && window.rootsLoop) window.rootsLoop(loop, items, { rx: .47, ry: .43, speed: .00006 });
    }
  }
  /* décor vivant sur toute la page : toutes les sections */
  if (window.rootsLive) document.querySelectorAll('.sec').forEach(function (s) { window.rootsLive(s, s.classList.contains('dark')); });
  /* halos sur les cartes */
  document.querySelectorAll('.card,.pole,.pcard,.linkband,.pnr-card,.sc,.rwtile').forEach(function (c) {
    c.classList.add('ix-halo');
    c.addEventListener('mousemove', function (e) { var r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
  });
  /* bandeau d'appel à l'action avec défilement continu des partenaires */
  var foot = document.querySelector('footer');
  if (foot && !document.querySelector('.ix-cta')) {
    var logos = PARTNERS.map(function (p) { return '<img src="assets/partners/' + p + '.png" alt="' + p + '" loading="lazy">'; }).join('');
    var sec = document.createElement('section'); sec.className = 'hm-dark hm-end ix-cta';
    sec.innerHTML = '<div class="wrap"><h2 data-en="Let\'s talk about your project">Parlons de votre projet</h2><p data-en="Tell us what you need, we answer with a quote within 48 hours.">Dites-nous ce dont vous avez besoin, nous répondons par un devis sous 48 heures.</p><div class="hm-cta"><a href="contact.html" class="btn btn-primary" data-en="Request a quote">Demander un devis</a><a href="https://wa.me/22999565252" class="btn btn-ghost" target="_blank" rel="noopener">WhatsApp</a></div></div><div class="hm-marq" style="margin-top:46px;position:relative;z-index:1"><div class="hm-mt">' + logos + logos + '</div></div>';
    foot.parentNode.insertBefore(sec, foot);
    var cn = document.createElement('canvas'); cn.className = 'ix-net sec-net'; sec.insertBefore(cn, sec.firstChild);
    if (window.rootsNet) window.rootsNet(cn, { max: 60, density: 16000, link: 130 });
    if (window.rootsLive) window.rootsLive(sec, true);
  }
})();
