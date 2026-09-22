-- Support de cours PDF attaché à une session de bootcamp (optionnel).
-- À exécuter dans le SQL Editor de Supabase.

ALTER TABLE public.bootcamp_sessions
  ADD COLUMN IF NOT EXISTS pdf_url TEXT;

ALTER TABLE public.bootcamp_sessions
  ADD COLUMN IF NOT EXISTS pdf_name TEXT;

COMMENT ON COLUMN public.bootcamp_sessions.pdf_url IS
  'URL du support de cours PDF de la session (optionnel). Si renseigné, il est visible et téléchargeable dans l''espace apprenant de la session concernée.';
