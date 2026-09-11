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
- `fix-rls.sql` : fonctions `est_admin()` / `est_equipe()` (security definer) qui remplacent les verifications directes `exists(select ... from admins)`, lesquelles se heurtaient a la regle "using(false)" de la table admins elle-meme (RLS imbriquee = piege classique). A appliquer sur toute installation.
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
- `assets/suivi-etapes.js` : source de verite des etapes de suivi (libelle + pourcentage), partagee admin et client. `window.ROOTS_SUIVI.progress(order)` donne l'avancement.
- `assets/app.js` injecte automatiquement un bloc **reseaux sociaux** (`.foot-social`) dans le `.foot-bottom` de chaque page (Facebook, Instagram, LinkedIn, TikTok, X), sans toucher au HTML de chacune des 26 pages. Pour changer un lien, modifier le tableau `NETS` dans `app.js`.
- **Achat en ligne en pause (2026-09-11)** : dans `assets/shop.js`, `var CART_ENABLED = false;`. Les produits restent **disponibles** et les prix affiches normalement (rien n'est grise ni marque indisponible) ; seul le bouton change de comportement : il ne remplit plus le panier, il ouvre un e-mail pre-rempli (`contactMailto()`) vers `sales@roots.ws` avec le produit, la reference et le prix. Le bouton panier flottant reste masque (rien a y afficher tant qu'on ne vend pas en ligne). Remettre `CART_ENABLED = true` des que le paiement est branche (etape 8) pour retrouver le vrai panier.
- Fonctions Edge dans `supabase/functions/`, **deployees et verifiees en direct le 2026-09-11** via le dashboard Supabase (Edge Functions > Via Editor) :
  - `paiement-webhook` : recoit les confirmations de paiement (FedaPay / PayDunya / Flutterwave). En attente du compte marchand, pas encore deployee.
  - `notifier-suivi` : e-mail au client a chaque etape (via Resend). Secrets `RESEND_API_KEY`, `MAIL_FROM` configures. Testee en direct : envoi reussi vers l'adresse du compte Resend (`marketing-digital@roots.services`). **Limite Resend en mode test** : impossible d'envoyer a d'autres destinataires (les vrais clients) tant que le domaine `roots.services` ou `roots.ws` n'est pas verifie sur resend.com/domains. A faire avant mise en prod reelle.
  - `taux-change` : met a jour `taux_usd_fcfa` chaque jour depuis open.er-api.com. Testee en direct : taux passe de 600 (valeur de depart) a 564,63 apres appel. Cron `0 6 * * *` pas encore planifie (a faire dans Supabase > Edge Functions > taux-change > Cron). L'euro reste fixe (655,957).
  - **Piege de deploiement rencontre** : au premier essai, le champ "Function name" laisse sur le nom auto-genere (ex. `rapid-handler`) fixe l'URL/slug reel de la fonction pour toujours ; renommer ensuite dans la liste ne change que l'etiquette affichee, pas l'adresse. Resultat : deux fonctions "existaient" dans le dashboard sous le bon nom mais repondaient en 404 a leur URL logique. Solution : supprimer et redeployer, en tapant le nom definitif dans "Function name" **avant** de coller le code.
  - **Cron `taux-change`** : `assets/cron.sql` (pg_cron + pg_net, appel HTTP quotidien a 6h vers la fonction). A coller une seule fois dans Supabase > SQL Editor. Pas de decalage horaire a gerer (Togo/Benin = UTC+0).

## Typographie

- Police de titres : **Montserrat** (variable, auto-hebergee dans `assets/fonts/montserrat-var.woff2`), variable CSS `--head`. Texte courant : **Inter**, variable `--sans`. Ces deux variables sont definies **une seule fois**, tout en haut de `assets/style.css` (`:root`).
- **Bug historique corrige (2026-09-11)** : un second bloc `:root{--head:...}` plus bas dans le fichier (vers la ligne 1230, sous un commentaire "TYPOGRAPHIE v2") redefinissait `--head`/`--sans` vers des polices jamais chargees (`Space Grotesk`, `Manrope` en CDN qui n'existait pas), ecrasant systematiquement tout changement fait en haut du fichier a cause de l'ordre de la cascade CSS. C'est pour ca que les tentatives precedentes de changer la police "ne marchaient pas". Le bloc en double a ete supprime : il n'y a plus qu'une seule source de verite pour `--head`/`--sans`, en haut du fichier.
- `Manrope` reste chargee separement, reservee aux graphiques Chart.js du tableau de bord (`admin.js` fixe `Chart.defaults.font.family`).

## Palette de couleurs

- **Changement 2026-09-11, decision de Wilfried** : le cyan d'origine est retire, remplace par un bleu marine + or/cuivre.
- Les noms de variables CSS ne changent PAS (`--cyan`, `--cyan-d`, `--teal`, `--gold`), seulement leurs valeurs :
  `--cyan:#d9a441` (or, accent principal), `--cyan-d:#a9762a` (cuivre fonce, degrades et hover), `--teal:#8a5a1f` (bronze fonce,
  texte sur fond clair type kicker/liens), `--gold:#f4b63c` (inchange, reste le ton le plus vif). `--navy`/`--navy2`/`--navy3`
  inchanges (base sombre du site). `--dell:#0f7fc0` **volontairement inchange** : c'est le vrai bleu de marque Dell, pas
  notre accent.
- Fonds clairs rechauffes : `--surface`/`--surface2`/`--tint`/`--line` sont passes d'un bleu-gris froid (aspect "SaaS
  generique") a un ivoire chaud, pour repondre au retour "fond trop generique".
- **Attention en cas de nouvelle modification de couleur** : plusieurs couleurs cyan etaient codees en dur (pas via variable)
  et il faut les repasser a la main si on change encore la teinte : `assets/style.css` (`rgba(34,195,230,...)` -> deja
  converti en `rgba(217,164,65,...)`, et le degrade texte de `.hero h1 .rot`), `assets/app.js` (particules et lignes du
  reseau anime du hero, `ctx.fillStyle`/`strokeStyle`), `assets/admin.js` (`themeColors()` et les couleurs du donut Analyse),
  `a-propos.html` (dgradient SVG inline), `supabase/functions/notifier-suivi/index.ts` (barre de progression de l'e-mail,
  **ne se met a jour qu'apres redeploiement manuel de la fonction**, le depot Git n'est pas relie a Supabase).
- Fond de page juge "trop generique" par Wilfried : premiere passe faite (fonds ivoire au lieu de bleu-gris), a affiner
  si besoin (epurer davantage les degrades/motifs de fond).

## Contraintes permanentes

- Zero tiret comme separateur, zero emoji, icones SVG maison. Ton humain, francais accentue.
- Jamais de faux avis, fausses promos, faux stock.
- Carte bancaire = lien de paiement securise chez le prestataire, jamais de saisie carte sur le site.
- Site bilingue FR/EN via attributs `data-en`.
- EUR vers FCFA : parite fixe (655,957), ne fluctue pas. USD vers FCFA : fluctue, valeur manuelle.

## Paiement, verifie en direct le 2026-09-11

- **FedaPay** : couvre exactement Benin, Cote d'Ivoire, Togo, Senegal, Niger. Mobile Money (MTN/Moov/Celtiis Benin) a 1,80%, cartes a 3,60%, pas d'abonnement. Correspond exactement aux deux pays de Roots.
- **Flutterwave** : le formulaire d'inscription en libre-service (onboarding.flutterwave.com) ne proposait QUE le Nigeria comme pays au moment du test ; le Benin necessite de passer par "contact sales", donc pas un vrai self-service pour Roots malgre le chiffre marketing de 30+ pays (qui concerne surtout la reception de paiements, pas l'ouverture de compte marchand).
- Le client (Wilfried) explore Flutterwave et Stripe de son cote. Recommandation donnee : FedaPay seul pour demarrer.

## Reste a faire

- Brancher le compte marchand de paiement quand ouvert (0,5 a 1 j par prestataire), puis remettre `CART_ENABLED = true`.
- Coller `assets/cron.sql` dans Supabase pour planifier `taux-change` (pas encore fait).
- Verifier le domaine Resend (`roots.services` ou `roots.ws`) pour pouvoir notifier les vrais clients, pas seulement le compte Resend.
- Wiring `boutique.html` pour lire le catalogue depuis Supabase au lieu du HTML fige.
- Publication automatique des posts reseaux sociaux (comptes Meta / LinkedIn Business + revue d'app).
- Refonte visuelle : palette or/cuivre appliquee le 2026-09-11 (voir section Palette de couleurs). Reste a affiner si besoin : fond de page (motifs/degrades) et redeployer `notifier-suivi` pour que l'e-mail de suivi reprenne aussi la nouvelle couleur.

## Journal des livraisons

- 2026-09-10 : choix Supabase, doc d'architecture, catalogue pilote (etape 1), commande sans WhatsApp (etape 2), prix HT FCFA (etape 3).
- 2026-09-10 : declencheurs stock, tableau de bord Analyse + comptage visites et questions (etape 4), module Clients (etape 5).
- 2026-09-10 : onglet Reglages, roles et journal (etape 6), TVA/devises/zones de livraison (etape 7).
- 2026-09-10 : nav (A propos remplace par Nos partenaires), bouton clair/sombre admin, suppression de commande, import CSV (etape 10), consentement RGPD + suppression de compte + CI (etape 9), prep paiement (etape 8) + PDF procedure.
- 2026-09-10 : suivi de colis intelligent (frise cote admin et cote client, date de livraison estimee), robustesse MFA.
- 2026-09-10 : barre d'avancement en pourcentage visible sans deplier (admin + client), fonction e-mail `notifier-suivi` (Resend, prete), mise a jour automatique du taux dollar `taux-change` (Edge + cron).
- 2026-09-11 : `notifier-suivi` et `taux-change` deployees et testees en direct (voir piege "Function name" ci-dessus et limite Resend mode test). Achat en ligne mis en pause le temps d'ouvrir le compte marchand (`CART_ENABLED=false` dans `shop.js`, produits **disponibles**, prix toujours visibles, le bouton ouvre un e-mail au lieu du panier). Bloc reseaux sociaux ajoute au footer de toutes les pages via `app.js` (Facebook, Instagram, LinkedIn, TikTok, X). Police de titres remplacee par Montserrat, bug de cascade CSS corrige (double `:root` qui annulait tout changement de police). Bug de traduction corrige : le mot qui tourne dans le titre (`.rot`) ne suivait pas le bouton FR/EN, restait dans l'ancienne langue jusqu'au prochain cycle automatique. Palette recolore en bleu marine + or/cuivre (fini le cyan), fonds clairs rechauffes (ivoire au lieu de bleu-gris).
