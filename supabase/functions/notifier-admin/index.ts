// ROOTS & Co : e-mail a l'equipe a chaque nouvelle commande et chaque demande de devis,
// plus un accuse de reception au client. Appelee par la base (declencheurs notifier_commande
// et notifier_devis, voir assets/refonte-2026-09-25-structure.sql), jamais par le site.
//
// Secrets (Supabase > Edge Functions > Secrets) :
//   RESEND_API_KEY  deja defini pour notifier-suivi
//   MAIL_FROM       deja defini pour notifier-suivi
//   NOTIF_SECRET    meme valeur que la ligne notif_secret de la table interne_config
//   ADMIN_EMAILS    adresses de l'equipe, separees par des virgules
//                   (defaut : marketing-digital@roots.services, seule adresse autorisee par
//                   Resend tant que le domaine n'est pas verifie)
// Reglage de la fonction : desactiver "Verify JWT" (l'appel vient de la base, protege par NOTIF_SECRET).

const KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM = Deno.env.get("MAIL_FROM") ?? "Roots & Co <onboarding@resend.dev>";
const SECRET = Deno.env.get("NOTIF_SECRET") ?? "";
const ADMINS = (Deno.env.get("ADMIN_EMAILS") ?? "marketing-digital@roots.services")
  .split(",").map((s) => s.trim()).filter(Boolean);

function esc(s: unknown) {
  return String(s ?? "").replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]!));
}
function fcfa(n: unknown) {
  return Math.round(Number(n) || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " FCFA";
}
function eur(n: unknown) {
  return (Math.round((Number(n) || 0) * 100) / 100).toFixed(2).replace(".", ",") + " €";
}
function frame(title: string, body: string) {
  return `<div style="font-family:system-ui,Segoe UI,Roboto,sans-serif;max-width:600px;margin:auto;color:#0d1f33">
  <div style="background:#0c2848;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0">
    <div style="font-weight:700;font-size:18px">Roots &amp; Co</div>
    <div style="color:#9fb4c9;font-size:13px">${title}</div></div>
  <div style="border:1px solid #e0e7ef;border-top:none;border-radius:0 0 12px 12px;padding:22px 24px;font-size:14px;line-height:1.55">${body}</div></div>`;
}
function rows(pairs: [string, unknown][]) {
  return `<table style="border-collapse:collapse;width:100%;margin:8px 0 14px">${pairs
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([k, v]) => `<tr><td style="padding:5px 10px 5px 0;color:#58697e;white-space:nowrap;vertical-align:top">${k}</td><td style="padding:5px 0">${esc(v)}</td></tr>`)
    .join("")}</table>`;
}

async function send(to: string[], subject: string, html: string, replyTo?: string) {
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to, subject, html, ...(replyTo ? { reply_to: replyTo } : {}) }),
  });
  return r.ok ? "ok" : await r.text();
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Methode non autorisee", { status: 405 });
  if (!SECRET || req.headers.get("x-roots-secret") !== SECRET) return new Response("Refuse", { status: 401 });
  if (!KEY) return Response.json({ ok: true, skipped: "RESEND_API_KEY absent" });

  let b: any;
  try { b = await req.json(); } catch { return new Response("Corps invalide", { status: 400 }); }
  const r = b.record ?? {};
  const out: Record<string, string> = {};

  if (b.type === "commande") {
    const items = (r.items ?? []) as any[];
    const lignes = items.map((it) =>
      `<tr><td style="padding:6px 8px;border-bottom:1px solid #eef2f7">${esc(it.qty)} x ${esc(it.name)}<br><span style="color:#8a98ab;font-size:12px">Réf. ${esc(it.ref)}</span></td>
       <td style="padding:6px 8px;border-bottom:1px solid #eef2f7;text-align:right;white-space:nowrap">${fcfa((Number(it.unit_ht_eur) || 0) * 655.957 * (Number(it.qty) || 0))}</td></tr>`).join("");
    const table = `<table style="border-collapse:collapse;width:100%;margin:6px 0 4px">${lignes}
      <tr><td style="padding:8px;font-weight:700">Total HT</td><td style="padding:8px;text-align:right;font-weight:700;white-space:nowrap">${fcfa(r.total_fcfa)}<br><span style="font-weight:400;color:#58697e">${eur(r.total_eur)}</span></td></tr></table>`;
    const admin = frame(`Nouvelle commande ${esc(r.ref)}`,
      `<p><strong>Nouvelle commande sur le site.</strong> À confirmer au client (disponibilité, délai, frais de livraison).</p>${table}
       <h4 style="margin:16px 0 4px">Client</h4>${rows([["Nom", r.customer_name], ["Entreprise", r.customer_org], ["Téléphone", r.customer_tel], ["E-mail", r.customer_mail], ["Ville", r.customer_city]])}
       <h4 style="margin:10px 0 4px">Livraison et règlement</h4>${rows([["Livraison", r.ship_method], ["Adresse", r.ship_address], ["Créneau", r.ship_slot], ["Règlement", r.pay_method], ["Détail", r.pay_detail], ["Note", r.note]])}
       <p style="color:#58697e;font-size:13px">À traiter dans le tableau de bord, onglet Commandes.</p>`);
    out.admin = await send(ADMINS, `Nouvelle commande ${r.ref ?? ""} : ${fcfa(r.total_fcfa)} HT`, admin, r.customer_mail);
    if (r.customer_mail) {
      const client = frame(`Commande ${esc(r.ref)} bien reçue`,
        `<p>Bonjour ${esc(r.customer_name)},</p><p>Nous avons bien reçu votre commande <strong>${esc(r.ref)}</strong>. Notre équipe vous recontacte pour confirmer la disponibilité, le délai, les frais de livraison et le règlement. Aucun paiement n'est prélevé avant cette confirmation.</p>${table}
         <p style="color:#58697e;font-size:13px">Suivez votre commande à tout moment depuis votre espace client sur le site. Prix hors taxes.</p>`);
      out.client = await send([r.customer_mail], `Votre commande ${r.ref ?? ""} est bien reçue`, client);
    }
  } else if (b.type === "devis") {
    const admin = frame(`Demande de devis ${esc(r.ref)}`,
      `<p><strong>Nouvelle demande de devis depuis le site.</strong> Répondre directement à cet e-mail écrit au client.</p>
       ${rows([["Nom", r.nom], ["Société", r.societe], ["E-mail", r.email], ["Téléphone", r.tel], ["Page", r.page]])}
       <h4 style="margin:10px 0 4px">Besoin</h4><p style="white-space:pre-wrap;background:#f5f8fb;border-radius:8px;padding:12px">${esc(r.besoin)}</p>`);
    out.admin = await send(ADMINS, `Demande de devis ${r.ref ?? ""} : ${r.nom ?? ""}`, admin, r.email);
    if (r.email) {
      const client = frame(`Demande ${esc(r.ref)} bien reçue`,
        `<p>Bonjour ${esc(r.nom)},</p><p>Nous avons bien reçu votre demande de devis <strong>${esc(r.ref)}</strong>. Notre équipe commerciale vous répond par e-mail sous 48 heures.</p>
         <p style="white-space:pre-wrap;background:#f5f8fb;border-radius:8px;padding:12px">${esc(r.besoin)}</p>`);
      out.client = await send([r.email], `Votre demande de devis ${r.ref ?? ""}`, client);
    }
  } else {
    return new Response("Type inconnu", { status: 400 });
  }
  return Response.json({ ok: true, ...out });
});
