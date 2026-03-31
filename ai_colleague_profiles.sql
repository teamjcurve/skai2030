-- Supabase SQL Editor에서 한 번 실행하세요. (public.sessions 가 이미 있어야 합니다.)
create table if not exists public.ai_colleague_profiles (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.sessions (id) on delete set null,
  colleague_name text not null,
  colleague_role text not null,
  background_context text not null,
  do_and_donts text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists ai_colleague_profiles_session_id_idx
  on public.ai_colleague_profiles (session_id);

alter table public.ai_colleague_profiles enable row level security;

-- 앱(anon 키)에서 insert 허용 — open_feedbacks 와 동일한 수준
create policy "ai_colleague_profiles_insert_anon"
  on public.ai_colleague_profiles
  for insert
  to anon, authenticated
  with check (true);
