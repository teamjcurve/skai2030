-- sessions 테이블 RLS: Admin 대시보드가 브라우저 anon 키로 insert/update/delete 하므로
-- 해당 작업을 허용하는 정책이 필요합니다.
-- (오류: new row violates row-level security policy for table "sessions")
--
-- Supabase Dashboard → SQL Editor에서 실행하세요.
--
-- 보안 참고: anon 키는 클라이언트에 포함됩니다. 차수 테이블을 누구나 쓸 수 있게 됩니다.
-- 내부용/워크숍용이면 보통 허용하고, 공개 배포 시에는 Edge Function + service_role 등을 검토하세요.

alter table public.sessions enable row level security;

drop policy if exists "sessions_anon_insert" on public.sessions;
drop policy if exists "sessions_anon_update" on public.sessions;
drop policy if exists "sessions_anon_delete" on public.sessions;

create policy "sessions_anon_insert"
  on public.sessions
  for insert
  to anon, authenticated
  with check (true);

-- 일괄/단일 등록 시 upsert(onConflict) 가 UPDATE 경로를 타므로 필요합니다.
create policy "sessions_anon_update"
  on public.sessions
  for update
  to anon, authenticated
  using (true)
  with check (true);

-- 관리 화면에서 차수 삭제 시 필요합니다.
create policy "sessions_anon_delete"
  on public.sessions
  for delete
  to anon, authenticated
  using (true);
