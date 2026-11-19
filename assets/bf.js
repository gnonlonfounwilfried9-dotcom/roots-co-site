/* ROOTS & Co : page Black Friday. Compte a rebours reel, particules, compteurs, 3D, filtres animes, demande groupee.
   Aucune donnee de carte, aucun numero en clair : WhatsApp est reconstruit au clic. */
(function () {
  var root = document.getElementById('bf'); if (!root) return;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  function fmt(n) { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function lang() { try { return localStorage.getItem('rootsco_lang') === 'en' ? 'en' : 'fr'; } catch (e) { return 'fr'; } }
  function dec(s) { try { return decodeURIComponent(escape(atob(s))); } catch (e) { return ''; } }

  /* ------------------------------------------------ apparitions */
  var revealEls = $$('.bfl, .bfc, .bfs-head, .bf-step, .bf-terms, .bf-ctab, .bf-bar');
  revealEls.forEach(function (e) { e.classList.add('bf-in'); });
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in'); io.unobserve(en.target);
        $$('.cnt', en.target).forEach(countUp);
      });
    }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (e) { io.observe(e); });
  } else { revealEls.forEach(function (e) { e.classList.add('in'); }); }

  /* ------------------------------------------------ compteurs */
  function countUp(el) {
    if (el.__done) return; el.__done = true;
    var to = parseFloat(el.getAttribute('data-to')) || 0, isMoney = to > 9999;
    if (reduce) { el.textContent = isMoney ? fmt(to) : String(to); return; }
    var t0 = performance.now(), dur = isMoney ? 1500 : 1100;
    (function step(t) {
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = isMoney ? fmt(to * e) : String(Math.round(to * e));
      if (p < 1) requestAnimationFrame(step); else el.textContent = isMoney ? fmt(to) : String(to);
    })(t0);
  }
  $$('.bfh-kpi .cnt').forEach(function (e) { setTimeout(function () { countUp(e); }, 700); });

  /* ------------------------------------------------ compte a rebours (date reelle de fin) */
  var END = Date.parse(root.getAttribute('data-end'));
  var cd = { d: $('#cdD'), h: $('#cdH'), m: $('#cdM'), s: $('#cdS') }, last = {};
  function two(n) { return (n < 10 ? '0' : '') + n; }
  function setCd(k, v) { var el = cd[k]; if (!el || last[k] === v) return; last[k] = v; el.textContent = v; if (!reduce) { el.classList.remove('tick'); void el.offsetWidth; el.classList.add('tick'); } }
  function over() {
    root.classList.add('bf-over');
    var box = $('#bfCd'); if (box && !box.__over) {
      box.__over = true;
      box.innerHTML = '<span class="lbl">' + (lang() === 'en' ? 'The operation is over' : 'L’opération est terminée') + '</span><span class="end">' +
        (lang() === 'en' ? 'Ask us for the prices in force.' : 'Demandez-nous les prix en vigueur.') + '</span>';
    }
    $$('.bfc-rib em').forEach(function (e) { e.textContent = lang() === 'en' ? 'Was' : 'Ancienne offre'; });
  }
  function tick() {
    var left = END - Date.now();
    if (!(left > 0)) { over(); return; }
    var s = Math.floor(left / 1000);
    setCd('d', two(Math.floor(s / 86400))); setCd('h', two(Math.floor(s % 86400 / 3600)));
    setCd('m', two(Math.floor(s % 3600 / 60))); setCd('s', two(s % 60));
    setTimeout(tick, 250);
  }
  tick();

  /* ------------------------------------------------ particules du hero */
  var cv = $('#bfCv');
  if (cv && !reduce) {
    var cx = cv.getContext('2d'), W = 0, H = 0, P = [], vis = true, mx = 0, my = 0;
    function size() { var r = cv.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1); W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; cx.setTransform(d, 0, 0, d, 0, 0); }
    function mk(init) { return { x: Math.random() * W, y: init ? Math.random() * H : H + 20, v: .25 + Math.random() * .9, s: 3 + Math.random() * 7, r: Math.random() * 6.28, w: (Math.random() - .5) * .02, k: Math.random() < .3 ? 1 : 0, a: .25 + Math.random() * .55 }; }
    size(); for (var i = 0; i < (W < 700 ? 34 : 70); i++) P.push(mk(true));
    window.addEventListener('resize', size);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { vis = e[0].isIntersecting; }).observe(cv);
    document.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width - .5; my = (e.clientY - r.top) / r.height - .5; }, { passive: true });
    (function draw() {
      requestAnimationFrame(draw); if (!vis) return;
      cx.clearRect(0, 0, W, H);
      P.forEach(function (p, i) {
        p.y -= p.v; p.r += p.w; p.x += Math.sin(p.y / 60 + i) * .25;
        if (p.y < -30) P[i] = mk(false);
        var ox = mx * p.s * 9, oy = my * p.s * 9;
        cx.save(); cx.translate(p.x + ox, p.y + oy); cx.rotate(p.r); cx.globalAlpha = p.a; cx.strokeStyle = '#22c3e6'; cx.fillStyle = 'rgba(34,195,230,.18)'; cx.lineWidth = 1.4;
        if (p.k) { cx.beginPath(); cx.moveTo(-p.s, -p.s * .7); cx.lineTo(p.s * .6, -p.s * .7); cx.lineTo(p.s * 1.3, 0); cx.lineTo(p.s * .6, p.s * .7); cx.lineTo(-p.s, p.s * .7); cx.closePath(); cx.fill(); cx.stroke(); cx.beginPath(); cx.arc(-p.s * .45, 0, p.s * .16, 0, 6.28); cx.stroke(); }
        else { cx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s); cx.strokeRect(-p.s / 2, -p.s / 2, p.s, p.s); }
        cx.restore();
      });
    })();
  }

  /* ------------------------------------------------ inclinaison 3D + halo des cartes */
  if (fine && !reduce) {
    $$('.bfc').forEach(function (c) {
      var inn = $('.bfc-in', c);
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        inn.style.setProperty('--ry', ((x - .5) * 9).toFixed(2) + 'deg'); inn.style.setProperty('--rx', ((.5 - y) * 7).toFixed(2) + 'deg');
        inn.style.setProperty('--mx', (x * 100).toFixed(1) + '%'); inn.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      });
      c.addEventListener('pointerleave', function () { inn.style.setProperty('--ry', '0deg'); inn.style.setProperty('--rx', '0deg'); });
    });
    /* boutons magnetiques */
    $$('.bf-mag').forEach(function (b) {
      b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .18).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * .28).toFixed(1) + 'px)'; });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  /* ------------------------------------------------ details */
  $$('.bfc-more').forEach(function (b) {
    b.addEventListener('click', function () { var c = b.closest('.bfc'), o = c.classList.toggle('open'); b.setAttribute('aria-expanded', o ? 'true' : 'false'); });
  });

  /* ------------------------------------------------ filtres, tri, recherche (reordonnancement anime) */
  var grid = $('#bfGrid'), cards = $$('.bfc', grid), cat = 'all', q = '', sort = 'pct';
  var count = $('#bfCount'), empty = $('#bfEmpty');
  function key(c) { return { pct: -(+c.dataset.pct), asc: +c.dataset.promo, desc: -(+c.dataset.promo), save: -(+c.dataset.reg - +c.dataset.promo) }[sort]; }
  function apply(animate) {
    var first = {}; if (animate && !reduce) cards.forEach(function (c) { first[c.dataset.ref] = c.getBoundingClientRect(); });
    var shown = 0;
    cards.sort(function (a, b) { return key(a) - key(b) || (+a.style.getPropertyValue('--i')) - (+b.style.getPropertyValue('--i')); });
    cards.forEach(function (c) {
      var ok = (cat === 'all' || c.dataset.cat === cat) && (!q || c.dataset.name.indexOf(q) > -1);
      grid.appendChild(c);
      if (ok) { shown++; c.hidden = false; requestAnimationFrame(function () { c.classList.remove('out'); }); }
      else { c.classList.add('out'); if (reduce || !animate) c.hidden = true; else setTimeout(function () { if (c.classList.contains('out')) c.hidden = true; }, 380); }
    });
    if (animate && !reduce) cards.forEach(function (c) {
      if (c.hidden) return; var f = first[c.dataset.ref], l = c.getBoundingClientRect(); if (!f || !f.width) return;
      var dx = f.left - l.left, dy = f.top - l.top; if (!dx && !dy) return;
      c.style.transition = 'none'; c.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      requestAnimationFrame(function () { c.style.transition = 'transform .6s cubic-bezier(.2,.8,.2,1),opacity .45s'; c.style.transform = ''; });
    });
    empty.hidden = shown > 0;
    var en = lang() === 'en';
    count.innerHTML = '<b>' + shown + '</b> ' + (en ? (shown > 1 ? 'offers shown' : 'offer shown') : (shown > 1 ? 'offres affichées' : 'offre affichée'));
  }
  $$('.bf-chips button').forEach(function (b) {
    b.addEventListener('click', function () { $$('.bf-chips button').forEach(function (x) { x.classList.toggle('on', x === b); }); cat = b.dataset.f; apply(true); });
  });
  $('#bfQ').addEventListener('input', function (e) { q = e.target.value.trim().toLowerCase(); apply(false); });
  $('#bfSort').addEventListener('change', function (e) { sort = e.target.value; apply(true); });
  apply(false);

  /* ------------------------------------------------ demande groupee (articles, quantites, total HT) */
  var sel = {}, dock = $('#bfDock'), list = $('#bfList'), nEl = $('#bfN'), totEl = $('#bfTot'), shownTot = 0;
  try { var s0 = JSON.parse(sessionStorage.getItem('rootsBF_sel') || '{}'); Object.keys(s0).forEach(function (k) { if (s0[k] && s0[k].q > 0) sel[k] = s0[k]; }); } catch (e) { }
  function save() { try { sessionStorage.setItem('rootsBF_sel', JSON.stringify(sel)); } catch (e) { } }
  function animTot(to) {
    var from = shownTot, t0 = performance.now(); shownTot = to;
    if (reduce) { totEl.textContent = fmt(to); return; }
    (function step(t) { var p = Math.min(1, (t - t0) / 500), e = 1 - Math.pow(1 - p, 3); totEl.textContent = fmt(from + (to - from) * e); if (p < 1) requestAnimationFrame(step); })(t0);
  }
  function render(bump) {
    var ks = Object.keys(sel), n = 0, tot = 0, en = lang() === 'en';
    list.innerHTML = '';
    ks.forEach(function (k) {
      var it = sel[k]; n += it.q; tot += it.q * it.p;
      var row = document.createElement('div'); row.className = 'bf-row';
      row.innerHTML = '<div class="nm">' + it.l.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '<small>' + fmt(it.p) + ' FCFA HT ' + (en ? 'each' : 'l’unité') + '</small></div>' +
        '<div class="bf-q"><button type="button" data-a="-" data-k="' + k + '" aria-label="-">&minus;</button><b>' + it.q + '</b><button type="button" data-a="+" data-k="' + k + '" aria-label="+">+</button></div>' +
        '<div class="pr">' + fmt(it.q * it.p) + '</div>' +
        '<button type="button" class="rm" data-a="x" data-k="' + k + '" aria-label="' + (en ? 'Remove' : 'Retirer') + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>';
      list.appendChild(row);
    });
    nEl.textContent = n; animTot(tot);
    $$('.bfc, .bfl').forEach(function (c) {
      var on = !!sel[c.dataset.ref], b = $('.bfc-add', c); c.classList.toggle('sel', on); if (b) b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    if (n > 0) { dock.hidden = false; requestAnimationFrame(function () { dock.classList.add('show'); }); if (bump && !reduce) { dock.classList.remove('bump'); void dock.offsetWidth; dock.classList.add('bump'); } }
    else { dock.classList.remove('show', 'open'); setTimeout(function () { if (!dock.classList.contains('show')) dock.hidden = true; }, 600); }
    save();
  }
  function toggle(card) {
    var ref = card.dataset.ref;
    if (sel[ref]) delete sel[ref]; else sel[ref] = { l: card.dataset.label, p: +card.dataset.promo, q: 1, lot: card.dataset.lot ? 1 : 0 };
    var b = $('.bfc-add', card); if (b && !reduce) { b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); }
    if (sel[ref] && !reduce) { card.classList.remove('pulse'); void card.offsetWidth; card.classList.add('pulse'); }
    render(!!sel[ref]);
  }
  $$('.bfc, .bfl').forEach(function (c) { var b = $('.bfc-add', c); if (b) b.addEventListener('click', function () { toggle(c); }); });
  list.addEventListener('click', function (e) {
    var b = e.target.closest('[data-a]'); if (!b) return; var k = b.dataset.k, it = sel[k]; if (!it) return;
    if (b.dataset.a === '+') it.q = Math.min(99, it.q + 1); else if (b.dataset.a === '-') it.q = Math.max(1, it.q - 1); else delete sel[k];
    render(false);
  });
  $('#bfToggle').addEventListener('click', function () { var o = dock.classList.toggle('open'); this.setAttribute('aria-expanded', o ? 'true' : 'false'); });
  $('#bfClear').addEventListener('click', function () { sel = {}; render(false); });

  function message() {
    var en = lang() === 'en', ks = Object.keys(sel), tot = 0, L = [];
    L.push(en ? 'Hello ROOTS, I would like a Black Friday quote (prices excl. tax, in FCFA):' : 'Bonjour ROOTS, je souhaite un devis Black Friday (prix HT en FCFA) :');
    ks.forEach(function (k, i) { var it = sel[k]; tot += it.q * it.p; L.push((i + 1) + '. ' + it.l + (it.lot ? ' ' + (en ? '(lot price)' : '(prix du lot)') : '') + ', ' + (en ? 'quantity ' : 'quantité ') + it.q + ', ' + fmt(it.p) + ' FCFA HT'); });
    L.push((en ? 'Estimated total excl. tax: ' : 'Total HT estimé : ') + fmt(tot) + ' FCFA.');
    L.push(en ? 'Please confirm stock, price and delivery time. Thank you.' : 'Merci de me confirmer le stock, le prix et le délai de livraison.');
    return L.join('\n');
  }
  $('#bfWa').addEventListener('click', function (e) {
    if (!e.isTrusted || !Object.keys(sel).length) return;
    var base = dec(this.getAttribute('data-wb')); if (!base) return;
    window.open(base + '?text=' + encodeURIComponent(message()), '_blank', 'noopener');
  });
  $('#bfForm').addEventListener('click', function () {
    if (!Object.keys(sel).length) return;
    try { sessionStorage.setItem('rootsBF', message()); } catch (e) { }
    location.href = 'contact.html#devis';
  });
  render(false);

  /* ------------------------------------------------ langue : recalculer les textes construits en JS */
  document.querySelectorAll('.lang button').forEach(function (b) { b.addEventListener('click', function () { setTimeout(function () { apply(false); render(false); if (END - Date.now() <= 0) { $('#bfCd').__over = false; over(); } }, 60); }); });
  if (lang() === 'en') setTimeout(function () { apply(false); render(false); }, 300);
})();
