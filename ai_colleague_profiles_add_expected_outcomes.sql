-- 기존 Supabase DB에만 실행: 워크플로우 재설계 폼의 3번 항목(업무 결과물 및 예상되는 효과) 저장 컬럼
-- 새 프로젝트는 ai_colleague_profiles.sql 전체를 실행하면 이 컬럼이 이미 포함됩니다.

alter table public.ai_colleague_profiles
  add column if not exists expected_outcomes text not null default '';

alter table public.ai_colleague_profiles
  alter column expected_outcomes drop default;
