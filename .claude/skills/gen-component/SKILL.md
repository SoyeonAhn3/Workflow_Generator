---
name: gen-component
version: 1.0
description: 컴포넌트명과 용도를 입력하면 ProcessFlow 프로젝트 컨벤션을 준수하는 JSX 컴포넌트 초안을 생성한다. "컴포넌트 만들어줘", "컴포넌트 생성해줘", "/gen-component" 요청 시 트리거한다.
depends_on: []
produces:
  - processflow/src/components/**/*.jsx
---

# gen-component Skill

ProcessFlow 컨벤션(색상 토큰 C, inline CSS, props 주석)을 준수하는 컴포넌트 초안을 생성한다.

---

## STEP 1 — 입력 수집

아래 2가지가 파악되면 바로 STEP 2 진행:
- 컴포넌트명 (PascalCase)
- 컴포넌트 용도 및 위치 (LV1/LV2/LV3 어디에서 사용하는지)

부족하면 한 번만 질문:
```
"어떤 컴포넌트를 만들까요?
1. 컴포넌트명 (예: ProcessCard)
2. 용도 및 위치 (예: LV2에서 프로세스 정보를 표시하는 카드)"
```

---

## STEP 2 — constants.js 색상 토큰 확인

생성 전 반드시 확인:
```
Read("processflow/src/constants.js")
```
→ C 객체의 색상 키 목록 파악 (C.navy, C.blue, C.bluePale 등)

---

## STEP 3 — 컴포넌트 생성

아래 규칙을 반드시 준수:

### 필수 포함 항목
1. `import { C } from '../../constants'` — 색상 토큰 참조 (경로는 위치에 맞게 조정)
2. Inline CSS만 사용 — 외부 CSS 파일/className 금지
3. props 타입 주석 (JSDoc 스타일)
4. 기본 return JSX 구조

### 금지 항목
- 하드코딩 hex 색상 (예: `color: '#2E75B6'` → `color: C.blue` 로 대체)
- `className` 속성 사용
- 외부 CSS import

### 생성 템플릿

```jsx
import { C } from '../../constants'  // 경로 조정 필요

/**
 * ComponentName
 * @param {{ prop1: type, prop2: type }} props
 */
export default function ComponentName({ prop1, prop2 }) {
  return (
    <div style={{
      background: C.white,
      border: `1px solid ${C.border}`,
      borderRadius: 8,
      padding: '12px 16px',
    }}>
      {/* 내용 */}
    </div>
  )
}
```

---

## STEP 4 — 출력

채팅에 생성된 컴포넌트 코드 전체를 출력한다.
파일 저장은 사용자가 확인 후 요청 시 진행.

출력 포맷:
```
✅ 컴포넌트 초안 생성 완료
📁 저장 위치 (제안): processflow/src/components/[폴더]/ComponentName.jsx

[전체 코드]
```
