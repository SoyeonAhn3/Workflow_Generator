// LocalStorage — 텍스트 데이터 전용
// 이미지 데이터(Blob)는 포함되지 않음 (IndexedDB에서 별도 관리)

const STORAGE_KEY = "processflow_v2"
const SIZE_WARN_KB = 3000

export function saveToStorage(data) {
  try {
    const json = JSON.stringify(data)
    const sizeKB = Math.round(new Blob([json]).size / 1024)
    if (sizeKB > SIZE_WARN_KB) console.warn("Storage size warning:", sizeKB, "KB")
    localStorage.setItem(STORAGE_KEY, json)
    return { ok: true, sizeKB }
  } catch (e) {
    if (e.name === "QuotaExceededError") return { ok: false, error: "storage_full" }
    return { ok: false, error: e.message }
  }
}

export function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
