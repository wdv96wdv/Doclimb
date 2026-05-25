# DoClimb (doclimb-app)

클라이밍 기록·커뮤니티·암장 혼잡도·베타 공유·AI 코치를 제공하는 React SPA입니다.

## 기술 스택

- React 19 + Vite 7
- React Router 7
- Supabase (Auth, Postgres, Storage, Edge Functions)
- Vercel Analytics

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수

`.env.example`을 참고해 `.env.local`을 생성합니다.

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_BASE_URL=http://localhost:5173
```

프로덕션(Vercel)에서는 `VITE_APP_BASE_URL`을 배포 도메인으로 설정하세요.

### 3. 개발 서버

```bash
npm run dev
```

### 4. 빌드 / 미리보기

```bash
npm run build
npm run preview
```

### 5. 테스트

```bash
npm test
```

## 프로젝트 구조

```
src/
├── App.jsx              # 라우팅, lazy routes, 권한 가드
├── context/             # AuthContext
├── routes/              # RequireUserNonAdmin 등
├── services/            # Supabase API (record, community, gym, beta, admin, auth…)
├── hooks/               # useJoinForm 등
├── utils/               # passwordValidation, climbingUtils, notify
├── components/          # Layout, Common, Calendar, Ai
└── pages/               # 기능별 화면
```

## 주요 기능

| 경로 | 설명 |
|------|------|
| `/` | 홈 (비로그인 랜딩 / 로그인 대시보드) |
| `/records` | 등반 기록 CRUD |
| `/community` | 커뮤니티 게시판 |
| `/gymlist` | 암장 혼잡도 |
| `/beta` | 인스타 베타 피드 |
| `/ranking` | 암장별 랭킹 |
| `/ai-coach` | AI 코치 (Edge Function) |
| `/admin/*` | 관리자 (ADMIN role) |

## 보안

- DB RLS 점검: [docs/SECURITY_RLS.md](./docs/SECURITY_RLS.md)
- **ADMIN RLS 적용:** [docs/APPLY_RLS_MIGRATION.md](./docs/APPLY_RLS_MIGRATION.md)  
  (`supabase/migrations/20260526120000_admin_rls_policies.sql`)
- 스키마 참고: `src/ddl.sql`

## Supabase Edge Function

AI 추천: `supabase/functions/ai-recommend` (Gemini API는 서버 측에서만 호출 권장)

## 스크립트

| 명령 | 설명 |
|------|------|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm run lint` | ESLint |
| `npm test` | Vitest |
