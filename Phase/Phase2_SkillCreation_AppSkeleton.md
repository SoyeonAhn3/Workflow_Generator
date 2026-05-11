# Phase 2 — Skill Creation + App Skeleton + Navigation `✅ Completed`

> Create 4 Claude skills for development productivity first, then build the app frame with LV1/2/3 view switching

**Completed**: 2026-03-13
**Status**: ✅ Completed
**Prerequisites**: Phase 1 completed

---

## Overview

**This Phase splits into 2-A (Skill Creation) and 2-B (App Skeleton); 2-A must be completed first.**
The 4 skills are reused repeatedly from Phase 3 onward for component generation, delete handler creation, Word block generation, and spec review.
The app skeleton consists of TopNav, Sidebar, empty LV1/2/3 views, and view switching logic.

---

## Deliverables

### Phase 2-A — Skill Creation (before coding)

| # | Skill | Status | Usage Timing |
|---|-------|--------|--------------|
| 1 | `/gen-component` | ✅ | Phase 2-B ~ 6 |
| 2 | `/gen-delete-handler` | ✅ | Phase 3 delete handlers |
| 3 | `/gen-word-block` | ✅ | Phase 5 Word export |
| 4 | `/spec-review` | ✅ | Post-Phase review |

### Phase 2-B — App Skeleton

| # | Task | Status |
|---|------|--------|
| 5 | `TopNav.jsx` | ✅ |
| 6 | `Sidebar.jsx` | ✅ |
| 7 | `LV1View.jsx` empty shell | ✅ |
| 8 | `LV2View.jsx` empty shell | ✅ |
| 9 | `LV3View.jsx` empty shell | ✅ |
| 10 | `App.jsx` view switching logic | ✅ |

---

## Implementation Details

### Skill 1 — `/gen-component`

Generates a component draft following project conventions when given a component name + purpose.
Generated code always includes: `import { C } from '../constants'`, inline CSS, props type annotations, default return JSX.

### Skill 2 — `/gen-delete-handler`

Generates a delete handler with complete IndexedDB integrity when given a target level (dept/group/process/step).
Generated code always includes: `flatMap` to collect child image IDs, `deleteImages()` call, `updateData()` call, selection state reset.

### Skill 3 — `/gen-word-block`

Generates docx library code with Korean font + color rules when given a Word block type.
Generated code always includes: `font: { name: "맑은 고딕", eastAsia: "맑은 고딕" }`, Section 9.3 color rules.

### Skill 4 — `/spec-review`

Reviews component/function code against the spec and suggests fixes.
Checks: hardcoded hex colors, button placement rule violations, field label errors, missing IndexedDB deletion, Base64 image storage detection.

### TopNav.jsx

```
Background: C.navy, Height: 52px fixed
Right side: LocalStorage save status badge
  - Normal: "💾 Saved · NKB" (green)
  - Failed: "⚠️ Save failed" (red)
```

### Sidebar.jsx

```
Width: sidebarOpen ? 250 : 48 (transition: width 0.25s ease)
DeptRow: color icon + dept name + ▲▼ (navigate to LV1)
GroupRow: indent 46px + group name + ▲▼ (navigate to LV2)
ProcRow: indent 62px + ● + process name (navigate to LV3)
Active item: left 3px blue bar + C.bluePale background
Bottom: stats widget + add department button (dashed border)
Note: group/process add buttons are NOT in the sidebar
```

### View Switching Logic

```jsx
const view = selProc ? "lv3" : selGroup ? "lv2" : "lv1"

{view === "lv1" && <LV1View ... />}
{view === "lv2" && <LV2View ... />}
{view === "lv3" && <LV3View ... />}
```

---

## Design Decisions

| Item | Decision | Reason |
|------|----------|--------|
| Skill creation timing | Phase 2-A (before coding) | Reused in Phase 3~5; can't apply to already-written code if created later |
| URL routing | Not used (state-only view) | URL unnecessary for backend-less SPA + LocalStorage architecture |
| Sidebar add buttons | Department only in sidebar | Per spec Section 15-2 |

---

## Acceptance Criteria

- All 4 skills generate correct code drafts when invoked
- SAMPLE_DATA renders dept/group/process list in sidebar
- Sidebar click navigates LV1 → LV2 → LV3
- Sidebar collapse/expand transition animation works

---

## Development Notes

- Risk of missing color tokens when writing components without `/gen-component` skill
- No numeric codes (1-1, 1-1-1) in navigator (per spec Section 15-1)
- Active state: Dept uses blue bar, Group/Proc uses navy bar (different colors)

---

## Change Log

| Date | Description |
|------|-------------|
| 2026-03-12 | Initial creation |
| 2026-03-13 | Phase 2 completed — 4 skills created, TopNav/Sidebar/LV1·2·3View implemented |

---
---

# Phase 2 — 스킬 생성 + 앱 골격 + 네비게이션 `✅ 완료`

> 개발 생산성을 위한 Claude 스킬 4개를 먼저 만들고, 클릭으로 LV1/2/3 전환되는 앱 프레임을 완성한다

**완료일**: 2026-03-13
**상태**: ✅ 완료
**선행 조건**: Phase 1 완료

---

## 개요

**이 Phase는 2-A(스킬 생성)와 2-B(앱 골격)로 나뉘며, 반드시 2-A를 먼저 완료해야 한다.**
스킬 4개는 Phase 3 이후 컴포넌트 작성, 삭제 핸들러 구현, Word 블록 생성 시 반복 활용된다.
앱 골격은 TopNav, Sidebar, LV1/2/3 빈 껍데기 뷰, 뷰 전환 로직으로 구성된다.

---

## 완료 예정 / 완료 항목

### Phase 2-A — 스킬 생성 (코딩 시작 전 필수)

| # | 스킬 | 상태 | 활용 시점 |
|---|------|------|-----------|
| 1 | `/gen-component` | ✅ | Phase 2-B ~ 6 전체 |
| 2 | `/gen-delete-handler` | ✅ | Phase 3 삭제 핸들러 |
| 3 | `/gen-word-block` | ✅ | Phase 5 Word 생성 |
| 4 | `/spec-review` | ✅ | 각 Phase 완료 후 점검 |

### Phase 2-B — 앱 골격

| # | 작업 | 상태 |
|---|------|------|
| 5 | `TopNav.jsx` 작성 | ✅ |
| 6 | `Sidebar.jsx` 작성 | ✅ |
| 7 | `LV1View.jsx` 빈 껍데기 | ✅ |
| 8 | `LV2View.jsx` 빈 껍데기 | ✅ |
| 9 | `LV3View.jsx` 빈 껍데기 | ✅ |
| 10 | `App.jsx` 뷰 전환 로직 연결 | ✅ |

---

## 세부 구현 내용

### 스킬 1 — `/gen-component`

컴포넌트명 + 용도 입력 시, 프로젝트 컨벤션을 준수하는 컴포넌트 초안 생성.
생성 코드에 반드시 포함: `import { C } from '../constants'`, Inline CSS, props 타입 주석, 기본 return JSX.

### 스킬 2 — `/gen-delete-handler`

삭제 대상 레벨(dept/group/process/step) 입력 시, IndexedDB 정합성이 완전히 구현된 삭제 핸들러 생성.
생성 코드에 반드시 포함: `flatMap`으로 하위 이미지 id 수집, `deleteImages()` 호출, `updateData()` 호출, 선택 상태 초기화.

### 스킬 3 — `/gen-word-block`

Word 블록 종류 입력 시, docx 라이브러리 문법 + 한글 폰트 + 색상 규칙이 적용된 블록 코드 생성.
생성 코드에 반드시 포함: `font: { name: "맑은 고딕", eastAsia: "맑은 고딕" }`, Section 9.3 색상 규칙.

### 스킬 4 — `/spec-review`

작성된 컴포넌트/함수 코드 입력 시, 명세서 위반 항목 점검 및 수정 제안.
점검 항목: 색상 토큰 C 미사용, 버튼 위치 규칙 위반, 필드 레이블명 오류, IndexedDB 삭제 누락, 이미지 Base64 직접 저장 감지.

### TopNav.jsx

```
배경: C.navy, 높이: 52px 고정
우측: LocalStorage 저장 상태 뱃지
  - 정상: "💾 저장됨 · NKB" (녹색)
  - 실패: "⚠️ 저장 실패" (빨간색)
```

### Sidebar.jsx

```
너비: sidebarOpen ? 250 : 48 (transition: width 0.25s ease)
DeptRow: 색상 아이콘 + 부서명 + ▲▼ (LV1 이동)
GroupRow: 들여쓰기 46px + 그룹명 + ▲▼ (LV2 이동)
ProcRow: 들여쓰기 62px + ● + 프로세스명 (LV3 이동)
활성 항목: 좌측 3px 파란 바 + C.bluePale 배경
하단: 통계 위젯 + 부서 추가 버튼 (dashed border)
주의: 그룹/프로세스 추가 버튼은 사이드바에 없음
```

### 뷰 전환 로직

```jsx
const view = selProc ? "lv3" : selGroup ? "lv2" : "lv1"

{view === "lv1" && <LV1View ... />}
{view === "lv2" && <LV2View ... />}
{view === "lv3" && <LV3View ... />}
```

---

## 설계 결정 사항

| 항목 | 결정 | 이유 |
|------|------|------|
| 스킬 생성 시점 | Phase 2-A (코딩 전) | Phase 3~5에서 반복 사용. 나중에 만들면 이미 작성된 코드에 적용 불가 |
| URL 라우팅 | 미사용 (state로만 뷰 결정) | 백엔드 없는 SPA + LocalStorage 구조에서 URL 불필요 |
| 사이드바 추가 버튼 | 부서만 사이드바에 위치 | 명세서 Section 15-2 규칙 |

---

## 완료 기준

- 스킬 4개 호출 시 올바른 코드 초안 생성 확인
- SAMPLE_DATA 기준 사이드바에 부서/그룹/프로세스 목록 렌더링
- 사이드바 클릭으로 LV1 → LV2 → LV3 전환 동작 확인
- 사이드바 접기/펼치기 transition 애니메이션 동작

---

## 개발 시 주의사항

- `/gen-component` 스킬 없이 컴포넌트 직접 작성 시 색상 토큰 누락 위험
- Navigator에서 1-1, 1-1-1 같은 숫자 코드 표시 금지 (명세서 Section 15-1)
- 활성 상태 표시: Dept는 파란 바, Group/Proc은 navy 바 (색 다름)

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-03-12 | 최초 작성 |
| 2026-03-13 | Phase 2 완료 — 스킬 4개, TopNav/Sidebar/LV1·2·3View 구현 |
