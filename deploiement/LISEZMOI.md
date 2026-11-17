# ROOTS & Co : du brouillon à la production, sans décalage

## Les trois endroits

| Rôle | Où | Adresse |
|---|---|---|
| Brouillon (on teste ici) | Dépôt GitHub de Wilfried, publié par GitHub Pages | https://gnonlonfounwilfried9-dotcom.github.io/roots-co-site/ |
| Source de vérité | Dépôt GitHub du client, branche `main` | github.com/rootsandcotech-create/Roots-Co |
| Production (le vrai site) | Hébergement cPanel | https://roots-co.fr |

## La règle

1. Tout changement est d'abord poussé sur le **brouillon**. On le valide avec Richmond et l'équipe.
2. Quand c'est validé, le même commit est poussé sur le **dépôt du client** (`main`). C'est la source de vérité.
3. L'hébergement cPanel **récupère `main` tout seul** (voir plus bas). Plus de zip à envoyer, plus de décalage.

Constat du 17/11/2026 : la production affichait encore la version du 12 novembre. Les fichiers déposés à la main avaient 5 jours de retard (pas de page Savoir faire, ancienne adresse e-mail dans les pages). C'est ce que cette règle supprime.

## Brancher cPanel sur le dépôt (une seule fois, par le responsable technique)

1. cPanel, **Git Version Control**, bouton **Create**.
2. Cocher **Clone a Repository**. URL de clonage : `https://github.com/rootsandcotech-create/Roots-Co.git`. Chemin du dépôt : `repositories/roots-co`. Valider.
3. Copier `deploiement/cpanel.yml.modele` à la racine du dépôt sous le nom `.cpanel.yml` (via le dépôt, pas à la main sur le serveur). Remplacer `CPANELUSER` par le nom d'utilisateur cPanel.
4. Copier `deploiement/htaccess.txt` dans `public_html` sous le nom `.htaccess` (force le HTTPS et active le cache).
5. Dans Git Version Control, ouvrir le dépôt puis **Update from Remote** puis **Deploy HEAD Commit**.
6. Après chaque validation du client : même bouton, deux clics. (Une fois le webhook ou le cron en place, c'est automatique : voir ci dessous.)

Mise à jour automatique : dans cPanel, **Tâches Cron**, ajouter toutes les 10 minutes :
`cd /home/CPANELUSER/repositories/roots-co && git pull origin main && /bin/bash deploiement/deployer.sh`

## Sous-domaines

Les dossiers du zip `ROOTS_sous_domaines_*.zip` se déposent dans les dossiers racines des sous-domaines (voir `sous-domaines/LISEZMOI.txt`). Ils chargent le style et le pied de page depuis `https://roots-co.fr/assets/`, donc la mise à jour du site principal les met à jour tous.

## Base de données (Supabase)

Rien à déplacer : le site appelle Supabase depuis le navigateur. Les scripts SQL (`assets/*.sql`) ne sont pas copiés sur l'hébergement.

## En cas de problème

- Page ancienne après une mise à jour : vider le cache du navigateur, puis vérifier la date du dernier déploiement dans Git Version Control.
- Rollback : dans Git Version Control, choisir le commit précédent, puis **Deploy**.
