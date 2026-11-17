# -*- coding: utf-8 -*-
"""Applique a toutes les pages du site : pied de page commun, lien Formations, protection anti-spam,
meta de partage. Relancable sans risque (idempotent).   Usage : python scripts/apply_footer.py"""
import glob, io, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import site_parts as sp

OG_IMG = "https://roots-co.fr/assets/img/og-roots.png"
FOOT = re.compile(r'<footer>.*?</footer>', re.S)
WA = re.compile(r'href="(https://wa\.me/[^"]+)"')
n_f = n_w = 0
for f in sorted(glob.glob(os.path.join(ROOT, "*.html"))):
    h = io.open(f, encoding="utf-8").read()
    if "<footer" not in h:
        continue
    o = h
    h = FOOT.sub(lambda m: sp.footer_html(""), h, count=1)

    # liens WhatsApp : plus de numero dans le HTML
    def wa(m):
        return sp.wa_attrs(m.group(1))
    h = WA.sub(wa, h)

    # script de protection, apres nav.js
    if "assets/shield.js" not in h:
        h = re.sub(r'(<script src="assets/nav\.js[^"]*"></script>)', r'\1<script src="assets/shield.js"></script>', h, count=1)

    # liens Formations, Energie solaire, Savoir faire dans le tiroir (groupe Solutions) et Savoir faire dans la barre du haut
    head_part = h.split('<footer')[0]
    if 'href="solaire.html"' not in head_part:
        h = h.replace('<span>Mat&eacute;riel, r&eacute;seau, s&eacute;curit&eacute;, ERP, maintenance</span></a>',
                      '<span>Mat&eacute;riel, r&eacute;seau, s&eacute;curit&eacute;, ERP, maintenance</span></a>'
                      '<a href="solaire.html" data-en="Solar energy"><strong>&Eacute;nergie solaire</strong><span>&Eacute;tude, panneaux, onduleurs, batteries</span></a>', 1)
    if 'href="formations.html"' not in head_part:
        h = h.replace('<span>&Eacute;tude, panneaux, onduleurs, batteries</span></a>',
                      '<span>&Eacute;tude, panneaux, onduleurs, batteries</span></a><a href="formations.html" data-en="Training"><strong>Formations</strong><span>Windows Server, Office, Sophos UTM, Odoo</span></a>', 1)
    if 'href="savoir-faire.html"' not in head_part:
        h = h.replace('<span>Windows Server, Office, Sophos UTM, Odoo</span></a>',
                      '<span>Windows Server, Office, Sophos UTM, Odoo</span></a><a href="savoir-faire.html" data-en="Know-how"><strong>Savoir faire</strong><span>Services, formations, produits, 15 marques</span></a>', 1)
        h = re.sub(r'(<a href="index\.html" class="home-link"[^>]*>[^<]*</a>)', lambda m: m.group(1) + '<a href="savoir-faire.html" class="home-link" data-en="Know-how">Savoir faire</a>', h, count=1)

    # meta de partage (aperçu du lien : logo ROOTS)
    if 'property="og:image"' not in h:
        t = re.search(r'<title>(.*?)</title>', h, re.S)
        title = t.group(1) if t else "Roots &amp; Co"
        d = re.search(r'<meta name="description" content="([^"]*)"', h)
        desc = d.group(1) if d else "Ingenierie informatique et negoce international"
        og = ('<meta property="og:type" content="website"><meta property="og:site_name" content="ROOTS">'
              '<meta property="og:title" content="%s"><meta property="og:description" content="%s">'
              '<meta property="og:image" content="%s"><meta name="twitter:card" content="summary_large_image">') % (title, desc, OG_IMG)
        h = h.replace('</title>', '</title>' + og, 1)
    if h != o:
        io.open(f, "w", encoding="utf-8", newline="\n").write(h)
        n_f += 1
print("pages mises a jour :", n_f)
