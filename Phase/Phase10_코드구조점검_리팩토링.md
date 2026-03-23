# Phase 10 — 코드 구조 점검 + 리팩토링 `완료`

> architecture-guard 스킬로 코드 구조를 점검하고, CRITICAL/WARNING 항목을 리팩토링하여 유지보수성과 안정성을 개선한다.

**완료일**: 2026-03-23
**상태**: ✅ 완료
**선행 조건**: Phase 9 완료

---

## 개요

Phase 0~9까지 기능 개발을 마친 후, 코드 품질을 체계적으로 점검하는 단계.
`architecture-guard` 스킬을 생성하여 5가지 점검 항목(파일 길이, props 과다, 중복 패턴, frontmatter 중복 키, 수동 동기화 패턴)을 자동 검출하고,
CRITICAL 2건 + WARNING 5건을 식별하여 순차적으로 해결하였다.

---

## 완료 항목

| # | 작업 | 상태 | 심각도 |
|---|---|---|---|
| 1 | `architecture-guard` 스킬 생성 | ✅ | - |
| 2 | App.jsx ID 기반 파생 상태 전환 | ✅ | CRITICAL |
| 3 | wordExport.js 모듈 분리 | ✅ | CRITICAL |
| 4 | Escape 핸들러 중복 제거 (ModalBase 통일) | ✅ | WARNING |
| 5 | 삭제 아이콘 SVG 교체 | ✅ | - |
| 6 | architecture-guard 범용화 + Skill_package 배포 | ✅ | - |
| 7 | window.confirm → DeleteConfirmModal 통일 | ✅ | HIGH |
| 8 | Word 이미지 에러 처리 (누락 알림) | ✅ | HIGH |

---

## 1. architecture-guard 스킬

### 목적
매 Phase 완료 시 코드 구조를 자동 점검하여 리팩토링이 필요한 지점을 사전에 탐지한다.

### 구현 파일
- `.claude/skills/architecture-guard/SKILL.md`
- `Skill_package/architecture-guard/SKILL.md` (범용 버전)

### 점검 항목 5가지
| # | 항목 | 판정 기준 |
|---|---|---|
| 1 | 단일 파일 300줄 초과 | 300줄 WARNING / 500줄 CRITICAL |
| 2 | 컴포넌트 props 8개 초과 | 8개 WARNING / 12개 CRITICAL |
| 3 | 동일 패턴 3회 이상 반복 | 3회 WARNING / 5회 CRITICAL |
| 4 | SKILL.md frontmatter 중복 키 | 동일 파일 CRITICAL / 파일 간 WARNING |
| 5 | 상태 업데이트 후 수동 동기화 패턴 | 탐지 시 WARNING / 3회 이상 CRITICAL |

### 설계 결정 사항
- 프로젝트 특화 경로를 제거하고 언어 자동 탐지 방식으로 범용화
- 점검 항목을 5개로 제한 (너무 많으면 노이즈)
- "유사하지만 세부가 다른" 케이스는 플래그만 하고 최종 판단은 사용자에게 위임

---

## 2. App.jsx ID 기반 파생 상태 전환

### 목적
`selDept/selGroup/selProc`를 객체 복사본이 아닌 ID로 저장하여, 데이터 수정 시 수동 동기화 코드를 제거한다.

### 변경 내용
```jsx
// Before: 객체 복사본 저장 → 매번 수동 동기화 필요
const [selDept, setSelDept] = useState(null)
// 7곳에서 setSelDept/setSelGroup/setSelProc 수동 동기화 ~60줄

// After: ID만 저장 → data에서 자동 파생
const [selDeptId, setSelDeptId] = useState(null)
const selDept = data.find(d => d.id === selDeptId) || null
// 동기화 코드 0줄
```

### 수치 결과
| 지표 | Before | After |
|------|--------|-------|
| App.jsx 줄 수 | 550 | 487 (-63) |
| useState 개수 | 16 | 13 (-3) |
| 동기화 코드 | ~60줄 (7곳) | 0줄 |
| 동기화 누락 버그 리스크 | 있음 | 없음 |

---

## 3. wordExport.js 모듈 분리

### 목적
597줄의 단일 파일을 역할별로 분리하여 유지보수성 개선.

### 변경 내용
| 파일 | 역할 | 줄 수 |
|------|------|-------|
| `wordExport.helpers.js` (신규) | 색상 상수, 테두리 프리셋, 셀 헬퍼 함수 | 154 |
| `wordExport.js` | 섹션 빌더 (표지, 요약, 프로세스) + 메인 함수 | 455 |

---

## 4. Escape 핸들러 중복 제거

### 목적
`AIGenerateModal`, `DeleteConfirmModal`이 자체 ESC 처리 코드를 갖고 있어 `ModalBase`와 중복. `ModalBase`로 통일.

### 변경 내용
- `AIGenerateModal`: 자체 overlay + ESC 코드 제거 → `ModalBase` 래핑
- `DeleteConfirmModal`: 자체 overlay + ESC 코드 제거 → `ModalBase` 래핑 (title 없이)
- `ModalBase`: `title` prop을 선택적으로 변경 (null이면 h3 미렌더링)

### 결과
ESC 키 핸들러 관리: 3곳 → **1곳** (ModalBase만)

---

## 5. 삭제 아이콘 SVG 교체

### 변경 내용
- `🗑` 이모지 → SVG 쓰레기통 아이콘 (14x14, strokeWidth 2.5)
- 대상 파일: LV1View, LV2View, StepCard, DeleteConfirmModal
- 이유: 크로스 브라우저 일관성 및 가시성 개선

---

## 7. window.confirm → DeleteConfirmModal 통일

### 목적
단계 삭제 시 `window.confirm()`을 사용하던 것을 다른 삭제(부서/그룹/프로세스)와 동일하게 `DeleteConfirmModal`로 통일.

### 변경 내용
- `StepCard.jsx`: `window.confirm` 제거 → `onDelete(step)` 직접 호출
- `App.jsx`: `handleDeleteStep` → `requestDeleteStep`으로 변경, `handleDeleteConfirm`에 `'단계'` 분기 추가
- `LV3View.jsx`: `onDelete` 콜백에서 step을 StepCard가 직접 전달하도록 변경
- 삭제 확인 시 첨부 이미지 개수 안내 포함

---

## 8. Word 이미지 에러 처리

### 목적
Word 내보내기 시 이미지 로드 실패를 무시하던 것을 사용자에게 알림.

### 변경 내용
- `wordExport.js`: `catch { /* skip */ }` → `skippedImages` 카운터 집계, `generateGroupWord` 반환값에 포함
- `ExportModal.jsx`: 반환된 `skippedImages > 0`이면 경고 메시지 표시 ("이미지 N개가 포함되지 않았습니다")
- 이미지 누락이 없으면 기존처럼 모달 자동 닫힘

---

## architecture-guard 점검 결과 (최종)

| 항목 | 점검 전 | 점검 후 |
|------|---------|---------|
| 파일 300줄 초과 | CRITICAL 2 + WARNING 2 | WARNING 3 (허용 범위) |
| Props 8개 초과 | WARNING 2 | WARNING 2 (향후 개선) |
| 패턴 3회 반복 | WARNING 1 | PASS |
| Frontmatter 중복 키 | PASS | PASS |
| 수동 동기화 패턴 | CRITICAL (7곳) | PASS |

---

## 선행 조건 및 의존성

- Phase 9 완료 (드래그 앤 드롭, UX 개선)
- 모든 기능이 구현된 상태에서 코드 품질 점검 수행

---

## 개발 시 주의사항

- architecture-guard는 Phase 완료 시마다 실행하여 코드 품질을 지속 관리
- ID 기반 파생 상태 패턴은 향후 새 기능 추가 시에도 유지할 것 (객체 복사본 저장 금지)
- wordExport.helpers.js의 상수/헬퍼 수정 시 Word 출력 전체에 영향 — 반드시 Word 내보내기 테스트 수행

---

## 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-03-23 | 최초 작성 — Phase 10 완료 |
| 2026-03-23 | 추가 — window.confirm→DeleteConfirmModal 통일, Word 이미지 에러 처리 |
