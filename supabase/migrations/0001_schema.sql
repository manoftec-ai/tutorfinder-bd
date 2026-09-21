-- TutorFinder BD — MVP schema (free DocTime-style review directory)
-- Apply via: supabase db push (after `supabase link`)

create extension if not exists pg_trgm;

-- ---------------------------------------------------------------------------
-- PROFILES
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  role        text not null default 'guardian' check (role in ('tutor', 'guardian', 'admin')),
  name        text not null default '',
  phone       text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- public-safe view (no phone / no internals)
create or replace view public.profiles_public as
  select id, role, name, created_at from public.profiles;

-- auto-create profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, role, name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'role', 'guardian'),
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- REFERENCE DATA
-- ---------------------------------------------------------------------------
create table if not exists public.areas (
  id          bigint generated always as identity primary key,
  slug        text not null unique,
  name        text not null,
  bengali_name text not null default '',
  division    text not null default 'Dhaka',
  district    text not null default 'Dhaka',
  thana       text not null default ''
);

create table if not exists public.subjects (
  id          bigint generated always as identity primary key,
  slug        text not null unique,
  name        text not null,
  bengali_name text not null default '',
  category    text not null default 'academic'
);

create table if not exists public.levels (
  id          bigint generated always as identity primary key,
  code        text not null unique,
  label       text not null
);

-- ---------------------------------------------------------------------------
-- TUTOR PROFILES
-- ---------------------------------------------------------------------------
create table if not exists public.tutor_profiles (
  id                 uuid primary key references public.profiles (id) on delete cascade,
  slug               text not null unique,
  headline           text not null default '',
  institution        text not null default '',
  qualification      text not null default '',
  experience_months  int not null default 0,
  bio                text not null default '',
  fee_min            int not null default 0,
  fee_max            int not null default 0,
  currency           text not null default 'BDT',
  gender             text not null default '' check (gender in ('', 'male', 'female', 'other')),
  modes              text[] not null default '{}' check (modes <@ array['home','online','group']),
  verification_status text not null default 'unverified'
                     check (verification_status in ('unverified', 'pending', 'verified')),
  status             text not null default 'pending'
                     check (status in ('pending', 'active', 'suspended')),
  is_featured        boolean not null default false,
  photo_url          text not null default '',
  ratings_avg        numeric(3,2) not null default 0,
  review_count       int not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table if not exists public.tutor_subjects (
  tutor_id uuid not null references public.tutor_profiles (id) on delete cascade,
  subject_id bigint not null references public.subjects (id) on delete cascade,
  primary key (tutor_id, subject_id)
);

create table if not exists public.tutor_areas (
  tutor_id uuid not null references public.tutor_profiles (id) on delete cascade,
  area_id  bigint not null references public.areas (id) on delete cascade,
  primary key (tutor_id, area_id)
);

create table if not exists public.tutor_levels (
  tutor_id uuid not null references public.tutor_profiles (id) on delete cascade,
  level_id bigint not null references public.levels (id) on delete cascade,
  primary key (tutor_id, level_id)
);

create table if not exists public.verification_documents (
  id         bigint generated always as identity primary key,
  tutor_id   uuid not null references public.tutor_profiles (id) on delete cascade,
  doc_type   text not null default 'nid' check (doc_type in ('nid', 'institution_id', 'certificate')),
  file_path  text not null default '',
  status     text not null default 'pending' check (status in ('pending', 'validated', 'rejected')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- ENGAGEMENTS (contact-request flow)
-- ---------------------------------------------------------------------------
create table if not exists public.engagements (
  id          bigint generated always as identity primary key,
  guardian_id uuid not null references public.profiles (id) on delete cascade,
  tutor_id    uuid not null references public.tutor_profiles (id) on delete cascade,
  area_id     bigint references public.areas (id),
  subject_note text not null default '',
  level_note  text not null default '',
  status      text not null default 'requested'
              check (status in ('requested', 'contact_exchanged', 'started', 'completed', 'cancelled')),
  guardian_notes text not null default '',
  decided_at  timestamptz,
  completed_at timestamptz,
  created_at  timestamptz not null default now(),
  unique (guardian_id, tutor_id, area_id, subject_note, level_note)
);

-- ---------------------------------------------------------------------------
-- REVIEWS (gated by completed engagement)
-- ---------------------------------------------------------------------------
create table if not exists public.reviews (
  id                     bigint generated always as identity primary key,
  engagement_id          bigint not null references public.engagements (id) on delete cascade unique,
  guardian_id            uuid not null references public.profiles (id) on delete cascade,
  tutor_id               uuid not null references public.tutor_profiles (id) on delete cascade,
  rating_overall         int not null check (rating_overall between 1 and 5),
  rating_teaching        int not null check (rating_teaching between 1 and 5),
  rating_punctuality     int not null check (rating_punctuality between 1 and 5),
  rating_communication   int not null check (rating_communication between 1 and 5),
  comment                text not null default '',
  tutor_reply            text not null default '',
  moderation_status      text not null default 'pending' check (moderation_status in ('pending','approved','removed')),
  created_at             timestamptz not null default now()
);

create index if not exists idx_tutor_profiles_status on public.tutor_profiles (status);
create index if not exists idx_tutor_profiles_verified on public.tutor_profiles (verification_status);
create index if not exists idx_reviews_tutor_approved on public.reviews (tutor_id, moderation_status);
create index if not exists idx_engagements_tutor on public.engagements (tutor_id, status);
create index if not exists idx_engagements_guardian on public.engagements (guardian_id, status);

-- ---------------------------------------------------------------------------
-- REPORTS / BLOCKS
-- ---------------------------------------------------------------------------
create table if not exists public.reports (
  id          bigint generated always as identity primary key,
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  target_user_id uuid not null references public.profiles (id) on delete cascade,
  kind        text not null default 'other' check (kind in ('tutor', 'guardian', 'review')),
  reason      text not null default '',
  status      text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
-- NOTE: do NOT set security_invoker here. The view runs with owner privileges so
-- it can expose the intended public-safe columns while profiles stays locked down.
alter table public.tutor_profiles enable row level security;
alter table public.tutor_subjects enable row level security;
alter table public.tutor_areas enable row level security;
alter table public.tutor_levels enable row level security;
alter table public.areas enable row level security;
alter table public.subjects enable row level security;
alter table public.levels enable row level security;
alter table public.verification_documents enable row level security;
alter table public.engagements enable row level security;
alter table public.reviews enable row level security;
alter table public.reports enable row level security;

-- profiles: only via public view; self update
create policy "profiles_select_deny" on public.profiles for select using (false);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- reference data: public read
create policy "areas_select" on public.areas for select using (true);
create policy "subjects_select" on public.subjects for select using (true);
create policy "levels_select" on public.levels for select using (true);

-- tutor_profiles: public read of non-suspended; owner write; admin write
create policy "tutor_profiles_select" on public.tutor_profiles
  for select using (status <> 'suspended');
create policy "tutor_profiles_insert_own" on public.tutor_profiles
  for insert with check (auth.uid() = id);
create policy "tutor_profiles_update_own" on public.tutor_profiles
  for update using (auth.uid() = id);
create policy "tutor_profiles_admin" on public.tutor_profiles
  for update using (
    exists (select 1 from public.profiles_public p where p.id = auth.uid() and p.role = 'admin')
  );

-- join tables: public read (ids only, harmless); owner write
create policy "tutor_subjects_select" on public.tutor_subjects for select using (true);
create policy "tutor_subjects_write" on public.tutor_subjects
  for all using (auth.uid() = tutor_id) with check (auth.uid() = tutor_id);
create policy "tutor_areas_select" on public.tutor_areas for select using (true);
create policy "tutor_areas_write" on public.tutor_areas
  for all using (auth.uid() = tutor_id) with check (auth.uid() = tutor_id);
create policy "tutor_levels_select" on public.tutor_levels for select using (true);
create policy "tutor_levels_write" on public.tutor_levels
  for all using (auth.uid() = tutor_id) with check (auth.uid() = tutor_id);

-- verification_documents: owner only
create policy "docs_select_own" on public.verification_documents for select using (auth.uid() = tutor_id);
create policy "docs_insert_own" on public.verification_documents
  for insert with check (auth.uid() = tutor_id);

-- engagements: guardian (own requests), tutor (incoming), admin
create policy "engagements_select_guardian" on public.engagements
  for select using (auth.uid() = guardian_id);
create policy "engagements_select_tutor" on public.engagements
  for select using (auth.uid() = tutor_id);
create policy "engagements_insert_guardian" on public.engagements
  for insert with check (auth.uid() = guardian_id);
create policy "engagements_update_guardian" on public.engagements
  for update using (auth.uid() = guardian_id);
create policy "engagements_update_tutor" on public.engagements
  for update using (auth.uid() = tutor_id);

-- reviews: public select only approved; guardian writes own; tutor replies; admin moderates
create policy "reviews_select_approved" on public.reviews
  for select using (moderation_status = 'approved' or auth.uid() = guardian_id or auth.uid() = tutor_id);
create policy "reviews_insert_guardian" on public.reviews
  for insert with check (
    auth.uid() = guardian_id
    and exists (
      select 1 from public.engagements e
      where e.id = engagement_id and e.guardian_id = auth.uid() and e.status = 'completed'
    )
  );
create policy "reviews_update_guardian" on public.reviews
  for update using (auth.uid() = guardian_id);
create policy "reviews_update_tutor_reply" on public.reviews
  for update using (auth.uid() = tutor_id);
create policy "reviews_admin" on public.reviews
  for update using (
    exists (select 1 from public.profiles_public p where p.id = auth.uid() and p.role = 'admin')
  );

-- reports
create policy "reports_insert_auth" on public.reports for insert with check (auth.uid() = reporter_id);
create policy "reports_select_admin" on public.reports
  for select using (
    exists (select 1 from public.profiles_public p where p.id = auth.uid() and p.role = 'admin')
  );

-- ---------------------------------------------------------------------------
-- HELPER FUNCTIONS
-- ---------------------------------------------------------------------------
create or replace function public.aggregate_reviews(targ uuid)
returns void language plpgsql security definer as $$
begin
  update public.tutor_profiles tp
  set ratings_avg = coalesce(
        (select round(avg((r.rating_overall + r.rating_teaching + r.rating_punctuality + r.rating_communication) / 4.0), 2)
         from public.reviews r where r.tutor_id = targ and r.moderation_status = 'approved'), 0),
      review_count = (select count(*) from public.reviews r where r.tutor_id = targ and r.moderation_status = 'approved')
  where tp.id = targ;
end;
$$;

create or replace function public.touch_engagement_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'completed' then
    new.completed_at := now();
  end if;
  if new.status = 'requested' then
    new.decided_at := null;
  elsif new.status <> 'requested' then
    new.decided_at := coalesce(new.decided_at, now());
  end if;
  return new;
end;
$$;

drop trigger if exists trg_engagement_status on public.engagements;
create trigger trg_engagement_status
  before insert or update on public.engagements
  for each row execute function public.touch_engagement_status();

-- recalc aggregates whenever a review is approved/removed
create or replace function public.on_review_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    if new.moderation_status = 'approved' then
      perform public.aggregate_reviews(new.tutor_id);
    end if;
    return new;
  elsif tg_op = 'UPDATE' then
    perform public.aggregate_reviews(new.tutor_id);
    perform public.aggregate_reviews(old.tutor_id);
    return new;
  elsif tg_op = 'DELETE' then
    perform public.aggregate_reviews(old.tutor_id);
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_review_change on public.reviews;
create trigger trg_review_change
  after insert or update or delete on public.reviews
  for each row execute function public.on_review_change();