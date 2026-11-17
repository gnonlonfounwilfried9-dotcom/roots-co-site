/* ROOTS : page Savoir faire (onglets des services, filtres, catalogue replie) */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  /* services : liste a gauche, detail a droite */
  var x = $('.sfx');
  if (x) {
    $$('.sfx-t', x).forEach(function (b) {
      b.addEventListener('click', function () {
        var i = b.getAttribute('data-i');
        $$('.sfx-t', x).forEach(function (o) { o.classList.toggle('on', o === b); });
        $$('.sfx-p', x).forEach(function (p) { p.classList.toggle('on', p.getAttribute('data-i') === i); });
      });
    });
  }

  /* filtres + catalogue replie */
  var LIMIT = { sfc: 9, sfpg: 99 };
  var state = { sfc: { f: '*', all: false }, sfpg: { f: '*', all: true } };
  function apply(id) {
    var box = document.getElementById(id); if (!box) return;
    var st = state[id], shown = 0, total = 0;
    $$('[data-c]', box).forEach(function (el) {
      var ok = st.f === '*' || el.getAttribute('data-c') === st.f;
      if (ok) total++;
      var vis = ok && (st.all || shown < LIMIT[id]);
      if (vis) shown++;
      el.style.display = vis ? '' : 'none';
    });
    var more = id === 'sfc' ? document.getElementById('sfMore') : null;
    if (more) {
      more.style.display = total > LIMIT[id] ? '' : 'none';
      more.textContent = st.all ? 'Replier le catalogue' : 'Voir tout le catalogue (' + total + ')';
    }
    var c = document.getElementById('sfCount');
    if (c && id === 'sfc') c.textContent = total + ' programme' + (total > 1 ? 's' : '');
  }
  $$('.sfchips').forEach(function (g) {
    var id = g.getAttribute('data-t');
    g.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      $$('button', g).forEach(function (o) { o.classList.toggle('on', o === b); });
      state[id].f = b.getAttribute('data-f');
      if (id === 'sfc') state[id].all = state[id].f !== '*';
      apply(id);
    });
  });
  var m = document.getElementById('sfMore');
  if (m) m.addEventListener('click', function () { state.sfc.all = !state.sfc.all; apply('sfc'); });
  apply('sfc'); apply('sfpg');
})();
