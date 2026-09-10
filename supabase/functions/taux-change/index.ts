// ROOTS & Co : mise a jour automatique du taux dollar vers FCFA.
// L'euro vers FCFA est une parite fixe (655,957), on n'y touche pas.
// Le dollar fluctue : cette fonction recupere le taux du jour et met a jour parametres.
//
// A deployer :   supabase functions deploy taux-change --no-verify-jwt
// A planifier une fois par jour, au choix :
//   - Supabase, Edge Functions, onglet Cron, "0 6 * * *"
//   - ou pg_cron : select cron.schedule('taux-change','0 6 * * *',
//       $$ select net.http_post(url:='https://<projet>.functions.supabase.co/taux-change',
//          headers:='{"Authorization":"Bearer <ANON_KEY>"}'::jsonb) $$);
//
// Secrets utilises (fournis par Supabase) : SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const sb = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async () => {
  // source gratuite, sans cle, XOF pour le franc CFA d'Afrique de l'Ouest
  let taux = 0;
  try {
    const r = await fetch("https://open.er-api.com/v6/latest/USD");
    const j = await r.json();
    taux = Number(j?.rates?.XOF) || 0;
  } catch (_) { /* on retentera demain */ }

  if (!taux || taux < 300 || taux > 1200) {
    return new Response(JSON.stringify({ ok: false, taux }), { status: 200 });
  }

  const { error } = await sb.from("parametres").upsert({
    cle: "taux_usd_fcfa",
    valeur: String(Math.round(taux * 1000) / 1000),
    maj_le: new Date().toISOString(),
  });

  if (error) return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 500 });
  return new Response(JSON.stringify({ ok: true, taux }), { status: 200 });
});
