-- =============================================================================
-- DoClimb: ADMIN RLS policies + helper functions
-- Supabase SQL Editor 또는 `supabase db push` 로 적용
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. ADMIN 판별 함수 (SECURITY DEFINER → RLS 재귀 방지)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND upper(coalesce(role, 'USER')) = 'ADMIN'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- -----------------------------------------------------------------------------
-- 2. gyms — 혼잡도·암장 관리 (관리자만 INSERT/UPDATE)
-- -----------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.gyms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gyms_select_all" ON public.gyms;
DROP POLICY IF EXISTS "gyms_insert_admin" ON public.gyms;
DROP POLICY IF EXISTS "gyms_update_admin" ON public.gyms;
DROP POLICY IF EXISTS "gyms_delete_admin" ON public.gyms;

CREATE POLICY "gyms_select_all"
  ON public.gyms FOR SELECT
  USING (true);

CREATE POLICY "gyms_insert_admin"
  ON public.gyms FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "gyms_update_admin"
  ON public.gyms FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "gyms_delete_admin"
  ON public.gyms FOR DELETE
  USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- 3. memberships — 이용권 (본인 조회 + 관리자 전체 관리)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS memberships_user_id_idx ON public.memberships(user_id);
CREATE INDEX IF NOT EXISTS memberships_status_idx ON public.memberships(status);

ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "memberships_select_own_or_admin" ON public.memberships;
DROP POLICY IF EXISTS "memberships_insert_admin" ON public.memberships;
DROP POLICY IF EXISTS "memberships_update_admin" ON public.memberships;
DROP POLICY IF EXISTS "memberships_delete_admin" ON public.memberships;

CREATE POLICY "memberships_select_own_or_admin"
  ON public.memberships FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "memberships_insert_admin"
  ON public.memberships FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "memberships_update_admin"
  ON public.memberships FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "memberships_delete_admin"
  ON public.memberships FOR DELETE
  USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- 4. betas / route_ratings (피드)
-- -----------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.betas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.route_ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "betas_select_all" ON public.betas;
DROP POLICY IF EXISTS "betas_insert_own" ON public.betas;
DROP POLICY IF EXISTS "betas_delete_own_or_admin" ON public.betas;

CREATE POLICY "betas_select_all"
  ON public.betas FOR SELECT
  USING (true);

CREATE POLICY "betas_insert_own"
  ON public.betas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "betas_delete_own_or_admin"
  ON public.betas FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "route_ratings_select_all" ON public.route_ratings;
DROP POLICY IF EXISTS "route_ratings_insert_own" ON public.route_ratings;
DROP POLICY IF EXISTS "route_ratings_update_own" ON public.route_ratings;

CREATE POLICY "route_ratings_select_all"
  ON public.route_ratings FOR SELECT
  USING (true);

CREATE POLICY "route_ratings_insert_own"
  ON public.route_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "route_ratings_update_own"
  ON public.route_ratings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 5. community_comments
-- -----------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.community_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "comments_select_all" ON public.community_comments;
DROP POLICY IF EXISTS "comments_insert_own" ON public.community_comments;
DROP POLICY IF EXISTS "comments_delete_own_or_admin" ON public.community_comments;

CREATE POLICY "comments_select_all"
  ON public.community_comments FOR SELECT
  USING (true);

CREATE POLICY "comments_insert_own"
  ON public.community_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comments_delete_own_or_admin"
  ON public.community_comments FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

-- -----------------------------------------------------------------------------
-- 6. profiles — 관리자: 전체 조회(이용권 관리), 본인: 수정
--    (기존 "전체 공개 SELECT" 정책이 있으면 유지·병행 가능)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;

CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- -----------------------------------------------------------------------------
-- 7. user_badges — 시스템/본인 INSERT (뱃지 자동 지급)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "user_badges_insert_own" ON public.user_badges;

CREATE POLICY "user_badges_insert_own"
  ON public.user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 8. 회원 탈퇴 RPC (본인만 호출)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  DELETE FROM public.profiles WHERE id = uid;
  DELETE FROM auth.users WHERE id = uid;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_user_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;
