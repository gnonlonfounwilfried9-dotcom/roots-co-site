# -*- coding: utf-8 -*-
"""Controles automatiques du site, executes a chaque publication (GitHub Actions)."""
import glob, os, re, sys

errors = []

for f in glob.glob("*.html"):
    h = open(f, encoding="utf-8").read()
    if "<<<<<<<" in h or ">>>>>>>" in h or "\n=======\n" in h:
        errors.append(f + " : marqueur de conflit Git non resolu")
    if "<title>" not in h:
        errors.append(f + " : pas de balise <title>")
    # chaque asset local reference doit exister
    for m in re.finditer(r'(?:href|src)="(assets/[^"?]+)(?:\?[^"]*)?"', h):
        p = m.group(1)
        if not os.path.exists(p):
            errors.append(f + " : ressource manquante " + p)
    # tiret parasite utilise comme separateur (regle de style ROOTS)
    txt = re.sub(r"<[^>]+>", " ", h)
    for bad in re.findall(r"(?<=[a-zA-Zéèêàôç]) - (?=[a-zA-Zéèêàôç])", txt):
        errors.append(f + " : tiret utilise comme separateur (' - ')")
        break

# le catalogue SQL doit rester coherent (22 produits attendus)
if os.path.exists("assets/catalog.sql"):
    n = open("assets/catalog.sql", encoding="utf-8").read().count("::jsonb),") + \
        open("assets/catalog.sql", encoding="utf-8").read().count("::jsonb)\n")
    if n and n < 20:
        errors.append("assets/catalog.sql : moins de 20 produits, verifier le seed")

if errors:
    print("Controles en echec :")
    for e in errors:
        print("  -", e)
    sys.exit(1)

print("Tous les controles sont passes.")
