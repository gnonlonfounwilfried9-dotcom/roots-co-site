/* ROOTS - Assistant documente (sans dependance externe) */
(function(){
var WA='https://wa.me/22901995652';
var KB=[
 {k:['bonjour','salut','bonsoir','hello','hi','coucou'],
  a:"Bonjour et bienvenue chez ROOTS. Je peux vous renseigner sur nos solutions informatiques, notre boutique, nos partenaires, la livraison ou un devis. Que puis-je faire pour vous ?"},
 {k:['service','pole','pôle','activite','activité','faites','proposez','metier','métier'],
  a:"ROOTS a deux poles. <b>Informatique et technologie</b> : materiel, serveurs, reseaux, cybersecurite, videosurveillance, ERP et maintenance. <b>Import-export et logistique</b> : approvisionnement depuis la France et les Etats-Unis, dedouanement et livraison."},
 {k:['produit','boutique','acheter','stock','ordinateur','pc','laptop','portable','materiel','matériel','catalogue'],
  a:"Notre boutique presente le stock Dell disponible : ordinateurs portables, tours, ecrans, claviers, souris et stations d accueil. Les prix sont affiches en euros HT et TTC, avec l equivalent en FCFA.",
  q:[['Voir la boutique','boutique.html']]},
 {k:['prix','tarif','cout','coût','combien','devise','euro','fcfa'],
  a:"Les prix de la boutique sont en <b>euros</b> (HT et TTC, TVA 18 %), avec une conversion indicative en FCFA au taux de 1 EUR = 655,957 FCFA. Pour un prix ferme sur une quantite precise, demandez un devis.",
  q:[['Voir les prix','boutique.html'],['Demander un devis','contact.html']]},
 {k:['dell','partenaire','partenariat','marque','hp','microsoft','sap','odoo','fortinet','sophos','acronis','synology','huawei','axis','hikvision','apc','ubiquiti'],
  a:"ROOTS est partenaire officiel de Dell, et travaille avec HP, Microsoft, SAP, Odoo, Fortinet, Sophos, Acronis, Synology, Huawei, Axis, Hikvision, APC by Schneider Electric et Ubiquiti. Chaque partenaire a sa page dediee.",
  q:[['Nos partenaires','partenaires.html']]},
 {k:['reference','référence','client','confiance','realisation','réalisation'],
  a:"Nous accompagnons des institutions et des entreprises : Ambassade de France au Togo, Banque Mondiale, CEDEAO, Banque Atlantique, TOTAL, MSC, Institut Francais, Lycee Francais de Lome, AGETUR, ZENER et d autres.",
  q:[['Voir les references','references.html']]},
 {k:['livraison','livrer','delai','délai','expedition','expédition','transport'],
  a:"Le stock est situe dans nos entrepots en France. Nous livrons au Togo, au Benin et dans la sous-region. Les delais et les frais dependent du volume et de la destination : ils sont precises sur le devis."},
 {k:['garantie','sav','panne','reparation','réparation','service apres','service après'],
  a:"Le materiel est neuf et garanti par le constructeur, de 1 a 3 ans selon les references, aux normes CE. Le service apres-vente est assure localement par nos equipes au Togo et au Benin."},
 {k:['devis','commande','commander','acheter','proforma','facture'],
  a:"Deux facons de commander : ajoutez les articles au panier de la boutique puis envoyez la commande sur WhatsApp, ou remplissez le formulaire de contact et nous vous envoyons un devis.",
  q:[['Boutique','boutique.html'],['Formulaire de devis','contact.html']]},
 {k:['paiement','payer','reglement','règlement','acompte'],
  a:"Le reglement se fait a la commande, avec un acompte pour les commandes sur approvisionnement. Les modalites exactes figurent sur chaque devis."},
 {k:['contact','telephone','téléphone','appeler','mail','email','adresse','joindre','ou etes','où êtes','bureau'],
  a:"Vous pouvez nous joindre au <b>+228 93 07 87 87</b> (Togo) ou <b>+229 99 56 52 52</b> (Benin), sur WhatsApp au <b>+229 01 99 56 52 52</b>, ou par mail a <b>sales@roots.ws</b>. Nous sommes presents au Togo, au Benin, en France et aux Etats-Unis.",
  q:[['Page contact','contact.html']]},
 {k:['reseau','réseau','wifi','cablage','câblage','switch'],
  a:"Nous concevons et deployons des reseaux d entreprise : cablage, commutateurs, points d acces Wi-Fi, liaisons entre sites, avec supervision et maintenance."},
 {k:['securite','sécurité','antivirus','firewall','pare-feu','cyber','sauvegarde','backup'],
  a:"Cote securite : pare-feu Fortinet, protection des postes Sophos, sauvegarde et reprise d activite Acronis, stockage Synology. Nous auditons l existant puis proposons un plan adapte."},
 {k:['camera','caméra','videosurveillance','vidéosurveillance','surveillance'],
  a:"Nous installons la videosurveillance professionnelle Axis et Hikvision : etude d implantation, cablage, cameras, enregistrement et acces distant securise."},
 {k:['erp','odoo','gestion','comptabilite','comptabilité','crm'],
  a:"Nous integrons Odoo (ERP et CRM) et accompagnons les projets SAP : gestion commerciale, stocks, comptabilite et facturation, avec parametrage, reprise de donnees et formation."},
 {k:['import','export','douane','dedouanement','dédouanement','approvisionnement'],
  a:"Notre pole import-export prend en charge l approvisionnement depuis la France et les Etats-Unis, le transport, le dedouanement et la livraison finale, avec un seul interlocuteur."},
 {k:['merci','ok','parfait','super','au revoir','bye'],
  a:"Avec plaisir. ROOTS reste a votre disposition. Bonne journee."}
];
var QUICK=[['Nos solutions','?service'],['Boutique et prix','?produit'],['Partenaires','?partenaire'],['Livraison','?livraison'],['Demander un devis','?devis']];

function norm(s){return (s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');}
function find(q){
  var n=norm(q),best=null,sc=0;
  KB.forEach(function(e){var s=0;e.k.forEach(function(k){if(n.indexOf(norm(k))>-1)s++;});if(s>sc){sc=s;best=e;}});
  return best;
}
var el=document.createElement('div');
el.innerHTML=''
+'<button class="rc-btn" id="rcBtn" aria-label="Assistant ROOTS"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.5 9.5 0 0 1-2.8-.4L3 21l1.6-4.7A8.3 8.3 0 0 1 3.6 11.5a8.4 8.4 0 0 1 9-8.4 8.4 8.4 0 0 1 8.4 8.4z"/></svg></button>'
+'<div class="rc-panel" id="rcPanel"><div class="rc-head"><div><strong>Assistant ROOTS</strong><span>Reponse immediate</span></div><button id="rcClose" aria-label="Fermer">&times;</button></div>'
+'<div class="rc-msgs" id="rcMsgs"></div><div class="rc-quick" id="rcQuick"></div>'
+'<form class="rc-form" id="rcForm"><input id="rcIn" type="text" placeholder="Ecrivez votre question..." autocomplete="off"><button type="submit" aria-label="Envoyer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/></svg></button></form></div>';
document.body.appendChild(el);
var msgs=document.getElementById('rcMsgs'),panel=document.getElementById('rcPanel');
function add(html,who){var d=document.createElement('div');d.className='rc-m '+who;d.innerHTML=html;msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;}
function links(q){ if(!q)return''; return '<div class="rc-links">'+q.map(function(x){return '<a href="'+x[1]+'">'+x[0]+'</a>';}).join('')+'</div>'; }
function answer(q){
  add(q,'me');
  setTimeout(function(){
    var e=find(q);
    if(e) add(e.a+links(e.q),'bot');
    else add("Je n ai pas la reponse exacte a cette question. Un conseiller ROOTS peut vous repondre directement."+links([['Ecrire sur WhatsApp',WA],['Page contact','contact.html']]),'bot');
  },260);
}
function quick(){
  var qd=document.getElementById('rcQuick');qd.innerHTML='';
  QUICK.forEach(function(x){var b=document.createElement('button');b.textContent=x[0];
    b.onclick=function(){answer(x[1].slice(1));};qd.appendChild(b);});
}
document.getElementById('rcBtn').onclick=function(){
  panel.classList.toggle('show');
  if(panel.classList.contains('show')&&!msgs.dataset.init){
    msgs.dataset.init='1';
    add("Bonjour, je suis l assistant ROOTS. Je reponds sur nos solutions, la boutique, les prix, la livraison, la garantie et les devis.",'bot');
    quick();
  }
};
document.getElementById('rcClose').onclick=function(){panel.classList.remove('show');};
document.getElementById('rcForm').onsubmit=function(ev){ev.preventDefault();var i=document.getElementById('rcIn');
  if(i.value.trim()){answer(i.value.trim());i.value='';}};
})();
