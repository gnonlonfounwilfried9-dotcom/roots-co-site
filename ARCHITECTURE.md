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
- Objectif : quitter GitHub Pages pour un vrai hebergeur + domaine (roots.services / roots.ws / roots-co.fr).
- Avant chaque publication : `python3 <scratchpad>/bust.py` (anti-cache `?v=` sur les CSS/JS locaux).
- CI : `.github/workflows/verif.yml` lance `scripts/verif.py` a chaque push (titres, marqueurs de
  conflit, ressources manquantes, tirets parasites).
- **Piege GitHub Pages decouvert le 2026-09-14** : deux push trop rapproches font echouer le deploiement du
  second ("pages build and deployment" en `failure`, log : "Deployment request failed... due to in progress
  deployment. Please cancel [sha] first or wait for it to complete."). Le commit reste bien pousse sur
  `origin`/`old-origin` (rien de perdu), mais **le site public ne se met pas a jour** tant qu'un nouveau push
  ne redeclenche pas un deploiement propre. Verifier apres coup avec
  `gh run list --repo rootsandcotech-create/Roots-Co --limit 5` (colonne `pages-build-deployment` doit dire
  `success` pour le dernier push) plutot que de supposer que "commit pousse" = "site a jour". Si ca arrive :
  refaire un commit (meme petit) declenche un nouveau deploiement qui, lui, reussira (plus de deploiement
  concurrent en cours).
- `roots-co.fr` (domaine achete par Wilfried) redirige deja (301) vers
  `https://rootsandcotech-create.github.io/Roots-Co/` — verifie en direct le 2026-09-14. Ce n'est pas encore
  un vrai hebergement (juste une redirection DNS/registrar vers la meme URL GitHub Pages qu'avant), et pas
  encore le nouvel hebergement FTP dont Wilfried a parle. Voir "Reste a faire".

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

- **Police unique du site (2026-09-14, consigne directe de "AH")** : **EB Garamond** pour tout, titres et texte
  courant (`--head` et `--sans` pointent tous les deux sur `'EB Garamond'`), variable auto-hebergee dans
  `assets/fonts/ebgaramond-var.woff2`. Consigne recue : "veillez a l'uniformite de la police (Garamond)" —
  compris comme une seule famille partout, pas un couple titre/texte differencie. Si ce n'est pas ce qui etait
  voulu (ex. Garamond pour les titres seulement, garder un sans-serif pour le texte courant), le signaler :
  c'est un changement facile a affiner (une seule paire de variables a modifier).
- Avant cette consigne, le site est passe par Sora/Inter puis Montserrat/Inter (2026-09-11). Inter a ete retire
  du depot (fichiers `assets/fonts/inter-*.woff2` supprimes) puisqu'il n'est plus utilise nulle part.
- **Bug historique (corrige le 2026-09-11, toujours vrai a retenir)** : un second bloc `:root{--head:...}` avait
  ete ajoute plus bas dans `style.css` (sous un commentaire "TYPOGRAPHIE v2") qui redefinissait `--head`/`--sans`
  et ecrasait silencieusement tout changement fait en haut du fichier a cause de l'ordre de la cascade CSS.
  C'est pour ca que les tentatives de changement de police avant cette date ne prenaient jamais effet. Il n'y a
  plus qu'une seule source de verite pour `--head`/`--sans`, tout en haut de `assets/style.css` (`:root`) —
  ne jamais recreer un second bloc de ce type plus bas dans le fichier.
- `Manrope` reste chargee separement, reservee aux graphiques Chart.js du tableau de bord (`admin.js` fixe `Chart.defaults.font.family`).

## Palette de couleurs

- **Charte officielle Roots & Co, decidee en reunion le 2026-08-13** : bleu marine + cyan
  (`--navy2:#0c2848`, `--cyan:#22c3e6`). C'est la reference a utiliser par defaut.
- **2026-09-11** : essai d'un bleu marine + or/cuivre (decision de Wilfried a ce moment-la, sans reference a la
  charte officielle ci-dessus).
- **2026-09-14, retour direct ("AH")** : "privilegier les couleurs officiels de la structure" + "enleve la
  couleur or, choisis l'une ou l'autre des autres, jamais le tout" → **revenu a la charte officielle (navy +
  cyan)**, l'or/cuivre est completement retire. `--cyan:#22c3e6`, `--cyan-d:#0f92b8`, `--teal:#0c7c9c` (valeurs
  d'origine). `--gold` n'est plus un ton or : aligne sur `--cyan-d` pour ne pas reintroduire une 3e couleur hors
  charte. `--navy`/`--navy2`/`--navy3` n'ont jamais change. `--dell:#0f7fc0` **volontairement inchange** dans
  les deux versions : c'est le vrai bleu de marque Dell, pas l'accent du site.
- Fonds clairs restes ivoire (`--surface`/`--surface2`/`--tint`/`--line`, plus chauds qu'a l'origine) : ce
  changement du 2026-09-11 n'a pas ete remis en cause par la correction du 2026-09-14 (qui portait sur la
  couleur d'accent, pas sur les fonds neutres) — a confirmer si Wilfried voulait aussi revenir sur les fonds.
- **Toutes les couleurs codees en dur (hors variable CSS) ont ete re-basculees en cyan le 2026-09-14** :
  `assets/style.css` (`rgba(34,195,230,...)`, degrade texte de `.hero h1 .rot`, `.spot-badge`), `assets/app.js`
  (particules et lignes du reseau anime du hero), `assets/admin.js` (`themeColors()` et couleurs du donut
  Analyse), `a-propos.html` (degrade SVG inline), `supabase/functions/notifier-suivi/index.ts` (barre de
  progression de l'e-mail — **ne prendra effet qu'apres redeploiement manuel de la fonction sur Supabase**, le
  depot Git n'est pas relie automatiquement). Si la couleur doit encore changer un jour, chercher `217,164,65`
  et `230,190,120` (residus de l'essai or/cuivre) pour verifier qu'aucune trace ne reste.

## Refonte du 2026-09-25 (retour "Elements de correction site e-commerce 20260924")

Six points bloquants remontes par l'equipe apres test de www.roots-co.fr, tous traites.

- **Prix (bloquant)** : les 155 articles Dell importes le 2026-09-16 avaient ete convertis en
  `euros x 655,957 x 1,2` (une TVA de 20 % ajoutee par erreur) puis affiches "HT". Tous faux. Regle
  definitive : **FCFA HT = colonne PRIX de `ROOTS Promo Dell SEPTEMBRE 2026C.xlsx` (euros HT) x 655,957**,
  sans aucun coefficient. Verifie article par article : 158 fiches Dell conformes a l'Excel. Les 22 HP/Lenovo
  gardent le prix du fichier Descriptifs (colonne `PRIX EN VENTE HT`, seule source disponible pour ces
  marques). Le taux 655,957 est code en dur dans `shop.js` (plus lu depuis `parametres`, pour qu'un reglage
  ne puisse plus desynchroniser le panier des fiches). Le panier deja enregistre dans le navigateur d'un
  visiteur est resynchronise au chargement (prix repris des fiches, articles retires supprimes).
- **Doublons** : 18 fiches retirees (16 fiches historiques qui doublonnaient une fiche construite depuis
  l'Excel, a un ancien prix ; RTS_2026360028 doublon de 715988-PV14250 ; RTS_2026360026 absent de l'Excel
  de septembre). Boutique : 198 -> 180 fiches. Desactivees (`actif = false`), pas supprimees, en base.
- **Noms et categories** : 88 fiches renommees d'apres le libelle Excel (ex. "Dell Accessories Apc" ->
  "Etagere fixe 1U pour baie", "Dell Cable" -> "Alimentation serveur Dell 700 W"). Stockage, reseau et baies
  ranges avec les serveurs (filtre "Serveurs, stockage et reseau").
- **Recherche** : chaque fiche porte un index (`data-search`) : nom, caracteristiques, synonymes de categorie,
  themes d'usage (bureautique, comptabilite, graphisme, mobilite...). `shop.js` cherche mot par mot (tous les
  mots doivent se retrouver), accepte les debuts de mot, les pluriels, "16 Go" = "16go", ignore les mots vides.
- **Compte obligatoire** : "Valider ma commande" ouvre une etape "Votre compte client" (connexion ou
  creation). Plus aucune commande sans compte (politique RLS `anon insert` supprimee). L'e-mail de la
  commande est celui du compte (non modifiable). Le lien de confirmation d'e-mail ramene au panier
  (`?commande=1`). A la connexion, `rattacher_mes_commandes()` rattache au compte les anciennes commandes
  passees sans compte avec la meme adresse e-mail confirmee. La reference `RC-...` est visible dans l'espace client.
- **Notifications** : declencheurs `notifier_commande` / `notifier_devis` (pg_net) -> fonction Edge
  `notifier-admin` -> e-mail a l'equipe (ADMIN_EMAILS) + accuse de reception au client (Resend). Secret
  partage dans la table privee `interne_config` et le secret Edge `NOTIF_SECRET` (valeur jamais dans le depot).
- **Devis** : le formulaire de contact enregistre la demande dans la table `devis` (plus de WhatsApp), reference
  `DV-...`, champ anti-robot cache. Secours : si l'enregistrement echoue, lien mailto pre-rempli vers sales@roots.ws.
- **Lien de validation "localhost"** : reglage Supabase (Authentication > URL Configuration > Site URL),
  pas du code. `emailRedirectTo` ajoute dans `shop.js` et `account.js`.
- **Presentation** : ouverture de la boutique allegee (encart "Comment lire les prix", bloc "Ce que ce statut
  change pour vous", etapes, packs et guide retires). Promesse "toutes les references disponibles, quelle que
  soit la quantite" retiree (fausse). `catalogue.html` : vitrines reconstruites depuis les fiches corrigees,
  "Nos meilleures ventes" renomme "Une selection de la boutique" (aucune donnee de ventes). Assistant :
  21 fiches produit reecrites (prix Excel), "disponible en toute quantite" retire.
- SQL : `assets/refonte-2026-09-25-structure.sql` (bloc 1) puis `assets/refonte-2026-09-25-prix.sql` (bloc 2).
- Scripts de travail (hors depot) : `truth.py` (table de verite prix/noms), `patch_boutique.py`, `patch_catalogue.py`.

## Prix : hors taxes (HT) uniquement, depuis le 2026-09-11

> Remplace en partie par la refonte du 2026-09-25 ci-dessus : les prix Dell listes ci-dessous sont perimes.

- Decision de Wilfried : **plus aucun prix TTC affiche sur le site**, ni cote client ni dans les reponses de
  l'assistant. Le fichier `Downloads/Descriptifs de communication_ site e-commerce.xlsx` fourni par Wilfried
  donne les prix HT de reference (colonne `PRIX EN VENTE HT`).
- `boutique.html` : les 22 boutons produits utilisent `data-ht="<eur>"` (avant : `data-ttc`). `shop.js` : panier,
  recapitulatif, e-mail de commande et `buildRecord()` calculent tout en HT (`it.ht`, `unit_ht_eur` dans
  `orders.items`). Les anciennes commandes enregistrees avant cette date ont encore `unit_ttc_eur` dans leur
  JSON `items` : ne pas essayer de les "corriger" retroactivement, c'est un historique reel.
  - Catalogue interne de reference (HT en FCFA, source `catalog.sql`, **prix Dell mis a jour le 2026-09-11**,
    refs renommees le 2026-09-14, voir sections suivantes) : RTS_2026360025=748252, RTS_2026360026=723493,
    RTS_2026360027=549355, RTS_2026360028=624457, RTS_2026360029=706987, DP14E-i5W=621158 (inchange, pas de
    code RTS connu), DP15E=508856 (inchange, pas de code RTS connu), QCS1250N=560799, TOWER-W11=560799,
    QC1250N=442181, TOWER-i5=490611, QBT1250N=519385, E2425HSM=80716, S2425HSM=84224, S2725HSM=105281,
    MS116=6315, KM5221W=20357, KM7120W=40708, KB216=8422, WD25=108789, WD25-3Y=113003, WD25TB4=168447.
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
  `boutique.html`, `catalogue.html` et `assets/kb.js` pour RTS_2026360025 (ex-DC16250), RTS_2026360026
  (ex-DP14-120U), RTS_2026360027 (ex-DP14E-i3U), RTS_2026360028 (ex-DP14E-i3W) et RTS_2026360029
  (ex-DP14E-i5U) (les 2 seuls Dell laptop non couverts par cet Excel, DP14E-i5W et DP15E, gardent leur ancien
  prix ET leur ancienne reference, faute de code RTS connu pour eux). SQL de mise a jour :
  `assets/price-updates-2026-09-11.sql`.

## References produits : passage aux numeros d'identification officiels (RTS_..., 2026-09-14)

- **Consigne directe ("AH")** : "utiliser les numeros d'identification suivants en reference" — le "Ref."
  affiche au client doit correspondre au vrai code interne de suivi (`ITEM_CODE` de l'Excel fournisseur,
  format `RTS_2026360XXX`), pas a un raccourci invente par Claude (`DC16250`, `AD0W1ET`...).
- **27 produits renommes** (les 5 Dell + les 22 HP/Lenovo qui ont un `ITEM_CODE` connu dans l'Excel) :
  partout ou l'ancien code apparaissait (`boutique.html` : badge "Ref.", `data-ref` des boutons, texte de
  recherche ; `catalogue.html` ; `assets/kb.js` ; `assets/catalog.sql` ; `assets/catalog-hp-lenovo.sql` ;
  `admin.html`/`assets/admin.js` : exemple du modele CSV), remplace par le code RTS correspondant. Mapping
  complet dans `assets/catalog.sql` et `assets/catalog-hp-lenovo.sql` (colonne `ref`).
  **Les noms de fichiers image ne changent pas** (ex. `assets/produits/DC16250.png` reste tel quel meme si le
  produit s'appelle maintenant `RTS_2026360025`) : seule la reference visible/le `ref` en base changent, pas
  les chemins d'assets internes.
- **16 produits gardent leur ancienne reference courte**, faute de code RTS connu pour eux (pas dans l'Excel
  fournisseur) : DP14E-i5W, DP15E, QCS1250N, TOWER-W11, QC1250N, TOWER-i5, QBT1250N, E2425HSM, S2425HSM,
  S2725HSM, MS116, KM5221W, KM7120W, KB216, WD25, WD25-3Y, WD25TB4. **A demander a Wilfried** : leurs vrais
  codes RTS s'ils existent, pour finir l'uniformisation.
- **SQL a coller dans Supabase** : `assets/price-updates-2026-09-11.sql` fait maintenant le prix ET le
  renommage en une seule commande (`update ... set ref='RTS_...', prix_ht_fcfa=..., prix_ttc_fcfa=... where
  ref='ancien_ref'`), puisque la base de Wilfried a encore les anciennes references tant qu'il n'a rien colle.
  **A coller AVANT** `assets/catalog-hp-lenovo.sql` (qui, lui, insere directement avec les codes RTS finaux).
  **Attention** : une fois ce renommage fait, ne plus recoller `assets/catalog.sql` tel quel sur cette meme
  base — il contient maintenant les references RTS directement (bon pour une installation neuve), et son
  `on conflict (ref)` ne "verrait" plus les 5 lignes Dell comme deja existantes si elles etaient encore sous
  l'ancien nom, risquant de creer des doublons.

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

- Brancher le compte marchand de paiement quand ouvert (0,5 a 1 j par prestataire). **`CART_ENABLED` remis a
  `true` le 2026-09-16** (decision reunion : une commande doit atteindre le tableau de bord admin meme sans
  paiement automatique, seul le paiement en ligne reste manuel — virement/mobile money regles hors ligne).
- Coller `assets/cron.sql` dans Supabase pour planifier `taux-change` (pas encore fait).
- Verifier le domaine Resend (`roots.services` ou `roots.ws`) pour pouvoir notifier les vrais clients, pas seulement le compte Resend.
- Wiring `boutique.html` pour lire le catalogue depuis Supabase au lieu du HTML fige.
- Publication automatique des posts reseaux sociaux (comptes Meta / LinkedIn Business + revue d'app).
- Refonte visuelle : palette or/cuivre appliquee le 2026-09-11 (voir section Palette de couleurs). Reste a affiner si besoin : fond de page (motifs/degrades) et redeployer `notifier-suivi` pour que l'e-mail de suivi reprenne aussi la nouvelle couleur.
- **Correction du 2026-09-16 (apres-midi) : le retrait des 22 HP/Lenovo du matin etait une erreur.**
  Wilfried a confirme en reecoutant/relisant le fichier `Descriptifs de communication_ site e-commerce.xlsx`
  qu'il contient bien **27 references officielles** (5 Dell + 22 HP/Lenovo, toutes deja codees
  `RTS_2026360XXX` dans le fichier source lui-meme), pas 22. Les 22 HP/Lenovo ont ete remises en place dans
  `boutique.html` (recuperees depuis l'historique git, commit `8cc39a1`), plus un second fichier
  `ROOTS Promo Dell SEPTEMBRE 2026C.xlsx` (184 lignes de stock Dell a liquider en France) a ete fusionne :
  154 references uniques ajoutees apres dedoublonnage (3 references communes aux deux fichiers ecartees :
  505474-DC16250, 715987-PV14250, 715986-PV14250 ; consolidation des lignes strictement identiques du
  fichier stock ; 1 collision de reference retiree, voir plus bas). **Catalogue final : 198 references.**
  SQL complet (restauration HP/Lenovo + 154 nouvelles, galerie photo incluse) :
  `assets/catalog-fusion-2026-09-16-v2.sql` — **a coller dans Supabase SQL Editor par Wilfried, pas encore
  fait**. Idempotent : peut etre relance sans risque quel que soit l'etat actuel de la base.
  - **Prix des 154 nouvelles references** : calcule (prix EUR du fichier stock) x 655,957 (taux fixe du
    site) x **1,20** (marge deduite des 3 references communes aux deux fichiers, qui donnaient un ratio
    reel entre 1,18 et 1,22 une fois converties au prix de vente deja approuve) — **a verifier par Wilfried
    des que possible**, marge appliquee uniformement en attendant une confirmation ligne par ligne.
  - **Photos** : reelles et officielles pour les familles a plus forte visibilite, sourcees le 2026-09-16 sur
    dell.com (`dell-pro-14.png`, `dell-pro-tower.png`, `dell-poweredge-server.png`, plus reutilisation de
    `S2425HSM.png` deja au depot pour les nouveaux ecrans). **Pour toutes les autres familles nouvelles**
    (Latitude, OptiPlex, XPS, Pro Essential/Plus/Premium/Max, memoire, cables, cles USB, antivols, etc.),
    la photo de la famille visuellement la plus proche est reutilisee **a titre temporaire** — ce n'est pas
    encore une photo dediee par reference comme pour les 27 premieres. A ameliorer en suivant.
  - **Categories admin vs site** : `categorie_id` en base reste limite aux 5 valeurs existantes
    (`portables, bureau, ecrans, accessoires, stations` — contrainte de cle etrangere vers `categories`),
    alors que `boutique.html` affiche desormais 9 filtres plus fins cote client (dont `server`, `memory`,
    et `accessory` en plus des 6 d'origine) : ce sont deux vocabulaires separes, le filtre fin n'existe que
    dans le HTML/JS, pas en base.
- Demander a Wilfried les vrais codes RTS des 16 produits qui n'en ont pas encore (voir section "References
  produits") — question moins urgente maintenant que les produits HP/Lenovo sont retires, mais les 5 Dell
  renommes restent concernes si un futur lot est ajoute.
- **`roots-co.fr` / migration hors GitHub Pages** : hebergeur = **LWS** (formule Perso, compte LWS-825594).
  Diagnostic du 2026-09-16 : les identifiants FTP recus par mail (`ftp.roots-co.fr`) sont corrects, ET les
  nameservers du domaine pointent deja bien chez LWS (`ns17-20.lwsdns.com`, verifie par `nslookup -type=NS`).
  Le blocage n'est PAS un probleme d'upload ni de DNS non propage : `roots-co.fr` et `www.roots-co.fr`
  renvoient tous les deux un **301 HTTP servi par LWS lui-meme** vers `https://rootsandcotech-create.github.io/Roots-Co/`
  (verifie par `curl -I`, IP `83.229.19.94`, en-tete `Edge-Cache-Engine-Mode`). C'est une regle de
  redirection/parking configuree dans la zone DNS ou le panel LWS (probablement mise en place avant l'achat
  de l'hebergement, quand le domaine ne faisait que pointer vers l'ancien site GitHub Pages) qui prend le pas
  sur les fichiers uploades en FTP. **Correctif a faire par Wilfried dans `panel.lws.fr`** : section domaine
  `roots-co.fr` → chercher une redirection d'URL / "Web Redirect" existante et la supprimer (ou la remplacer
  par "pointer vers l'hebergement") pour que le DNS serve enfin les fichiers FTP au lieu de rediriger. Une
  fois corrige, mettre a jour cette section (comment publier desormais, devenir de `origin`/`old-origin`).

## Journal des livraisons

- 2026-09-25 (soir) : commande par WhatsApp. Panier masque (pas supprime) via `WA_MODE = true` dans `shop.js` (classe `wa-mode` sur body). Clic sur une fiche, sur son bouton Commander ou sur le bouton de la fenetre Details : ouverture de wa.me/22999565252 avec nom, reference et prix FCFA HT pre-remplis. Remettre `WA_MODE = false` pour revenir au panier avec compte client (tout le code reste en place).
- 2026-09-25 : refonte suite au retour "Elements de correction site e-commerce 20260924" : prix Dell recalcules depuis l'Excel (erreur x1,2), 18 doublons retires, 88 noms corriges, recherche par themes, compte obligatoire avant commande, rattachement des anciennes commandes, notifications e-mail commandes et devis, devis par formulaire (plus WhatsApp), ouverture de boutique allegee. Voir section "Refonte du 2026-09-25".
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
- 2026-09-14 : retour de correction recu (fichier "Elements de correction AH 2.0 V3 e-commerce.pptx") →
  couleur revenue a la charte officielle Roots (bleu marine + cyan, decidee en reunion le 13/08/2026), or/cuivre
  retire partout (voir "Palette de couleurs"). Police unifiee sur EB Garamond, titres et texte (voir
  "Typographie"). Numero de telephone corrige dans le message "envoi automatique pas encore disponible" et
  dans le message d'echec d'envoi (`assets/shop.js`) : utilisaient encore l'ancien numero Togo, remplaces par
  le numero WhatsApp actif +229 99 56 52 52. 27 references produits renommees vers les codes d'identification
  officiels `RTS_2026360XXX` fournis par Wilfried (voir "References produits"), 16 gardent leur ancienne
  reference faute de code connu. Decouvert et documente : un push trop rapide apres un autre fait echouer le
  deploiement GitHub Pages (deploiement concurrent refuse), ce qui explique pourquoi certains changements du
  2026-09-11 n'etaient pas encore visibles en ligne le 2026-09-14 malgre des commits corrects sur `origin`.
  `roots-co.fr` verifie : redirige deja vers le site GitHub Pages actuel, la migration vers un nouvel
  hebergement FTP reste a faire (bloquee, identifiants necessaires cote Wilfried).
- 2026-09-15 : diagnostic de l'ecart 44 (site) / 66 (Supabase) confirme : `catalog-hp-lenovo.sql` colle deux
  fois (anciennes references puis RTS) a duplique 22 fiches HP/Lenovo. Correctif livre
  (`assets/fix-duplicate-hp-lenovo-2026-09-15.sql`), en attente d'execution par Wilfried dans Supabase.
  Deploiement GitHub Pages du 2026-09-14 confirme reussi (`gh run list`), le site public est bien a jour.
- 2026-09-16 : suite reunion Wilfried/Richmond. Retrait complet des 22 produits HP/Lenovo (site + Supabase,
  voir "Reste a faire"), boutique repassee a 22 references Dell. `CART_ENABLED` remis a `true` : une commande
  passe desormais toujours vers le tableau de bord admin, seul le paiement en ligne reste manuel/suspendu.
  Icone assistant remplacee par un avatar robot (au lieu d'une bulle generique), icone WhatsApp remplacee par
  le vrai logo de marque (chemin SVG officiel Simple Icons) sur les 25 pages publiques. Diagnostic complet du
  blocage `roots-co.fr` : ni un souci d'upload FTP ni de DNS non propage, mais une redirection 301 encore
  active cote LWS vers l'ancien site GitHub Pages (voir "Reste a faire" pour le correctif exact).
- 2026-09-16 (apres-midi) : correction du retrait des 22 HP/Lenovo du matin (erreur, voir "Reste a faire") —
  le fichier source contient 27 references, pas 22. Fusion avec le fichier de stock Dell a liquider
  (`ROOTS Promo Dell SEPTEMBRE 2026C.xlsx`, 184 lignes) : 155 references uniques ajoutees apres
  dedoublonnage. Catalogue final 199 references, SQL fourni, pas encore colle dans Supabase par Wilfried.
  Marge de vente de 20% appliquee aux nouvelles references (a confirmer), photos officielles Dell sourcees
  pour les familles les plus visibles, reste temporaire pour les autres.
- 2026-09-16 (soir) : Wilfried signale qu'un meme visuel etait reutilise sur trop de produits differents —
  **galerie photo ajoutee** (`.bxd-thumbs` en CSS/JS, `assets/style.css` et `assets/shop.js`) : la fiche
  detail d'un produit peut desormais afficher plusieurs photos (vignettes cliquables sous la photo
  principale, `data-full` sur chaque vignette). 20 nouvelles photos officielles Dell sourcees pour separer
  les familles qui partageaient une meme image (Dell Pro 14/16/Plus/Premium/Max, Dell Plus 14, Latitude,
  XPS 14, tours Essential/Micro/Slim/Plus/Max Micro, OptiPlex, ecran S2725HSM) ; les familles les plus
  visibles (Dell Pro 14, tour Dell Pro, ecran S2425HSM, serveur PowerEdge R760, dock WD25) ont 2 photos en
  galerie. Un vrai doublon de reference a ete corrige au passage : le code `MS116` du fichier stock entrait
  en collision avec le `MS116` deja au catalogue (meme souris) — retire, catalogue final **198** references
  (pas 199).
- 2026-09-16 (soir, suite) : deuxieme retour de Wilfried sur les photos ("des produits differents avec
  exactement la meme photo, ce n'est pas pro"). Ajouts : 4 nouvelles categories de photos officielles Dell
  (chargeur `dell-power-adapter.png`, ecouteurs `dell-earbuds.png`, sac `dell-backpack.png`, cable
  `dell-cable-hdmi.png`) qui remplacent la reutilisation generique de la photo du dock WD25 ; 3e photo
  (`dell-pro-14-gray.png`) pour la famille Dell Pro 14/16, avec **rotation** de l'image de couverture d'une
  fiche a l'autre (`FAM_ROTATE_COUNTER` dans le generateur) pour que les 13 fiches de cette famille ne
  montrent plus toutes exactement la meme image en premier. **Bandeau rouge ajoute sur les 154 nouvelles
  fiches** (`.bxpromo` en CSS, texte "Prix actuel, susceptible d'evoluer") : ces prix sont calcules
  automatiquement (regle de marge 1,20, voir plus haut) et pas encore valides ligne par ligne, contrairement
  aux 27 references d'origine qui n'ont pas ce bandeau. Nouveau SQL : `assets/catalog-fusion-2026-09-16-v3.sql`
  (remplace v1 et v2), toujours pas colle dans Supabase — Wilfried confirme n'avoir encore rien colle des
  fichiers SQL livres aujourd'hui.
  **Reste a faire (photos)** : memoire, cadenas, batteries externes, cles USB n'ont pas encore de photo
  dediee (recherche infructueuse sur dell.com, probablement des references qui ne sont plus vendues neuves
  par Dell), ils reutilisent la photo du dock WD25 a titre neutre.
- 2026-09-18 : Wilfried signale que le bandeau prix n'est pas assez visible (petit texte rouge) et que la
  galerie photo ne fonctionne toujours pas ("une seule photo" en boutique et en admin). Diagnostic : la
  fonctionnalite de galerie marchait deja techniquement (verifie en direct par capture d'ecran), mais
  seulement **37 des 154** nouvelles fiches avaient reellement une 2e/3e photo differente sourcee ; les 117
  autres n'avaient qu'une seule image (donc une seule vignette, pas de galerie visible) — un manque de
  contenu, pas un bug. Correctif : **15 nouvelles photos officielles Dell** sourcees (2e angle par famille :
  OptiPlex, Latitude, PowerEdge, cable HDMI, sac a dos, chargeur, souris MS116, Pro 14 Slim/Micro/Max,
  Pro Premium 13, XPS 14, tour Plus...) portant la couverture a **139/154** (90 %) fiches avec galerie
  2-3 photos. Bandeau prix refondu en vrai bandeau visible (`.bxpromo` : fond rouge plein, icone triangle
  d'alerte, police EB Garamond agrandie a 15-16px, ombre portee) au lieu du petit texte 11px illisible.
  `boutique.html` regenere (154 fiches, memes refs/ordre, verifie), anti-cache relance (`202609181307`),
  `scripts/verif.py` passe, deploiement GitHub Pages confirme reussi. **Fichiers SQL etape-2 a etape-5
  regeneres et relivres** avec les memes galeries etendues (colonne `images`), a recoller dans Supabase par
  Wilfried pour que le tableau de bord admin (qui lit `images` depuis Supabase, pas depuis le HTML
  statique) affiche lui aussi les galeries.
  **Reste a faire** : KB216 (clavier, 7 fiches), KM5221W (3 fiches), DB14250 (1) et FCM2250-maxmicro (1)
  restent a une seule photo — pas de 2e angle officiel trouve sur dell.com sans risquer d'associer la
  mauvaise photo a la mauvaise reference. Acces Chrome/Drive de Wilfried (`claude-in-chrome`) toujours
  deconnecte a cette date : resynchronisation complete du classeur Google Sheets
  "ROOTS_Centralisation_Projets" (dates + contenu de toute la conversation) en attente de reconnexion.
