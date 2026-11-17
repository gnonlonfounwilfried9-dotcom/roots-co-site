/* ROOTS & Co : protection anti-spam des coordonnees.
   Aucune adresse e-mail ni aucun numero n'est ecrit en clair dans les pages : ils sont encodes
   (data-v / data-w) et reconstruits ici, uniquement apres une action humaine (clic, survol, toucher).
   Les robots de collecte qui lisent seulement le HTML ne trouvent rien. */
(function () {
  var T0 = Date.now();
  function dec(s) { try { return decodeURIComponent(escape(atob(s))); } catch (e) { return ''; } }

  /* e-mail et telephones a la demande */
  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('button.rv[data-k]') : null;
    if (!b) return;
    if (!e.isTrusted || Date.now() - T0 < 700) return;       // clic automatique ou trop rapide : ignore
    var v = dec(b.getAttribute('data-v')); if (!v) return;
    var out = document.createElement('span');
    out.className = 'rv-out';
    if (b.getAttribute('data-k') === 'm') {
      var a = document.createElement('a');
      a.href = 'mailto:' + v; a.textContent = v; out.appendChild(a);
    } else {
      v.split('|').forEach(function (n, i) {
        if (i) out.appendChild(document.createTextNode(' · '));
        var a = document.createElement('a');
        a.href = 'tel:' + n.replace(/\s+/g, ''); a.textContent = n; out.appendChild(a);
      });
    }
    b.parentNode.replaceChild(out, b);
  });

  /* WhatsApp : le lien reel n'existe qu'apres survol, toucher ou clic */
  function wa(el) {
    var d = el.getAttribute('data-w'); if (!d) return;
    var u = dec(d); if (u) { el.setAttribute('href', u); el.removeAttribute('data-w'); }
  }
  ['pointerdown', 'touchstart', 'mouseover', 'focusin'].forEach(function (ev) {
    document.addEventListener(ev, function (e) {
      var a = e.target.closest ? e.target.closest('a[data-w]') : null;
      if (a) wa(a);
    }, { passive: true });
  });
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[data-w]') : null;
    if (a && e.isTrusted) { wa(a); e.preventDefault(); window.open(a.href, '_blank', 'noopener'); }
  });

  /* adresse e-mail pour le secours du formulaire (mailto pre-rempli) */
  window.rootsMail = function () { return dec('Y29udGFjdEByb290cy1jby5mcg=='); };
})();
