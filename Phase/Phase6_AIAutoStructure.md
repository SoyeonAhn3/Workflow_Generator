# Phase 6 — AI Auto-Structure `✅ Completed`

> Free-text workflow input → Netlify Functions → Claude API → auto-generate Step[] → navigate to LV3 editor

**Completed**: 2026-03-16
**Status**: ✅ Completed
**Prerequisites**: Phase 5 completed

---

## Overview

Claude API calls are proxied through Netlify Functions rather than called directly from the browser.
The frontend sends POST requests to `/.netlify/functions/claude` only, and the API key exists exclusively in Netlify environment variables.
The UI uses a 3-step wizard (Input → Loading → Preview).

Claude may not always return perfect JSON (explanatory text, markdown wrappers, etc.),
so the server-side includes automatic retry logic on JSON parse failure (up to 3 attempts).

---

## Deliverables

| # | Task | Status |
|---|------|--------|
| 1 | `netlify/functions/claude.js` completion | ✅ |
| 2 | `AddMethodModal.jsx` — method selection | ✅ |
| 3 | `AIGenerateModal.jsx` — 3-step wizard | ✅ |
| 4 | LV2 [+ Add Process] → AddMethodModal connection | ✅ |
| 5 | `EditProcModal.jsx` — process edit modal | ✅ |
| 6 | `EditGroupModal.jsx` — group edit + dept move modal | ✅ |
| 7 | LV3 process edit button | ✅ |
| 8 | LV2 process card edit icon | ✅ |
| 9 | LV1 group card edit button | ✅ |
| 10 | Group add — required dept input validation | ✅ |

---

## Implementation Details

### netlify/functions/claude.js

JSON auto-retry flow:
```
1st call → JSON parse attempt
  Success → return
  Failure → "Return JSON only" retry request (up to 3 times)
    All 3 fail → return 500 error
```

**Implementation changes vs. plan:**

| Item | Planned | Actual |
|------|---------|--------|
| Module format | CommonJS (`require`/`exports.handler`) | ESM (`import`/`export const handler`) — resolved `package.json "type":"module"` conflict |
| API call method | Anthropic SDK (`@anthropic-ai/sdk`) | Direct `fetch()` — SDK caused ByteString error with Korean text |
| Model name | `claude-sonnet-4-20250514` | `claude-sonnet-4-6` |
| Error separation | Single try-catch | Separated API error / JSON parse error — API errors return immediately, only JSON errors retry |

### AddMethodModal.jsx

```
Two card choices:
  ✍️ Direct Input → onSelectDirect() → open existing AddModal(lv3)
  ✨ AI Auto-Generate → onSelectAI() → open AIGenerateModal
```

### AIGenerateModal.jsx — 3-Step Wizard

```
Step 1 — Input form:
  Process name * (required), Department, Owner, Workflow description (textarea)
  [✨ Structure with AI] button

Step 2 — Loading:
  "AI is analyzing the process..." + CSS spinner
  POST /.netlify/functions/claude

Step 3 — Result preview:
  Generated step list (read-only cards)
  [← Re-enter] → back to Step 1
  [Open in editor →] → onComplete(process) → navigate to LV3
```

### EditProcModal.jsx / EditGroupModal.jsx

```
EditProcModal: Process name * / Department / Owner / Module / Description
EditGroupModal: Group name * / Department * / Module
  Dept change: existing dept → move group, non-existent → inline error
```

---

## Design Decisions

| Item | Decision | Reason |
|------|----------|--------|
| API key location | Netlify env vars | Prevent browser exposure (security R1) |
| Claude model | `process.env.CLAUDE_MODEL` reference | No hardcoding, single management point |
| JSON parse failure | Server-side auto-retry 3x → Step 1 return on all failures | Auto-recovery without user exposure; 3 failures shown to user |
| Local development | `netlify dev` required | `npm run dev` doesn't run Functions |
| Anthropic SDK → direct fetch | SDK removed, direct fetch used | SDK ByteString error on Korean characters |
| selDept/selGroup/selProc sync | Edit handlers update all 3 states | Prevents stale data on view navigation after edit |

---

## Acceptance Criteria

- Free text input → Step[] JSON parse → preview displayed correctly ✅
- [Open in editor] navigates to LV3 with generated steps ✅
- API failure shows "try again" and returns to Step 1 ✅
- JSON parse failure auto-retries server-side (up to 3x) ✅
- Group/Process edit (EditProcModal, EditGroupModal) works correctly ✅
- Edit maintains current view without navigation ✅

---

## Development Notes

- `netlify dev` auto-loads `.env.local` ANTHROPIC_API_KEY
- Netlify Functions timeout: 10 seconds — consider if Claude API is slow
- `max_tokens: 2048` — may truncate for many steps; adjust if needed
- 3 retries × Claude API response time → worst case may exceed Netlify 10s timeout; reduce MAX_RETRIES to 2 if needed
- Post-deploy: set `ANTHROPIC_API_KEY`, `CLAUDE_MODEL` in Netlify dashboard

---

## Change Log

| Date | Description |
|------|-------------|
| 2026-03-12 | Initial creation |
| 2026-03-13 | JSON auto-retry logic added (MAX_RETRIES=3) |
| 2026-03-16 | Phase 6 implementation — AddMethodModal, AIGenerateModal, claude.js |
| 2026-03-16 | CommonJS → ESM migration — resolved package.json conflict |
| 2026-03-16 | ByteString error fix — Anthropic SDK → direct fetch() |
| 2026-03-16 | API error / JSON parse error separated |
| 2026-03-16 | Model name updated — `claude-sonnet-4-20250514` → `claude-sonnet-4-6` |
| 2026-03-16 | 5 features added (from TC-005) — EditProcModal, EditGroupModal, edit buttons, dept validation |
| 2026-03-16 | 3 bugs fixed — selDept stale data, EditGroupModal messaging, view navigation on edit |
| 2026-03-16 | Phase 6 testing completed — TC-001~010 Pass, TC-013~014 AI verification Pass |

---
---

# Phase 6 — AI 자동 구조화 `✅ 완료`

> 자유 텍스트 업무 흐름 입력 → Netlify Functions → Claude API → Step[] 자동 생성 → LV3 편집기 이동

**완료일**: 2026-03-16
**상태**: ✅ 완료
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

## 완료 예정 / 완료 항목

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

**계획 대비 실제 구현 변경사항:**

| 항목 | 계획 | 실제 구현 |
|------|------|----------|
| 모듈 방식 | CommonJS (`require`/`exports.handler`) | ESM (`import`/`export const handler`) — `package.json "type":"module"` 충돌 해결 |
| API 호출 방식 | Anthropic SDK (`@anthropic-ai/sdk`) | 직접 `fetch()` — SDK 한글 처리 시 ByteString 오류 발생 |
| 모델명 | `claude-sonnet-4-20250514` | `claude-sonnet-4-6` |
| 오류 분리 | 단일 try-catch | API 오류 / JSON 파싱 오류 분리 — API 오류는 즉시 반환, JSON 오류만 재시도 |

### AddMethodModal.jsx

```
두 가지 카드 선택지:
  ✍️ 직접 입력 → onSelectDirect() → 기존 AddModal(lv3) 열기
  ✨ AI 자동 생성 → onSelectAI() → AIGenerateModal 열기
```

### AIGenerateModal.jsx — 3단계 위저드

```
Step 1 — 입력 폼:
  프로세스명 * (필수), 담당 부서, 담당자, 업무 흐름 설명 (textarea)
  [✨ AI로 구조화] 버튼

Step 2 — 로딩:
  "AI가 프로세스를 분석 중입니다..." + CSS 스피너
  POST /.netlify/functions/claude

Step 3 — 결과 미리보기:
  생성된 단계 목록 (읽기 전용 카드)
  [← 다시 입력] → Step 1로 복귀
  [편집기에서 열기 →] → onComplete(process) → LV3 이동
```

### EditProcModal.jsx / EditGroupModal.jsx

```
EditProcModal: 프로세스명 * / 담당 부서 / 담당자 / 모듈 / 설명
EditGroupModal: 그룹명 * / 담당 부서 * / Module
  부서 변경 시: 존재하는 부서 → 그룹 이동, 없는 부서 → 인라인 에러 표시
```

---

## 설계 결정 사항

| 항목 | 결정 | 이유 |
|------|------|------|
| API 키 위치 | Netlify 환경변수 | 브라우저 노출 방지 (보안 R1 해결) |
| Claude 모델 | `process.env.CLAUDE_MODEL` 참조 | 하드코딩 방지, 변경 1곳에서 관리 |
| JSON 파싱 실패 처리 | 서버사이드 자동 재시도 3회 → 전부 실패 시 Step 1 복귀 | 사용자 노출 없이 자동 복구 |
| 로컬 개발 | `netlify dev` 필수 | `npm run dev`로는 Functions 미작동 |
| Anthropic SDK → 직접 fetch | SDK 제거, 직접 fetch 사용 | SDK ByteString 오류 해결 |
| selDept/selGroup/selProc 동기화 | 수정 핸들러에서 3개 상태 모두 업데이트 | 수정 후 뷰 왕복 시 stale 데이터 방지 |

---

## 완료 기준

- 자유 텍스트 입력 → Step[] JSON 파싱 → 결과 미리보기 정상 표시 ✅
- [편집기에서 열기] 클릭 시 LV3로 이동하며 생성된 단계 표시 ✅
- API 실패 시 "다시 시도" 메시지 표시 후 Step 1 복귀 ✅
- JSON 파싱 실패 시 서버에서 자동 재시도 (최대 3회) ✅
- 그룹/프로세스 수정 (EditProcModal, EditGroupModal) 정상 동작 ✅
- 수정 후 화면 이동 없이 현재 뷰 유지 ✅

---

## 개발 시 주의사항

- `netlify dev` 실행 시 `.env.local`의 `ANTHROPIC_API_KEY` 자동 로드됨
- Netlify Functions 타임아웃: 10초 — Claude API 응답이 느릴 경우 고려
- `max_tokens: 2048` — 단계 수가 많으면 잘릴 수 있으므로 필요 시 조정
- 3회 재시도 × Claude API 응답 시간 → Netlify 10초 타임아웃 초과 가능, MAX_RETRIES를 2로 줄일 것
- 배포 후 Netlify 대시보드에서 `ANTHROPIC_API_KEY`, `CLAUDE_MODEL` 환경변수 설정 필수

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-03-12 | 최초 작성 |
| 2026-03-13 | JSON 자동 재시도 로직 추가 (MAX_RETRIES=3) |
| 2026-03-16 | Phase 6 구현 — AddMethodModal, AIGenerateModal, claude.js |
| 2026-03-16 | CommonJS → ESM 전환 — package.json 충돌 해결 |
| 2026-03-16 | ByteString 오류 수정 — Anthropic SDK → 직접 fetch() 교체 |
| 2026-03-16 | API 오류 / JSON 파싱 오류 분리 |
| 2026-03-16 | 모델명 수정 — `claude-sonnet-4-20250514` → `claude-sonnet-4-6` |
| 2026-03-16 | 기능 추가 5건 — EditProcModal, EditGroupModal, 수정 버튼, 부서 검증 |
| 2026-03-16 | 버그 수정 3건 — selDept stale 데이터, EditGroupModal 안내 문구, 화면 이동 방지 |
| 2026-03-16 | Phase 6 테스트 완료 — TC-001~010 Pass, TC-013~014 AI검증 Pass |
