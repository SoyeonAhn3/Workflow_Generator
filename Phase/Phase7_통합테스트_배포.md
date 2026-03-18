# Phase 7 — 통합 테스트 + Netlify 배포 `✅ 완료`

> 전체 기능을 E2E 시나리오로 검증하고 Netlify에 배포한다

**상태**: ✅ 완료
**선행 조건**: Phase 6 완료 (모든 기능 구현 완료)

---

## 개요

8개의 수동 테스트 시나리오로 전체 기능을 검증하고, Netlify에 최종 배포한다.
배포 후 운영 환경에서도 동일한 시나리오를 재실행하여 로컬과 차이가 없는지 확인한다.
발견된 버그는 즉시 수정 후 재테스트한다.

---

## 완료 예정 항목

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

```
1. 부서 추가 (예: "테스트팀")
2. 그룹 추가 (예: "테스트 프로세스")
3. 프로세스 추가 (직접 입력)
4. 단계 3개 추가 (각각 화면명, Logic, 처리시간 입력)
5. 각 단계 ▼ 펼쳐서 내용 확인
기대 결과: 모든 항목이 사이드바 및 메인 화면에 표시됨
```

### T02 — 이미지 첨부 및 저장 유지

```
1. 단계에 이미지 2장 첨부
2. StepModal 저장
3. 브라우저 새로고침
4. 해당 단계 ▼ 펼쳐서 이미지 확인
기대 결과: 새로고침 후에도 이미지 2장 정상 표시
검증 포인트: DevTools > Application > IndexedDB에 Blob 존재 확인
```

### T03 — 삭제 시 이미지 정합성

```
1. 이미지가 포함된 프로세스 삭제
2. DevTools > Application > IndexedDB 확인
기대 결과: 삭제된 프로세스의 이미지 id가 IndexedDB에서 제거됨
           (Orphan 이미지 없음)
```

### T04 — 다이어그램 렌더링

```
1. SAMPLE_DATA CO팀 > 마감 프로세스 그룹 선택
2. 프로세스 카드 ▼ 펼치기 → SwimLane 확인
3. 프로세스 상세 보기 → LinearFlow 확인
기대 결과:
  - LinearFlow: 단계 번호 뱃지, 화살표, screenName/PT 표시
  - SwimLane: 레인별 노드 배치, 레인 전환 점선 화살표
```

### T05 — Word 내보내기 품질

```
1. 그룹 선택 > [📥 Word 내보내기] 클릭
2. ExportModal에서 [Word 파일 다운로드]
3. 다운로드된 .docx를 Windows Microsoft Word로 열기
확인 항목:
  [ ] 표지: 그룹명, 부서명, 정보 테이블 정상 출력
  [ ] 요약 테이블: 프로세스 목록 정상 출력
  [ ] 단계별 상세: 화면명, Logic, 주의사항 정상 출력
  [ ] 이미지: 첨부된 이미지 정상 삽입
  [ ] 한글 폰트: 전체 맑은 고딕 적용 확인
```

### T06 — AI 자동 구조화

```
1. LV2 [+ 프로세스 추가] → [✨ AI 자동 생성] 선택
2. 업무 흐름 텍스트 입력
   예: "KSB5에서 가공비 현황 조회 → KB21N으로 전표 생성 → KSB5에서 결과 검증"
3. [✨ AI로 구조화] 클릭
4. Step 3 결과 미리보기 확인
5. [편집기에서 열기] 클릭
기대 결과: 3개 단계가 자동 생성되어 LV3에 표시됨
```

### T07 — 데이터 영속성

```
1. 부서/그룹/프로세스/단계 데이터 입력
2. 브라우저 새로고침
3. 사이드바 및 메인 화면 확인
기대 결과: 입력한 모든 데이터가 복원됨
           LocalStorage "processflow_v1" 키에 저장 확인
```

### T08 — 배포 환경 전체 재검증

```
Netlify 배포 URL에서 T01~T07 모두 재실행
특히 확인:
  [ ] AI 기능 (Netlify Functions 환경변수 적용 확인)
  [ ] 이미지 첨부 및 IndexedDB 저장
  [ ] Word 다운로드
```

---

## 배포 설정

### netlify.toml (Phase 0에서 작성, 최종 확인)

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

### 배포 결과

| 항목 | 값 |
|------|-----|
| 사이트명 | processflow-generator |
| 배포 URL | https://processflow-generator.netlify.app |
| 관리자 URL | https://app.netlify.com/projects/processflow-generator |
| Project ID | e1295837-05c0-4783-bb5e-505f042c38de |
| 환경변수 | ANTHROPIC_API_KEY, CLAUDE_MODEL 설정 완료 |
| 배포 방식 | Netlify CLI (`netlify deploy --prod`) |
| 배포일 | 2026-03-18 |

### GitHub → Netlify 연결 순서 (참고)

```
1. GitHub에 저장소 push
2. Netlify > Add new site > Import an existing project
3. GitHub 저장소 선택
4. Build settings 확인 (command: npm run build, publish: dist)
5. Environment variables 설정 (ANTHROPIC_API_KEY, CLAUDE_MODEL)
6. Deploy
```

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
