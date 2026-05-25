# ADMIN RLS 마이그레이션 적용 방법

마이그레이션 파일:

`supabase/migrations/20260526120000_admin_rls_policies.sql`

## Supabase 대시보드에서 적용 (권장)

1. [Supabase Dashboard](https://supabase.com/dashboard) → 프로젝트 선택
2. **SQL Editor** → New query
3. 위 SQL 파일 **전체 내용**을 붙여넣기
4. **Run** 실행
5. 에러 없이 완료되면 아래 검증 수행

## Supabase CLI로 적용

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

로컬 개발 DB:

```bash
supabase start
supabase db reset
```

## 적용 후 검증 체크리스트

### 1. ADMIN 계정 준비

```sql
-- 본인 계정을 ADMIN으로 승격 (최초 1회, SQL Editor에서 실행)
UPDATE public.profiles
SET role = 'ADMIN'
WHERE email = 'your-admin@email.com';
```

### 2. 일반 USER 계정으로 테스트

| 기능 | 기대 결과 |
|------|-----------|
| `/gymlist` 혼잡도 변경 버튼 | UI에 버튼 없음 (이미 앱에서 숨김) |
| API로 `gyms` UPDATE 시도 | **거부** (RLS) |
| `/admin` 이용권 부여 | **거부** |
| 베타 글 삭제 (본인 글) | **허용** |
| 타인 베타 삭제 | **거부** |

### 3. ADMIN 계정으로 테스트

| 기능 | 기대 결과 |
|------|-----------|
| `/admin` 유저·이용권 관리 | **허용** |
| 암장 등록 (`AdminAddGym`) | **허용** |
| 혼잡도 변경 (`AdminCongestion`, `/gymlist`) | **허용** |
| `select public.is_admin()` | `true` |

### 4. 회원 탈퇴

- 마이페이지 탈퇴 → `delete_user_account` RPC 성공
- 다른 사용자 UID로 RPC 호출 → **거부**

## 문제 해결

### `relation "public.gyms" does not exist`

프로덕션 DB에 `gyms` 테이블이 아직 없습니다. Supabase에 테이블을 먼저 생성한 뒤 마이그레이션을 다시 실행하세요.

### `policy already exists`

동일 이름 정책이 이미 있습니다. 마이그레이션 파일은 `DROP POLICY IF EXISTS`를 포함하므로 **파일 전체를 다시 실행**하거나, 충돌하는 정책만 수동으로 DROP 후 재실행하세요.

### 이용권 화면이 비어 있음

`memberships` 테이블이 이 마이그레이션에서 자동 생성됩니다. 기존 데이터가 없으면 Admin에서 이용권을 새로 부여하면 됩니다.

## 관련 문서

- [SECURITY_RLS.md](./SECURITY_RLS.md) — 보안 점검 개요
