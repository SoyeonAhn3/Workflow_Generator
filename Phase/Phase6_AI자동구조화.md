# Phase 6 — AI 자동 구조화 `🔲 미시작`

> 자유 텍스트 업무 흐름 입력 → Netlify Functions → Claude API → Step[] 자동 생성 → LV3 편집기 이동

**상태**: 🔲 미시작
**선행 조건**: Phase 5 완료

---

## 개요

Claude API를 브라우저에서 직접 호출하지 않고, Netlify Functions를 프록시로 경유한다.
프론트엔드는 `/.netlify/functions/claude`에 POST 요청만 보내고,
API 키는 Netlify 환경변수에만 존재하여 클라이언트에 노출되지 않는다.
UI는 3단계 위저드(입력 → 로딩 → 미리보기)로 구성된다.

Claude가 항상 완벽한 JSON을 반환하지 않을 수 있으므로 (설명 텍스트 추가, 마크다운 래퍼 등),
서버사이드에서 JSON 파싱 실패 시 자동으로 재시도하는 로직을 포함한다. (최대 3회)

---

## 완료 예정 항목

| # | 작업 | 상태 |
|---|------|------|
| 1 | `netlify/functions/claude.js` 완성 | 🔲 |
| 2 | `AddMethodModal.jsx` — 방법 선택 | 🔲 |
| 3 | `AIGenerateModal.jsx` — 3단계 위저드 | 🔲 |
| 4 | LV2 [+ 프로세스 추가] → AddMethodModal 연결 | 🔲 |

---

## 세부 구현 내용

### netlify/functions/claude.js

JSON 자동 재시도 흐름:
```
1회 호출 → JSON 파싱 시도
  성공 → 반환
  실패 → "JSON만 반환하세요" 재요청 (최대 3회)
    3회 모두 실패 → 500 에러 반환
```

Claude가 잘못된 형식으로 응답하는 주요 케이스:
- `"네! 아래 JSON입니다: [...]"` — 설명 텍스트 포함
- ` ```json [...] ``` ` — 마크다운 코드블록 래핑
- 필드 누락된 불완전 JSON

```js
const Anthropic = require("@anthropic-ai/sdk")

const FALLBACK_MODEL = "claude-sonnet-4-20250514"
const MAX_RETRIES = 3

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }) }
  }

  let body
  try {
    body = JSON.parse(event.body)
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON body" }) }
  }

  const { userInput, dept } = body
  if (!userInput || !dept) {
    return { statusCode: 400, body: JSON.stringify({ error: "입력값 누락" }) }
  }

  const client = new Anthropic({ apiKey })
  const model = process.env.CLAUDE_MODEL || FALLBACK_MODEL

  const basePrompt = `다음 업무 흐름을 분석하여 JSON 배열만 응답하세요.
배열 외 다른 텍스트 없이 JSON만 출력하세요.
업무흐름: ${userInput} / 담당부서: ${dept}
각 항목: title, screenName, dept, pt, logic, warning`

  let currentPrompt = basePrompt
  let lastResponse = ""

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const message = await client.messages.create({
      model,
      max_tokens: 2048,
      messages: [{ role: "user", content: currentPrompt }],
    })

    lastResponse = message.content[0].text

    // ```json ... ``` 래퍼 제거 후 파싱 시도
    const jsonStr = lastResponse
      .replace(/^```json\n?/, "").replace(/\n?```$/, "").trim()

    try {
      const steps = JSON.parse(jsonStr)
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steps }),
      }
    } catch {
      // 파싱 실패 시 재시도 프롬프트로 교체
      currentPrompt = `이전 응답이 유효한 JSON이 아닙니다. JSON 배열만 다시 반환하세요.
원래 요청: ${basePrompt}
잘못된 응답: ${lastResponse}`
    }
  }

  // MAX_RETRIES 모두 실패
  return {
    statusCode: 500,
    body: JSON.stringify({ error: `${MAX_RETRIES}회 재시도 후에도 유효한 JSON을 받지 못했습니다.` }),
  }
}
```

### AddMethodModal.jsx

```
두 가지 카드 선택지:
  ✍️ 직접 입력
    → onSelectDirect() → 기존 AddModal(lv3) 열기
    설명: "빈 프로세스 생성 후 단계를 직접 입력합니다"

  ✨ AI 자동 생성
    → onSelectAI() → AIGenerateModal 열기
    설명: "업무 흐름을 텍스트로 설명하면 AI가 단계를 자동 구성합니다"
```

### AIGenerateModal.jsx — 3단계 위저드

```
Step 1 — 입력 폼:
  - 프로세스명 * (필수)
  - 담당 부서 (기본값: 현재 그룹 부서)
  - 담당자
  - 업무 흐름 설명 (textarea)
    placeholder: "예: MB52에서 미결 확인 → 담당자 메일 발송 → 처리 완료 후 재확인"
  - [✨ AI로 구조화] 버튼

Step 2 — 로딩:
  - "AI가 프로세스를 분석 중입니다..." 메시지
  - 프로그레스 바 애니메이션
  - POST /.netlify/functions/claude 호출
    body: { userInput, dept }

Step 3 — 결과 미리보기:
  - 생성된 단계 목록 (읽기 전용 카드)
  - 각 카드: 단계명 / 화면명 / PT / Logic 첫 줄
  - [← 다시 입력] → Step 1로 복귀
  - [편집기에서 열기 →] → onComplete(process) → LV3 이동
```

### 프론트엔드 API 호출

```js
// AIGenerateModal.jsx 내부
const handleGenerate = async () => {
  setStep(2)  // 로딩 화면으로
  try {
    const res = await fetch('/.netlify/functions/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userInput, dept })
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const { steps } = await res.json()
    setGeneratedSteps(steps)
    setStep(3)  // 결과 미리보기로
  } catch (err) {
    setErrorMsg("AI 생성에 실패했습니다. 다시 시도해 주세요.")
    setStep(1)  // 입력 폼으로 복귀
  }
}
```

---

## 설계 결정 사항

| 항목 | 결정 | 이유 |
|------|------|------|
| API 키 위치 | Netlify 환경변수 | 브라우저 노출 방지 (보안 R1 해결) |
| Claude 모델 | `process.env.CLAUDE_MODEL` 참조 | 하드코딩 방지, 변경 1곳에서 관리 |
| JSON 파싱 실패 처리 | 서버사이드 자동 재시도 3회 → 전부 실패 시 Step 1 복귀 | 사용자 노출 없이 자동 복구, 3회 실패는 사용자에게 안내 |
| 로컬 개발 | `netlify dev` 필수 | `npm run dev`로는 Functions 미작동 |

---

## 완료 기준

- 자유 텍스트 입력 → Step[] JSON 파싱 → 결과 미리보기 정상 표시
- [편집기에서 열기] 클릭 시 LV3로 이동하며 생성된 단계 표시
- API 실패 시 "다시 시도" 메시지 표시 후 Step 1 복귀
- JSON 파싱 실패 시 서버에서 자동 재시도 (최대 3회), 전부 실패 시 Step 1 복귀 + 안내 메시지 표시
- `netlify dev` 로컬 환경에서 전체 흐름 동작 확인

---

## 개발 시 주의사항

- `netlify dev` 실행 시 `.env.local`의 `ANTHROPIC_API_KEY` 자동 로드됨
- Netlify Functions 타임아웃: 10초 — Claude API 응답이 느릴 경우 고려
- `max_tokens: 2048` — 단계 수가 많으면 잘릴 수 있으므로 필요 시 조정
- 재시도 3회 × Claude API 응답 시간 → 최악의 경우 Netlify 10초 타임아웃 초과 가능, 필요 시 MAX_RETRIES를 2로 줄일 것
- 배포 후 Netlify 대시보드에서 `ANTHROPIC_API_KEY`, `CLAUDE_MODEL` 환경변수 설정 필수

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-03-12 | 최초 작성 |
| 2026-03-13 | JSON 자동 재시도 로직 추가 (GPT/Gemini 검토 반영, MAX_RETRIES=3) |
