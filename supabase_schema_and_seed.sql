-- ====================================================================
-- LE GUIDE IA — SCRIPT DE NETTOYAGE, SCHEMA & SEEDING POUR SUPABASE
-- À exécuter directement dans le SQL Editor de Supabase
-- ====================================================================

-- 1. NETTOYAGE DES TABLES OBSOLÈTES / INUTILES
DROP TABLE IF EXISTS public.user_courses CASCADE;
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.prompts_old CASCADE;
DROP TABLE IF EXISTS public.temp_data CASCADE;

-- 2. CRÉATION ET MISE À JOUR DES SCHÉMAS DE TABLES

-- Table 1: PROFILES (Apprenants & Administrateurs)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin', 'super_admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 2: COURSES (Bootcamps & Formations)
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ajout sécurisé de TOUTES les colonnes nécessaires sur COURSES
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS subtitle TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS original_price TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'FCFA';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS badge TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Bootcamp';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS thumbnail TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS poster TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS dates TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS instructor TEXT DEFAULT 'Alfred Dah';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS live_meet_url TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;

-- Table 3: LESSONS (Modules & Leçons par Bootcamp)
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ajout sécurisé de TOUTES les colonnes nécessaires sur LESSONS
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS course_slug TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS module_name TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS num INT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS sequence_order INT DEFAULT 1;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS duration TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS pdf_name TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS scheduled_date TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS description TEXT;

-- Suppression sécurisée de la contrainte NOT NULL sur module_id ou course_id si elle existait auparavant
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lessons' AND column_name = 'module_id'
  ) THEN
    ALTER TABLE public.lessons ALTER COLUMN module_id DROP NOT NULL;
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lessons' AND column_name = 'course_id'
  ) THEN
    ALTER TABLE public.lessons ALTER COLUMN course_id DROP NOT NULL;
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Table 4: RESOURCES (Bibliothèque de Prompts & Blueprints EXCLUSIVEMENT)
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'Prompt';
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'Membre Premium';
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS prompt_text TEXT;
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS file_url TEXT;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'resources_slug_key'
  ) THEN
    ALTER TABLE public.resources ADD CONSTRAINT resources_slug_key UNIQUE (slug);
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Table 5: AI_TOOLS (Table Dédiée aux 6 Outils IA du Bootcamp)
CREATE TABLE IF NOT EXISTS public.ai_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  role TEXT NOT NULL,
  icon TEXT DEFAULT '⚡',
  image TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- I. TABLE SITE_VISITS (ANALYTICS & AUDIENCE TRACKING)
CREATE TABLE IF NOT EXISTS public.site_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL DEFAULT '/',
  full_path TEXT,
  visitor_id TEXT NOT NULL,
  session_id TEXT,
  device_type TEXT DEFAULT 'desktop',
  referrer TEXT,
  user_agent TEXT,
  country TEXT,
  ip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_visits_created_at ON public.site_visits(created_at);
CREATE INDEX IF NOT EXISTS idx_site_visits_path ON public.site_visits(path);
CREATE INDEX IF NOT EXISTS idx_site_visits_visitor_id ON public.site_visits(visitor_id);

ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert to site_visits" ON public.site_visits FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow admin read site_visits" ON public.site_visits FOR SELECT TO anon, authenticated USING (true);

-- Table 6: LIVE_SESSIONS (Directs Google Meet & Liens WhatsApp)
CREATE TABLE IF NOT EXISTS public.live_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.live_sessions ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;
ALTER TABLE public.live_sessions ADD COLUMN IF NOT EXISTS meet_url TEXT;
ALTER TABLE public.live_sessions ADD COLUMN IF NOT EXISTS whatsapp_url TEXT;
ALTER TABLE public.live_sessions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'upcoming';

-- Table 7: SITE_SETTINGS (Configuration CMS Hero & Landing Page)
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 8: TESTIMONIALS (Avis Clients & Témoignages Alumni)
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS rating INT DEFAULT 5;

-- Table 9: FAQS (Foire Aux Questions)
CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.faqs ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

-- Table 10: SERVICE_REQUESTS (Demandes de devis B2B d'entreprises)
CREATE TABLE IF NOT EXISTS public.service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS sector TEXT;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS employees TEXT;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS needs TEXT;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Nouveau';

-- Table 11: PAYMENTS (Historique des Transactions)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS course_id UUID;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS course_title TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'FCFA';
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'Mobile Money';
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed';

-- Table 12: REGISTRATIONS (Prospects & Inscriptions)
CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS profil TEXT;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'prospect';

-- Table 13: SUBMISSIONS (Devoirs et Travaux Rendus)
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  exercise_title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS submission_url TEXT;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'En attente';
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS feedback TEXT;

-- Table 14: NEWSLETTER SUBSCRIBERS
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  source TEXT DEFAULT 'footer_newsletter',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- RLS POLICIES (ACCÈS PUBLIC EN LECTURE SEULE POUR LES VISITEURS)
-- ====================================================================

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public SELECT Newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Public SELECT Newsletter" ON public.newsletter_subscribers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public INSERT Newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Public INSERT Newsletter" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public ALL Newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Public ALL Newsletter" ON public.newsletter_subscribers FOR ALL USING (true);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public SELECT Courses" ON public.courses;
CREATE POLICY "Public SELECT Courses" ON public.courses FOR SELECT USING (true);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public SELECT Lessons" ON public.lessons;
CREATE POLICY "Public SELECT Lessons" ON public.lessons FOR SELECT USING (true);

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public SELECT Resources" ON public.resources;
CREATE POLICY "Public SELECT Resources" ON public.resources FOR SELECT USING (true);

ALTER TABLE public.ai_tools ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public SELECT AI Tools" ON public.ai_tools;
CREATE POLICY "Public SELECT AI Tools" ON public.ai_tools FOR SELECT USING (true);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public SELECT Settings" ON public.site_settings;
CREATE POLICY "Public SELECT Settings" ON public.site_settings FOR SELECT USING (true);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public SELECT Testimonials" ON public.testimonials;
CREATE POLICY "Public SELECT Testimonials" ON public.testimonials FOR SELECT USING (true);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public SELECT FAQs" ON public.faqs;
CREATE POLICY "Public SELECT FAQs" ON public.faqs FOR SELECT USING (true);


-- ====================================================================
-- 3. INSERTION / ALIMENTATION DES DONNÉES DE BASE (SEED DATA)
-- ====================================================================

-- A. SEED COURSES (BOOTCAMPS)
INSERT INTO public.courses (slug, title, description, subtitle, price, currency, badge, category, thumbnail, poster, dates, instructor, status, features)
VALUES 
(
  'bootcamp-pro-2',
  'Bootcamp IA Pro 2 — Session Intensive & Live',
  'Formation de 4 semaines en direct sur Google Meet avec Alfred Dah. Maîtrisez ChatGPT, Claude, Midjourney v6 et l automatisation Make.com.',
  'Formation de 4 semaines en direct sur Google Meet avec Alfred Dah.',
  99000,
  'FCFA',
  'INTENSIF & LIVE',
  'Bootcamp',
  '/images/bootcamp_pro_thumb.jpg',
  '/images/bootcamp_pro_thumb.jpg',
  '31 Août au 6 Septembre 2026',
  'Alfred Dah',
  'active',
  '["7 sessions premium en direct live avec Alfred Dah", "Créneaux : Lun-Ven 19h-21h GMT + Samedi 8h-13h GMT", "Replays vidéo HD téléchargeables sous 12h", "Exercices pratiques & Ateliers en direct", "Groupe WhatsApp privé d entraide", "Certificat officiel Le Guide IA individuel et vérifiable", "Facture d achat automatique conforme pour entreprise"]'::jsonb
),
(
  'bootcamp-business-exec',
  'Bootcamp IA Business & Dirigeants (Exec)',
  'Accompagnement VIP sur-mesure pour chefs d entreprise et cadres. Audit de processus, intégration Copilot & Gemini et automatisation.',
  'Accompagnement VIP sur-mesure pour chefs d entreprise et cadres.',
  199000,
  'FCFA',
  'EXECUTIF VIP',
  'Bootcamp',
  '/images/bootcamp_business_thumb.jpg',
  '/images/bootcamp_business_thumb.jpg',
  '15 Septembre au 20 Décembre 2026',
  'Alfred Dah',
  'active',
  '["15h de sessions orientées Business & Automation", "Inclus tout le programme Pro + Coaching 1h individuel", "Modèles de Business Plans & Workflows d Agents IA", "Accès Espace Membre & Bibliothèque Premium de Prompts", "Certificat IA Business vérifiable + Facture d entreprise", "Garantie satisfait ou remboursé (sous conditions)"]'::jsonb
),
(
  'initiation-free',
  'Initiation IA & ChatGPT Pratique (Gratuit)',
  'Module de découverte pour acquérir les fondations du prompting, configurer vos outils et décupler votre productivité au quotidien.',
  'Module de découverte gratuit.',
  0,
  'FCFA',
  'ACCÈS GRATUIT',
  'Bootcamp',
  '/images/initiation_free_thumb.jpg',
  '/images/initiation_free_thumb.jpg',
  'Accès Immédiat 24h/7j',
  'Alfred Dah',
  'active',
  '["Cours d introduction pratique en accès immédiat dans l Espace Membre", "Découverte des fondamentaux du Prompt Engineering", "Guide des meilleurs cas d usage de ChatGPT en entreprise", "Accès aux fiches PDF d initiation téléchargeables"]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET 
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  subtitle = EXCLUDED.subtitle,
  price = EXCLUDED.price,
  badge = EXCLUDED.badge,
  category = EXCLUDED.category,
  thumbnail = EXCLUDED.thumbnail,
  poster = EXCLUDED.poster,
  dates = EXCLUDED.dates,
  features = EXCLUDED.features;


-- B. SEED LESSONS (TUTORIELS VIDÉOS PRATIQUES AVEC RÉFÉRENCE DE COURSE_ID)
INSERT INTO public.lessons (course_id, course_slug, title, module_name, num, sequence_order, duration, video_url, pdf_url, pdf_name, description)
SELECT 
  c.id AS course_id,
  v.course_slug,
  v.title,
  v.module_name,
  v.num,
  v.sequence_order,
  v.duration,
  v.video_url,
  v.pdf_url,
  v.pdf_name,
  v.description
FROM (VALUES
  ('initiation-free', 'Mindset IA & Configuration de ChatGPT, Claude et Gemini', 'Module 1 · Vidéo HD', 1, 1, '25 min', 'https://www.youtube.com/embed/L_LUpnjgPso', '/images/initiation_free_thumb.jpg', 'Guide_Configuration_IA.pdf', 'Adopter les bonnes habitudes et créer votre environnement de travail moderne.'),
  ('initiation-free', 'Les 5 Règles d Or du Prompting Professionnel', 'Module 2 · Tutoriel', 2, 2, '35 min', 'https://www.youtube.com/embed/L_LUpnjgPso', '/images/bootcamp_pro_thumb.jpg', 'Fiche_5_Regles_Prompting.pdf', 'Formuler des prompts structurés pour multiplier par 4 votre vitesse d exécution.'),
  ('bootcamp-pro-2', 'Rédaction de Rapports & Synthèses Exécutives B2B avec ChatGPT', 'Module 3 · Practice', 3, 3, '45 min', 'https://www.youtube.com/embed/L_LUpnjgPso', '/images/bootcamp_pro_thumb.jpg', 'Template_Rapport_B2B.pdf', 'Structurez vos comptes-rendus, notes de synthèse et présentations stratégiques.'),
  ('bootcamp-business-exec', 'Créer son Business Model Canvas assisté par l IA', 'Session Live · Exec', 4, 4, '2h 00m', 'https://www.youtube.com/embed/L_LUpnjgPso', '/images/bootcamp_business_thumb.jpg', 'Business_Model_Canvas_AI.pdf', 'Transformer une idée en modèle économique clair, cohérent et testable.'),
  ('bootcamp-pro-2', 'Automatisation No-Code avec Make.com & Webhooks OpenAI', 'Automation Masterclass', 5, 5, '1h 15m', 'https://www.youtube.com/embed/L_LUpnjgPso', '/images/bootcamp_pro_thumb.jpg', 'Blueprint_Make_Gmail_WhatsApp.json', 'Connecter vos emails, formulaires et CRM avec des agents IA autonomes.'),
  ('bootcamp-business-exec', 'Analyse Financière & Tableaux de Bord de Gestion sous Claude 3.5', 'Executive Finance', 6, 6, '1h 30m', 'https://www.youtube.com/embed/L_LUpnjgPso', '/images/bootcamp_business_thumb.jpg', 'Template_Analyse_Financiere_AI.pdf', 'Interroger vos fichiers Excel et valider la rentabilité financière avec l IA.')
) AS v(course_slug, title, module_name, num, sequence_order, duration, video_url, pdf_url, pdf_name, description)
LEFT JOIN public.courses c ON c.slug = v.course_slug;


-- C. SEED AI_TOOLS (LES 6 OUTILS IA DU BOOTCAMPS)
INSERT INTO public.ai_tools (slug, name, category, role, icon, image) VALUES
(
  'chatgpt-openai',
  'ChatGPT (OpenAI)',
  'Modèles IA & Raisonnement',
  'Génération de texte, Prompt Engineering avancé, Personas & Assistants sur-mesure.',
  '🤖',
  '/images/tools/chatgpt.png'
),
(
  'claude-anthropic',
  'Claude (Anthropic)',
  'Modèles IA & Raisonnement',
  'Rédaction complexe, analyse fine de documents, logique stratégique & synthèses.',
  '🧠',
  '/images/tools/claude.png'
),
(
  'google-gemini',
  'Google Gemini',
  'Modèles IA & Raisonnement',
  'Traitement multimodal, analyse d images & intégration écosystème Workspace.',
  '💎',
  '/images/tools/gemini.png'
),
(
  'perplexity-ai',
  'Perplexity AI',
  'Modèles IA & Recherche',
  'Recherche web temps réel augmentée, vérification rigoureuse des sources & veille.',
  '🔍',
  '/images/tools/perplexity.png'
),
(
  'google-notebooklm',
  'Google NotebookLM',
  'Modèles IA & Recherche',
  'Création de bases de connaissances privées, interrogation de PDF & podcasts audio.',
  '📚',
  '/images/tools/notebooklm.png'
),
(
  'linkedin-ats',
  'LinkedIn & Optimisation ATS',
  'Employabilité & Visibilité',
  'Refonte de profil moderne, franchissement des filtres ATS recruteurs & marque personnelle.',
  '💼',
  '/images/tools/linkedin.png'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  role = EXCLUDED.role,
  icon = EXCLUDED.icon,
  image = EXCLUDED.image;


-- D. SEED RESOURCES (BIBLIOTHÈQUE DE PROMPTS & BLUEPRINTS EXCLUSIVEMENT)
INSERT INTO public.resources (slug, title, category, type, tier, prompt_text, file_url) VALUES
(
  'prompt-linkedin',
  'Optimisation de profil LinkedIn Pro & ATS',
  'Productivité & Rédaction',
  'Prompt',
  'Membre Premium',
  'Agis en tant qu expert en personal branding et rédacteur LinkedIn professionnel. Rédige 3 titres percutants (max 220 caractères) avec mots-clés ATS et une section Infos captivante.',
  '/images/bootcamp_pro_thumb.jpg'
),
(
  'prompt-marketing-b2b',
  'Email de prospection commerciale B2B',
  'Marketing & Vente',
  'Prompt',
  'Membre Premium',
  'Rédige un email de prospection froide B2B concis (moins de 150 mots) axé sur la valeur et la résolution de problème.',
  '/images/bootcamp_business_thumb.jpg'
),
(
  'ex-excel-data',
  'Devoir à Rendre : Analyse de Données Financières d Entreprise',
  'Exercices & Devoirs',
  'Devoir',
  'Membre Premium',
  'Projet pratique obligatoire à soumettre : importez le jeu de données Excel de 1 000 ventes dans ChatGPT, générez les graphiques financiers et soumettez votre rapport.',
  '/images/initiation_free_thumb.jpg'
),
(
  'ex-make-blueprint',
  'Cas Pratique : Workflow de Prospection Automatisée sur Make.com',
  'Automatisation',
  'Blueprint',
  'Membre Premium',
  'Configurez le scénario Make.com fourni, activez les Webhooks d emails et effectuez un test d envoi en direct.',
  '/images/bootcamp_pro_thumb.jpg'
),
(
  'bonus-midjourney',
  'Vidéo Bonus : Masterclass Midjourney v6 & Photoréalisme',
  'Génération Visuelle',
  'Vidéo Masterclass',
  'Gratuit',
  'Tutoriel exclusif de 45 minutes pour générer des visuels publicitaires hyper-réalistes et maîtriser les paramètres --ar, --stylize et --cref.',
  '/images/bootcamp_business_thumb.jpg'
),
(
  'bp-agence-ia',
  'Business Plan — Agence de Services & Automatisations IA',
  'Business Plan',
  'Document',
  'Membre Premium',
  'Plan d affaires stratégique complet pour lancer une agence d intégration IA pour PME : offre de services, tarification retainer et projections financières.',
  '/templates/Business_Plan_Agence_IA_Template.docx'
),
(
  'bp-aviculture',
  'Modèle de Business Plan - Aviculture Moderne',
  'Business Plan',
  'Document',
  'Gratuit',
  'Structure complète d un projet d élevage de poulets de chair et pondeuses au Burkina Faso.',
  '/templates/Business_Plan_Aviculture_Burkina_Faso_Template.docx'
),
(
  'prompt-ultime-redaction',
  'Prompt Ultime de Rédaction de Rapports & Synthèses B2B',
  'Productivité & Rédaction',
  'Prompt',
  'Membre Premium',
  'Tu es un expert en rédaction exécutive. Analyse le texte ci-joint et génère un rapport structuré comprenant : 1. Résumé exécutif en 3 puces, 2. Analyse d impact stratégique, 3. Recommandations concrètes d actions prioritaires.',
  '/images/bootcamp_pro_thumb.jpg'
),
(
  'kit-prompt-midjourney-v6',
  'Kit d Ingénierie de Prompt pour Génération d Images Midjourney v6',
  'Génération Visuelle',
  'Blueprint',
  'Gratuit',
  '/imagine prompt: professional corporate portrait of an African entrepreneur working with AI tech interface, cinematic lighting, 8k resolution, photorealistic, shot on 85mm lens --ar 16:9 --v 6.0',
  '/images/bootcamp_business_thumb.jpg'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  type = EXCLUDED.type,
  tier = EXCLUDED.tier,
  prompt_text = EXCLUDED.prompt_text,
  file_url = EXCLUDED.file_url;


-- E. SEED SITE SETTINGS
INSERT INTO public.site_settings (key, value, updated_at) VALUES
('announcement_text', 'BOOTCAMP IA PRO 2 — Direct Live du 31 Août au 6 Septembre 2026. Inscriptions ouvertes !', NOW()),
('announcement_cta', 'Réserver ma place (149 000 FCFA) →', NOW()),
('vsl_youtube_url', 'https://www.youtube.com/embed/0DjfVGtWtDA?rel=0&modestbranding=1', NOW()),
('hero_badge', 'CO-CRÉEZ VOTRE AVENIR PROFESSIONNEL', NOW()),
('hero_title', 'Maîtrisez l IA. Transformez votre carrière et votre business.', NOW()),
('hero_subtitle', 'Formation intensive en ligne · 100% en français · Cas africains & diaspora. Apprenez à maîtriser ChatGPT, Claude, Gemini, Perplexity, NotebookLM, Make et n8n avec Alfred Dah.', NOW()),
('hero_dates', '31 Août – 6 Sept 2026', NOW()),
('hero_time', '19h00 GMT', NOW()),
('hero_promo_price', '149,900 F CFA', NOW()),
('hero_normal_price', '250,000 F CFA', NOW()),
('whatsapp_number', '+226 0505 0577', NOW()),
('hero_poster_url', '/images/bootcamp_pro_poster.jpg', NOW())
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();


-- F. SEED LIVE SESSIONS
INSERT INTO public.live_sessions (title, scheduled_at, meet_url, whatsapp_url, status) VALUES
(
  'Bootcamp IA Pro 2 — Session Directe Quotidienne',
  '2026-08-22T19:00:00Z',
  'https://meet.google.com/leguideai-bootcamp-live',
  'https://chat.whatsapp.com/leguideai-bootcamp',
  'upcoming'
);


-- G. SEED TESTIMONIALS
DELETE FROM public.testimonials;

INSERT INTO public.testimonials (name, role, avatar_url, image, text) VALUES
('John Tate', 'Lead Cyber Security Analyst at City of Nicos', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80', 'J’ai étudié aux côtés d’Alfred et peux témoigner de son dynamisme et de son expertise exceptionnels. À la croisée de la gouvernance de l’IA et de la formation des dirigeants, il allie certification CISA, rigueur et sens de l’implémentation. Sa capacité à traduire des concepts complexes en recommandations pratiques est remarquable. Je le recommande sans réserve à toute organisation cherchant un leader en IA.'),
('W. Nadine Mariam YODA', 'Executive Officer | Senior Business Advisor | Operations | Supply Chain', 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&auto=format&fit=crop&q=80', 'J’ai participé au Bootcamp organisé par Alfred Dah et cette formation a déjà transformé ma manière de travailler. J’ai particulièrement apprécié son professionnalisme, sa générosité dans le partage des connaissances et son souci de voir les autres grandir. Je recommande très fortement LE GUIDE IA à tous ceux qui veulent faire de l’IA un tremplin professionnel ou d''affaires.'),
('Marilyne OUEDRAOGO', 'Entrepreneure', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80', 'Alfred sait transformer une idée en opportunité concrète et rendre l’IA accessible et utile. Son accompagnement m''a permis de structurer mon Business Model Canvas, mon Business Plan et de clarifier ma proposition de valeur. Sa pédagogie, son sens stratégique et ses conseils pratiques sont de précieux atouts. Je le recommande vivement à tout entrepreneur souhaitant exploiter l''IA.'),
('Emmanuel YODA', 'Professionnel / Participant au Bootcamp', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80', 'J’ai suivi une formation en IA animée par l’Expert Alfred Dah. J’ai particulièrement apprécié sa maîtrise des outils, sa pédagogie et sa capacité à vulgariser des concepts complexes avec des cas concrets. Sa générosité dans le partage d''expérience est remarquable. Je le recommande vivement pour apprendre à utiliser l’IA efficacement.'),
('Rachidatou Kaboré', 'Analyste / Professionnelle', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80', 'Le Bootcamp Pro IA & Business est l’une des formations les plus concrètes que j’ai suivies. Chaque session débouche sur un livrable opérationnel et réutilisable : workflow automatisé, optimisation LinkedIn, stratégie sur-mesure. On repart avec des outils directement applicables dans son travail. Je recommande sincèrement Alfred Dah à tous les professionnels.'),
('Salamata Ouedraogo', 'Senior Education Specialist', 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&auto=format&fit=crop&q=80', 'En tant que IT Manager sur le projet PRD POCY, Alfred s’est distingué par son expertise technique solide, sa rigueur et son sens des responsabilités. Il sait concevoir des solutions efficaces, sécuriser les systèmes et accompagner les équipes avec pédagogie. Un manager visionnaire alliant leadership et innovation que je recommande vivement.'),
('Alain SEHR SEHR, M.Sc., SFPC', 'Professionnel / Participant au Bootcamp', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80', 'Alfred Dah est l’un des formateurs les plus inspirants qu''il m''ait été donné de rencontrer. Au-delà du contenu technique d''excellence, il sait pousser chaque participant à dépasser ses limites et à appliquer concrètement l''IA. J''ai terminé ce Bootcamp avec une confiance renouvelée et des compétences immédiatement activables. Une recommandation absolue !'),
('Cheikh Amadou Ba', 'IT Strategy & Cybersecurity Consultant | Former Regional IT Leader (USAID)', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80', 'Ayant collaboré avec Alfred chez USAID, j’ai pu apprécier sa gestion exemplaire des systèmes critiques. Aujourd''hui, il applique cette même rigueur pour orienter les organisations vers les cas d''usage IA à forte valeur ajoutée. Il allie expertise technique, sécurité et efficacité opérationnelle. Je le recommande fortement.'),
('P. Landry K. KORAHIRE', 'Information Security Officer | GAZ Sud | ISO 27001 LI & LA', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80', 'J’ai eu le plaisir de travailler avec Alfred : une personne rigoureuse, hautement professionnelle et engagée. Son esprit d’équipe, son sens des responsabilités et son expertise technique en font un collaborateur particulièrement fiable. Je le recommande sans hésiter.');


-- H. SEED FAQS
DELETE FROM public.faqs;

INSERT INTO public.faqs (category, question, answer) VALUES
('program', 'Dois-je avoir des compétences en programmation pour suivre vos formations ?', 'Absolument aucun prérequis technique n est requis. Nos Bootcamps et Masterclasses sont 100% axés sur les outils No-Code, les modèles de langage et l IA générative appliquée (ChatGPT, Claude 3.5 Sonnet, Gemini, Midjourney, Canva IA, Make et n8n). Chaque concept est expliqué pas à pas avec des cas pratiques immédiatement applicables à votre métier ou entreprise.'),
('program', 'Quelle est la différence entre vos Bootcamps interactifs et vos Masterclasses vidéos ?', 'Nos Bootcamps sont des programmes intensifs en direct avec nos formateurs experts (dont Alfred Dah), comprenant des ateliers pratiques en temps réel, des devoirs corrigés et des sessions de questions/réponses en direct. Les Masterclasses vidéos sont des formations enregistrées en auto-formation que vous pouvez suivre à votre propre rythme depuis votre Espace Membre.'),
('program', 'De quel matériel ou logiciel ai-je besoin pour participer aux cours ?', 'Un simple ordinateur portable (ou smartphone/tablette) et une connexion Internet stable suffisent. Pour tous les outils d IA utilisés durant nos formations (ChatGPT, Claude, Canva, etc.), nous vous formons sur les versions gratuites avant d envisager des abonnements payants optionnels.'),
('program', 'Les formations et ressources sont-elles adaptées au contexte économique africain ?', 'Oui, c est l ADN même du Guide IA. Tous nos cas d usage, modèles de business plans, prompts métiers et stratégies d automatisation sont conçus sur mesure pour répondre aux réalités économiques et professionnelles en Afrique francophone et de la diaspora (recrutement, commerce, marketing local, finance, etc.).'),
('pricing', 'Quels sont les moyens de paiement acceptés sur la plateforme ?', 'Nous proposons des solutions de paiement ultra-flexibles adaptées à chaque pays : Mobile Money instantané (Orange Money, Wave, MTN MoMo, Moov Money), cartes bancaires internationales (Visa, Mastercard) et virements bancaires professionnels (B2B) avec émission de facture proforma.'),
('pricing', 'Quand et comment ai-je accès à mon espace de formation après mon paiement ?', 'Pour les paiements par carte bancaire, votre accès est activé automatiquement et instantanément. Pour les règlements par Mobile Money ou Virement, notre équipe administrative valide manuellement votre transaction sous 24 heures et vous recevez vos identifiants d accès complets ainsi qu un email de confirmation.'),
('pricing', 'Mon accès à l Espace Membre et aux contenus est-il limité dans le temps ?', 'Non, votre accès est illimité et à vie. Vous conservez un accès permanent à tous vos cours achetés, aux supports de formation, aux modèles téléchargeables ainsi qu à toutes les futures mises à jour des cours sans aucun abonnement récurrent ni frais supplémentaire.'),
('guarantee', 'Délivrez-vous un certificat officiel à la fin de la formation ?', 'Oui. Chaque apprenant ayant suivi l intégralité des modules et validé ses projets pratiques reçoit un Certificat Officiel d Aptitude & Compétences IA émis par Le Guide IA. Ce certificat vérifiable peut être téléchargé en haute résolution et ajouté directement à votre CV et profil LinkedIn.'),
('guarantee', 'Comment fonctionne le support et la communauté privée des apprenants ?', 'Dès votre inscription, vous intégrez notre communauté privée WhatsApp d apprenants et de professionnels. Vous pouvez y poser toutes vos questions techniques, échanger avec vos pairs, partager vos projets et bénéficier d une assistance directe de nos formateurs tout au long de votre apprentissage.'),
('guarantee', 'Est-il possible d inscrire plusieurs collaborateurs ou d organiser une formation sur mesure pour mon entreprise ?', 'Tout à fait. Nous proposons des offres d accompagnement B2B et des sessions privées intra-entreprises adaptées aux objectifs spécifiques de vos équipes (marketing, finance, direction, RH). Vous pouvez nous contacter directement par email à alfred@leguideai.com ou sur WhatsApp au +226 05 05 05 77 pour recevoir un devis personnalisé.');
