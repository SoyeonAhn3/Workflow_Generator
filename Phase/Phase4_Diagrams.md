# Phase 4 — Diagrams `✅ Completed`

> Build LinearFlow (sequential flow) and SwimLane (department workflow) diagrams with SVG and CSS Grid — no external chart libraries

**Completed**: 2026-03-16
**Status**: ✅ Completed
**Prerequisites**: Phase 3 completed

---

## Overview

Implement two diagram types using SVG + CSS Grid without any external chart library.
LinearFlow is used in the LV3 full flow view, and SwimLane (UI label: "Department Workflow") is shown when expanding the ▼ on LV2 process cards.
Both components are pure display components that only receive `steps: Step[]` as props.

---

## Deliverables

| # | Task | Status |
|---|------|--------|
| 1 | `LinearFlow.jsx` implementation | ✅ |
| 2 | `SwimLane.jsx` implementation (UI label: "부서별 Work flow") | ✅ |
| 3 | Connect LinearFlow to LV3View | ✅ |
| 4 | Connect SwimLane to LV2View ProcessCard ▼ expand | ✅ |
| 5 | Fix back-navigation state sync bug after LV3 step edit | ✅ |

---

## Implementation Details

### LinearFlow.jsx

```
props: { steps: Step[] }
Usage: LV3 full flow section

Layout:
  - Horizontal flex, overflowX: auto (scrolls when many steps)
  - Each node: border 2px solid C.blue, radius:8, padding:12
  - Node content: step name (11px bold), screenName (9px, C.blue), PT (10px, C.gray500)
  - Step number badge: top-right absolute, circle 20px, C.blue background, white text
  - Arrow: <svg><polygon> C.blue color

Empty state: "Add steps using the + button in the top right" (C.gray300)
```

### SwimLane.jsx

```
props: { steps: Step[] }
Usage: LV2 process card ▼ expand — department-level flow

Layout:
  - CSS Grid: "80px 1fr" (dept label column + step columns)
  - Header row: C.navy background, white text ("Department" | step names)
  - Lane rows: even white / odd C.gray100
  - Each dept color: DEPT_COLORS array cycling

Node placement logic:
  1. Extract unique dept list from steps (maintain appearance order)
  2. Each lane (row) shows only steps for that dept
  3. Other lanes show empty divs

Arrows:
  - Same lane consecutive: dept color solid SVG arrow
  - Lane change (dept changes): gray dashed SVG arrow
  - Branch/reject: not implemented (planned for Phase 8)
```

---

## Design Decisions

| Item | Decision | Reason |
|------|----------|--------|
| External chart library | Not used (direct SVG) | Per spec rule, saves bundle size |
| Branch/reject rendering | Implemented in Phase 8 | Per spec Section 7.2, 10 |
| Lane order basis | Step appearance order | Reflects natural flow |
| Horizontal scroll | overflowX: auto | Layout maintained regardless of step count |

---

## Acceptance Criteria

- SAMPLE_DATA CO team "마감 Check 프로세스" (3 steps) renders correctly in LinearFlow
- LinearFlow step number badge in top-right
- SwimLane same-dept arrows are solid, lane-change arrows are dashed
- 10+ steps → horizontal scroll works (LinearFlow)
- No steps → LinearFlow shows guidance message

---

## Development Notes

- SwimLane classifies lanes by `dept` — Step.dept field must be populated correctly
- DEPT_COLORS has 5 entries — need cycling for 5+ departments
- LinearFlow node width should be fixed (content length determines horizontal scroll)

---

## Change Log

| Date | Description |
|------|-------------|
| 2026-03-12 | Initial creation |
| 2026-03-16 | Phase 4 completed — LinearFlow/SwimLane implemented. UI label "SwimLane" → "부서별 Work flow". LV3 step edit back-nav selGroup.processes stale bug fixed (TC-011). All TC-001~011 Pass |
| 2026-03-19 | Design decisions updated — branch/merge planned for Phase 8 |

---
---

# Phase 4 — 다이어그램 `✅ 완료`

> SVG와 CSS Grid로 LinearFlow(일렬 흐름도)와 부서별 Work flow(수영 레인) 다이어그램을 직접 구현한다

**완료일**: 2026-03-16
**상태**: ✅ 완료
**선행 조건**: Phase 3 완료

---

## 개요

외부 차트 라이브러리 없이 SVG + CSS Grid로 두 종류의 다이어그램을 구현한다.
LinearFlow는 LV3 전체 흐름도에, 부서별 Work flow(SwimLane)는 LV2 프로세스 카드 ▼ 확장 시 표시된다.
두 컴포넌트는 `steps: Step[]`만 받아 렌더링하는 순수 표시 컴포넌트로 설계한다.

---

## 완료 예정 / 완료 항목

| # | 작업 | 상태 |
|---|------|------|
| 1 | `LinearFlow.jsx` 구현 | ✅ |
| 2 | `SwimLane.jsx` 구현 (UI 레이블: "부서별 Work flow") | ✅ |
| 3 | LV3View에 LinearFlow 연결 | ✅ |
| 4 | LV2View ProcessCard에 ▼ 부서별 Work flow 연결 | ✅ |
| 5 | LV3 단계 수정 후 뒤로가기 상태 동기화 버그 수정 | ✅ |

---

## 세부 구현 내용

### LinearFlow.jsx

```
props: { steps: Step[] }
용도: LV3 전체 흐름도 섹션

레이아웃:
  - 가로 방향 flex, overflowX: auto (단계 많을 때 스크롤)
  - 각 노드: border 2px solid C.blue, radius:8, padding:12
  - 노드 내용: 단계명 (11px bold), screenName (9px, C.blue), PT (10px, C.gray500)
  - 단계 번호 뱃지: 우상단 absolute, circle 20px, C.blue 배경, 흰 글자
  - 화살표: <svg><polygon> C.blue 색

빈 상태: "우상단 + 단계 추가 버튼으로 단계를 추가하세요" (C.gray300)
```

### SwimLane.jsx

```
props: { steps: Step[] }
용도: LV2 프로세스 카드 ▼ 확장 시 부서별 흐름

레이아웃:
  - CSS Grid: "80px 1fr" (부서 레이블 컬럼 + 단계 컬럼)
  - 헤더 행: C.navy 배경, 흰 글자 ("부서" | 단계명들)
  - 레인 행: 짝수 white / 홀수 C.gray100
  - 각 부서 컬러: DEPT_COLORS 배열 순환

노드 배치 로직:
  1. steps에서 고유 dept 목록 추출 (등장 순서 유지)
  2. 각 레인(행)에 해당 dept 단계만 표시
  3. 다른 레인은 빈 div

화살표:
  - 같은 레인 연속: 부서 색 실선 SVG 화살표
  - 레인 전환 (dept 바뀜): gray 점선 SVG 화살표
  - 분기/반려: Phase 8에서 구현
```

---

## 설계 결정 사항

| 항목 | 결정 | 이유 |
|------|------|------|
| 외부 차트 라이브러리 | 미사용 (SVG 직접) | 명세서 규칙, 번들 크기 절약 |
| 분기/반려 표현 | Phase 8에서 구현 | 명세서 Section 7.2, 10 기준 |
| 레인 순서 기준 | steps 등장 순서 | 자연스러운 흐름 반영 |
| 가로 스크롤 | overflowX: auto | 단계 수 많아도 레이아웃 유지 |

---

## 완료 기준

- SAMPLE_DATA CO팀 "물류마감 Check 프로세스" (3단계) LinearFlow 정상 렌더링
- LinearFlow 단계 번호 뱃지 우상단에 표시
- SwimLane에서 같은 부서 화살표는 실선, 레인 전환은 점선
- 단계 10개 이상일 때 가로 스크롤 동작 (LinearFlow)
- 단계 없을 때 LinearFlow 안내 문구 표시

---

## 개발 시 주의사항

- SwimLane은 `dept` 기준으로 레인 분류 — Step.dept 필드가 정확히 채워져야 함
- DEPT_COLORS는 최대 5개 — 부서 5개 초과 시 색상 순환 처리 필요
- LinearFlow 노드 너비는 고정값 권장

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-03-12 | 최초 작성 |
| 2026-03-16 | Phase 4 완료 — LinearFlow/SwimLane 구현, LV3View/LV2View 연결. UI 레이블 "SwimLane" → "부서별 Work flow" 변경. LV3 단계 수정 후 뒤로가기 시 selGroup.processes 미갱신 버그 수정 (TC-011). 전체 TC-001~011 Pass |
| 2026-03-19 | Phase 8에서 분기·합류 구현 예정으로 설계 결정 항목 업데이트 |
