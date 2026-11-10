/* Accueil ROOTS : préchargement, étoiles, globe en points, mots qui s'allument, halo des cartes */
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* 1. préchargement, une seule fois par session */
  var pre = document.getElementById('hmPre'), seen = false;
  try { seen = sessionStorage.getItem('hmSeen') === '1'; } catch (e) {}
  if (pre) {
    if (seen || reduce) { pre.className = 'hm-pre gone'; document.body.classList.add('hm-ready'); }
    else {
      setTimeout(function () { pre.classList.add('out'); }, 1900);
      setTimeout(function () { pre.className = 'hm-pre gone'; try { sessionStorage.setItem('hmSeen', '1'); } catch (e) {} }, 2900);
    }
  }
  /* 2. étoiles du hero */
  var sc = document.getElementById('hmStars');
  if (sc && !reduce) {
    var sx = sc.getContext('2d'), P = [], W = 0, H = 0;
    function fit() { W = sc.width = sc.offsetWidth; H = sc.height = sc.offsetHeight; P = []; for (var i = 0; i < Math.min(90, W / 14); i++) P.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.4 + .3, s: Math.random() * .25 + .05, p: Math.random() * 6 }); }
    fit(); window.addEventListener('resize', fit);
    (function loop(t) { sx.clearRect(0, 0, W, H); P.forEach(function (o) { o.y -= o.s; if (o.y < -4) { o.y = H + 4; o.x = Math.random() * W; } sx.globalAlpha = .35 + .35 * Math.sin(t / 900 + o.p); sx.fillStyle = '#8fe9ff'; sx.beginPath(); sx.arc(o.x, o.y, o.r, 0, 6.3); sx.fill(); }); requestAnimationFrame(loop); })(0);
  }
  /* 3. halo qui suit la souris sur les cartes */
  document.querySelectorAll('.hm-card').forEach(function (c) {
    c.addEventListener('mousemove', function (e) { var r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
  });
  /* 4. titre dont les mots s'allument au défilement */
  var wr = document.getElementById('hmWr');
  if (wr) {
    var words = wr.textContent.trim().split(/\s+/); wr.innerHTML = words.map(function (w) { return '<span>' + w + '</span>'; }).join(' ');
    var sp = wr.querySelectorAll('span');
    function upd() { var r = wr.getBoundingClientRect(), vh = innerHeight, p = (vh * .85 - r.top) / (vh * .55); p = Math.max(0, Math.min(1, p)); var n = Math.round(p * sp.length); sp.forEach(function (s, i) { s.classList.toggle('on', i < n || reduce); }); }
    addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
  }
  /* 5. globe en points */
  var gc = document.getElementById('hmGlobe');
  if (gc) {
    var POLY = [
      [[-17, 21], [-10, 30], [-6, 36], [10, 37], [11, 33], [20, 32], [32, 31], [34, 28], [38, 18], [43, 12], [51, 12], [46, 3], [40, -5], [40, -15], [35, -24], [32, -29], [27, -34], [19, -35], [15, -27], [12, -17], [13, -8], [9, -1], [9, 4], [5, 6], [-5, 5], [-8, 4], [-13, 8], [-17, 14]],
      [[-10, 36], [-9, 43], [-1, 46], [-4, 48], [2, 51], [8, 54], [10, 57], [5, 62], [15, 69], [28, 71], [32, 66], [40, 66], [40, 56], [30, 46], [28, 41], [24, 38], [15, 38], [8, 44], [3, 42], [-6, 37]],
      [[40, 66], [60, 70], [100, 77], [140, 72], [170, 68], [160, 55], [142, 46], [128, 35], [122, 30], [110, 20], [105, 10], [100, 2], [98, 14], [92, 22], [80, 15], [73, 20], [68, 24], [57, 25], [52, 16], [43, 13], [38, 28], [36, 35], [40, 41], [40, 56]],
      [[-168, 66], [-140, 70], [-95, 72], [-60, 60], [-55, 50], [-67, 45], [-76, 35], [-81, 25], [-97, 26], [-97, 17], [-87, 14], [-80, 8], [-90, 15], [-105, 22], [-117, 32], [-124, 40], [-125, 50], [-140, 60], [-160, 58]],
      [[-78, 9], [-62, 11], [-52, 5], [-35, -6], [-39, -18], [-48, -27], [-58, -38], [-65, -45], [-70, -54], [-75, -48], [-72, -30], [-70, -18], [-81, -6], [-80, 2]],
      [[114, -22], [130, -12], [142, -11], [153, -26], [147, -38], [135, -35], [116, -35]]];
    function inside(lon, lat) { for (var k = 0; k < POLY.length; k++) { var p = POLY[k], c = false; for (var i = 0, j = p.length - 1; i < p.length; j = i++) { if (((p[i][1] > lat) !== (p[j][1] > lat)) && (lon < (p[j][0] - p[i][0]) * (lat - p[i][1]) / (p[j][1] - p[i][1]) + p[i][0])) c = !c; } if (c) return true; } return false; }
    var dots = []; for (var la = -80; la <= 82; la += 2.6) { var st = 2.6 / Math.max(.25, Math.cos(la * Math.PI / 180)); for (var lo = -180; lo < 180; lo += st) if (inside(lo, la)) dots.push([lo, la]); }
    var PINS = [['Lomé', 1.22, 6.13, 1, 1], ['Cotonou', 2.43, 6.37, 1], ['France', 2.35, 48.85, 0], ['États-Unis', -77.0, 38.9, 0]];
    var cx = gc.getContext('2d'), S = 720, R = 300, rot = 20, tilt = 14 * Math.PI / 180, drag = false, lx = 0, vis = true;
    gc.addEventListener('mousedown', function (e) { drag = true; lx = e.clientX; }); addEventListener('mouseup', function () { drag = false; });
    addEventListener('mousemove', function (e) { if (drag) { rot += (e.clientX - lx) * .4; lx = e.clientX; } });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { vis = en[0].isIntersecting; }).observe(gc);
    function proj(lon, lat) { var l = (lon + rot) * Math.PI / 180, f = lat * Math.PI / 180, x = Math.cos(f) * Math.sin(l), y = Math.sin(f), z = Math.cos(f) * Math.cos(l); var y2 = y * Math.cos(tilt) - z * Math.sin(tilt), z2 = y * Math.sin(tilt) + z * Math.cos(tilt); return [S / 2 + x * R, S / 2 - y2 * R, z2]; }
    (function draw(t) {
      requestAnimationFrame(draw); if (!vis) return; if (!drag && !reduce) rot -= .22;
      cx.clearRect(0, 0, S, S);
      var g = cx.createRadialGradient(S / 2 - 70, S / 2 - 80, 40, S / 2, S / 2, R + 6); g.addColorStop(0, '#12365f'); g.addColorStop(1, '#06142a'); cx.fillStyle = g; cx.beginPath(); cx.arc(S / 2, S / 2, R, 0, 6.3); cx.fill();
      cx.strokeStyle = 'rgba(143,233,255,.35)'; cx.lineWidth = 2; cx.stroke();
      for (var i = 0; i < dots.length; i++) { var p = proj(dots[i][0], dots[i][1]); if (p[2] > 0) { cx.fillStyle = 'rgba(143,233,255,' + (.25 + .6 * p[2]) + ')'; cx.beginPath(); cx.arc(p[0], p[1], 1.2 + 1.5 * p[2], 0, 6.3); cx.fill(); } }
      var pts = PINS.map(function (q) { return proj(q[1], q[2]); });
      cx.lineWidth = 1.6; for (var a = 0; a < PINS.length; a++) for (var b = a + 1; b < PINS.length; b++) { if (!(PINS[a][3] || PINS[b][3])) continue; if (PINS[a][3] && PINS[b][3]) continue; var A = pts[a], B = pts[b]; if (A[2] > -.05 && B[2] > -.05) { var mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2 - 70; cx.strokeStyle = 'rgba(34,195,230,.6)'; cx.beginPath(); cx.moveTo(A[0], A[1]); cx.quadraticCurveTo(mx, my, B[0], B[1]); cx.stroke(); } }
      PINS.forEach(function (q, k) { var p = pts[k]; if (p[2] > 0) { var pu = (t / 900 + k) % 1; cx.strokeStyle = 'rgba(34,195,230,' + (1 - pu) + ')'; cx.lineWidth = 2; cx.beginPath(); cx.arc(p[0], p[1], 6 + pu * 26, 0, 6.3); cx.stroke(); cx.fillStyle = '#fff'; cx.shadowColor = '#22c3e6'; cx.shadowBlur = 16; cx.beginPath(); cx.arc(p[0], p[1], 5.5, 0, 6.3); cx.fill(); cx.shadowBlur = 0; cx.font = '600 22px Inter,sans-serif'; var w = cx.measureText(q[0]).width + 22, bx = q[4] ? p[0] - 14 - w : p[0] + 14, by = q[4] ? p[1] - 4 : p[1] - 34; cx.fillStyle = 'rgba(5,13,26,.82)'; cx.fillRect(bx, by, w, 30); cx.fillStyle = '#fff'; cx.fillText(q[0], bx + 11, by + 22); } });
    })(0);
  }
})();
