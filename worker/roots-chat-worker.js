/**
 * ROOTS - relais entre le site et le modele Claude.
 *
 * A deployer sur Cloudflare Workers (gratuit jusqu'a 100 000 requetes par jour).
 * La cle API reste ici, cote serveur : elle n'apparait jamais dans le site.
 *
 * Variables a definir dans le tableau de bord Cloudflare (Settings > Variables) :
 *   ANTHROPIC_API_KEY  : la cle secrete du compte Anthropic
 *   ALLOWED_ORIGIN     : https://gnonlonfounwilfried9-dotcom.github.io  (ou le domaine final)
 *
 * Voir worker/README.md pour la procedure complete.
 */

const MODEL = 'claude-sonnet-5';

const SYSTEM = `Tu es l'assistant du site de ROOTS Informatique & Technologies.

ROOTS est une entreprise d'ingenierie informatique et de negoce international, presente au Togo (Lome),
au Benin (Cotonou), en France et aux Etats-Unis. Deux poles : informatique et technologie d'une part,
import-export et logistique d'autre part. ROOTS est partenaire officiel Dell et travaille avec quinze
marques (Dell, HP, Microsoft, SAP, Odoo, Fortinet, Sophos, Acronis, Synology, Huawei, Ubiquiti, PLANET,
APC by Schneider Electric, Axis, Hikvision).

Regles de reponse :
- Reponds en francais, sur un ton professionnel, direct et chaleureux. Tutoiement interdit, vouvoiement.
- Reponds UNIQUEMENT a partir des fiches fournies dans le contexte. Si l'information n'y est pas,
  dis-le simplement et propose d'ecrire sur WhatsApp au +229 01 99 56 52 52 ou a sales@roots.ws.
- N'invente jamais un prix, un delai, une reference produit ni une certification.
- Les prix sont en FCFA (prix principal, TTC) et en euros. TVA 18 %. Taux fixe 1 EUR = 655,957 FCFA.
- Toutes les references sont disponibles en toute quantite : ne dis jamais qu'un produit est en rupture,
  ni combien il reste de pieces. Pour une quantite precise, oriente vers un devis.
- Reste court : trois a six phrases, sauf si on te demande explicitement un detail.
- Termine par une question utile ou une proposition concrete quand c'est pertinent.`;

export default {
  async fetch(request, env) {
    const origin = env.ALLOWED_ORIGIN || '*';
    const cors = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: cors });

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'json invalide' }, 400, cors);
    }

    const question = String(body.question || '').slice(0, 1000);
    const context = String(body.context || '').slice(0, 20000);
    const history = Array.isArray(body.history) ? body.history.slice(-6) : [];
    if (!question) return json({ error: 'question vide' }, 400, cors);

    const messages = [];
    for (const h of history) {
      if (h && h.q && h.a) {
        messages.push({ role: 'user', content: String(h.q).slice(0, 500) });
        messages.push({ role: 'assistant', content: String(h.a).slice(0, 1500) });
      }
    }
    messages.push({
      role: 'user',
      content: `Fiches ROOTS pertinentes pour cette question :\n\n${context}\n\n---\nQuestion du visiteur : ${question}`,
    });

    let r;
    try {
      r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 700,
          system: SYSTEM,
          messages,
        }),
      });
    } catch {
      return json({ error: 'api injoignable' }, 502, cors);
    }

    if (!r.ok) return json({ error: 'api erreur ' + r.status }, 502, cors);

    const data = await r.json();
    const answer = (data.content || [])
      .filter((c) => c.type === 'text')
      .map((c) => c.text)
      .join('\n')
      .trim();

    if (!answer) return json({ error: 'reponse vide' }, 502, cors);
    return json({ answer }, 200, cors);
  },
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors },
  });
}
