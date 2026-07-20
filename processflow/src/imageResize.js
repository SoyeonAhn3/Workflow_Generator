// ============================================================
// 이미지 리사이즈 (F19)
//   - 첨부 이미지가 너무 크면 canvas로 축소 후 저장하여 용량 절감
//     (IndexedDB / Word 파일 / 백업 파일 크기 모두 감소)
//   - 규칙: 너비만 조정, 높이는 원본 비율 유지 (찌그러짐 방지)
//   - 형식: 원본이 PNG면 PNG 유지, 그 외는 JPEG로 재인코딩
//   - 너비가 기준 이하이면 원본 그대로 반환 (재인코딩·업스케일 안 함)
//   - 어떤 실패가 나도 원본을 반환 → 업로드 자체는 절대 막지 않음
//
//   반환 Blob의 .type이 정확하면 Word 내보내기(blob.type으로 형식 판별)와
//   백업(Base64 dataUrl)이 자동으로 올바르게 동작한다.
// ============================================================

const DEFAULT_MAX_WIDTH = 1600
const JPEG_QUALITY = 0.85

/**
 * 첨부 이미지 파일을 너비 기준으로 축소한다.
 * @param {File} file 사용자가 첨부한 이미지 파일
 * @param {{ maxWidth?: number }} opts
 * @returns {Promise<Blob>} 축소된 Blob (또는 축소 불필요/실패 시 원본 file)
 */
export async function resizeImageFile(file, { maxWidth = DEFAULT_MAX_WIDTH } = {}) {
  // 이미지가 아니면 그대로 반환 (안전장치)
  if (!file || !file.type?.startsWith('image/')) return file

  try {
    const bitmap = await createImageBitmap(file)

    // 너비가 기준 이하 → 원본 유지 (축소·재인코딩 불필요)
    if (bitmap.width <= maxWidth) {
      bitmap.close?.()
      return file
    }

    const scale = maxWidth / bitmap.width
    const w = maxWidth
    const h = Math.round(bitmap.height * scale) // 높이는 비율대로 자동 계산

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h)
    bitmap.close?.()

    const isPng = file.type === 'image/png'
    const mime = isPng ? 'image/png' : 'image/jpeg'

    const blob = await new Promise((resolve) =>
      isPng
        ? canvas.toBlob(resolve, mime)
        : canvas.toBlob(resolve, mime, JPEG_QUALITY)
    )

    // toBlob 실패(null) 시 원본 fallback
    return blob || file
  } catch {
    // createImageBitmap 등 미지원/실패 시 원본 그대로 저장
    return file
  }
}
