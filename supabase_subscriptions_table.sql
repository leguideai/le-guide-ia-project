-- ============================================================
-- LE GUIDE IA — Table des Abonnements VIP (Replays & Prompts)
-- À coller et exécuter dans Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. TABLE DES PARAMÈTRES DU SITE (Stockage dynamique des prix & configs)
create table if not exists public.site_settings (
  key text primary key,
  value text,
  updated_at timestamptz default now()
);

-- Insertion des prix par défaut pour les abonnements
insert into public.site_settings (key, value)
values 
  ('subscription_price_3m', '10000'),
  ('subscription_price_1y', '30000')
on conflict (key) do nothing;

-- 2. TABLE DES ABONNEMENTS VIP (Replays Masterclasses & Prompts)
create table if not exists public.subscriptions (
  id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  full_name text not null,
  whatsapp text,
  country text default 'CI',
  plan text not null check (plan in ('3_months', '1_year', 'bootcamp_vip')),
  plan_label text,
  amount numeric not null default 0,
  currency text not null default 'XOF',
  status text not null default 'pending' check (status in ('active', 'pending', 'expired', 'cancelled')),
  payment_method text not null,
  transaction_ref text,
  receipt_url text,
  starts_at timestamptz not null default now(),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz default now(),
  notes jsonb default '{}'::jsonb
);

-- Ajout sécurisé au cas où la table existe déjà
alter table public.subscriptions add column if not exists updated_at timestamptz default now();

-- Index pour des recherches instantanées et performantes
create index if not exists subscriptions_email_idx on public.subscriptions(lower(email));
create index if not exists subscriptions_status_idx on public.subscriptions(status);

-- Activer Row Level Security (RLS)
alter table public.subscriptions enable row level security;
alter table public.site_settings enable row level security;

-- Politiques d'accès RLS pour site_settings
drop policy if exists "Lecture des paramètres" on public.site_settings;
create policy "Lecture des paramètres"
  on public.site_settings for select
  using (true);

drop policy if exists "Modification des paramètres" on public.site_settings;
create policy "Modification des paramètres"
  on public.site_settings for all
  using (true);

-- Politiques d'accès RLS pour subscriptions
drop policy if exists "Lecture des abonnements" on public.subscriptions;
create policy "Lecture des abonnements"
  on public.subscriptions for select
  using (true);

drop policy if exists "Création d'abonnement" on public.subscriptions;
create policy "Création d'abonnement"
  on public.subscriptions for insert
  with check (true);

drop policy if exists "Modification d'abonnement" on public.subscriptions;
create policy "Modification d'abonnement"
  on public.subscriptions for update
  using (true);

drop policy if exists "Suppression d'abonnement" on public.subscriptions;
create policy "Suppression d'abonnement"
  on public.subscriptions for delete
  using (true);
