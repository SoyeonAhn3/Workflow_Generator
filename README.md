🌐 [한국어](./README_ko.md) | [English](./README.md)

# ProcessFlow

> A web-based workflow documentation tool that structures departmental business processes into steps and exports them as formatted Word documents.

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-processflow--generator.netlify.app-brightgreen?style=for-the-badge)](https://processflow-generator.netlify.app/)

https://github.com/user-attachments/assets/cef4d085-daaa-4fec-a5e3-e2a630244b45

## Overview

Organizations maintain dozens of recurring workflows — monthly closings, budget reviews, cost allocations — that are documented manually in Word files. ProcessFlow replaces that manual effort: users define departments, group related processes, break each process into ordered steps with metadata (screen name, responsible team, processing time, logic, warnings, screenshots), and export the result as a styled `.docx` file. An optional AI feature can auto-generate step structures from a free-text description via the Claude API.

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
├── index.html                  # Entry HTML
├── package.json                # Dependencies and scripts
├── vite.config.js              # Vite configuration
├── netlify.toml                # Netlify build & function config
├── netlify/functions/
│   └── claude.js               # Claude API serverless proxy
├── public/
│   ├── favicon.svg
│   └── icons.svg
└── src/
    ├── main.jsx                # React entry point
    ├── App.jsx                 # Root component, state, navigation
    ├── constants.js            # Color tokens, sample data, model config
    ├── storage.js              # localStorage read/write
    ├── imageDB.js              # IndexedDB image blob CRUD
    ├── wordExport.js           # Word document generation (cover, flow, steps)
    ├── wordExport.helpers.js   # Word builder helper utilities
    ├── hooks/
    │   └── useIsMobile.js      # Mobile breakpoint hook
    ├── styles/
    │   └── modalStyles.js      # Shared modal style objects
    └── components/
        ├── ErrorBoundary.jsx   # React error boundary
        ├── layout/
        │   ├── TopNav.jsx      # Top navigation bar
        │   └── Sidebar.jsx     # Collapsible sidebar (overlay on mobile)
        ├── views/
        │   ├── LV1View.jsx     # Department overview (card grid)
        │   ├── LV2View.jsx     # Process group list
        │   └── LV3View.jsx     # Step detail + diagrams
        ├── cards/
        │   └── StepCard.jsx    # Individual step card
        ├── diagrams/
        │   ├── LinearFlow.jsx  # Linear flow diagram (a → b → c)
        │   └── SwimLane.jsx    # Swim lane diagram (by department)
        └── modals/
            ├── ModalBase.jsx         # Shared modal wrapper
            ├── AddModal.jsx          # Add dept/group/process
            ├── StepModal.jsx         # Add/edit step
            ├── DeleteConfirmModal.jsx # Delete confirmation
            ├── ExportModal.jsx       # Word export dialog
            ├── AddMethodModal.jsx    # Choose manual vs AI add
            ├── AIGenerateModal.jsx   # AI generation wizard
            ├── EditProcModal.jsx     # Edit process metadata
            └── EditGroupModal.jsx    # Edit group name
```

## Documentation

| Document | Description |
|---|---|
| `Phase/Phase0_환경설정.md` | Project setup (Vite, React, ESLint) |
| `Phase/Phase1_저장소레이어.md` | Storage layer (localStorage + IndexedDB) |
| `Phase/Phase2_스킬생성_앱골격.md` | App skeleton, navigation, skill generation |
| `Phase/Phase3_CRUD_삭제핸들러.md` | CRUD operations, cascade delete handlers |
| `Phase/Phase4_다이어그램.md` | Linear flow and swim lane diagrams |
| `Phase/Phase5_Word내보내기.md` | Word (.docx) export with cover page and tables |
| `Phase/Phase6_AI자동구조화.md` | AI auto-generation via Claude API |
| `Phase/Phase7_통합테스트_배포.md` | Integration testing and Netlify deployment |
| `Phase/Phase8_병렬분기다이어그램.md` | Parallel branch/merge in swim lane diagrams |
| `Phase/Phase9_드래그앤드롭_UX개선.md` | Drag-and-drop reordering, UX improvements |
| `Phase/Phase10_코드구조점검_리팩토링.md` | Code structure review and refactoring |

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

## Limitations

- **No backend database** — all data lives in the browser (localStorage + IndexedDB). Clearing browser data deletes everything.
- **No authentication** — single-user, local-only.
- **No automated tests** — validation was performed through manual test scenarios.
- **AI feature requires API key** — the `ANTHROPIC_API_KEY` environment variable must be set for the AI auto-generation to work.
- **Mobile support** — responsive layout is implemented, but the primary target is desktop browsers.

---

<p align="center">Made with AI-assisted development</p>
