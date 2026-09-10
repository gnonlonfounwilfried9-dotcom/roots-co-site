# Roots & Co — architecture et dossier de reprise

Document de passation. Toute personne, ou toute nouvelle session Claude, doit le lire
avant de continuer le travail. Il est mis a jour a chaque livraison.

## Choix technique

Back-office **sur Supabase**, pas Laravel. Site statique (HTML/CSS/JS) publie sur GitHub Pages,
Supabase fournit la base PostgreSQL, l'authentification, l'API REST auto, le stockage, les
sauvegardes quotidiennes et les fonctions Edge. Decision du 2026-09-10 (Laravel = nouvel
hebergeur payant + plusieurs semaines pour refaire ce que Supabase donne d'origine).

## Depots et publication

- Principal : `rootsandcotech-create/Roots-Co` (remote `origin`). Live : https://rootsandcotech-create.github.io/Roots-Co/
- Ancien : `gnonlonfounwilfried9-dotcom/roots-co-site` (remote `old-origin`). On pousse sur les deux a chaque commit.
- Objectif : quitter GitHub Pages pour un vrai hebergeur + domaine (roots.services / roots.ws).
- Avant chaque publication : `python3 <scratchpad>/bust.py` (anti-cache `?v=` sur les CSS/JS locaux).
- CI : `.github/workflows/verif.yml` lance `scripts/verif.py` a chaque push (titres, marqueurs de
  conflit, ressources manquantes, tirets parasites).

## Supabase

- Projet `uqhrlgrryjlqoqpkrixv`, URL `https://uqhrlgrryjlqoqpkrixv.supabase.co`.
- Cle publique dans `assets/supabase-config.js` (sans danger cote site). **Ne jamais commiter la cle `sb_secret_...`.**
- Tout le schema est dans `assets/*.sql`, chaque fichier idempotent (relancable sans risque) :
  - `orders.sql` : commandes + admins + regles RLS (anon INSERT seul, authenticated SELECT ses commandes ou tout si admin, admin UPDATE et DELETE)
  - `catalog.sql` : `products` + `categories` + declencheurs stock (`stock_sur_commande`, `stock_sur_annulation`)
  - `analytics.sql` : `visites` + `chat_logs`
  - `roles.sql` : `staff` (roles admin/manager/support) + `audit_log` + trigger `sync_admins` (garde `admins` = staff role admin)
  - `settings.sql` : `parametres` (cle/valeur : tva, taux_eur_fcfa, taux_usd_fcfa) + `zones_livraison`
  - `rgpd.sql` : fonction `supprimer_mon_compte()` (anonymise les commandes + delete auth.users)
  - `payments.sql` : colonnes `paye`, `paiement_ref`, `paiement_operateur`, `paye_le` sur orders
  - `suivi.sql` : colonnes `suivi` (jsonb) + `livraison_estimee` (date) sur orders + trigger `suivi_initial`
  - `supabase-setup.sql` : concatenation de tous les fichiers ci-dessus, a coller en une fois pour une installation neuve
- **Gotcha** : apres un changement de policy RLS, delai de propagation de plusieurs minutes
  (erreur trompeuse `new row violates row-level security policy` + HTTP 401). Attendre, re-tester.
- Admin ajoute a la main : Auth > Users > Add user, puis inscrire l'UID dans `staff` (role admin).
- MFA TOTP : a activer dans Auth > Multi-Factor, choisir l'option qui autorise "Enroll".

## Pages et scripts

- `admin.html` + `assets/admin.js` : tableau de bord. Onglets Commandes, Produits, Clients, Analyse, Reglages.
  - Commandes : liste, filtre par statut, recherche, changement de statut, suivi de colis (frise + ajout d'etape + date estimee), suppression, reference.
  - Produits : liste, stats stock bas, editeur CRUD, calcul HT en direct, import CSV (bouton Modele CSV + Importer).
  - Clients : fiche par e-mail derivee des commandes, segment auto (Nouveau/Regulier/VIP), historique, export CSV.
  - Analyse : Chart.js. Ventes/jour, visites vs commandes, top produits, statuts. Fenetres glissantes (30 j, 14 j) recalculees a chaque ouverture.
  - Reglages : securite (MFA), equipe (staff + roles), TVA et devises, zones de livraison, journal des actions.
  - `logAction(action, cible, details)` ecrit dans `audit_log` a chaque mutation.
  - Barre `.adm-top` toujours sombre : logo force `.lw` (blanc). Bouton clair/sombre (cle `rootsco_theme`).
- `compte.html` + `assets/account.js` : espace client. Inscription/connexion, historique, suivi de colis, date estimee, suppression du compte (RGPD).
- `boutique.html` + `assets/shop.js` : panier, tunnel en 4 etapes (panier, coordonnees, verification type Amazon, confirmation avec reference `RC-AAMMJJ-XXXX`). Plus de WhatsApp, la commande part au tableau de bord. Lit `taux_eur_fcfa` depuis `parametres`.
- `assets/app.js` : theme, banniere de consentement RGPD, comptage des visites (fetch REST direct, 1/page/30min/onglet, gate sur le consentement).
- `assets/chat.js` + `assets/kb.js` : assistant. `logQuestion()` compte les questions dans `chat_logs`. VLAN ajoute (`me01b`).
- `supabase/functions/paiement-webhook/index.ts` : fonction Edge de reception des confirmations de paiement, prete pour FedaPay / PayDunya / Flutterwave, en attente du compte marchand.

## Contraintes permanentes

- Zero tiret comme separateur, zero emoji, icones SVG maison. Ton humain, francais accentue.
- Jamais de faux avis, fausses promos, faux stock.
- Carte bancaire = lien de paiement securise chez le prestataire, jamais de saisie carte sur le site.
- Site bilingue FR/EN via attributs `data-en`.
- EUR vers FCFA : parite fixe (655,957), ne fluctue pas. USD vers FCFA : fluctue, valeur manuelle.

## Reste a faire

- Brancher le compte marchand de paiement quand ouvert (0,5 a 1 j par prestataire).
- Notifications e-mail (compte Resend) et SMS (fournisseur a choisir) sur changement de statut et de suivi.
- Wiring `boutique.html` pour lire le catalogue depuis Supabase au lieu du HTML fige.
- Publication automatique des posts reseaux sociaux (comptes Meta / LinkedIn Business + revue d'app).

## Journal des livraisons

- 2026-09-10 : choix Supabase, doc d'architecture, catalogue pilote (etape 1), commande sans WhatsApp (etape 2), prix HT FCFA (etape 3).
- 2026-09-10 : declencheurs stock, tableau de bord Analyse + comptage visites et questions (etape 4), module Clients (etape 5).
- 2026-09-10 : onglet Reglages, roles et journal (etape 6), TVA/devises/zones de livraison (etape 7).
- 2026-09-10 : nav (A propos remplace par Nos partenaires), bouton clair/sombre admin, suppression de commande, import CSV (etape 10), consentement RGPD + suppression de compte + CI (etape 9), prep paiement (etape 8) + PDF procedure.
- 2026-09-10 : suivi de colis intelligent (frise cote admin et cote client, date de livraison estimee), robustesse MFA.
