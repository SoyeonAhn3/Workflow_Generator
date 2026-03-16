# Phase 5 — Word 내보내기 `✅ 완료`

> 그룹 내 모든 프로세스를 표지-요약-단계별 상세 구조로 담은 .docx 파일을 브라우저에서 직접 생성한다

**상태**: ✅ 완료 (2026-03-16)
**선행 조건**: Phase 4 완료
**주의**: 이 Phase가 가장 복잡하며 별도 품질 검증이 필요하다

---

## 개요

`docx` 라이브러리로 브라우저에서 직접 Word 파일을 생성한다.
이미지는 IndexedDB에서 Blob을 로드한 후 ArrayBuffer로 변환해 삽입한다.
한글 폰트는 `eastAsia` 속성을 명시하지 않으면 깨질 수 있으므로 모든 텍스트 Run에 적용한다.

> `/gen-word-block` 스킬을 활용하여 섹션별 docx 블록 코드를 생성한다.

---

## 완료 예정 항목

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
import { Document, Packer, ... } from 'docx'
import { saveAs } from 'file-saver'
import { loadImage } from './imageDB'

export async function generateGroupWord(group, dept) {
  try {
    // 1. 모든 이미지 Blob 병렬 로드
    const allImageIds = group.processes
      .flatMap(p => p.steps)
      .flatMap(s => s.images)
      .map(img => img.id)
    const imageMap = {}
    await Promise.all(allImageIds.map(async id => {
      const record = await loadImage(id)
      if (record) imageMap[id] = record
    }))

    // 2. 문서 섹션 조립
    const doc = new Document({
      sections: [{
        properties: { page: { size: { width: 11906, height: 16838 } } },
        children: [
          ...buildCoverPage(group, dept),            // [1] 표지
          new Paragraph({ pageBreakBefore: true }),
          ...buildSummaryTable(group),               // [2] 그룹 요약
          new Paragraph({ pageBreakBefore: true }),
          ...group.processes.flatMap((proc, i) =>    // [3] 프로세스별
            buildProcessSection(proc, i, imageMap,
              i < group.processes.length - 1)        // 마지막 제외 페이지 브레이크
          )
        ]
      }]
    })

    // 3. Blob 생성 후 다운로드
    const blob = await Packer.toBlob(doc)
    saveAs(blob, `${group.name}_${dept}_매뉴얼.docx`)
  } catch (err) {
    console.error("Word 생성 실패:", err)
    throw err  // ExportModal에서 catch하여 사용자에게 알림
  }
}
```

### 한글 폰트 적용 규칙

```js
// 모든 텍스트 Run에 반드시 포함
const koreanFont = { name: "맑은 고딕", eastAsia: "맑은 고딕" }

new TextRun({
  text: "단계명",
  font: koreanFont,
  size: 24,
  bold: true,
})
```

### 이미지 삽입

```js
// IndexedDB Blob → ArrayBuffer → docx ImageRun
const record = imageMap[image.id]  // { blob, name }
const arrayBuffer = await record.blob.arrayBuffer()
const ext = record.name.split('.').pop().toLowerCase()
const imageType = (ext === 'jpg' || ext === 'jpeg') ? 'jpg' : 'png'

new ImageRun({
  data: arrayBuffer,
  transformation: { width: 400, height: 280 },  // pt 단위 고정
  type: imageType,
})
```

### Word 문서 구성 (Section 9.2 기준)

```
[1] 표지
    그룹명 (48pt bold navy) + 부서명
    정보 테이블 (담당 부서 / 총 프로세스 수 / 총 단계 수 / 업데이트)
    문서 관리 테이블 (문서관리번호 / 비밀구분 등 입력칸)
    "ProcessFlow 자동 생성 | 무단 복사 및 배포 금지"
    페이지 브레이크

[2] 그룹 전체 요약
    "그룹 전체 프로세스 목록" 타이틀
    요약 테이블: No / 프로세스명 / 담당자 / 단계 수 / 설명
    페이지 브레이크

[3] 프로세스별 섹션 (반복)
    [3-1] 프로세스 헤더
          번호 + 프로세스명 배너 (navy 뱃지 + bluePale 배경)
          설명 텍스트
          메타 테이블 (담당 부서 / 담당자 / 총 단계)
          단계 요약 테이블 (No / 단계명 / 화면명 / PT / Logic 요약)
    [3-2] 단계별 상세 (반복)
          N. 단계명 (blue 번호 + navy 제목)
          메타 행 (화면명 bluePale 강조 / 담당 부서 / PT)
          이미지 삽입 (images > 0 인 경우만)
          N. Logic 섹션
          주의사항 (warning 있으면, gray 배경)
          구분선
    프로세스 간 페이지 브레이크 (마지막 제외)
```

### ExportModal.jsx

```
포함 프로세스 목록: 번호 + 이름 + 담당자 + 단계 수 + ✓ 체크
문서 구성 안내: "표지 → 요약 → 프로세스1 → 프로세스2 → ..."
[닫기] [📥 Word 파일 다운로드]
다운로드 중: 버튼 비활성화 + 로딩 표시
실패 시: "생성 중 오류가 발생했습니다. 다시 시도해 주세요."
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
| 짝수 행 | 흰 배경 / 홀수 행 | #F2F2F2 배경 |
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
- Word 생성 후 검증은 반드시 **실제 Windows Word Desktop**에서 할 것 (Word Online은 렌더링 차이 있음)
- `/gen-word-block` 스킬로 블록 생성 후 `/spec-review` 스킬로 한글 폰트 누락 점검

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-03-12 | 최초 작성 |
| 2026-03-16 | Phase 5 구현 완료 — wordExport.js, ExportModal.jsx 전체 구현. 이미지 IndexedDB → ArrayBuffer → docx ImageRun 정상 동작 확인 |
| 2026-03-16 | ExportModal 문서 구성 파트 제거 — 사용자 요청, 불필요한 구성 안내 섹션 삭제. 포함 프로세스 목록 + 다운로드 버튼만 유지 |
| 2026-03-16 | 테스트 완료 — TC 전체 Pass (공백 이슈 수정 포함). Word Desktop에서 한글 폰트 정상 확인 |
