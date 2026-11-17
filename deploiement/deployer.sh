#!/bin/bash
# Copie la version du depot vers public_html (sans les scripts SQL). A lancer depuis la racine du depot.
set -e
DEPLOYPATH="${DEPLOYPATH:-$HOME/public_html}"
mkdir -p "$DEPLOYPATH/assets"
cp -f ./*.html "$DEPLOYPATH/"
rsync -a --delete --exclude='*.sql' assets/ "$DEPLOYPATH/assets/"
echo "Deploye : $(git log --oneline -1)"
