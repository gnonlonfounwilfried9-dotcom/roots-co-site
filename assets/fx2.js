/* Effets continus ROOTS : boucle de produits autour du texte, décor vivant des sections */
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var P = {
    cpu: '<rect x="6.5" y="6.5" width="11" height="11" rx="1.6"/><rect x="9.3" y="9.3" width="5.4" height="5.4"/><path d="M9.5 3v2.3M14.5 3v2.3M9.5 18.7V21M14.5 18.7V21M3 9.5h2.3M3 14.5h2.3M18.7 9.5H21M18.7 14.5H21"/>',
    printer: '<path d="M7 9V3h10v6"/><rect x="4" y="9" width="16" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
    stack: '<rect x="4" y="4" width="16" height="5" rx="1.5"/><rect x="4" y="10" width="16" height="5" rx="1.5"/><rect x="4" y="16" width="16" height="4" rx="1.5"/>',
    wifi: '<path d="M2.5 9a15 15 0 0 1 19 0M5.5 12.5a10.5 10.5 0 0 1 13 0M8.6 16a6 6 0 0 1 6.8 0"/><circle cx="12" cy="19.2" r="1"/>',
    shield: '<path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z"/><path d="m9 12 2 2 4-4"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    truck: '<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/>',
    box: '<path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
    ship: '<path d="M3 17l2 3h14l2-3zM6 17V10h12v7M12 10V4h4"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    pin: '<path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    news: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>'
  };
  function svg(n) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + P[n] + '</svg>'; }
  window.rootsIcon = svg; window.rootsIcons = Object.keys(P);

  /* Boucle : des éléments tournent sans fin autour du contenu, qui reste au centre */
  window.rootsLoop = function (host, items, o) {
    if (!host) return; o = o || {};
    host.classList.add('lp-host'); host.innerHTML = '';
    var nodes = items.map(function (it) {
      var d = document.createElement('div'); d.className = 'lp-n' + (it.logo ? ' lp-logo' : '') + (it.img ? ' lp-img' : '');
      d.innerHTML = it.img ? '<span><img src="' + it.img + '" alt="' + (it.label || '') + '"></span>' : (it.logo ? '<img src="assets/img/roots-white.png" alt="ROOTS">' : '<span>' + svg(it.icon) + '</span><b>' + it.label + '</b>');
      host.appendChild(d); return d;
    });
    var W = 0, H = 0, n = nodes.length, speed = o.speed || .000075, t0 = performance.now(), vis = true;
    function fit() { var r = host.getBoundingClientRect(); W = r.width; H = r.height; }
    fit(); addEventListener('resize', fit);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { vis = en[0].isIntersecting; }).observe(host);
    (function frame(t) {
      requestAnimationFrame(frame); if (!vis) return;
      var ph = reduce ? 0 : (t - t0) * speed * 6.2832, rx = W * (o.rx || .44), ry = H * (o.ry || .4), cx = W / 2, cy = H * (o.cy || .5), small = W < 760;
      for (var i = 0; i < n; i++) {
        var a = ph + i / n * 6.2832, s = Math.sin(a), c = Math.cos(a), d = (s + 1) / 2;
        var x = cx + c * rx * (small ? .95 : 1), y = cy + s * ry * (small ? .9 : 1) * (small ? 1 : .92);
        var sc = (small ? .62 : .72) + .4 * d;
        nodes[i].style.transform = 'translate(' + (x - 40) + 'px,' + (y - 40) + 'px) scale(' + sc.toFixed(3) + ')';
        nodes[i].style.opacity = (.42 + .58 * d).toFixed(2);
        nodes[i].style.zIndex = d > .5 ? 2 : 1;
        nodes[i].style.filter = d < .45 ? 'blur(' + ((.45 - d) * 3).toFixed(1) + 'px)' : 'none';
      }
    })(t0);
  };

  /* Décor vivant d'une section : halos qui dérivent et icônes qui flottent, en continu */
  window.rootsLive = function (sec, dark) {
    if (!sec || sec.querySelector(':scope > .lv')) return;
    var lv = document.createElement('div'); lv.className = 'lv ' + (dark ? 'lv-d' : 'lv-l');
    var h = '<i class="lv-b b1"></i><i class="lv-b b2"></i><i class="lv-b b3"></i>';
    var names = window.rootsIcons, k;
    for (k = 0; k < 9; k++) {
      var nm = names[(k * 3 + (sec.offsetTop % 7)) % names.length], left = (6 + k * 11 + (k % 2) * 4) % 96, dur = 26 + (k * 7) % 22, del = -((k * 5) % 24), size = 34 + (k * 9) % 30;
      h += '<span class="lv-i" style="left:' + left + '%;width:' + size + 'px;height:' + size + 'px;animation-duration:' + dur + 's;animation-delay:' + del + 's">' + svg(nm) + '</span>';
    }
    lv.innerHTML = h; sec.insertBefore(lv, sec.firstChild);
    sec.classList.add('lv-host');
  };
})();
