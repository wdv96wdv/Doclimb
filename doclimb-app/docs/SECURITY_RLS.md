# DoClimb Supabase RLS 점검 가이드

이 문서는 `src/ddl.sql` 및 앱 기능 기준으로 **Row Level Security(RLS)** 를 점검할 때 확인할 항목을 정리합니다.

## ADMIN RLS 마이그레이션 (적용 파일)

프로젝트에 ADMIN 전용 정책 SQL이 포함되어 있습니다.

- **파일:** `supabase/migrations/20260526120000_admin_rls_policies.sql`
- **적용 방법:** [APPLY_RLS_MIGRATION.md](./APPLY_RLS_MIGRATION.md)

포함 내용: `is_admin()` 함수, `gyms` / `memberships` / `betas` / `route_ratings` / `community_comments` 정책, `delete_user_account` RPC

## 필수 환경 변수

| 변수 | 용도 |
|------|------|
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL |
| `VITE_SUPABASE_ANON_KEY` | 클라이언트 anon 키 (RLS 적용됨) |
| `VITE_APP_BASE_URL` | OAuth·비밀번호 재설정 리다이렉트 |

`.env.example`을 복사해 `.env.local`을 만드세요.

---

## 테이블별 점검 체크리스트

### profiles

- [ ] RLS **ENABLED**
- [ ] SELECT: 공개 조회 정책이 의도한 범위인지 (현재: 전체 공개 → 이메일·닉네임 노출 주의)
- [ ] INSERT: `auth.uid() = id` (본인 프로필만)
- [ ] UPDATE/DELETE: 본인만
- [ ] **ADMIN** 역할이 다른 사용자 프로필/이용권을 수정해야 한다면 별도 정책 또는 `service_role` 전용 Edge Function 검토

### records

- [ ] SELECT: `is_public = true` 또는 `auth.uid() = user_id`
- [ ] INSERT/UPDATE/DELETE: `auth.uid() = user_id`
- [ ] 관리자가 모든 기록을 볼 필요가 있으면 ADMIN 정책 추가

### community_posts / community_comments

- [ ] 게시글 SELECT 정책 (전체 공개 vs 작성자만)
- [ ] 댓글 INSERT 시 `user_id` 검증
- [ ] 삭제는 작성자만

### gyms

- [ ] SELECT: 일반 사용자 읽기 허용
- [ ] UPDATE `current_status`: **관리자만** 가능해야 함 (일반 유저가 GymList에서 수정 가능하면 RLS 또는 UI 권한 재검토)
- [ ] INSERT: **관리자만** (`AdminAddGym`)

### betas / route_ratings

- [ ] betas INSERT: 로그인 사용자, `user_id = auth.uid()`
- [ ] betas DELETE: 작성자만
- [ ] route_ratings UPSERT: 본인 `user_id`만

### user_badges / badges

- [ ] badges: 전체 SELECT
- [ ] user_badges: 본인 SELECT / INSERT (뱃지 지급은 서버 로직 또는 SECURITY DEFINER 함수)

### memberships (AdminUsers)

- [ ] **일반 사용자 접근 차단** — 관리자 전용 정책 또는 RPC 필수
- [ ] `grantMembership` / `cancelActiveMembership`이 클라이언트에서 동작한다면 ADMIN RLS 확인

### Storage

- [ ] `avatars`: 본인 폴더(`user_id`)만 업로드/수정/삭제
- [ ] `post_images`: 인증 사용자 업로드, 삭제는 owner만

---

## 위험 시나리오 (우선 확인)

1. **anon 키로 타인 프로필/이메일 대량 조회** — profiles SELECT가 `true`이면 아이디 찾기·스크래핑에 악용 가능
2. **gyms 혼잡도를 비관리자가 UPDATE** — `updateGymStatus`가 모든 로그인 유저에게 열려 있지 않은지
3. **memberships 테이블** — 이용권 부여/회수가 ADMIN 없이 가능한지
4. **`delete_user_account` RPC** — 호출 권한이 본인만인지

---

## 권장 ADMIN 정책 예시 (참고)

```sql
-- profiles.role = 'ADMIN' 인 사용자만 gyms INSERT 등
CREATE POLICY "Admin can insert gyms"
ON public.gyms FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND upper(role) = 'ADMIN'
  )
);
```

Supabase SQL Editor에서 정책 적용 후, **일반 계정·관리자 계정**으로 각 기능을 수동 테스트하세요.

---

## 앱 레벨 보안 (이미 반영된 부분)

- 인증 API: `AuthContext` + `services/auth.js`
- 페이지 라우트: `RequireUserNonAdmin`, `/admin/*` role 가드
- 비밀번호 정책: `utils/passwordValidation.js` (가입·재설정 공통)

RLS는 **DB에서 최종 방어선**입니다. UI 가드만으로는 우회 가능하므로 반드시 Supabase 대시보드에서 정책을 확인하세요.
