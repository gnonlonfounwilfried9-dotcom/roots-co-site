/* ROOTS : page Savoir faire (services animes, filtres, catalogue replie) */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  /* services : liste a gauche (pastille qui glisse), detail a droite (zoom en profondeur) */
  var x = $('.sfx');
  if (x) {
    var hl = $('.sfx-hl', x);
    var place = function (b) {
      if (!hl || !b) return;
      hl.style.height = b.offsetHeight + 'px';
      hl.style.transform = 'translateY(' + b.offsetTop + 'px)';
    };
    var cur = function () { return $('.sfx-t.on', x); };
    place(cur());
    addEventListener('resize', function () { place(cur()); });
    setTimeout(function () { place(cur()); }, 400);
    $$('.sfx-t', x).forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.classList.contains('on')) return;
        var i = b.getAttribute('data-i');
        var old = $('.sfx-p.on', x);
        var nw = $('.sfx-p[data-i="' + i + '"]', x);
        $$('.sfx-t', x).forEach(function (o) { o.classList.toggle('on', o === b); });
        place(b);
        if (old) {
          old.classList.toggle('on', false);
          old.classList.toggle('out', true);
          setTimeout(function () { old.classList.toggle('out', false); }, 290);
        }
        if (nw) {
          nw.classList.toggle('on', false);
          void nw.offsetWidth;
          nw.classList.toggle('on', true);
        }
      });
    });
  }

  /* filtres + catalogue replie */
  var LIMIT = { sfc: 9 };
  var state = { sfc: { f: '*', all: false } };
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
    var more = document.getElementById('sfMore');
    if (more) {
      more.style.display = total > LIMIT[id] ? '' : 'none';
      more.textContent = st.all ? 'Replier le catalogue' : 'Voir tout le catalogue (' + total + ')';
    }
    var c = document.getElementById('sfCount');
    if (c) c.textContent = total + ' programme' + (total > 1 ? 's' : '');
  }
  $$('.sfchips').forEach(function (g) {
    var id = g.getAttribute('data-t');
    if (!state[id]) return;
    g.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      $$('button', g).forEach(function (o) { o.classList.toggle('on', o === b); });
      state[id].f = b.getAttribute('data-f');
      state[id].all = state[id].f !== '*';
      apply(id);
    });
  });
  var m = document.getElementById('sfMore');
  if (m) m.addEventListener('click', function () { state.sfc.all = !state.sfc.all; apply('sfc'); });
  apply('sfc');
})();
