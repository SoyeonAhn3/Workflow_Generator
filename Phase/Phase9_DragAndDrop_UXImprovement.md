# Phase 9 — Drag & Drop + UX Improvement `✅ Completed`

> @dnd-kit step reordering via drag & drop + colIndex 1-based conversion + group dept validation + parallel step numbering

**Completed**: 2026-03-20
**Status**: ✅ Completed
**Prerequisites**: Phase 8 completed

---

## Overview

Phase 8 introduced colIndex-based parallel branch diagrams, but manually changing Step values in StepModal was not intuitive. Phase 9 switches to **drag & drop step reordering** and improves related UX.

---

## Deliverables

| # | Task | Status |
|---|------|--------|
| 1 | @dnd-kit package install (core, sortable, utilities) | ✅ |
| 2 | LV3View drag & drop (DndContext, SortableContext, useSortable) | ✅ |
| 3 | StepCard drag handle (⠿) | ✅ |
| 4 | App.jsx handleReorderSteps handler (3-state sync) | ✅ |
| 5 | SwimLane stepsKey includes colIndex (arrow recalculation) | ✅ |
| 6 | colIndex 1-based conversion (Step 1 = first) | ✅ |
| 7 | Group add — non-existent dept validation | ✅ |
| 8 | Same-colIndex parallel steps show same number (LV3 + SwimLane) | ✅ |
| 9 | Manual testing (TC-001~010 all Pass) | ✅ |
| 10 | Modal common component extraction (ModalBase.jsx + modalStyles.js) | ✅ |
| 11 | ErrorBoundary (prevents white screen on errors) | ✅ |
| 12 | Accessibility (role="dialog", Escape close, aria-modal) | ✅ |
| 13 | Blob URL memory leak fix (useRef tracking) | ✅ |

---

## Implementation Details

### 1. @dnd-kit Drag & Drop

**Packages:** `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`

**Core structure (LV3View.jsx):**
```
DndContext (drag area)
  └─ SortableContext (sortable list)
       └─ SortableStepCard × N (each card with useSortable hook)
  └─ DragOverlay (drag preview)
```

**Drop logic (handleDragEnd):**
1. `arrayMove(sortedSteps, oldIndex, newIndex)` — rearrange array
2. Reassign `colIndex: i + 1` (1-based) in new order
3. `onReorderSteps(nextSteps)` → passed to App.jsx

**App.jsx sync (handleReorderSteps):**
```
updateProc(...)  → localStorage save
setSelProc(...)  → LV3View re-render (LinearFlow + StepCard)
setSelGroup(...) → LV2View re-render (SwimLane)
```

### 2. colIndex 1-based Conversion

| Before | After |
|--------|-------|
| After drag: colIndex 0, 1, 2 | After drag: colIndex 1, 2, 3 |

User-perceived numbers (Step 1 = first) now match stored values.

### 3. Group Add Dept Validation

```js
// AddModal.jsx — deptNames prop
if (level === 'group' && !deptNames.includes(form.dept.trim())) {
  alert(`"${form.dept}" department does not exist.\nRegistered: ${deptNames.join(', ')}`)
}
```

### 4. Parallel Step Same Number Display

**LV3View.jsx** — colIndex-based number map: same colIndex → same number, unset → unique number each.

**SwimLane.jsx** — colIndex group-based numbering.

---

## Modified Files

| File | Changes |
|------|---------|
| `src/components/views/LV3View.jsx` | DndContext/SortableContext wrapper, SortableStepCard, handleDragEnd, colNumberMap |
| `src/components/cards/StepCard.jsx` | `dragHandleProps` prop + ⠿ drag handle icon |
| `src/App.jsx` | handleReorderSteps handler, AddModal deptNames prop |
| `src/components/modals/AddModal.jsx` | `deptNames` prop + dept existence validation |
| `src/components/diagrams/SwimLane.jsx` | stepsKey includes colIndex, stepNumberMap parallel numbering |
| `src/components/modals/ModalBase.jsx` | **New** — modal common wrapper (overlay, box, Escape close, accessibility) |
| `src/styles/modalStyles.js` | **New** — modal common style constants |
| `src/components/ErrorBoundary.jsx` | **New** — white screen prevention, refresh guidance |
| `src/components/modals/*.jsx` (8 files) | ModalBase/modalStyles import, style dedup |

---

## Design Decisions

| Item | Decision | Reason |
|------|----------|--------|
| DnD library | @dnd-kit (not HTML5 Native) | Built-in animations, touch support, accessibility, concise code |
| Post-drag colIndex | Reassign 1-based sequential | Parallel steps auto-separate on drag; most predictable behavior |
| Parallel reset | Manual input in StepModal | Parallel placement is a semantic decision, should be explicit |
| Drag handle | ⠿ icon only | Prevents conflict with card buttons (edit/delete/expand) |
| PointerSensor distance | 5px | Clear distinction between click and drag |
| Modal commonization | ModalBase.jsx + modalStyles.js | Eliminates 48 duplicate styles across 8 modals; design changes → 1 file |
| ErrorBoundary | Class component | getDerivedStateFromError is class-only (React limitation) |
| Blob URL tracking | useRef(Set) | Solves useEffect empty-deps closure issue, reliable unmount cleanup |
| Accessibility | Built into ModalBase | role="dialog", aria-modal, Escape close implemented once → auto-applied to 8 modals |

---

## Acceptance Criteria

- Drag ⠿ handle → step order changes → saved to localStorage
- Same colIndex steps show same step number
- Group add with non-existent dept shows error
- All 8 modals render consistently via ModalBase
- ErrorBoundary catches errors without white screen

---

## Change Log

| Date | Description |
|------|-------------|
| 2026-03-20 | Phase 9 initial creation |
| 2026-03-20 | @dnd-kit installed + LV3View drag & drop implemented |
| 2026-03-20 | colIndex 1-based, dept validation, parallel numbering |
| 2026-03-20 | Manual testing TC-001~010 all Pass, Phase 9 completed |
| 2026-03-20 | Code quality — ModalBase.jsx + modalStyles.js extraction (8 modal style dedup) |
| 2026-03-20 | ErrorBoundary added |
| 2026-03-20 | Accessibility (role="dialog", aria-modal, Escape close) |
| 2026-03-20 | Blob URL memory leak fix (StepModal, StepCard — useRef tracking) |

---
---

# Phase 9 — 드래그 앤 드롭 + UX 개선 `✅ 완료`

> @dnd-kit 기반 단계 순서 드래그 변경 + colIndex 1-based 전환 + 그룹 부서 검증 + 병렬 스텝 번호 통일

**완료일**: 2026-03-20
**상태**: ✅ 완료
**선행 조건**: Phase 8 완료

---

## 개요

Phase 8에서 colIndex 기반 병렬 분기·합류 다이어그램을 구현했으나, StepModal에서 수동으로 Step 값을 변경하는 UX가 직관적이지 않았다. Phase 9에서는 **드래그 앤 드롭으로 단계 순서를 변경**하는 방식으로 전환하고, 관련 UX를 개선했다.

---

## 완료 항목

| # | 작업 | 상태 |
|---|------|------|
| 1 | @dnd-kit 패키지 설치 (core, sortable, utilities) | ✅ |
| 2 | LV3View 드래그 앤 드롭 구현 (DndContext, SortableContext, useSortable) | ✅ |
| 3 | StepCard 드래그 손잡이(⠿) 추가 | ✅ |
| 4 | App.jsx handleReorderSteps 핸들러 (3곳 동기화) | ✅ |
| 5 | SwimLane stepsKey에 colIndex 포함 (화살표 재계산 보장) | ✅ |
| 6 | colIndex 1-based 전환 (Step 1=첫째, 2=둘째) | ✅ |
| 7 | 그룹 추가 시 존재하지 않는 부서 검증 | ✅ |
| 8 | 동일 colIndex 병렬 스텝 같은 번호 표시 (LV3 + SwimLane) | ✅ |
| 9 | 수동 테스트 (TC-001~010 전체 Pass) | ✅ |
| 10 | 모달 공통 컴포넌트 추출 (ModalBase.jsx + modalStyles.js) | ✅ |
| 11 | ErrorBoundary 추가 (에러 시 흰 화면 방지) | ✅ |
| 12 | 접근성 개선 (role="dialog", Escape 닫기, aria-modal) | ✅ |
| 13 | Blob URL 메모리 누수 수정 (useRef 추적) | ✅ |

---

## 구현 상세

### 1. @dnd-kit 드래그 앤 드롭

**사용 패키지:** `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`

**핵심 구조 (LV3View.jsx):**
```
DndContext (드래그 영역)
  └─ SortableContext (정렬 가능 목록)
       └─ SortableStepCard × N (각 카드에 useSortable 훅)
  └─ DragOverlay (드래그 중 미리보기)
```

**드롭 시 로직 (handleDragEnd):**
1. `arrayMove(sortedSteps, oldIndex, newIndex)` — 배열 재배치
2. 새 순서대로 `colIndex: i + 1` (1-based) 재부여
3. `onReorderSteps(nextSteps)` → App.jsx로 전달

**App.jsx 동기화 (handleReorderSteps):**
```
updateProc(...)  → localStorage 저장
setSelProc(...)  → LV3View 재렌더 (LinearFlow + StepCard)
setSelGroup(...) → LV2View 재렌더 (SwimLane)
```

### 2. colIndex 1-based 전환

| 변경 전 | 변경 후 |
|---------|---------|
| 드래그 후 colIndex: 0, 1, 2 | 드래그 후 colIndex: 1, 2, 3 |

사용자가 인식하는 번호(Step 1=첫째)와 저장값이 일치하도록 변경.

### 3. 그룹 추가 부서 검증

```js
// AddModal.jsx — deptNames prop
if (level === 'group' && !deptNames.includes(form.dept.trim())) {
  alert(`"${form.dept}" 부서는 존재하지 않습니다.\n등록된 부서: ${deptNames.join(', ')}`)
}
```

### 4. 병렬 스텝 동일 번호 표시

**LV3View.jsx** — colIndex 기반 번호 맵: 같은 colIndex → 같은 번호, 미설정은 각각 고유 번호.

**SwimLane.jsx** — colIndex 그룹 기반 번호.

---

## 수정 파일 목록

| 파일 | 변경 내용 |
|------|-----------|
| `src/components/views/LV3View.jsx` | DndContext/SortableContext 감싸기, SortableStepCard, handleDragEnd, colNumberMap |
| `src/components/cards/StepCard.jsx` | `dragHandleProps` prop + ⠿ 드래그 손잡이 아이콘 |
| `src/App.jsx` | handleReorderSteps 핸들러, AddModal에 deptNames prop 전달 |
| `src/components/modals/AddModal.jsx` | `deptNames` prop + 부서 존재 검증 |
| `src/components/diagrams/SwimLane.jsx` | stepsKey에 colIndex 포함, stepNumberMap 병렬 번호 통일 |
| `src/components/modals/ModalBase.jsx` | **신규** — 모달 공통 래퍼 (오버레이, 모달 박스, Escape 닫기, 접근성) |
| `src/styles/modalStyles.js` | **신규** — 모달 공통 스타일 상수 |
| `src/components/ErrorBoundary.jsx` | **신규** — 에러 시 흰 화면 방지, 새로고침 안내 |
| `src/components/modals/*.jsx` (8개) | ModalBase/modalStyles import로 스타일 중복 제거 |

---

## 설계 결정 사항

| 항목 | 결정 | 이유 |
|------|------|------|
| DnD 라이브러리 | @dnd-kit (HTML5 Native 대신) | 내장 애니메이션, 터치 지원, 접근성, 코드 간결성 |
| 드래그 후 colIndex | 전체 1-based 연속 재부여 | 병렬 스텝이 분리되면 자동 해제, 예측 가능한 동작 |
| 병렬 재설정 | StepModal에서 수동 입력 | 병렬 배치는 의미적 결정이므로 명시적으로 |
| 드래그 핸들 | ⠿ 아이콘에만 적용 | 카드 내 버튼 충돌 방지 |
| PointerSensor distance | 5px | 클릭과 드래그 명확히 구분 |
| 모달 공통화 | ModalBase.jsx + modalStyles.js | 8개 모달 48곳 중복 제거, 디자인 변경 시 1곳만 수정 |
| ErrorBoundary | class component | getDerivedStateFromError는 class만 지원 |
| Blob URL 추적 | useRef(Set) | closure 문제 해결, 언마운트 시 확실한 cleanup |
| 접근성 | ModalBase에 내장 | 한번 구현으로 8개 모달에 자동 적용 |

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-03-20 | Phase 9 최초 작성 |
| 2026-03-20 | @dnd-kit 설치 + LV3View 드래그 앤 드롭 구현 |
| 2026-03-20 | colIndex 1-based, 부서 검증, 병렬 번호 통일 |
| 2026-03-20 | 수동 테스트 TC-001~010 전체 Pass, Phase 9 완료 |
| 2026-03-20 | 코드 품질 — ModalBase.jsx + modalStyles.js 추출 (모달 8개 스타일 중복 제거) |
| 2026-03-20 | ErrorBoundary 추가 |
| 2026-03-20 | 접근성 개선 (role="dialog", aria-modal, Escape 닫기) |
| 2026-03-20 | Blob URL 메모리 누수 수정 (StepModal, StepCard — useRef 추적) |
