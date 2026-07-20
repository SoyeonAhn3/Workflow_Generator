🌐 [한국어](./README_ko.md) | [English](./README.md)

# ProcessFlow

> 부서별 업무 프로세스를 단계별로 구조화하고 Word 문서로 내보내는 웹 기반 워크플로우 문서화 도구

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-processflow--generator.netlify.app-brightgreen?style=for-the-badge)](https://processflow-generator.netlify.app/)

https://github.com/user-attachments/assets/cef4d085-daaa-4fec-a5e3-e2a630244b45

## 개요

조직에서는 월 마감, 예산 검토, 원가 배부 등 반복적인 업무 프로세스를 Word 파일로 수동 관리합니다. ProcessFlow는 이 수작업을 대체합니다. 부서를 정의하고, 관련 프로세스를 그룹으로 묶고, 각 프로세스를 메타데이터(화면명, 담당 부서, 소요 시간, 로직, 주의사항, 스크린샷)가 포함된 단계로 분해한 뒤, 서식이 적용된 `.docx` 파일로 내보냅니다. 선택적으로 Claude API를 활용한 AI 기능으로 자유 텍스트 설명에서 단계 구조를 자동 생성할 수 있습니다.

## Manual

| 언어 | 링크 |
|---|---|
| 한국어 | [User Manual](./manuals/20260512_ProcessFlow_매뉴얼.md) |
| English | [User Manual](./manuals/20260512_ProcessFlow_Manual.md) |

## 목차

- [동작 흐름](#동작-흐름)
- [기술 스택](#기술-스택)
- [AI 구성 요소](#ai-구성-요소)
- [빠른 시작](#빠른-시작)
- [프로젝트 구조](#프로젝트-구조)
- [문서](#문서)
- [현재 상태](#현재-상태)
- [한계점](#한계점)

## 동작 흐름

```
부서 정의 → 프로세스 그룹 생성 → 프로세스 추가
        ↓
  단계 추가 (화면명, 담당부서, 소요시간, 로직, 주의사항, 이미지)
        ↓
  일렬 흐름도 또는 Swim Lane 다이어그램으로 확인
        ↓
  그룹 내보내기 → 서식 적용된 Word 문서 (.docx)
```

또는 수동 입력 대신:

```
업무 흐름을 자유 텍스트로 설명 → AI가 단계 구조 생성 → 검토 및 확인 → 단계 추가
```

## 기술 스택

| 기술 | 역할 | 선택 이유 |
|---|---|---|
| React 19 | UI 컴포넌트, 상태 관리 | Hooks 기반 SPA, 클래스 컴포넌트 없이 간결한 구현 |
| Vite 8 | 개발 서버, 빌드 도구 | Webpack 대비 즉각적인 HMR, 빠른 빌드 |
| localStorage | 텍스트 데이터 영속성 (프로세스 트리) | 설정 불필요, 서버 없이 오프라인 동작 |
| IndexedDB (idb) | 단계 스크린샷 이미지 Blob 저장 | localStorage가 처리할 수 없는 대용량 바이너리 데이터 지원 (~수백 MB) |
| docx + file-saver | 클라이언트 사이드 Word 문서 생성 | 서버 사이드 렌더러 없이 브라우저에서 .docx 직접 생성 |
| @dnd-kit | 드래그 앤 드롭 단계 순서 변경 | 경량, React 네이티브 DnD + 접근성 기본 지원 |
| Netlify | 호스팅, 서버리스 함수 | 무료 티어로 충분, Functions로 API 키 서버사이드 보관 |
| Claude API (Anthropic) | AI 기반 단계 자동 생성 | 자유 텍스트에서 구조화된 JSON 출력 생성 |

## AI 구성 요소

| 입력 | 출력 |
|---|---|
| 자유 텍스트 업무 흐름 설명 + 부서명 | 구조화된 단계 배열 (제목, 화면명, 부서, 시간, 로직, 주의사항) |

- **엔드포인트**: `/.netlify/functions/claude` — Anthropic Messages API에 대한 서버리스 프록시
- **모델**: `claude-sonnet-4-6` (`CLAUDE_MODEL` 환경변수로 변경 가능)
- **처리 방식**: 규칙 기반 JSON 파싱, 잘못된 응답 시 최대 3회 자동 재시도
- **결과 성격**: 제안 초안 — 사용자가 검토 및 확인 후 단계가 저장됨

## 빠른 시작

### 사전 요구사항

- Node.js 18+
- Anthropic API 키 (AI 자동 생성 기능 사용 시에만 필요)

### 설치 및 실행

```bash
cd processflow
npm install
```

**개발 모드 (AI 없이)**:
```bash
npm run dev
```

**개발 모드 (Netlify Dev로 AI 포함)**:
```bash
# 환경변수 설정
# processflow/ 디렉토리에 .env 파일 생성: ANTHROPIC_API_KEY=sk-ant-...

npx netlify dev
```

`http://localhost:5173` (Vite) 또는 `http://localhost:8888` (Netlify Dev)에서 앱이 실행됩니다.

### 빌드

```bash
npm run build
npm run preview
```

## 프로젝트 구조

```
processflow/
├── index.html                  # 진입 HTML
├── package.json                # 의존성 및 스크립트
├── vite.config.js              # Vite 설정
├── vitest.config.js            # Vitest 테스트 설정
├── netlify.toml                # Netlify 빌드 및 함수 설정
├── netlify/functions/
│   └── claude.js               # Claude API 서버리스 프록시
├── public/
│   ├── favicon.svg
│   └── icons.svg
└── src/
    ├── main.jsx                # React 진입점
    ├── App.jsx                 # 루트 컴포넌트, 상태, 네비게이션
    ├── constants.js            # 색상 토큰, 샘플 데이터, 모델 설정
    ├── storage.js              # localStorage 읽기/쓰기
    ├── imageDB.js              # IndexedDB 이미지 Blob CRUD
    ├── wordExport.js           # Word 문서 생성 (표지, 흐름도, 단계)
    ├── wordExport.helpers.js   # Word 빌더 헬퍼 유틸리티
    ├── backup.js               # 백업/복원 (JSON 내보내기·불러오기)
    ├── imageResize.js          # 이미지 리사이즈 (첨부 시 너비 축소)
    ├── *.test.js               # Vitest 스모크 테스트 (storage/backup/wordExport)
    ├── hooks/
    │   └── useIsMobile.js      # 모바일 브레이크포인트 훅
    ├── styles/
    │   └── modalStyles.js      # 공통 모달 스타일 객체
    └── components/
        ├── ErrorBoundary.jsx   # React 에러 바운더리
        ├── layout/
        │   ├── TopNav.jsx      # 상단 네비게이션 바
        │   └── Sidebar.jsx     # 접이식 사이드바 (모바일: 오버레이)
        ├── views/
        │   ├── LV1View.jsx     # 부서 개요 (카드 그리드)
        │   ├── LV2View.jsx     # 프로세스 그룹 목록
        │   └── LV3View.jsx     # 단계 상세 + 다이어그램
        ├── cards/
        │   └── StepCard.jsx    # 개별 단계 카드
        ├── diagrams/
        │   ├── LinearFlow.jsx  # 일렬 흐름도 (a → b → c)
        │   └── SwimLane.jsx    # Swim Lane 다이어그램 (부서별)
        └── modals/
            ├── ModalBase.jsx         # 공통 모달 래퍼
            ├── AddModal.jsx          # 부서/그룹/프로세스 추가
            ├── StepModal.jsx         # 단계 추가/수정
            ├── DeleteConfirmModal.jsx # 삭제 확인
            ├── ExportModal.jsx       # Word 내보내기 다이얼로그
            ├── AddMethodModal.jsx    # 수동/AI 추가 방식 선택
            ├── AIGenerateModal.jsx   # AI 생성 위자드
            ├── EditProcModal.jsx     # 프로세스 메타데이터 수정
            ├── EditGroupModal.jsx    # 그룹명 수정
            └── RestoreConfirmModal.jsx # 복원(덮어쓰기) 확인
```

## 문서

| 문서 | 설명 |
|---|---|
| `Phase/Phase0_ProjectSetup.md` | 프로젝트 환경 설정 (Vite, React, ESLint) |
| `Phase/Phase1_StorageLayer.md` | 저장소 레이어 (localStorage + IndexedDB) |
| `Phase/Phase2_SkillCreation_AppSkeleton.md` | 앱 골격, 네비게이션, 스킬 생성 |
| `Phase/Phase3_CRUD_DeleteHandlers.md` | CRUD 작업, 계단식 삭제 핸들러 |
| `Phase/Phase4_Diagrams.md` | 일렬 흐름도 및 Swim Lane 다이어그램 |
| `Phase/Phase5_WordExport.md` | Word (.docx) 내보내기 (표지 + 테이블) |
| `Phase/Phase6_AIAutoStructure.md` | Claude API를 통한 AI 자동 생성 |
| `Phase/Phase7_IntegrationTest_Deployment.md` | 통합 테스트 및 Netlify 배포 |
| `Phase/Phase8_ParallelBranchDiagram.md` | Swim Lane 다이어그램 병렬 분기/합류 |
| `Phase/Phase9_DragAndDrop_UXImprovement.md` | 드래그 앤 드롭 순서 변경, UX 개선 |
| `Phase/Phase10_CodeReview_Refactoring.md` | 코드 구조 점검 및 리팩토링 |
| `Phase/Phase11_BackupRestore.md` | JSON 백업/복원 + 업로드 시 이미지 리사이즈 |
| `Phase/Phase12_QualityStabilization.md` | Vitest 스모크 테스트 + Word 이미지 비율 유지 |

## 현재 상태

모든 개발 Phase(0~12)가 완료되었습니다.

| Phase | 상태 | 산출물 |
|---|---|---|
| 0 — 프로젝트 환경 설정 | ✅ 완료 | Vite + React + ESLint 프로젝트 스캐폴드 |
| 1 — 저장소 레이어 | ✅ 완료 | localStorage (텍스트) + IndexedDB (이미지) 영속성 |
| 2 — 앱 골격 및 네비게이션 | ✅ 완료 | TopNav, Sidebar, LV1/LV2/LV3 뷰 전환 |
| 3 — CRUD 및 삭제 핸들러 | ✅ 완료 | 전 계층 CRUD + 계단식 삭제 처리 |
| 4 — 다이어그램 | ✅ 완료 | LinearFlow + SwimLane 부서별 다이어그램 |
| 5 — Word 내보내기 | ✅ 완료 | 표지, 단계 테이블, 이미지 삽입 포함 .docx 생성 |
| 6 — AI 자동 생성 | ✅ 완료 | Claude API 프록시 + 3단계 위자드로 단계 구조 생성 |
| 7 — 통합 테스트 및 배포 | ✅ 완료 | 수동 테스트 시나리오 (T01–T08), Netlify 배포 |
| 8 — 병렬 분기 다이어그램 | ✅ 완료 | colIndex 기반 SwimLane 병렬 분기/합류 |
| 9 — 드래그 앤 드롭 및 UX | ✅ 완료 | @dnd-kit 단계 순서 변경, 부서 검증, 병렬 번호 |
| 10 — 코드 구조 점검 및 리팩토링 | ✅ 완료 | ID 기반 파생 상태, ModalBase 추출, wordExport 모듈 분리 |
| 11 — 백업 / 복원 + 이미지 리사이즈 | ✅ 완료 | 두 저장소 JSON 내보내기·불러오기(확인창 거쳐 덮어쓰기) + 첨부 이미지 너비 1600px 자동 축소 |
| 12 — 품질·안정화 | ✅ 완료 | Vitest 스모크 테스트(storage/backup/wordExport 9건 통과) + Word 이미지 비율 유지 |

## 한계점

- **백엔드 데이터베이스 없음** — 모든 데이터가 브라우저에 저장됩니다 (localStorage + IndexedDB). 브라우저 데이터를 삭제하면 모든 데이터가 사라지지만, 내장 **백업/복원**(JSON 내보내기·불러오기)으로 데이터를 저장하고 복구할 수 있습니다.
- **인증 없음** — 단일 사용자, 로컬 전용.
- **자동화된 테스트 없음** — 수동 테스트 시나리오를 통해 검증이 수행되었습니다.
- **AI 기능에 API 키 필요** — AI 자동 생성 기능을 사용하려면 `ANTHROPIC_API_KEY` 환경변수를 설정해야 합니다.
- **모바일 지원** — 반응형 레이아웃이 구현되어 있으나, 주 사용 대상은 데스크톱 브라우저입니다.

---

<p align="center">Made with AI-assisted development</p>
