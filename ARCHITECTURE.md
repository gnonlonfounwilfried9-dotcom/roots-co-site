# Roots & Co — architecture du back-office

Document de reprise. A lire avant de continuer le travail sur la boutique et le back-office.

## Choix technique

Back-office **sur Supabase**, pas Laravel. Le site reste statique (HTML/CSS/JS), Supabase
fournit la base PostgreSQL, l'authentification, l'API REST auto, le stockage et les sauvegardes.
Decision prise avec le client le 2026-09-10 (Laravel = nouvel hebergeur payant + plusieurs semaines
pour refaire ce que Supabase donne d'origine).

## Depots

- Principal : `rootsandcotech-create/Roots-Co` (remote `origin`). Live : https://rootsandcotech-create.github.io/Roots-Co/
- Ancien : `gnonlonfounwilfried9-dotcom/roots-co-site` (remote `old-origin`). On pousse sur les deux.
- Objectif : quitter GitHub Pages pour un vrai hebergeur + domaine (roots.services / roots.ws).
- Avant chaque publication : `python3 <scratchpad>/bust.py` (anti-cache `?v=` sur les CSS/JS locaux).

## Supabase

- Projet `uqhrlgrryjlqoqpkrixv`, URL `https://uqhrlgrryjlqoqpkrixv.supabase.co`.
- Cle publique dans `assets/supabase-config.js` (sans danger cote site). Ne jamais commiter la cle `sb_secret_...`.
- Schema : `assets/orders.sql`, idempotent, relancable sans risque. Tables `orders` + `admins`.
- RLS : anon INSERT seulement ; authenticated SELECT (ses commandes, ou tout si dans `admins`) ; authenticated UPDATE si admin.
- Admin ajoute a la main : Auth > Users > Add user, puis `insert into admins (user_id) values ('UID')`.
- **Gotcha** : apres un changement de policy RLS, delai de propagation de plusieurs minutes
  (erreur trompeuse `new row violates row-level security policy` + HTTP 401). Attendre, re-tester.
  Les cles nouvelles (`sb_publishable_`) et anciennes (JWT `eyJ...`) ont le meme comportement.

## Pages back-office

- `admin.html` + `assets/admin.js` : login Supabase Auth, liste commandes, changement de statut, stats.
  Barre `.adm-top` toujours sombre : logo force en `.lw` (blanc), sinon la regle `.nohero` met le logo bleu invisible.
- `compte.html` : espace client, inscription/connexion + historique de ses commandes.

## Contraintes permanentes

- Zero tiret comme separateur, zero emoji, icones SVG maison. Ton humain, francais accentue.
- Jamais de faux avis, fausses promos, faux stock.
- Carte bancaire = lien de paiement securise envoye apres confirmation, jamais de saisie carte sur le site.
- Site bilingue FR/EN via attributs `data-en`.

## Modele de donnees vise

En ligne : `orders`, `admins`.
A creer : `products`, `categories`, `customers`, `staff`, `audit_log`, `visites`, `chat_logs`,
`parametres`, `zones_livraison`. Detail des colonnes dans l'artifact d'architecture.

## Ordre de construction

1. Catalogue pilote (`products` + onglet Produits admin) — EN COURS
2. Commande sans WhatsApp (dashboard uniquement + reference)
3. Prix HT en FCFA sur les fiches
4. Dashboard analytique (Chart.js : ventes, produits phares, visites, conversion, usage assistant)
5. Module clients (onglet + historique + segmentation + export)
6. Roles / journal d'actions / 2FA
7. Livraison / TVA / devises parametrables
8. Paiement en ligne (Paystack ou Flutterwave + Stripe) — bloque tant que les comptes marchands ne sont pas ouverts
9. RGPD + integration continue
10. Mise a jour catalogue par fichier Excel

## Depend du client

- Comptes marchands paiement (Paystack/Flutterwave/Stripe) + verification KYC
- Compte Resend pour l'e-mail transactionnel (gratuit < 3000/mois)
- Choix du canal SMS
