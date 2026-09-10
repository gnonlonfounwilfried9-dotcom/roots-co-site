/* ROOTS - etapes de suivi de colis, partagees entre le tableau de bord et l'espace client.
   Une seule source de verite : le libelle, l'avancement en pourcentage, l'ordre. */
(function (w) {
  var ETAPES = [
    { cle: 'Commande recue', label: 'Commande reçue', pct: 15 },
    { cle: 'En preparation', label: 'En préparation', pct: 35 },
    { cle: 'Expediee', label: 'Expédiée', pct: 55 },
    { cle: 'Arrivee au point local', label: 'Arrivée au point local', pct: 75 },
    { cle: 'En livraison', label: 'En livraison', pct: 90 },
    { cle: 'Livree', label: 'Livrée', pct: 100 }
  ];
  function norm(s) {
    try { return (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim(); }
    catch (e) { return (s || '').toLowerCase().trim(); }
  }
  function find(etape) {
    var n = norm(etape);
    for (var i = 0; i < ETAPES.length; i++) if (norm(ETAPES[i].cle) === n || norm(ETAPES[i].label) === n) return ETAPES[i];
    return null;
  }
  w.ROOTS_SUIVI = {
    ETAPES: ETAPES,
    // pourcentage d'avancement d'une commande, d'apres son suivi et son statut
    progress: function (order) {
      if (order && order.status === 'annule') return { pct: 0, label: 'Commande annulée' };
      if (order && order.status === 'livre') return { pct: 100, label: 'Livrée' };
      var suivi = (order && order.suivi) || [];
      var best = { pct: 10, label: 'Commande reçue' };
      suivi.forEach(function (s) {
        var e = find(s.etape);
        if (e && e.pct >= best.pct) best = { pct: e.pct, label: e.label };
      });
      return best;
    },
    label: function (cle) { var e = find(cle); return e ? e.label : cle; }
  };
})(window);
