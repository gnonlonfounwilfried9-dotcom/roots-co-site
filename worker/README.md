# Brancher le modèle Claude sur l'assistant du site

L'assistant fonctionne aujourd'hui **sans clé** : il répond depuis `assets/kb.js`,
118 fiches tirées du manuel de communication (savoir-faire, produits et prix,
partenaires, conseils sécurité, informations pratiques).

Pour qu'il réponde en langage naturel à n'importe quelle question, il faut le
brancher sur un modèle Claude. Le site étant hébergé sur GitHub Pages, **la clé API
ne peut pas être mise dans le site** : tout ce qui est dans le dépôt est public, et
une clé publiée est une clé volée dans l'heure. Il faut donc un petit relais entre
le site et l'API. Le fichier `roots-chat-worker.js` est ce relais, prêt à déployer.

## Ce qu'il faut avoir

1. Un compte **Anthropic Console** (console.anthropic.com) avec du crédit, et une clé API.
2. Un compte **Cloudflare** (gratuit).

Ces deux comptes doivent être créés par ROOTS : la clé API engage une facturation,
elle doit rester sous le contrôle de l'entreprise.

## Déploiement, environ dix minutes

1. Sur **dash.cloudflare.com**, ouvrir *Workers & Pages*, puis *Create* → *Start with Hello World* → *Deploy*.
   Nommer le worker `roots-chat`.
2. Cliquer sur *Edit code*, effacer le contenu par défaut, coller tout le fichier
   `roots-chat-worker.js`, puis *Deploy*.
3. Aller dans *Settings* → *Variables and Secrets* et ajouter :

   | Nom | Type | Valeur |
   |---|---|---|
   | `ANTHROPIC_API_KEY` | Secret | la clé de la console Anthropic |
   | `ALLOWED_ORIGIN` | Text | `https://gnonlonfounwilfried9-dotcom.github.io` |

   Quand le site passera sur le domaine définitif (par exemple `https://roots.ws`),
   remplacer `ALLOWED_ORIGIN` par cette adresse.
4. Copier l'adresse du worker, de la forme
   `https://roots-chat.<votre-compte>.workers.dev`.
5. Dans le site, ouvrir `assets/chat-config.js` et coller cette adresse :

   ```js
   window.ROOTS_CHAT_API = 'https://roots-chat.votre-compte.workers.dev';
   ```

6. Publier. L'assistant passe automatiquement en mode modèle.

## Comportement

- Le site envoie au relais : la question, les dix fiches les plus proches, et les
  trois derniers échanges.
- Le relais ajoute les consignes (répondre en français, ne jamais inventer un prix
  ni une référence, ne jamais annoncer une rupture de stock, orienter vers un devis)
  et interroge Claude.
- **Si le relais est injoignable ou renvoie une erreur, l'assistant repasse tout seul
  en mode local.** Le visiteur a toujours une réponse.

## Coût

Le worker Cloudflare est gratuit jusqu'à 100 000 requêtes par jour. Seuls les appels
au modèle sont facturés par Anthropic, à l'usage. Le contexte envoyé est volontairement
limité aux dix fiches utiles, pas à la base entière, pour contenir la dépense.

## Sécurité

- La clé n'est jamais exposée : elle reste dans les variables du worker.
- `ALLOWED_ORIGIN` empêche un autre site d'utiliser votre relais à vos frais.
- Le relais tronque la question, le contexte et l'historique pour éviter les abus.
