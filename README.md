🌐 [한국어](./README_ko.md) | [English](./README.md)

# ProcessFlow

> A web-based workflow documentation tool that structures departmental business processes into steps and exports them as formatted Word documents.

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-processflow--generator.netlify.app-brightgreen?style=for-the-badge)](https://processflow-generator.netlify.app/)

https://github.com/user-attachments/assets/cef4d085-daaa-4fec-a5e3-e2a630244b45

## Overview

Organizations maintain dozens of recurring workflows — monthly closings, budget reviews, cost allocations — that are documented manually in Word files. ProcessFlow replaces that manual effort: users define departments, group related processes, break each process into ordered steps with metadata (screen name, responsible team, processing time, logic, warnings, screenshots), and export the result as a styled `.docx` file. An optional AI feature can auto-generate step structures from a free-text description via the Claude API.

## Manual

| Language | Link |
|---|---|
| 한국어 | [User Manual](./manuals/20260512_ProcessFlow_매뉴얼.md) |
| English | [User Manual](./manuals/20260512_ProcessFlow_Manual.md) |

## Table of Contents

- [How It Works](#how-it-works)
- [Tech Stack](#tech-stack)
- [AI Component](#ai-component)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Current Status](#current-status)
- [Limitations](#limitations)

## How It Works

```
Define Departments → Create Process Groups → Add Processes
        ↓
  Add Steps (screen, dept, time, logic, warnings, images)
        ↓
  View as Linear Flow or Swim Lane Diagram
        ↓
  Export Group → Styled Word Document (.docx)
```

Optionally, instead of adding steps manually:

```
Describe workflow in free text → AI generates step structure → Review & confirm → Steps added
```

## Tech Stack

| Technology | Role | Why |
|---|---|---|
| React 19 | UI components, state management | Component-based SPA with hooks, no class overhead |
| Vite 8 | Dev server, build tooling | Near-instant HMR, faster builds than Webpack |
| localStorage | Text data persistence (process tree) | Zero-config, no server needed, works offline |
| IndexedDB (idb) | Image blob storage for step screenshots | Handles large binary data that localStorage cannot (~hundreds of MB) |
| docx + file-saver | Client-side Word document generation | Generates .docx in-browser without a server-side renderer |
| @dnd-kit | Drag-and-drop step reordering | Lightweight, React-native DnD with accessible defaults |
| Netlify | Hosting, serverless functions | Free tier covers the use case; Functions proxy the API key server-side |
| Claude API (Anthropic) | AI-powered step auto-generation | Structured JSON output from free-text workflow descriptions |

## AI Component

| Input | Output |
|---|---|
| Free-text workflow description + department name | Structured step array (title, screen, dept, time, logic, warnings) |

- **Endpoint**: `/.netlify/functions/claude` — serverless proxy to the Anthropic Messages API
- **Model**: `claude-sonnet-4-6` (configurable via `CLAUDE_MODEL` env var)
- **Processing**: Rule-based JSON parsing with up to 3 automatic retries on malformed responses
- **Result nature**: Suggested draft — users review and confirm before steps are saved

## Quick Start

### Prerequisites

- Node.js 18+
- Anthropic API key (required only for the AI auto-generation feature)

### Install & Run

```bash
cd processflow
npm install
```

**Development (without AI)**:
```bash
npm run dev
```

**Development (with AI via Netlify Dev)**:
```bash
# Set environment variable
# Create .env in processflow/ with: ANTHROPIC_API_KEY=sk-ant-...

npx netlify dev
```

The app opens at `http://localhost:5173` (Vite) or `http://localhost:8888` (Netlify Dev).

### Build

```bash
npm run build
npm run preview
```

## Project Structure

```
processflow/
├── src/
│   ├── App.jsx              # 메인 앱, 전역 상태 관리
│   ├── constants.js         # 색상 토큰(C), SAMPLE_DATA, CLAUDE_MODEL
│   ├── storage.js           # LocalStorage read/write
│   ├── imageDB.js           # IndexedDB 이미지 CRUD
│   ├── wordExport.js        # Word(.docx) 생성 로직
│   ├── backup.js            # 백업/복원 (JSON 내보내기·불러오기)
│   ├── imageResize.js       # 이미지 리사이즈 (첨부 시 너비 축소)
│   └── components/
│       ├── layout/
│       │   ├── TopNav.jsx
│       │   └── Sidebar.jsx
│       ├── views/
│       │   ├── LV1View.jsx
│       │   ├── LV2View.jsx
│       │   └── LV3View.jsx
│       ├── diagrams/
│       │   ├── LinearFlow.jsx
│       │   └── SwimLane.jsx
│       ├── cards/
│       │   ├── GroupCard.jsx
│       │   ├── ProcessCard.jsx
│       │   └── StepCard.jsx
│       └── modals/
│           ├── AddModal.jsx
│           ├── AddMethodModal.jsx
│           ├── AIGenerateModal.jsx
│           ├── EditProcModal.jsx
│           ├── EditGroupModal.jsx
│           ├── StepModal.jsx
│           ├── DeleteConfirmModal.jsx
│           ├── ExportModal.jsx
│           └── RestoreConfirmModal.jsx
├── netlify/
│   └── functions/
│       └── claude.js        # Claude API 프록시 (API 키 서버사이드)
├── Phase/
│   ├── Phase0_ProjectSetup.md                  # ✅ Completed
│   ├── Phase1_StorageLayer.md                  # ✅ Completed
│   ├── Phase2_SkillCreation_AppSkeleton.md     # ✅ Completed
│   ├── Phase3_CRUD_DeleteHandlers.md           # ✅ Completed
│   ├── Phase4_Diagrams.md                      # ✅ Completed
│   ├── Phase5_WordExport.md                    # ✅ Completed
│   ├── Phase6_AIAutoStructure.md               # ✅ Completed
│   ├── Phase7_IntegrationTest_Deployment.md    # ✅ Completed
│   ├── Phase8_ParallelBranchDiagram.md         # ✅ Completed
│   ├── Phase9_DragAndDrop_UXImprovement.md     # ✅ Completed
│   ├── Phase10_CodeReview_Refactoring.md       # ✅ Completed
│   └── Phase11_BackupRestore.md                # ✅ Completed
├── Pre-Requirement/
│   └── ProcessFlow_개발명세서.txt    # v1.3
├── netlify.toml             # Netlify 빌드 설정
├── .env.local               # 로컬 개발용 환경변수 (gitignore)
└── README.md
```

## Documentation

| Document | Description |
|---|---|
| `Phase/Phase0_ProjectSetup.md` | Project setup (Vite, React, ESLint) |
| `Phase/Phase1_StorageLayer.md` | Storage layer (localStorage + IndexedDB) |
| `Phase/Phase2_SkillCreation_AppSkeleton.md` | App skeleton, navigation, skill generation |
| `Phase/Phase3_CRUD_DeleteHandlers.md` | CRUD operations, cascade delete handlers |
| `Phase/Phase4_Diagrams.md` | Linear flow and swim lane diagrams |
| `Phase/Phase5_WordExport.md` | Word (.docx) export with cover page and tables |
| `Phase/Phase6_AIAutoStructure.md` | AI auto-generation via Claude API |
| `Phase/Phase7_IntegrationTest_Deployment.md` | Integration testing and Netlify deployment |
| `Phase/Phase8_ParallelBranchDiagram.md` | Parallel branch/merge in swim lane diagrams |
| `Phase/Phase9_DragAndDrop_UXImprovement.md` | Drag-and-drop reordering, UX improvements |
| `Phase/Phase10_CodeReview_Refactoring.md` | Code structure review and refactoring |
| `Phase/Phase11_BackupRestore.md` | JSON backup/restore + image resize on upload |

## Current Status

All development phases are complete.

| Phase | Status | Deliverable |
|---|---|---|
| 0 — Project setup | ✅ Done | Vite + React + ESLint scaffold |
| 1 — Storage layer | ✅ Done | localStorage (text) + IndexedDB (images) persistence |
| 2 — App skeleton & navigation | ✅ Done | TopNav, Sidebar, LV1/LV2/LV3 view switching |
| 3 — CRUD & delete handlers | ✅ Done | Full CRUD with cascade delete across all hierarchy levels |
| 4 — Diagrams | ✅ Done | LinearFlow + SwimLane department-based diagrams |
| 5 — Word export | ✅ Done | .docx generation with cover page, step tables, embedded images |
| 6 — AI auto-generation | ✅ Done | Claude API proxy + 3-step wizard for step structure generation |
| 7 — Integration test & deploy | ✅ Done | Manual test scenarios (T01–T08), Netlify deployment |
| 8 — Parallel branch diagrams | ✅ Done | colIndex-based parallel branch/merge in SwimLane |
| 9 — Drag-and-drop & UX | ✅ Done | @dnd-kit step reordering, department validation, parallel numbering |
| 10 — Code review & refactoring | ✅ Done | ID-based derived state, ModalBase extraction, wordExport module split |
| 11 — Backup / Restore + Image Resize | ✅ Done | JSON export/import of both stores (overwrite with confirmation) + auto-downscale attached images to 1600px width |

## Limitations

- **No backend database** — all data lives in the browser (localStorage + IndexedDB). Clearing browser data deletes everything, though the built-in **Backup / Restore** (JSON export & import) lets you save and recover your data.
- **No authentication** — single-user, local-only.
- **No automated tests** — validation was performed through manual test scenarios.
- **AI feature requires API key** — the `ANTHROPIC_API_KEY` environment variable must be set for the AI auto-generation to work.
- **Mobile support** — responsive layout is implemented, but the primary target is desktop browsers.

---

<p align="center">Made with AI-assisted development</p>
