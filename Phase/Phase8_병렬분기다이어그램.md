# Phase 8 — 병렬 분기·합류 다이어그램 `🚧 진행 중`

> SwimLane 다이어그램에 분기(Fork)·합류(Join) 흐름을 추가한다

**상태**: 🚧 진행 중
**선행 조건**: Phase 7 완료 (배포 완료)

---

## 개요

현재 SwimLane은 스텝이 순서대로 나열되는 **선형(linear) 흐름만** 지원한다.
실무에서는 한 팀이 요청한 업무를 **여러 팀이 동시에 처리**하고 결과를 다시 원 팀으로 전달하는 패턴이 빈번하다.

**목표 흐름 예시**

```
         ┌→ Step2a (FIN팀) ─┐
Step1 ───┤                    ├──→ Step3 (CO팀)
 (CO팀)  └→ Step2b (LOG팀) ─┘
```

이를 구현하기 위해 **데이터 모델 확장 → 레이아웃 엔진 변경 → SVG 오버레이 화살표** 순으로 작업한다.

---

## 완료 예정 항목

| # | 작업 | 상태 |
|---|------|------|
| 1 | 더미 데이터 추가 (`constants.js`) | ✅ |
| 2 | `SwimLane.jsx` 레이아웃 엔진 변경 (colIndex 기반) | ✅ |
| 3 | SVG 오버레이 화살표 시스템 구현 (분기·합류) | ✅ |
| 4 | 기존 선형 데이터 하위 호환 처리 | ✅ |
| 5 | `StepModal.jsx`에 Step(colIndex) 입력 필드 추가 | ✅ |
| 6 | connections 자동 파생 (colIndex 그룹핑 기반) | ✅ |
| 7 | 수동 테스트 (브라우저) | 🔲 |
| 8 | Word 내보내기 반영 (선택) | 🔲 |

---

## 구현 설계

### 1. 데이터 모델 확장

#### 변경 전
```js
// steps 배열 순서 = 화면 표시 순서 (1:1 순차 연결 고정)
steps: [
  { id: 's1', dept: 'CO팀' },
  { id: 's2', dept: 'FIN팀' },
  { id: 's3', dept: 'CO팀' },
]
```

#### 변경 후 (최종 구현)
```js
// connections 배열 불필요 — colIndex만으로 화살표 자동 파생
steps: [
  { id: 'pt_s1', dept: 'CO팀',  colIndex: 0 },   // 1열
  { id: 'pt_s2', dept: 'FIN팀', colIndex: 1 },   // 2열 (병렬)
  { id: 'pt_s3', dept: 'LOG팀', colIndex: 1 },   // 2열 (병렬)
  { id: 'pt_s4', dept: 'CO팀',  colIndex: 2 },   // 3열
]
```

**필드별 역할**

| 필드 | 타입 | 역할 | 없을 때 |
|------|------|------|---------|
| `colIndex` | number | 몇 번째 열에 배치할지. 동일한 값이면 같은 열에 세로로 쌓임 | 현재까지 최대 colIndex + 1 (마지막 열 자동 배정) |

> **설계 변경**: 초기 설계의 `connections` 명시 배열은 제거됨. colIndex 그룹핑만으로 분기·합류 화살표를 자동 계산하는 방식으로 단순화.

---

### 2. 레이아웃 엔진 변경

#### 변경 전
```js
// 그리드 열 수 = 스텝 개수 (N)
gridTemplateColumns: `110px repeat(${steps.length}, 180px)`
```

#### 변경 후
```js
// 그리드 열 수 = 고유 colIndex 개수 (병렬 스텝은 같은 열 공유)
const colCount = Math.max(...steps.map(s => s.colIndex ?? idx)) + 1
gridTemplateColumns: `110px repeat(${colCount}, 180px)`
```

**시각적 결과**

|  | 열0 | 열1 | 열2 |
|--|-----|-----|-----|
| CO팀 레인 | Step1 ● | (빈 셀) | Step4 ● |
| FIN팀 레인 | (빈 셀) | Step2 ● | (빈 셀) |
| LOG팀 레인 | (빈 셀) | Step3 ● | (빈 셀) |

FIN팀 Step2와 LOG팀 Step3이 같은 열1에 위치 → 시각적으로 "동시 업무" 표현

---

### 3. SVG 오버레이 화살표 시스템

#### 기존 방식의 한계
각 스텝 노드 옆에 작은 SVG `→`를 붙이는 방식 → 레인을 수직으로 가로지르는 화살표 불가

#### 새 방식: 절대 위치 SVG 오버레이
```
┌─── 다이어그램 컨테이너 (position: relative) ──────────────┐
│  [스텝 노드 그리드]                                        │
│  ┌────────┐    ┌────────┐    ┌────────┐                   │
│  │ Step1  │    │ Step2  │    │ Step4  │                   │
│  └────────┘    ├────────┤    └────────┘                   │
│                │ Step3  │                                  │
│                └────────┘                                  │
│                                                            │
│  [SVG 레이어 — position: absolute, 전체 크기, 최상위]      │
│   connections 배열 → 노드 위치 계산 → Path 그리기          │
└────────────────────────────────────────────────────────────┘
```

**화살표 경로 계산 로직**
```
1. 각 스텝 노드에 useRef 부착 → 실제 픽셀 위치(getBoundingClientRect) 측정
2. connections 배열 순회
3. from 노드 우측 중앙 → to 노드 좌측 중앙 연결
   - 같은 레인(y 동일): 직선 →
   - 다른 레인(y 다름):  꺾인 선 ┐ 또는 ┘
4. 분기(1→N): 한 노드에서 여러 Path 출발
5. 합류(N→1): 여러 Path가 한 노드로 도착
```

**화살표 스타일**
| 유형 | 선 스타일 | 색상 |
|------|-----------|------|
| 같은 레인 | 실선 | 부서 색(DEPT_COLORS) |
| 레인 전환(수직 이동) | 점선 | C.gray300 |
| 분기 화살표 | 실선 | C.gray300 |

---

### 4. 하위 호환 처리 (구현 완료)

`colIndex` 없는 기존 데이터는 **마지막 열 자동 배정**으로 처리:
```js
// SwimLane.jsx — stepsWithCol 계산 (reduce로 순차 처리)
const stepsWithCol = safeSteps.reduce((acc, step) => {
  if (step.colIndex !== undefined && step.colIndex !== null) {
    acc.push({ ...step, colIndex: Number(step.colIndex) })
  } else {
    const maxCol = acc.length > 0 ? Math.max(...acc.map(s => s.colIndex)) : -1
    acc.push({ ...step, colIndex: maxCol + 1 })  // 마지막 열 + 1
  }
  return acc
}, [])
```

→ 기존 프로세스(colIndex 없음)는 배열 순서대로 0, 1, 2, ... 열에 순차 배치됨

---

### 5. connections 자동 파생 (구현 완료)

colIndex 그룹핑 → 인접 열 전체 조합 연결:
```js
// 같은 colIndex끼리 그룹핑
const colGroups = {}   // { 0: ['pt_s1'], 1: ['pt_s2','pt_s3'], 2: ['pt_s4'] }

// 인접한 두 열 사이를 모두 연결 → 분기·합류 자동 처리
for (let i = 0; i < colIndices.length - 1; i++) {
  const fromIds = colGroups[colIndices[i]]
  const toIds   = colGroups[colIndices[i + 1]]
  fromIds.forEach(fromId => toIds.forEach(toId => {
    resolvedConnections.push({ from: fromId, to: toId })
  }))
}
// 결과: pt_s1→pt_s2, pt_s1→pt_s3 (분기), pt_s2→pt_s4, pt_s3→pt_s4 (합류)
```

---

### 6. StepModal Step 필드 (구현 완료)

`StepModal.jsx` 입력 그리드를 3칸 → 4칸으로 확장:
```
[화면명(T-Code)] [담당] [PT] [Step]
```

- **Step 필드**: colIndex를 사용자가 직접 입력 (숫자)
- **비워두면**: colIndex 미포함으로 저장 → SwimLane이 마지막 열 자동 배정
- **같은 숫자 입력**: 여러 스텝이 같은 열에 배치되어 병렬 표현

```js
// handleSubmit — colIndex 저장 로직
const parsed = parseInt(colIndex, 10)
onSave({
  ...
  ...(colIndex !== '' && !isNaN(parsed) ? { colIndex: parsed } : {}),
})
```

---

## 더미 데이터 (작성 완료)

`constants.js` — `SAMPLE_DATA → CO팀 → 병렬 흐름 테스트` 그룹에 추가됨

```
프로세스: 부서 병렬 처리 프로세스 (p_parallel)

  pt_s1 (CO팀, colIndex:0)   ─┬─→  pt_s2 (FIN팀, colIndex:1)  ─┬─→  pt_s4 (CO팀, colIndex:2)
  미결 현황 파악                └─→  pt_s3 (LOG팀, colIndex:1)  ─┘   결과 종합 및 마감
                                     물류 데이터 검토
                                     재무 데이터 검토
```

---

## 설계 결정 사항

| 항목 | 결정 | 이유 |
|------|------|------|
| 화살표 방식 | SVG 오버레이 (position: absolute) | 노드 옆 인라인 SVG로는 수직 방향 레인 건너기 불가 |
| 열 수 기준 | colIndex 고유값 수 | 병렬 스텝이 같은 열을 공유해야 "동시 업무" 시각적으로 표현 가능 |
| connections 필드 | **제거** — colIndex 그룹핑으로 자동 파생 | 사용자가 명시적 연결을 입력하지 않아도 되므로 UX 단순화 |
| colIndex 미입력 시 기본값 | 마지막 열 + 1 (max + 1) | 배열 인덱스 방식은 병렬 스텝 뒤에 추가 시 열이 불필요하게 늘어남 |
| 기존 데이터 호환 | colIndex 없으면 순차 자동 배정 | Phase 1~7에서 만든 기존 프로세스 영향 없음 |
| useLayoutEffect 의존성 | `[stepsKey, connKey]` 문자열 키 | 의존성 배열 없으면 매 렌더마다 실행 → 무한 루프 버그 발생 |
| 외부 라이브러리 | 미사용 (SVG 직접) | 기존 명세 유지, 번들 크기 최소화 |

---

## 완료 기준

- 더미 데이터 `p_parallel` 프로세스의 SwimLane 정상 렌더링
- CO팀 Step1에서 FIN팀·LOG팀으로 분기 화살표 표시
- FIN팀·LOG팀에서 CO팀 Step4로 합류 화살표 표시
- 기존 선형 프로세스(SAMPLE_DATA 기존 항목)는 변경 없이 동일하게 렌더링

---

## 개발 시 주의사항

- SVG 오버레이 렌더링은 `useLayoutEffect`로 노드 위치 측정 후 수행 (useEffect는 깜빡임 발생)
- `getBoundingClientRect`는 스크롤 위치에 영향받음 — 컨테이너 기준 상대 좌표로 변환 필요
- Word 내보내기(`wordExport.js`)는 이 Phase에서 필수가 아님 — 렌더링 확인 후 별도 처리

---

## 수정 파일 목록

| 파일 | 변경 내용 |
|------|-----------|
| `src/components/diagrams/SwimLane.jsx` | 레이아웃 엔진 재작성 (colIndex 기반), SVG 오버레이 화살표, 무한루프 버그 수정 |
| `src/components/modals/StepModal.jsx` | Step(colIndex) 입력 필드 추가, 4칸 그리드 |
| `src/components/views/LV2View.jsx` | `connections` prop 제거 |
| `src/constants.js` | 더미 데이터에서 `connections` 배열 제거 |

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-03-19 | Phase 8 최초 작성 — 병렬 분기·합류 다이어그램 구현 계획 |
| 2026-03-19 | 더미 데이터 추가 완료 (constants.js — p_parallel 프로세스) |
| 2026-03-19 | SwimLane 레이아웃 엔진 변경 — colIndex 기반 열 배치, 인라인 화살표 제거 |
| 2026-03-19 | SVG 오버레이 화살표 구현 — useLayoutEffect + getBoundingClientRect |
| 2026-03-19 | useLayoutEffect 무한루프 버그 수정 — [stepsKey, connKey] 의존성 배열 추가 |
| 2026-03-19 | connections 자동 파생으로 설계 변경 — colIndex 그룹핑만으로 분기·합류 계산 |
| 2026-03-19 | StepModal에 Step 필드 추가 — colIndex 직접 입력, 비우면 마지막 열 자동 배정 |
