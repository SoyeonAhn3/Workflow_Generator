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
const NAVY       = "1F4E79"
const BLUE       = "2E75B6"
const BLUE_PALE  = "EBF3FB"
const GRAY100    = "F2F2F2"
const GRAY500    = "595959"
const GRAY700    = "404040"
const WHITE      = "FFFFFF"
const YELLOW_BG  = "FFFBEB"
const WARNING_TXT = "B45309"

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

    // 부서명 + 자동생성 안내 (v7 스타일)
    new Paragraph({
      spacing: { after: 800 },
      children: [txt(`${deptName}  |  ProcessFlow 자동 생성 매뉴얼`, { size: 26, color: GRAY500 })],
    }),

    // 정보 테이블 (v7: 1800 + 3400)
    new Table({
      width: { size: 5200, type: WidthType.DXA },
      alignment: AlignmentType.CENTER,
      rows: [
        new TableRow({ children: [labelCell("담당 부서", 1800), valueCell(deptName, 3400)] }),
        new TableRow({ children: [labelCell("총 프로세스", 1800), valueCell(`${totalProcs}개`, 3400)] }),
        new TableRow({ children: [labelCell("총 단계", 1800), valueCell(`${totalSteps}개`, 3400)] }),
        new TableRow({ children: [labelCell("업데이트", 1800), valueCell(dateStr, 3400)] }),
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
      spacing: { after: 200 },
      children: [txt("그룹 전체 프로세스 목록", { bold: true, size: 28, color: NAVY })],
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [txt(`${group.processes.length}개 프로세스  ·  총 ${group.processes.reduce((s, p) => s + (p.steps?.length || 0), 0)}단계`, { size: 20, color: GRAY500 })],
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

  // ── 프로세스 헤더 배너 (v7: 번호 + 이름 | 설명) ─────────────
  const procTitleText = proc.description
    ? `${proc.name}\n${proc.description}`
    : proc.name
  const procTitleChildren = [
    new Paragraph({
      indent: { left: 120 },
      children: [txt(proc.name, { bold: true, size: 24, color: NAVY })],
    }),
  ]
  if (proc.description) {
    procTitleChildren.push(new Paragraph({
      indent: { left: 120 },
      children: [txt(proc.description, { size: 18, color: GRAY500 })],
    }))
  }
  children.push(
    new Table({
      width: { size: 9700, type: WidthType.DXA },
      rows: [new TableRow({
        children: [
          new TableCell({
            width: { size: 560, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: NAVY },
            verticalAlign: VerticalAlign.CENTER,
            borders: thinBorder,
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [txt(`${procIdx + 1}`, { bold: true, size: 24, color: WHITE })],
            })],
          }),
          new TableCell({
            width: { size: 8466, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: BLUE_PALE },
            verticalAlign: VerticalAlign.CENTER,
            borders: thinBorder,
            children: procTitleChildren,
          }),
        ],
      })],
    })
  )

  // ── 메타 테이블 (v7: 3쌍, 1행) ──────────────────────────────
  children.push(new Table({
    width: { size: 9700, type: WidthType.DXA },
    rows: [new TableRow({ children: [
      labelCell("담당 부서", 1300), valueCell(proc.dept, 2100),
      labelCell("담당자", 1300), valueCell(proc.owner, 1500),
      labelCell("총 단계", 1300), valueCell(`${proc.steps?.length || 0}개`, 1526),
    ]})],
  }))

  children.push(new Paragraph({ spacing: { before: 300 } }))

  // ── 단계 요약 테이블 ──────────────────────────────────────
  const stepColW = [500, 2500, 1700, 1000, 3326]
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

  // ── 단계별 상세 (v7 스타일) ─────────────────────────────────
  for (let si = 0; si < (proc.steps || []).length; si++) {
    const step = proc.steps[si]

    // ① 단계 타이틀 배너 (navy 번호 + blue_pale 제목)
    children.push(new Table({
      width: { size: 9700, type: WidthType.DXA },
      rows: [new TableRow({ children: [
        new TableCell({
          width: { size: 560, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: NAVY },
          verticalAlign: VerticalAlign.CENTER,
          borders: thinBorder,
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [txt(`${si + 1}`, { bold: true, size: 22, color: WHITE })],
          })],
        }),
        new TableCell({
          width: { size: 8466, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: BLUE_PALE },
          verticalAlign: VerticalAlign.CENTER,
          borders: thinBorder,
          children: [new Paragraph({
            indent: { left: 120 },
            children: [txt(step.title, { bold: true, size: 22, color: NAVY })],
          })],
        }),
      ]})],
    }))

    // ② 메타 행 (화면명 / 담당부서 / PT — v7 너비)
    children.push(new Table({
      width: { size: 9700, type: WidthType.DXA },
      rows: [new TableRow({ children: [
        labelCell("화면명", 1400),
        valueCell(step.screenName, 1900, { fill: BLUE_PALE, bold: true }),
        labelCell("담당 부서", 1200),
        valueCell(step.dept, 1500),
        labelCell("PT", 1000),
        valueCell(step.pt, 2026),
      ]})],
    }))

    // ③ 참고 이미지 (v7: 2행 1열 테이블 — 헤더행 GRAY100 + 내용행 WHITE)
    const stepImages = step.images || []
    if (stepImages.length > 0) {
      const imgParagraphs = []
      for (const img of stepImages) {
        const record = imageMap[img.id]
        if (!record) continue
        try {
          const arrayBuffer = await record.blob.arrayBuffer()
          const uint8 = new Uint8Array(arrayBuffer)
          const mimeType = record.blob.type || ''
          const typeMap = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/bmp': 'bmp' }
          const imgType = typeMap[mimeType] || 'png'
          imgParagraphs.push(new Paragraph({
            spacing: { before: 100, after: 100 },
            alignment: AlignmentType.CENTER,
            children: [new ImageRun({
              data: uint8,
              transformation: { width: 420, height: 280 },
              type: imgType,
            })],
          }))
        } catch {
          // 이미지 로드 실패 시 건너뜀
        }
      }
      if (imgParagraphs.length > 0) {
        children.push(new Table({
          width: { size: 9700, type: WidthType.DXA },
          rows: [
            new TableRow({ children: [
              new TableCell({
                width: { size: 9026, type: WidthType.DXA },
                shading: { type: ShadingType.CLEAR, fill: GRAY100 },
                borders: thinBorder,
                children: [new Paragraph({
                  indent: { left: 120 },
                  children: [txt("▎ 참고 이미지", { bold: true, size: 20, color: GRAY500 })],
                })],
              }),
            ]}),
            new TableRow({ children: [
              new TableCell({
                width: { size: 9026, type: WidthType.DXA },
                borders: thinBorder,
                children: imgParagraphs,
              }),
            ]}),
          ],
        }))
      }
    }

    // ④ Logic (v7: 2행 1열 테이블 — 헤더행 BLUE_PALE + 내용행 WHITE)
    if (step.logic) {
      const logicLines = step.logic.split('\n')
      const logicParagraphs = logicLines.map((line) => new Paragraph({
        spacing: { after: 40 },
        indent: { left: 160 },
        children: [txt(line, { size: 20, color: GRAY700 })],
      }))

      children.push(new Table({
        width: { size: 9700, type: WidthType.DXA },
        rows: [
          new TableRow({ children: [
            new TableCell({
              width: { size: 9026, type: WidthType.DXA },
              shading: { type: ShadingType.CLEAR, fill: BLUE_PALE },
              borders: thinBorder,
              children: [new Paragraph({
                indent: { left: 120 },
                children: [txt(`▎ ${si + 1}.  Logic`, { bold: true, size: 20, color: NAVY })],
              })],
            }),
          ]}),
          new TableRow({ children: [
            new TableCell({
              width: { size: 9026, type: WidthType.DXA },
              borders: thinBorder,
              children: [
                new Paragraph({ spacing: { before: 60 } }),
                ...logicParagraphs,
                new Paragraph({ spacing: { after: 60 } }),
              ],
            }),
          ]}),
        ],
      }))
    }

    // ⑤ 주의사항 (v7: 1행 1열, 전체 FFFBEB 배경)
    if (step.warning) {
      children.push(new Table({
        width: { size: 9700, type: WidthType.DXA },
        rows: [new TableRow({ children: [
          new TableCell({
            width: { size: 9026, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: YELLOW_BG },
            borders: thinBorder,
            children: [new Paragraph({
              indent: { left: 120 },
              spacing: { before: 60, after: 60 },
              children: [
                txt("⚠  주의: ", { bold: true, size: 20, color: WARNING_TXT }),
                txt(step.warning, { size: 20, color: GRAY700 }),
              ],
            })],
          }),
        ]})],
      }))
    }

    // 단계 간 여백
    if (si < (proc.steps || []).length - 1) {
      children.push(new Paragraph({ spacing: { before: 160, after: 80 } }))
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
