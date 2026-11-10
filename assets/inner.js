/* Pages intérieures ROOTS : constellation, orbite animée, halos, bandeau d'appel à l'action */
(function () {
  var I = {
    cpu: '<rect x="6.5" y="6.5" width="11" height="11" rx="1.6"/><rect x="9.3" y="9.3" width="5.4" height="5.4"/><path d="M9.5 3v2.3M14.5 3v2.3M9.5 18.7V21M14.5 18.7V21M3 9.5h2.3M3 14.5h2.3M18.7 9.5H21M18.7 14.5H21"/>',
    shield: '<path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z"/><path d="m9 12 2 2 4-4"/>',
    stack: '<rect x="4" y="4" width="16" height="5" rx="1.5"/><rect x="4" y="10" width="16" height="5" rx="1.5"/><rect x="4" y="16" width="16" height="4" rx="1.5"/>',
    wifi: '<path d="M2.5 9a15 15 0 0 1 19 0M5.5 12.5a10.5 10.5 0 0 1 13 0M8.6 16a6 6 0 0 1 6.8 0"/><circle cx="12" cy="19.2" r="1"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    printer: '<path d="M7 9V3h10v6"/><rect x="4" y="9" width="16" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
    truck: '<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/>'
  };
  function svg(n) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + I[n] + '</svg>'; }
  var path = location.pathname.split('/').pop() || 'index.html';
  var SETS = { 'import-export.html': ['truck', 'globe', 'stack', 'chart', 'shield', 'gear'], 'informatique.html': ['cpu', 'printer', 'stack', 'wifi', 'shield', 'gear'], 'partenaires.html': ['cpu', 'shield', 'wifi', 'stack', 'chart', 'gear'] };
  var set = SETS[path] || ['cpu', 'shield', 'stack', 'wifi', 'gear', 'chart'];
  var hero = document.querySelector('.phero');
  if (hero) {
    var net = document.createElement('canvas'); net.className = 'ix-net';
    var grid = document.createElement('div'); grid.className = 'ix-grid';
    var glow = document.createElement('div'); glow.className = 'ix-glow';
    var orb = document.createElement('div'); orb.className = 'ix-orbit';
    function sats(ring, idx, radius) { var h = ''; idx.forEach(function (n, k) { var a = k / idx.length * 6.2832 + .4, x = 50 + Math.cos(a) * 50, y = 50 + Math.sin(a) * 50; h += '<span class="sat" style="left:' + x + '%;top:' + y + '%">' + svg(n) + '</span>'; }); return h; }
    orb.innerHTML = '<div class="ring">' + sats(0, set.slice(0, 3)) + '</div><div class="ring r2">' + sats(0, set.slice(3, 5)) + '</div><div class="ring r3"><span class="sat" style="left:50%;top:0">' + svg(set[5]) + '</span></div><div class="core">R</div>';
    hero.insertBefore(orb, hero.firstChild); hero.insertBefore(glow, hero.firstChild); hero.insertBefore(grid, hero.firstChild); hero.insertBefore(net, hero.firstChild);
    if (window.rootsNet) window.rootsNet(net, { max: 70, density: 16000, link: 120 });
  }
  /* halos sur les cartes */
  document.querySelectorAll('.card,.pole,.pcard,.linkband,.pnr-card,.sc').forEach(function (c) {
    c.classList.add('ix-halo');
    c.addEventListener('mousemove', function (e) { var r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
  });
  /* bandeau d'appel à l'action avec marquee de partenaires, avant le pied de page */
  var foot = document.querySelector('footer');
  if (foot && !document.querySelector('.ix-cta')) {
    var P = ['dell', 'hp', 'microsoft', 'fortinet', 'sophos', 'synology', 'ubiquiti', 'huawei', 'hikvision', 'axis', 'acronis', 'apc', 'odoo', 'sap'];
    var logos = P.map(function (p) { return '<img src="assets/partners/' + p + '.png" alt="' + p + '" loading="lazy">'; }).join('');
    var sec = document.createElement('section'); sec.className = 'hm-dark hm-end ix-cta';
    sec.innerHTML = '<div class="wrap"><h2 data-en="Let\'s talk about your project">Parlons de votre projet</h2><p data-en="Tell us what you need, we answer with a quote within 48 hours.">Dites-nous ce dont vous avez besoin, nous répondons par un devis sous 48 heures.</p><div class="hm-cta"><a href="contact.html" class="btn btn-primary" data-en="Request a quote">Demander un devis</a><a href="https://wa.me/22999565252" class="btn btn-ghost" target="_blank" rel="noopener">WhatsApp</a></div></div><div class="hm-marq" style="margin-top:46px"><div class="hm-mt">' + logos + logos + '</div></div>';
    foot.parentNode.insertBefore(sec, foot);
  }
})();
