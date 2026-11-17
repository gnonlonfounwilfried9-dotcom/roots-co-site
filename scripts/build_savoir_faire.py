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

# ------------------------------------------------------------------ contenu (v2 du 17/11/2026 : compact, sans tableau)
SERVICES = [
 ("archive", "Archivage et GED", "Pour les entreprises et organisations du secteur public et privé : passer d'un système papier à une gestion électronique des documents performante.",
  ["Archivage physique : classement selon un plan directeur, accès depuis un logiciel développé selon vos besoins",
   "Dématérialisation : logiciels dédiés et scanners de production",
   "GEDLOOK, la solution GED développée par ROOTS : courrier, workflow documentaire, numérisation des fonds, archives électroniques"]),
 ("backup", "Sauvegarde", "Dupliquer et mettre en sécurité les données de votre système informatique, à ne pas confondre avec l'enregistrement ni avec l'archivage.",
  ["Équipements de sauvegarde adaptés à vos volumes", "Formations Acronis et EVault disponibles"]),
 ("shield", "Sécurité informatique", "Les moyens techniques, organisationnels, juridiques et humains pour empêcher l'usage non autorisé, la modification ou le détournement du système d'information.",
  ["Objectif : maintenir la confiance des utilisateurs et des clients", "Référentiel ISO/CEI 27001 : disponibilité, intégrité, confidentialité", "Pare feu Sophos, formation RSSI"]),
 ("server", "Administration système", "Notre expertise pour l'administration de vos serveurs et de leurs systèmes.",
  ["Déploiement des services Internet et Intranet", "Développement et administration de bases de données"]),
 ("wrench", "Maintenance et réseaux", "Une assurance de performance pour votre système informatique.",
  ["Services de maintenance", "Mise en place et configuration du réseau informatique de l'entreprise"]),
 ("code", "Développement de logiciels", "Conception de logiciels pour votre entreprise ou votre organisation, avec une expérience avérée dans le domaine.",
  ["Logiciels de gestion adaptés à vos besoins", "ERP et progiciels"]),
 ("globe", "Sites web", "ROOTS conduit des projets web et conçoit des sites internet pour les entreprises, les organisations et les particuliers.",
  ["Réalisations : Centre de Formalités des Entreprises (CFE), Le PATIO Lomé, Agetur Togo"]),
 ("chart", "ERP Odoo", "Installation et paramétrage d'Odoo, avec les modules RH et comptabilité, et formation des équipes.",
  ["Gestion optimisée d'entreprise", "Formation Odoo au catalogue"]),
]

# (catégorie, titre, durée, public, historique)
FORM = [
 ("Systèmes", "Windows Server et Active Directory", "", "Administrateurs système et membres de l'équipe de support", False),
 ("Bureautique", "Microsoft Office", "", "Utilisateurs et équipes administratives", False),
 ("Sécurité", "Devenir Responsable de la Sécurité du Système d'Information", "6 j", "Responsables ou directeurs informatique, RSSI opérationnels, dirigeants et cadres", False),
 ("Sécurité", "UTM Sophos : pare feu et sécurité réseau", "", "Administrateurs réseau et sécurité", False),
 ("Sauvegarde", "Acronis : administration de la sauvegarde", "", "Administrateurs système", False),
 ("Sauvegarde", "EVault : sauvegarde", "", "Administrateurs système", False),
 ("ERP et web", "Odoo : ERP, modules RH et comptabilité", "", "Utilisateurs, comptables, responsables de gestion", False),
 ("ERP et web", "Drupal, niveau débutant", "", "Futurs administrateurs de sites web", False),
 ("Messagerie", "Concevoir et déployer une solution de messagerie Exchange Server 2010", "5 j", "Administrateurs, chefs de projet, responsables du déploiement", True),
 ("Messagerie", "Configurer, gérer et dépanner Exchange Server 2010 (MS490)", "5 j", "Administrateurs Exchange Server 2003 ou 2007", True),
 ("Messagerie", "Actualiser ses compétences d'administrateur vers Exchange Server 2010", "5 j", "Administrateurs souhaitant migrer vers la version 2010", True),
 ("Systèmes", "Configurer, gérer et maintenir des serveurs Windows Server 2008 R2", "5 j", "Administrateurs système, équipe de support", True),
 ("Systèmes", "Concevoir une infrastructure réseau Windows Server 2008", "5 j", "Architectes chargés d'optimiser des réseaux Windows", True),
 ("Systèmes", "Mettre à jour ses compétences d'infrastructure réseau et Active Directory vers Windows Server 2008", "5 j", "Administrateurs Windows Server 2000 ou 2003, certifiés MCSA ou MCSE", True),
 ("Systèmes", "Concevoir une infrastructure d'annuaire avec Active Directory", "5 j", "Architectes systèmes et réseaux", True),
 ("Systèmes", "Configurer, gérer et dépanner les services de domaines Active Directory", "5 j", "Spécialistes Active Directory, administrateurs système", True),
 ("Systèmes", "Gestion et maintenance des serveurs Active Directory", "2 j", "Administrateurs souhaitant évoluer vers Active Directory", True),
 ("Poste de travail", "Installer et configurer des clients Windows 7", "3 j", "Toute personne assurant le support de Windows 7", True),
 ("Poste de travail", "Planifier et gérer le déploiement de postes de travail Windows 7", "5 j", "Responsables de déploiements", True),
 ("Poste de travail", "Dépannage et support de Windows 7", "3 j", "Techniciens de support", True),
 ("Poste de travail", "Du poste Windows XP vers Windows 7 : mise à jour des compétences d'administrateur", "3 j", "Techniciens de support expérimentés sur Windows XP ou Vista", True),
]

PRODUITS = [  # catégorie, titre, texte, marque
 ("Sécurité", "shield", "Sophos XG Firewall", "Pare feu intelligent, administré depuis Sophos Central.", "Sophos"),
 ("Réseau", "net", "Sophos Switch", "Accès Ethernet sécurisé et évolutif, filaire et sans fil.", "Sophos"),
 ("Réseau", "wifi", "Wi-Fi 6 Planet WDAP-C1800", "802.11ax double bande : 1200 Mbps en 5 GHz, 600 Mbps en 2,4 GHz.", "Planet"),
 ("Réseau", "wifi", "LAN sans fil Planet", "Contrôleur, points d'accès intérieurs et extérieurs, large couverture.", "Planet"),
 ("Réseau", "net", "Firewall MikroTik CCR1009", "Rack 1U, 7 ports Gigabit, 9 cœurs, double alimentation.", "MikroTik"),
 ("Sauvegarde", "backup", "Équipements de sauvegarde", "Le stockage adapté à vos volumes de données.", "Acronis"),
 ("Vidéosurveillance", "cam", "Caméras Dahua", "Un leader mondial de la vidéosurveillance.", "Dahua"),
 ("Serveurs", "server", "Dell PowerEdge R340", "Rack, Xeon E-2200 de 4 à 8 cœurs, iDRAC.", "Dell"),
 ("Serveurs", "server", "Dell PowerEdge T40", "Serveur d'entrée de gamme, Xeon E-2224G, 8 Go ECC.", "Dell"),
 ("Postes et écrans", "screen", "Dell Vostro 3888", "PC de bureau compact pour les entreprises.", "Dell"),
 ("Postes et écrans", "screen", "Écrans Dell E2420H et E1916HV", "24 pouces Full HD et 18,5 pouces, réglables.", "Dell"),
]

JOBS = [
 ("Développeur d'application", "PHP, JavaScript, Python, Java, Flutter, MySQL, PostgreSQL", "Bac+2 informatique, 2 ans d'expérience"),
 ("Expert ERP, comptable", "Odoo, Microsoft Dynamics, SAP pour la comptabilité", "Bac+2 à Bac+5, 2 ans d'expérience"),
 ("Technicien réseaux informatique", "Installation, maintenance, sécurité, support utilisateurs", "Licence en réseaux, 2 ans d'expérience"),
 ("Commercial", "Développement de la clientèle", "Profil communiqué aux candidats"),
]


def chips(items, cls="sfchip", first_all=True):
    out = '<button type="button" class="%s on" data-f="*">Tout</button>' % cls if first_all else ""
    return out + "".join('<button type="button" class="%s" data-f="%s">%s</button>' % (cls, i, i) for i in items)


def build_savoir_faire():
    tpl = rd("informatique.html")
    a = tpl.index('<section class="phero">'); b = tpl.index('</section>', a) + len('</section>')
    # 1. entete : meme famille que Références (chiffres a droite, pas de photo)
    hero = ('<section class="sec sfh"><div class="wrap"><div class="sfh-t"><span class="kicker">Savoir faire</span>'
            '<h1 class="stitle">Services, formations et produits</h1>'
            '<p class="slead">Ce que nous faisons, ce que nous enseignons et ce que nous installons, depuis 2002. Votre partenaire pour l&rsquo;Excellence !</p>'
            '<div class="sf-jump"><a href="#services">Services</a><a href="#formations">Formations</a><a href="#produits">Produits</a><a href="#recrutement">Recrutement</a><a href="#coordonnees">Coordonn&eacute;es</a></div></div>'
            '<div class="sfh-f"><div><strong>24</strong><span>ans d&rsquo;expertise</span></div><div><strong>8</strong><span>services</span></div>'
            '<div><strong>15</strong><span>partenaires</span></div><div><strong>4</strong><span>implantations</span></div></div></div></div></section>')
    # 2. services : liste a gauche, detail a droite (hauteur fixe)
    tabs = "".join('<button type="button" class="sfx-t%s" data-i="%d"><span class="sfx-i">%s</span><b>%s</b></button>' % (" on" if n == 0 else "", n, svg(IC[i]), t)
                   for n, (i, t, x, bl) in enumerate(SERVICES))
    panes = "".join('<div class="sfx-p%s" data-i="%d"><h3>%s</h3><p>%s</p>%s<a class="btn btn-primary" href="contact.html">Demander ce service</a></div>'
                    % (" on" if n == 0 else "", n, t, x, bullets(bl)) for n, (i, t, x, bl) in enumerate(SERVICES))
    s_serv = ('<section class="sec tint" id="services"><div class="wrap"><div class="sf-h"><span class="kicker">Services</span><h2 class="stitle">Huit services, un seul interlocuteur</h2></div>'
              '<div class="sfx"><div class="sfx-l">%s</div><div class="sfx-v">%s</div></div></div></section>') % (tabs, panes)
    # 3. formations : a la une + catalogue filtrable
    cats = []
    for c, *_ in FORM:
        if c not in cats: cats.append(c)
    une = [f for f in FORM if not f[4]][:6]
    une_html = "".join('<div class="sfu"><span class="sfu-c">%s</span><b>%s</b>%s</div>' % (c, t, '<em>%s</em>' % d if d else '') for c, t, d, p, h in une)
    cards = "".join(
        '<article class="sfc%s" data-c="%s"><div class="sfc-t"><span>%s</span>%s</div><h4>%s</h4><p><i>Public</i>%s</p></article>'
        % (" hist" if h else "", c, c, '<em>%s</em>' % d if d else '<em class="dm">Sur demande</em>', t, p) for c, t, d, p, h in FORM)
    s_form = ('<section class="sec grid" id="formations"><div class="wrap"><div class="sf-h"><span class="kicker">Formations</span><h2 class="stitle">Former vos &eacute;quipes</h2>'
              '<p class="slead">Du syst&egrave;me &agrave; la s&eacute;curit&eacute; et &agrave; l&rsquo;ERP : choisissez un th&egrave;me, nous adaptons le programme &agrave; votre &eacute;quipe.</p></div>'
              '<div class="sf-bar"><div class="sfchips" data-t="sfc">%s</div><span class="sf-count" id="sfCount"></span></div>'
              '<div class="sfcg" id="sfc">%s</div><button type="button" class="btn btn-line sf-more" id="sfMore">Voir tout le catalogue</button></div></section>'
              % (chips(cats), cards))
    # 4. produits
    pcats = []
    for c, *_ in PRODUITS:
        if c not in pcats: pcats.append(c)
    pcards = "".join('<article class="sfp2" data-c="%s"><span class="sfp2-i">%s</span><div><h4>%s</h4><p>%s</p><span class="sfp2-b">%s</span></div></article>'
                     % (c, svg(IC[i]), t, x, m) for c, i, t, x, m in PRODUITS)
    s_prod = ('<section class="sec tint" id="produits"><div class="wrap"><div class="sf-h"><span class="kicker">Produits</span><h2 class="stitle">Ce que nous installons</h2>'
              '<p class="slead">S&eacute;curit&eacute;, r&eacute;seau, sauvegarde, vid&eacute;osurveillance, serveurs et postes. Disponibilit&eacute; et prix sur devis.</p></div>'
              '<div class="sf-bar"><div class="sfchips" data-t="sfpg">%s</div></div><div class="sfpg" id="sfpg">%s</div></div></section>') % (chips(pcats), pcards)
    # 5. recrutement : 4 postes en ligne, sans formulaire ni candidature spontanee
    jobs = "".join('<div class="sfj"><span class="sfj-i">%s</span><h4>%s</h4><p>%s</p><small>%s</small><a href="contact.html#recrutement">Postuler</a></div>'
                   % (svg(IC["user"]), t, x, y) for t, x, y in JOBS)
    s_job = ('<section class="sec mist" id="recrutement"><div class="wrap"><div class="sf-h"><span class="kicker">Recrutement</span><h2 class="stitle">Postes &agrave; pourvoir</h2></div>'
             '<div class="sfjg">%s</div></div></section>') % jobs
    # 6. partenaires historiques + coordonnees, sur une seule bande
    chips2 = "".join("<span>%s</span>" % p for p in ["Sophos", "SAP", "Odoo", "Sage", "Cyberoam", "Microsoft", "Dell", "Acronis", "Grandstream"])
    s_co = ('<section class="sec grid" id="coordonnees"><div class="wrap"><div class="sfend">'
            '<div><span class="kicker">Partenaires historiques</span><div class="spot-tags sfchips2">%s</div>'
            '<p class="sfp">Notre r&eacute;seau compte aujourd&rsquo;hui 15 partenaires : <a href="partenaires.html"><strong>voir la liste</strong></a>.</p></div>'
            '<div class="cinfo sfco2"><div class="ci"><span class="ic">%s</span><div><h4>Lom&eacute;</h4><p>Hountigom&eacute;, route de l&rsquo;A&eacute;roport, non loin de la pharmacie de l&rsquo;a&eacute;roport.</p></div></div>'
            '<div class="ci"><span class="ic">%s</span><div><h4>E-mail</h4><p>%s</p></div></div>'
            '<div class="ci"><span class="ic">%s</span><div><h4>T&eacute;l&eacute;phone</h4><p>%s</p></div></div></div></div></div></section>'
            % (chips2, sp.ICON_PIN, sp.ICON_MAIL, sp.reveal_mail(), sp.ICON_TEL, sp.reveal_tel()))
    post = tpl[tpl.rindex('<section class="sec tint"><div class="wrap"><div class="ctaband"'):]
    tpl = tpl.replace('<body>', '<body class="nohero">', 1)
    a = tpl.index('<section class="phero">'); b = tpl.index('</section>', a) + len('</section>')
    page = tpl[:a] + hero + s_serv + s_form + s_prod + s_job + s_co + post
    page = page.replace('<script src="assets/inner.js', '<script src="assets/sf.js"></script><script src="assets/inner.js', 1)
    page = re.sub(r'<title>.*?</title>', '<title>Savoir faire : services, formations, produits &middot; Roots &amp; Co</title>', page, count=1, flags=re.S)
    page = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="Tout ROOTS : services (archivage et GED, sauvegarde, sécurité, administration système, développement, web), formations, produits et recrutement.">', page, count=1)
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
