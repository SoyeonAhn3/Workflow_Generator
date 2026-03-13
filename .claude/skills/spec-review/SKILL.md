---
name: spec-review
version: 1.0
description: 작성된 컴포넌트/함수 코드를 입력하면 ProcessFlow 명세서 위반 항목을 점검하고 수정 제안을 제공한다. "명세 검토해줘", "spec 체크해줘", "코드 점검해줘", "/spec-review" 요청 시 트리거한다.
depends_on: []
produces: []
---

# spec-review Skill

작성된 코드를 ProcessFlow 명세서 기준으로 점검한다.
위반 항목을 목록화하고 수정 방향을 제안한다.

---

## STEP 1 — 코드 수집

코드가 제공되면 바로 STEP 2 진행.
제공되지 않으면:
```
"점검할 코드를 붙여넣어 주세요."
```

---

## STEP 2 — 명세서 참조 (필요 시)

점검 기준이 불명확한 경우:
```
Read("processflow/src/constants.js")  // 색상 토큰 C 확인
```

---

## STEP 3 — 점검 항목 체크

아래 항목을 순서대로 점검:

### 1. 색상 토큰 미사용 감지
- 하드코딩 hex 색상 (`#RRGGBB`, `rgb(...)`) 사용 여부
- → `C.navy`, `C.blue` 등 토큰으로 교체 제안

### 2. Inline CSS 위반
- `className` 속성 사용 여부
- 외부 CSS 파일 import 여부
- → 모두 inline style로 교체 제안

### 3. 버튼 위치 규칙 위반 (Section 15)
- Word 내보내기 버튼이 LV3 이외 위치에 있으면 경고
- 그룹/프로세스 추가 버튼이 사이드바에 있으면 경고
- 부서 추가 버튼이 사이드바 하단이 아닌 곳에 있으면 경고

### 4. 필드 레이블명 오류
- "화면명" → "화면명 (T-Code/프로그램)" 표기 확인
- Section 번호가 UI에 표시되면 경고 (예: "1-1", "1-1-1" 금지)

### 5. IndexedDB 삭제 누락
- 삭제 함수(`handleDelete*`)에 `deleteImages` 호출 없으면 경고
- `updateData` 전에 `deleteImages` 호출되는지 순서 확인

### 6. 이미지 Base64 직접 저장 감지
- `src="data:image/..."` 또는 Base64 문자열을 state/storage에 저장하는 코드 감지
- → id 참조 방식 (`loadImage(img.id)`)으로 수정 제안

---

## STEP 4 — 결과 출력

출력 포맷:
```
## 🔍 Spec Review 결과

### ✅ 통과 항목
- [통과한 항목들]

### ⚠️ 위반 항목
| # | 항목 | 발견 위치 | 수정 제안 |
|---|------|-----------|-----------|
| 1 | 하드코딩 색상 | line 12: `color: '#2E75B6'` | `color: C.blue` |
| 2 | ... | ... | ... |

### 📋 수정 우선순위
High: [즉시 수정 필요]
Medium: [권장 수정]
Low: [선택적 개선]
```

위반 없으면:
```
✅ 명세서 위반 없음 — 모든 항목 통과
```
