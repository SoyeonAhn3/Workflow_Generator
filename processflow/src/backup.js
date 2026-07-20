// ============================================================
// 백업 / 복원 (F18)
//   - 데이터가 두 곳에 나뉘어 저장됨:
//       · localStorage("processflow_v2") → 텍스트 트리(부서/그룹/프로세스/단계)
//       · IndexedDB("processflow_images") → 이미지 Blob (id로 참조)
//   - 온전한 백업 = 두 저장소를 모두 담아야 함
//   - 이미지(Blob)는 JSON에 직접 못 담으므로 Base64(dataUrl) 문자열로 변환
//
//   흐름:
//     내보내기: exportBackup(data)  → .json 다운로드
//     복원:     parseBackup(file)   → 검증만 (부작용 없음, 확인창용)
//               applyBackup(parsed) → 실제 두 저장소에 덮어쓰기
// ============================================================
import { saveAs } from 'file-saver'
import { saveToStorage } from './storage.js'
import { loadImage, saveImage } from './imageDB.js'

const BACKUP_VERSION = 2

// ── 트리 전체를 훑어 이미지 id 수집 (삭제 핸들러의 flatMap 패턴과 동일) ──
function collectImageIds(data) {
  return (data || [])
    .flatMap((d) => d.groups || [])
    .flatMap((g) => g.processes || [])
    .flatMap((p) => p.steps || [])
    .flatMap((s) => s.images || [])
    .map((img) => img.id)
}

// ── Blob → Base64 dataUrl 문자열 ──
function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

// ── Base64 dataUrl 문자열 → Blob (data: URL은 fetch로 안전하게 복원) ──
async function dataUrlToBlob(dataUrl) {
  const res = await fetch(dataUrl)
  return res.blob()
}

// ── 파일명용 날짜 문자열 (YYYY-MM-DD) ──
function todayStr() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

/**
 * 백업 파일 요약 (확인창 미리보기용)
 * @returns {{ depts:number, groups:number, procs:number, steps:number, images:number, exportedAt:string|null }}
 */
export function summarizeBackup(parsed) {
  const data = parsed?.data || []
  const groups = data.flatMap((d) => d.groups || [])
  const procs = groups.flatMap((g) => g.processes || [])
  const steps = procs.flatMap((p) => p.steps || [])
  return {
    depts: data.length,
    groups: groups.length,
    procs: procs.length,
    steps: steps.length,
    images: (parsed?.images || []).length,
    exportedAt: parsed?.exportedAt || null,
  }
}

/**
 * 내보내기 — 현재 데이터 전체를 .json 파일 1개로 다운로드
 * @param {Array} data 현재 부서 트리 (App의 data 상태)
 */
export async function exportBackup(data) {
  const ids = collectImageIds(data)

  // 이미지 Blob 병렬 로드 → Base64 변환 (없는 id는 건너뜀)
  const records = await Promise.all(ids.map((id) => loadImage(id)))
  const images = []
  for (const rec of records) {
    if (!rec) continue
    images.push({
      id: rec.id,
      name: rec.name,
      dataUrl: await blobToDataUrl(rec.blob),
    })
  }

  const backup = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data,
    images,
  }

  const blob = new Blob([JSON.stringify(backup)], { type: 'application/json' })
  saveAs(blob, `processflow_backup_${todayStr()}.json`)
}

/**
 * 파싱/검증만 수행 (부작용 없음) — 확인창에 요약을 보여주기 위해 사용
 * @param {File} file 사용자가 고른 .json 파일
 * @returns {Promise<{version:number, exportedAt:string, data:Array, images:Array}>}
 * @throws 형식이 올바르지 않으면 에러
 */
export async function parseBackup(file) {
  const text = await file.text()
  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('JSON 형식이 올바르지 않습니다.')
  }
  if (!parsed || !Array.isArray(parsed.data)) {
    throw new Error('ProcessFlow 백업 파일이 아닙니다.')
  }
  return {
    version: parsed.version ?? 1,
    exportedAt: parsed.exportedAt ?? null,
    data: parsed.data,
    images: Array.isArray(parsed.images) ? parsed.images : [],
  }
}

/**
 * 복원 적용 — 두 저장소를 덮어쓴다.
 *   1) 이미지 Base64 → Blob → IndexedDB 저장
 *   2) 텍스트 트리 → localStorage 저장
 * (기존 이미지 중 새 데이터가 참조하지 않는 것은 orphan으로 남지만 무해)
 * @returns {Promise<Array>} 복원된 데이터 (App의 setData에 사용)
 */
export async function applyBackup(parsed) {
  for (const img of parsed.images || []) {
    if (!img?.id || !img?.dataUrl) continue
    const blob = await dataUrlToBlob(img.dataUrl)
    await saveImage(img.id, blob, img.name || '')
  }
  saveToStorage(parsed.data)
  return parsed.data
}
