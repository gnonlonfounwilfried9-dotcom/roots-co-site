/* ROOTS - menus deroulants du bandeau */
(function () {
  var drops = document.querySelectorAll('.nd');
  function closeAll(except) {
    for (var i = 0; i < drops.length; i++) {
      if (drops[i] !== except) {
        drops[i].classList.remove('open');
        var b = drops[i].querySelector('.nd-t');
        if (b) b.setAttribute('aria-expanded', 'false');
      }
    }
  }
  for (var i = 0; i < drops.length; i++) {
    (function (d) {
      var btn = d.querySelector('.nd-t');
      if (!btn) return;
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var open = d.classList.contains('open');
        closeAll(d);
        d.classList.toggle('open', !open);
        btn.setAttribute('aria-expanded', String(!open));
      });
    })(drops[i]);
  }
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nd')) closeAll(null);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAll(null);
  });
})();
