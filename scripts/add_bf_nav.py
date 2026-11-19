# -*- coding: utf-8 -*-
"""Ajoute le lien Black Friday dans la navigation, le tiroir mobile et l'accueil. Idempotent."""
import glob, io, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NAV = '<a href="black-friday.html" class="home-link bf-link" data-en="Black Friday">Black Friday</a>'
DRAWER = ('<div class="drawer-group"><a href="black-friday.html" class="drawer-bf" data-en="Black Friday"><strong>Black Friday</strong>'
          '<span>Dell et HP &agrave; prix r&eacute;duits, jusqu\'au 20 novembre</span></a></div>')
HOME_BTN = '<a href="black-friday.html" class="btn btn-bf" data-en="Black Friday offers">Offres Black Friday</a>'

n = 0
for f in sorted(glob.glob(os.path.join(ROOT, "*.html"))):
    name = os.path.basename(f)
    h = io.open(f, encoding="utf-8").read()
    o = h
    if 'class="nav"' in h and "bf-link" not in h:
        h = h.replace('<a href="contact.html" class="home-link"', NAV + '<a href="contact.html" class="home-link"', 1)
    if 'id="navlinks"' in h and "drawer-bf" not in h:
        h = h.replace('<nav class="drawer-nav" id="navlinks">', '<nav class="drawer-nav" id="navlinks">' + DRAWER, 1)
    if name == "index.html" and "btn-bf" not in h:
        h = h.replace('<a href="informatique.html" class="btn btn-ghost" data-en="Discover our solutions">Découvrir nos solutions</a></div>',
                      '<a href="informatique.html" class="btn btn-ghost" data-en="Discover our solutions">Découvrir nos solutions</a>' + HOME_BTN + '</div>', 1)
    if h != o:
        io.open(f, "w", encoding="utf-8").write(h); n += 1
print("pages modifiees :", n)
