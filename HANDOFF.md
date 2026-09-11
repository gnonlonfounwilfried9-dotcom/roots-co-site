# ROOTS & Co — Site web, dossier de passation

Ce document existe pour qu'une autre personne (avec un autre compte Claude, ou sans Claude du tout)
puisse reprendre ce projet sans dépendre d'une seule personne. Il est dans le dépôt, donc il voyage
avec le code : quiconque a accès au dépôt GitHub a ce document.

Dernière mise à jour : 2026-09-09.

## 1. Ce que c'est

Site vitrine + boutique en ligne de **Roots & Co** (ex-Roots Technologies), SSII basée à Lomé (Togo)
et Cotonou (Bénin), avec une présence en France et aux États-Unis. Deux pôles : informatique/technologie,
et import-export/négoce international. Partenaire officiel Dell (revend du matériel Dell neuf, prix affichés
en FCFA).

Site 100% statique (HTML/CSS/JS, aucun serveur applicatif), déployé via **GitHub Pages**, avec une base
**Supabase** en complément pour tout ce qui a besoin d'être enregistré (commandes, comptes clients).

## 2. Où est le code, où est le site en ligne

- **Dépôt principal (à jour, celui à utiliser)** : https://github.com/rootsandcotech-create/Roots-Co
  Compte propriétaire : `rootsandcotech-create`.
- **Site en ligne (dépôt principal)** : https://rootsandcotech-create.github.io/Roots-Co/
- **Dépôt miroir historique** (gardé synchronisé en parallèle, à ne plus utiliser comme source de vérité
  une fois le dépôt principal confirmé stable) : https://github.com/gnonlonfounwilfried9-dotcom/roots-co-site
  et https://gnonlonfounwilfried9-dotcom.github.io/roots-co-site/
- Branche : `main`. GitHub Pages sert directement la racine de cette branche (pas de build, pas de CI).
- Pour donner accès à quelqu'un d'autre : sur `rootsandcotech-create/Roots-Co`, Settings → Collaborators →
  Add people, avec au minimum le rôle **Write**. La personne doit accepter l'invitation reçue par e-mail
  ou visible sur https://github.com/rootsandcotech-create/Roots-Co/invitations avant de pouvoir pousser.

## 3. Comment publier une modification

1. Cloner ou éditer les fichiers dans `RootsCo_Site/` (nom du dossier local).
2. **Toujours lancer l'anti-cache avant de publier**, sinon les visiteurs peuvent voir une version
   périmée de CSS/JS pendant plusieurs jours : un script Python qui ajoute `?v=<horodatage>` sur tous
   les liens `assets/*.css` et `assets/*.js` de chaque page HTML. Le script exact n'est pas dans ce
   dépôt (il vivait dans un dossier de travail temporaire) ; il est trivial à recréer si besoin, ou
   demandez à Claude de le refaire — c'est une boucle simple sur les fichiers `*.html` avec une
   expression régulière sur `href="assets/...css"` et `src="assets/...js"`.
3. `git add -A` (ou fichier par fichier), `git commit -m "..."`, `git push origin main`.
4. Le site est à jour en quelques secondes à quelques minutes (GitHub Pages n'a pas de vraie étape de build).

## 4. Design et règles de contenu, non négociables

Ces règles ont été répétées plusieurs fois par le client, ne pas les casser :
- **Aucun tiret utilisé comme séparateur ou puce** dans les textes visibles (les tirets grammaticaux du
  français, comme dans "import-export", restent normaux).
- **Aucun emoji.** Icônes uniquement (bibliothèque SVG ligne fine maison, voir `assets/style.css`).
- Textes en français avec accents corrects, ton direct et humain, pas de formulations "à consonance IA".
- FR/EN sur chaque page via l'attribut `data-en` sur les éléments (bascule gérée par `assets/app.js`,
  état persistant en `localStorage`).
- Thème clair/sombre géré par `:root[data-theme]`, bouton dans la nav.
- Taux de change fixe utilisé partout : **1 EUR = 655,957 FCFA**. Les prix affichés sur le site sont hors taxes (HT) uniquement depuis le 2026-09-11 (voir ARCHITECTURE.md, document de référence tenu à jour en priorité).
- Jamais de fausses données : pas de faux stock, faux avis, fausses urgences.
- Jamais de collecte de données bancaires sur le site : le paiement carte se fait toujours via un lien
  sécurisé envoyé après confirmation de commande, jamais un champ carte sur le site lui-même.

## 5. Arborescence des pages

24 pages HTML à la racine : `index.html` (accueil), `informatique.html`, `import-export.html`,
`catalogue.html`, `boutique.html` (boutique en ligne, 22 produits Dell), `compte.html` (espace client,
voir §7), `admin.html` (tableau de bord interne, voir §7), `partenaires.html` + une page par partenaire
(`partenaire-dell.html`, `partenaire-hp.html`, etc., 14 pages), `references.html`, `a-propos.html`,
`blog.html`, `contact.html`.

Navigation : 6 liens directs dans la barre (Accueil, Import-export, Boutique, Actualités, À propos,
Contact), le reste dans le tiroir ☰ Menu (icône en haut à droite), qui contient aussi les liens
partenaires/catalogue et, en bas, **Mon compte**. Sur petit écran (moins de 900px de large), tous les
liens sauf Accueil passent dans le tiroir.

## 6. Fichiers JS/CSS partagés (tous dans `assets/`)

- `style.css` : toute la feuille de style du site (un seul fichier, sections commentées par bloc).
- `app.js` : bascule FR/EN, thème clair/sombre, animations au défilement, compteurs, menu tiroir.
- `nav.js` : ouverture/fermeture du tiroir de navigation.
- `chat.js` + `chat-config.js` + `kb.js` : l'assistant ROOTS (chatbot). `kb.js` contient
  `window.ROOTS_KB`, 166 fiches de connaissance (produits, partenaires, conseils sécurité, savoir-faire,
  infos pratiques) utilisées à la fois par le chat et comme source pour les documents marketing.
- `shop.js` : logique complète de la boutique (panier en `localStorage`, formulaire de commande en
  trois étapes, envoi WhatsApp/e-mail, enregistrement Supabase).
- `account.js` : espace client (connexion, inscription, historique de commandes).
- `admin.js` : tableau de bord administrateur.
- `supabase-config.js` : **à compléter**, voir §7. Tant qu'il est vide, le site fonctionne quand même
  (commande par WhatsApp/e-mail uniquement, pas d'espace client ni de tableau de bord).
- `orders.sql` : script SQL à exécuter une fois dans Supabase pour créer la table des commandes,
  la table des administrateurs et toutes les règles de sécurité (RLS). Contient ses propres
  instructions en commentaire.

## 7. Supabase (base de données pour commandes, comptes clients, tableau de bord)

Le site est statique, donc rien n'est enregistré nulle part par défaut : une commande part directement
en message WhatsApp ou e-mail. Supabase ajoute, en plus (pas à la place) :
- Un **enregistrement automatique** de chaque commande dans une table `orders`.
- Un **espace client** (`compte.html`) : un visiteur peut créer un compte et voit l'historique de
  *ses propres* commandes uniquement (vérifié par les règles de sécurité de la base, pas par du code
  côté site qu'on pourrait contourner).
- Un **tableau de bord administrateur** (`admin.html`, non listé dans le menu, à réserver à l'équipe) :
  statistiques, filtre par statut, recherche, détail de chaque commande, changement de statut
  (nouvelle → confirmée → en livraison → livrée, ou annulée).

**État au 9 septembre 2026 : le projet Supabase n'a pas encore été créé.** Tant que
`assets/supabase-config.js` contient des valeurs vides, `boutique.html`, `compte.html` et `admin.html`
continuent de fonctionner en mode dégradé (formulaire de commande normal, mais pas d'espace client ni
de tableau de bord actif).

Pour l'activer :
1. Créer un compte et un projet sur https://supabase.com (gratuit pour ce volume).
2. Dans le projet, SQL Editor → coller et exécuter le contenu de `assets/orders.sql`.
3. Authentication → Users → créer un compte administrateur (l'e-mail/mot de passe que l'équipe utilisera
   pour `admin.html`). Cocher "Auto Confirm User".
4. Copier son "User UID", puis dans SQL Editor exécuter :
   `insert into public.admins (user_id) values ('UID_ICI');`
5. Project Settings → API → copier la **Project URL** et la clé **anon public**.
6. Les coller dans `assets/supabase-config.js` (`url` et `anonKey`), commit, push.

Ces deux valeurs (URL + clé anon) sont **prévues pour être publiques**, elles sont visibles dans le
code source de n'importe quel site utilisant Supabase côté client. La sécurité réelle vient des
règles RLS définies dans `orders.sql`, pas du secret de ces valeurs. Ne jamais, en revanche, mettre
la clé "service_role" de Supabase (différente, jamais utilisée dans ce projet) dans un fichier public.

## 8. Décisions prises et pourquoi (pour ne pas les refaire par erreur)

- **Format des documents marketing** (calendriers, catalogues) : deux formats déjà essayés et rejetés
  par le client (slides 16:9 classiques "trop d'espace vide" ; liste continue A4 "horrible"). Le format
  validé : une page A4 dense par contenu, façon aperçu de publicité (image réelle, accroche, texte
  complet, CTA, ligne SEO). Voir le moteur de rendu utilisé pour le catalogue 97 visuels si besoin de
  reproduire ce format (pipeline HTML → Chrome headless → PDF).
- **Nav restructurée** deux fois cette session pour arriver à 6 liens directs (voir §5) : c'est un choix
  client explicite, pas un oubli à "corriger".
- **Cart/panier repensé en 3 étapes** (panier → coordonnées → vérification) pour ressembler aux grands
  sites marchands (Amazon) : le client a explicitement demandé une étape de relecture avant l'envoi.
- **Hébergement GitHub Pages** : choix pragmatique initial (gratuit, fiable, suffisant pour un site
  statique). **Discussion en cours (9 septembre 2026) pour migrer vers WordPress/WooCommerce**, afin de
  se rapprocher des concurrents locaux (protechtogo.com, togoinformatique.com) qui ont un catalogue
  beaucoup plus large et des fonctionnalités e-commerce plus riches (avis, promos, cross-sell). Cette
  migration n'a pas encore démarré techniquement au moment de la rédaction de ce document : elle
  nécessite un hébergement payant (PHP + MySQL), que le client doit choisir et souscrire lui-même.
  Voir la conversation ou demander l'état d'avancement le plus récent avant de repartir sur l'une ou
  l'autre option.

## 9. Contacts et identifiants métier (non secrets, déjà publics sur le site)

- E-mail : sales@roots.ws
- Téléphone/WhatsApp : +228 93 07 87 87 (Togo), +229 99 56 52 52 (Bénin)
- Villes : Lomé, Cotonou, + présence France et États-Unis
- Domaines existants du client (non branchés sur ce site pour l'instant) : roots.services, roots.ws,
  roots-it.fr, ssii.roots-technologies.com

## 10. Pour reprendre le travail avec un autre compte Claude

1. Donner accès au dépôt (voir §2) ou fournir une copie du dossier `RootsCo_Site/`.
2. Faire lire ce fichier en premier.
3. Vérifier l'état de `assets/supabase-config.js` (vide = Supabase pas encore branché) et l'état
   d'avancement de la migration WordPress éventuelle (§8) avant de commencer quoi que ce soit.
4. Respecter les règles du §4 sur tout nouveau contenu.
