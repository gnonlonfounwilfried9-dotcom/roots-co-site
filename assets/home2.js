/* Accueil : constellation, mise à l'échelle du réseau, vitrine des solutions en rotation continue */
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (window.rootsNet) window.rootsNet(document.getElementById('hmNet'), { max: 110, density: 14000, link: 140 });
  var map = document.getElementById('hmMap');
  function scale() {
    if (!map) return;
    var host = map.parentElement.clientWidth, s = Math.max(1, Math.min(1.45, (host * .92) / 1040));
    if (innerWidth < 761) s = 1;
    map.style.setProperty('--s', s.toFixed(3));
  }
  scale(); addEventListener('resize', scale);
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
