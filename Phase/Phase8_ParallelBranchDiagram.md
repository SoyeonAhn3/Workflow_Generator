# Phase 8 — Parallel Branch Diagram `✅ Completed`

> Add Fork/Join flow to the SwimLane diagram for parallel task visualization

**Completed**: 2026-03-20
**Status**: ✅ Completed
**Prerequisites**: Phase 7 completed (deployed)

---

## Overview

The existing SwimLane only supports **linear (sequential) flow**. In practice, one team often requests work that **multiple teams process simultaneously**, then results flow back to the originating team.

**Target flow example:**
```
         ┌→ Step2a (FIN) ──┐
Step1 ───┤                   ├──→ Step3 (CO)
 (CO)    └→ Step2b (LOG) ──┘
```

Implementation order: **data model extension → layout engine change → SVG overlay arrows**.

---

## Deliverables

| # | Task | Status |
|---|------|--------|
| 1 | Dummy data addition (`constants.js`) | ✅ |
| 2 | `SwimLane.jsx` layout engine change (colIndex-based) | ✅ |
| 3 | SVG overlay arrow system (fork/join) | ✅ |
| 4 | Backward compatibility for existing linear data | ✅ |
| 5 | `StepModal.jsx` Step (colIndex) input field | ✅ |
| 6 | Automatic connection derivation (colIndex grouping) | ✅ |
| 7 | Manual browser testing | ✅ |
| 8 | Word export integration (optional) | ⏸ Deferred |

---

## Implementation Design

### 1. Data Model Extension

**Before:** steps array order = display order (fixed 1:1 sequential)

**After (final implementation):**
```js
// connections array unnecessary — colIndex alone auto-derives arrows
steps: [
  { id: 'pt_s1', dept: 'CO',  colIndex: 0 },   // Column 1
  { id: 'pt_s2', dept: 'FIN', colIndex: 1 },   // Column 2 (parallel)
  { id: 'pt_s3', dept: 'LOG', colIndex: 1 },   // Column 2 (parallel)
  { id: 'pt_s4', dept: 'CO',  colIndex: 2 },   // Column 3
]
```

| Field | Type | Role | When absent |
|-------|------|------|-------------|
| `colIndex` | number | Which column to place in. Same value = same column, stacked vertically | Auto-assigned to max colIndex + 1 |

### 2. Layout Engine Change

```js
// Grid columns = number of unique colIndex values (parallel steps share columns)
const colCount = Math.max(...steps.map(s => s.colIndex ?? idx)) + 1
gridTemplateColumns: `110px repeat(${colCount}, 180px)`
```

### 3. SVG Overlay Arrow System

Absolute-positioned SVG overlay on top of the grid. Each step node gets a `useRef` for pixel position measurement via `getBoundingClientRect`. Arrows connect from right-center of source to left-center of target.

| Type | Line Style | Color |
|------|-----------|-------|
| Same lane | Solid | Dept color (DEPT_COLORS) |
| Lane change (vertical) | Dashed | C.gray300 |
| Fork arrows | Solid | C.gray300 |

### 4. Backward Compatibility

Steps without `colIndex` are auto-assigned sequentially (0, 1, 2, ...) via a reduce pass, preserving existing process rendering.

### 5. Automatic Connection Derivation

```js
// Group by colIndex → connect all pairs between adjacent columns
// Result: s1→s2, s1→s3 (fork), s2→s4, s3→s4 (join)
```

### 6. StepModal Step Field

Input grid expanded from 3 to 4 columns: `[Screen Name] [Dept] [PT] [Step]`
- Empty = colIndex not stored → SwimLane auto-assigns to last column
- Same number = same column = parallel rendering

---

## Design Decisions

| Item | Decision | Reason |
|------|----------|--------|
| Arrow method | SVG overlay (position: absolute) | Inline SVG cannot cross lane boundaries vertically |
| Column count basis | Unique colIndex count | Parallel steps must share a column for "simultaneous work" visualization |
| connections field | **Removed** — auto-derived from colIndex grouping | Simplifies UX; users don't need to specify explicit connections |
| colIndex default | max + 1 (last column) | Array-index approach unnecessarily expands columns after parallel steps |
| Backward compat | Auto-sequential assignment when colIndex absent | No impact on Phase 1~7 existing processes |
| useLayoutEffect deps | `[stepsKey, connKey]` string keys | Empty deps cause infinite loop bug |
| External library | Not used (direct SVG) | Maintains existing spec, minimizes bundle |

---

## Acceptance Criteria

- Dummy data `p_parallel` process renders correctly in SwimLane
- Fork arrows from CO Step1 to FIN/LOG teams
- Join arrows from FIN/LOG to CO Step4
- Existing linear processes render identically without changes

---

## Development Notes

- SVG overlay uses `useLayoutEffect` for node position measurement (useEffect causes flicker)
- `getBoundingClientRect` is affected by scroll position — convert to container-relative coordinates
- Word export is not required in this Phase — handle separately after rendering verification

---

## Modified Files

| File | Changes |
|------|---------|
| `src/components/diagrams/SwimLane.jsx` | Layout engine rewrite (colIndex-based), SVG overlay arrows, infinite loop fix |
| `src/components/modals/StepModal.jsx` | Step (colIndex) input field, 4-column grid |
| `src/components/views/LV2View.jsx` | `connections` prop removed |
| `src/constants.js` | `connections` array removed from dummy data |

---

## Change Log

| Date | Description |
|------|-------------|
| 2026-03-19 | Phase 8 initial creation |
| 2026-03-19 | Dummy data added (constants.js — p_parallel process) |
| 2026-03-19 | SwimLane layout engine changed — colIndex-based column placement |
| 2026-03-19 | SVG overlay arrows — useLayoutEffect + getBoundingClientRect |
| 2026-03-19 | Infinite loop fix — [stepsKey, connKey] dependency array |
| 2026-03-19 | Design change — connections auto-derived from colIndex grouping only |
| 2026-03-19 | StepModal Step field added — direct colIndex input |
| 2026-03-20 | Manual testing — TC-001~010, bugs found → resolved in Phase 9 |
| 2026-03-20 | Phase 8 completed |

---
---

# Phase 8 — 병렬 분기·합류 다이어그램 `✅ 완료`

> SwimLane 다이어그램에 분기(Fork)·합류(Join) 흐름을 추가한다

**완료일**: 2026-03-20
**상태**: ✅ 완료
**선행 조건**: Phase 7 완료 (배포 완료)

---

## 개요

현재 SwimLane은 스텝이 순서대로 나열되는 **선형(linear) 흐름만** 지원한다.
실무에서는 한 팀이 요청한 업무를 **여러 팀이 동시에 처리**하고 결과를 다시 원 팀으로 전달하는 패턴이 빈번하다.

**목표 흐름 예시:**
```
         ┌→ Step2a (FIN팀) ─┐
Step1 ───┤                    ├──→ Step3 (CO팀)
 (CO팀)  └→ Step2b (LOG팀) ─┘
```

구현 순서: **데이터 모델 확장 → 레이아웃 엔진 변경 → SVG 오버레이 화살표**.

---

## 완료 예정 / 완료 항목

| # | 작업 | 상태 |
|---|------|------|
| 1 | 더미 데이터 추가 (`constants.js`) | ✅ |
| 2 | `SwimLane.jsx` 레이아웃 엔진 변경 (colIndex 기반) | ✅ |
| 3 | SVG 오버레이 화살표 시스템 구현 (분기·합류) | ✅ |
| 4 | 기존 선형 데이터 하위 호환 처리 | ✅ |
| 5 | `StepModal.jsx`에 Step(colIndex) 입력 필드 추가 | ✅ |
| 6 | connections 자동 파생 (colIndex 그룹핑 기반) | ✅ |
| 7 | 수동 테스트 (브라우저) | ✅ |
| 8 | Word 내보내기 반영 (선택) | ⏸ 보류 |

---

## 구현 설계

### 1. 데이터 모델 확장

**변경 전:** steps 배열 순서 = 화면 표시 순서 (1:1 순차 연결 고정)

**변경 후 (최종 구현):**
```js
// connections 배열 불필요 — colIndex만으로 화살표 자동 파생
steps: [
  { id: 'pt_s1', dept: 'CO팀',  colIndex: 0 },   // 1열
  { id: 'pt_s2', dept: 'FIN팀', colIndex: 1 },   // 2열 (병렬)
  { id: 'pt_s3', dept: 'LOG팀', colIndex: 1 },   // 2열 (병렬)
  { id: 'pt_s4', dept: 'CO팀',  colIndex: 2 },   // 3열
]
```

| 필드 | 타입 | 역할 | 없을 때 |
|------|------|------|---------|
| `colIndex` | number | 몇 번째 열에 배치할지. 같은 값이면 같은 열에 세로 배치 | 최대 colIndex + 1로 자동 배정 |

### 2. 레이아웃 엔진 변경

```js
// 그리드 열 수 = 고유 colIndex 개수 (병렬 스텝은 같은 열 공유)
const colCount = Math.max(...steps.map(s => s.colIndex ?? idx)) + 1
gridTemplateColumns: `110px repeat(${colCount}, 180px)`
```

### 3. SVG 오버레이 화살표 시스템

그리드 위에 절대 위치 SVG 오버레이. 각 스텝 노드에 `useRef` 부착 → `getBoundingClientRect`로 픽셀 위치 측정. 소스 우측 중앙 → 타겟 좌측 중앙 연결.

| 유형 | 선 스타일 | 색상 |
|------|-----------|------|
| 같은 레인 | 실선 | 부서 색(DEPT_COLORS) |
| 레인 전환 | 점선 | C.gray300 |
| 분기 화살표 | 실선 | C.gray300 |

### 4. 하위 호환 처리

`colIndex` 없는 기존 데이터는 reduce로 순차 자동 배정 (0, 1, 2, ...) → 기존 프로세스 렌더링 유지.

### 5. connections 자동 파생

```js
// colIndex로 그룹핑 → 인접 열 전체 조합 연결
// 결과: s1→s2, s1→s3 (분기), s2→s4, s3→s4 (합류)
```

### 6. StepModal Step 필드

입력 그리드 3칸 → 4칸 확장: `[화면명] [담당] [PT] [Step]`
- 비워두면: colIndex 미포함 저장 → SwimLane이 마지막 열 자동 배정
- 같은 숫자: 같은 열에 배치 → 병렬 표현

---

## 설계 결정 사항

| 항목 | 결정 | 이유 |
|------|------|------|
| 화살표 방식 | SVG 오버레이 (position: absolute) | 인라인 SVG로는 수직 레인 건너기 불가 |
| 열 수 기준 | colIndex 고유값 수 | 병렬 스텝이 같은 열 공유해야 "동시 업무" 표현 |
| connections 필드 | **제거** — colIndex 그룹핑으로 자동 파생 | UX 단순화 |
| colIndex 미입력 시 기본값 | max + 1 | 배열 인덱스 방식은 병렬 스텝 뒤 열이 불필요하게 증가 |
| 기존 데이터 호환 | colIndex 없으면 순차 자동 배정 | Phase 1~7 기존 프로세스 영향 없음 |
| useLayoutEffect 의존성 | `[stepsKey, connKey]` 문자열 키 | 빈 의존성 → 무한 루프 버그 |
| 외부 라이브러리 | 미사용 (SVG 직접) | 기존 명세 유지, 번들 크기 최소화 |

---

## 완료 기준

- 더미 데이터 `p_parallel` 프로세스의 SwimLane 정상 렌더링
- CO팀 Step1에서 FIN팀·LOG팀으로 분기 화살표 표시
- FIN팀·LOG팀에서 CO팀 Step4로 합류 화살표 표시
- 기존 선형 프로세스는 변경 없이 동일하게 렌더링

---

## 개발 시 주의사항

- SVG 오버레이 렌더링은 `useLayoutEffect`로 노드 위치 측정 후 수행 (useEffect는 깜빡임)
- `getBoundingClientRect`는 스크롤 위치에 영향받음 — 컨테이너 기준 상대 좌표로 변환 필요
- Word 내보내기는 이 Phase에서 필수가 아님

---

## 수정 파일 목록

| 파일 | 변경 내용 |
|------|-----------|
| `src/components/diagrams/SwimLane.jsx` | 레이아웃 엔진 재작성, SVG 오버레이 화살표, 무한루프 수정 |
| `src/components/modals/StepModal.jsx` | Step(colIndex) 입력 필드 추가, 4칸 그리드 |
| `src/components/views/LV2View.jsx` | `connections` prop 제거 |
| `src/constants.js` | 더미 데이터에서 `connections` 배열 제거 |

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-03-19 | Phase 8 최초 작성 |
| 2026-03-19 | 더미 데이터 추가 (constants.js — p_parallel 프로세스) |
| 2026-03-19 | SwimLane 레이아웃 엔진 변경 — colIndex 기반 열 배치 |
| 2026-03-19 | SVG 오버레이 화살표 — useLayoutEffect + getBoundingClientRect |
| 2026-03-19 | 무한루프 버그 수정 — [stepsKey, connKey] 의존성 배열 |
| 2026-03-19 | connections 자동 파생으로 설계 변경 |
| 2026-03-19 | StepModal에 Step 필드 추가 |
| 2026-03-20 | 수동 테스트 완료 — 버그 발견 → Phase 9에서 해결 |
| 2026-03-20 | Phase 8 완료 처리 |
