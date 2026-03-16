# Phase 3 — CRUD + 삭제 핸들러 `✅ 완료`

> 부서/그룹/프로세스/단계의 추가·수정·삭제를 완성하고, IndexedDB 이미지 정합성을 보장하는 삭제 핸들러를 구현한다

**상태**: ✅ 완료 (2026-03-16)
**선행 조건**: Phase 2 완료 (스킬 4개 포함)

---

## 개요

앱의 핵심 데이터 조작 기능을 구현한다. 추가/수정은 모달 팝업으로 처리하고,
삭제는 IndexedDB 이미지 정합성 로직을 반드시 포함해야 한다.
이미지 첨부 기능도 이 Phase에서 구현되며, 파일 선택 → Blob → IndexedDB 저장 → id 참조 흐름을 완성한다.

> `/gen-delete-handler` 스킬을 적극 활용하여 삭제 핸들러 4종을 작성한다.

---

## 완료 예정 항목

| # | 작업 | 상태 |
|---|------|------|
| 1 | `LV1View.jsx` 그룹 카드 UI 완성 | ✅ |
| 2 | `LV2View.jsx` 프로세스 카드 UI 완성 (▼ 확장 제외) | ✅ |
| 3 | `LV3View.jsx` 단계 카드 UI 완성 (읽기 전용 본문) | ✅ |
| 4 | `AddModal.jsx` — lv1/lv2/lv3 레벨별 입력 폼 | ✅ |
| 5 | `StepModal.jsx` — 단계 추가/수정 + 이미지 첨부 | ✅ |
| 6 | `DeleteConfirmModal.jsx` | ✅ |
| 7 | 삭제 핸들러 4종 (부서/그룹/프로세스/단계) | ✅ |

---

## 세부 구현 내용

### AddModal.jsx — 레벨별 입력 필드

```
lv1 (부서 추가):
  - 부서명 (필수)

lv2 (그룹 추가):
  - 그룹명 (필수) + 담당 부서 + Module + 설명

lv3 (프로세스 추가):
  - 프로세스명 (필수) + 담당 부서 + 담당자 + Module + 설명

샘플 예시 안내 박스: C.bluePale 배경, 레벨별 샘플값 표시
```

### StepModal.jsx — 이미지 첨부 흐름

```jsx
// 이미지 첨부 처리 (FileReader → Blob → IndexedDB)
const handleImageAdd = async (file) => {
  const blob = new Blob([await file.arrayBuffer()], { type: file.type })
  const id = "img_" + Date.now()
  await saveImage(id, blob, file.name)
  setTempImages(prev => [...prev, { id, name: file.name }])
  // 미리보기: URL.createObjectURL(blob)
}

// 이미지 개별 삭제 (모달 내)
const handleImageRemove = async (imageId) => {
  await deleteImage(imageId)  // IndexedDB 즉시 삭제
  setTempImages(prev => prev.filter(img => img.id !== imageId))
  // 주의: 취소 버튼 클릭해도 이미 IndexedDB에서 삭제됨 (허용)
}
```

### 삭제 핸들러 4종 (/gen-delete-handler 스킬 활용)

**부서 삭제 (handleDeleteDept)**
```js
// 1. 하위 전체 이미지 id 수집 (4단계 flatMap)
const imageIds = dept.groups
  .flatMap(g => g.processes)
  .flatMap(p => p.steps)
  .flatMap(s => s.images)
  .map(img => img.id)
// 2. IndexedDB 먼저 삭제
await deleteImages(imageIds)
// 3. LocalStorage 저장
updateData(prev => prev.filter(d => d.id !== dept.id))
// 4. 선택 상태 초기화
setSelDept(null); setSelGroup(null); setSelProc(null)
```

**그룹 삭제 (handleDeleteGroup)**
```js
const imageIds = group.processes
  .flatMap(p => p.steps)
  .flatMap(s => s.images)
  .map(img => img.id)
await deleteImages(imageIds)
updateData(prev => prev.map(d => ({
  ...d, groups: d.groups.filter(g => g.id !== group.id)
})))
setSelGroup(null); setSelProc(null)
```

**프로세스 삭제 (handleDeleteProc)**
```js
const imageIds = proc.steps
  .flatMap(s => s.images)
  .map(img => img.id)
await deleteImages(imageIds)
updateData(prev => prev.map(d => ({
  ...d, groups: d.groups.map(g => ({
    ...g, processes: g.processes.filter(p => p.id !== proc.id)
  }))
})))
```

**단계 삭제 (handleDeleteStep)**
```js
const imageIds = step.images.map(img => img.id)
await deleteImages(imageIds)
updateProc(procId, p => ({
  ...p, steps: p.steps.filter(s => s.id !== step.id)
}))
```

### StepCard.jsx — 읽기 전용 본문 구조

```
헤더 (항상 표시):
  번호 뱃지 + 단계명 + 화면명·부서·PT
  [✏️ 수정] → StepModal(mode="edit")
  [🗑 삭제] → window.confirm → handleDeleteStep
  [▲/▼ 펼치기]

본문 (▼ 펼쳤을 때, 읽기 전용):
  Logic: gray100 배경, pre-line
  이미지: IndexedDB에서 로드 후 URL.createObjectURL 표시
  주의사항: #FFFBEB 배경, ⚠️ 아이콘
```

---

## 설계 결정 사항

| 항목 | 결정 | 이유 |
|------|------|------|
| 삭제 실행 순서 | IndexedDB 먼저 → LocalStorage 나중 | 역순이면 이미지 orphan 위험 |
| 이미지 취소 시 롤백 | 미구현 (허용) | 소규모 도구에서 허용 가능 수준 |
| 단계 삭제 확인 방법 | `window.confirm` (모달 없음) | 명세서 Section 11.4 / 7.6 기준 |
| 이미지 미리보기 | `URL.createObjectURL` | Base64 변환 없이 Blob 직접 사용 |

---

## 완료 기준

- 부서/그룹/프로세스/단계 추가 → LocalStorage 저장 → 새로고침 후 복원
- 단계에 이미지 첨부 → DevTools Application > IndexedDB에서 Blob 확인
- 부서 삭제 후 하위 모든 이미지 id가 IndexedDB에서 제거됨 확인
- 단계 삭제 후 step.images의 id들이 IndexedDB에서 제거됨 확인
- 단계 카드 본문 열기/닫기, ✏️ 수정 버튼으로 StepModal 오픈

---

## 개발 시 주의사항

- `handleDeleteDept`는 async 함수 — `await deleteImages()` 반드시 사용
- 이미지 id 수집 시 빈 배열이어도 `deleteImages([])` 안전하게 통과
- StepModal 저장 시 기존 images 배열에서 삭제된 항목도 IndexedDB에서 제거
- 단계 수정(edit) 시 새로 추가된 이미지와 기존 이미지 id 병합 처리 필요

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-03-12 | 최초 작성 |
| 2026-03-16 | Phase 3 완료 — LV1/2/3View CRUD UI, AddModal/StepModal/DeleteConfirmModal, 삭제 핸들러 4종, StepCard 구현 완료 |
