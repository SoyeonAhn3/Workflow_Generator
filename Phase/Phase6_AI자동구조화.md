# Phase 6 — AI 자동 구조화 `✅ 완료`

> 자유 텍스트 업무 흐름 입력 → Netlify Functions → Claude API → Step[] 자동 생성 → LV3 편집기 이동

**상태**: ✅ 완료 (2026-03-16)
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
| 1 | `netlify/functions/claude.js` 완성 | ✅ |
| 2 | `AddMethodModal.jsx` — 방법 선택 | ✅ |
| 3 | `AIGenerateModal.jsx` — 3단계 위저드 | ✅ |
| 4 | LV2 [+ 프로세스 추가] → AddMethodModal 연결 | ✅ |
| 5 | `EditProcModal.jsx` — 프로세스 수정 모달 | ✅ |
| 6 | `EditGroupModal.jsx` — 그룹 수정 + 부서 이동 모달 | ✅ |
| 7 | LV3 프로세스 수정 버튼 추가 | ✅ |
| 8 | LV2 프로세스 카드 연필 아이콘 추가 | ✅ |
| 9 | LV1 그룹 카드 수정 버튼 추가 | ✅ |
| 10 | 그룹 추가 시 담당부서 필수 입력 검증 | ✅ |

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

**⚠️ 실제 구현 시 변경사항 (계획 대비)**

| 항목 | 계획 | 실제 구현 |
|------|------|----------|
| 모듈 방식 | CommonJS (`require`/`exports.handler`) | ESM (`import`/`export const handler`) — `package.json "type":"module"` 충돌 해결 |
| API 호출 방식 | Anthropic SDK (`@anthropic-ai/sdk`) | 직접 `fetch()` — SDK 한글 처리 시 ByteString 오류 발생 |
| 모델명 | `claude-sonnet-4-20250514` | `claude-sonnet-4-6` |
| 오류 분리 | 단일 try-catch | API 오류 / JSON 파싱 오류 분리 — API 오류는 즉시 반환, JSON 오류만 재시도 |

```js
// ESM + 직접 fetch 방식 (최종 구현)
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"
const FALLBACK_MODEL = "claude-sonnet-4-6"
const MAX_RETRIES = 3

export const handler = async (event) => {
  // ... 검증 ...
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    // API 호출 오류와 JSON 파싱 오류를 분리하여 처리
    let apiRes
    try {
      apiRes = await fetch(ANTHROPIC_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model, max_tokens: 2048, messages: [{ role: "user", content: currentPrompt }] }),
      })
    } catch (fetchErr) {
      return { statusCode: 500, body: JSON.stringify({ error: `API 네트워크 오류: ${fetchErr?.message}` }) }
    }
    if (!apiRes.ok) {
      return { statusCode: 500, body: JSON.stringify({ error: `Claude API 오류 ${apiRes.status}` }) }
    }
    // JSON 파싱 실패 시만 재시도
    try {
      const parsed = JSON.parse(jsonStr)
      const stepsArray = Array.isArray(parsed) ? parsed : parsed.steps || []
      return { statusCode: 200, body: JSON.stringify({ steps: stepsArray }) }
    } catch {
      currentPrompt = `이전 응답이 유효한 JSON이 아닙니다...`
    }
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
  - 담당 부서 (기본값: 현재 그룹 부서, 빈값 시 deptName 폴백)
  - 담당자
  - 업무 흐름 설명 (textarea)
    placeholder: "예: MB52에서 미결 확인 → 담당자 메일 발송 → 처리 완료 후 재확인"
  - [✨ AI로 구조화] 버튼

Step 2 — 로딩:
  - "AI가 프로세스를 분석 중입니다..." 메시지
  - CSS 스피너 애니메이션 (@keyframes spin)
  - POST /.netlify/functions/claude 호출
    body: { userInput, dept }

Step 3 — 결과 미리보기:
  - 생성된 단계 목록 (읽기 전용 카드)
  - 각 카드: 단계명 / 화면명 / PT / Logic 첫 줄
  - [← 다시 입력] → Step 1로 복귀
  - [편집기에서 열기 →] → onComplete(process) → LV3 이동
```

**⚠️ 실제 구현 시 변경사항:**
- 단계 `description` 필드를 `''`(빈값) 고정 — 사용자 판단으로 AI 생성 description 불필요

### EditProcModal.jsx (추가 구현)

```
편집 필드: 프로세스명 * / 담당 부서 / 담당자 / 모듈 / 설명
적용 위치: LV2 프로세스 카드 ✏ 버튼, LV3 헤더 "✏ 수정" 버튼
```

### EditGroupModal.jsx (추가 구현)

```
편집 필드: 그룹명 * / 담당 부서 * / Module
부서 변경 시: 존재하는 부서 → 그룹 이동, 없는 부서 → 인라인 에러 표시
적용 위치: LV1 그룹 카드 ✏ 버튼
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
| Anthropic SDK → 직접 fetch | SDK 제거, 직접 fetch 사용 | SDK 내부에서 한글 문자를 헤더로 처리 시 ByteString 오류 발생 |
| selDept/selGroup/selProc 동기화 | 수정 핸들러에서 3개 상태 모두 업데이트 | 수정 후 다른 뷰 왕복 시 stale 데이터 방지 |
| 수정 후 화면 이동 방지 | `prev?.id === updated.id ? updated : prev` 패턴 | 현재 보고 있는 항목이 아니면 상태 교체 안 함 |

---

## 완료 기준

- 자유 텍스트 입력 → Step[] JSON 파싱 → 결과 미리보기 정상 표시 ✅
- [편집기에서 열기] 클릭 시 LV3로 이동하며 생성된 단계 표시 ✅
- API 실패 시 "다시 시도" 메시지 표시 후 Step 1 복귀 ✅
- JSON 파싱 실패 시 서버에서 자동 재시도 (최대 3회), 전부 실패 시 Step 1 복귀 + 안내 메시지 표시 ✅
- `netlify dev` 로컬 환경에서 전체 흐름 동작 확인 ✅
- 그룹/프로세스 수정 (EditProcModal, EditGroupModal) 정상 동작 ✅
- 수정 후 화면 이동 없이 현재 뷰 유지 ✅

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
| 2026-03-16 | Phase 6 구현 시작 — AddMethodModal, AIGenerateModal, netlify/functions/claude.js 구현 |
| 2026-03-16 | CommonJS → ESM 전환 — package.json "type":"module" 충돌 해결 |
| 2026-03-16 | ByteString 오류 수정 — Anthropic SDK → 직접 fetch() 교체. 한글 문자 처리 문제 해결 |
| 2026-03-16 | API 오류 / JSON 파싱 오류 분리 — 첫 번째 시도에서 API 오류 시 3회 재시도 낭비 방지 |
| 2026-03-16 | 모델명 수정 — `claude-sonnet-4-20250514` → `claude-sonnet-4-6` |
| 2026-03-16 | 기능 추가 5건 (TC-005 테스트 중 도출) — EditProcModal, EditGroupModal, LV3/LV2/LV1 수정 버튼, 그룹 담당부서 필수 입력 |
| 2026-03-16 | 버그 수정 3건 — selDept stale 데이터, EditGroupModal 안내 문구 제거, 수정 후 화면 이동 방지 |
| 2026-03-16 | Phase 6 테스트 완료 — TC-001~010 Pass, TC-011~012 Skip, TC-013~014 AI검증 Pass |
