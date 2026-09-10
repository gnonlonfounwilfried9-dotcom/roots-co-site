// ROOTS & Co : reception des confirmations de paiement.
// Fonction Edge Supabase. A deployer quand le compte marchand est pret :
//   supabase functions deploy paiement-webhook --no-verify-jwt
// Puis coller l'URL publique de la fonction dans le tableau de bord du prestataire
// (FedaPay, PayDunya, Flutterwave...) comme "webhook" ou "callback".
//
// Variables a definir (Supabase, Edge Functions, Secrets) :
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  (fournis par Supabase)
//   PAY_PROVIDER            = fedapay | paydunya | flutterwave
//   PAY_WEBHOOK_SECRET      = secret de verification du prestataire

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const sb = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);
const PROVIDER = Deno.env.get("PAY_PROVIDER") ?? "fedapay";
const SECRET = Deno.env.get("PAY_WEBHOOK_SECRET") ?? "";

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Methode non autorisee", { status: 405 });

  const raw = await req.text();
  let body: any;
  try { body = JSON.parse(raw); } catch { return new Response("Corps invalide", { status: 400 }); }

  // --- verification de l'authenticite du webhook (a adapter au prestataire) ---
  const sig = req.headers.get("x-fedapay-signature")
    ?? req.headers.get("verif-hash")            // PayDunya
    ?? req.headers.get("flutterwave-signature") // Flutterwave
    ?? "";
  if (SECRET && sig !== SECRET) {
    // FedaPay et Flutterwave utilisent une signature HMAC ; PayDunya un hash simple.
    // Pour FedaPay/Flutterwave, calculer le HMAC de `raw` avec SECRET et comparer.
    return new Response("Signature invalide", { status: 401 });
  }

  // --- extraction de la reference de commande et du statut ---
  // Chaque prestataire nomme les champs differemment. On passe la reference ROOTS
  // (RC-AAMMJJ-XXXX) comme "custom" / "metadata" a la creation du paiement.
  let ref = "";
  let ok = false;
  let operateur = "";
  let paiementRef = "";

  if (PROVIDER === "fedapay") {
    const t = body?.entity ?? body?.data ?? {};
    ref = t?.custom_metadata?.commande ?? t?.metadata?.commande ?? "";
    ok = (body?.name === "transaction.approved") || (t?.status === "approved");
    operateur = t?.mode ?? "";
    paiementRef = String(t?.id ?? t?.reference ?? "");
  } else if (PROVIDER === "paydunya") {
    ref = body?.data?.custom_data?.commande ?? "";
    ok = body?.data?.status === "completed";
    operateur = body?.data?.mode ?? "";
    paiementRef = body?.data?.invoice?.token ?? "";
  } else {
    const d = body?.data ?? {};
    ref = d?.meta?.commande ?? "";
    ok = d?.status === "successful";
    operateur = d?.payment_type ?? "";
    paiementRef = String(d?.id ?? d?.tx_ref ?? "");
  }

  if (!ref || !ok) return new Response("ignore", { status: 200 });

  const { error } = await sb.from("orders").update({
    paye: true,
    paye_le: new Date().toISOString(),
    paiement_operateur: operateur,
    paiement_ref: paiementRef,
    status: "confirme",
  }).eq("ref", ref);

  if (error) return new Response("erreur base : " + error.message, { status: 500 });
  return new Response("ok", { status: 200 });
});
