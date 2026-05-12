# ProcessFlow

> A web-based workflow documentation tool that structures departmental business processes into steps and exports them as formatted Word documents.

| Item | Details |
|---|---|
| Version | v1.3 |
| Date | 2026-05-12 |
| Audience | General Users |

---

## Table of Contents

- [1. Overview](#1-overview)
- [2. Prerequisites](#2-prerequisites)
- [3. Getting Started](#3-getting-started)
- [4. Key Features](#4-key-features)
  - [4.1 Department Management (LV1)](#41-department-management-lv1)
  - [4.2 Process Group Management (LV2)](#42-process-group-management-lv2)
  - [4.3 Step Editing (LV3)](#43-step-editing-lv3)
  - [4.4 AI Process Auto-Generation](#44-ai-process-auto-generation)
  - [4.5 Diagram View](#45-diagram-view)
  - [4.6 Word Export](#46-word-export)
  - [4.7 Drag & Drop Reordering](#47-drag--drop-reordering)
- [5. Data Storage](#5-data-storage)
- [6. Cautions & Limitations](#6-cautions--limitations)
- [7. Troubleshooting (FAQ)](#7-troubleshooting-faq)

---

## 1. Overview

ProcessFlow is a web application that helps organizations systematically document recurring business processes such as monthly closings, budget reviews, and cost allocations. Users define departments, group related processes, break each process into ordered steps with metadata (screen name, responsible team, processing time, logic, warnings, screenshots), and export the result as a styled Word (.docx) file. An optional AI feature can auto-generate step structures from a free-text description via the Claude API.

| Item | Details |
|---|---|
| Platform | Web Browser (Chrome recommended) |
| Tech Stack | React 19 + Vite 8 |
| Data Storage | Browser localStorage (text) + IndexedDB (images) |
| Output Format | Word (.docx) |
| AI Feature | Anthropic Claude API (optional) |
| Deployment | Netlify |
| Internet Connection | Required for initial access (required for AI feature) |

---

## 2. Prerequisites

- [ ] A modern web browser such as Chrome or Edge
- [ ] Internet connection (for initial access)
- [ ] (For AI feature) Anthropic API key

---

## 3. Getting Started

1. Open the deployed URL in your web browser
2. Add a department from the left sidebar
3. Click a department to navigate to the Process Group view (LV2)
4. Add groups and create processes within each group
5. Click a process to open the Step Editor (LV3)
6. Add steps and fill in the details
7. Click the Word Export button to generate the document

---

## 4. Key Features

### 4.1 Department Management (LV1)

Add, edit, and delete departments. Manage the department list from the left sidebar.

| Action | How | Result |
|---|---|---|
| Add Department | Click '+ Add Department' in the sidebar | New department created |
| Select Department | Click department name | Navigate to LV2 view |
| Delete Department | Click the delete button | All sub-groups/processes/steps deleted |

> ⚠️ **Warning:** Deleting a department permanently removes all its groups, processes, and steps. This action cannot be undone.

---

### 4.2 Process Group Management (LV2)

Organize processes into groups within a department.

| Action | How | Result |
|---|---|---|
| Add Group | Click '+ Add Group' | New group card created |
| Add Process | Click '+ Add' inside a group card | Method selection modal appears |
| Edit Group | Click the edit button on the group header | Edit group name/description |
| Select Process | Click process name | Navigate to LV3 view |

---

### 4.3 Step Editing (LV3)

Add steps to a process and enter detailed information for each step.

| Field | Description | Required |
|---|---|---|
| Step Name | Name of the workflow step | Required |
| Screen Name | System/screen used for this step | Optional |
| Responsible Dept. | Department performing this step | Optional |
| Processing Time (PT) | Estimated processing time | Optional |
| Logic | Detailed processing method/procedure | Optional |
| Warnings | Cautions or important notes | Optional |
| Screenshots | Screen capture images (multiple allowed) | Optional |

---

### 4.4 AI Process Auto-Generation

Describe your workflow in free text, and AI will automatically generate a structured step sequence.

| Step | Action | Result |
|---|---|---|
| Step 1 | Select 'AI Auto-Generate' when adding a process | AI input modal appears |
| Step 2 | Enter process name + workflow description, click 'Structure with AI' | Claude API called, analysis in progress |
| Step 3 | Review generated steps, click 'Open in Editor' | Steps automatically added to LV3 |

> ⚠️ **Warning:** AI feature requires an Anthropic API key. AI-generated steps are drafts — always review before use.

---

### 4.5 Diagram View

Visualize process steps as diagrams.

| Diagram Type | Description | Use Case |
|---|---|---|
| Linear Flow | Steps arranged in sequential order | Quick overview of the entire flow |
| Swim Lane | Steps separated into department lanes | Visualize cross-department handoffs |

---

### 4.6 Word Export

Export a process group as a formatted Word (.docx) file.

| Item | Description |
|---|---|
| Export Unit | Per process group |
| Included Content | Cover page, step tables per process, screenshots |
| Image Handling | Base64 to ArrayBuffer conversion, embedded as actual images |
| File Format | .docx (Word 2007+) |

---

### 4.7 Drag & Drop Reordering

Reorder steps by dragging and dropping step cards.

| Action | How | Result |
|---|---|---|
| Reorder | Drag a step card to the desired position | Order updated and saved automatically |
| Parallel Steps | Set parallel branching at the same position | Displayed as parallel in Swim Lane |

---

## 5. Data Storage

- Text data (departments, groups, processes, step details) is stored in the browser's **localStorage**
- Image data (screenshots) is stored in the browser's **IndexedDB**
- No external server or database is used — all data exists only in the current browser
- Clearing browser data will permanently delete all stored information

---

## 6. Cautions & Limitations

> ⚠️ Clearing browser data (cache/cookies) permanently deletes all process data. Always export important data as Word documents for backup.

> ⚠️ There is no authentication or login — data is accessible only from the browser where it was created.

> ⚠️ AI features require an internet connection and a configured API key.

> ⚠️ The app works on mobile devices, but the best experience is on desktop browsers.

> ⚠️ Deleting a department, group, or process also deletes all child items and cannot be undone.

---

## 7. Troubleshooting (FAQ)

**Q. My data disappeared after closing and reopening the browser.**
A. Check if your browser is set to "Clear data on exit." If enabled, localStorage and IndexedDB are reset each time the browser closes.

**Q. The AI auto-generate button does not work.**
A. Verify that the Anthropic API key is configured in the environment variables. When running with Netlify Dev, a .env file with ANTHROPIC_API_KEY is required.

**Q. Images are not included in the Word export.**
A. Confirm that images are attached to the steps. Images are stored in IndexedDB — if browser data was cleared, images are also deleted.

**Q. I want to access the same data from another computer.**
A. Server synchronization is not currently supported. Use the Word export feature to back up and share your documents.

**Q. The AI-generated step structure is inaccurate.**
A. AI results are drafts. Use the "Re-enter" button to provide a more detailed workflow description and retry, or manually edit the steps in the editor.

---

> This manual was auto-generated on 2026-05-12.
