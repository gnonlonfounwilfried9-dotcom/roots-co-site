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
 "printer": '<path d="M7 9V3h10v6"/><rect x="4" y="9" width="16" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
 "phone": '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
 "box": '<path d="M21 8 12 3 3 8l9 5Z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>',
 "erp": '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
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

# ------------------------------------------------------------------ contenu (v3 du 17/11/2026 : large, anime, sans recrutement)
# (icone, titre, texte, puces, [puces associees], vignette)
SERVICES = [
 ("archive", "Archivage et GED", "Pour les entreprises et organisations du secteur public et privé : passer d'un système papier à une gestion électronique des documents performante.",
  ["Archivage physique : classement selon un plan directeur, accès depuis un logiciel développé selon vos besoins",
   "Dématérialisation : logiciels dédiés et scanners de production",
   "GEDLOOK, la solution GED développée par ROOTS : courrier, workflow documentaire, numérisation des fonds, archives électroniques"],
  ["GEDLOOK", "Scanners", "Workflow"], "archive"),
 ("backup", "Sauvegarde", "Dupliquer et mettre en sécurité les données de votre système informatique, à ne pas confondre avec l'enregistrement ni avec l'archivage.",
  ["Équipements et solutions de sauvegarde adaptés à vos volumes", "Restauration testée, sauvegarde locale et distante"],
  ["Acronis", "Synology", "NAS"], "backup"),
 ("shield", "Sécurité informatique", "Les moyens techniques, organisationnels, juridiques et humains pour empêcher l'usage non autorisé, la modification ou le détournement du système d'information.",
  ["Objectif : maintenir la confiance des utilisateurs et des clients", "Référentiel ISO/CEI 27001 : disponibilité, intégrité, confidentialité", "Pare feu nouvelle génération, protection des postes, accès distants"],
  ["Sophos", "Fortinet", "ISO 27001"], "shield"),
 ("server", "Administration système", "Notre expertise pour l'administration de vos serveurs et de leurs systèmes.",
  ["Déploiement des services Internet et Intranet", "Développement et administration de bases de données"],
  ["Windows Server", "Linux", "Bases de données"], "admin"),
 ("wrench", "Maintenance et réseaux", "Une assurance de performance pour votre système informatique, du poste de travail au réseau de l'entreprise.",
  ["Services de maintenance", "Mise en place et configuration du réseau informatique, filaire et Wi-Fi"],
  ["Wi-Fi", "Câblage", "Interconnexion"], "network"),
 ("code", "Développement de logiciels", "Conception de logiciels pour votre entreprise ou votre organisation, avec une expérience avérée dans le domaine.",
  ["Logiciels de gestion adaptés à vos besoins", "ERP et progiciels"],
  ["Sur mesure", "ERP", "Intégration"], "code"),
 ("globe", "Sites web", "ROOTS conduit des projets web et conçoit des sites internet pour les entreprises, les organisations et les particuliers.",
  ["Réalisations : Centre de Formalités des Entreprises (CFE), Le PATIO Lomé, Agetur Togo"],
  ["Vitrine", "Institutionnel", "Boutique"], "web"),
 ("chart", "ERP Odoo", "Installation et paramétrage d'Odoo, avec les modules RH et comptabilité, et formation des équipes.",
  ["Gestion optimisée d'entreprise", "Reprise de données, personnalisation, support"],
  ["Odoo", "RH", "Comptabilité"], "erp"),
]

# (catégorie, titre, durée, public, historique)
FORM = [
 ("Systèmes", "Windows Server et Active Directory", "", "Administrateurs système et membres de l'équipe de support", False),
 ("Bureautique", "Microsoft Office", "", "Utilisateurs et équipes administratives", False),
 ("Sécurité", "Devenir Responsable de la Sécurité du Système d'Information", "6 j", "Responsables ou directeurs informatique, RSSI opérationnels, dirigeants et cadres", False),
 ("Sécurité", "Sophos : pare feu et sécurité réseau", "", "Administrateurs réseau et sécurité", False),
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

# Familles de produits : TOUT le catalogue ROOTS, toutes gammes, toutes marques (pas des modèles isolés)
FAMILLES = [  # icone, titre, texte, marques, badge
 ("screen", "Ordinateurs et postes de travail", "Postes fixes, portables et stations, de toutes les gammes, pour entreprises, administrations et écoles.", ["Dell", "HP", "Lenovo"], ""),
 ("server", "Serveurs", "Serveurs rack, tour et lame, de l'entrée de gamme au grand compte, installés, configurés et renouvelés sous garantie.", ["Dell", "HP"], ""),
 ("printer", "Imprimantes et photocopieurs", "Imprimantes, multifonctions et copieurs de toutes marques, consommables et infogérance du parc.", ["Toutes marques"], ""),
 ("wifi", "Wi-Fi et réseaux", "Tous les types de réseaux : Wi-Fi d'entreprise intérieur et extérieur, contrôleurs, routeurs, commutateurs, liaisons entre sites.", ["Ubiquiti", "Huawei", "Fortinet"], ""),
 ("shield", "Cybersécurité", "Pare feu nouvelle génération, UTM, protection des postes, VPN, filtrage et supervision. Sophos est une expertise de l'équipe.", ["Sophos", "Fortinet"], "Expertise"),
 ("backup", "Sauvegarde et stockage", "Sauvegarde, restauration, archivage et stockage réseau pour protéger vos données.", ["Acronis", "Synology"], ""),
 ("cam", "Vidéosurveillance et alarmes", "Caméras IP, enregistreurs, contrôle d'accès et alarmes intrusion, pour tous types de sites.", ["Hikvision", "Axis"], ""),
 ("bolt", "Énergie et continuité", "Onduleurs, batteries et solutions solaires pour que votre activité ne s'arrête jamais.", ["APC", "Solaire"], ""),
 ("erp", "Logiciels et ERP", "Licences, messagerie, ERP et progiciels : Microsoft, Odoo, SAP, avec paramétrage et formation.", ["Microsoft", "Odoo", "SAP"], ""),
 ("phone", "Téléphonie et télécoms", "Téléphonie IP, interphonie et équipements de télécommunication.", ["Huawei"], ""),
 ("screen", "Écrans et périphériques", "Écrans, vidéoprojecteurs, claviers, souris et accessoires pour équiper chaque poste.", ["Toutes marques"], ""),
 ("box", "Matériel sur demande", "Un produit qui n'est pas dans cette liste ? Nos réseaux d'achat en Europe et aux États-Unis le trouvent, sur cahier des charges.", ["Sourcing"], ""),
]

PARTENAIRES = [("dell", "Dell", "partenaire-dell.html"), ("hp", "HP", "partenaire-hp.html"), ("lenovo", "Lenovo", "partenaires.html"), ("microsoft", "Microsoft", "partenaire-microsoft.html"),
               ("sap", "SAP", "partenaire-sap.html"), ("odoo", "Odoo", "partenaire-odoo.html"), ("fortinet", "Fortinet", "partenaire-fortinet.html"), ("sophos", "Sophos", "partenaire-sophos.html"),
               ("acronis", "Acronis", "partenaire-acronis.html"), ("synology", "Synology", "partenaire-synology.html"), ("huawei", "Huawei", "partenaire-huawei.html"),
               ("ubiquiti", "Ubiquiti", "partenaire-ubiquiti.html"), ("apc", "APC", "partenaire-apc.html"), ("axis", "Axis", "partenaire-axis.html"), ("hikvision", "Hikvision", "partenaire-hikvision.html")]


def chips(items, cls="sfchip", first_all=True):
    out = '<button type="button" class="%s on" data-f="*">Tout</button>' % cls if first_all else ""
    return out + "".join('<button type="button" class="%s" data-f="%s">%s</button>' % (cls, i, i) for i in items)


def vignette(name):
    return '<div class="vg vg-%s" aria-hidden="true">%s</div>' % (name, VG[name])

# vignettes animees (CSS dans fx4.css) : une scene par service
VG = {
 "archive": '<svg viewBox="0 0 220 170"><rect class="vg-fold" x="62" y="96" width="96" height="56" rx="8"/><rect class="vg-pg p1" x="78" y="28" width="64" height="80" rx="5"/><rect class="vg-pg p2" x="78" y="28" width="64" height="80" rx="5"/><rect class="vg-pg p3" x="78" y="28" width="64" height="80" rx="5"/><path class="vg-fl" d="M62 104h96v48a8 8 0 0 1-8 8H70a8 8 0 0 1-8-8z"/><rect class="vg-scan" x="30" y="30" width="160" height="4" rx="2"/></svg>',
 "backup": '<svg viewBox="0 0 220 170"><g class="vg-db a"><ellipse cx="52" cy="50" rx="32" ry="11"/><path d="M20 50v54c0 6 14 11 32 11s32-5 32-11V50"/><ellipse cx="52" cy="77" rx="32" ry="11"/></g><g class="vg-db b"><ellipse cx="168" cy="50" rx="32" ry="11"/><path d="M136 50v54c0 6 14 11 32 11s32-5 32-11V50"/><ellipse cx="168" cy="77" rx="32" ry="11"/></g><path class="vg-flow" d="M88 78h44"/><path class="vg-flow f2" d="M132 96H88"/><circle class="vg-ok" cx="110" cy="134" r="14"/><path class="vg-okp" d="m103 134 5 5 10-11"/></svg>',
 "shield": '<svg viewBox="0 0 220 170"><circle class="vg-ring r1" cx="110" cy="84" r="46"/><circle class="vg-ring r2" cx="110" cy="84" r="46"/><path class="vg-sh" d="M110 34l44 16v32c0 24-18 42-44 52-26-10-44-28-44-52V50z"/><path class="vg-okp" d="m92 86 14 14 26-28"/><rect class="vg-beam" x="40" y="30" width="140" height="6" rx="3"/></svg>',
 "admin": '<svg viewBox="0 0 220 170"><g class="vg-rack"><rect x="48" y="22" width="124" height="34" rx="6"/><rect x="48" y="64" width="124" height="34" rx="6"/><rect x="48" y="106" width="124" height="34" rx="6"/></g><circle class="vg-led l1" cx="66" cy="39" r="4"/><circle class="vg-led l2" cx="80" cy="39" r="4"/><circle class="vg-led l3" cx="66" cy="81" r="4"/><circle class="vg-led l4" cx="80" cy="81" r="4"/><circle class="vg-led l5" cx="66" cy="123" r="4"/><circle class="vg-led l6" cx="80" cy="123" r="4"/><rect class="vg-bar b1" x="104" y="35" width="56" height="8" rx="4"/><rect class="vg-bar b2" x="104" y="77" width="56" height="8" rx="4"/><rect class="vg-bar b3" x="104" y="119" width="56" height="8" rx="4"/></svg>',
 "network": '<svg viewBox="0 0 220 170"><path class="vg-ln" d="M110 30L40 124M110 30l70 94M40 124h140"/><circle class="vg-nd" cx="110" cy="30" r="14"/><circle class="vg-nd" cx="40" cy="124" r="14"/><circle class="vg-nd" cx="180" cy="124" r="14"/><circle class="vg-pk" r="5"><animateMotion dur="3s" repeatCount="indefinite" path="M110 30L40 124"/></circle><circle class="vg-pk" r="5"><animateMotion dur="3.6s" repeatCount="indefinite" path="M40 124h140"/></circle><circle class="vg-pk" r="5"><animateMotion dur="3.2s" repeatCount="indefinite" path="M180 124L110 30"/></circle></svg>',
 "code": '<svg viewBox="0 0 220 170"><rect class="vg-win" x="24" y="20" width="172" height="130" rx="10"/><circle class="vg-dt" cx="40" cy="36" r="4"/><circle class="vg-dt" cx="54" cy="36" r="4"/><circle class="vg-dt" cx="68" cy="36" r="4"/><rect class="vg-cl c1" x="40" y="58" width="90" height="8" rx="4"/><rect class="vg-cl c2" x="54" y="76" width="110" height="8" rx="4"/><rect class="vg-cl c3" x="54" y="94" width="70" height="8" rx="4"/><rect class="vg-cl c4" x="40" y="112" width="120" height="8" rx="4"/><rect class="vg-cur" x="40" y="128" width="8" height="12" rx="2"/></svg>',
 "web": '<svg viewBox="0 0 220 170"><rect class="vg-win" x="22" y="18" width="176" height="134" rx="10"/><rect class="vg-bn" x="22" y="18" width="176" height="24" rx="10"/><circle class="vg-dt" cx="38" cy="30" r="4"/><circle class="vg-dt" cx="52" cy="30" r="4"/><rect class="vg-bk k1" x="36" y="54" width="148" height="30" rx="6"/><rect class="vg-bk k2" x="36" y="94" width="68" height="46" rx="6"/><rect class="vg-bk k3" x="114" y="94" width="70" height="46" rx="6"/><path class="vg-cs" d="M150 70l4 20 6-8 8 6z"/></svg>',
 "erp": '<svg viewBox="0 0 220 170"><rect class="vg-md m1" x="30" y="24" width="68" height="52" rx="10"/><rect class="vg-md m2" x="122" y="24" width="68" height="52" rx="10"/><rect class="vg-md m3" x="30" y="94" width="68" height="52" rx="10"/><rect class="vg-md m4" x="122" y="94" width="68" height="52" rx="10"/><rect class="vg-gb g1" x="138" y="112" width="8" height="22" rx="2"/><rect class="vg-gb g2" x="154" y="104" width="8" height="30" rx="2"/><rect class="vg-gb g3" x="170" y="96" width="8" height="38" rx="2"/><circle class="vg-hub" cx="110" cy="85" r="12"/></svg>',
}


def build_savoir_faire():
    tpl = rd("informatique.html")
    tpl = tpl.replace('<body>', '<body>', 1)
    a = tpl.index('<section class="phero">'); b = tpl.index('</section>', a) + len('</section>')
    # 1. entete : meme famille que les autres pages, animation propre (calques 3D)
    hero = ('<section class="phero sf-compact"><div class="phero-bg"><img src="assets/stock/circuit.jpg" alt=""></div><div class="wrap">'
            '<div class="crumb"><a href="index.html">Accueil</a> %s <span>Savoir faire</span></div><span class="kicker">Savoir faire</span>'
            '<h1>Services, formations et produits</h1>'
            '<p>Tout ce que nous faisons, ce que nous enseignons et ce que nous installons, toutes gammes et toutes marques. Votre partenaire pour l&rsquo;Excellence !</p></div></section>'
            '<section class="sf-stats"><div class="wrap" data-counters><div class="sfs" data-fx="zoom"><b><span class="ct" data-count="24">0</span><em>+</em></b><span>ans d&rsquo;expertise</span></div>'
            '<div class="sfs" data-fx="zoom"><b><span class="ct" data-count="8">0</span></b><span>services</span></div>'
            '<div class="sfs" data-fx="zoom"><b><span class="ct" data-count="15">0</span></b><span>marques partenaires</span></div>'
            '<div class="sfs" data-fx="zoom"><b><span class="ct" data-count="4">0</span></b><span>implantations</span></div></div></section>' % svg('<path d="M9 6l6 6-6 6"/>'))
    # 2. services : liste a gauche avec pastille mobile, detail a droite avec vignette animee
    tabs = "".join('<button type="button" class="sfx-t%s" data-i="%d"><span class="sfx-i">%s</span><b>%s</b></button>' % (" on" if n == 0 else "", n, svg(IC[s[0]]), s[1])
                   for n, s in enumerate(SERVICES))
    panes = ""
    for n, (i, t, x, bl, rel, vg) in enumerate(SERVICES):
        relh = "".join("<span>%s</span>" % r for r in rel)
        panes += ('<div class="sfx-p%s" data-i="%d"><div class="sfx-txt"><h3>%s</h3><p>%s</p>%s<div class="sfx-rel">%s</div>'
                  '<a class="btn btn-primary" href="contact.html">Demander ce service</a></div><div class="sfx-vis">%s</div></div>'
                  % (" on" if n == 0 else "", n, t, x, bullets(bl), relh, vignette(vg)))
    s_serv = ('<section class="sec tint aur" id="services"><div class="wrap"><div class="sf-h" data-fx="rise"><span class="kicker">Services</span><h2 class="stitle">Huit services, un seul interlocuteur</h2></div>'
              '<div class="sfx" data-fx="depth"><div class="sfx-l"><i class="sfx-hl"></i>%s</div><div class="sfx-v">%s</div></div></div></section>') % (tabs, panes)
    # 3. formations : catalogue filtrable
    cats = []
    for c, *_ in FORM:
        if c not in cats: cats.append(c)
    cards = "".join(
        '<article class="sfc%s" data-c="%s"><div class="sfc-t"><span>%s</span>%s</div><h4>%s</h4><p><i>Public</i>%s</p></article>'
        % (" hist" if h else "", c, c, '<em>%s</em>' % d if d else '<em class="dm">Sur demande</em>', t, p) for c, t, d, p, h in FORM)
    s_form = ('<section class="sec grid aur" id="formations"><div class="wrap"><div class="sf-h" data-fx="rise"><span class="kicker">Formations</span><h2 class="stitle">Former vos &eacute;quipes</h2>'
              '<p class="slead">Du syst&egrave;me &agrave; la s&eacute;curit&eacute; et &agrave; l&rsquo;ERP : choisissez un th&egrave;me, nous adaptons le programme &agrave; votre &eacute;quipe. <a href="formations.html"><strong>Voir la page Formations</strong></a></p></div>'
              '<div class="sf-bar"><div class="sfchips" data-t="sfc">%s</div><span class="sf-count" id="sfCount"></span></div>'
              '<div class="sfcg" id="sfc">%s</div><button type="button" class="btn btn-line sf-more" id="sfMore">Voir tout le catalogue</button></div></section>'
              % (chips(cats), cards))
    # 4. ce que nous installons : familles, toutes marques
    fam = ""
    for n, (i, t, x, br, bd) in enumerate(FAMILLES):
        brh = "".join("<span>%s</span>" % m for m in br)
        fam += ('<article class="sff%s" data-fx="%s" style="--d:%.2fs"><span class="sff-i">%s</span>%s<h4>%s</h4><p>%s</p><div class="sff-b">%s</div></article>'
                % (" ex" if bd else "", ("zoom", "flip", "rise")[n % 3], (n % 4) * .07, svg(IC[i]), '<em class="sff-x">%s</em>' % bd if bd else "", t, x, brh))
    s_prod = ('<section class="sec tint aur" id="produits"><div class="wrap"><div class="sf-h" data-fx="rise"><span class="kicker">Produits</span><h2 class="stitle">Ce que nous installons</h2>'
              '<p class="slead">Toute l&rsquo;informatique et l&rsquo;&eacute;nergie d&rsquo;une organisation, toutes gammes et toutes marques. Disponibilit&eacute; et prix sur devis.</p></div>'
              '<div class="sffg">%s</div></div></section>') % fam
    # 5. partenaires (liste complete) et coordonnees
    plog = "".join('<a class="sfpl" data-fx="zoom" style="--d:%.2fs" href="%s" title="%s"><img src="%s" alt="%s" loading="lazy"></a>'
                   % ((n % 5) * .06, h, nm, ("assets/img/lenovo.png" if k == "lenovo" else "assets/partners/%s.png" % k), nm) for n, (k, nm, h) in enumerate(PARTENAIRES))
    s_part = ('<section class="sec mist aur" id="partenaires"><div class="wrap"><div class="sf-h" data-fx="rise"><span class="kicker">Partenaires</span><h2 class="stitle">Notre r&eacute;seau compte aujourd&rsquo;hui 15 partenaires</h2></div>'
              '<div class="sfpg2">%s</div><div class="sfpbtn"><a class="btn btn-red" href="partenaires.html">Voir tous les partenaires</a></div></div></section>') % plog
    s_co = ('<section class="sec grid" id="coordonnees"><div class="wrap"><div class="cinfo sfco3">'
            '<div class="ci" data-fx="rise"><span class="ic">%s</span><div><h4>Lom&eacute;</h4><p>Hountigom&eacute;, route de l&rsquo;A&eacute;roport, non loin de la pharmacie de l&rsquo;a&eacute;roport.</p></div></div>'
            '<div class="ci" data-fx="rise" style="--d:.1s"><span class="ic">%s</span><div><h4>E-mail</h4><p>%s</p></div></div>'
            '<div class="ci" data-fx="rise" style="--d:.2s"><span class="ic">%s</span><div><h4>T&eacute;l&eacute;phone</h4><p>%s</p></div></div></div></div></section>'
            % (sp.ICON_PIN, sp.ICON_MAIL, sp.reveal_mail(), sp.ICON_TEL, sp.reveal_tel()))
    post = tpl[tpl.rindex('<section class="sec tint"><div class="wrap"><div class="ctaband"'):]
    page = tpl[:a] + hero + s_serv + s_form + s_prod + s_part + s_co + post
    page = page.replace('<script src="assets/inner.js', '<script src="assets/sf.js"></script><script src="assets/inner.js', 1)
    page = re.sub(r'<title>.*?</title>', '<title>Savoir faire : services, formations, produits &middot; Roots &amp; Co</title>', page, count=1, flags=re.S)
    page = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="Tout ROOTS : services (archivage et GED, sauvegarde, sécurité, administration système, développement, web), formations et produits, toutes gammes et toutes marques.">', page, count=1)
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


# ------------------------------------------------------------------ formations (scene d'apprentissage)
THEMES = [
 ("server", "Windows Server et Active Directory", "Installer, administrer et sécuriser les serveurs Windows et l'annuaire de l'entreprise."),
 ("doc", "Microsoft Office", "Word, Excel, PowerPoint et Outlook pour travailler plus vite au quotidien."),
 ("shield", "Sécurité du système d'information", "Devenir Responsable de la Sécurité du Système d'Information : 6 jours pour piloter la sécurité."),
 ("net", "Sophos : pare feu et réseau", "Configurer et exploiter le pare feu Sophos pour protéger le réseau."),
 ("backup", "Acronis et EVault : sauvegarde", "Administrer la sauvegarde et la restauration des données de l'entreprise."),
 ("erp", "Odoo : ERP, RH et comptabilité", "Utiliser et paramétrer Odoo, avec les modules RH et comptabilité."),
]


def build_formations():
    tpl = rd("informatique.html")
    a = tpl.index('<section class="phero">'); b = tpl.index('</section>', a) + len('</section>')
    hero = ('<section class="phero sf-compact"><div class="phero-bg"><img src="assets/stock/meeting.jpg" alt=""></div><div class="wrap">'
            '<div class="crumb"><a href="index.html">Accueil</a> %s <span>Formations</span></div><span class="kicker">Formations</span>'
            '<h1>Formez vos &eacute;quipes aux outils qu&rsquo;elles utilisent</h1>'
            '<p>Syst&egrave;mes, s&eacute;curit&eacute;, sauvegarde, bureautique et ERP : des programmes pratiques, adapt&eacute;s &agrave; votre &eacute;quipe.</p></div></section>' % svg('<path d="M9 6l6 6-6 6"/>'))
    cards = "".join(card(i, t, x, "", (n % 3) * .1) for n, (i, t, x) in enumerate(THEMES))
    s_th = '<section class="sec tint aur" id="themes"><div class="wrap">%s<div class="grid3">%s</div></div></section>' % (shead("Nos th&egrave;mes", "Six th&egrave;mes pour toutes les &eacute;quipes"), cards)
    cats = []
    for c, *_ in FORM:
        if c not in cats: cats.append(c)
    cc = "".join('<article class="sfc%s" data-c="%s"><div class="sfc-t"><span>%s</span>%s</div><h4>%s</h4><p><i>Public</i>%s</p></article>'
                 % (" hist" if h else "", c, c, '<em>%s</em>' % d if d else '<em class="dm">Sur demande</em>', t, p) for c, t, d, p, h in FORM)
    s_cat = ('<section class="sec grid aur" id="catalogue"><div class="wrap"><div class="sf-h" data-fx="rise"><span class="kicker">Catalogue</span><h2 class="stitle">Tous les programmes, avec dur&eacute;e et public</h2></div>'
             '<div class="sf-bar"><div class="sfchips" data-t="sfc">%s</div><span class="sf-count" id="sfCount"></span></div><div class="sfcg" id="sfc">%s</div>'
             '<button type="button" class="btn btn-line sf-more" id="sfMore">Voir tout le catalogue</button></div></section>') % (chips(cats), cc)
    post = tpl[tpl.rindex('<section class="sec tint"><div class="wrap"><div class="ctaband"'):]
    page = tpl[:a] + hero + s_th + s_cat + post
    page = page.replace('<script src="assets/inner.js', '<script src="assets/sf.js"></script><script src="assets/inner.js', 1)
    page = re.sub(r'<title>.*?</title>', '<title>Formations &middot; Roots &amp; Co</title>', page, count=1, flags=re.S)
    page = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="Formations Roots and Co : Windows Server, Active Directory, Office, sécurité, Sophos, sauvegarde, Odoo.">', page, count=1)
    page = re.sub(r'<meta property="og:[^>]*>|<meta name="twitter:card"[^>]*>', '', page)
    wr("formations.html", page)
    print("formations.html ecrit")


if __name__ == "__main__":
    build_savoir_faire()
    build_formations()
    build_solaire()
