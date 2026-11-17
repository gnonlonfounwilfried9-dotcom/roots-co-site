# -*- coding: utf-8 -*-
"""ROOTS & Co : pieces communes du site (pied de page, coordonnees protegees).

Une seule source pour le pied de page. Les pages du site principal ET les pages des
sous-domaines (voir build_subdomains.py) l'utilisent : on modifie ici, on relance
`python scripts/apply_footer.py`, et tout est a jour partout.

Anti-spam : aucune adresse e-mail ni aucun numero n'est ecrit en clair dans le HTML.
Ils sont encodes ici (base64) et ne s'affichent qu'apres un clic humain (assets/shield.js).
"""
import base64

def b64(s):
    return base64.b64encode(s.encode("utf-8")).decode("ascii")

EMAIL = "contact@roots-co.fr"
PHONES = ["+228 93 07 87 87", "+229 99 56 52 52"]
WA_BASE = "https://wa.me/22999565252"

ICON_MAIL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>'
ICON_TEL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z"/></svg>'
ICON_PIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/></svg>'


def reveal_mail(label_fr="Afficher l&rsquo;adresse e-mail", label_en="Show the e-mail address", cls="rv"):
    return ('<button type="button" class="%s" data-k="m" data-v="%s" data-en="%s">%s</button>'
            % (cls, b64(EMAIL), label_en, label_fr))


def reveal_tel(label_fr="Afficher les num&eacute;ros", label_en="Show the phone numbers", cls="rv"):
    return ('<button type="button" class="%s" data-k="t" data-v="%s" data-en="%s">%s</button>'
            % (cls, b64("|".join(PHONES)), label_en, label_fr))


def wa_attrs(url=WA_BASE):
    """Lien WhatsApp sans numero dans le HTML : l'adresse reelle est reconstruite au survol ou au clic."""
    return 'href="contact.html" data-w="%s"' % b64(url)


def footer_html(base=""):
    """Pied de page commun. `base` prefixe les liens (vide sur le site principal, l'URL absolue sur les sous-domaines)."""
    b = base
    return (
        '<footer><div class="wrap"><div class="foot-grid">'
        # colonne 1 : marque
        '<div class="fcol fbrand"><a href="%(b)sindex.html" class="logo"><img class="lw" src="%(b)sassets/img/roots-white.png" alt="ROOTS">'
        '<img class="lb" src="%(b)sassets/img/roots-blue.png" alt="ROOTS"></a>'
        '<p class="tag" data-en="IT engineering and international trade. We equip and support companies across West Africa and Europe.">'
        'Ing&eacute;nierie informatique et n&eacute;goce international. Nous &eacute;quipons et accompagnons les entreprises en Afrique de l\'Ouest et en Europe.</p></div>'
        # colonne 2 : le site
        '<div class="fcol"><h5 data-en="The site">Le site</h5><ul>'
        '<li><a href="%(b)sindex.html" data-en="Home">Accueil</a></li>'
        '<li><a href="%(b)sinformatique.html" data-en="IT and Technology">Informatique et technologie</a></li>'
        '<li><a href="%(b)simport-export.html" data-en="Import-export and Logistics">Import-export et logistique</a></li>'
        '<li><a href="%(b)ssolaire.html" data-en="Solar energy">&Eacute;nergie solaire</a></li>'
        '<li><a href="%(b)sformations.html" data-en="Training">Formations</a></li>'
        '<li><a href="%(b)ssavoir-faire.html" data-en="Know-how">Savoir faire</a></li>'
        '<li><a href="%(b)sblog.html" data-en="News">Actualit&eacute;s</a></li></ul></div>'
        # colonne 3 : partenaires
        '<div class="fcol"><h5 data-en="Partners">Partenaires</h5><ul>'
        '<li><a href="%(b)spartenaires.html" data-en="Our 15 partners">Nos 15 partenaires</a></li>'
        '<li><a href="%(b)spartenaire-dell.html" data-en="Official Dell partner">Partenaire officiel Dell</a></li>'
        '<li><a href="%(b)sreferences.html" data-en="Client references">R&eacute;f&eacute;rences clients</a></li></ul></div>'
        # colonne 4 : entreprise
        '<div class="fcol"><h5 data-en="Company">Entreprise</h5><ul>'
        '<li><a href="%(b)sa-propos.html" data-en="About">&Agrave; propos</a></li>'
        '<li><a href="%(b)scontact.html" data-en="Contact">Contact</a></li></ul></div>'
        # colonne 5 : nous joindre (coordonnees protegees)
        '<div class="fcol"><h5 data-en="Reach us">Nous joindre</h5><ul class="fcontact">'
        '<li><span class="fi">%(mail)s</span>%(rmail)s</li>'
        '<li><span class="fi">%(tel)s</span>%(rtel)s</li>'
        '<li><span class="fi">%(pin)s</span><span data-en="Lome, Cotonou">Lom&eacute;, Cotonou</span></li>'
        '<li><span class="fi">%(pin)s</span><span data-en="France, United States">France, &Eacute;tats-Unis</span></li></ul></div>'
        '</div><div class="foot-bottom"><span>&copy; 2026 Roots &amp; Co. <span data-en="All rights reserved.">Tous droits r&eacute;serv&eacute;s.</span></span></div></div></footer>'
    ) % dict(b=b, mail=ICON_MAIL, tel=ICON_TEL, pin=ICON_PIN, rmail=reveal_mail(), rtel=reveal_tel())
