import {
  Paragraph, TextRun, TableCell,
  WidthType, AlignmentType, BorderStyle,
  VerticalAlign, ShadingType,
} from 'docx'

// ── 폰트 ──────────────────────────────────────────────────────
const KR = { name: "맑은 고딕", eastAsia: "맑은 고딕" }

// ── 색상 (v7 실측) ───────────────────────────────────────────
export const NAVY       = "1F4E79"
export const BLUE       = "2E75B6"
export const BLUE_PALE  = "EBF3FB"
export const GRAY100    = "F2F2F2"
export const GRAY500    = "595959"
export const GRAY700    = "404040"
export const WHITE      = "FFFFFF"
export const YELLOW_BG  = "FFFBEB"
export const YELLOW_BDR = "FDE68A"
export const WARNING_TXT = "92400E"
export const PLACEHOLDER = "9DB8D9"
export const LIGHT_GRAY = "A6A6A6"
export const IMG_BDR    = "EBEBEB"
export const AAAAAA     = "AAAAAA"

// ── 전체 콘텐츠 테이블 너비 ──────────────────────────────────
export const TABLE_W = 9026

// ── 셀 여백 (v7 실측) ───────────────────────────────────────
const m = WidthType.DXA
export const STD_M = { top: 90, left: 150, bottom: 90, right: 120, marginUnitType: m }
export const HDR_M = { top: 100, left: 150, bottom: 100, right: 120, marginUnitType: m }

// ── 테이블 레벨 외곽선 ──────────────────────────────────────
export const TBL_BDR = {
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
export const grayBdr  = mkBdr("BFBFBF")
export const blueBdr  = mkBdr(BLUE)
export const navyBdr  = mkBdr(NAVY)
export const noneBdr  = (() => {
  const b = { style: BorderStyle.NONE, size: 0, color: WHITE }
  return { top: b, bottom: b, left: b, right: b }
})()
// 경고 셀: 좌 두꺼운 92400E / 나머지 FDE68A
export const warnBdr = {
  top:    { style: BorderStyle.SINGLE, size: 1, color: YELLOW_BDR },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: YELLOW_BDR },
  left:   { style: BorderStyle.SINGLE, size: 8, color: WARNING_TXT },
  right:  { style: BorderStyle.SINGLE, size: 1, color: YELLOW_BDR },
}
// 이미지 헤더: top/left/right = EBEBEB, bottom = none
export const imgHdrBdr = {
  top:    { style: BorderStyle.SINGLE, size: 1, color: IMG_BDR },
  bottom: { style: BorderStyle.NONE,   size: 0, color: WHITE },
  left:   { style: BorderStyle.SINGLE, size: 1, color: IMG_BDR },
  right:  { style: BorderStyle.SINGLE, size: 1, color: IMG_BDR },
}
// 이미지 콘텐츠: top = none, left/bottom/right = EBEBEB
export const imgBodyBdr = {
  top:    { style: BorderStyle.NONE,   size: 0, color: WHITE },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: IMG_BDR },
  left:   { style: BorderStyle.SINGLE, size: 1, color: IMG_BDR },
  right:  { style: BorderStyle.SINGLE, size: 1, color: IMG_BDR },
}

// ── TextRun 헬퍼 ────────────────────────────────────────────
export function txt(text, opts = {}) {
  return new TextRun({ text, font: KR, ...opts })
}

// ── 테이블 간 구분 단락 (after=60) ─────────────────────────
export function gap() { return new Paragraph({ spacing: { after: 60 } }) }

// ── 파란 라벨 셀 (fill 2E75B6, 흰 글자) ────────────────────
export function labelCell(text, width) {
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
export function headerCell(text, width) {
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
export function valueCell(text, width, opts = {}) {
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
export function placeholderCell(text, width) {
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
