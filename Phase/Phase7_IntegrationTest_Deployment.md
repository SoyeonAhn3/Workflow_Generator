# Phase 7 — Integration Test + Deployment `✅ Completed`

> Verify all features with E2E manual test scenarios and deploy to Netlify

**Completed**: 2026-03-18
**Status**: ✅ Completed
**Prerequisites**: Phase 6 completed (all features implemented)

---

## Overview

Verify all features with 8 manual test scenarios, then deploy to Netlify.
After deployment, re-run the same scenarios on the production URL to confirm no differences from local.
Bugs found during testing are fixed immediately and re-tested.

---

## Deliverables

| # | Task | Status |
|---|------|--------|
| 1 | Netlify project creation & GitHub connection | ✅ |
| 2 | Netlify environment variable setup | ✅ |
| 3 | Manual tests T01~T08 (local) | ✅ |
| 4 | Bug fixes (Word template v7 full rewrite) | ✅ |
| 5 | Manual tests T01~T08 re-run (deployed URL) | ✅ |

---

## Netlify Environment Variables

Netlify Dashboard > Site settings > Environment variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `ANTHROPIC_API_KEY` | Actual API key | Never include in code |
| `CLAUDE_MODEL` | `claude-sonnet-4-20250514` | Change here only when switching models |

---

## Manual Test Scenarios

### T01 — Basic CRUD Flow
Add dept → group → process → 3 steps with screen name, Logic, PT → verify all items displayed.

### T02 — Image Attachment & Persistence
Attach 2 images to a step → save → refresh → verify images still displayed. Check DevTools IndexedDB for Blob.

### T03 — Delete Image Integrity
Delete a process with images → verify deleted image IDs removed from IndexedDB (no orphans).

### T04 — Diagram Rendering
SAMPLE_DATA CO team → expand process card ▼ → SwimLane check. Enter process detail → LinearFlow check.

### T05 — Word Export Quality
Group select → [📥 Word Export] → download .docx → open in Windows Word → verify cover, summary, step details, images, Korean font.

### T06 — AI Auto-Structure
LV2 [+ Add Process] → [✨ AI Auto-Generate] → enter workflow text → verify 3-step wizard → [Open in editor] → verify LV3.

### T07 — Data Persistence
Enter dept/group/process/step data → refresh → verify all data restored from LocalStorage.

### T08 — Deployed Environment Re-Verification
Re-run T01~T07 on Netlify deployed URL. Verify AI functions, image attachment, Word download.

---

## Deployment Configuration

### Deployment Results

| Item | Value |
|------|-------|
| Site name | processflow-generator |
| Deploy URL | https://processflow-generator.netlify.app |
| Admin URL | https://app.netlify.com/projects/processflow-generator |
| Project ID | e1295837-05c0-4783-bb5e-505f042c38de |
| Env vars | ANTHROPIC_API_KEY, CLAUDE_MODEL configured |
| Deploy method | Netlify CLI (`netlify deploy --prod`) |
| Deploy date | 2026-03-18 |

---

## Design Decisions

| Item | Decision | Reason |
|------|----------|--------|
| Test method | Manual E2E | Automated testing is over-engineering for a small-scale tool |
| Word verification env | Windows Word Desktop | Word Online/Mac renders differently |
| Deploy platform | Netlify | One-stop React build + Functions integration |

---

## Acceptance Criteria

- T01~T08 all pass (local + deployed URL)
- AI features work on Netlify deployed URL
- Word file Korean font/images verified in Windows Word

---

## Development Notes

- T05 must be verified in Windows Microsoft Word Desktop (not Word Online)
- Post-deploy Functions logs available in Netlify Dashboard > Functions tab
- Image orphan check: DevTools > Application > IndexedDB > processflow_images

---

## Change Log

| Date | Description |
|------|-------------|
| 2026-03-12 | Initial creation |
| 2026-03-18 | Netlify deployment completed (processflow-generator.netlify.app) |
| 2026-03-18 | Word template v7 full rewrite (wordExport.js) |
| 2026-03-18 | User testing completed, all items ✅ |

---
---

# Phase 7 — 통합 테스트 + Netlify 배포 `✅ 완료`

> 전체 기능을 E2E 시나리오로 검증하고 Netlify에 배포한다

**완료일**: 2026-03-18
**상태**: ✅ 완료
**선행 조건**: Phase 6 완료 (모든 기능 구현 완료)

---

## 개요

8개의 수동 테스트 시나리오로 전체 기능을 검증하고, Netlify에 최종 배포한다.
배포 후 운영 환경에서도 동일한 시나리오를 재실행하여 로컬과 차이가 없는지 확인한다.
발견된 버그는 즉시 수정 후 재테스트한다.

---

## 완료 예정 / 완료 항목

| # | 작업 | 상태 |
|---|------|------|
| 1 | Netlify 프로젝트 생성 및 GitHub 연결 | ✅ |
| 2 | Netlify 환경변수 설정 | ✅ |
| 3 | 수동 테스트 T01~T08 실행 (로컬) | ✅ |
| 4 | 버그 수정 (Word 템플릿 v7 전면 재작성) | ✅ |
| 5 | 수동 테스트 T01~T08 재실행 (배포 URL) | ✅ |

---

## Netlify 환경변수 설정

Netlify 대시보드 > Site settings > Environment variables:

| 변수명 | 값 | 비고 |
|--------|-----|------|
| `ANTHROPIC_API_KEY` | 실제 API 키 | 절대 코드에 포함 금지 |
| `CLAUDE_MODEL` | `claude-sonnet-4-20250514` | 모델 변경 시 여기만 수정 |

---

## 수동 테스트 시나리오

### T01 — 기본 CRUD 흐름
부서 추가 → 그룹 추가 → 프로세스 추가 → 단계 3개 추가 → 사이드바 및 메인 화면 표시 확인.

### T02 — 이미지 첨부 및 저장 유지
단계에 이미지 2장 첨부 → 저장 → 새로고침 → 이미지 정상 표시 확인. DevTools IndexedDB에 Blob 확인.

### T03 — 삭제 시 이미지 정합성
이미지 포함 프로세스 삭제 → IndexedDB에서 이미지 id 제거 확인 (orphan 없음).

### T04 — 다이어그램 렌더링
SAMPLE_DATA CO팀 → 프로세스 카드 ▼ → SwimLane 확인. 프로세스 상세 → LinearFlow 확인.

### T05 — Word 내보내기 품질
그룹 선택 → [📥 Word 내보내기] → .docx 다운로드 → Windows Word → 표지, 요약, 단계별 상세, 이미지, 한글 폰트 확인.

### T06 — AI 자동 구조화
LV2 [+ 프로세스 추가] → [✨ AI 자동 생성] → 텍스트 입력 → 3단계 위저드 → [편집기에서 열기] → LV3 확인.

### T07 — 데이터 영속성
부서/그룹/프로세스/단계 데이터 입력 → 새로고침 → LocalStorage에서 전체 복원 확인.

### T08 — 배포 환경 전체 재검증
Netlify 배포 URL에서 T01~T07 모두 재실행. AI 기능, 이미지 첨부, Word 다운로드 확인.

---

## 배포 결과

| 항목 | 값 |
|------|-----|
| 사이트명 | processflow-generator |
| 배포 URL | https://processflow-generator.netlify.app |
| 관리자 URL | https://app.netlify.com/projects/processflow-generator |
| Project ID | e1295837-05c0-4783-bb5e-505f042c38de |
| 환경변수 | ANTHROPIC_API_KEY, CLAUDE_MODEL 설정 완료 |
| 배포 방식 | Netlify CLI (`netlify deploy --prod`) |
| 배포일 | 2026-03-18 |

---

## 설계 결정 사항

| 항목 | 결정 | 이유 |
|------|------|------|
| 테스트 방식 | 수동 E2E | 소규모 도구에서 자동화 테스트 오버엔지니어링 |
| Word 검증 환경 | Windows Word Desktop | Word Online/Mac은 렌더링 차이 있음 |
| 배포 플랫폼 | Netlify | Functions 통합 + React 빌드 원스톱 |

---

## 완료 기준

- T01~T08 전체 통과 (로컬 + 배포 URL)
- Netlify 배포 URL에서 AI 기능 포함 전체 동작 확인
- Word 파일 Windows Word에서 한글 폰트/이미지 정상 출력

---

## 개발 시 주의사항

- T05는 반드시 Windows Microsoft Word Desktop으로 검증 (Word Online 불가)
- 배포 후 Functions 로그는 Netlify 대시보드 > Functions 탭에서 확인
- 이미지 orphan 확인: DevTools > Application > IndexedDB > processflow_images

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-03-12 | 최초 작성 |
| 2026-03-18 | Netlify 배포 완료 (processflow-generator.netlify.app) |
| 2026-03-18 | Word 템플릿 v7 기준 전면 재작성 (wordExport.js) |
| 2026-03-18 | 사용자 테스트 완료, 전체 항목 ✅ 완료 처리 |
