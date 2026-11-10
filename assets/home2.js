/* Accueil : constellation, boucle de produits autour du texte, décor vivant, vitrine des solutions en rotation continue */
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (window.rootsNet) window.rootsNet(document.getElementById('hmNet'), { max: 120, density: 13000, link: 140 });
  /* décor vivant sur toutes les sections de la page */
  if (window.rootsLive) document.querySelectorAll('.hm-dark:not(.hm-end),.hm-light').forEach(function (s) { window.rootsLive(s, s.classList.contains('hm-dark')); });
  document.querySelectorAll('.hm-dark').forEach(function (s) {
    if (s.querySelector(':scope > canvas')) return;
    var c = document.createElement('canvas'); c.className = 'ix-net sec-net'; s.insertBefore(c, s.firstChild);
    if (window.rootsNet) window.rootsNet(c, { max: 70, density: 16000, link: 130 });
  });
  var show = document.getElementById('hsShow'); if (!show) return;
  var tabs = show.querySelectorAll('.hs-tab'), panes = show.querySelectorAll('.hs-pane'), cur = 0, timer = null, DUR = 5500;
  show.style.setProperty('--dur', DUR + 'ms');
  function go(i) {
    cur = (i + tabs.length) % tabs.length;
    tabs.forEach(function (t, k) { t.classList.remove('on'); void t.offsetWidth; t.classList.toggle('on', k === cur); });
    panes.forEach(function (p, k) { p.classList.toggle('on', k === cur); });
  }
  function stop() { if (timer) clearInterval(timer); timer = null; }
  function start() { stop(); if (reduce) return; timer = setInterval(function () { go(cur + 1); }, DUR); }
  tabs.forEach(function (t, k) {
    t.addEventListener('click', function () { go(k); start(); });
    t.addEventListener('mouseenter', function () { go(k); stop(); show.classList.add('paused'); });
  });
  show.addEventListener('mouseleave', function () { show.classList.remove('paused'); start(); });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { if (en[0].isIntersecting) start(); else stop(); }, { threshold: .25 }).observe(show); else start();
})();
