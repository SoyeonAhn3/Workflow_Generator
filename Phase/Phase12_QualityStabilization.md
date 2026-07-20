# Phase 12 — Quality & Stabilization `✅ Completed`

> Add an automated-test safety net (Vitest smoke tests) and improve Word export rendering (image aspect ratio), after a silent Word regression surfaced only at deploy time

**Completed**: 2026-07-20
**Status**: ✅ Completed
**Prerequisites**: Phase 11 completed

---

## Overview

After Phase 11, a Word export regression (undefined `m`/`BorderStyle` left by the Phase 10 refactor) was discovered only at deploy time — the project had no automated tests. Phase 12 introduces a smoke-test safety net and improves Word rendering quality. It is a quality/stabilization phase, distinct from feature phases.

---

## Deliverables

| # | Item | Status |
|---|------|--------|
| 1 | Vitest setup + smoke tests (storage, backup, wordExport) | ✅ |
| 2 | Word image aspect-ratio preservation | ✅ |

Related (already shipped in the Phase 11 commit `5d41d53`): Word `m`/`BorderStyle` regression fix — the very bug that motivated this phase.

---

## 1. Automated Test Smoke Suite `✅`

### Purpose
Catch regressions (like the Word `m`/`BorderStyle` bug) automatically with a single `npm test`.

### Implementation
- Tool: **Vitest** (`npm test` → `vitest run`); node environment; only new dependency is `vitest`.
- Files: `vitest.config.js`, `src/storage.test.js`, `src/backup.test.js`, `src/wordExport.test.js`.
- Coverage (9 tests, all passing):
  - **storage**: save/load round-trip, `null` on empty, size calculation
  - **backup**: `summarizeBackup` counts, `parseBackup` valid / broken-JSON / non-backup rejection
  - **wordExport**: `generateGroupWord` builds a document without throwing — **directly guards the m/BorderStyle regression**
- localStorage is polyfilled inline (node env); `file-saver` is mocked in the wordExport test.

### Deferred (needs extra setup)
- canvas (`imageResize`), IndexedDB round-trip (`fake-indexeddb`), React component tests, CI integration.

---

## 2. Word Image Aspect Ratio `✅`

### Problem
`wordExport.js` inserted every image at a fixed `transformation: { width: 420, height: 280 }`, distorting non-4:3 images and violating the project rule "adjust width only, keep height proportional".

### Implementation
- Read the image's natural size via `createImageBitmap(record.blob)` before building the `ImageRun`.
- Fixed width = 420; `height = round(420 × imgHeight / imgWidth)` (width-driven, ratio preserved).
- Falls back to the previous fixed `420×280` on failure. No-image groups are unaffected, so the existing wordExport test stays green.

### Decisions made
- Size source: `createImageBitmap` (chosen over header-byte parsing for simplicity; consistent with `imageResize.js`).
- Very tall images: **pure width-only** (honors the "adjust width only" rule). A page-fit height cap can be added later if needed.
- Aspect ratio can only be verified in a browser (`createImageBitmap` is unavailable in node), so it is confirmed manually, not by the smoke test.

---

## Prerequisites & Dependencies

- Phase 11 completed.
- New dev dependency: `vitest`.

---

## Development Notes

- Run `npm test` before commits — especially after touching `wordExport`, `backup`, or `storage`.
- The Word image-ratio fix only affects the browser image path; the node-based wordExport test uses no images, so it is unaffected.

---

## Change Log

| Date | Description |
|------|-------------|
| 2026-07-20 | Phase 12 created — Vitest smoke tests added (✅); Word image aspect-ratio planned (🔲) |
| 2026-07-20 | Word image aspect-ratio implemented (createImageBitmap, width-only) — Phase 12 completed |

---
---

# Phase 12 — 품질·안정화 `✅ 완료`

> 자동화 테스트 안전망(Vitest 스모크 테스트)을 도입하고 Word 내보내기 렌더링(이미지 비율)을 개선한다 — 배포 직전에야 드러난 Word 회귀 사건 이후

**완료일**: 2026-07-20
**상태**: ✅ 완료
**선행 조건**: Phase 11 완료

---

## 개요

Phase 11 이후, Phase 10 리팩토링이 남긴 Word 내보내기 회귀(`m`·`BorderStyle` 미정의)가 **배포 직전에야** 발견되었다 — 프로젝트에 자동화 테스트가 없었기 때문. Phase 12는 스모크 테스트 안전망을 도입하고 Word 렌더링 품질을 개선한다. 기능 Phase와 구분되는 품질·안정화 Phase다.

---

## 완료 항목

| # | 항목 | 상태 |
|---|------|------|
| 1 | Vitest 설정 + 스모크 테스트 (storage, backup, wordExport) | ✅ |
| 2 | Word 이미지 비율 유지 | ✅ |

관련 (Phase 11 커밋 `5d41d53`에 이미 반영됨): Word `m`·`BorderStyle` 회귀 수정 — 이 Phase를 촉발한 바로 그 버그.

---

## 1. 자동화 테스트 스모크 스위트 `✅`

### 목적
회귀(예: Word `m`·`BorderStyle` 버그)를 `npm test` 한 줄로 자동 감지한다.

### 구현
- 도구: **Vitest** (`npm test` → `vitest run`); node 환경; 신규 의존성은 `vitest` 하나.
- 파일: `vitest.config.js`, `src/storage.test.js`, `src/backup.test.js`, `src/wordExport.test.js`.
- 커버리지 (9개, 전부 통과):
  - **storage**: 저장/불러오기 왕복, 빈 값 시 `null`, 용량 계산
  - **backup**: `summarizeBackup` 개수 집계, `parseBackup` 정상 / 깨진 JSON / 비정상 파일 거부
  - **wordExport**: `generateGroupWord`가 오류 없이 문서 생성 — **m·BorderStyle 회귀를 직접 방어**
- localStorage는 인라인 폴리필(node 환경), wordExport 테스트에서 `file-saver`는 목킹.

### 보류 (추가 설정 필요)
- canvas(`imageResize`), IndexedDB 왕복(`fake-indexeddb`), React 컴포넌트 테스트, CI 연동.

---

## 2. Word 이미지 비율 유지 `✅`

### 문제
`wordExport.js`가 모든 이미지를 `transformation: { width: 420, height: 280 }` 고정으로 삽입 → 4:3이 아닌 이미지는 찌그러지고, "너비만 조정, 높이는 비율 유지" 규칙에 어긋났음.

### 구현
- `ImageRun` 생성 전 `createImageBitmap(record.blob)`으로 원본 크기를 읽음.
- 너비 420 고정, `height = round(420 × 원본높이 / 원본너비)` (너비 기준, 비율 유지).
- 실패 시 기존 `420×280`으로 폴백. 이미지 없는 그룹은 영향 없어 기존 wordExport 테스트는 그대로 통과.

### 결정 사항
- 크기 취득: `createImageBitmap` 채택(헤더 파싱보다 단순, `imageResize.js`와 일관).
- 세로로 아주 긴 이미지: **순수 너비 기준**("너비만 조정" 규칙 준수). 필요 시 페이지 맞춤 높이 캡 추후 추가 가능.
- 비율은 브라우저에서만 검증 가능(`createImageBitmap`이 node에 없음) → 스모크 테스트가 아닌 수동 확인.

---

## 선행 조건 및 의존성

- Phase 11 완료.
- 신규 개발 의존성: `vitest`.

---

## 개발 시 주의사항

- 커밋 전 `npm test` 실행 — 특히 `wordExport`·`backup`·`storage`를 건드린 뒤.
- Word 이미지 비율 수정은 브라우저 이미지 경로에만 영향; node 기반 wordExport 테스트는 이미지가 없어 영향받지 않음.

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-07-20 | Phase 12 생성 — Vitest 스모크 테스트 추가(✅); Word 이미지 비율 유지 예정(🔲) |
| 2026-07-20 | Word 이미지 비율 구현(createImageBitmap, 너비 기준) — Phase 12 완료 |
