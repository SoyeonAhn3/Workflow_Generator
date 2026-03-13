import { openDB } from 'idb'

// IndexedDB — 이미지 Blob 전용
const DB_NAME = "processflow_images"
const DB_VERSION = 1
const STORE_NAME = "images"

async function openImageDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME, { keyPath: "id" })
    },
  })
}

// 이미지 저장 — StepModal에서 onSave 시점에 호출
export async function saveImage(id, blob, name) {
  const db = await openImageDB()
  await db.put(STORE_NAME, { id, blob, name, createdAt: Date.now() })
}

// 이미지 불러오기 — 화면 표시 및 Word 삽입 시 호출
// 반환: { id, blob, name, createdAt } 또는 undefined
export async function loadImage(id) {
  const db = await openImageDB()
  return db.get(STORE_NAME, id)
}

// 이미지 단건 삭제 — 단계 내 이미지 × 버튼 클릭 시
export async function deleteImage(id) {
  const db = await openImageDB()
  await db.delete(STORE_NAME, id)
}

// 이미지 일괄 삭제 — 단계/프로세스/그룹/부서 삭제 시
// 빈 배열 전달 시 아무 동작 안 함 (안전 처리)
export async function deleteImages(ids) {
  if (!ids || ids.length === 0) return
  const db = await openImageDB()
  const tx = db.transaction(STORE_NAME, "readwrite")
  await Promise.all(ids.map((id) => tx.store.delete(id)))
  await tx.done
}
