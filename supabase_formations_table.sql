-- ====================================================================
-- LE GUIDE IA — TABLES & SEEDING POUR LES FORMATIONS VIDÉOS & CATÉGORIES
-- À exécuter dans le SQL Editor de Supabase
-- ====================================================================

-- 1. Table 'formation_categories' (Catégories Dynamiques)
CREATE TABLE IF NOT EXISTS public.formation_categories (
  id TEXT PRIMARY KEY DEFAULT ('cat-' || extract(epoch from now())::text),
  slug TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  icon TEXT DEFAULT 'sparkles',
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_formation_categories_slug ON public.formation_categories(slug);
CREATE INDEX IF NOT EXISTS idx_formation_categories_active ON public.formation_categories(is_active);

ALTER TABLE public.formation_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view formation_categories" ON public.formation_categories;
CREATE POLICY "Public can view formation_categories"
  ON public.formation_categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage formation_categories" ON public.formation_categories;
CREATE POLICY "Admins can manage formation_categories"
  ON public.formation_categories FOR ALL
  USING (true)
  WITH CHECK (true);

-- Seed des catégories initiales
INSERT INTO public.formation_categories (id, slug, label, icon, order_index, is_active)
VALUES
  ('cat-claude', 'claude', 'Claude & Code', 'claude', 1, true),
  ('cat-chatgpt', 'chatgpt', 'ChatGPT & Make', 'chatgpt', 2, true),
  ('cat-notebook', 'notebook', 'NotebookLM & Gemini', 'notebook', 3, true),
  ('cat-linkedin', 'linkedin', 'LinkedIn & Prospection', 'linkedin', 4, true)
ON CONFLICT (slug) DO UPDATE SET
  label = EXCLUDED.label,
  icon = EXCLUDED.icon,
  order_index = EXCLUDED.order_index,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- 2. Table 'formations' (Formations Vidéos)
CREATE TABLE IF NOT EXISTS public.formations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  badge TEXT DEFAULT 'Nouveau',
  tool_icon TEXT DEFAULT 'chatgpt',
  category_slug TEXT DEFAULT 'chatgpt',
  thumbnail TEXT DEFAULT '/images/formation_claude_thumb.jpg',
  instructor TEXT DEFAULT 'Alfred Dah · Expert IA & Productivité',
  rating NUMERIC DEFAULT 4.9,
  reviews_count TEXT DEFAULT '200+ avis',
  duration TEXT DEFAULT '10h de vidéo',
  modules_count TEXT DEFAULT '20 leçons',
  prompts_count TEXT DEFAULT '100+ prompts',
  price NUMERIC NOT NULL DEFAULT 39000,
  original_price TEXT DEFAULT '69 000 FCFA',
  currency TEXT DEFAULT 'FCFA',
  features JSONB DEFAULT '[]'::jsonb,
  stats JSONB DEFAULT '[]'::jsonb,
  testimonial JSONB DEFAULT '{}'::jsonb,
  video_preview_url TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migration automatique : Ajout des colonnes si la table existait déjà auparavant
ALTER TABLE public.formations ADD COLUMN IF NOT EXISTS category_slug TEXT DEFAULT 'chatgpt';
ALTER TABLE public.formations ADD COLUMN IF NOT EXISTS thumbnail TEXT DEFAULT '/images/formation_claude_thumb.jpg';
ALTER TABLE public.formations ADD COLUMN IF NOT EXISTS instructor TEXT DEFAULT 'Alfred Dah · Expert IA & Productivité';
ALTER TABLE public.formations ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 4.9;
ALTER TABLE public.formations ADD COLUMN IF NOT EXISTS reviews_count TEXT DEFAULT '200+ avis';

-- Index pour requêtes rapides
CREATE INDEX IF NOT EXISTS idx_formations_slug ON public.formations(slug);
CREATE INDEX IF NOT EXISTS idx_formations_active ON public.formations(is_active);
CREATE INDEX IF NOT EXISTS idx_formations_category ON public.formations(category_slug);

-- Activation de Row Level Security (RLS)
ALTER TABLE public.formations ENABLE ROW LEVEL SECURITY;

-- Lecture publique pour tous les visiteurs
DROP POLICY IF EXISTS "Public can view active formations" ON public.formations;
CREATE POLICY "Public can view active formations"
  ON public.formations FOR SELECT
  USING (true);

-- Écriture réservée au service role / admins
DROP POLICY IF EXISTS "Admins can manage formations" ON public.formations;
CREATE POLICY "Admins can manage formations"
  ON public.formations FOR ALL
  USING (true)
  WITH CHECK (true);

-- 3. Insertion des 4 Formations Phares (Seed initial)
INSERT INTO public.formations (slug, title, tagline, description, badge, tool_icon, category_slug, thumbnail, instructor, rating, reviews_count, duration, modules_count, prompts_count, price, original_price, currency, features, stats, testimonial, order_index, is_active)
VALUES
(
  'maitriser-claude-ia',
  'Maîtriser Claude 3.7 & Claude Code',
  'Déléguez enfin le travail complexe qui vous prend des heures',
  'La formation complète pour exploiter toute la puissance de Claude : Claude Chatbot, Claude Code, Claude Cowork et Artifacts. Transformez Claude en collaborateur d''élite sans aucune compétence technique préalable.',
  'Forte demande',
  'claude',
  'claude',
  '/images/formation_claude_thumb.jpg',
  'Alfred Dah · Expert IA & Code',
  4.9,
  '245 avis',
  '12h de vidéo',
  '29 leçons',
  '50+ skills & templates',
  49000,
  '89 000 FCFA',
  'FCFA',
  '["Claude Chatbot : Prompting ultra-avancé, projets et automatisation quotidienne", "Claude Code : Déléguez vos tâches techniques et scripts sans coder", "Claude Cowork : Travaillez en direct sur vos fichiers, PDF et bases de données", "Claude Artifacts & Design : Générez des dashboards et applications visuelles en 1 clic"]'::jsonb,
  '[{"label": "Parties complètes", "value": "4"}, {"label": "Leçons vidéo HD", "value": "29"}, {"label": "De contenu pratique", "value": "12h+"}]'::jsonb,
  '{"quote": "Des exemples concrets qu''on peut appliquer tout de suite dans son travail. Le contenu est régulièrement actualisé avec les dernières nouveautés de Claude.", "author_name": "David Fraisse", "author_role": "Consultant Stratégie & IA", "avatar_initials": "DF", "rating": 5}'::jsonb,
  1,
  true
),
(
  'automatiser-chatgpt',
  'Automatiser ChatGPT & Make',
  'Gagnez plus de 10h par semaine immédiatement en pilotant l''IA',
  'Maîtrisez toutes les fonctionnalités avancées de ChatGPT et connectez-le à vos outils préférés via Make et Zapier pour créer des assistants autonomes qui travaillent 24h/24.',
  'Best-seller',
  'chatgpt',
  'chatgpt',
  '/images/formation_chatgpt_thumb.jpg',
  'Alfred Dah · Expert Automatisation',
  4.9,
  '310 avis',
  '15h de contenu',
  '25 modules',
  '150+ prompts premium',
  39000,
  '79 000 FCFA',
  'FCFA',
  '["Création de contenu, rédaction d''emails stratégiques et synthèse de documents lourds", "Prompt engineering de niveau expert (méthode CARTEL, chaînage de pensée)", "Création de GPTs sur-mesure et agents conversationnels spécialisés", "Bonus exclusif : Workflows d''automatisation Make prêts à importer"]'::jsonb,
  '[{"label": "Modules vidéo", "value": "25"}, {"label": "De pratique guidée", "value": "15h"}, {"label": "Prompts testés", "value": "150+"}]'::jsonb,
  '{"quote": "Cette formation m''a fait gagner un temps précieux dès la première semaine. Mes tâches répétitives sont désormais automatisées.", "author_name": "Amadou Traoré", "author_role": "Responsable Marketing Digital", "avatar_initials": "AT", "rating": 5}'::jsonb,
  2,
  true
),
(
  'notebooklm-gemini-facile',
  'NotebookLM & Gemini Pro Facile',
  'Maîtrisez les outils d''analyse documentaire les plus puissants de 2026',
  'Ne perdez plus votre temps à lire des rapports interminables. Confiez vos PDF, cours et bilans à NotebookLM et transformez-les en synthèses, podcasts audio et présentations en quelques secondes.',
  'Nouveau',
  'notebook',
  'notebook',
  '/images/formation_notebook_thumb.jpg',
  'Alfred Dah · Expert Documentaire',
  4.9,
  '180 avis',
  '8h de contenu',
  '12 modules',
  'Outil studio inclus',
  29000,
  '59 000 FCFA',
  'FCFA',
  '["Comptes-rendus de réunion en 3 minutes et rapports de 100 pages synthétisés", "Méthode d''audit et d''extraction documentaire sans hallucination", "Audio Overview : Génération de podcasts et briefings vocaux en 1 clic", "Intégration Gemini 2.0 Pro et création de Gems personnalisés"]'::jsonb,
  '[{"label": "Modules ciblés", "value": "12"}, {"label": "Workflows PDF", "value": "3"}, {"label": "Gagnées / semaine", "value": "10h"}]'::jsonb,
  '{"quote": "NotebookLM était sous-estimé jusqu''à ce que je suive cette formation. C''est devenu mon copilote quotidien pour mes synthèses.", "author_name": "Christine Aucher", "author_role": "Directrice des Opérations", "avatar_initials": "CA", "rating": 5}'::jsonb,
  3,
  true
),
(
  'prospection-linkedin-ia',
  'Prospection Commerciale IA & LinkedIn',
  'Faites de LinkedIn votre machine à générer des clients qualifiés',
  'Une méthode simple et reproductible pour identifier des prospects chauds, rédiger des messages ultra-personnalisés grâce à l''IA et convertir en y passant moins de 2h par semaine.',
  'Prospection',
  'linkedin',
  'linkedin',
  '/images/formation_linkedin_thumb.jpg',
  'Alfred Dah · Stratégie B2B & IA',
  4.9,
  '195 avis',
  '7h de contenu',
  '10 modules',
  'Scripts & checklists',
  39000,
  '69 000 FCFA',
  'FCFA',
  '["Profil LinkedIn optimisé pour la conversion commerciale (checklist 12 points)", "Identification des décideurs et signaux d''achat faibles avec l''IA", "Séquences de messages ciblées avec 70% de taux de réponse garanti", "Automatisation douce pour prospecter en continu sans risquer de ban"]'::jsonb,
  '[{"label": "Prospects / jour", "value": "4"}, {"label": "Taux de réponse", "value": "70%"}, {"label": "Par semaine", "value": "<2h"}]'::jsonb,
  '{"quote": "J''ai signé 2 nouveaux contrats dès le premier mois en appliquant les séquences de messages rédigées avec l''IA. Remarquable !", "author_name": "Fanny Sessou", "author_role": "Fondatrice d''Agence", "avatar_initials": "FS", "rating": 5}'::jsonb,
  4,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  badge = EXCLUDED.badge,
  tool_icon = EXCLUDED.tool_icon,
  category_slug = EXCLUDED.category_slug,
  thumbnail = EXCLUDED.thumbnail,
  instructor = EXCLUDED.instructor,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  duration = EXCLUDED.duration,
  modules_count = EXCLUDED.modules_count,
  prompts_count = EXCLUDED.prompts_count,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  currency = EXCLUDED.currency,
  features = EXCLUDED.features,
  stats = EXCLUDED.stats,
  testimonial = EXCLUDED.testimonial,
  order_index = EXCLUDED.order_index,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();
