/* ROOTS - Assistant documente (aucune dependance externe) */
(function () {
var WA = 'https://wa.me/22901995652';

var KB = [
 {k:['bonjour','salut','bonsoir','hello','hi','coucou','bjr'],
  a:"Bonjour et bienvenue chez <b>ROOTS</b>. Je reponds sur nos solutions informatiques, la boutique et les prix, nos partenaires, la livraison, la garantie et les devis. Que puis-je faire pour vous ?"},

 {k:['service','services','pole','activite','faites','proposez','metier','qui etes','presentation','roots'],
  a:"ROOTS reunit deux poles. <b>Informatique et technologie</b> : materiel, serveurs, reseaux, cybersecurite, videosurveillance, ERP et maintenance. <b>Import-export et logistique</b> : approvisionnement depuis la France et les Etats-Unis, transport, dedouanement et livraison. Nous sommes presents au Togo, au Benin, en France et aux Etats-Unis.",
  q:[['Informatique','informatique.html'],['Import-export','import-export.html'],['A propos','a-propos.html']]},

 {k:['produit','produits','boutique','acheter','achat','stock','ordinateur','pc','laptop','portable','materiel','catalogue','ecran','clavier','souris','dock','station','tour'],
  a:"La boutique presente le <b>stock Dell disponible</b> : ordinateurs portables, tours et postes compacts, ecrans 24 et 27 pouces, claviers, souris et stations d accueil. Chaque fiche affiche le prix en <b>FCFA</b> et en euros, la configuration et la quantite en stock.",
  q:[['Ouvrir la boutique','boutique.html']]},

 {k:['prix','tarif','tarifs','cout','combien','devise','euro','euros','fcfa','cfa','franc','conversion','taux','ttc','ht','tva'],
  a:"Tous les prix sont affiches en <b>FCFA</b> et en <b>euros</b>, hors taxes et toutes taxes comprises. La TVA appliquee est de <b>18 %</b> et la conversion se fait au taux fixe <b>1 EUR = 655,957 FCFA</b>. Pour une quantite precise ou un marche, nous etablissons un devis avec un prix ferme.",
  q:[['Voir les prix','boutique.html'],['Demander un devis','contact.html']]},

 {k:['partenaire','partenaires','partenariat','marque','marques','dell','hp','microsoft','sap','odoo','fortinet','sophos','acronis','synology','huawei','axis','hikvision','apc','ubiquiti','schneider'],
  a:"ROOTS est <b>partenaire officiel Dell</b> et travaille avec HP, Microsoft, SAP, Odoo, Fortinet, Sophos, Acronis, Synology, Huawei, Ubiquiti, Axis, Hikvision et APC by Schneider Electric. Chaque marque a sa page dediee avec le detail de ce que nous assurons.",
  q:[['Nos partenaires','partenaires.html'],['Page Dell','partenaire-dell.html']]},

 {k:['reference','references','client','clients','confiance','realisation','qui vous fait'],
  a:"Nous accompagnons des institutions, des banques et des entreprises : Ambassade de France au Togo, Banque Mondiale, Banque Atlantique, IB Bank, TOTAL, MSC, Lome Container Terminal, AGETUR, AGET, ZENER, Institut Francais, Lycee Francais de Lome et d autres.",
  q:[['Voir nos references','references.html']]},

 {k:['livraison','livrer','livre','delai','delais','expedition','transport','fret','combien de temps'],
  a:"Le stock est situe dans nos <b>entrepots en France</b>. Nous livrons au Togo, au Benin et dans la sous-region, par voie aerienne ou maritime selon le volume et l urgence. Les delais et les frais dependent de la quantite et de la destination : ils sont chiffres sur le devis.",
  q:[['Import-export','import-export.html'],['Demander un devis','contact.html']]},

 {k:['douane','dedouanement','import','export','approvisionnement','sourcing','commerce','logistique'],
  a:"Notre pole <b>import-export</b> prend en charge la chaine complete : sourcing en France et aux Etats-Unis, achat, transport, formalites douanieres et livraison finale, avec un seul interlocuteur et un suivi a chaque etape.",
  q:[['Import-export et logistique','import-export.html']]},

 {k:['garantie','sav','panne','reparation','service apres','maintenance','support','depannage'],
  a:"Le materiel est <b>neuf</b>, garanti par le constructeur de 1 a 3 ans selon les references, aux normes CE. Le service apres-vente est assure <b>localement</b> par nos equipes au Togo et au Benin, et nous proposons des contrats de maintenance pour les parcs d entreprise.",
  q:[['Nous contacter','contact.html']]},

 {k:['devis','commande','commander','proforma','facture','marche','appel d offre','quantite','gros','grossiste'],
  a:"Deux facons de commander. <b>1.</b> Ajoutez les articles au panier de la boutique, puis envoyez la commande sur WhatsApp en un clic. <b>2.</b> Remplissez le formulaire de contact et nous vous retournons un devis ou une facture proforma. Pour les volumes et les marches publics, nous etablissons une offre dediee.",
  q:[['Boutique','boutique.html'],['Formulaire de devis','contact.html']]},

 {k:['paiement','payer','reglement','acompte','virement','mobile money','carte'],
  a:"Le reglement se fait a la commande, avec un <b>acompte</b> pour les commandes sur approvisionnement. Les modalites exactes, la devise de facturation et les coordonnees bancaires figurent sur chaque devis.",
  q:[['Demander un devis','contact.html']]},

 {k:['contact','telephone','appeler','numero','mail','email','adresse','joindre','ou etes','bureau','horaire','whatsapp'],
  a:"Vous pouvez nous joindre au <b>+228 93 07 87 87</b> (Togo), au <b>+229 99 56 52 52</b> (Benin), sur WhatsApp au <b>+229 01 99 56 52 52</b>, ou par mail a <b>sales@roots.ws</b>. Nous sommes implantes au Togo, au Benin, en France et aux Etats-Unis.",
  q:[['Page contact','contact.html'],['Ecrire sur WhatsApp',WA]]},

 {k:['reseau','wifi','wi fi','cablage','switch','commutateur','fibre','lan','vpn'],
  a:"Nous concevons et deployons des <b>reseaux d entreprise</b> : cablage structure, commutateurs, points d acces Wi-Fi haute densite, liaisons entre sites et VPN, avec supervision et maintenance. Marques deployees : Huawei, Ubiquiti et Fortinet.",
  q:[['Informatique','informatique.html'],['Partenaires reseau','partenaires.html']]},

 {k:['securite','antivirus','firewall','pare feu','cyber','ransomware','rancongiciel','protection','audit'],
  a:"Cote securite : pare-feu <b>Fortinet</b>, protection des postes <b>Sophos</b>, sauvegarde et reprise d activite <b>Acronis</b>, stockage <b>Synology</b>. Nous auditons l existant, proposons un plan adapte, deployons puis supervisons.",
  q:[['Nos solutions','informatique.html']]},

 {k:['sauvegarde','backup','restauration','continuite','pra','donnees','nas','stockage'],
  a:"Nous mettons en place des <b>sauvegardes automatiques</b>, locales et externalisees, avec tests de restauration reguliers et un plan de reprise en cas de panne ou d attaque. Solutions Acronis et Synology.",
  q:[['Acronis','partenaire-acronis.html'],['Synology','partenaire-synology.html']]},

 {k:['camera','videosurveillance','surveillance','controle d acces','pointage','alarme'],
  a:"Nous installons la <b>videosurveillance professionnelle</b> Axis et Hikvision : etude d implantation, cablage, cameras, enregistreurs, controle d acces et pointage, avec acces distant securise et formation a l usage.",
  q:[['Axis','partenaire-axis.html'],['Hikvision','partenaire-hikvision.html']]},

 {k:['erp','odoo','gestion','comptabilite','crm','facturation','logiciel','licence','microsoft 365','office'],
  a:"Nous integrons <b>Odoo</b> (ERP et CRM) et accompagnons les projets <b>SAP</b> : gestion commerciale, stocks, comptabilite et facturation, avec parametrage, reprise de donnees et formation. Nous fournissons aussi les licences <b>Microsoft 365</b> et la messagerie professionnelle.",
  q:[['Odoo','partenaire-odoo.html'],['Microsoft','partenaire-microsoft.html']]},

 {k:['energie','onduleur','ups','coupure','surtension','electrique'],
  a:"Nous protegeons serveurs, postes et equipements reseau avec les onduleurs <b>APC by Schneider Electric</b> : dimensionnement selon la charge, installation et remplacement des batteries.",
  q:[['APC by Schneider Electric','partenaire-apc.html']]},

 {k:['emploi','stage','recrutement','candidature','cv'],
  a:"Pour une candidature spontanee, un stage ou une offre de service, ecrivez-nous a <b>sales@roots.ws</b> en precisant votre domaine. Nous transmettons au service concerne.",
  q:[['Nous ecrire','contact.html']]},

 {k:['merci','parfait','super','au revoir','bye','a bientot'],
  a:"Avec plaisir. ROOTS reste a votre disposition, en ligne ou sur WhatsApp. Bonne journee."}
];

var QUICK = [
  ['Nos solutions', 'service'],
  ['Boutique et prix', 'prix boutique'],
  ['Partenaires', 'partenaire'],
  ['Livraison', 'livraison'],
  ['Garantie et SAV', 'garantie'],
  ['Demander un devis', 'devis']
];

function norm(s) {
  s = (s || '').toLowerCase();
  try { s = s.normalize('NFD').replace(/[̀-ͯ]/g, ''); } catch (e) {}
  return ' ' + s.replace(/[^a-z0-9]+/g, ' ').trim() + ' ';
}
function find(q) {
  var n = norm(q), best = null, sc = 0;
  for (var i = 0; i < KB.length; i++) {
    var s = 0;
    for (var j = 0; j < KB[i].k.length; j++) {
      var k = norm(KB[i].k[j]).trim();
      if (k && n.indexOf(' ' + k) > -1) s += k.length;
    }
    if (s > sc) { sc = s; best = KB[i]; }
  }
  return best;
}

var el = document.createElement('div');
el.innerHTML = ''
+ '<button class="rc-btn" id="rcBtn" data-lb="Assistant ROOTS" aria-label="Assistant ROOTS">'
+ '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'
+ '<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.5 9.5 0 0 1-2.8-.4L3 21l1.6-4.7A8.3 8.3 0 0 1 3.6 11.5a8.4 8.4 0 0 1 9-8.4 8.4 8.4 0 0 1 8.4 8.4z"/></svg></button>'
+ '<div class="rc-panel" id="rcPanel" role="dialog" aria-label="Assistant ROOTS">'
+ '<div class="rc-head"><div><strong>Assistant ROOTS</strong>'
+ '<span class="rc-sub"><i class="rc-dot"></i>Reponse immediate</span></div>'
+ '<button id="rcClose" aria-label="Fermer">&times;</button></div>'
+ '<div class="rc-msgs" id="rcMsgs"></div><div class="rc-quick" id="rcQuick"></div>'
+ '<form class="rc-form" id="rcForm"><input id="rcIn" type="text" placeholder="Posez votre question..." autocomplete="off">'
+ '<button type="submit" aria-label="Envoyer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
+ '<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/></svg></button></form></div>';
document.body.appendChild(el);

var msgs = document.getElementById('rcMsgs'), panel = document.getElementById('rcPanel');
function add(html, who) {
  var d = document.createElement('div');
  d.className = 'rc-m ' + who; d.innerHTML = html;
  msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight;
}
function links(q) {
  if (!q || !q.length) return '';
  return '<div class="rc-links">' + q.map(function (x) {
    var ext = x[1].indexOf('http') === 0 ? ' target="_blank" rel="noopener"' : '';
    return '<a href="' + x[1] + '"' + ext + '>' + x[0] + '</a>';
  }).join('') + '</div>';
}
function answer(q, show) {
  add(show || q, 'me');
  setTimeout(function () {
    var e = find(q);
    if (e) add(e.a + links(e.q), 'bot');
    else add("Je n ai pas la reponse exacte a cette question, mais un conseiller ROOTS peut vous repondre directement."
      + links([['Ecrire sur WhatsApp', WA], ['Page contact', 'contact.html']]), 'bot');
  }, 280);
}
function quick() {
  var qd = document.getElementById('rcQuick'); qd.innerHTML = '';
  QUICK.forEach(function (x) {
    var b = document.createElement('button'); b.type = 'button'; b.textContent = x[0];
    b.onclick = function () { answer(x[1], x[0]); };
    qd.appendChild(b);
  });
}
document.getElementById('rcBtn').onclick = function () {
  panel.classList.toggle('show');
  if (panel.classList.contains('show')) {
    if (!msgs.dataset.init) {
      msgs.dataset.init = '1';
      add("Bonjour, je suis l assistant ROOTS. Je reponds sur nos solutions, la boutique, les prix en FCFA, la livraison, la garantie et les devis. Choisissez un sujet ou ecrivez votre question.", 'bot');
      quick();
    }
    var i = document.getElementById('rcIn'); if (i) i.focus();
  }
};
document.getElementById('rcClose').onclick = function () { panel.classList.remove('show'); };
document.getElementById('rcForm').onsubmit = function (ev) {
  ev.preventDefault();
  var i = document.getElementById('rcIn');
  if (i.value.trim()) { answer(i.value.trim()); i.value = ''; }
};
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') panel.classList.remove('show');
});
})();
