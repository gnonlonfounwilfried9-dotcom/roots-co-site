/* ROOTS - tiroir de menu (gauche), remplace les anciens menus deroulants */
(function () {
  var btn = document.getElementById('menuBtn');
  var drawer = document.getElementById('drawer');
  var veil = document.getElementById('drawerVeil');
  var closeBtn = document.getElementById('drawerClose');
  if (!btn || !drawer) return;

  function open() {
    drawer.classList.add('open');
    if (veil) veil.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    drawer.classList.remove('open');
    if (veil) veil.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  btn.addEventListener('click', function () {
    drawer.classList.contains('open') ? close() : open();
  });
  if (closeBtn) closeBtn.addEventListener('click', close);
  if (veil) veil.addEventListener('click', close);
  drawer.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', close);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
  });
})();
