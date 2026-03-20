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

**사용 패키지**
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**핵심 구조** (LV3View.jsx)
```
DndContext (드래그 영역)
  └─ SortableContext (정렬 가능 목록)
       └─ SortableStepCard × N (각 카드에 useSortable 훅)
  └─ DragOverlay (드래그 중 미리보기)
```

**드롭 시 로직** (handleDragEnd)
1. `arrayMove(sortedSteps, oldIndex, newIndex)` — 배열 재배치
2. 새 순서대로 `colIndex: i + 1` (1-based) 재부여
3. `onReorderSteps(nextSteps)` → App.jsx로 전달

**App.jsx 동기화** (handleReorderSteps)
```
updateProc(...)  → localStorage 저장
setSelProc(...)  → LV3View 재렌더 (LinearFlow + StepCard)
setSelGroup(...) → LV2View 재렌더 (SwimLane)
```

### 2. colIndex 1-based 전환

| 변경 전 | 변경 후 |
|---------|---------|
| 드래그 후 colIndex: 0, 1, 2 | 드래그 후 colIndex: 1, 2, 3 |
| StepModal Step 필드 min=0 | min=0 유지 (기존 데이터 호환) |

사용자가 인식하는 번호(Step 1=첫째)와 저장값이 일치하도록 변경.

### 3. 그룹 추가 부서 검증

**AddModal.jsx** — `deptNames` prop 추가
```js
if (level === 'group' && !deptNames.includes(form.dept.trim())) {
  alert(`"${form.dept}" 부서는 존재하지 않습니다.\n등록된 부서: ${deptNames.join(', ')}`)
}
```

**App.jsx** — 기존 부서 목록 전달
```jsx
<AddModal deptNames={data.map(d => d.name)} />
```

### 4. 병렬 스텝 동일 번호 표시

**LV3View.jsx** — colIndex 기반 번호 맵
```js
const getEffectiveCol = (s) => s.colIndex ?? (s._origIdx + 1) * 1000
const uniqueCols = [...new Set(sortedSteps.map(getEffectiveCol))].sort(...)
// 같은 colIndex → 같은 번호, 미설정은 각각 고유 번호
```

**SwimLane.jsx** — colIndex 그룹 기반 번호
```js
colIndices.forEach((col, i) => {
  stepsWithCol.filter(s => s.colIndex === col).forEach(s => {
    stepNumberMap[s.id] = i + 1
  })
})
```

---

## 수정 파일 목록

| 파일 | 변경 내용 |
|------|-----------|
| `src/components/views/LV3View.jsx` | DndContext/SortableContext 감싸기, SortableStepCard 래퍼, handleDragEnd, colNumberMap |
| `src/components/cards/StepCard.jsx` | `dragHandleProps` prop + ⠿ 드래그 손잡이 아이콘 |
| `src/App.jsx` | handleReorderSteps 핸들러, AddModal에 deptNames prop 전달 |
| `src/components/modals/AddModal.jsx` | `deptNames` prop + 부서 존재 검증 |
| `src/components/diagrams/SwimLane.jsx` | stepsKey에 colIndex 포함, stepNumberMap 병렬 번호 통일 |
| `src/components/modals/ModalBase.jsx` | **신규** — 모달 공통 래퍼 (오버레이, 모달 박스, Escape 닫기, 접근성) |
| `src/styles/modalStyles.js` | **신규** — 모달 공통 스타일 상수 (overlay, modal, label, input, btn) |
| `src/components/ErrorBoundary.jsx` | **신규** — 에러 시 흰 화면 방지, 새로고침 안내 |
| `src/components/modals/*.jsx` (8개) | ModalBase/modalStyles import로 스타일 중복 제거 |

---

## 설계 결정 사항

| 항목 | 결정 | 이유 |
|------|------|------|
| DnD 라이브러리 | @dnd-kit (HTML5 Native 대신) | 내장 애니메이션, 터치 지원, 접근성, 코드 간결성 |
| 드래그 후 colIndex | 전체 1-based 연속 재부여 | 병렬 스텝이 분리되면 자동 해제, 가장 예측 가능한 동작 |
| 병렬 재설정 | StepModal에서 수동 입력 | 병렬 배치는 의미적 결정이므로 명시적으로 |
| 드래그 핸들 | ⠿ 아이콘에만 적용 | 카드 내 버튼(수정/삭제/펼치기)과 충돌 방지 |
| PointerSensor distance | 5px | 클릭과 드래그를 명확히 구분 |
| 모달 공통화 | ModalBase.jsx + modalStyles.js 추출 | 8개 모달 스타일 48곳 중복 제거, 디자인 변경 시 1곳만 수정 |
| ErrorBoundary | class component 사용 | getDerivedStateFromError는 class만 지원 (React 제약) |
| Blob URL 추적 | useRef(Set) 사용 | useEffect 빈 의존성의 closure 문제 해결, 언마운트 시 확실한 cleanup |
| 접근성 | ModalBase에 내장 | role="dialog", aria-modal, Escape 닫기를 한번 구현으로 8개 모달에 자동 적용 |

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-03-20 | Phase 9 최초 작성 |
| 2026-03-20 | @dnd-kit 설치 + LV3View 드래그 앤 드롭 구현 |
| 2026-03-20 | colIndex 1-based 전환, 그룹 부서 검증, 병렬 번호 통일 |
| 2026-03-20 | 수동 테스트 TC-001~010 전체 Pass, Phase 9 완료 |
| 2026-03-20 | 코드 품질 개선 — ModalBase.jsx + modalStyles.js 추출 (모달 8개 스타일 중복 제거) |
| 2026-03-20 | ErrorBoundary 추가 (에러 시 흰 화면 방지) |
| 2026-03-20 | 접근성 개선 (role="dialog", aria-modal, Escape 닫기) |
| 2026-03-20 | Blob URL 메모리 누수 수정 (StepModal, StepCard — useRef 추적) |
