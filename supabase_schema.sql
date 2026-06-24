-- ============================================================
-- ShieldAI Supabase Schema
-- Paste this in: Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

-- PROFILES (auto-created on signup via trigger)
create table if not exists public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  full_name   text,
  city        text,
  updated_at  timestamptz default now()
);

-- FRAUD REPORTS
create table if not exists public.fraud_reports (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users on delete set null,
  fraud_type  text not null,
  description text,
  phone       text,
  city        text,
  status      text default 'pending',
  created_at  timestamptz default now()
);

-- SCAM CHECKS
create table if not exists public.scam_checks (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users on delete set null,
  input_text  text,
  risk_score  int,
  verdict     text,
  created_at  timestamptz default now()
);

-- CURRENCY SCANS
create table if not exists public.currency_scans (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users on delete set null,
  verdict    text,
  score      int,
  created_at timestamptz default now()
);

-- LIVE ALERTS (admin-populated / seeded)
create table if not exists public.live_alerts (
  id         uuid default gen_random_uuid() primary key,
  icon       text default '🔴',
  type       text default 'warn',
  label      text not null,
  text       text not null,
  city       text,
  created_at timestamptz default now()
);

-- CITY HOTSPOTS
create table if not exists public.city_hotspots (
  id           uuid default gen_random_uuid() primary key,
  city         text not null,
  report_count int default 0,
  top_fraud    text,
  lat          numeric,
  lng          numeric,
  updated_at   timestamptz default now()
);

-- ── AUTO-CREATE PROFILE ON SIGNUP ─────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── ROW LEVEL SECURITY ─────────────────────────────────────────
alter table public.profiles       enable row level security;
alter table public.fraud_reports  enable row level security;
alter table public.scam_checks    enable row level security;
alter table public.currency_scans enable row level security;
alter table public.live_alerts    enable row level security;
alter table public.city_hotspots  enable row level security;

-- Profiles: users see only their own
create policy "users read own profile"   on public.profiles for select using (auth.uid() = id);
create policy "users update own profile" on public.profiles for update using (auth.uid() = id);

-- Fraud reports: anon can insert, users see their own
create policy "anon insert fraud_reports"    on public.fraud_reports for insert to anon    with check (true);
create policy "auth insert fraud_reports"    on public.fraud_reports for insert to authenticated with check (true);
create policy "users read own reports"       on public.fraud_reports for select using (auth.uid() = user_id);

-- Scam checks: anon insert allowed, users see their own
create policy "anon insert scam_checks"  on public.scam_checks for insert to anon           with check (true);
create policy "auth insert scam_checks"  on public.scam_checks for insert to authenticated   with check (true);
create policy "users read own checks"    on public.scam_checks for select using (auth.uid() = user_id);

-- Currency scans
create policy "anon insert currency_scans"  on public.currency_scans for insert to anon          with check (true);
create policy "auth insert currency_scans"  on public.currency_scans for insert to authenticated  with check (true);
create policy "users read own scans"        on public.currency_scans for select using (auth.uid() = user_id);

-- Live alerts and hotspots: public read
create policy "public read live_alerts"   on public.live_alerts   for select to anon using (true);
create policy "public read city_hotspots" on public.city_hotspots for select to anon using (true);

-- ── SEED DATA ──────────────────────────────────────────────────
insert into public.live_alerts (icon, type, label, text, city) values
  ('📞','danger','Digital Arrest Scam','Fake ED officer targeting retirees — do not engage','Delhi'),
  ('💸','warn',  'UPI Fraud',          'Rs.48,000 siphoned via QR redirect scam','Pune'),
  ('🎭','danger','Deepfake Call',      'AI voice clone impersonating a judge reported','Hyderabad'),
  ('🏧','warn',  'Counterfeit Note',   'Fake Rs.500 batch flagged at 3 ATMs','Kolkata'),
  ('📱','safe',  'Warning Issued',     'TRAI SIM-block scam spreading via WhatsApp','Nationwide'),
  ('💼','warn',  'Job Scam',           '89 new victims of work-from-home fraud scheme','Bengaluru');

insert into public.city_hotspots (city, report_count, top_fraud, lat, lng) values
  ('Delhi NCR', 847, 'Digital Arrest Scams', 28.6139, 77.2090),
  ('Mumbai',    623, 'UPI Fraud',            19.0760, 72.8777),
  ('Bengaluru', 534, 'Job Scams',            12.9716, 77.5946),
  ('Hyderabad', 289, 'Courier Fraud',        17.3850, 78.4867),
  ('Kolkata',   198, 'Counterfeit Currency', 22.5726, 88.3639),
  ('Pune',      312, 'Investment Scams',     18.5204, 73.8567),
  ('Lucknow',   156, 'OTP Fraud',            26.8467, 80.9462);
