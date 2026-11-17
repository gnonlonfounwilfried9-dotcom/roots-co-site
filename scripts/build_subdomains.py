# -*- coding: utf-8 -*-
"""ROOTS & Co : pages d'accueil des sous-domaines (roots-co.fr).

Principe : un seul site, un seul jeu de fichiers partages (styles, scripts, logos, pied de page).
Chaque sous-domaine ne contient QU'UNE page d'accueil, qui charge tout depuis https://roots-co.fr/assets/.
Modifier l'en-tete, le pied de page ou le style sur le site principal met donc a jour tous les sous-domaines
sans toucher a leur dossier. Modifier la page d'un sous-domaine n'affecte aucun autre.

Usage : python scripts/build_subdomains.py        (ecrit le dossier sous-domaines/)
"""
import io, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import site_parts as sp

BASE = os.environ.get("ROOTS_BASE", "https://roots-co.fr/")
OUT = os.environ.get("ROOTS_OUT") or os.path.join(ROOT, "sous-domaines")

def rd(p): return io.open(p, encoding="utf-8").read()
def wr(p, s):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    io.open(p, "w", encoding="utf-8", newline="\n").write(s)

REL = re.compile(r'(href|src)="(?!https?:|#|mailto:|tel:|javascript:|data:)([^"]+)"')
def absolutize(h):
    return REL.sub(lambda m: '%s="%s%s"' % (m.group(1), BASE, m.group(2)), h)

def svg(inner):
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">%s</svg>' % inner

IC = {
 "server": '<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/>',
 "shield": '<path d="M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5l-8-3Z"/><path d="m9 12 2 2 4-4"/>',
 "net": '<circle cx="12" cy="5" r="2.4"/><circle cx="5" cy="19" r="2.4"/><circle cx="19" cy="19" r="2.4"/><path d="M12 7.4V12M12 12 6.5 17M12 12l5.5 5"/>',
 "gear": '<circle cx="12" cy="12" r="3.2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/>',
 "cam": '<path d="M3 8h12v8H3z"/><path d="m15 11 6-3v8l-6-3"/>',
 "erp": '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
 "box": '<path d="M21 8 12 3 3 8l9 5Z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>',
 "truck": '<path d="M3 6h11v10H3z"/><path d="M14 9h4l3 3v4h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
 "globe": '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.5 2.7 4 5.7 4 9s-1.5 6.3-4 9c-2.5-2.7-4-5.7-4-9s1.5-6.3 4-9Z"/>',
 "search": '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
 "lock": '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
 "code": '<path d="m8 8-4 4 4 4"/><path d="m16 8 4 4-4 4"/><path d="m13.5 5-3 14"/>',
 "wrench": '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4Z"/>',
 "doc": '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
 "cap": '<path d="m2 9 10-5 10 5-10 5Z"/><path d="M6 11.2V16c0 1.2 2.7 2.5 6 2.5s6-1.3 6-2.5v-4.8"/><path d="M22 9v6"/>',
}

# nom du dossier (= sous-domaine cPanel) : contenu
SUBS = {
 "informatique": dict(img="datacenter.jpg", kick="P&ocirc;le num&eacute;ro un", noindex=False,
    h1="Informatique et technologie",
    lead="Du mat&eacute;riel et des serveurs &agrave; la s&eacute;curit&eacute; et &agrave; l&rsquo;infog&eacute;rance, une seule &eacute;quipe pilote tout votre syst&egrave;me d&rsquo;information.",
    cards=[("server", "Mat&eacute;riel informatique", "Postes fixes, portables et consommables, Dell, HP et Lenovo."),
           ("wrench", "Maintenance et support", "Contrat de maintenance pour prolonger la vie de vos appareils."),
           ("shield", "Cybers&eacute;curit&eacute;", "Pare feu Sophos, antivirus et protection des donn&eacute;es."),
           ("gear", "Infog&eacute;rance", "Parc informatique et photocopieurs pris en charge."),
           ("net", "R&eacute;seaux et t&eacute;l&eacute;coms", "C&acirc;blage, r&eacute;seaux d&rsquo;entreprise et interconnexion des sites."),
           ("erp", "ERP Odoo", "Installation d&rsquo;Odoo, modules RH et Compta, formation.")],
    main="informatique.html", main_label="Voir la page Informatique et technologie"),
 "technologie": dict(img="circuit.jpg", kick="Technologies", noindex=False,
    h1="Technologies et partenaires",
    lead="Les marques que nous installons et soutenons : serveurs, postes, r&eacute;seau, s&eacute;curit&eacute;, vid&eacute;osurveillance et ERP.",
    cards=[("server", "Serveurs et postes", "Dell, HP et Lenovo, install&eacute;s et sous garantie."),
           ("shield", "S&eacute;curit&eacute;", "Sophos, Fortinet, Acronis : pare feu, sauvegarde et protection."),
           ("net", "R&eacute;seau", "Ubiquiti, Huawei, Synology : r&eacute;seaux d&rsquo;entreprise et stockage."),
           ("cam", "Vid&eacute;osurveillance", "Cam&eacute;ras et syst&egrave;mes d&rsquo;alarme intrusion, Hikvision et Axis."),
           ("erp", "ERP et logiciels", "Odoo, SAP et Microsoft pour piloter l&rsquo;activit&eacute;."),
           ("gear", "Un seul interlocuteur", "Achat, installation et maintenance par la m&ecirc;me &eacute;quipe.")],
    main="partenaires.html", main_label="Voir nos 15 partenaires"),
 "infogerance": dict(img="support.jpg", kick="Infog&eacute;rance", noindex=False,
    h1="Infog&eacute;rance et maintenance",
    lead="Nous prenons en charge votre parc informatique et vos photocopieurs, pour que vos &eacute;quipes se concentrent sur leur m&eacute;tier.",
    cards=[("gear", "Infog&eacute;rance du parc", "Parc informatique et photocopieurs pris en charge."),
           ("wrench", "Maintenance et support", "Contrat de maintenance pour prolonger la vie de vos appareils."),
           ("shield", "S&eacute;curit&eacute; et sauvegarde", "Protection des donn&eacute;es, antivirus et pare feu."),
           ("server", "Intervention sur site", "Technicien sur site, &agrave; partir de 50 &euro; / 32 800 FCFA les deux heures.")],
    main="informatique.html", main_label="Voir toutes nos expertises"),
 "odoo": dict(img="engineer.jpg", kick="ERP Odoo", noindex=False,
    h1="Odoo : un ERP adapt&eacute; &agrave; votre m&eacute;tier",
    lead="ERP et CRM modulaires, adapt&eacute;s aux PME et aux structures en croissance. Nous param&eacute;trons ce qui sert r&eacute;ellement &agrave; votre activit&eacute;.",
    cards=[("search", "Analyse de l&rsquo;activit&eacute;", "Flux, devis, commandes, stocks et facturation cartographi&eacute;s."),
           ("erp", "Param&eacute;trage des modules", "Ventes, achats, stocks, comptabilit&eacute;, projets ou point de vente."),
           ("doc", "Reprise de donn&eacute;es", "Import des clients, fournisseurs, articles et de l&rsquo;historique comptable."),
           ("code", "Personnalisation", "Mod&egrave;les de documents, plan comptable, taxes locales et circuits de validation."),
           ("cap", "Formation", "Prise en main par r&ocirc;le : commercial, magasinier, comptable, direction."),
           ("wrench", "&Eacute;volution et support", "Ajout de modules, ajustements et assistance apr&egrave;s la mise en production.")],
    main="partenaire-odoo.html", main_label="Voir la page Odoo"),
 "import-export": dict(img="containers.jpg", kick="Import-export", noindex=False,
    h1="Import-export et logistique",
    lead="Nous sourcons du mat&eacute;riel dans le monde entier et vous le livrons, achemin&eacute; jusqu&rsquo;&agrave; vos locaux, dans toute la sous r&eacute;gion.",
    cards=[("globe", "Sourcing international", "Recherche et n&eacute;gociation via nos r&eacute;seaux en Europe et aux &Eacute;tats-Unis."),
           ("box", "Approvisionnement", "Achat, pr&eacute;commande et acheminement de mat&eacute;riel."),
           ("truck", "Transport et livraison", "Acheminement jusqu&rsquo;&agrave; vos locaux dans la sous r&eacute;gion."),
           ("gear", "Mat&eacute;riels industriels", "Fourniture sur demande et sur cahier des charges.")],
    main="import-export.html", main_label="Voir la page Import-export"),
 "esn": dict(img="engineer.jpg", kick="ESN", noindex=False,
    h1="Ing&eacute;nierie et services num&eacute;riques",
    lead="Nous participons &agrave; des projets nationaux et internationaux et d&eacute;livrons des prestations professionnelles en syst&egrave;mes d&rsquo;information, du conseil &agrave; l&rsquo;installation et au suivi.",
    cards=[("gear", "Ing&eacute;nierie et int&eacute;gration", "&Eacute;tude, d&eacute;ploiement et int&eacute;gration sur mesure."),
           ("code", "D&eacute;veloppement de logiciels", "ERP et progiciels, adapt&eacute;s &agrave; votre organisation."),
           ("globe", "Cr&eacute;ation de sites web", "Sites vitrines et institutionnels."),
           ("doc", "Archivage et GED", "Num&eacute;risation, classement et circuit de validation des documents."),
           ("cap", "Formations", "Windows Server, Microsoft Office, Windows 10, UTM Sophos et Odoo."),
           ("erp", "ERP Odoo", "Installation, modules RH et Compta, formation.")],
    main="informatique.html", main_label="Voir la page Informatique et technologie"),
 "infrastructure": dict(img="datacenter.jpg", kick="Infrastructure", noindex=False,
    h1="Infrastructure : serveurs, r&eacute;seau et s&eacute;curit&eacute;",
    lead="Nous concevons, installons et maintenons l&rsquo;infrastructure qui fait tourner votre entreprise.",
    cards=[("server", "Serveurs", "Vente et installation de serveurs Dell pour les banques, institutions et grands comptes."),
           ("net", "R&eacute;seaux et t&eacute;l&eacute;coms", "C&acirc;blage, r&eacute;seaux d&rsquo;entreprise et interconnexion des sites."),
           ("shield", "Cybers&eacute;curit&eacute;", "Pare feu Sophos, antivirus et protection des donn&eacute;es."),
           ("cam", "Vid&eacute;osurveillance et alarmes", "Cam&eacute;ras et syst&egrave;mes d&rsquo;alarme intrusion."),
           ("wrench", "Maintenance", "Contrat de maintenance et intervention sur site."),
           ("gear", "Infog&eacute;rance", "Parc informatique et photocopieurs pris en charge.")],
    main="informatique.html", main_label="Voir la page Informatique et technologie"),
 "shop": dict(img="office.jpg", kick="Boutique", noindex=True,
    h1="Notre boutique en ligne est en pr&eacute;paration",
    lead="Pour acheter du mat&eacute;riel, demandez un devis : nous revenons vite avec une proposition adapt&eacute;e.",
    cards=[("box", "Mat&eacute;riel sur devis", "Postes, serveurs, imprimantes, r&eacute;seau et s&eacute;curit&eacute;."),
           ("truck", "Livraison dans la sous r&eacute;gion", "Acheminement jusqu&rsquo;&agrave; vos locaux."),
           ("shield", "Garantie et assistance", "Depuis Lom&eacute; et Cotonou.")],
    main="contact.html", main_label="Demander un devis"),
 "intranet": dict(img="office.jpg", kick="Acc&egrave;s r&eacute;serv&eacute;", noindex=True,
    h1="Espace r&eacute;serv&eacute; aux &eacute;quipes ROOTS",
    lead="Cet espace est r&eacute;serv&eacute; aux collaborateurs. Si vous cherchez nos services, rendez vous sur le site principal.",
    cards=[("lock", "Acc&egrave;s interne", "L&rsquo;authentification sera activ&eacute;e avant toute mise en service de cet espace.")],
    main="index.html", main_label="Aller au site principal"),
}


def build_page(name, d, tpl):
    head, hdr, scripts = tpl
    title = re.sub(r'&[a-z]+;', ' ', d["h1"]).strip()
    head = re.sub(r'<title>.*?</title>', '<title>%s &middot; Roots &amp; Co</title>' % d["h1"], head, count=1, flags=re.S)
    head = re.sub(r'<meta name="description" content="[^"]*">',
                  '<meta name="description" content="%s">' % re.sub(r'<[^>]+>', '', d["lead"]).replace('"', ''), head, count=1)
    if d["noindex"]:
        head = head.replace('</title>', '</title><meta name="robots" content="noindex,nofollow">', 1)
    head = head.replace('</title>', '</title><link rel="canonical" href="https://%s.roots-co.fr/">' % name, 1) if not d["noindex"] else head
    cards = "".join('<div class="card tilt" data-reveal="up"%s><span class="cic">%s</span><h3>%s</h3><p>%s</p></div>'
                    % (' style="--d:%.1fs"' % ((i % 3) * .1) if i % 3 else "", svg(IC[ic]), t, x)
                    for i, (ic, t, x) in enumerate(d["cards"]))
    hero = ('<section class="phero"><div class="phero-bg"><img src="assets/stock/%s" alt=""></div><div class="wrap">'
            '<span class="kicker">%s</span><h1>%s</h1><p>%s</p></div></section>' % (d["img"], d["kick"], d["h1"], d["lead"]))
    body = ('<section class="sec tint"><div class="wrap"><div class="grid3">%s</div></div></section>'
            '<section class="sec mist"><div class="wrap"><div class="ctaband" data-reveal="zoom"><img src="assets/stock/support.jpg" alt="">'
            '<h2>Parlons de votre projet</h2><p>Dites nous ce dont vous avez besoin. Nous revenons vite avec un devis adapt&eacute;.</p>'
            '<div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center"><a class="btn btn-primary" href="contact.html">Demander un devis</a>'
            '<a class="btn btn-line" href="%s">%s</a></div></div></div></section>') % (cards, d["main"], d["main_label"])
    page = absolutize(hero + body)
    return head + hdr + page + sp.footer_html(BASE) + scripts

HTACCESS = """# ROOTS & Co : sous-domaine statique (Apache / cPanel)
Options -Indexes
DirectoryIndex index.html
AddDefaultCharset UTF-8
RewriteEngine On
RewriteCond %{HTTPS} !=on
RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [L,R=301]
"""

def main():
    src = rd(os.path.join(ROOT, "informatique.html"))
    head = src[:src.index("<body>") + len("<body>")]
    head = re.sub(r'<meta property="og:[^>]*>|<meta name="twitter:card"[^>]*>', '', head)
    head = re.sub(r'<link rel="canonical"[^>]*>', '', head)
    head = absolutize(head)
    # <base> : les elements crees par les scripts partages (logos partenaires, etc.) utilisent des chemins relatifs
    head = head.replace('<head>', '<head><base href="%s">' % BASE, 1)
    hdr = src[src.index("<body>") + len("<body>"):src.index('<section class="phero">')]
    hdr = absolutize(hdr)
    # tiroir et en-tete : les liens WhatsApp portent deja data-w, le reste devient absolu
    foot_end = src.index("</footer>") + len("</footer>")
    scripts = absolutize(src[foot_end:])
    # bouton WhatsApp flottant + haut de page conserves, scripts partages
    n = 0
    for name, d in SUBS.items():
        wr(os.path.join(OUT, name, "index.html"), build_page(name, d, (head, hdr, scripts)))
        wr(os.path.join(OUT, name, ".htaccess"), HTACCESS + ('Header set X-Robots-Tag "noindex, nofollow"\n' if d["noindex"] else ""))
        n += 1
    wr(os.path.join(OUT, "LISEZMOI.txt"), LISEZMOI)
    print(n, "sous-domaines ecrits dans", OUT)

LISEZMOI = """ROOTS & Co : sous-domaines de roots-co.fr
=========================================

PRINCIPE
Un seul site. Chaque sous-domaine ne contient qu'un dossier avec index.html et .htaccess.
Les styles, scripts, logos, en-tete et pied de page sont charges depuis https://roots-co.fr/assets/.
=> Modifier le style ou le pied de page du site principal met a jour tous les sous-domaines.
=> Modifier index.html d'un sous-domaine ne change rien aux autres.

DEPOT DANS cPANEL (Gestionnaire de fichiers)
Chaque dossier de ce zip porte le meme nom que le dossier racine du sous-domaine deja cree dans cPanel :
  esn/            -> esn.roots-co.fr
  import-export/  -> import-export.roots-co.fr
  infrastructure/ -> infrastructure.roots-co.fr
  intranet/       -> intranet.roots-co.fr   (page noindex, a proteger par mot de passe cPanel : Repertoires proteges)
  shop/           -> shop.roots-co.fr       (page noindex, boutique en preparation)
A CREER dans cPanel (Domaines, Sous-domaines), avec le dossier du meme nom :
  informatique/   -> informatique.roots-co.fr
  technologie/    -> technologie.roots-co.fr
  infogerance/    -> infogerance.roots-co.fr
  odoo/           -> odoo.roots-co.fr
Pas de page pour solaire.roots-co.fr tant que son contenu n'est pas decide.

POUR CHAQUE SOUS-DOMAINE
1. Copier index.html et .htaccess dans le dossier racine du sous-domaine (remplacer l'existant, voir plus bas).
2. cPanel, SSL/TLS Status : lancer AutoSSL pour le sous-domaine (certificat gratuit).
3. Tester https://<sous-domaine>.roots-co.fr
IMPORTANT : si un sous-domaine redirige aujourd'hui vers le site principal (redirection cPanel ou .htaccess), supprimer cette redirection : le .htaccess fourni la remplace.

REGENERER APRES UNE MODIFICATION DU PIED DE PAGE
  python scripts/apply_footer.py        (site principal)
  python scripts/build_subdomains.py    (sous-domaines)
Le pied de page n'est ecrit qu'a un endroit : scripts/site_parts.py.
"""

if __name__ == "__main__":
    main()
