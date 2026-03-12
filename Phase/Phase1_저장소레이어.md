# Phase 1 — 저장소 레이어 `🔲 미시작`

> 텍스트(LocalStorage)와 이미지(IndexedDB) 저장/불러오기 로직을 완성하고 검증한다

**상태**: 🔲 미시작
**선행 조건**: Phase 0 완료

---

## 개요

앱의 모든 데이터 영속성을 담당하는 두 저장소 모듈을 구현한다.
`storage.js`는 Department[] JSON을 LocalStorage에 저장/불러오고,
`imageDB.js`는 이미지 Blob을 IndexedDB에 CRUD한다.
App.jsx의 전역 상태 골격도 이 Phase에서 완성하여, Phase 2 이후 UI 개발 시
데이터가 정상 흐르는지 바로 확인할 수 있도록 한다.

---

## 완료 예정 항목

| # | 작업 | 상태 |
|---|------|------|
| 1 | `storage.js` 작성 | 🔲 |
| 2 | `imageDB.js` 작성 | 🔲 |
| 3 | `App.jsx` 전역 상태 골격 작성 | 🔲 |
| 4 | SAMPLE_DATA 포함 초기 로드 검증 | 🔲 |

---

## 세부 구현 내용

### storage.js

```js
// LocalStorage — 텍스트 데이터 전용
// 이미지 데이터(Blob)는 여기 포함되지 않음

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
  } catch {
    return null
  }
}
```

### imageDB.js

```js
import { openDB } from 'idb'

// IndexedDB — 이미지 Blob 전용
async function openImageDB() {
  return openDB("processflow_images", 1, {
    upgrade(db) {
      db.createObjectStore("images", { keyPath: "id" })
    }
  })
}

export async function saveImage(id, blob, name) {
  const db = await openImageDB()
  await db.put("images", { id, blob, name, createdAt: Date.now() })
}

export async function loadImage(id) {
  const db = await openImageDB()
  return db.get("images", id)  // { id, blob, name, createdAt }
}

export async function deleteImage(id) {
  const db = await openImageDB()
  await db.delete("images", id)
}

// 빈 배열 전달 시 아무 동작 안 함 (안전 처리)
export async function deleteImages(ids) {
  if (!ids || ids.length === 0) return
  const db = await openImageDB()
  const tx = db.transaction("images", "readwrite")
  await Promise.all(ids.map(id => tx.store.delete(id)))
  await tx.done
}
```

### App.jsx 전역 상태 골격

```js
import { useState } from 'react'
import { loadFromStorage, saveToStorage } from './storage'
import { SAMPLE_DATA } from './constants'

export default function App() {
  const [data, setData] = useState(() => loadFromStorage() || SAMPLE_DATA)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selDept,  setSelDept]  = useState(null)
  const [selGroup, setSelGroup] = useState(null)
  const [selProc,  setSelProc]  = useState(null)
  const [expDepts,  setExpDepts]  = useState({})
  const [expGroups, setExpGroups] = useState({})
  const [addModal,     setAddModal]     = useState(null)
  const [stepModal,    setStepModal]    = useState(null)
  const [deleteModal,  setDeleteModal]  = useState(null)
  const [exportGroup,  setExportGroup]  = useState(null)

  // setData 호출 시 자동으로 LocalStorage 저장
  const updateData = (fn) => {
    setData(prev => {
      const next = typeof fn === 'function' ? fn(prev) : fn
      saveToStorage(next)
      return next
    })
  }

  // 뷰 결정 (URL 없음 — 선택 상태로만 판단)
  const view = selProc ? "lv3" : selGroup ? "lv2" : "lv1"

  // 프로세스 단위 업데이트 헬퍼
  const updateProc = (procId, fn) =>
    updateData(prev => prev.map(d => ({
      ...d,
      groups: d.groups.map(g => ({
        ...g,
        processes: g.processes.map(p => p.id !== procId ? p : fn(p))
      }))
    })))

  return <div>App 골격 — Phase 2에서 UI 연결</div>
}
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
