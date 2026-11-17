/* ROOTS : effets 4 (17/11/2026)
   - trois scenes de hero propres a une page : calques 3D (Savoir faire), apprentissage (Formations), energie solaire (Solaire)
   - apparitions variees (zoom en profondeur, bascule, montee), verre depoli, vague de clic, inclinaison 3D, zoom du hero au defilement */
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var path = location.pathname.split('/').pop() || 'index.html';

  /* ---------------- icones supplementaires + jeux d'icones thematiques pour le decor vivant */
  if (window.rootsIconAdd) {
    window.rootsIconAdd({
      sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8"/>',
      panel: '<path d="M3 8h18l-2 11H5z"/><path d="M9 8l-1 11M15 8l1 11M4 13.5h16"/>',
      battery: '<rect x="2" y="7" width="17" height="10" rx="2"/><path d="M22 10.5v3M6 10v4M10 10v4M14 10v4"/>',
      bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
      leaf: '<path d="M20 4C9 4 4 9 4 15a5 5 0 0 0 5 5c6 0 11-5 11-16z"/><path d="M4 20c3-5 6-8 10-10"/>',
      plug: '<path d="M9 2v6M15 2v6M6 8h12v3a6 6 0 0 1-12 0z"/><path d="M12 17v5"/>',
      cap: '<path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11.2V16c0 1.2 2.7 2.5 6 2.5s6-1.3 6-2.5v-4.8"/><path d="M22 9v6"/>',
      book: '<path d="M4 4h6a3 3 0 0 1 2 1 3 3 0 0 1 2-1h6v15h-6a3 3 0 0 0-2 1 3 3 0 0 0-2-1H4z"/><path d="M12 5v15"/>',
      laptop: '<rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M2 19h20"/>',
      award: '<circle cx="12" cy="9" r="6"/><path d="m9 14-2 7 5-3 5 3-2-7"/>',
      terminal: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3M12 15h5"/>',
      code: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',
      backup: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
      layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>'
    });
    var SETS = {
      'solaire.html': ['sun', 'panel', 'battery', 'bolt', 'leaf', 'plug'],
      'formations.html': ['cap', 'book', 'laptop', 'award', 'terminal', 'code'],
      'savoir-faire.html': ['layers', 'stack', 'shield', 'chart', 'code', 'gear']
    };
    if (SETS[path]) window.rootsIconSet = SETS[path];
  }

  function el(tag, cls, html) { var d = document.createElement(tag); if (cls) d.className = cls; if (html != null) d.innerHTML = html; return d; }
  function icon(n) { return window.rootsIcon ? window.rootsIcon(n) : ''; }

  /* ================================================================ SAVOIR FAIRE : calques 3D */
  window.rootsLayers = function (host) {
    host.classList.add('fx4-host'); host.innerHTML = '';
    var L = [['Données', 'backup'], ['Réseau', 'wifi'], ['Sécurité', 'shield'], ['Systèmes', 'stack'], ['Applications', 'chart']];
    var slabs = L.map(function (l, k) {
      return '<div class="ly-s" style="--k:' + k + '"><span class="ly-i">' + icon(l[1]) + '</span><b>' + l[0] + '</b></div>';
    }).join('');
    var pills = ['Archivage', 'Sauvegarde', 'Odoo', 'Wi-Fi', 'Formations', 'Cybersécurité', 'Serveurs'].map(function (t, k) {
      return '<span class="ly-p" style="--k:' + k + '">' + t + '</span>';
    }).join('');
    host.innerHTML = '<div class="ly-pills">' + pills + '</div><div class="ly-wrap"><div class="ly-st">' + slabs + '<i class="ly-beam"></i></div></div>';
  };

  /* ================================================================ FORMATIONS : terminal, escalier, toque */
  window.rootsLearn = function (host) {
    host.classList.add('fx4-host'); host.innerHTML = '';
    var steps = ['Découvrir', 'Pratiquer', 'Maîtriser', 'Certifier', 'Expert'];
    var st = steps.map(function (s, k) { return '<div class="ln-st" style="--k:' + k + '"><span>' + s + '</span></div>'; }).join('');
    var tiles = [['Windows Server', 'server'], ['Microsoft Office', 'doc'], ['Sophos', 'shield'], ['Odoo', 'chart'], ['Sécurité RSSI', 'shield'], ['Sauvegarde', 'stack']];
    var tl = tiles.map(function (t, k) { return '<span class="ln-t" style="--k:' + k + '">' + t[0] + '</span>'; }).join('');
    var cap = '<svg viewBox="0 0 48 40"><path d="M24 4 2 15l22 11 22-11z" fill="#22c3e6"/><path d="M10 20v10c0 3 6 6 14 6s14-3 14-6V20l-14 7z" fill="#0f92b8"/><path d="M44 16v12" stroke="#8fe9ff" stroke-width="2.4"/><circle cx="44" cy="30" r="2.6" fill="#8fe9ff"/></svg>';
    host.innerHTML =
      '<div class="ln-term"><div class="ln-th"><i></i><i></i><i></i><b>formation.sh</b></div><div class="ln-tb" id="lnTb"></div></div>' +
      '<div class="ln-tiles">' + tl + '</div>' +
      '<div class="ln-stairs">' + st + '<div class="ln-cap">' + cap + '</div><div class="ln-badge">' + icon('award') + '<b>Certifié</b></div></div>' +
      '<svg class="ln-ring" viewBox="0 0 80 80"><circle cx="40" cy="40" r="32" class="b"/><circle cx="40" cy="40" r="32" class="f"/></svg>';
    var script = [
      ['$ roots formation --theme "Windows Server"', 'c'], ['  Active Directory ... configuré', 'ok'], ['$ roots formation --theme "Sophos"', 'c'], ['  Pare feu ... actif', 'ok'],
      ['$ roots formation --theme "Odoo"', 'c'], ['  Modules RH et compta ... prêts', 'ok'], ['$ roots certificat --émettre', 'c'], ['  Certificat de formation délivré', 'ok']
    ];
    var tb = host.querySelector('#lnTb'); if (!tb) return;
    var line = 0, ch = 0, cur = null, vis = true;
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { vis = e[0].isIntersecting; }).observe(host);
    function next() {
      if (!vis) return setTimeout(next, 600);
      if (line >= script.length) { setTimeout(function () { tb.innerHTML = ''; line = 0; ch = 0; cur = null; next(); }, 2400); return; }
      if (!cur) { cur = el('div', 'tl ' + script[line][1]); tb.appendChild(cur); ch = 0; }
      var txt = script[line][0];
      if (reduce) { cur.textContent = txt; cur = null; line++; return setTimeout(next, 700); }
      cur.textContent = txt.slice(0, ++ch);
      if (ch >= txt.length) { cur = null; line++; return setTimeout(next, script[line - 1][1] === 'c' ? 420 : 900); }
      setTimeout(next, 34);
    }
    next();
  };

  /* ================================================================ SOLAIRE : soleil, panneaux, batteries, maison */
  window.rootsSolar = function (host) {
    host.classList.add('fx4-host'); host.innerHTML = '';
    var rays = '', i;
    for (i = 0; i < 16; i++) rays += '<line x1="0" y1="-84" x2="0" y2="' + (i % 2 ? -104 : -118) + '" transform="rotate(' + (i * 22.5) + ')"/>';
    function panel(x, y, d) {
      return '<g transform="translate(' + x + ',' + y + ')"><g class="sl-pn" style="--d:' + d + 's">' +
        '<line class="sl-leg" x1="62" y1="96" x2="62" y2="150"/><polygon class="sl-pb" points="0,52 128,0 156,78 24,132"/>' +
        '<polygon class="sl-pc" points="0,52 128,0 156,78 24,132" fill="url(#slCell)"/>' +
        '<polygon class="sl-sh" points="0,52 128,0 156,78 24,132" fill="url(#slShine)"/></g></g>';
    }
    function bat(x, y, k) {
      return '<g class="sl-bt" transform="translate(' + x + ',' + y + ')" style="--k:' + k + '"><rect class="sl-bo" x="0" y="0" width="62" height="96" rx="9"/><rect class="sl-bn" x="21" y="-9" width="20" height="9" rx="3"/>' +
        '<rect class="sl-bf" x="8" y="10" width="46" height="78" rx="5"/><path class="sl-bz" d="M33 28 22 54h10l-3 18 15-30H33z"/></g>';
    }
    var win = '';
    for (i = 0; i < 6; i++) win += '<rect class="sl-w" x="' + (1494 + (i % 2) * 28) + '" y="' + (402 + Math.floor(i / 2) * 26) + '" width="16" height="14" rx="2" style="--k:' + i + '"/>';
    host.innerHTML =
      '<svg class="sl-svg" viewBox="0 0 1600 560" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>' +
      '<radialGradient id="slSun" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff6b0"/><stop offset=".55" stop-color="#ffd54a"/><stop offset="1" stop-color="#ff9f1c"/></radialGradient>' +
      '<radialGradient id="slGlow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="rgba(255,213,74,.55)"/><stop offset="1" stop-color="rgba(255,213,74,0)"/></radialGradient>' +
      '<pattern id="slCell" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(-18)"><path d="M26 0H0V26" fill="none" stroke="rgba(143,233,255,.55)" stroke-width="1.4"/></pattern>' +
      '<linearGradient id="slShine" x1="0" y1="0" x2="1" y2="0" gradientTransform="rotate(20)"><stop offset="0" stop-color="rgba(255,255,255,0)"/><stop offset=".5" stop-color="rgba(255,255,255,.75)"/><stop offset="1" stop-color="rgba(255,255,255,0)"/></linearGradient>' +
      '<linearGradient id="slBeam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="rgba(255,213,74,.0)"/><stop offset=".3" stop-color="rgba(255,213,74,.55)"/><stop offset="1" stop-color="rgba(255,213,74,.0)"/></linearGradient>' +
      '<linearGradient id="slBat" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#22c3e6"/><stop offset="1" stop-color="#7ef0b1"/></linearGradient></defs>' +
      '<circle class="sl-glow" cx="250" cy="262" r="210" fill="url(#slGlow)"/>' +
      '<g class="sl-sun" transform="translate(250,262)"><g class="sl-rays">' + rays + '</g><circle class="sl-halo" r="92"/><circle r="64" fill="url(#slSun)"/></g>' +
      '<path class="sl-beam b1" d="M312 272C580 290 800 310 1040 318"/><path class="sl-beam b2" d="M322 240C620 220 860 262 1190 276"/><path class="sl-beam b3" d="M302 304C580 340 860 350 1340 346"/>' +
      '<g class="sl-cloud c1"><ellipse cx="0" cy="0" rx="84" ry="20"/><ellipse cx="-34" cy="-14" rx="40" ry="18"/><ellipse cx="22" cy="-20" rx="46" ry="20"/></g>' +
      '<g class="sl-cloud c2"><ellipse cx="0" cy="0" rx="64" ry="15"/><ellipse cx="-24" cy="-10" rx="30" ry="14"/><ellipse cx="18" cy="-14" rx="36" ry="15"/></g>' +
      '<line class="sl-ground" x1="0" y1="500" x2="1600" y2="500"/>' +
      panel(40, 372, 0) + panel(1010, 238, .6) + panel(1190, 238, 1.2) + panel(1370, 238, 1.8) +
      '<g class="sl-inv" transform="translate(980,438)"><rect x="0" y="0" width="64" height="50" rx="8"/><path d="M34 12 22 30h10l-3 12 14-20H33z"/><circle class="sl-led" cx="52" cy="8" r="3.4"/></g>' +
      bat(1100, 394, 0) + bat(1180, 394, 1) + bat(1260, 394, 2) +
      '<g class="sl-hs"><path d="M1470 400 1520 362 1570 400V490H1470z"/><path class="sl-rf" d="M1462 404 1520 356 1578 404"/>' + win + '</g>' +
      '<path id="slP1" class="sl-flow" d="M1110 306C1090 360 1050 400 1040 438"/><path id="slP2" class="sl-flow" d="M1044 466C1070 480 1090 470 1110 468"/>' +
      '<path id="slP3" class="sl-flow" d="M1330 470C1400 490 1440 480 1480 470"/>' +
      '<circle class="sl-dot" r="6"><animateMotion dur="3.2s" repeatCount="indefinite"><mpath href="#slP1"/></animateMotion></circle>' +
      '<circle class="sl-dot" r="6"><animateMotion dur="3.2s" begin="1.6s" repeatCount="indefinite"><mpath href="#slP1"/></animateMotion></circle>' +
      '<circle class="sl-dot" r="6"><animateMotion dur="2.4s" begin=".4s" repeatCount="indefinite"><mpath href="#slP2"/></animateMotion></circle>' +
      '<circle class="sl-dot" r="6"><animateMotion dur="3.4s" begin=".8s" repeatCount="indefinite"><mpath href="#slP3"/></animateMotion></circle>' +
      '<circle class="sl-dot" r="6"><animateMotion dur="3.4s" begin="2.5s" repeatCount="indefinite"><mpath href="#slP3"/></animateMotion></circle></svg>' +
      '<div class="sl-kwh"><b id="slK">0</b><span>kWh produits aujourd’hui</span></div>';
    var k = host.querySelector('#slK'), v = 0, vis = true;
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { vis = e[0].isIntersecting; }).observe(host);
    if (k && !reduce) setInterval(function () { if (!vis) return; v += 1 + Math.random() * 2.4; if (v > 480) v = 0; k.textContent = Math.round(v).toLocaleString('fr-FR'); }, 700);
    else if (k) k.textContent = '312';
  };


  /* ================================================================ MARQUES : radar et defilement de gammes */
  window.rootsBrand = function (host) {
    host.classList.add('fx4-host'); host.innerHTML = '';
    var m = /partenaire-([a-z]+)\.html/.exec(path), name = m ? m[1] : '';
    var tags = [].slice.call(document.querySelectorAll('.pnr-item h3')).map(function (h) { return h.textContent.trim(); }).filter(Boolean).slice(0, 6);
    if (!tags.length) tags = ['Conseil', 'Installation', 'Garantie', 'Support', 'Formation', 'Maintenance'];
    var pos = [[8, 24], [74, 6], [88, 46], [70, 84], [12, 78], [40, 92]];
    var pings = tags.map(function (t, k) { return '<span class="br-p" style="--x:' + pos[k][0] + '%;--y:' + pos[k][1] + '%;--dl:' + (k * 1.3) + 's">' + t + '</span>'; }).join('');
    var tick = tags.concat(tags).map(function (t, k) { return '<span class="br-t" style="--k:' + k + '">' + t + '</span>'; }).join('');
    host.innerHTML = '<div class="br-tick"><div class="br-tk">' + tick + '</div></div>' +
      '<div class="br-rd"><i style="--k:1"></i><i style="--k:2"></i><i style="--k:3"></i><b class="br-sw"></b><b class="br-pu"></b><b class="br-pu p2"></b>' +
      '<div class="br-lg"><img src="assets/partners/' + name + '.png" alt=""></div>' + pings + '</div>';
  };

  /* ================================================================ EFFETS GENERAUX */
  var root = document.documentElement;
  root.classList.add('fx4-on');

  /* apparitions variees : data-fx = zoom | flip | rise | depth | left | right */
  var AUTO = ['.card:not([data-reveal])', '.acard:not([data-reveal])', '.pnr-item', '.rfcard', '.stp:not([data-reveal])'];
  var VAR = ['zoom', 'rise', 'flip', 'depth', 'left', 'right'];
  var n = 0;
  AUTO.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (e, i) {
      if (e.hasAttribute('data-fx') || e.hasAttribute('data-reveal')) return;
      e.setAttribute('data-fx', VAR[(n++ + i) % VAR.length]);
      if (!e.style.getPropertyValue('--d')) e.style.setProperty('--d', ((i % 4) * .08).toFixed(2) + 's');
    });
  });
  var fxEls = [].slice.call(document.querySelectorAll('[data-fx]'));
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('fx-in'); io.unobserve(e.target); } });
    }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
    fxEls.forEach(function (e) { io.observe(e); });
  } else { fxEls.forEach(function (e) { e.classList.add('fx-in'); }); }

  /* vague de clic (ripple) */
  document.addEventListener('pointerdown', function (e) {
    var t = e.target.closest && e.target.closest('.btn,.sfx-t,.sfchips button,.anchors a,.sf-jump a,.ln-t,.sfpl,.hs-tab');
    if (!t || reduce) return;
    var r = t.getBoundingClientRect(), s = Math.max(r.width, r.height) * 2.2;
    var i = el('i', 'rip'); i.style.cssText = 'width:' + s + 'px;height:' + s + 'px;left:' + (e.clientX - r.left - s / 2) + 'px;top:' + (e.clientY - r.top - s / 2) + 'px';
    if (getComputedStyle(t).position === 'static') t.style.position = 'relative';
    t.classList.add('has-rip'); t.appendChild(i); setTimeout(function () { i.remove(); }, 700);
  }, { passive: true });

  /* inclinaison 3D avec reflet pour les tuiles en verre */
  if (matchMedia('(pointer:fine)').matches && !reduce) {
    document.addEventListener('pointermove', function (e) {
      var c = e.target.closest && e.target.closest('.sff,.sfc,.sfpl,.sfs,.sfx-vis');
      if (!c) return;
      var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      c.style.setProperty('--rx', ((.5 - y) * 9).toFixed(2) + 'deg'); c.style.setProperty('--ry', ((x - .5) * 11).toFixed(2) + 'deg');
      c.style.setProperty('--gx', (x * 100).toFixed(0) + '%'); c.style.setProperty('--gy', (y * 100).toFixed(0) + '%');
      c.classList.add('tilting');
    }, { passive: true });
    document.addEventListener('pointerout', function (e) {
      var c = e.target.closest && e.target.closest('.sff,.sfc,.sfpl,.sfs,.sfx-vis');
      if (c && !c.contains(e.relatedTarget)) { c.classList.remove('tilting'); c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); }
    }, { passive: true });
  }

  /* zoom en profondeur du hero au defilement */
  var hero = document.querySelector('.phero');
  if (hero && !reduce) {
    var tick = false;
    addEventListener('scroll', function () {
      if (tick) return; tick = true;
      requestAnimationFrame(function () {
        tick = false; var h = hero.offsetHeight || 1, p = Math.min(1, Math.max(0, scrollY / h));
        hero.style.setProperty('--p', p.toFixed(3));
      });
    }, { passive: true });
  }
})();
