# -*- coding: utf-8 -*-
"""Genere savoir-faire.html (tout le contenu des anciens sites ROOTS sur une seule page)
et solaire.html (page energie solaire). Source du contenu : roots.ws (roots-technologies.com)
et roots.services (ssii.roots-technologies.com/wpsite), releves le 17/11/2026.
Usage : python scripts/build_savoir_faire.py   puis   python scripts/apply_footer.py"""
import html, io, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import site_parts as sp

def rd(p): return io.open(os.path.join(ROOT, p), encoding="utf-8").read()
def wr(p, s): io.open(os.path.join(ROOT, p), "w", encoding="utf-8", newline="\n").write(s)
def e(t): return html.escape(t, quote=False)

def svg(inner):
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">%s</svg>' % inner
IC = {
 "archive": '<rect x="2" y="3" width="20" height="5" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>',
 "backup": '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 11v6c0 1.7 3.6 3 8 3"/><path d="M18 14v7M15 18l3-4 3 4"/>',
 "shield": '<path d="M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5l-8-3Z"/><path d="m9 12 2 2 4-4"/>',
 "server": '<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/>',
 "net": '<circle cx="12" cy="5" r="2.4"/><circle cx="5" cy="19" r="2.4"/><circle cx="19" cy="19" r="2.4"/><path d="M12 7.4V12M12 12 6.5 17M12 12l5.5 5"/>',
 "code": '<path d="m8 8-4 4 4 4"/><path d="m16 8 4 4-4 4"/><path d="m13.5 5-3 14"/>',
 "globe": '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.5 2.7 4 5.7 4 9s-1.5 6.3-4 9c-2.5-2.7-4-5.7-4-9s1.5-6.3 4-9Z"/>',
 "cap": '<path d="m2 9 10-5 10 5-10 5Z"/><path d="M6 11.2V16c0 1.2 2.7 2.5 6 2.5s6-1.3 6-2.5v-4.8"/><path d="M22 9v6"/>',
 "cam": '<path d="M3 8h12v8H3z"/><path d="m15 11 6-3v8l-6-3"/>',
 "wifi": '<path d="M2 9a15 15 0 0 1 20 0"/><path d="M5 12.5a10.5 10.5 0 0 1 14 0"/><path d="M8.5 16a5.5 5.5 0 0 1 7 0"/><path d="M12 19.5h.01"/>',
 "screen": '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
 "wrench": '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4Z"/>',
 "user": '<circle cx="12" cy="8" r="3.6"/><path d="M5 20c.8-3.6 3.6-5.4 7-5.4s6.2 1.8 7 5.4"/>',
 "flag": '<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>',
 "sun": '<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8"/>',
 "bolt": '<path d="M13 2 4 14h7l-1 8 9-12h-7Z"/>',
 "home": '<path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/>',
 "chart": '<path d="M4 20V4"/><path d="M4 20h16"/><path d="m8 15 4-5 3 3 5-7"/>',
 "doc": '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
 "mail": '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
}

def card(icon, title, text, extra="", d=0):
    st = ' style="--d:%.1fs"' % d if d else ""
    return ('<div class="card tilt" data-reveal="up"%s><span class="cic">%s</span><h3>%s</h3><p>%s</p>%s</div>'
            % (st, svg(IC[icon]), title, text, extra))

def bullets(items):
    return '<ul class="sfl">%s</ul>' % "".join("<li>%s</li>" % i for i in items)

def tags(items):
    return '<div class="spot-tags sft">%s</div>' % "".join("<span>%s</span>" % i for i in items)

def shead(kick, title, lead=""):
    return ('<div class="shead"><div><span class="kicker">%s</span><h2 class="stitle">%s</h2></div>%s</div>'
            % (kick, title, '<div><p class="slead">%s</p></div>' % lead if lead else "<div></div>"))

# ------------------------------------------------------------------ contenu
SERVICES = [
 ("archive", "Archivage et GED, workflow",
  "Pour les entreprises et organisations du secteur public et privé. ROOTS vous guide dans la transition du système traditionnel vers une gestion électronique des documents performante.",
  bullets(["Archivage physique : classement selon un plan directeur, accès depuis un logiciel développé selon vos besoins",
           "Dématérialisation : logiciels dédiés et scanners de production pour accélérer la numérisation",
           "GEDLOOK, solution de gestion électronique des documents développée par ROOTS : gestion du courrier, workflow documentaire, numérisation des fonds documentaires, gestion des archives électroniques"])),
 ("backup", "Sauvegarde",
  "La sauvegarde consiste à dupliquer et mettre en sécurité les données de votre système informatique. Elle se distingue de l'enregistrement des données et de l'archivage.",
  bullets(["Équipements de sauvegarde adaptés à vos volumes de données", "Formation Acronis (sauvegarde) et EVault au catalogue"])),
 ("shield", "Sécurité informatique",
  "L'ensemble des moyens techniques, organisationnels, juridiques et humains pour empêcher l'utilisation non autorisée, le mauvais usage, la modification ou le détournement du système d'information.",
  bullets(["Objectif : maintenir la confiance des utilisateurs et des clients", "Référentiel ISO/CEI 27001 : disponibilité, intégrité, confidentialité", "Pare feu Sophos XG et UTM Sophos, anciennement Cyberoam"])),
 ("server", "Administration système",
  "Notre expertise pour l'administration de vos serveurs et de leurs systèmes.",
  bullets(["Déploiement des services Internet et Intranet", "Développement et administration de bases de données"])),
 ("wrench", "Maintenance et réseaux",
  "Une assurance de performance pour votre système informatique.",
  bullets(["Services de maintenance", "Mise en place et configuration du réseau informatique de l'entreprise"])),
 ("code", "Développement de logiciels",
  "Conception de logiciels pour votre entreprise ou votre organisation, avec une expérience avérée dans le domaine.",
  bullets(["Logiciels de gestion adaptés à vos besoins", "ERP et progiciels"])),
 ("globe", "Conception de sites web",
  "ROOTS est spécialisée dans la conduite de projets web et la conception de sites internet, pour les entreprises, les organisations et les particuliers.",
  bullets(["Sites réalisés : Centre de Formalités des Entreprises (CFE), Le PATIO Lomé, Agetur Togo"])),
 ("chart", "ERP Odoo",
  "Installation et paramétrage d'Odoo, modules RH et comptabilité, formation. Voir aussi la page Odoo de nos partenaires.",
  bullets(["Formation Odoo au catalogue", "Offre de gestion optimisée d'entreprise"])),
]

FORM_RECENT = [("Windows Server", "Administration des serveurs Windows"), ("Microsoft Office", "Bureautique"), ("Windows 10", "Poste de travail"),
               ("UTM Sophos", "Pare feu et sécurité réseau"), ("Odoo", "ERP, modules RH et comptabilité")]

FORM_CAT = [  # titre, durée, public
 ("Mise à jour des compétences d'administrateur de Windows XP vers Windows 7", "3 j", "Techniciens de support expérimentés sur Windows XP ou Vista"),
 ("Installer et configurer des clients Windows 7", "3 j", "Toute personne devant installer ou assurer le support de Windows 7"),
 ("Planifier et gérer le déploiement de postes de travail sous Windows 7", "5 j", "Toute personne en charge de déploiements Windows 7"),
 ("Dépannage et support de Windows 7", "3 j", "Architectes systèmes et réseaux chargés des services de domaine Active Directory"),
 ("Mettre à jour ses compétences d'infrastructure réseau et Active Directory vers Windows Server 2008", "5 j", "Administrateurs Windows Server 2000 ou 2003, exploitants, titulaires d'une certification MCSA ou MCSE"),
 ("Configurer, gérer et maintenir des serveurs Windows Server 2008 R2", "5 j", "Administrateurs système, membres de l'équipe de support"),
 ("Concevoir une infrastructure réseau Windows Server 2008", "5 j", "Architectes chargés d'optimiser des réseaux pour le support de systèmes Windows"),
 ("Concevoir une infrastructure d'annuaire avec Active Directory pour Windows Server 2008", "5 j", "Architectes systèmes et réseaux chargés de l'implémentation des services de domaine"),
 ("Configurer, gérer et dépanner les services de domaines Active Directory Windows Server 2008", "5 j", "Spécialistes Active Directory, administrateurs système"),
 ("Assurer la gestion et la maintenance des serveurs Active Directory sous Windows Server 2008", "2 j", "Administrateurs ou exploitants souhaitant évoluer vers l'administration Active Directory"),
 ("Microsoft Windows Server 2003", "", ""),
 ("Configurer, gérer et dépanner Exchange Server 2010 (MS490)", "5 j", "Administrateurs de Microsoft Exchange Server 2003 ou 2007"),
 ("Actualiser ses compétences d'administrateur vers Exchange Server 2010", "5 j", "Administrateurs Exchange 2003 ou 2007 souhaitant migrer vers la version 2010"),
 ("Concevoir et déployer une solution de messagerie Exchange Server 2010", "5 j", "Administrateurs, chefs de projet, responsables de l'installation d'un serveur Exchange 2010"),
 ("Drupal niveau débutant", "", ""),
 ("Devenir Responsable de la Sécurité du Système d'Information", "6 j", "Responsables ou directeurs informatique, RSSI opérationnels, dirigeants et cadres"),
 ("Acronis administration (sauvegarde)", "", ""),
 ("EVault (sauvegarde)", "", ""),
]

PRODUITS = [
 ("shield", "Sophos XG Firewall", "Un pare feu intelligent. La gestion quotidienne se simplifie grâce à Sophos Central : sauvegardes planifiées, gestion des mises à jour.", ["Sophos", "Sécurité"], "4 mai 2022"),
 ("net", "Sophos Switch, la série", "Un accès Ethernet sécurisé et évolutif pour vos appareils filaires et sans fil, avec un contrôle complet de la connectivité du réseau local.", ["Sophos", "Réseau"], "2 mars 2022"),
 ("wifi", "Wi-Fi 6 à très haut débit : Planet WDAP-C1800", "Point d'accès 802.11ax double bande 1800 Mbps : 1200 Mbps en 5 GHz et 600 Mbps en 2,4 GHz, MU-MIMO, OFDMA, Seamless Roaming, Beamforming.", ["Planet", "Wi-Fi 6"], "4 mai 2022"),
 ("wifi", "Équipements LAN sans fil Planet", "Solution complète : contrôleur de points d'accès, points d'accès intérieurs et extérieurs, 802.11ac en 2,4 GHz et 5 GHz, large couverture.", ["Planet", "Réseau"], "15 avril 2022"),
 ("backup", "Les équipements de sauvegarde", "Des besoins de stockage sans commune mesure avec ceux d'hier : choisir l'équipement de sauvegarde adapté à vos données.", ["Sauvegarde"], "15 avril 2022"),
 ("cam", "Les caméras Dahua", "Un leader mondial de la vidéosurveillance, cinquième acteur mondial de la sécurité selon le classement repris sur l'ancien site.", ["Dahua", "Vidéosurveillance"], "14 avril 2022"),
 ("net", "Firewall MikroTik CCR1009-7G-1C-1S+", "Rack 1U, 7 ports Gigabit Ethernet, 1 port combo, 1 cage SFP+, 9 cœurs à 1,2 GHz, 2 Go de RAM, double alimentation, RouterOS L6.", ["MikroTik", "Routeur"], "8 avril 2022"),
 ("screen", "Écran Dell 24 pouces E2420H", "Full HD 1920 x 1080, profil mince, gestion des câbles, technologie ComfortView qui réduit jusqu'à 60 % des émissions de lumière bleue.", ["Dell", "Écran"], "31 janvier 2022"),
 ("screen", "Écran Dell 19 pouces E1916HV (18,5 pouces)", "Écran réglable en angle, hauteur et position, bordures fines pour une installation sur plusieurs écrans.", ["Dell", "Écran"], "28 janvier 2022"),
 ("server", "Serveur rack Dell PowerEdge R340", "Processeur Intel Xeon E-2200 à 4, 6 ou 8 cœurs, stockage et mémoire extensibles, iDRAC et OpenManage.", ["Dell", "Serveur"], "28 janvier 2022"),
 ("server", "Serveur Dell EMC PowerEdge T40", "Serveur sur site d'entrée de gamme, Intel Xeon E-2224G, 8 Go de mémoire DDR4 ECC, pour la consolidation, le stockage et le partage de fichiers.", ["Dell", "Serveur"], "28 janvier 2022"),
 ("screen", "Dell Vostro 3888", "PC de bureau Dell pour les entreprises, 16 % plus compact que la génération précédente, Pentium Gold G6400, 4 Go, 1 To.", ["Dell", "Poste fixe"], "28 janvier 2022"),
]

JOBS = [
 ("Commercial", "Poste commercial. Le détail des missions et du profil est communiqué aux candidats.", [], []),
 ("Développeur d'application", "",
  ["Créer des applications couvrant les phases du cycle de vie du développement logiciel", "Élaborer les procédures de test, mettre à jour les applications existantes", "Rédiger les documents techniques et fonctionnels, former les utilisateurs finaux"],
  ["Bac+2 en informatique ou domaine connexe, 2 ans et plus d'expérience", "Langages : PHP, JavaScript, Python, Delphi, C#.Net, Java, Dart", "Frameworks : Symfony, Open Object, Laravel, .Net, Yii, Flutter. Bases : MySQL, PostgreSQL, Oracle"]),
 ("Expert ERP (comptable)", "",
  ["Gestion et classement des documents comptables", "Utilisation d'Odoo, Microsoft Dynamics et SAP pour la comptabilité", "Aide à l'établissement des états financiers, caisse, salaires, recouvrements, déclarations fiscales"],
  ["Bac+2 à Bac+5, 2 ans d'expérience", "Savoir configurer un logiciel comptable, bonne connaissance de la fiscalité", "Rigueur, esprit d'équipe, goût des projets innovants"]),
 ("Technicien réseaux informatique", "",
  ["Installer, tester et mettre à jour les équipements informatiques", "Assurer la maintenance, l'administration et la sécurité du matériel, traiter les incidents", "Soutenir les utilisateurs, rédiger les procédures et les rapports d'activité"],
  ["Licence (Bac+3) en réseaux ou équivalent, 2 ans d'expérience", "Notions de réseaux, téléphonie sur IP, télécoms, sécurité réseau et vidéosurveillance", "Sens de l'écoute, capacité à travailler en équipe et en situation d'urgence"]),
]

def job(t, intro, missions, profil):
    inner = ""
    if intro: inner += "<p>%s</p>" % intro
    if missions: inner += "<h4>Missions principales</h4>" + bullets(missions)
    if profil: inner += "<h4>Profil du candidat</h4>" + bullets(profil)
    inner += '<a class="btn btn-primary" href="contact.html#recrutement">Postuler</a>'
    return '<details class="job" data-reveal="up"><summary><span class="cic">%s</span><b>%s</b></summary><div class="jobin">%s</div></details>' % (svg(IC["user"]), t, inner)

def build_savoir_faire():
    tpl = rd("informatique.html")
    a = tpl.index('<section class="phero">'); b = tpl.index('</section>', a) + len('</section>')
    hero = ('<section class="phero"><div class="phero-bg"><img src="assets/stock/office.jpg" alt=""></div><div class="wrap">'
            '<div class="crumb"><a href="index.html">Accueil</a> %s <span>Savoir faire</span></div>'
            '<span class="kicker">Tout ROOTS sur une page</span><h1>Services, formations, produits et recrutement</h1>'
            '<p>Tout ce que ROOTS a construit depuis 2002, repris des anciens sites roots.ws et roots.services : nos services, notre catalogue de formations, les produits que nous installons et nos offres de recrutement. Votre partenaire pour l&rsquo;Excellence !</p></div></section>'
            % svg('<path d="M9 6l6 6-6 6"/>'))
    anchors = ('<div class="anchors"><div class="wrap"><a href="#equipe">L&rsquo;&eacute;quipe</a><a href="#services">Services</a><a href="#formations">Formations</a>'
               '<a href="#produits">Produits</a><a href="#recrutement">Recrutement</a><a href="#evenement">&Eacute;v&eacute;nement</a><a href="#partenaires">Partenaires</a><a href="#coordonnees">Coordonn&eacute;es</a></div></div>')
    # equipe
    s_team = ('<section class="sec tint" id="equipe"><div class="wrap split rev"><div class="media" data-reveal="left"><img src="assets/stock/team.jpg" alt=""></div>'
              '<div data-reveal="right"><span class="kicker">L&rsquo;&eacute;quipe</span><h2 class="stitle">Cr&eacute;&eacute;e par de jeunes ing&eacute;nieurs, pour l&rsquo;Europe, les &Eacute;tats-Unis et l&rsquo;Afrique</h2>'
              '<p class="slead">ROOTS est l&rsquo;une des toutes premi&egrave;res structures de service informatique disposant d&rsquo;un v&eacute;ritable r&eacute;seau de partenariat dans le monde. Notre exp&eacute;rience de la mise en &oelig;uvre informatique nous permet de formaliser vos probl&eacute;matiques et de proposer des solutions adapt&eacute;es et cr&eacute;atives.</p>'
              '<div class="vlist"><div class="vitem"><span class="vic">%s</span><div><h4>Les services</h4><p>Nous sommes des partenaires, capables de formaliser les probl&eacute;matiques d&rsquo;entreprise.</p></div></div>'
              '<div class="vitem"><span class="vic">%s</span><div><h4>La formation</h4><p>Un &eacute;l&eacute;ment essentiel du d&eacute;veloppement et de la notori&eacute;t&eacute; de votre entreprise : des offres formalis&eacute;es sur les logiciels et syst&egrave;mes standards ou sp&eacute;cifiques.</p></div></div></div></div></div></section>'
              % (svg(IC["gear"] if "gear" in IC else IC["wrench"]), svg(IC["cap"])))
    # services
    cards = "".join(card(i, t, tx, ex, (n % 3) * .1) for n, (i, t, tx, ex) in enumerate(SERVICES))
    s_serv = '<section class="sec mist" id="services"><div class="wrap">%s<div class="grid3 sfgrid">%s</div></div></section>' % (shead("Nos services", "Huit domaines d&rsquo;intervention, du document au r&eacute;seau"), cards)
    # formations
    rec = "".join(card("cap", t, tx, "", (n % 3) * .1) for n, (t, tx) in enumerate(FORM_RECENT))
    rows = "".join('<tr><td>%s</td><td>%s</td><td>%s</td></tr>' % (t, d or "Sur demande", p or "Sur demande") for t, d, p in FORM_CAT)
    s_form = ('<section class="sec grid" id="formations"><div class="wrap">%s<div class="grid3 sfgrid">%s</div>'
              '<h3 class="subt">Catalogue historique ROOTS</h3><p class="slead sfp">Les programmes ci dessous ont &eacute;t&eacute; publi&eacute;s sur roots.ws. Nous les actualisons et les adaptons sur demande.</p>'
              '<div class="ftabw"><table class="ftab"><thead><tr><th>Formation</th><th>Dur&eacute;e</th><th>Public cible</th></tr></thead><tbody>%s</tbody></table></div></div></section>'
              % (shead("Formations", "Formez vos &eacute;quipes aux logiciels et syst&egrave;mes que vous utilisez"), rec, rows))
    # produits
    pc = "".join(card(i, t, tx, tags(tg) + '<span class="sfdate">%s</span>' % dt, (n % 3) * .1) for n, (i, t, tx, tg, dt) in enumerate(PRODUITS))
    s_prod = '<section class="sec tint" id="produits"><div class="wrap">%s<div class="grid3 sfgrid">%s</div></div></section>' % (shead("Produits", "Les solutions que nous installons", "S&eacute;lection publi&eacute;e sur l&rsquo;ancien site entre janvier et mai 2022. Disponibilit&eacute; et prix sur devis."), pc)
    # recrutement
    jobs = "".join(job(*j) for j in JOBS)
    s_job = ('<section class="sec mist" id="recrutement"><div class="wrap">%s<div class="jobs">%s</div>'
             '<div class="priceline" data-reveal="up"><span class="pl">Candidature spontan&eacute;e bienvenue : informatique, comptabilit&eacute;, commercial.</span>'
             '<span>Choisissez l&rsquo;objet <b>Candidature</b> dans le <a href="contact.html#recrutement">formulaire de contact</a></span></div></div></section>'
             % (shead("Recrutement", "Rejoindre ROOTS", "Quatre postes publi&eacute;s sur l&rsquo;ancien site. Cliquez sur un poste pour lire les missions et le profil."), jobs))
    # evenement
    s_ev = ('<section class="sec grid" id="evenement"><div class="wrap">%s<div class="card tilt evc" data-reveal="up"><span class="cic">%s</span>'
            '<h3>Comp&eacute;tition de golf &laquo; ROOTS I &raquo;, samedi 29 novembre 2014 (matin et apr&egrave;s midi)</h3>'
            '<p>Les comp&eacute;titions ROOTS se d&eacute;roulaient en formule &eacute;clectique, en quatre ou cinq tours, alternativement les samedis et dimanches. Remise des prix en fin de saison 2014 2015, pour les trois meilleurs de chaque s&eacute;rie. Chaque tour comptait pour les changements d&rsquo;index.</p>'
            '<span class="sfdate">&Eacute;v&eacute;nement pass&eacute;, publi&eacute; le 28 novembre 2014</span></div></div></section>'
            % (shead("&Eacute;v&eacute;nement", "Quand ROOTS sort du bureau"), svg(IC["flag"])))
    # partenaires
    chips = "".join("<span>%s</span>" % p for p in ["SOPHOS", "SAP", "ODOO", "SAGE", "CYBEROAM", "MICROSOFT", "DELL", "ACRONIS", "GRANDSTREAM"])
    s_part = ('<section class="sec tint" id="partenaires"><div class="wrap">%s<div class="spot-tags sfchips" data-reveal="up">%s</div>'
              '<p class="slead sfp">Aujourd&rsquo;hui, notre r&eacute;seau compte 15 partenaires : <a href="partenaires.html"><strong>voir la liste compl&egrave;te</strong></a>.</p></div></section>'
              % (shead("Partenaires historiques", "Les marques qui nous accompagnent depuis longtemps"), chips))
    # coordonnees
    s_co = ('<section class="sec mist" id="coordonnees"><div class="wrap"><div class="cinfo sfco" data-reveal="up">'
            '<div class="ci"><span class="ic">%s</span><div><h4>ROOTS Technologies, Lom&eacute;</h4><p>Hountigom&eacute;, route de l&rsquo;A&eacute;roport, non loin de la pharmacie de l&rsquo;a&eacute;roport.</p></div></div>'
            '<div class="ci"><span class="ic">%s</span><div><h4>E-mail</h4><p>%s</p></div></div>'
            '<div class="ci"><span class="ic">%s</span><div><h4>T&eacute;l&eacute;phone</h4><p>%s</p></div></div>'
            '<div class="ci"><span class="ic">%s</span><div><h4>Notre devise</h4><p>Votre partenaire pour l&rsquo;Excellence !</p></div></div></div></div></section>'
            % (sp.ICON_PIN, sp.ICON_MAIL, sp.reveal_mail(), sp.ICON_TEL, sp.reveal_tel(), svg(IC["flag"])))
    cta = tpl[tpl.rindex('<section class="sec tint"><div class="wrap"><div class="ctaband"'):]
    cta = cta[:cta.index('</section>') + len('</section>')] + "\n"
    pre = tpl[:a]
    post = tpl[tpl.index('<section class="sec tint"><div class="wrap"><div class="ctaband"') if False else tpl.rindex('<section class="sec tint"><div class="wrap"><div class="ctaband"'):]
    page = pre + hero + anchors + s_team + s_serv + s_form + s_prod + s_job + s_ev + s_part + s_co + post
    page = re.sub(r'<title>.*?</title>', '<title>Savoir faire : services, formations, produits &middot; Roots &amp; Co</title>', page, count=1, flags=re.S)
    page = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="Tout ROOTS sur une page : services (archivage et GED, sauvegarde, sécurité, administration système, développement, web), catalogue de formations, produits et recrutement.">', page, count=1)
    page = re.sub(r'<meta property="og:[^>]*>|<meta name="twitter:card"[^>]*>', '', page)
    wr("savoir-faire.html", page)
    print("savoir-faire.html ecrit", len(page))

# ------------------------------------------------------------------ solaire
def build_solaire():
    tpl = rd("informatique.html")
    a = tpl.index('<section class="phero">'); b = tpl.index('</section>', a) + len('</section>')
    hero = ('<section class="phero"><div class="phero-bg"><img src="assets/stock/engineer.jpg" alt=""></div><div class="wrap">'
            '<div class="crumb"><a href="index.html">Accueil</a> %s <span>Énergie solaire</span></div>'
            '<span class="kicker">&Eacute;nergie solaire</span><h1>L&rsquo;&eacute;nergie solaire au service de votre activit&eacute;</h1>'
            '<p>Alimenter vos bureaux, vos serveurs, vos sites isol&eacute;s et votre vid&eacute;osurveillance avec une &eacute;nergie propre, continue et ma&icirc;tris&eacute;e, de l&rsquo;&eacute;tude &agrave; la maintenance.</p></div></section>'
            % svg('<path d="M9 6l6 6-6 6"/>'))
    cards = "".join([
        card("chart", "&Eacute;tude des besoins", "Relev&eacute; de votre consommation, des &eacute;quipements &agrave; alimenter et de l&rsquo;autonomie souhait&eacute;e, pour dimensionner l&rsquo;installation au plus juste."),
        card("sun", "Panneaux solaires", "Choix et pose de panneaux adapt&eacute;s &agrave; votre toiture ou &agrave; votre terrain, selon l&rsquo;ensoleillement du site.", d=.1),
        card("bolt", "Onduleurs et r&eacute;gulateurs", "Conversion et gestion de l&rsquo;&eacute;nergie produite pour alimenter vos &eacute;quipements en toute s&eacute;curit&eacute;.", d=.2),
        card("backup", "Stockage par batteries", "Batteries pour continuer &agrave; travailler la nuit et pendant les coupures du r&eacute;seau &eacute;lectrique.", d=0),
        card("server", "Alimentation de l&rsquo;informatique", "Serveurs, baies r&eacute;seau, postes de travail et onduleurs : la continuit&eacute; de votre syst&egrave;me d&rsquo;information.", d=.1),
        card("cam", "Sites isol&eacute;s et vid&eacute;osurveillance", "Cam&eacute;ras, alarmes et points d&rsquo;acc&egrave;s r&eacute;seau aliment&eacute;s l&agrave; o&ugrave; le r&eacute;seau &eacute;lectrique n&rsquo;arrive pas.", d=.2),
    ])
    s1 = '<section class="sec tint"><div class="wrap">%s<div class="grid3">%s</div></div></section>' % (shead("Nos solutions", "Six briques pour une installation compl&egrave;te"), cards)
    steps = ('<div class="steps4">'
             + "".join('<div class="stp" data-reveal="up"><b>%d</b><h4>%s</h4><p>%s</p></div>' % (n, t, x) for n, (t, x) in enumerate([
                 ("&Eacute;tude", "Visite du site et analyse de vos besoins."),
                 ("Devis", "Proposition d&eacute;taill&eacute;e : mat&eacute;riel, prestation, d&eacute;lai, garantie."),
                 ("Installation", "Pose, raccordement et mise en service par nos &eacute;quipes."),
                 ("Suivi", "Maintenance et assistance depuis Lom&eacute; et Cotonou.")], 1)) + '</div>')
    s2 = '<section class="sec mist"><div class="wrap">%s%s</div></section>' % (shead("Comment nous travaillons", "Quatre &eacute;tapes, un seul interlocuteur"), steps)
    s3 = ('<section class="sec grid"><div class="wrap"><div class="spot srv" data-reveal="zoom"><div class="spot-in"><div class="spot-visual"><img src="assets/stock/datacenter.jpg" alt=""></div>'
          '<div><span class="spot-badge">Informatique et &eacute;nergie</span><h2>Une seule &eacute;quipe pour l&rsquo;informatique et l&rsquo;&eacute;nergie</h2>'
          '<p>Les m&ecirc;mes &eacute;quipes qui installent vos serveurs, votre r&eacute;seau et votre vid&eacute;osurveillance dimensionnent l&rsquo;alimentation qui les fait fonctionner.</p>'
          '<div class="spot-tags"><span>Serveurs</span><span>R&eacute;seau</span><span>Vid&eacute;osurveillance</span><span>Maintenance</span></div>'
          '<a href="contact.html" class="btn btn-primary">Demander une &eacute;tude solaire</a></div></div></div></div></section>')
    post = tpl[tpl.rindex('<section class="sec tint"><div class="wrap"><div class="ctaband"'):]
    page = tpl[:a] + hero + s1 + s2 + s3 + post
    page = re.sub(r'<title>.*?</title>', '<title>&Eacute;nergie solaire &middot; Roots &amp; Co</title>', page, count=1, flags=re.S)
    page = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="Solutions solaires Roots and Co : étude, panneaux, onduleurs, batteries, installation et maintenance pour entreprises et institutions.">', page, count=1)
    page = re.sub(r'<meta property="og:[^>]*>|<meta name="twitter:card"[^>]*>', '', page)
    wr("solaire.html", page)
    print("solaire.html ecrit")

if __name__ == "__main__":
    build_savoir_faire()
    build_solaire()
