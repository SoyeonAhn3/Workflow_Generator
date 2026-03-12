# Phase 2 — 스킬 생성 + 앱 골격 + 네비게이션 `🔲 미시작`

> 개발 생산성을 위한 Claude 스킬 4개를 먼저 만들고, 클릭으로 LV1/2/3 전환되는 앱 프레임을 완성한다

**상태**: 🔲 미시작
**선행 조건**: Phase 1 완료

---

## 개요

**이 Phase는 2-A(스킬 생성)와 2-B(앱 골격)로 나뉘며, 반드시 2-A를 먼저 완료해야 한다.**
스킬 4개는 Phase 3 이후 컴포넌트 작성, 삭제 핸들러 구현, Word 블록 생성 시 반복 활용된다.
앱 골격은 TopNav, Sidebar, LV1/2/3 빈 껍데기 뷰, 뷰 전환 로직으로 구성된다.

---

## 완료 예정 항목

### Phase 2-A — 스킬 생성 (코딩 시작 전 필수)

| # | 스킬 | 상태 | 활용 시점 |
|---|------|------|-----------|
| 1 | `/gen-component` | 🔲 | Phase 2-B ~ 6 전체 |
| 2 | `/gen-delete-handler` | 🔲 | Phase 3 삭제 핸들러 |
| 3 | `/gen-word-block` | 🔲 | Phase 5 Word 생성 |
| 4 | `/spec-review` | 🔲 | 각 Phase 완료 후 점검 |

### Phase 2-B — 앱 골격

| # | 작업 | 상태 |
|---|------|------|
| 5 | `TopNav.jsx` 작성 | 🔲 |
| 6 | `Sidebar.jsx` 작성 | 🔲 |
| 7 | `LV1View.jsx` 빈 껍데기 | 🔲 |
| 8 | `LV2View.jsx` 빈 껍데기 | 🔲 |
| 9 | `LV3View.jsx` 빈 껍데기 | 🔲 |
| 10 | `App.jsx` 뷰 전환 로직 연결 | 🔲 |

---

## 세부 구현 내용

### 스킬 1 — `/gen-component`

**역할**: 컴포넌트명 + 용도 입력 시, 프로젝트 컨벤션을 준수하는 컴포넌트 초안 생성

생성 코드에 반드시 포함:
- `import { C } from '../constants'` 색상 토큰 참조
- Inline CSS (외부 CSS 파일/클래스명 사용 금지)
- props 타입 주석
- 기본 return JSX 구조

```
호출 예시: /gen-component
입력: "ProcessCard — LV2에서 프로세스 정보를 표시하는 카드 컴포넌트"
출력: ProcessCard.jsx 초안 (색상 토큰, inline CSS, props 구조 포함)
```

### 스킬 2 — `/gen-delete-handler`

**역할**: 삭제 대상 레벨(dept/group/process/step) 입력 시, IndexedDB 정합성이 완전히 구현된 삭제 핸들러 생성

생성 코드에 반드시 포함:
- `flatMap`으로 하위 이미지 id 수집 (레벨별 깊이 다름)
- `deleteImages(imageIds)` 호출 (IndexedDB 먼저 삭제)
- `updateData()` 호출 (LocalStorage 나중 저장)
- 선택 상태 초기화 (`setSelDept` 등)

```
호출 예시: /gen-delete-handler
입력: "group 삭제 — 그룹과 하위 프로세스 전체 삭제"
출력: handleDeleteGroup 함수 (flatMap 2단계 id 수집 + deleteImages + updateData)
```

### 스킬 3 — `/gen-word-block`

**역할**: Word 블록 종류 입력 시, docx 라이브러리 문법 + 한글 폰트 + 색상 규칙이 적용된 블록 코드 생성

생성 코드에 반드시 포함:
- `font: { name: "맑은 고딕", eastAsia: "맑은 고딕" }` 한글 폰트
- Section 9.3 색상 규칙 (레이블 셀 #2E75B6, 헤더 행 #1F4E79 등)
- 명세서 Section 9.2 구조 기준 블록

```
호출 예시: /gen-word-block
입력: "단계 메타 테이블 — 화면명/담당부서/PT 3열 테이블"
출력: docx TableRow 코드 (한글 폰트, 색상 토큰 적용)
```

### 스킬 4 — `/spec-review`

**역할**: 작성된 컴포넌트/함수 코드 입력 시, 명세서 위반 항목 점검 및 수정 제안

점검 항목:
- 색상 토큰 C 미사용 여부 (하드코딩 hex 감지)
- 버튼 위치 규칙 위반 (Word 내보내기 LV3에 있으면 안 됨 등)
- 필드 레이블명 오류 ("화면명 (T-Code/프로그램)" 표기 등)
- IndexedDB 삭제 누락 (삭제 함수에 deleteImages 없으면 경고)
- 이미지 Base64 직접 저장 감지 (id 참조 방식으로 수정 제안)

```
호출 예시: /spec-review
입력: [컴포넌트 코드 붙여넣기]
출력: 위반 항목 목록 + 수정 제안
```

---

### TopNav.jsx 핵심 구조

```jsx
// 배경: C.navy, 높이: 52px 고정
// 우측: LocalStorage 저장 상태 뱃지
//   - 정상: "💾 저장됨 · NKB" (녹색)
//   - 실패: "⚠️ 저장 실패" (빨간색)
```

### Sidebar.jsx 핵심 구조

```jsx
// 너비: sidebarOpen ? 250 : 48 (transition: width 0.25s ease)
// DeptRow: 색상 아이콘 + 부서명 + ▲▼ (LV1 이동)
// GroupRow: 들여쓰기 46px + 그룹명 + ▲▼ (LV2 이동)
// ProcRow: 들여쓰기 62px + ● + 프로세스명 (LV3 이동)
// 활성 항목: 좌측 3px 파란 바 + C.bluePale 배경
// 하단: 통계 위젯 + 부서 추가 버튼 (dashed border)
// 주의: 그룹/프로세스 추가 버튼은 사이드바에 없음
```

### 뷰 전환 로직

```jsx
// App.jsx에서 단 한 줄로 결정
const view = selProc ? "lv3" : selGroup ? "lv2" : "lv1"

// MainContent에서 조건부 렌더링
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
