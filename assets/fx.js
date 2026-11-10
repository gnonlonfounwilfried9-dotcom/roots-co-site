/* Effets partagés ROOTS : constellation animée (réseau de points qui se relient et réagissent à la souris) */
window.rootsNet = function (cv, o) {
  if (!cv) return;
  o = o || {};
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cx = cv.getContext('2d'), W = 0, H = 0, P = [], mx = -999, my = -999, vis = true, dpr = Math.min(2, window.devicePixelRatio || 1);
  function fit() {
    var r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.round(Math.min(o.max || 90, W * H / (o.density || 14000))); P = [];
    for (var i = 0; i < n; i++) P.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, r: Math.random() * 1.6 + .6 });
  }
  fit(); window.addEventListener('resize', fit);
  var host = cv.parentElement; if (host) { host.addEventListener('mousemove', function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; }); host.addEventListener('mouseleave', function () { mx = my = -999; }); }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { vis = en[0].isIntersecting; }).observe(cv);
  var link = o.link || 130, col = o.color || '143,233,255';
  (function loop() {
    requestAnimationFrame(loop); if (!vis) return;
    cx.clearRect(0, 0, W, H);
    for (var i = 0; i < P.length; i++) {
      var p = P[i];
      if (!reduce) { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1; }
      var dx = p.x - mx, dy = p.y - my, d = Math.sqrt(dx * dx + dy * dy);
      if (d < 120 && !reduce) { p.x += dx / d * 1.1; p.y += dy / d * 1.1; }
      cx.fillStyle = 'rgba(' + col + ',.75)'; cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 6.3); cx.fill();
      for (var j = i + 1; j < P.length; j++) {
        var q = P[j], ax = p.x - q.x, ay = p.y - q.y, dd = ax * ax + ay * ay;
        if (dd < link * link) { cx.strokeStyle = 'rgba(' + col + ',' + (.22 * (1 - Math.sqrt(dd) / link)) + ')'; cx.lineWidth = 1; cx.beginPath(); cx.moveTo(p.x, p.y); cx.lineTo(q.x, q.y); cx.stroke(); }
      }
    }
  })();
};
