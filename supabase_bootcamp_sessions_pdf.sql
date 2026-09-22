-- Support de cours PDF attaché à une session de bootcamp (optionnel).
-- À exécuter dans le SQL Editor de Supabase.

ALTER TABLE public.bootcamp_sessions
  ADD COLUMN IF NOT EXISTS pdf_url TEXT;

ALTER TABLE public.bootcamp_sessions
  ADD COLUMN IF NOT EXISTS pdf_name TEXT;

COMMENT ON COLUMN public.bootcamp_sessions.pdf_url IS
  'URL du support de cours PDF de la session (optionnel). Si renseigné, il est visible et téléchargeable dans l''espace apprenant de la session concernée.';

-- IMPORTANT : PostgREST (l'API Supabase) garde un cache du schéma.
-- Sans ce rechargement, l'API continue de répondre
-- « Could not find the 'pdf_url' column ... in the schema cache »
-- et l'enregistrement du PDF échoue silencieusement.
NOTIFY pgrst, 'reload schema';

-- Vérification : la colonne doit apparaître, et se remplir après enregistrement dans l'admin.
-- select session_number, title, pdf_url, pdf_name from public.bootcamp_sessions order by session_number;
