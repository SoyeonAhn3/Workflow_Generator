---
name: gen-word-block
version: 1.0
description: Word 블록 종류를 입력하면 docx 라이브러리 문법 + 한글 폰트 + 색상 규칙이 적용된 블록 코드를 생성한다. "Word 블록 만들어줘", "docx 코드 생성해줘", "/gen-word-block" 요청 시 트리거한다.
depends_on: []
produces: []
---

# gen-word-block Skill

Phase 5 Word 내보내기에서 사용하는 docx 블록 코드를 생성한다.
한글 폰트와 색상 규칙을 반드시 준수한다.

---

## STEP 1 — 입력 수집

아래 2가지가 파악되면 바로 STEP 2 진행:
- 블록 종류 (제목, 단락, 테이블, 이미지 등)
- 블록 내용 구조 (열 구성, 데이터 매핑 등)

부족하면 한 번만 질문:
```
"어떤 Word 블록이 필요한가요?
1. 블록 종류 (예: 단계 메타 테이블, 제목 단락, 구분선)
2. 내용 구조 (예: 화면명/담당부서/PT 3열 테이블)"
```

---

## STEP 2 — 블록 생성

### 필수 규칙

**한글 폰트** — 모든 텍스트에 반드시 적용:
```js
font: { name: "맑은 고딕", eastAsia: "맑은 고딕" }
```

**색상 규칙** (Section 9.3 기준):
| 용도 | 색상 |
|------|------|
| 레이블 셀 배경 | `#2E75B6` |
| 헤더 행 배경 | `#1F4E79` |
| 헤더 행 텍스트 | `#FFFFFF` |
| 일반 셀 배경 | `#FFFFFF` |
| 테이블 테두리 | `#BDD7EE` |

### 블록 유형별 패턴

**Paragraph (제목/본문)**:
```js
new Paragraph({
  children: [
    new TextRun({
      text: "텍스트",
      font: { name: "맑은 고딕", eastAsia: "맑은 고딕" },
      size: 24,  // half-points (24 = 12pt)
      bold: false,
    }),
  ],
  spacing: { after: 200 },
})
```

**Table (메타 정보 테이블)**:
```js
new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({
            text: "레이블",
            font: { name: "맑은 고딕", eastAsia: "맑은 고딕" },
            color: "FFFFFF",
            bold: true,
            size: 20,
          })] })],
          shading: { fill: "2E75B6" },
          width: { size: 25, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({
            text: value,
            font: { name: "맑은 고딕", eastAsia: "맑은 고딕" },
            size: 20,
          })] })],
        }),
      ],
    }),
  ],
  borders: {
    top: { style: BorderStyle.SINGLE, color: "BDD7EE" },
    bottom: { style: BorderStyle.SINGLE, color: "BDD7EE" },
    left: { style: BorderStyle.SINGLE, color: "BDD7EE" },
    right: { style: BorderStyle.SINGLE, color: "BDD7EE" },
    insideH: { style: BorderStyle.SINGLE, color: "BDD7EE" },
    insideV: { style: BorderStyle.SINGLE, color: "BDD7EE" },
  },
})
```

---

## STEP 3 — 출력

채팅에 생성된 docx 블록 코드를 출력한다.

출력 포맷:
```
✅ Word 블록 생성 완료
📦 블록 유형: [유형명]
🔤 한글 폰트: 맑은 고딕 적용 확인

[전체 블록 코드]
```
