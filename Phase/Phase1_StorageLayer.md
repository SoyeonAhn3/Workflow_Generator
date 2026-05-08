# Phase 1 — Storage Layer `✅ Completed`

> Implement and verify text (LocalStorage) and image (IndexedDB) save/load logic

**Completed**: 2026-03-13
**Status**: ✅ Completed
**Prerequisites**: Phase 0 completed

---

## Overview

Build the two storage modules that handle all data persistence in the app.
`storage.js` saves/loads the Department[] JSON to LocalStorage,
`imageDB.js` handles image Blob CRUD via IndexedDB.
The App.jsx global state skeleton is also completed in this Phase so that data flows correctly from Phase 2 onward.

---

## Deliverables

| # | Task | Status | Type |
|---|------|--------|------|
| 1 | `storage.js` implementation | ✅ | module |
| 2 | `imageDB.js` implementation | ✅ | module |
| 3 | `App.jsx` global state skeleton | ✅ | component |
| 4 | SAMPLE_DATA initial load verification | ✅ | test |

---

## Implementation Details

### storage.js

```js
export function saveToStorage(data) {
  try {
    const json = JSON.stringify(data)
    const sizeKB = Math.round(new Blob([json]).size / 1024)
    if (sizeKB > 3000) console.warn("Storage size warning:", sizeKB, "KB")
    localStorage.setItem("processflow_v1", json)
    return { ok: true, sizeKB }
  } catch (e) {
    if (e.name === "QuotaExceededError") return { ok: false, error: "storage_full" }
    return { ok: false, error: e.message }
  }
}

export function loadFromStorage() {
  try {
    const raw = localStorage.getItem("processflow_v1")
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}
```

### imageDB.js

```js
import { openDB } from 'idb'

async function openImageDB() {
  return openDB("processflow_images", 1, {
    upgrade(db) { db.createObjectStore("images", { keyPath: "id" }) }
  })
}

export async function saveImage(id, blob, name) { /* put to store */ }
export async function loadImage(id) { /* get from store */ }
export async function deleteImage(id) { /* delete from store */ }
export async function deleteImages(ids) { /* batch delete with transaction */ }
```

### App.jsx Global State Skeleton

```js
const [data, setData] = useState(() => loadFromStorage() || SAMPLE_DATA)
const [selDept, setSelDept] = useState(null)
const [selGroup, setSelGroup] = useState(null)
const [selProc, setSelProc] = useState(null)

const updateData = (fn) => {
  setData(prev => {
    const next = typeof fn === 'function' ? fn(prev) : fn
    saveToStorage(next)
    return next
  })
}

const view = selProc ? "lv3" : selGroup ? "lv2" : "lv1"
```

---

## Data Structure

```
LocalStorage "processflow_v1"
  └─ Department[]
       └─ Group[]
            └─ Process[]
                 └─ Step[]
                      └─ images: [{ id: "img_xxx", name: "filename" }]
                                      ↑ id reference only

IndexedDB "processflow_images" > store "images"
  └─ { id: "img_xxx", blob: Blob, name: "filename", createdAt: number }
         ↑ actual image data
```

---

## Design Decisions

| Item | Decision | Reason |
|------|----------|--------|
| LocalStorage warning threshold | 3MB | Text-only data; buffer against 5MB limit |
| IndexedDB library | `idb` | Promise-based API, no callback hell, 3KB lightweight |
| Image storage format | Blob (not Base64) | 33% smaller than Base64 |
| updateData pattern | Wraps setData | Guarantees automatic saveToStorage call |

---

## Acceptance Criteria

- App refresh restores SAMPLE_DATA from LocalStorage
- `saveImage` → `loadImage(id)` returns identical Blob
- `deleteImages([])` passes without errors
- `deleteImages(['nonexistent_id'])` passes without errors

---

## Development Notes

- Always use `updateData` to change data — direct `setData` skips LocalStorage save
- IndexedDB is async — must use `await` when calling from UI
- If `loadFromStorage()` returns null, fall back to SAMPLE_DATA (first-run handling)

---

## Change Log

| Date | Description |
|------|-------------|
| 2026-03-12 | Initial creation |
| 2026-03-13 | Phase 1 completed |

---
---

# Phase 1 — 저장소 레이어 `✅ 완료`

> 텍스트(LocalStorage)와 이미지(IndexedDB) 저장/불러오기 로직을 완성하고 검증한다

**완료일**: 2026-03-13
**상태**: ✅ 완료
**선행 조건**: Phase 0 완료

---

## 개요

앱의 모든 데이터 영속성을 담당하는 두 저장소 모듈을 구현한다.
`storage.js`는 Department[] JSON을 LocalStorage에 저장/불러오고,
`imageDB.js`는 이미지 Blob을 IndexedDB에 CRUD한다.
App.jsx의 전역 상태 골격도 이 Phase에서 완성하여, Phase 2 이후 UI 개발 시
데이터가 정상 흐르는지 바로 확인할 수 있도록 한다.

---

## 완료 예정 / 완료 항목

| # | 작업 | 상태 | 타입 |
|---|------|------|------|
| 1 | `storage.js` 작성 | ✅ | module |
| 2 | `imageDB.js` 작성 | ✅ | module |
| 3 | `App.jsx` 전역 상태 골격 작성 | ✅ | component |
| 4 | SAMPLE_DATA 포함 초기 로드 검증 | ✅ | test |

---

## 세부 구현 내용

### storage.js

```js
export function saveToStorage(data) {
  try {
    const json = JSON.stringify(data)
    const sizeKB = Math.round(new Blob([json]).size / 1024)
    if (sizeKB > 3000) console.warn("Storage size warning:", sizeKB, "KB")
    localStorage.setItem("processflow_v1", json)
    return { ok: true, sizeKB }
  } catch (e) {
    if (e.name === "QuotaExceededError") return { ok: false, error: "storage_full" }
    return { ok: false, error: e.message }
  }
}

export function loadFromStorage() {
  try {
    const raw = localStorage.getItem("processflow_v1")
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}
```

### imageDB.js

```js
import { openDB } from 'idb'

async function openImageDB() {
  return openDB("processflow_images", 1, {
    upgrade(db) { db.createObjectStore("images", { keyPath: "id" }) }
  })
}

export async function saveImage(id, blob, name) { /* store에 put */ }
export async function loadImage(id) { /* store에서 get */ }
export async function deleteImage(id) { /* store에서 delete */ }
export async function deleteImages(ids) { /* 트랜잭션으로 일괄 삭제 */ }
```

### App.jsx 전역 상태 골격

```js
const [data, setData] = useState(() => loadFromStorage() || SAMPLE_DATA)
const [selDept, setSelDept] = useState(null)
const [selGroup, setSelGroup] = useState(null)
const [selProc, setSelProc] = useState(null)

const updateData = (fn) => {
  setData(prev => {
    const next = typeof fn === 'function' ? fn(prev) : fn
    saveToStorage(next)
    return next
  })
}

const view = selProc ? "lv3" : selGroup ? "lv2" : "lv1"
```

---

## 데이터 구조 요약

```
LocalStorage "processflow_v1"
  └─ Department[]
       └─ Group[]
            └─ Process[]
                 └─ Step[]
                      └─ images: [{ id: "img_xxx", name: "파일명" }]
                                      ↑ id만 저장

IndexedDB "processflow_images" > store "images"
  └─ { id: "img_xxx", blob: Blob, name: "파일명", createdAt: number }
         ↑ 실제 이미지 데이터
```

---

## 설계 결정 사항

| 항목 | 결정 | 이유 |
|------|------|------|
| LocalStorage 용량 경고 기준 | 3MB | 이미지 없는 텍스트만이므로 5MB 한도 대비 여유 확보 |
| IndexedDB 라이브러리 | `idb` | 콜백 지옥 없는 Promise 기반 API, 3KB 경량 |
| 이미지 저장 방식 | Blob (Base64 아님) | Base64 대비 33% 용량 절약 |
| updateData 패턴 | setData 래핑 | saveToStorage 자동 호출 보장 |

---

## 완료 기준

- 앱 새로고침 후 SAMPLE_DATA가 LocalStorage에서 복원됨
- `saveImage` → `loadImage(id)` 로 동일 Blob 반환 확인
- `deleteImages([])` 호출 시 에러 없이 통과
- `deleteImages(['없는_id'])` 호출 시 에러 없이 통과

---

## 개발 시 주의사항

- `updateData`로만 data 변경 — 직접 `setData` 호출 시 LocalStorage 저장 누락
- IndexedDB는 비동기(async/await) — UI에서 호출 시 반드시 await 처리
- `loadFromStorage()` 반환값이 null이면 SAMPLE_DATA 사용 (초기 실행 대응)

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-03-12 | 최초 작성 |
| 2026-03-13 | Phase 1 완료 |
