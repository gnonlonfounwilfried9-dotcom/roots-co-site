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
- **Panier pleinement actif, bloque seulement au dernier geste (2026-09-11)** : dans `assets/shop.js`, `var CART_ENABLED = false;`. Catalogue, ajout au panier, panier flottant, formulaire de coordonnees et recapitulatif fonctionnent normalement de bout en bout. Seul le clic sur "Envoyer ma commande" (step 3) est intercepte : au lieu d'inserer dans Supabase, un message s'affiche dans `#cfSendErr` (element ajoute dans `cartStep3`, a ne pas confondre avec `#cfErr` qui sert aux erreurs de validation du formulaire, step 2) avec un lien `mailto:` pre-rempli reprenant l'integralite du recapitulatif de commande (`d.txt`, deja construit par `collect()`). Rien n'est enregistre cote Supabase dans ce cas (verifie : le panier reste intact apres le clic). Remettre `CART_ENABLED = true` des que le paiement est branche (etape 8) pour activer l'envoi reel (`submitOrder`).
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

## Prix : hors taxes (HT) uniquement, depuis le 2026-09-11

- Decision de Wilfried : **plus aucun prix TTC affiche sur le site**, ni cote client ni dans les reponses de
  l'assistant. Le fichier `Downloads/Descriptifs de communication_ site e-commerce.xlsx` fourni par Wilfried
  donne les prix HT de reference (colonne `PRIX EN VENTE HT`).
- `boutique.html` : les 22 boutons produits utilisent `data-ht="<eur>"` (avant : `data-ttc`). `shop.js` : panier,
  recapitulatif, e-mail de commande et `buildRecord()` calculent tout en HT (`it.ht`, `unit_ht_eur` dans
  `orders.items`). Les anciennes commandes enregistrees avant cette date ont encore `unit_ttc_eur` dans leur
  JSON `items` : ne pas essayer de les "corriger" retroactivement, c'est un historique reel.
  - Catalogue interne de reference (HT en FCFA, source `catalog.sql`, **prix Dell mis a jour le 2026-09-11**,
    voir section suivante) : DC16250=748252, DP14-120U=723493, DP14E-i3U=549355, DP14E-i3W=624457,
    DP14E-i5U=706987, DP14E-i5W=621158 (inchange), DP15E=508856 (inchange), QCS1250N=560799,
    TOWER-W11=560799, QC1250N=442181, TOWER-i5=490611, QBT1250N=519385, E2425HSM=80716, S2425HSM=84224,
    S2725HSM=105281, MS116=6315, KM5221W=20357, KM7120W=40708, KB216=8422, WD25=108789, WD25-3Y=113003,
    WD25TB4=168447.
- **Bug corrige (2026-09-11)** : l'attribut `data-price` sur `<article class="bxcard">` (utilise par le tri
  "Trier par prix" dans `shop.js`) avait garde l'ancienne valeur TTC pour les 22 produits d'origine, alors que
  l'affichage etait deja passe en HT. Resynchronise avec `data-ht` pour les 22 (le tri par prix triait sur les
  bons chiffres relatifs entre eux avant, mais affichait un total incoherent avec le prix visible si on le
  comparait au detail). A verifier si un nouveau produit est ajoute a la main : `data-price` doit toujours
  etre identique a `data-ht` sur le meme article.
- `catalogue.html` : le bloc "Nos meilleures ventes" et "Toute la gamme" affichaient des **produits fictifs**
  (Dell Vostro 3520/3510, Dell Latitude 3420, HP 250 G8/G10, Lenovo ThinkBook...) avec des photos generiques
  reutilisees entre plusieurs modeles (`assets/img/prod_dell.jpg` etc.) et des prix invente — c'est ce que
  Wilfried a repere ("Dell Latitude 3420" affichait une photo HP). Remplace par une selection de vrais produits
  du catalogue reel (photos et prix HT depuis `assets/produits/*.png` et `catalog.sql`), badges "Garantie X an(s)"
  a la place des faux badges "Stock France/Togo/Benin" inventes.
- `admin.js`/`admin.html` : le formulaire produit (onglet Produits) prend maintenant le **HT** en entree
  (`pfPrix`), le TTC (18%) est affiche en dessous a titre indicatif seulement. Le modele CSV d'import utilise
  la colonne `prix_ht_fcfa` (avant : `prix_ttc_fcfa`). La table `products` garde ses deux colonnes
  (`prix_ht_fcfa`, `prix_ttc_fcfa`), seule la source de saisie a change.
- `assets/kb.js` (reponses de l'assistant) et `worker/roots-chat-worker.js` (systeme de l'assistant IA,
  optionnel) mis a jour pour ne plus jamais mentionner de TTC.

## Catalogue HP et Lenovo (2026-09-11)

- Source : `Downloads/Descriptifs de communication_ site e-commerce.xlsx` fourni par Wilfried, 28 lignes
  (5 Dell deja dans le catalogue, 23 HP/Lenovo). 22 ajoutees (1 doublon exclu, voir plus bas), dans
  `assets/catalog-hp-lenovo.sql` (fichier separe, **a coller dans Supabase SQL Editor**, pas encore fait par
  Wilfried) et dans `boutique.html` (cartes ajoutees au `#bxgrid`, compteurs de filtre : 44 au total,
  26 portables, 8 bureau, inchange pour ecrans/claviers/souris/stations).
- **Photos** : aucune photo n'existait pour ces produits. Sourcees en direct depuis les sites officiels
  (`support.hp.com` et `psref.lenovo.com`, jamais de banque d'images tierce ni de photo generique non
  verifiee), une photo par ligne de produit reelle (plusieurs configurations d'un meme modele physique
  partagent la meme photo, ex. les 4 HP ProBook 460 G11 AD0W.../AD2G9ET/AD2H0ET). 12 photos au total dans
  `assets/produits/` (prefixe `hp-` ou `lenovo-`).
- **Colonnes Excel corrompues confirmees pendant le travail** : `TYPE DISQUE DUR` et `MEMOIRE VIVE`
  s'incrementaient ligne par ligne (glissement Excel), et `Type (Portable/Desktop)` marquait "Desktops" pour
  des portables reels (confirme en cherchant les fiches HP/Lenovo officielles : ProBook 460 G11, ProBook 450
  G10, 240R G10, tous les Lenovo V/IdeaPad/LOQ sont des portables malgre l'etiquette Excel). Seule la colonne
  `CARACTERISTIQUES (Fournisseurs)` (texte libre) a servi de source pour les caracteristiques ; c'est elle
  qui a ete utilisee pour retrouver les vraies fiches produit et confirmer portable vs bureau.
- **1 ligne exclue** : `RTS_2026360054` (Lenovo V15 G5 IRL, 83GW006MFE) est un doublon exact d'une autre ligne
  (`RTS_2026360055`, meme MTM, meme prix), texte `CARACTERISTIQUES` tronque en plus. La ligne `RTS_2026360055`
  (plus complete) a ete gardee seule.
- **Ligne `83GW00EPFE` (Lenovo, ex-"V15-IRL") resolue** : son texte `CARACTERISTIQUES` se contredisait
  lui-meme dans l'Excel ("CORE 7-240H" dans le titre, "Intel Core i3-1315U" dans le detail). Verifie sur la
  fiche officielle Lenovo PSREF pour ce MTM exact (`psref.lenovo.com/Detail/Lenovo_V15_G5_IRL?M=83GW00EPFE`) :
  le bon processeur est **Intel Core 7 240H** (8 Go, 512 Go SSD, ecran 15,6" FHD non tactile, sans systeme
  preinstalle). Region Excel "Africa-French-Portuguese" confirmee sur la fiche officielle. Ajoutee sous le nom
  Lenovo V15 G5 IRL, meme photo que les autres references de cette famille.
- **Prix Dell mis a jour** : Wilfried a confirme que les prix Dell de l'Excel (plus eleves que ceux deja en
  ligne, environ +27%) sont une vraie mise a jour tarifaire, a appliquer. Fait dans `catalog.sql`,
  `boutique.html`, `catalogue.html` et `assets/kb.js` pour DC16250, DP14-120U, DP14E-i3U, DP14E-i3W et
  DP14E-i5U (les 2 seuls Dell laptop non couverts par cet Excel, DP14E-i5W et DP15E, gardent leur ancien
  prix). SQL de mise a jour : `assets/price-updates-2026-09-11.sql`.

## Contraintes permanentes

- Zero tiret comme separateur, zero emoji, icones SVG maison. Ton humain, francais accentue.
- Jamais de faux avis, fausses promos, faux stock, faux produit ni photo ne correspondant pas au produit reel.
- Carte bancaire = lien de paiement securise chez le prestataire, jamais de saisie carte sur le site.
- Site bilingue FR/EN via attributs `data-en`.
- EUR vers FCFA : parite fixe (655,957), ne fluctue pas. USD vers FCFA : fluctue, valeur manuelle.
- Prix affiches : **HT uniquement**, jamais de TTC (voir section dediee ci-dessus).

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
- Coller `assets/price-updates-2026-09-11.sql` PUIS `assets/catalog-hp-lenovo.sql` dans Supabase (SQL Editor,
  Run) pour que les prix Dell corriges et les 22 nouveaux produits HP/Lenovo apparaissent aussi dans le
  tableau de bord admin (deja visibles sur `boutique.html`/`catalogue.html`, qui sont en HTML statique).

## Journal des livraisons

- 2026-09-10 : choix Supabase, doc d'architecture, catalogue pilote (etape 1), commande sans WhatsApp (etape 2), prix HT FCFA (etape 3).
- 2026-09-10 : declencheurs stock, tableau de bord Analyse + comptage visites et questions (etape 4), module Clients (etape 5).
- 2026-09-10 : onglet Reglages, roles et journal (etape 6), TVA/devises/zones de livraison (etape 7).
- 2026-09-10 : nav (A propos remplace par Nos partenaires), bouton clair/sombre admin, suppression de commande, import CSV (etape 10), consentement RGPD + suppression de compte + CI (etape 9), prep paiement (etape 8) + PDF procedure.
- 2026-09-10 : suivi de colis intelligent (frise cote admin et cote client, date de livraison estimee), robustesse MFA.
- 2026-09-10 : barre d'avancement en pourcentage visible sans deplier (admin + client), fonction e-mail `notifier-suivi` (Resend, prete), mise a jour automatique du taux dollar `taux-change` (Edge + cron).
- 2026-09-11 : `notifier-suivi` et `taux-change` deployees et testees en direct (voir piege "Function name" ci-dessus et limite Resend mode test). Bloc reseaux sociaux ajoute au footer de toutes les pages via `app.js` (Facebook, Instagram, LinkedIn, TikTok, X). Police de titres remplacee par Montserrat, bug de cascade CSS corrige (double `:root` qui annulait tout changement de police). Bug de traduction corrige : le mot qui tourne dans le titre (`.rot`) ne suivait pas le bouton FR/EN, restait dans l'ancienne langue jusqu'au prochain cycle automatique. Palette recolore en bleu marine + or/cuivre (fini le cyan), fonds clairs rechauffes (ivoire au lieu de bleu-gris).
- 2026-09-11 (suite) : correction du panier — les produits ne doivent jamais paraitre indisponibles, seul le
  dernier geste (envoi de la commande) est bloque, avec recours par e-mail pre-rempli. Passage integral du site
  aux prix **HT uniquement** (boutique, panier, assistant, admin), a partir des vrais prix HT fournis par
  Wilfried. `catalogue.html` : suppression des produits fictifs et photos generiques reutilisees (Dell Vostro,
  Dell Latitude, HP 250, ThinkBook...), remplaces par de vrais produits du catalogue avec leurs vraies photos.
  Numero WhatsApp unifie sur tout le site (+229 99 56 52 52).
- 2026-09-11 (suite) : 22 produits HP et Lenovo ajoutes au catalogue (`boutique.html` + `assets/catalog-hp-lenovo.sql`),
  a partir du fichier Excel de Wilfried, avec de vraies photos officielles retrouvees sur les sites HP et
  Lenovo (voir section "Catalogue HP et Lenovo"). Boutique passee de 22 a 44 references, page devenue
  multi-marque (Dell, HP, Lenovo) dans les textes et le menu.
- 2026-09-11 (suite) : prix Dell corriges (mise a jour tarifaire confirmee par Wilfried, 5 references,
  `assets/price-updates-2026-09-11.sql`). Ligne Lenovo `83GW00EPFE` resolue par verification sur la fiche
  officielle PSREF (Core 7 240H) et ajoutee. Bug corrige : `data-price` (tri par prix de la boutique) etait
  reste en TTC pour les 22 produits d'origine alors que l'affichage etait deja en HT.
