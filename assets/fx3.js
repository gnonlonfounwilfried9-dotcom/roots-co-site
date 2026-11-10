/* Schémas animés propres à chaque page : routes, mur d'actualités, radar, globe, rangées de logos */
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function mk(host, cls) { host.classList.add('sx-host'); host.innerHTML = ''; var d = document.createElement('div'); d.className = cls; host.appendChild(d); return d; }

  /* Import-export : des routes courbes entre les pays, des marchandises qui voyagent */
  window.rootsRoutes = function (host) {
    var ns = 'http://www.w3.org/2000/svg';
    host.classList.add('sx-host'); host.innerHTML = '';
    var P = [
      { id: 'r1', d: 'M70,330 Q480,-90 910,300', c: '#8fe9ff', dur: 9 },
      { id: 'r2', d: 'M150,70 Q520,540 900,320', c: '#7aa7ff', dur: 11 },
      { id: 'r3', d: 'M70,330 Q480,520 860,340', c: '#22c3e6', dur: 13 }
    ];
    var h = '<svg viewBox="0 0 1000 400" preserveAspectRatio="xMidYMid slice" class="sx-svg">';
    P.forEach(function (p) { h += '<path id="' + p.id + '" d="' + p.d + '" fill="none" stroke="rgba(143,233,255,.22)" stroke-width="1.4" stroke-dasharray="3 7"/>'; });
    P.forEach(function (p, k) {
      for (var j = 0; j < 2; j++) {
        h += '<g><circle r="7" fill="' + p.c + '" opacity=".95"><animateMotion dur="' + p.dur + 's" begin="' + (-j * p.dur / 2) + 's" repeatCount="indefinite"><mpath href="#' + p.id + '"/></animateMotion></circle>' +
          '<circle r="16" fill="' + p.c + '" opacity=".2"><animateMotion dur="' + p.dur + 's" begin="' + (-j * p.dur / 2) + 's" repeatCount="indefinite"><mpath href="#' + p.id + '"/></animateMotion></circle></g>';
      }
    });
    var pts = [[70, 330, 'États-Unis'], [150, 70, 'France'], [910, 300, 'Cotonou'], [860, 340, 'Lomé']];
    pts.forEach(function (q) { h += '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="6" fill="#fff"/><circle cx="' + q[0] + '" cy="' + q[1] + '" r="6" fill="none" stroke="#22c3e6" stroke-width="2"><animate attributeName="r" values="6;28" dur="2.6s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0" dur="2.6s" repeatCount="indefinite"/></circle><text x="' + (q[0] + 14) + '" y="' + (q[1] - 12) + '" fill="#e6f0fa" font-size="15" font-weight="600" font-family="Inter,sans-serif">' + q[2] + '</text>'; });
    host.innerHTML = h + '</svg>';
  };

  /* Actualités : un mur de cartes d'articles qui défilent sans fin, de part et d'autre du texte */
  window.rootsNewsWall = function (host) {
    host.classList.add('sx-host'); host.innerHTML = '';
    var tags = [['Sécurité', 'shield'], ['Matériel', 'cpu'], ['Réseaux', 'wifi'], ['Bonnes pratiques', 'chart'], ['Guides', 'news'], ['Infogérance', 'gear'], ['Serveurs', 'stack'], ['Imprimantes', 'printer']];
    function col(side, off) {
      var cards = '';
      for (var r = 0; r < 2; r++) tags.forEach(function (t, i) { var tt = tags[(i + off) % tags.length]; cards += '<div class="nw-c"><span class="nw-i">' + window.rootsIcon(tt[1]) + '</span><b>' + tt[0] + '</b><i></i><i class="s"></i></div>'; });
      return '<div class="nw-col ' + side + '"><div class="nw-t">' + cards + '</div></div>';
    }
    host.innerHTML = col('l', 0) + col('r', 4) + col('l2', 2) + col('r2', 6);
  };

  /* Contact : un radar qui pulse, des villes, des messages qui montent */
  window.rootsRadar = function (host) {
    host.classList.add('sx-host'); host.innerHTML = '';
    var h = '<div class="rd-wrap"><i></i><i></i><i></i><i></i></div>';
    [['Lomé', 22, 66], ['Cotonou', 74, 70], ['France', 20, 24], ['États-Unis', 78, 22]].forEach(function (c) { h += '<div class="rd-pin" style="left:' + c[1] + '%;top:' + c[2] + '%"><b></b><span>' + c[0] + '</span></div>'; });
    ['Devis', 'WhatsApp', 'Courriel', 'Téléphone', 'Visite', 'Conseil'].forEach(function (m, k) { h += '<div class="rd-msg" style="left:' + (8 + k * 15) + '%;animation-delay:' + (-k * 2.3) + 's;animation-duration:' + (11 + k % 3 * 2) + 's">' + m + '</div>'; });
    host.innerHTML = h;
  };

  /* À propos : un globe en points qui tourne derrière le texte */
  window.rootsGlobe = function (host) {
    host.classList.add('sx-host'); host.innerHTML = '<canvas class="gl-c"></canvas>';
    var c = host.firstChild, cx = c.getContext('2d');
    var POLY = [
      [[-17, 21], [-10, 30], [-6, 36], [10, 37], [11, 33], [20, 32], [32, 31], [34, 28], [38, 18], [43, 12], [51, 12], [46, 3], [40, -5], [40, -15], [35, -24], [32, -29], [27, -34], [19, -35], [15, -27], [12, -17], [13, -8], [9, -1], [9, 4], [5, 6], [-5, 5], [-8, 4], [-13, 8], [-17, 14]],
      [[-10, 36], [-9, 43], [-1, 46], [-4, 48], [2, 51], [8, 54], [10, 57], [5, 62], [15, 69], [28, 71], [32, 66], [40, 66], [40, 56], [30, 46], [28, 41], [24, 38], [15, 38], [8, 44], [3, 42], [-6, 37]],
      [[40, 66], [60, 70], [100, 77], [140, 72], [170, 68], [160, 55], [142, 46], [128, 35], [122, 30], [110, 20], [105, 10], [100, 2], [98, 14], [92, 22], [80, 15], [73, 20], [68, 24], [57, 25], [52, 16], [43, 13], [38, 28], [36, 35], [40, 41], [40, 56]],
      [[-168, 66], [-140, 70], [-95, 72], [-60, 60], [-55, 50], [-67, 45], [-76, 35], [-81, 25], [-97, 26], [-97, 17], [-87, 14], [-80, 8], [-90, 15], [-105, 22], [-117, 32], [-124, 40], [-125, 50], [-140, 60], [-160, 58]],
      [[-78, 9], [-62, 11], [-52, 5], [-35, -6], [-39, -18], [-48, -27], [-58, -38], [-65, -45], [-70, -54], [-75, -48], [-72, -30], [-70, -18], [-81, -6], [-80, 2]],
      [[114, -22], [130, -12], [142, -11], [153, -26], [147, -38], [135, -35], [116, -35]]];
    function inside(lon, lat) { for (var k = 0; k < POLY.length; k++) { var p = POLY[k], t = false; for (var i = 0, j = p.length - 1; i < p.length; j = i++) { if (((p[i][1] > lat) !== (p[j][1] > lat)) && (lon < (p[j][0] - p[i][0]) * (lat - p[i][1]) / (p[j][1] - p[i][1]) + p[i][0])) t = !t; } if (t) return true; } return false; }
    var dots = []; for (var la = -80; la <= 82; la += 2.8) { var st = 2.8 / Math.max(.25, Math.cos(la * Math.PI / 180)); for (var lo = -180; lo < 180; lo += st) if (inside(lo, la)) dots.push([lo, la]); }
    var PINS = [['Lomé', 1.22, 6.13], ['Cotonou', 2.43, 6.37], ['France', 2.35, 48.85], ['États-Unis', -77, 38.9]], rot = 20, tilt = 14 * Math.PI / 180, vis = true, S = 900, R = 400;
    c.width = S; c.height = S;
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { vis = en[0].isIntersecting; }).observe(host);
    function proj(lon, lat) { var l = (lon + rot) * Math.PI / 180, f = lat * Math.PI / 180, x = Math.cos(f) * Math.sin(l), y = Math.sin(f), z = Math.cos(f) * Math.cos(l); var y2 = y * Math.cos(tilt) - z * Math.sin(tilt), z2 = y * Math.sin(tilt) + z * Math.cos(tilt); return [S / 2 + x * R, S / 2 - y2 * R, z2]; }
    (function draw(t) {
      requestAnimationFrame(draw); if (!vis) return; if (!reduce) rot -= .18;
      cx.clearRect(0, 0, S, S);
      var g = cx.createRadialGradient(S / 2 - 90, S / 2 - 100, 40, S / 2, S / 2, R + 6); g.addColorStop(0, 'rgba(18,54,95,.85)'); g.addColorStop(1, 'rgba(6,20,42,.7)'); cx.fillStyle = g; cx.beginPath(); cx.arc(S / 2, S / 2, R, 0, 6.3); cx.fill();
      cx.strokeStyle = 'rgba(143,233,255,.4)'; cx.lineWidth = 2; cx.stroke();
      for (var i = 0; i < dots.length; i++) { var p = proj(dots[i][0], dots[i][1]); if (p[2] > 0) { cx.fillStyle = 'rgba(143,233,255,' + (.25 + .6 * p[2]) + ')'; cx.beginPath(); cx.arc(p[0], p[1], 1.4 + 1.6 * p[2], 0, 6.3); cx.fill(); } }
      PINS.forEach(function (q, k) { var p = proj(q[1], q[2]); if (p[2] > 0) { var pu = (t / 900 + k) % 1; cx.strokeStyle = 'rgba(34,195,230,' + (1 - pu) + ')'; cx.lineWidth = 2; cx.beginPath(); cx.arc(p[0], p[1], 6 + pu * 30, 0, 6.3); cx.stroke(); cx.fillStyle = '#fff'; cx.shadowColor = '#22c3e6'; cx.shadowBlur = 16; cx.beginPath(); cx.arc(p[0], p[1], 6, 0, 6.3); cx.fill(); cx.shadowBlur = 0; cx.font = '600 24px Inter,sans-serif'; cx.fillStyle = '#fff'; cx.fillText(q[0], p[0] + 14, p[1] - 12); } });
    })(0);
  };

  /* Références : des rangées de logos qui défilent en sens inverse, au dessus et au dessous du texte */
  window.rootsLogoRows = function (host, imgs) {
    host.classList.add('sx-host'); host.innerHTML = '';
    function row(cls, list) { var h = ''; for (var r = 0; r < 2; r++) list.forEach(function (s) { h += '<span class="lr-t"><img src="' + s + '" alt=""></span>'; }); return '<div class="lr-row ' + cls + '"><div class="lr-tr">' + h + '</div></div>'; }
    host.innerHTML = row('a', imgs) + row('b', imgs.slice().reverse());
  };
})();
