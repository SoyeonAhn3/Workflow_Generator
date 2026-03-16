import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, ImageRun,
  VerticalAlign, ShadingType, PageBreak,
} from 'docx'
import { saveAs } from 'file-saver'
import { loadImage } from './imageDB.js'

// ── 한글 폰트 규칙 ──────────────────────────────────────────
const KR = { name: "맑은 고딕", eastAsia: "맑은 고딕" }

// ── 색상 상수 ────────────────────────────────────────────────
const NAVY     = "1F4E79"
const BLUE     = "2E75B6"
const BLUE_PALE = "EBF3FB"
const GRAY100  = "F2F2F2"
const GRAY500  = "595959"
const GRAY700  = "404040"
const WHITE    = "FFFFFF"

// ── 공통 테이블 셀 borders ──────────────────────────────────
const thinBorder = {
  top:    { style: BorderStyle.SINGLE, size: 1, color: "BFBFBF" },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: "BFBFBF" },
  left:   { style: BorderStyle.SINGLE, size: 1, color: "BFBFBF" },
  right:  { style: BorderStyle.SINGLE, size: 1, color: "BFBFBF" },
}

// ── 헬퍼: 텍스트 Run ────────────────────────────────────────
function txt(text, opts = {}) {
  return new TextRun({ text, font: KR, ...opts })
}

// ── 헬퍼: 라벨 셀 (파란 배경 + 흰 글자) ─────────────────────
function labelCell(text, width) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: { type: ShadingType.CLEAR, fill: BLUE, color: WHITE },
    verticalAlign: VerticalAlign.CENTER,
    borders: thinBorder,
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [txt(text, { bold: true, size: 20, color: WHITE })],
    })],
  })
}

// ── 헬퍼: 값 셀 ─────────────────────────────────────────────
function valueCell(text, width, opts = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: opts.fill
      ? { type: ShadingType.CLEAR, fill: opts.fill }
      : undefined,
    verticalAlign: VerticalAlign.CENTER,
    borders: thinBorder,
    children: [new Paragraph({
      alignment: opts.align || AlignmentType.LEFT,
      indent: { left: 80 },
      children: [txt(text || '—', {
        size: opts.size || 20,
        color: opts.color || GRAY700,
        bold: opts.bold || false,
      })],
    })],
  })
}

// ── 헬퍼: 헤더 행 셀 (navy 배경) ────────────────────────────
function headerCell(text, width) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: { type: ShadingType.CLEAR, fill: NAVY, color: WHITE },
    verticalAlign: VerticalAlign.CENTER,
    borders: thinBorder,
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [txt(text, { bold: true, size: 18, color: WHITE })],
    })],
  })
}

// ══════════════════════════════════════════════════════════════
// [1] 표지 블록
// ══════════════════════════════════════════════════════════════
function buildCoverPage(group, deptName) {
  const totalProcs = group.processes.length
  const totalSteps = group.processes.reduce((s, p) => s + (p.steps?.length || 0), 0)
  const now = new Date()
  const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}`

  return [
    // 빈 공간
    new Paragraph({ spacing: { before: 2400 } }),

    // 그룹명 (48pt bold navy)
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [txt(group.name, { bold: true, size: 96, color: NAVY })],
    }),

    // 부서명 (20pt)
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 800 },
      children: [txt(deptName, { size: 40, color: GRAY500 })],
    }),

    // 정보 테이블
    new Table({
      width: { size: 7000, type: WidthType.DXA },
      alignment: AlignmentType.CENTER,
      rows: [
        new TableRow({ children: [labelCell("담당 부서", 2200), valueCell(deptName, 4800)] }),
        new TableRow({ children: [labelCell("총 프로세스", 2200), valueCell(`${totalProcs}개`, 4800)] }),
        new TableRow({ children: [labelCell("총 단계", 2200), valueCell(`${totalSteps}개`, 4800)] }),
        new TableRow({ children: [labelCell("업데이트", 2200), valueCell(dateStr, 4800)] }),
      ],
    }),

    new Paragraph({ spacing: { before: 400 } }),

    // 문서 관리 테이블
    new Table({
      width: { size: 7000, type: WidthType.DXA },
      alignment: AlignmentType.CENTER,
      rows: [
        new TableRow({ children: [labelCell("문서관리번호", 2200), valueCell("", 4800, { fill: BLUE_PALE })] }),
        new TableRow({ children: [labelCell("비밀구분", 2200), valueCell("", 4800, { fill: BLUE_PALE })] }),
        new TableRow({ children: [labelCell("작성자", 2200), valueCell("", 4800, { fill: BLUE_PALE })] }),
      ],
    }),

    new Paragraph({ spacing: { before: 600 } }),

    // 하단 안내
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [txt("ProcessFlow 자동 생성 | 무단 복사 및 배포 금지", { size: 16, color: GRAY500, italics: true })],
    }),
  ]
}

// ══════════════════════════════════════════════════════════════
// [2] 그룹 전체 요약 테이블
// ══════════════════════════════════════════════════════════════
function buildSummaryTable(group) {
  const colWidths = [800, 3000, 1500, 1200, 3200]

  const headerRow = new TableRow({
    children: [
      headerCell("No", colWidths[0]),
      headerCell("프로세스명", colWidths[1]),
      headerCell("담당자", colWidths[2]),
      headerCell("단계 수", colWidths[3]),
      headerCell("설명", colWidths[4]),
    ],
  })

  const dataRows = group.processes.map((proc, i) => {
    const isOdd = i % 2 === 1
    const fill = isOdd ? GRAY100 : undefined
    return new TableRow({
      children: [
        valueCell(`${i + 1}`, colWidths[0], { align: AlignmentType.CENTER, fill }),
        valueCell(proc.name, colWidths[1], { bold: true, fill }),
        valueCell(proc.owner, colWidths[2], { align: AlignmentType.CENTER, fill }),
        valueCell(`${proc.steps?.length || 0}개`, colWidths[3], { align: AlignmentType.CENTER, fill }),
        valueCell(proc.description, colWidths[4], { size: 18, fill }),
      ],
    })
  })

  return [
    new Paragraph({
      spacing: { after: 300 },
      children: [txt("그룹 전체 프로세스 목록", { bold: true, size: 28, color: NAVY })],
    }),
    new Table({
      width: { size: 9700, type: WidthType.DXA },
      rows: [headerRow, ...dataRows],
    }),
  ]
}

// ══════════════════════════════════════════════════════════════
// [3] 프로세스별 섹션
// ══════════════════════════════════════════════════════════════
async function buildProcessSection(proc, procIdx, imageMap, addPageBreak) {
  const children = []

  // ── 프로세스 헤더 배너 ─────────────────────────────────────
  children.push(
    new Table({
      width: { size: 9700, type: WidthType.DXA },
      rows: [new TableRow({
        children: [
          new TableCell({
            width: { size: 600, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: NAVY },
            verticalAlign: VerticalAlign.CENTER,
            borders: thinBorder,
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [txt(`${procIdx + 1}`, { bold: true, size: 24, color: WHITE })],
            })],
          }),
          new TableCell({
            width: { size: 9100, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: BLUE_PALE },
            verticalAlign: VerticalAlign.CENTER,
            borders: thinBorder,
            children: [new Paragraph({
              indent: { left: 120 },
              children: [txt(proc.name, { bold: true, size: 24, color: NAVY })],
            })],
          }),
        ],
      })],
    })
  )

  // 설명
  if (proc.description) {
    children.push(new Paragraph({
      spacing: { before: 160, after: 160 },
      children: [txt(proc.description, { size: 20, color: GRAY500 })],
    }))
  }

  // ── 메타 테이블 ────────────────────────────────────────────
  children.push(new Table({
    width: { size: 9700, type: WidthType.DXA },
    rows: [
      new TableRow({ children: [
        labelCell("담당 부서", 2400), valueCell(proc.dept, 2450),
        labelCell("담당자", 2400), valueCell(proc.owner, 2450),
      ]}),
      new TableRow({ children: [
        labelCell("총 단계", 2400), valueCell(`${proc.steps?.length || 0}개`, 2450),
        labelCell("모듈", 2400), valueCell(proc.module, 2450),
      ]}),
    ],
  }))

  children.push(new Paragraph({ spacing: { before: 300 } }))

  // ── 단계 요약 테이블 ──────────────────────────────────────
  const stepColW = [700, 2600, 2200, 1200, 3000]
  const stepHeaderRow = new TableRow({
    children: [
      headerCell("No", stepColW[0]),
      headerCell("단계명", stepColW[1]),
      headerCell("화면명", stepColW[2]),
      headerCell("PT", stepColW[3]),
      headerCell("Logic 요약", stepColW[4]),
    ],
  })

  const stepDataRows = (proc.steps || []).map((step, i) => {
    const isOdd = i % 2 === 1
    const fill = isOdd ? GRAY100 : undefined
    const logicSummary = (step.logic || '').split('\n')[0] || ''
    return new TableRow({
      children: [
        valueCell(`${i + 1}`, stepColW[0], { align: AlignmentType.CENTER, fill }),
        valueCell(step.title, stepColW[1], { bold: true, fill }),
        valueCell(step.screenName, stepColW[2], { align: AlignmentType.CENTER, fill }),
        valueCell(step.pt, stepColW[3], { align: AlignmentType.CENTER, fill }),
        valueCell(logicSummary, stepColW[4], { size: 18, fill }),
      ],
    })
  })

  children.push(new Table({
    width: { size: 9700, type: WidthType.DXA },
    rows: [stepHeaderRow, ...stepDataRows],
  }))

  children.push(new Paragraph({ spacing: { before: 120 } }))

  // ── 단계별 상세 ────────────────────────────────────────────
  for (let si = 0; si < (proc.steps || []).length; si++) {
    const step = proc.steps[si]

    // 단계 타이틀: N. 단계명
    children.push(new Paragraph({
      spacing: { before: 200, after: 120 },
      children: [
        txt(`${si + 1}. `, { bold: true, size: 24, color: BLUE }),
        txt(step.title, { bold: true, size: 24, color: NAVY }),
      ],
    }))

    // 메타 행 (화면명 / 담당부서 / PT)
    children.push(new Table({
      width: { size: 9700, type: WidthType.DXA },
      rows: [new TableRow({ children: [
        labelCell("화면명 (T-Code)", 2400),
        valueCell(step.screenName, 1800, { fill: BLUE_PALE, bold: true }),
        labelCell("담당 부서", 1600),
        valueCell(step.dept, 1500),
        labelCell("PT", 1000),
        valueCell(step.pt, 1400),
      ]})],
    }))

    // 이미지 삽입 (있을 때만)
    const stepImages = step.images || []
    for (const img of stepImages) {
      const record = imageMap[img.id]
      if (!record) continue
      try {
        const arrayBuffer = await record.blob.arrayBuffer()
        const uint8 = new Uint8Array(arrayBuffer)
        // MIME → docx 이미지 타입 매핑
        const mimeType = record.blob.type || ''
        const typeMap = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/bmp': 'bmp' }
        const imgType = typeMap[mimeType] || 'png'
        children.push(new Paragraph({
          spacing: { before: 200, after: 200 },
          alignment: AlignmentType.CENTER,
          children: [new ImageRun({
            data: uint8,
            transformation: { width: 400, height: 280 },
            type: imgType,
          })],
        }))
      } catch {
        // 이미지 로드 실패 시 건너뜀
      }
    }

    // Logic 섹션
    if (step.logic) {
      children.push(new Paragraph({
        spacing: { before: 200, after: 80 },
        children: [txt(`${si + 1}. Logic`, { bold: true, size: 22, color: NAVY })],
      }))
      // logic 줄별 분리
      const logicLines = step.logic.split('\n')
      for (const line of logicLines) {
        children.push(new Paragraph({
          spacing: { after: 40 },
          indent: { left: 240 },
          children: [txt(line, { size: 20, color: GRAY700 })],
        }))
      }
    }

    // 주의사항 (있을 때만)
    if (step.warning) {
      children.push(new Table({
        width: { size: 9700, type: WidthType.DXA },
        rows: [new TableRow({ children: [
          new TableCell({
            width: { size: 9700, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: GRAY100 },
            borders: thinBorder,
            children: [new Paragraph({
              indent: { left: 120 },
              spacing: { before: 60, after: 60 },
              children: [
                txt("⚠ 주의: ", { bold: true, size: 20, color: "D97706" }),
                txt(step.warning, { size: 20, color: GRAY700 }),
              ],
            })],
          }),
        ]})],
      }))
    }

    // 단계 간 구분선 (마지막 단계 제외)
    if (si < (proc.steps || []).length - 1) {
      children.push(new Paragraph({
        spacing: { before: 100, after: 100 },
        borders: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "BFBFBF", space: 1 } },
      }))
    }
  }

  // 프로세스 간 페이지 브레이크 (마지막 제외)
  if (addPageBreak) {
    children.push(new Paragraph({ children: [new PageBreak()] }))
  }

  return children
}

// ══════════════════════════════════════════════════════════════
// 메인 함수 — generateGroupWord
// ══════════════════════════════════════════════════════════════
export async function generateGroupWord(group, deptName) {
  // 1. 모든 이미지 Blob 병렬 로드
  const allImageIds = (group.processes || [])
    .flatMap((p) => p.steps || [])
    .flatMap((s) => s.images || [])
    .map((img) => img.id)

  const imageMap = {}
  await Promise.all(
    allImageIds.map(async (id) => {
      const record = await loadImage(id)
      if (record) imageMap[id] = record
    })
  )

  // 2. 문서 섹션 조립
  const sectionChildren = [
    ...buildCoverPage(group, deptName),
    new Paragraph({ children: [new PageBreak()] }),
    ...buildSummaryTable(group),
    new Paragraph({ children: [new PageBreak()] }),
  ]

  // 프로세스별 섹션 (await 필요 — 이미지 ArrayBuffer)
  for (let i = 0; i < group.processes.length; i++) {
    const proc = group.processes[i]
    const addBreak = i < group.processes.length - 1
    const procChildren = await buildProcessSection(proc, i, imageMap, addBreak)
    sectionChildren.push(...procChildren)
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1200, bottom: 1200, left: 1100, right: 1100 },
        },
      },
      children: sectionChildren,
    }],
  })

  // 3. Blob 생성 후 다운로드
  const blob = await Packer.toBlob(doc)
  saveAs(blob, `${group.name}_${deptName}_매뉴얼.docx`)
}
