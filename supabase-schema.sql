-- ============================================================
-- LE GUIDE IA — Schema complet Supabase
-- Coller et executer dans Supabase Dashboard > SQL Editor
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- 1. PROFILS UTILISATEURS
create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  full_name   text,
  email       text,
  whatsapp    text,
  country     text,
  city        text,
  sector      text,
  role        text not null default 'student' check (role in ('student', 'admin', 'instructor')),
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- 2. INSCRIPTIONS (remplace Google Sheets)
create table if not exists public.registrations (
  id          uuid primary key default uuid_generate_v4(),
  full_name   text not null,
  email       text not null,
  whatsapp    text not null,
  country     text,
  profil      text,
  source      text default 'site',
  status      text not null default 'inscrit' check (status in ('inscrit', 'chaud', 'paye', 'inactif')),
  notes       text,
  created_at  timestamptz not null default now()
);
create unique index if not exists registrations_email_idx on public.registrations(lower(email));
create unique index if not exists registrations_whatsapp_idx on public.registrations(whatsapp);

-- 3. PAIEMENTS
create table if not exists public.payments (
  id               uuid primary key default uuid_generate_v4(),
  registration_id  uuid references public.registrations(id) on delete set null,
  user_id          uuid references public.profiles(id) on delete set null,
  amount           numeric(10,2),
  currency         text default 'XOF',
  method           text not null,
  status           text not null default 'pending' check (status in ('pending', 'confirmed', 'failed')),
  transaction_ref  text,
  confirmed_at     timestamptz,
  created_at       timestamptz not null default now()
);

-- 4. FORMATIONS
create table if not exists public.courses (
  id             uuid primary key default uuid_generate_v4(),
  title          text not null,
  slug           text not null unique,
  description    text,
  thumbnail_url  text,
  price          numeric(10,2) not null default 0,
  currency       text not null default 'XOF',
  is_published   boolean not null default false,
  is_free        boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create trigger courses_updated_at before update on public.courses
  for each row execute procedure public.set_updated_at();

-- 5. MODULES
create table if not exists public.modules (
  id           uuid primary key default uuid_generate_v4(),
  course_id    uuid not null references public.courses(id) on delete cascade,
  title        text not null,
  description  text,
  position     integer not null default 0,
  is_published boolean not null default false,
  created_at   timestamptz not null default now()
);

-- 6. LECONS
create table if not exists public.lessons (
  id              uuid primary key default uuid_generate_v4(),
  module_id       uuid not null references public.modules(id) on delete cascade,
  title           text not null,
  description     text,
  video_url       text,
  video_duration  integer,
  pdf_url         text,
  position        integer not null default 0,
  is_published    boolean not null default false,
  created_at      timestamptz not null default now()
);

-- 7. ACCES FORMATIONS
create table if not exists public.user_courses (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  course_id   uuid not null references public.courses(id) on delete cascade,
  payment_id  uuid references public.payments(id) on delete set null,
  enrolled_at timestamptz not null default now(),
  expires_at  timestamptz,
  unique(user_id, course_id)
);

-- 8. PROGRESSION
create table if not exists public.user_progress (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  lesson_id        uuid not null references public.lessons(id) on delete cascade,
  completed        boolean not null default false,
  watch_time       integer not null default 0,
  last_watched_at  timestamptz,
  created_at       timestamptz not null default now(),
  unique(user_id, lesson_id)
);

-- 9. QUIZ
create table if not exists public.quizzes (
  id          uuid primary key default uuid_generate_v4(),
  module_id   uuid not null references public.modules(id) on delete cascade,
  title       text not null,
  pass_score  integer not null default 70
);
create table if not exists public.quiz_questions (
  id        uuid primary key default uuid_generate_v4(),
  quiz_id   uuid not null references public.quizzes(id) on delete cascade,
  question  text not null,
  options   jsonb not null default '[]',
  position  integer not null default 0
);
create table if not exists public.quiz_attempts (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  quiz_id      uuid not null references public.quizzes(id) on delete cascade,
  score        integer not null,
  passed       boolean not null,
  attempted_at timestamptz not null default now()
);

-- 10. CERTIFICATS
create table if not exists public.certificates (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  course_id        uuid not null references public.courses(id) on delete cascade,
  issued_at        timestamptz not null default now(),
  certificate_url  text,
  share_token      text not null default encode(gen_random_bytes(16), 'hex'),
  unique(user_id, course_id)
);

-- 11. BIBLIOTHEQUE
create table if not exists public.resources (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null,
  slug            text not null unique,
  description     text,
  category        text,
  file_url        text,
  thumbnail_url   text,
  is_free         boolean not null default true,
  download_count  integer not null default 0,
  is_published    boolean not null default false,
  created_at      timestamptz not null default now()
);
create table if not exists public.resource_downloads (
  id            uuid primary key default uuid_generate_v4(),
  resource_id   uuid not null references public.resources(id) on delete cascade,
  user_id       uuid references public.profiles(id) on delete set null,
  email         text,
  downloaded_at timestamptz not null default now()
);

-- 12. BLOG
create table if not exists public.posts (
  id             uuid primary key default uuid_generate_v4(),
  title          text not null,
  slug           text not null unique,
  excerpt        text,
  content        text,
  thumbnail_url  text,
  category       text,
  author_id      uuid references public.profiles(id) on delete set null,
  is_published   boolean not null default false,
  published_at   timestamptz,
  created_at     timestamptz not null default now()
);

-- 13. NEWSLETTER
create table if not exists public.newsletter_subscribers (
  id             uuid primary key default uuid_generate_v4(),
  email          text not null unique,
  name           text,
  status         text not null default 'active' check (status in ('active', 'unsubscribed')),
  subscribed_at  timestamptz not null default now()
);

-- 14. SERVICES ENTREPRISES
create table if not exists public.service_requests (
  id            uuid primary key default uuid_generate_v4(),
  company_name  text,
  contact_name  text not null,
  email         text not null,
  phone         text,
  company_size  text,
  sector        text,
  service_type  text,
  participants  integer,
  budget        text,
  timeline      text,
  message       text,
  status        text not null default 'new' check (status in ('new', 'contacted', 'quoted', 'won', 'lost')),
  assigned_to   uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now()
);

-- 15. CRM
create table if not exists public.contact_notes (
  id               uuid primary key default uuid_generate_v4(),
  registration_id  uuid references public.registrations(id) on delete cascade,
  author_id        uuid references public.profiles(id) on delete set null,
  note             text not null,
  created_at       timestamptz not null default now()
);
create table if not exists public.follow_up_tasks (
  id               uuid primary key default uuid_generate_v4(),
  registration_id  uuid references public.registrations(id) on delete cascade,
  assigned_to      uuid references public.profiles(id) on delete set null,
  title            text not null,
  due_date         date,
  completed        boolean not null default false,
  created_at       timestamptz not null default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.registrations enable row level security;
alter table public.payments enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.user_courses enable row level security;
alter table public.user_progress enable row level security;
alter table public.certificates enable row level security;
alter table public.resources enable row level security;
alter table public.posts enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.service_requests enable row level security;

create policy "users_own_profile" on public.profiles for all using (auth.uid() = id);
create policy "courses_public_read" on public.courses for select using (is_published = true);
create policy "modules_public_read" on public.modules for select using (
  exists (select 1 from public.courses where id = course_id and is_published = true));
create policy "lessons_public_read" on public.lessons for select using (
  exists (select 1 from public.modules m join public.courses c on c.id = m.course_id
          where m.id = module_id and c.is_published = true));
create policy "user_progress_own" on public.user_progress for all using (auth.uid() = user_id);
create policy "user_courses_own" on public.user_courses for select using (auth.uid() = user_id);
create policy "certificates_own" on public.certificates for select using (auth.uid() = user_id);
create policy "resources_public_read" on public.resources for select using (is_published = true);
create policy "posts_public_read" on public.posts for select using (is_published = true);

select 'Schema LE GUIDE IA cree avec succes!' as status;
