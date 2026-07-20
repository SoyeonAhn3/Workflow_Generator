# Phase 11 — Backup / Restore + Image Resize `✅ Completed`

> Protect browser-local data: JSON backup/restore (export & import both stores) plus automatic image downscaling on upload to keep storage, Word files, and backup files small

**Completed**: 2026-07-20
**Status**: ✅ Completed
**Prerequisites**: Phase 10 completed
**Feature**: F18, F19 (spec priority: v1.5 recommended)

---

## Overview

All app data lives only in the browser — text tree in `localStorage("processflow_v2")` and image blobs in `IndexedDB("processflow_images")` — so clearing browser data wipes everything (README's #1 limitation).
Phase 11 adds **Backup** (export the entire dataset to one `.json` file) and **Restore** (overwrite the current data from that file, behind a confirmation dialog).
The key design point: a correct backup must bundle **both** stores, and since JSON cannot hold binary blobs, images are converted to **Base64 (dataUrl)** strings.
A pre-existing bug — the step-delete confirmation showing an empty name — was also fixed during testing.

**Image Resize (F19)**: attached images wider than 1600px are automatically downscaled (width-only, aspect ratio preserved) before storage — PNG stays PNG, other formats re-encode to JPEG. This shrinks IndexedDB usage, Word file size, and (newly) backup file size, since backups embed images as Base64.

---

## Deliverables

| # | File | Type | Status |
|---|------|------|--------|
| 1 | `src/backup.js` | new | ✅ |
| 2 | `src/components/modals/RestoreConfirmModal.jsx` | new | ✅ |
| 3 | `src/components/layout/Sidebar.jsx` | modified | ✅ |
| 4 | `src/App.jsx` | modified | ✅ |
| 5 | Step delete modal empty-name bug fix (`App.jsx`) | fix | ✅ |
| 6 | `src/imageResize.js` | new | ✅ |
| 7 | `src/components/modals/StepModal.jsx` (resize on upload) | modified | ✅ |

No new dependencies — `file-saver` was already present (used by Word export); resize uses the browser-native `canvas`.

---

## 1. backup.js

### Purpose
Core backup/restore logic. Merges the two stores on export and splits them back on restore.

### Core Functions

| Function | Role | Side effects |
|----------|------|--------------|
| `exportBackup(data)` | Collect image ids → load blobs → Base64 → build backup object → download `.json` | Triggers file download |
| `parseBackup(file)` | Read file, `JSON.parse`, validate shape (`data` must be array) | **None** (validation only) |
| `applyBackup(parsed)` | Base64 → Blob → IndexedDB, then text tree → localStorage | Overwrites both stores |
| `summarizeBackup(parsed)` | Count depts/groups/procs/steps/images for the confirm dialog | None |

### Backup File Shape
```json
{
  "version": 2,
  "exportedAt": "2026-07-20T10:00:00.000Z",
  "data": [ /* Department[] tree */ ],
  "images": [ { "id": "img_123", "name": "screen.png", "dataUrl": "data:image/png;base64,..." } ]
}
```

### Design Decisions
- **Bundle both stores**: image ids are collected via the same `flatMap` pattern used by the delete handlers; text-only backup would restore broken image references.
- **Base64 conversion**: `Blob → dataUrl` via `FileReader.readAsDataURL`; `dataUrl → Blob` via `fetch(dataUrl).blob()` (reliable for `data:` URLs).
- **parse / apply separation**: parsing has no side effects so the confirmation dialog can preview contents *before* anything is overwritten.
- **Overwrite semantics**: restore replaces the whole dataset. Old images not referenced by the new tree remain as harmless orphans (not cleared, to avoid data loss if a restore fails midway).

---

## 2. RestoreConfirmModal.jsx

### Purpose
Confirmation dialog shown before an overwrite. Built on `ModalBase` (shared ESC/overlay).

### Content
- Warning icon + "restore from backup" heading
- **Preview summary**: backup timestamp, dept/group/process counts, step/image counts
- Warning box: "current data will be lost — this cannot be undone"
- Buttons: `취소` / `복원하기`

---

## 3. Sidebar.jsx — Backup / Restore buttons

- Added `[⬇ 백업]` `[⬆ 복원]` buttons in the sidebar bottom section (below stats + "부서 추가").
- Backup button → `onBackup()`.
- Restore button → clicks a hidden `<input type="file" accept=".json">`; on change, passes the file to `onRestore(file)` and resets `value` so the same file can be re-selected.
- New props: `onBackup`, `onRestore`.

---

## 4. App.jsx — Handler wiring

- New state: `restorePreview` = `{ parsed, summary } | null`.
- `handleBackup`: `await exportBackup(data)` with error alert.
- `handleRestoreFile(file)`: `parseBackup` → open confirm dialog (or alert on invalid file).
- `handleRestoreConfirm`: `applyBackup` → `setData(next)` → reset `selDeptId/selGroupId/selProcId` → close dialog → success alert.
- Renders `RestoreConfirmModal` when `restorePreview` is set.

---

## 5. Step delete empty-name bug fix

### Problem
The step-delete confirmation showed `"" 단계를 삭제하시겠습니까?` — an empty name. Cause: dept/group/process use a `name` field, but a step uses `title`, and `DeleteConfirmModal` only read `target.name`.

### Fix
```jsx
// App.jsx
targetName={deleteModal.target.name || deleteModal.target.title || ''}
```
Now the step title appears (e.g. `"물류 미결 현황 조회" 단계를 삭제하시겠습니까?`).

---

## 6. Image Resize (F19)

### Purpose
Downscale large attached images on upload so storage, Word export, and backup files stay small.

### Implementation
- `src/imageResize.js` — `resizeImageFile(file, { maxWidth = 1600 })`:
  - Uses `createImageBitmap` + `<canvas>`; **only downscales when width > 1600px** (never upscales or re-encodes small images).
  - **Width-only**: height is derived from the aspect ratio (no distortion), matching the existing "adjust width only" rule.
  - Format: PNG stays PNG (lossless); other types re-encode to JPEG (quality 0.85).
  - Any failure (unsupported API, `toBlob` null) falls back to the original file — upload is never blocked.
- `StepModal.jsx` — `handleImageAdd` passes the file through `resizeImageFile` before `saveImage`.

### Design Decisions
- **1600px width**: enough for crisp Word print (images shown at ~400pt) while cutting multi-MB captures to a few hundred KB.
- **Type detected from `blob.type`, not filename**: `wordExport.js` reads `record.blob.type`, so a correct Blob MIME is all that is needed — no filename/extension changes.
- **Existing images untouched**: resize applies only to newly attached images (safe, simple).

---

## Prerequisites & Dependencies

- Phase 10 completed (ID-based derived state, ModalBase unification — both reused here).
- `file-saver` (existing), `idb` (existing) — no new packages.

---

## Development Notes

- Restore overwrites everything and cannot be undone — always keep the confirmation dialog.
- Backup embeds images as Base64, so the file grows with total image size; large image sets produce large `.json` files (acceptable for local single-user use).
- Image resize triggers only above 1600px width; images already ≤1600px (and all pre-existing images) are stored unchanged.
- Verified: build (`vite build`) passes; lint clean for the changed files. End-to-end (backup → delete → restore → images intact) confirmed manually in the browser.

---

## Change Log

| Date | Description |
|------|-------------|
| 2026-07-20 | Initial creation — Phase 11 (F18 backup/restore) completed; step-delete name bug fixed |
| 2026-07-20 | Added F19 image resize (auto-downscale attached images to 1600px width) |

---
---

# Phase 11 — 백업 / 복원 + 이미지 리사이즈 `✅ 완료`

> 브라우저 로컬 데이터 보호: 두 저장소를 파일 하나로 내보내고 복원하는 백업/복원 + 첨부 이미지 업로드 시 자동 축소로 저장소·Word·백업 파일 용량 절감

**완료일**: 2026-07-20
**상태**: ✅ 완료
**선행 조건**: Phase 10 완료
**기능**: F18, F19 (명세 우선순위: v1.5 권장)

---

## 개요

앱의 모든 데이터는 브라우저 안에만 존재한다 — 텍스트 트리는 `localStorage("processflow_v2")`, 이미지 Blob은 `IndexedDB("processflow_images")` — 따라서 브라우저 데이터를 지우면 전부 사라진다(README 1순위 한계점).
Phase 11은 **백업**(전체 데이터를 `.json` 파일 하나로 내보내기)과 **복원**(확인창을 거쳐 현재 데이터를 그 파일로 덮어쓰기)을 추가한다.
핵심 설계 포인트: 온전한 백업은 **두 저장소를 모두** 담아야 하며, JSON은 이진 Blob을 담을 수 없으므로 이미지는 **Base64(dataUrl)** 문자열로 변환한다.
테스트 중 발견된 기존 버그(단계 삭제 확인창에 이름이 비어 보임)도 함께 수정했다.

**이미지 리사이즈 (F19)**: 첨부 이미지의 너비가 1600px를 넘으면 저장 전 자동 축소한다(너비만 조정, 높이는 비율 유지). PNG는 PNG 유지, 그 외는 JPEG로 재인코딩. 이로써 IndexedDB·Word 파일, 그리고 (이미지를 Base64로 담는) 백업 파일 용량이 함께 줄어든다.

---

## 완료 항목

| # | 파일 | 유형 | 상태 |
|---|------|------|------|
| 1 | `src/backup.js` | 신규 | ✅ |
| 2 | `src/components/modals/RestoreConfirmModal.jsx` | 신규 | ✅ |
| 3 | `src/components/layout/Sidebar.jsx` | 수정 | ✅ |
| 4 | `src/App.jsx` | 수정 | ✅ |
| 5 | 단계 삭제 확인창 이름 비어보임 버그 수정 (`App.jsx`) | 수정 | ✅ |
| 6 | `src/imageResize.js` | 신규 | ✅ |
| 7 | `src/components/modals/StepModal.jsx` (업로드 시 축소) | 수정 | ✅ |

신규 패키지 없음 — `file-saver`는 이미 존재(Word 내보내기에서 사용 중); 리사이즈는 브라우저 내장 `canvas` 사용.

---

## 1. backup.js

### 목적
백업/복원 핵심 로직. 내보낼 때 두 저장소를 합치고, 복원할 때 다시 분리한다.

### 핵심 함수

| 함수 | 역할 | 부작용 |
|------|------|--------|
| `exportBackup(data)` | 이미지 id 수집 → Blob 로드 → Base64 → 백업 객체 생성 → `.json` 다운로드 | 파일 다운로드 |
| `parseBackup(file)` | 파일 읽기, `JSON.parse`, 형식 검증(`data`가 배열인지) | **없음** (검증만) |
| `applyBackup(parsed)` | Base64 → Blob → IndexedDB, 이후 텍스트 트리 → localStorage | 두 저장소 덮어쓰기 |
| `summarizeBackup(parsed)` | 확인창용 부서/그룹/프로세스/단계/이미지 개수 집계 | 없음 |

### 백업 파일 구조
```json
{
  "version": 2,
  "exportedAt": "2026-07-20T10:00:00.000Z",
  "data": [ /* Department[] 트리 */ ],
  "images": [ { "id": "img_123", "name": "화면.png", "dataUrl": "data:image/png;base64,..." } ]
}
```

### 설계 결정 사항
- **두 저장소 모두 담기**: 이미지 id는 삭제 핸들러와 동일한 `flatMap` 패턴으로 수집. 텍스트만 백업하면 복원 시 이미지 참조가 깨진다.
- **Base64 변환**: `Blob → dataUrl`은 `FileReader.readAsDataURL`, `dataUrl → Blob`은 `fetch(dataUrl).blob()` (`data:` URL에 안정적).
- **파싱 / 적용 분리**: 파싱은 부작용이 없어, 덮어쓰기 *전에* 확인창에서 내용을 미리 보여줄 수 있다.
- **덮어쓰기 방식**: 복원은 전체 데이터를 교체. 새 트리가 참조하지 않는 기존 이미지는 무해한 orphan으로 남긴다(복원 중 실패 시 데이터 손실을 막기 위해 삭제하지 않음).

---

## 2. RestoreConfirmModal.jsx

### 목적
덮어쓰기 전에 표시하는 확인 팝업. `ModalBase`(공통 ESC/오버레이) 기반.

### 구성
- 경고 아이콘 + "백업 파일에서 복원" 제목
- **미리보기 요약**: 백업 일시, 부서/그룹/프로세스 개수, 단계/이미지 개수
- 경고 박스: "현재 데이터가 사라짐 — 되돌릴 수 없음"
- 버튼: `취소` / `복원하기`

---

## 3. Sidebar.jsx — 백업 / 복원 버튼

- 사이드바 하단(통계 + "부서 추가" 아래)에 `[⬇ 백업]` `[⬆ 복원]` 버튼 추가.
- 백업 버튼 → `onBackup()`.
- 복원 버튼 → 숨김 `<input type="file" accept=".json">`를 클릭시키고, 변경 시 파일을 `onRestore(file)`에 전달 + `value` 초기화(같은 파일 재선택 가능).
- 신규 props: `onBackup`, `onRestore`.

---

## 4. App.jsx — 핸들러 연결

- 신규 상태: `restorePreview` = `{ parsed, summary } | null`.
- `handleBackup`: `await exportBackup(data)` + 에러 alert.
- `handleRestoreFile(file)`: `parseBackup` → 확인창 열기 (형식 오류 시 alert).
- `handleRestoreConfirm`: `applyBackup` → `setData(next)` → `selDeptId/selGroupId/selProcId` 초기화 → 확인창 닫기 → 성공 alert.
- `restorePreview`가 있을 때 `RestoreConfirmModal` 렌더.

---

## 5. 단계 삭제 이름 비어보임 버그 수정

### 문제
단계 삭제 확인창이 `"" 단계를 삭제하시겠습니까?`처럼 이름을 비워 표시. 원인: 부서/그룹/프로세스는 `name` 필드를 쓰지만 단계는 `title`을 쓰는데, `DeleteConfirmModal`이 `target.name`만 읽었다.

### 수정
```jsx
// App.jsx
targetName={deleteModal.target.name || deleteModal.target.title || ''}
```
이제 단계 이름이 표시된다 (예: `"물류 미결 현황 조회" 단계를 삭제하시겠습니까?`).

---

## 6. 이미지 리사이즈 (F19)

### 목적
첨부한 큰 이미지를 업로드 시 축소하여 저장소·Word 내보내기·백업 파일 용량을 작게 유지한다.

### 구현
- `src/imageResize.js` — `resizeImageFile(file, { maxWidth = 1600 })`:
  - `createImageBitmap` + `<canvas>` 사용; **너비 1600px 초과일 때만 축소**(업스케일·작은 이미지 재인코딩 안 함).
  - **너비만 조정**: 높이는 비율대로 자동 계산(찌그러짐 없음) — 기존 "너비만 조정" 규칙 준수.
  - 형식: PNG는 PNG 유지(무손실), 그 외는 JPEG(품질 0.85)로 재인코딩.
  - 실패(미지원 API, `toBlob` null) 시 원본 반환 — 업로드는 절대 막지 않음.
- `StepModal.jsx` — `handleImageAdd`가 `saveImage` 전에 `resizeImageFile`을 거친다.

### 설계 결정 사항
- **1600px 너비**: Word 인쇄(약 400pt 표시)에 충분히 선명하면서 수 MB 캡처를 수백 KB로 축소.
- **형식은 파일명이 아닌 `blob.type`으로 판별**: `wordExport.js`가 `record.blob.type`을 읽으므로 Blob MIME만 정확하면 됨 — 파일명/확장자 변경 불필요.
- **기존 이미지는 그대로**: 새로 첨부하는 이미지에만 적용(안전·단순).

---

## 선행 조건 및 의존성

- Phase 10 완료 (ID 기반 파생 상태, ModalBase 통일 — 둘 다 여기서 재사용).
- `file-saver`(기존), `idb`(기존) — 신규 패키지 없음.

---

## 개발 시 주의사항

- 복원은 전체를 덮어쓰고 되돌릴 수 없다 — 확인창을 항상 유지할 것.
- 백업은 이미지를 Base64로 포함하므로 전체 이미지 용량만큼 파일이 커진다; 이미지가 많으면 `.json` 파일이 커짐(로컬 단일 사용자 용도로는 허용).
- 이미지 리사이즈는 너비 1600px 초과 시에만 동작; 이미 1600px 이하인 이미지(및 기존 이미지 전부)는 원본 그대로 저장됨.
- 검증: 빌드(`vite build`) 통과, 변경 파일 린트 클린. 백업 → 삭제 → 복원 → 이미지 유지 흐름을 브라우저에서 수동 확인 완료.

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-07-20 | 최초 작성 — Phase 11 (F18 백업/복원) 완료; 단계 삭제 이름 버그 수정 |
| 2026-07-20 | F19 이미지 리사이즈 추가 (첨부 이미지 너비 1600px로 자동 축소) |
