# ⚡ ProcessFlow

> SAP 기반 업무 흐름을 입력하면 자동으로 프로세스를 시각화하고 단계별 Word 매뉴얼을 생성해주는 웹 플랫폼

---

## 📌 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 서비스명 | ProcessFlow |
| 대상 | SAP 기반 업무 팀 (CO, FI, MM 등) |
| 예상 사용자 | 최대 20명 (동시 접속 ~3명) |
| 배포 환경 | Netlify (외부 접근 가능) |
| 저장 방식 | LocalStorage (텍스트) + IndexedDB (이미지) |
| 백엔드 | 없음 — Netlify Functions만 사용 (AI API 프록시) |

### 핵심 결과물

1. **수영 레인 다이어그램** — 부서별 업무 흐름 시각화
2. **일렬 흐름도 (a→b→c)** — 단계 순서 한눈에 파악
3. **Word 매뉴얼 자동 생성** — 그룹 단위, 단계별 상세 + 이미지 포함

---

## 🛠 기술 스택

| 분류 | 기술 | 용도 |
|------|------|------|
| 프레임워크 | React 18 (Hooks) | SPA 구현 |
| 빌드 도구 | Vite 5 | 빌드 및 개발 서버 |
| 스타일링 | Inline CSS (CSS-in-JS) | 외부 라이브러리 없음 |
| 다이어그램 | SVG + CSS Grid 직접 구현 | LinearFlow / SwimLane |
| 텍스트 저장 | LocalStorage | Department[] JSON 저장 |
| 이미지 저장 | IndexedDB (idb 라이브러리) | Blob 저장, 수백MB 가능 |
| Word 생성 | docx 라이브러리 | 브라우저에서 직접 .docx 생성 |
| AI API | Anthropic Claude API | 프로세스 자동 구조화 |
| API 프록시 | Netlify Functions | API 키 서버사이드 보관 |
| 배포 | Netlify | React 빌드 + Functions 통합 |

### 패키지

```bash
# 프로덕션
npm install react react-dom docx file-saver idb

# 개발
npm install -D vite @vitejs/plugin-react netlify-cli

# Netlify Functions (서버사이드)
npm install @anthropic-ai/sdk
```

---

## 🏗 아키텍처

```
┌─────────────────────────────────────────────┐
│              브라우저 (React SPA)              │
│                                             │
│  ┌─────────────────┐  ┌──────────────────┐  │
│  │  LocalStorage   │  │    IndexedDB     │  │
│  │  텍스트 데이터    │  │  이미지 Blob 데이터 │  │
│  │  (processflow_v1│  │ (processflow_    │  │
│  │   ~3MB 이내)    │  │  images, 수백MB) │  │
│  └─────────────────┘  └──────────────────┘  │
└──────────────────┬──────────────────────────┘
                   │ AI 기능 사용 시만
                   ▼
     ┌─────────────────────────┐
     │    Netlify Functions    │  ← API 키 여기서만 보관
     │    /.netlify/functions  │     (ANTHROPIC_API_KEY)
     │        /claude          │
     └─────────────┬───────────┘
                   │
                   ▼
     ┌─────────────────────────┐
     │  Anthropic Claude API   │
     │  (claude-sonnet-4-...)  │
     └─────────────────────────┘
```

### 데이터 계층 구조

```
Department (부서)
  └─ Group (그룹)
       └─ Process (프로세스)
            └─ Step (단계)
                 └─ Image (이미지 참조 — id만 저장, 실데이터는 IndexedDB)
```

---

## ✨ 주요 기능

### 화면 구조 (3단계 뷰)

| 뷰 | 진입 조건 | 주요 기능 |
|----|----------|-----------|
| **LV1** 부서 목록 | 부서 선택 | 그룹 카드 목록, 그룹 추가/삭제 |
| **LV2** 프로세스 그룹 | 그룹 선택 | 프로세스 카드, SwimLane, Word 내보내기 |
| **LV3** 프로세스 상세 | 프로세스 선택 | LinearFlow, 단계별 상세, 단계 추가/수정/삭제 |

### 기능 목록

| 구분 | 기능 | 상태 |
|------|------|------|
| **v1 필수** | 부서/그룹/프로세스 CRUD | 🔲 |
| | 단계 추가/수정/삭제 | 🔲 |
| | 이미지 첨부 (IndexedDB 저장) | 🔲 |
| | LinearFlow 다이어그램 | 🔲 |
| | SwimLane 다이어그램 | 🔲 |
| | 사이드바 네비게이션 | 🔲 |
| | LocalStorage 자동 저장 | 🔲 |
| | 그룹 단위 Word 내보내기 | 🔲 |
| | 삭제 확인 팝업 | 🔲 |
| **AI 기능** | AI 프로세스 자동 구조화 | 🔲 |
| | 직접 입력 방식 | 🔲 |
| **v1.5 권장** | 단계 순서 드래그 변경 | 🔲 |
| | JSON 백업/복원 | 🔲 |
| | 이미지 자동 리사이즈 | 🔲 |
| **v2 추후** | Azure Cosmos DB + Blob Storage 연동 | 🔲 |
| | Azure AD 사용자 인증 | 🔲 |
| | 분기/반려 경로 SVG 표현 | 🔲 |
| | 프로세스/그룹 정보 수정 | 🔲 |

---

## 📁 프로젝트 구조

```
processflow/
├── src/
│   ├── App.jsx              # 메인 앱, 전역 상태 관리
│   ├── constants.js         # 색상 토큰(C), SAMPLE_DATA, CLAUDE_MODEL
│   ├── storage.js           # LocalStorage read/write
│   ├── imageDB.js           # IndexedDB 이미지 CRUD
│   ├── wordExport.js        # Word(.docx) 생성 로직
│   └── components/
│       ├── layout/
│       │   ├── TopNav.jsx
│       │   └── Sidebar.jsx
│       ├── views/
│       │   ├── LV1View.jsx
│       │   ├── LV2View.jsx
│       │   └── LV3View.jsx
│       ├── diagrams/
│       │   ├── LinearFlow.jsx
│       │   └── SwimLane.jsx
│       ├── cards/
│       │   ├── GroupCard.jsx
│       │   ├── ProcessCard.jsx
│       │   └── StepCard.jsx
│       └── modals/
│           ├── AddModal.jsx
│           ├── AddMethodModal.jsx
│           ├── AIGenerateModal.jsx
│           ├── StepModal.jsx
│           ├── DeleteConfirmModal.jsx
│           └── ExportModal.jsx
├── netlify/
│   └── functions/
│       └── claude.js        # Claude API 프록시 (API 키 서버사이드)
├── Phase/
│   ├── Phase0_환경설정.md           # 🔲 미시작
│   ├── Phase1_저장소레이어.md        # 🔲 미시작
│   ├── Phase2_스킬생성_앱골격.md     # 🔲 미시작
│   ├── Phase3_CRUD_삭제핸들러.md     # 🔲 미시작
│   ├── Phase4_다이어그램.md          # 🔲 미시작
│   ├── Phase5_Word내보내기.md        # 🔲 미시작
│   ├── Phase6_AI자동구조화.md        # 🔲 미시작
│   └── Phase7_통합테스트_배포.md     # 🔲 미시작
├── Pre-Requirement/
│   └── ProcessFlow_개발명세서.txt    # v1.3
├── netlify.toml             # Netlify 빌드 설정
├── .env.local               # 로컬 개발용 환경변수 (gitignore)
└── README.md
```

---

## 🚀 개발 Phase 계획

| Phase | 내용 | 상태 |
|-------|------|------|
| **Phase 0** | 프로젝트 환경 설정 (Vite, 패키지, constants.js) | 🔲 미시작 |
| **Phase 1** | 저장소 레이어 (storage.js, imageDB.js, App 상태) | 🔲 미시작 |
| **Phase 2** | 스킬 생성 + 앱 골격 + 네비게이션 | 🔲 미시작 |
| **Phase 3** | CRUD + 삭제 핸들러 (IndexedDB 정합성 포함) | 🔲 미시작 |
| **Phase 4** | 다이어그램 (LinearFlow + SwimLane) | 🔲 미시작 |
| **Phase 5** | Word 내보내기 (docx 생성 + 이미지 삽입) | 🔲 미시작 |
| **Phase 6** | AI 자동 구조화 (Netlify Functions + 위저드) | 🔲 미시작 |
| **Phase 7** | 통합 테스트 + Netlify 배포 | 🔲 미시작 |

> 상세 내용은 [`Phase/`](./Phase/) 디렉토리 참고

---

## ⚙️ 로컬 개발 환경 설정

```bash
# 1. 저장소 클론
git clone <repo-url>
cd processflow

# 2. 패키지 설치
npm install

# 3. 환경변수 설정
cp .env.example .env.local
# .env.local에 ANTHROPIC_API_KEY 입력

# 4. 개발 서버 실행 (React + Netlify Functions 동시)
netlify dev
# → http://localhost:8888
```

> ⚠️ `npm start` 또는 `npm run dev` 로는 AI 기능 동작 안 함
> AI 기능 포함 테스트는 반드시 `netlify dev` 사용

---

## 🔒 보안 주의사항

- `ANTHROPIC_API_KEY`는 **Netlify 대시보드 환경변수**에만 설정
- `.env.local`은 로컬 전용 — `.gitignore`에 포함됨
- 클라이언트 코드에 API 키 직접 작성 절대 금지
- 모든 Claude API 호출은 `/.netlify/functions/claude` 경유

---

## 🗄 v2 추후 계획 (Azure 연동)

| 현재 (v1) | v2 목표 |
|-----------|---------|
| LocalStorage | Azure Cosmos DB (NoSQL) |
| IndexedDB | Azure Blob Storage |
| 인증 없음 | Azure AD (Bosch 사내 계정) |

> 마이그레이션 전략: `saveToStorage()` / `saveImage()` 함수 시그니처 유지,
> 내부 구현만 Azure SDK로 교체

---

## 📝 변경 이력

| 날짜 | 버전 | 내용 |
|------|------|------|
| 2026.03 | v1.3 | 아키텍처 확정 (Netlify Functions, IndexedDB 분리, CLAUDE_MODEL 상수화) |
| 2026.03 | v1.2 | 최초 명세서 작성 |
