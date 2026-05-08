# Phase 5 — Word Export `✅ Completed`

> Generate a .docx file with cover page, summary, and step-by-step detail structure directly in the browser

**Completed**: 2026-03-16
**Status**: ✅ Completed
**Prerequisites**: Phase 4 completed
**Note**: This is the most complex Phase and requires separate quality verification

---

## Overview

Use the `docx` library to generate Word files directly in the browser.
Images are loaded as Blobs from IndexedDB, converted to ArrayBuffer, then inserted.
Korean font requires the `eastAsia` property on every text Run to prevent rendering issues.

> Use the `/gen-word-block` skill to generate section-specific docx block code.

---

## Deliverables

| # | Task | Status |
|---|------|--------|
| 1 | `wordExport.js` — `generateGroupWord()` function | ✅ |
| 2 | Cover page block | ✅ |
| 3 | Group summary table block | ✅ |
| 4 | Process header + meta table block | ✅ |
| 5 | Step summary table block | ✅ |
| 6 | Step detail block (with image insertion) | ✅ |
| 7 | `ExportModal.jsx` (document composition section removed) | ✅ |
| 8 | Word generation error handling | ✅ |

---

## Implementation Details

### generateGroupWord() Flow

```js
export async function generateGroupWord(group, dept) {
  // 1. Load all image Blobs in parallel
  const allImageIds = group.processes
    .flatMap(p => p.steps).flatMap(s => s.images).map(img => img.id)
  const imageMap = {}
  await Promise.all(allImageIds.map(async id => {
    const record = await loadImage(id)
    if (record) imageMap[id] = record
  }))

  // 2. Assemble document sections
  const doc = new Document({
    sections: [{
      children: [
        ...buildCoverPage(group, dept),        // [1] Cover
        ...buildSummaryTable(group),           // [2] Summary
        ...group.processes.flatMap((proc, i) => // [3] Per-process
          buildProcessSection(proc, i, imageMap, i < group.processes.length - 1)
        )
      ]
    }]
  })

  // 3. Generate Blob and download
  const blob = await Packer.toBlob(doc)
  saveAs(blob, `${group.name}_${dept}_매뉴얼.docx`)
}
```

### Korean Font Rule

```js
const koreanFont = { name: "맑은 고딕", eastAsia: "맑은 고딕" }
// Must be included in every TextRun
```

### Image Insertion

```js
// IndexedDB Blob → ArrayBuffer → docx ImageRun
const arrayBuffer = await record.blob.arrayBuffer()
new ImageRun({
  data: arrayBuffer,
  transformation: { width: 400, height: 280 },  // pt units, fixed
  type: imageType,  // 'jpg' or 'png'
})
```

### Word Document Structure (per Section 9.2)

```
[1] Cover Page — Group name (48pt bold navy) + dept, info table, doc mgmt table
[2] Group Summary — Process list table (No / Name / Owner / Steps / Description)
[3] Per-Process Section (repeated)
    [3-1] Process header — number banner + meta table + step summary table
    [3-2] Step details (repeated) — name, meta row, images, Logic, warnings
    Page break between processes (except last)
```

---

## Style Rules (Section 9.3)

| Item | Value |
|------|-------|
| Font | 맑은 고딕 (with eastAsia) |
| Page | A4 (11906 × 16838 DXA) |
| Margins | Top/bottom 1200, left/right 1100 DXA |
| Label cells | #2E75B6 background + white text |
| Header rows | #1F4E79 background + white text |
| Even rows | white / Odd rows | #F2F2F2 |
| Input cells | #EBF3FB background |

---

## Design Decisions

| Item | Decision | Reason |
|------|----------|--------|
| Image loading | Promise.all parallel | Faster than sequential for many steps |
| Image size | 400pt × 280pt fixed | Per spec, consistent document layout |
| Generation error handling | throw → ExportModal catches | Provides error notification to user |
| Korean font | eastAsia property required | Without it, Korean text renders in wrong font in Word |

---

## Acceptance Criteria

- SAMPLE_DATA group Word file downloads successfully
- Images attached to steps are correctly inserted in Word
- **Korean font 맑은 고딕 verified in Windows Microsoft Word**
- Document structure matches Section 9.2 (cover / summary / step details)
- Steps without images show no image section

---

## Development Notes

- `generateGroupWord` is async — ExportModal must use await + try/catch
- Image ArrayBuffer conversion: `await blob.arrayBuffer()` (cannot be sync)
- Word verification must be done in **Windows Word Desktop** (Word Online renders differently)
- Use `/gen-word-block` then `/spec-review` to check for Korean font omissions

---

## Change Log

| Date | Description |
|------|-------------|
| 2026-03-12 | Initial creation |
| 2026-03-16 | Phase 5 completed — wordExport.js, ExportModal.jsx fully implemented |
| 2026-03-16 | ExportModal document composition section removed per user request |
| 2026-03-16 | Testing completed — all TCs passed. Korean font verified in Word Desktop |

---
---

# Phase 5 — Word 내보내기 `✅ 완료`

> 그룹 내 모든 프로세스를 표지-요약-단계별 상세 구조로 담은 .docx 파일을 브라우저에서 직접 생성한다

**완료일**: 2026-03-16
**상태**: ✅ 완료
**선행 조건**: Phase 4 완료
**주의**: 이 Phase가 가장 복잡하며 별도 품질 검증이 필요하다

---

## 개요

`docx` 라이브러리로 브라우저에서 직접 Word 파일을 생성한다.
이미지는 IndexedDB에서 Blob을 로드한 후 ArrayBuffer로 변환해 삽입한다.
한글 폰트는 `eastAsia` 속성을 명시하지 않으면 깨질 수 있으므로 모든 텍스트 Run에 적용한다.

> `/gen-word-block` 스킬을 활용하여 섹션별 docx 블록 코드를 생성한다.

---

## 완료 예정 / 완료 항목

| # | 작업 | 상태 |
|---|------|------|
| 1 | `wordExport.js` — `generateGroupWord()` 함수 | ✅ |
| 2 | 표지 블록 | ✅ |
| 3 | 그룹 전체 요약 테이블 블록 | ✅ |
| 4 | 프로세스 헤더 + 메타 테이블 블록 | ✅ |
| 5 | 단계 요약 테이블 블록 | ✅ |
| 6 | 단계별 상세 블록 (이미지 삽입 포함) | ✅ |
| 7 | `ExportModal.jsx` (문서 구성 파트 제거됨) | ✅ |
| 8 | Word 생성 실패 처리 | ✅ |

---

## 세부 구현 내용

### generateGroupWord() 전체 흐름

```js
export async function generateGroupWord(group, dept) {
  // 1. 모든 이미지 Blob 병렬 로드
  const allImageIds = group.processes
    .flatMap(p => p.steps).flatMap(s => s.images).map(img => img.id)
  const imageMap = {}
  await Promise.all(allImageIds.map(async id => {
    const record = await loadImage(id)
    if (record) imageMap[id] = record
  }))

  // 2. 문서 섹션 조립
  const doc = new Document({
    sections: [{
      children: [
        ...buildCoverPage(group, dept),        // [1] 표지
        ...buildSummaryTable(group),           // [2] 그룹 요약
        ...group.processes.flatMap((proc, i) => // [3] 프로세스별
          buildProcessSection(proc, i, imageMap, i < group.processes.length - 1)
        )
      ]
    }]
  })

  // 3. Blob 생성 후 다운로드
  const blob = await Packer.toBlob(doc)
  saveAs(blob, `${group.name}_${dept}_매뉴얼.docx`)
}
```

### 한글 폰트 적용 규칙

```js
const koreanFont = { name: "맑은 고딕", eastAsia: "맑은 고딕" }
// 모든 TextRun에 반드시 포함
```

### 이미지 삽입

```js
// IndexedDB Blob → ArrayBuffer → docx ImageRun
const arrayBuffer = await record.blob.arrayBuffer()
new ImageRun({
  data: arrayBuffer,
  transformation: { width: 400, height: 280 },  // pt 단위 고정
  type: imageType,  // 'jpg' or 'png'
})
```

### Word 문서 구성 (Section 9.2 기준)

```
[1] 표지 — 그룹명 (48pt bold navy) + 부서명, 정보 테이블, 문서 관리 테이블
[2] 그룹 전체 요약 — 프로세스 목록 테이블 (No / 프로세스명 / 담당자 / 단계 수 / 설명)
[3] 프로세스별 섹션 (반복)
    [3-1] 프로세스 헤더 — 번호 배너 + 메타 테이블 + 단계 요약 테이블
    [3-2] 단계별 상세 (반복) — 단계명, 메타 행, 이미지, Logic, 주의사항
    프로세스 간 페이지 브레이크 (마지막 제외)
```

---

## 스타일 규칙 (Section 9.3)

| 항목 | 값 |
|------|-----|
| 폰트 전체 | 맑은 고딕 (eastAsia 포함) |
| 페이지 | A4 (11906 × 16838 DXA) |
| 여백 | 상하 1200, 좌우 1100 DXA |
| 레이블 셀 | #2E75B6 배경 + 흰 글자 |
| 헤더 행 | #1F4E79 배경 + 흰 글자 |
| 짝수 행 white / 홀수 행 #F2F2F2 |
| 입력칸 | #EBF3FB 배경 |

---

## 설계 결정 사항

| 항목 | 결정 | 이유 |
|------|------|------|
| 이미지 로드 방식 | Promise.all 병렬 | 단계 많을수록 순차보다 빠름 |
| 이미지 크기 | 400pt × 280pt 고정 | 명세서 기준, 일관된 문서 레이아웃 |
| 생성 실패 처리 | throw → ExportModal에서 catch | 사용자에게 오류 알림 제공 |
| 한글 폰트 | eastAsia 명시 필수 | 미적용 시 Word에서 한글만 다른 폰트 |

---

## 완료 기준

- SAMPLE_DATA 기준 그룹 Word 파일 다운로드 성공
- 실제 이미지 첨부 후 Word 내 이미지 정상 삽입 확인
- **Windows Microsoft Word에서 한글 폰트 맑은 고딕 적용 확인**
- 표지 / 요약 / 단계별 상세 구조 Section 9.2 기준 일치
- 이미지 없는 단계에서 이미지 섹션 미표시 확인

---

## 개발 시 주의사항

- `generateGroupWord`는 async 함수 — ExportModal에서 await + try/catch 필수
- 이미지 ArrayBuffer 변환: `await blob.arrayBuffer()` (동기 불가)
- Word 생성 후 검증은 반드시 **실제 Windows Word Desktop**에서 할 것
- `/gen-word-block` 스킬로 블록 생성 후 `/spec-review` 스킬로 한글 폰트 누락 점검

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-03-12 | 최초 작성 |
| 2026-03-16 | Phase 5 구현 완료 — wordExport.js, ExportModal.jsx 전체 구현 |
| 2026-03-16 | ExportModal 문서 구성 파트 제거 — 사용자 요청 |
| 2026-03-16 | 테스트 완료 — TC 전체 Pass. Word Desktop에서 한글 폰트 정상 확인 |
