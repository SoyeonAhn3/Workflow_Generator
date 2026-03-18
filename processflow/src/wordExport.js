import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, ImageRun,
  VerticalAlign, ShadingType, PageBreak,
} from 'docx'
import { saveAs } from 'file-saver'
import { loadImage } from './imageDB.js'

// ── 폰트 ──────────────────────────────────────────────────────
const KR = { name: "맑은 고딕", eastAsia: "맑은 고딕" }

// ── 색상 (v7 실측) ───────────────────────────────────────────
const NAVY       = "1F4E79"
const BLUE       = "2E75B6"
const BLUE_PALE  = "EBF3FB"
const GRAY100    = "F2F2F2"
const GRAY500    = "595959"
const GRAY700    = "404040"
const WHITE      = "FFFFFF"
const YELLOW_BG  = "FFFBEB"
const YELLOW_BDR = "FDE68A"
const WARNING_TXT = "92400E"
const PLACEHOLDER = "9DB8D9"
const LIGHT_GRAY = "A6A6A6"
const IMG_BDR    = "EBEBEB"
const AAAAAA     = "AAAAAA"

// ── 전체 콘텐츠 테이블 너비 ──────────────────────────────────
const TABLE_W = 9026

// ── 셀 여백 (v7 실측) ───────────────────────────────────────
const m = WidthType.DXA
const STD_M = { top: 90, left: 150, bottom: 90, right: 120, marginUnitType: m }
const HDR_M = { top: 100, left: 150, bottom: 100, right: 120, marginUnitType: m }

// ── 테이블 레벨 외곽선 ──────────────────────────────────────
const TBL_BDR = {
  top:              { style: BorderStyle.SINGLE, size: 4, color: "auto" },
  bottom:           { style: BorderStyle.SINGLE, size: 4, color: "auto" },
  left:             { style: BorderStyle.SINGLE, size: 4, color: "auto" },
  right:            { style: BorderStyle.SINGLE, size: 4, color: "auto" },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "auto" },
  insideVertical:   { style: BorderStyle.SINGLE, size: 4, color: "auto" },
}

// ── 셀 테두리 ───────────────────────────────────────────────
function mkBdr(color, size = 1) {
  const b = { style: BorderStyle.SINGLE, size, color }
  return { top: b, bottom: b, left: b, right: b }
}
const grayBdr  = mkBdr("BFBFBF")
const blueBdr  = mkBdr(BLUE)
const navyBdr  = mkBdr(NAVY)
const noneBdr  = (() => {
  const b = { style: BorderStyle.NONE, size: 0, color: WHITE }
  return { top: b, bottom: b, left: b, right: b }
})()
// 경고 셀: 좌 두꺼운 92400E / 나머지 FDE68A
const warnBdr = {
  top:    { style: BorderStyle.SINGLE, size: 1, color: YELLOW_BDR },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: YELLOW_BDR },
  left:   { style: BorderStyle.SINGLE, size: 8, color: WARNING_TXT },
  right:  { style: BorderStyle.SINGLE, size: 1, color: YELLOW_BDR },
}
// 이미지 헤더: top/left/right = EBEBEB, bottom = none
const imgHdrBdr = {
  top:    { style: BorderStyle.SINGLE, size: 1, color: IMG_BDR },
  bottom: { style: BorderStyle.NONE,   size: 0, color: WHITE },
  left:   { style: BorderStyle.SINGLE, size: 1, color: IMG_BDR },
  right:  { style: BorderStyle.SINGLE, size: 1, color: IMG_BDR },
}
// 이미지 콘텐츠: top = none, left/bottom/right = EBEBEB
const imgBodyBdr = {
  top:    { style: BorderStyle.NONE,   size: 0, color: WHITE },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: IMG_BDR },
  left:   { style: BorderStyle.SINGLE, size: 1, color: IMG_BDR },
  right:  { style: BorderStyle.SINGLE, size: 1, color: IMG_BDR },
}

// ── TextRun 헬퍼 ────────────────────────────────────────────
function txt(text, opts = {}) {
  return new TextRun({ text, font: KR, ...opts })
}

// ── 테이블 간 구분 단락 (after=60) ─────────────────────────
function gap() { return new Paragraph({ spacing: { after: 60 } }) }

// ── 파란 라벨 셀 (fill 2E75B6, 흰 글자) ────────────────────
function labelCell(text, width) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: { type: ShadingType.CLEAR, fill: BLUE, color: WHITE },
    verticalAlign: VerticalAlign.CENTER,
    borders: blueBdr,
    margins: STD_M,
    children: [new Paragraph({
      spacing: { after: 100, before: 0 },
      alignment: AlignmentType.LEFT,
      children: [txt(text, { bold: true, size: 17, color: WHITE })],
    })],
  })
}

// ── 네이비 헤더 셀 (fill 1F4E79) ───────────────────────────
function headerCell(text, width) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: { type: ShadingType.CLEAR, fill: NAVY, color: WHITE },
    verticalAlign: VerticalAlign.CENTER,
    borders: navyBdr,
    margins: HDR_M,
    children: [new Paragraph({
      spacing: { after: 100, before: 0 },
      alignment: AlignmentType.CENTER,
      children: [txt(text, { bold: true, size: 18, color: WHITE })],
    })],
  })
}

// ── 값 셀 ───────────────────────────────────────────────────
function valueCell(text, width, opts = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: opts.fill
      ? { type: ShadingType.CLEAR, fill: opts.fill }
      : undefined,
    verticalAlign: VerticalAlign.CENTER,
    borders: grayBdr,
    margins: STD_M,
    children: [new Paragraph({
      spacing: { after: 100, before: 0 },
      alignment: opts.align || AlignmentType.LEFT,
      children: [txt(text || '—', {
        size: opts.size || 18,
        color: opts.color || GRAY700,
        bold: opts.bold || false,
        italics: opts.italics || false,
      })],
    })],
  })
}

// ── placeholder 셀 (EBF3FB + 이탤릭 9DB8D9) ────────────────
function placeholderCell(text, width) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: { type: ShadingType.CLEAR, fill: BLUE_PALE },
    verticalAlign: VerticalAlign.CENTER,
    borders: grayBdr,
    margins: STD_M,
    children: [new Paragraph({
      spacing: { after: 100, before: 0 },
      children: [txt(text, { size: 18, color: PLACEHOLDER, italics: true })],
    })],
  })
}

// ══════════════════════════════════════════════════════════════
// [1] 표지
// ══════════════════════════════════════════════════════════════
function buildCoverPage(group, deptName) {
  const totalProcs = group.processes.length
  const totalSteps = group.processes.reduce((s, p) => s + (p.steps?.length || 0), 0)
  const now = new Date()
  const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}`

  // 기본 정보 (5200 = 1800+3400)
  const infoTable = new Table({
    width: { size: 5200, type: WidthType.DXA },
    borders: TBL_BDR,
    rows: [
      new TableRow({ children: [labelCell("담당 부서", 1800), valueCell(deptName, 3400)] }),
      new TableRow({ children: [labelCell("총 프로세스", 1800), valueCell(`${totalProcs}개`, 3400)] }),
      new TableRow({ children: [labelCell("총 단계", 1800), valueCell(`${totalSteps}단계`, 3400)] }),
      new TableRow({ children: [labelCell("업데이트", 1800), valueCell(dateStr, 3400)] }),
    ],
  })

  // 문서관리 중첩 테이블 (좌: 4200, 우: 4200)
  const leftDoc = new Table({
    width: { size: 4200, type: WidthType.DXA },
    borders: TBL_BDR,
    rows: [
      new TableRow({ children: [labelCell("문서관리번호", 1700), placeholderCell("(직접 입력)", 2500)] }),
      new TableRow({ children: [
        new TableCell({
          width: { size: 4200, type: WidthType.DXA }, columnSpan: 2,
          shading: { type: ShadingType.CLEAR, fill: GRAY100 },
          borders: grayBdr,
          margins: { top: 100, left: 140, bottom: 100, right: 140, marginUnitType: m },
          children: [new Paragraph({
            spacing: { after: 100, before: 0 }, alignment: AlignmentType.CENTER,
            children: [txt("본 문서는 임의로 복사되거나 배포할 수 없음", { size: 17, color: GRAY500 })],
          })],
        }),
      ] }),
      new TableRow({ children: [labelCell("배포번호", 1700), placeholderCell("(직접 입력)", 2500)] }),
    ],
  })
  const rightDoc = new Table({
    width: { size: 4200, type: WidthType.DXA },
    borders: TBL_BDR,
    rows: [
      new TableRow({ children: [labelCell("비밀 구분", 1700), placeholderCell("(직접 입력)", 2500)] }),
      new TableRow({ children: [labelCell("Controlled Copy", 1700), placeholderCell("(직접 입력)", 2500)] }),
    ],
  })
  const docMgmt = new Table({
    width: { size: TABLE_W, type: WidthType.DXA },
    borders: TBL_BDR,
    rows: [new TableRow({ children: [
      new TableCell({ width: { size: 4200, type: WidthType.DXA }, borders: noneBdr, children: [leftDoc] }),
      new TableCell({ width: { size: 626, type: WidthType.DXA }, borders: noneBdr, children: [new Paragraph({})] }),
      new TableCell({ width: { size: 4200, type: WidthType.DXA }, borders: noneBdr, children: [rightDoc] }),
    ] })],
  })

  return [
    new Paragraph({ spacing: { before: 2400 } }),
    new Paragraph({
      spacing: { after: 80 },
      children: [txt(group.name, { bold: true, size: 52, color: NAVY })],
    }),
    new Paragraph({
      spacing: { after: 100 },
      children: [txt(`${deptName}  |  ProcessFlow 자동 생성 매뉴얼`, { size: 20, color: GRAY500 })],
    }),
    gap(), gap(), gap(),
    infoTable,
    gap(), gap(), gap(), gap(), gap(), gap(),
    docMgmt,
    gap(), gap(), gap(), gap(), gap(), gap(),
    // 하단 안내 (sz=16, color=A6A6A6)
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { after: 100 },
      children: [txt("ProcessFlow 자동 생성  |  무단 복사 및 배포 금지", { size: 16, color: LIGHT_GRAY })],
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ]
}

// ══════════════════════════════════════════════════════════════
// [2] 요약 테이블
// ══════════════════════════════════════════════════════════════
function buildSummaryTable(group, deptName) {
  const colW = [600, 2800, 1400, 1000, 3226]
  const totalSteps = group.processes.reduce((s, p) => s + (p.steps?.length || 0), 0)

  const hdrRow = new TableRow({
    children: [
      headerCell("No", colW[0]),
      headerCell("프로세스명", colW[1]),
      headerCell("담당자", colW[2]),
      headerCell("단계", colW[3]),
      headerCell("설명", colW[4]),
    ],
  })

  const dataRows = group.processes.map((proc, i) => {
    const fill = i % 2 === 1 ? GRAY100 : WHITE
    return new TableRow({ children: [
      valueCell(`${i + 1}`, colW[0], { align: AlignmentType.CENTER, fill, size: 19, color: BLUE, bold: true }),
      valueCell(proc.name, colW[1], { fill, size: 19, color: GRAY700, bold: true }),
      valueCell(proc.owner, colW[2], { align: AlignmentType.CENTER, fill, size: 19, color: GRAY500 }),
      valueCell(`${proc.steps?.length || 0}단계`, colW[3], { align: AlignmentType.CENTER, fill, size: 19, color: GRAY500 }),
      valueCell(proc.description, colW[4], { fill, size: 19, color: GRAY500 }),
    ] })
  })

  return [
    // 제목: 하단 테두리 포함 (navy, sz=3, space=6)
    new Paragraph({
      spacing: { after: 100, before: 0 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 3, color: NAVY, space: 6 } },
      children: [txt("그룹 전체 프로세스 목록", { bold: true, size: 28, color: NAVY })],
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [txt(
        `${deptName}  ·  ${group.processes.length}개 프로세스  ·  총 ${totalSteps}단계`,
        { size: 18, color: GRAY500 }
      )],
    }),
    new Table({
      width: { size: TABLE_W, type: WidthType.DXA },
      borders: TBL_BDR,
      rows: [hdrRow, ...dataRows],
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ]
}

// ══════════════════════════════════════════════════════════════
// [3] 프로세스 섹션
// ══════════════════════════════════════════════════════════════
async function buildProcessSection(proc, procIdx, imageMap, addPageBreak) {
  const ch = []

  // ── 프로세스 배너 (560 + 8466) ────────────────────────────
  // 실측: 셀 border=none(FFFFFF/sz0), 좌 margin 130/100/130/100, 우 130/200/130/160
  const bannerRight = [
    new Paragraph({
      indent: { left: 120 },
      children: [txt(proc.name, { bold: true, size: 28, color: NAVY })],
    }),
  ]
  if (proc.description) {
    bannerRight.push(new Paragraph({
      indent: { left: 120 },
      children: [txt(proc.description, { size: 18, color: GRAY500 })],
    }))
  }

  ch.push(new Table({
    width: { size: TABLE_W, type: WidthType.DXA }, borders: TBL_BDR,
    rows: [new TableRow({ children: [
      new TableCell({
        width: { size: 560, type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, fill: NAVY },
        verticalAlign: VerticalAlign.CENTER,
        borders: noneBdr,
        margins: { top: 130, left: 100, bottom: 130, right: 100, marginUnitType: m },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [txt(`${procIdx + 1}`, { bold: true, size: 30, color: WHITE })] })],
      }),
      new TableCell({
        width: { size: 8466, type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, fill: BLUE_PALE },
        verticalAlign: VerticalAlign.CENTER,
        borders: noneBdr,
        margins: { top: 130, left: 200, bottom: 130, right: 160, marginUnitType: m },
        children: bannerRight,
      }),
    ] })],
  }))

  // ── 프로세스 메타 (1300+2100+1300+1500+1300+1526) ─────────
  ch.push(gap())
  ch.push(new Table({
    width: { size: TABLE_W, type: WidthType.DXA }, borders: TBL_BDR,
    rows: [new TableRow({ children: [
      labelCell("담당 부서", 1300), valueCell(proc.dept, 2100),
      labelCell("담당자", 1300),    valueCell(proc.owner, 1500),
      labelCell("총 단계", 1300),   valueCell(`${proc.steps?.length || 0}단계`, 1526),
    ] })],
  }))

  // ── 단계 요약 테이블 (500+2500+1700+1000+3326) ────────────
  ch.push(gap())
  const sColW = [500, 2500, 1700, 1000, 3326]
  const sHdr = new TableRow({ children: [
    headerCell("No", sColW[0]),
    headerCell("단계명", sColW[1]),
    headerCell("화면명", sColW[2]),
    headerCell("PT", sColW[3]),
    headerCell("Logic 요약", sColW[4]),
  ] })

  const sRows = (proc.steps || []).map((step, i) => {
    const fill = i % 2 === 1 ? GRAY100 : WHITE
    const logicSum = (step.logic || '').split('\n')[0] || ''
    return new TableRow({ children: [
      valueCell(`${i + 1}`, sColW[0], { align: AlignmentType.CENTER, fill, size: 19, color: BLUE, bold: true }),
      valueCell(step.title, sColW[1], { fill, size: 19, bold: true }),
      valueCell(step.screenName, sColW[2], { align: AlignmentType.CENTER, fill, size: 19, color: BLUE, bold: true }),
      valueCell(step.pt, sColW[3], { align: AlignmentType.CENTER, fill, size: 19, color: GRAY500 }),
      valueCell(logicSum, sColW[4], { fill, size: 19, color: GRAY500 }),
    ] })
  })

  ch.push(new Table({
    width: { size: TABLE_W, type: WidthType.DXA }, borders: TBL_BDR,
    rows: [sHdr, ...sRows],
  }))

  // 요약 → 첫 단계 전 페이지 브레이크
  ch.push(gap(), gap())
  ch.push(new Paragraph({ children: [new PageBreak()] }))

  // ── 단계별 상세 ───────────────────────────────────────────
  for (let si = 0; si < (proc.steps || []).length; si++) {
    const step = proc.steps[si]

    // 단계 배너 (560 + 8466)
    // 실측: border=none(FFFFFF), 좌 margin 120/100/120/100, 우 120/200/120/160
    ch.push(new Table({
      width: { size: TABLE_W, type: WidthType.DXA }, borders: TBL_BDR,
      rows: [new TableRow({ children: [
        new TableCell({
          width: { size: 560, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: NAVY },
          verticalAlign: VerticalAlign.CENTER,
          borders: noneBdr,
          margins: { top: 120, left: 100, bottom: 120, right: 100, marginUnitType: m },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [txt(`${si + 1}`, { bold: true, size: 28, color: WHITE })] })],
        }),
        new TableCell({
          width: { size: 8466, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: BLUE_PALE },
          verticalAlign: VerticalAlign.CENTER,
          borders: noneBdr,
          margins: { top: 120, left: 200, bottom: 120, right: 160, marginUnitType: m },
          children: [new Paragraph({
            children: [txt(step.title, { bold: true, size: 26, color: NAVY })],
          })],
        }),
      ] })],
    }))

    // 메타 행 (1400+1900+1200+1500+1000+2026)
    ch.push(gap())
    ch.push(new Table({
      width: { size: TABLE_W, type: WidthType.DXA }, borders: TBL_BDR,
      rows: [new TableRow({ children: [
        labelCell("화면명(T-Code)", 1400),
        new TableCell({
          width: { size: 1900, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: BLUE_PALE },
          verticalAlign: VerticalAlign.CENTER,
          borders: grayBdr, margins: STD_M,
          children: [new Paragraph({
            spacing: { after: 100, before: 0 },
            children: [txt(step.screenName || '—', { bold: true, size: 19, color: NAVY })],
          })],
        }),
        labelCell("담당 부서", 1200),
        valueCell(step.dept, 1500),
        labelCell("PT", 1000),
        valueCell(step.pt, 2026),
      ] })],
    }))

    // 참고 이미지 (선택)
    ch.push(gap())
    const stepImages = step.images || []
    if (stepImages.length > 0) {
      const imgParas = []
      for (const img of stepImages) {
        const record = imageMap[img.id]
        if (!record) continue
        try {
          const ab = await record.blob.arrayBuffer()
          const u8 = new Uint8Array(ab)
          const mimeMap = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/bmp': 'bmp' }
          imgParas.push(new Paragraph({
            spacing: { before: 100, after: 100 },
            alignment: AlignmentType.CENTER,
            children: [new ImageRun({
              data: u8,
              transformation: { width: 420, height: 280 },
              type: mimeMap[record.blob.type] || 'png',
            })],
          }))
        } catch { /* skip */ }
      }
      if (imgParas.length > 0) {
        ch.push(new Table({
          width: { size: TABLE_W, type: WidthType.DXA }, borders: TBL_BDR,
          rows: [
            new TableRow({ children: [new TableCell({
              width: { size: TABLE_W, type: WidthType.DXA },
              shading: { type: ShadingType.CLEAR, fill: GRAY100 },
              borders: imgHdrBdr,
              margins: { top: 80, left: 180, bottom: 80, right: 140, marginUnitType: m },
              children: [new Paragraph({
                children: [
                  txt("▎ ", { bold: true, size: 18, color: AAAAAA }),
                  txt("참고 이미지", { bold: true, size: 19, color: GRAY700 }),
                ],
              })],
            })] }),
            new TableRow({ children: [new TableCell({
              width: { size: TABLE_W, type: WidthType.DXA },
              shading: { type: ShadingType.CLEAR, fill: WHITE },
              borders: imgBodyBdr,
              margins: { top: 140, left: 140, bottom: 140, right: 140, marginUnitType: m },
              children: imgParas,
            })] }),
          ],
        }))
        ch.push(gap())
      }
    }

    // Logic 블록
    if (step.logic) {
      const logicLines = step.logic.split('\n')
      const logicParas = logicLines.map((line) => new Paragraph({
        spacing: { after: 40 },
        indent: { left: 160 },
        children: [txt(line, { size: 19, color: GRAY700 })],
      }))

      ch.push(new Table({
        width: { size: TABLE_W, type: WidthType.DXA }, borders: TBL_BDR,
        rows: [
          // 헤더: EBF3FB, margin 80/180/80/140
          new TableRow({ children: [new TableCell({
            width: { size: TABLE_W, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: BLUE_PALE },
            borders: grayBdr,
            margins: { top: 80, left: 180, bottom: 80, right: 140, marginUnitType: m },
            children: [new Paragraph({
              children: [
                txt("▎ ", { bold: true, size: 18, color: BLUE }),
                txt(`${si + 1}.  Logic`, { bold: true, size: 18, color: BLUE }),
              ],
            })],
          })] }),
          // 내용: WHITE, margin 120/200/120/160
          new TableRow({ children: [new TableCell({
            width: { size: TABLE_W, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: WHITE },
            borders: grayBdr,
            margins: { top: 120, left: 200, bottom: 120, right: 160, marginUnitType: m },
            children: logicParas,
          })] }),
        ],
      }))
    }

    // 주의사항 블록
    if (step.warning) {
      ch.push(gap())
      ch.push(new Table({
        width: { size: TABLE_W, type: WidthType.DXA }, borders: TBL_BDR,
        rows: [new TableRow({ children: [new TableCell({
          width: { size: TABLE_W, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: YELLOW_BG },
          borders: warnBdr,
          margins: { top: 100, left: 180, bottom: 100, right: 140, marginUnitType: m },
          children: [new Paragraph({
            children: [txt(`⚠  주의: ${step.warning}`, { bold: true, size: 19, color: WARNING_TXT })],
          })],
        })] })],
      }))
    }

    // 단계 간 구분 (5개 단락: 60,60,100,60,60)
    if (si < (proc.steps || []).length - 1) {
      ch.push(gap(), gap())
      ch.push(new Paragraph({ spacing: { after: 100 } }))
      ch.push(gap(), gap())
    }
  }

  // 프로세스 간 페이지 브레이크
  if (addPageBreak) {
    ch.push(new Paragraph({ children: [new PageBreak()] }))
  }

  return ch
}

// ══════════════════════════════════════════════════════════════
// 메인 함수
// ══════════════════════════════════════════════════════════════
export async function generateGroupWord(group, deptName) {
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

  const sectionChildren = [
    ...buildCoverPage(group, deptName),
    ...buildSummaryTable(group, deptName),
  ]

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
          margin: { top: 1200, bottom: 1300, left: 1100, right: 1100 },
        },
      },
      children: sectionChildren,
    }],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `${group.name}_${deptName}_매뉴얼.docx`)
}
