-- ROOTS & Co : planifie l'appel quotidien de la fonction Edge taux-change
-- (mise a jour automatique du taux dollar). A coller UNE SEULE FOIS dans
-- Supabase > SQL Editor > New query > Run.
-- Si la premiere ligne echoue avec un message de permission, allez plutot dans
-- Database > Extensions, cherchez "pg_cron" et "pg_net", activez les deux avec
-- le bouton, puis revenez ici et relancez seulement le bloc "select cron.schedule".

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'taux-change-quotidien',
  '0 6 * * *',
  $$
  select net.http_post(
    url := 'https://uqhrlgrryjlqoqpkrixv.supabase.co/functions/v1/taux-change',
    headers := jsonb_build_object(
      'Authorization', 'Bearer sb_publishable_kwoQ1rQo2nrmPW85WiwRtQ_A32t8Ks8',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Verification : voir la tache planifiee
-- select * from cron.job;
-- Verification apres 6h (heure de Lome/Cotonou, UTC+0, donc pas de decalage a calculer) :
-- select * from cron.job_run_details order by start_time desc limit 5;

-- Pour supprimer la planification si besoin un jour :
-- select cron.unschedule('taux-change-quotidien');
