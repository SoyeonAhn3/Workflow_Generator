# Phase 4 — 다이어그램 `🔲 미시작`

> SVG와 CSS Grid로 LinearFlow(일렬 흐름도)와 SwimLane(수영 레인) 다이어그램을 직접 구현한다

**상태**: 🔲 미시작
**선행 조건**: Phase 3 완료

---

## 개요

외부 차트 라이브러리 없이 SVG + CSS Grid로 두 종류의 다이어그램을 구현한다.
LinearFlow는 LV3 전체 흐름도에, SwimLane은 LV2 프로세스 카드 ▼ 확장 시 표시된다.
두 컴포넌트는 `steps: Step[]`만 받아 렌더링하는 순수 표시 컴포넌트로 설계한다.

---

## 완료 예정 항목

| # | 작업 | 상태 |
|---|------|------|
| 1 | `LinearFlow.jsx` 구현 | 🔲 |
| 2 | `SwimLane.jsx` 구현 | 🔲 |
| 3 | LV3View에 LinearFlow 연결 | 🔲 |
| 4 | LV2View ProcessCard에 ▼ SwimLane 연결 | 🔲 |

---

## 세부 구현 내용

### LinearFlow.jsx

```
props: { steps: Step[] }
용도: LV3 전체 흐름도 섹션

레이아웃:
  - 가로 방향 flex, overflowX: auto (단계 많을 때 스크롤)
  - 각 노드: border 2px solid C.blue, radius:8, padding:12
  - 노드 내용:
      단계명 (11px bold)
      screenName (9px, C.blue)
      PT (10px, C.gray500)
  - 단계 번호 뱃지: 우상단 absolute, circle 20px, C.blue 배경, 흰 글자
  - 화살표: <svg><polygon points="..."> C.blue 색

빈 상태:
  "우상단 + 단계 추가 버튼으로 단계를 추가하세요" (C.gray300)
```

```jsx
// 화살표 SVG (노드 사이)
<svg width="24" height="40" style={{ flexShrink: 0 }}>
  <polygon
    points="0,16 16,16 16,10 24,20 16,30 16,24 0,24"
    fill={C.blue}
  />
</svg>
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
  - 분기/반려: 미구현 (v2 예정)
```

```jsx
// 부서 목록 추출 (등장 순서 기준)
const depts = [...new Set(steps.map(s => s.dept))]

// 레인 전환 여부 판단
const isLaneChange = (steps, i) =>
  i > 0 && steps[i].dept !== steps[i - 1].dept
```

---

## 설계 결정 사항

| 항목 | 결정 | 이유 |
|------|------|------|
| 외부 차트 라이브러리 | 미사용 (SVG 직접) | 명세서 규칙, 번들 크기 절약 |
| 분기/반려 표현 | v2 미구현 | 명세서 Section 7.2, 10 기준 |
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
- LinearFlow 노드 너비는 고정값 권장 (내용 길이에 따라 가로 스크롤 의도)

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-03-12 | 최초 작성 |
