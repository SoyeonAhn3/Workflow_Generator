# Phase 0 — Project Setup `✅ Completed`

> Set up the project skeleton and development environment so the app boots with zero application code

**Completed**: 2026-03-13
**Status**: ✅ Completed
**Prerequisites**: None (initial Phase)

---

## Overview

Initialize a Vite + React 18 project, install all required packages, and configure Netlify Functions integration.
Define shared color tokens, sample data, and the Claude model constant in `constants.js` so every future component can reference them from day one.

---

## Deliverables

| # | Task | Status | Type |
|---|------|--------|------|
| 1 | Vite + React 18 project creation | ✅ | setup |
| 2 | Production / dev package installation | ✅ | setup |
| 3 | Folder structure creation | ✅ | setup |
| 4 | `netlify.toml` configuration | ✅ | setup |
| 5 | `.gitignore` setup | ✅ | setup |
| 6 | `.env.local` creation (local API key) | ✅ | setup |
| 7 | `constants.js` (color tokens, sample data, model) | ✅ | setup |
| 8 | `netlify/functions/claude.js` empty shell | ✅ | setup |

---

## Implementation Details

### 1. Project Creation

```bash
npm create vite@latest processflow -- --template react
cd processflow
```

### 2. Package Installation

```bash
# Production
npm install react react-dom docx file-saver idb

# Development
npm install -D vite @vitejs/plugin-react netlify-cli

# Netlify Functions (server-side Claude API call)
npm install @anthropic-ai/sdk
```

### 3. constants.js Core Content

```js
// Color tokens
export const C = {
  navy: "#1F4E79", blue: "#2E75B6", blueMid: "#4A90C4",
  blueLight: "#D6E4F0", bluePale: "#EBF3FB",
  gray700: "#404040", gray500: "#595959", gray300: "#BFBFBF", gray100: "#F2F2F2",
  white: "#FFFFFF", border: "#E2E8F0",
  red: "#EF4444", redLight: "#FEF2F2", redBorder: "#FECACA",
}

// Department colors
export const DEPT_COLORS = ["#1F4E79","#2E75B6","#059669","#d97706","#7c3aed"]

// Claude model — change this single line when switching models
export const CLAUDE_MODEL = "claude-sonnet-4-20250514"

// Sample initial data (per Section 13)
export const SAMPLE_DATA = [ ... ]
```

### 4. netlify.toml

```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## Design Decisions

| Item | Decision | Reason |
|------|----------|--------|
| Build tool | Vite (not CRA) | Faster builds, current industry standard |
| Publish path | `dist` | Vite default output directory |
| ANTHROPIC_API_KEY location | Netlify dashboard env vars only | Prevent client-side exposure |
| CLAUDE_MODEL management | Single constant in constants.js | One-line change when switching models |

---

## Acceptance Criteria

- `netlify dev` serves empty React app at `http://localhost:8888`
- No browser console errors
- `import { C } from './constants'` → `C.navy` resolves correctly

---

## Development Notes

- Must run `netlify dev` instead of `npm run dev` to include Functions
- Vite outputs to `dist/` not `build/` — must match `publish` in netlify.toml
- `.env.local` must never be git-committed

---

## Change Log

| Date | Description |
|------|-------------|
| 2026-03-12 | Initial creation |
| 2026-03-13 | Phase 0 completed |

---
---

# Phase 0 — 프로젝트 환경 설정 `✅ 완료`

> 코드 한 줄 없이 앱이 뜨는 뼈대와 개발 환경을 완성한다

**완료일**: 2026-03-13
**상태**: ✅ 완료
**선행 조건**: 없음 (최초 Phase)

---

## 개요

Vite + React 18 기반 프로젝트를 초기화하고, 필요한 패키지를 설치한다.
Netlify Functions 연동을 위한 설정 파일을 작성하고, 전체 앱에서 공통으로
사용하는 색상 토큰, 샘플 데이터, 모델명 상수를 `constants.js`에 정의한다.

---

## 완료 예정 / 완료 항목

| # | 작업 | 상태 | 타입 |
|---|------|------|------|
| 1 | Vite + React 18 프로젝트 생성 | ✅ | setup |
| 2 | 프로덕션/개발 패키지 설치 | ✅ | setup |
| 3 | 폴더 구조 생성 | ✅ | setup |
| 4 | `netlify.toml` 작성 | ✅ | setup |
| 5 | `.gitignore` 설정 | ✅ | setup |
| 6 | `.env.local` 생성 (로컬 API 키) | ✅ | setup |
| 7 | `constants.js` 작성 (색상 토큰, 샘플 데이터, 모델) | ✅ | setup |
| 8 | `netlify/functions/claude.js` 빈 껍데기 생성 | ✅ | setup |

---

## 세부 구현 내용

### 1. 프로젝트 생성

```bash
npm create vite@latest processflow -- --template react
cd processflow
```

### 2. 패키지 설치

```bash
# 프로덕션
npm install react react-dom docx file-saver idb

# 개발
npm install -D vite @vitejs/plugin-react netlify-cli

# Netlify Functions (서버사이드 Claude API 호출)
npm install @anthropic-ai/sdk
```

### 3. constants.js 핵심 내용

```js
// 색상 토큰
export const C = {
  navy: "#1F4E79", blue: "#2E75B6", blueMid: "#4A90C4",
  blueLight: "#D6E4F0", bluePale: "#EBF3FB",
  gray700: "#404040", gray500: "#595959", gray300: "#BFBFBF", gray100: "#F2F2F2",
  white: "#FFFFFF", border: "#E2E8F0",
  red: "#EF4444", redLight: "#FEF2F2", redBorder: "#FECACA",
}

// 부서 색상
export const DEPT_COLORS = ["#1F4E79","#2E75B6","#059669","#d97706","#7c3aed"]

// Claude 모델명 — 변경 시 이 한 줄만 수정
export const CLAUDE_MODEL = "claude-sonnet-4-20250514"

// 샘플 초기 데이터 (Section 13 기준)
export const SAMPLE_DATA = [ ... ]
```

### 4. netlify.toml

```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 설계 결정 사항

| 항목 | 결정 | 이유 |
|------|------|------|
| 빌드 도구 | Vite (CRA 대신) | 빌드 속도 우수, 현재 업계 표준 |
| publish 경로 | `dist` | Vite 기본 빌드 출력 경로 |
| ANTHROPIC_API_KEY 위치 | Netlify 대시보드 환경변수에만 | 클라이언트 노출 방지 |
| CLAUDE_MODEL 관리 | constants.js 상수 1줄 | 모델 변경 시 1곳만 수정 |

---

## 완료 기준

- `netlify dev` 실행 시 `http://localhost:8888`에서 빈 React 앱 로딩
- 브라우저 콘솔 에러 없음
- `constants.js` import 후 `C.navy` 정상 참조 확인

---

## 개발 시 주의사항

- `npm run dev` 대신 `netlify dev`로 실행해야 Functions 포함 동작
- Vite 빌드 출력은 `build/`가 아닌 `dist/` — netlify.toml의 `publish` 경로 일치 필요
- `.env.local`은 절대 git commit 금지

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-03-12 | 최초 작성 |
| 2026-03-13 | Phase 0 완료 |
