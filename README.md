# 한국 현수막 저장소 (banner-archive-v2)

시민이 직접 업로드한 정치 현수막 이미지를 AI로 분석하고, 아카이브/통계/신고/관리 기능으로 보존하는 Next.js 기반 서비스입니다.

## 핵심 기능

- 현수막 업로드 2단계
  - 1단계: AI 분석(`Gemini`)으로 제목/해시태그/주체유형/현수막 bbox 감지
  - 2단계: 검토 후 저장
- 개인정보 보호 처리
  - 얼굴/번호판 영역 감지 후 서버에서 블러 처리
- 중복 현수막 판정
  - 제목/해시태그/날짜 유사도 기반으로 기존 배너와 병합(`observed_count` 증가)
- 아카이브 조회
  - 상태/주체/지역 필터 + 정렬 + 페이지네이션
- 통계 페이지
  - 지역별 지도 버블 + 전국/지역 요약(해시태그, 월별 추이, 주체 분포)
- 신고 및 관리자 처리
  - 신고 접수, 관리자 로그인, 신고 상태 변경, 배너 상태(active/hidden/deleted) 조정

## 기술 스택

- Framework: Next.js 16 (App Router), React 19, TypeScript
- UI: Tailwind CSS v4, MUI, React Query
- DB/ORM: PostgreSQL(Supabase), Drizzle ORM
- Storage: Supabase Storage
- AI: Google Gemini (`@google/genai`)
- Security: `iron-session`(관리자 세션), Upstash Redis Rate Limit
- Image processing: `sharp`
- Test: Vitest

## 프로젝트 구조

```text
src/
  app/
    (client)/                # 사용자 화면 (홈/아카이브/업로드/신고/통계)
    admin/                   # 관리자 화면 (로그인/대시보드/신고 관리)
    api/                     # API 라우트
  lib/
    api/                     # DB 조회/도메인 로직
    ai/                      # Gemini 분석
    auth/                    # 관리자 세션/경로 유틸
    db/                      # Drizzle 스키마/DB 클라이언트
    storage/                 # Supabase Storage 업로드/삭제
  utils/
    duplicate/               # 중복 판정(Jaccard/overlap)
    image/                   # 블러/크롭 유틸
scripts/
  seed-regions.ts            # regions 시드
  create-admin.ts            # 관리자 계정 생성
drizzle/
  0000_strong_luckman.sql    # 초기 스키마 SQL
```

## 사전 준비

- Node.js 20+
- npm
- PostgreSQL (권장: Supabase)
- Upstash Redis
- Gemini API Key

## 설치 및 실행

```bash
npm i
npm run dev
```

- 기본 접속: `http://localhost:3000`

## 환경 변수

`.env.example`를 복사해 `.env.development.local`을 만들고 값을 채우세요.

```bash
cp .env.example .env.development.local
```

필수 변수:

- `DATABASE_URL`: PostgreSQL 연결 문자열
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`
- `GEMINI_API_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `ADMIN_SESSION_SECRET`: iron-session 비밀키(충분히 긴 문자열)
- `NEXT_PUBLIC_ADMIN_PATH`: 관리자 공개 진입 경로 (예: `/ops-9f3k2m7x`)
- `NEXTAUTH_URL`: 메타데이터/사이트맵/robots 기준 URL

주의:

- `NEXT_PUBLIC_ADMIN_PATH` 미설정 시 기본값은 `/secret-dashboard`입니다.
- `/admin` 경로는 내부 라우트로 예약되어 있으며 외부 진입은 rewrite된 공개 경로를 사용합니다.

## 데이터베이스 준비

### 1) 스키마 적용

`drizzle/0000_strong_luckman.sql`을 DB에 적용하세요.

예시:

```bash
psql "$DATABASE_URL" -f drizzle/0000_strong_luckman.sql
```

### 2) 지역 데이터 시드

```bash
npx tsx --env-file=.env.development.local scripts/seed-regions.ts
```

또는 package script 사용(기본은 production env 파일 참조):

```bash
npm run seed:regions
```

### 3) 관리자 계정 생성

```bash
npx tsx --env-file=.env.development.local scripts/create-admin.ts
```

스크립트 기본 계정:

- email: `admin@example.com`
- password: `changeme1234!`

실사용 전 반드시 변경하세요.

## NPM 스크립트

- `npm run dev`: 개발 서버
- `npm run build`: 프로덕션 빌드
- `npm run start`: 프로덕션 서버 실행
- `npm run lint`: ESLint
- `npm run test`: Vitest 단발 실행
- `npm run test:watch`: Vitest watch
- `npm run seed:regions`: 지역 시드 (기본 `.env.production.local`)

## 주요 API

- `POST /api/banners/analyze`
  - 이미지 + 지역 텍스트를 받아 AI 분석/블러/크롭 결과 반환
- `GET /api/banners`
  - 배너 목록 조회 (필터/정렬/페이지)
- `POST /api/banners`
  - 분석 결과 저장 (중복이면 기존 배너 카운트 증가)
- `GET /api/banners/:id`
  - 배너 상세 조회
- `POST /api/reports`
  - 배너 신고 접수
- `GET /api/regions?parentId=`
  - 계층형 지역 목록 조회
- `GET /api/stats/banners?level=sido|sigungu|eupmyeondong`
  - 지도용 지역 집계
- `GET /api/stats/summary?sido=&sigungu=&eupmyeondong=`
  - 요약 통계
- `POST /api/admin/auth/login`, `POST /api/admin/auth/logout`
- `GET /api/admin/reports`, `PATCH /api/admin/reports/:id`
- `PATCH /api/admin/banners/:id`

## 레이트 리밋

`src/proxy.ts`에서 POST API 요청에 IP 기반 제한을 적용합니다.

- 분석(`analyze`): 시간당 20회
- 저장(기본 POST): 시간당 20회
- 신고(`reports`): 시간당 5회

## 중복 판정 규칙

같은 `regionText` 내 기존 배너와 비교해 유사도 임계치 `0.75` 이상이면 중복으로 처리합니다.

- 제목 유사도(가중치 0.7): Jaccard + 포함률 중 높은 값
- 해시태그 유사도(가중치 0.2): Jaccard
- 날짜 근접도(가중치 0.1): 30일 내 선형 감쇠

중복일 경우:

- 새 배너를 만들지 않고 기존 배너의 `observed_count` 증가
- `last_seen_at` 갱신
- 업로드된 신규 이미지는 스토리지에서 삭제

## 배포/운영 메모

- `metadataBase`, `sitemap`, `robots` 생성에 `NEXTAUTH_URL`이 사용됩니다.
- 관리자 경로는 rewrite 기반이므로, 운영 환경에서도 `NEXT_PUBLIC_ADMIN_PATH`를 반드시 설정하세요.
- Supabase Storage 공개 URL이 이미지 렌더링 허용 도메인(`next.config.ts`)과 일치해야 합니다.

## 테스트

```bash
npm run test
```
