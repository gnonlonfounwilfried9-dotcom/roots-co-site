// ROOTS & Co : e-mail au client a chaque etape du suivi de sa commande.
// Fonction Edge Supabase. A deployer quand le compte Resend est pret :
//   supabase functions deploy notifier-suivi
// Secrets a definir (Supabase, Edge Functions, Secrets) :
//   RESEND_API_KEY   = cle API du compte Resend (https://resend.com, gratuit < 3000/mois)
//   MAIL_FROM        = adresse d'envoi verifiee, ex. "Roots & Co <commandes@roots.ws>"
//
// Tant que RESEND_API_KEY n'est pas defini, la fonction repond "ok" sans rien envoyer :
// le tableau de bord continue de fonctionner normalement.

const KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM = Deno.env.get("MAIL_FROM") ?? "Roots & Co <onboarding@resend.dev>";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function esc(s: string) {
  return String(s ?? "").replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]!));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return new Response("Methode non autorisee", { status: 405, headers: CORS });

  let b: any;
  try { b = await req.json(); } catch { return new Response("Corps invalide", { status: 400, headers: CORS }); }

  const to = String(b.email ?? "").trim();
  if (!to || to === "supprime") return new Response(JSON.stringify({ ok: true, skipped: "pas d'email" }), { headers: CORS });
  if (!KEY) return new Response(JSON.stringify({ ok: true, skipped: "RESEND_API_KEY absent" }), { headers: CORS });

  const nom = esc(b.nom || "client");
  const ref = esc(b.ref || "");
  const etape = esc(b.etape || "");
  const pct = Number(b.pct) || 0;
  const note = esc(b.note || "");
  const eta = esc(b.eta || "");

  const html = `
  <div style="font-family:system-ui,Segoe UI,Roboto,sans-serif;max-width:520px;margin:auto;color:#0d1f33">
    <div style="background:#0c2848;color:#fff;padding:22px 24px;border-radius:12px 12px 0 0">
      <div style="font-weight:700;font-size:18px">Roots &amp; Co</div>
      <div style="color:#9fb4c9;font-size:13px">Suivi de votre commande</div>
    </div>
    <div style="border:1px solid #e0e7ef;border-top:none;border-radius:0 0 12px 12px;padding:24px">
      <p>Bonjour ${nom},</p>
      <p>Votre commande ${ref ? `<strong>${ref}</strong> ` : ""}avance : <strong>${etape}</strong>.</p>
      <div style="background:#eef2f7;border-radius:20px;height:14px;margin:14px 0;overflow:hidden">
        <div style="background:#d9a441;height:100%;width:${pct}%"></div>
      </div>
      <p style="font-size:13px;color:#58697e">${pct} % du parcours${note ? ` &middot; ${note}` : ""}${eta ? `<br>Arrivee prevue le ${eta.split("-").reverse().join("/")}` : ""}</p>
      <p style="font-size:13px;color:#58697e;margin-top:18px">Vous pouvez suivre votre commande a tout moment depuis votre espace client sur le site.</p>
    </div>
  </div>`;

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM,
      to: [to],
      subject: `Votre commande ${ref} : ${etape}`,
      html,
    }),
  });

  if (!r.ok) {
    const t = await r.text();
    return new Response(JSON.stringify({ ok: false, error: t }), { status: 502, headers: CORS });
  }
  return new Response(JSON.stringify({ ok: true }), { headers: CORS });
});
