---
name: gen-delete-handler
version: 1.0
description: 삭제 대상 레벨(dept/group/process/step)을 입력하면 IndexedDB 정합성이 완전히 구현된 삭제 핸들러를 생성한다. "삭제 핸들러 만들어줘", "delete handler 생성해줘", "/gen-delete-handler" 요청 시 트리거한다.
depends_on: []
produces: []
---

# gen-delete-handler Skill

레벨별 삭제 핸들러를 생성한다. IndexedDB → LocalStorage 순서를 반드시 준수한다.

---

## STEP 1 — 입력 수집

아래 2가지가 파악되면 바로 STEP 2 진행:
- 삭제 레벨: dept / group / process / step 중 하나
- 삭제 시 함께 제거할 하위 데이터 범위

부족하면 한 번만 질문:
```
"어떤 레벨의 삭제 핸들러가 필요한가요?
1. 삭제 레벨 (dept / group / process / step)
2. 함께 삭제할 하위 데이터 (예: group 삭제 시 하위 process와 image 전부)"
```

---

## STEP 2 — 핸들러 생성

### 레벨별 이미지 id 수집 패턴

**dept 삭제** (3단계 flatMap):
```js
const imageIds = dept.groups
  .flatMap(g => g.processes)
  .flatMap(p => p.steps)
  .flatMap(s => s.images ?? [])
  .map(img => img.id)
```

**group 삭제** (2단계 flatMap):
```js
const imageIds = group.processes
  .flatMap(p => p.steps)
  .flatMap(s => s.images ?? [])
  .map(img => img.id)
```

**process 삭제** (1단계 flatMap):
```js
const imageIds = process.steps
  .flatMap(s => s.images ?? [])
  .map(img => img.id)
```

**step 삭제** (직접 추출):
```js
const imageIds = (step.images ?? []).map(img => img.id)
```

### 반드시 포함할 순서
1. 이미지 id 수집 (flatMap)
2. `await deleteImages(imageIds)` — IndexedDB 먼저 삭제
3. `updateData(prev => ...)` — LocalStorage 나중 저장
4. 선택 상태 초기화 (`setSelDept(null)` 등)

### 생성 템플릿

```js
const handleDelete[Level] = async () => {
  // 1. 하위 이미지 id 수집
  const imageIds = [target]
    .flatMap(/* 레벨에 맞는 flatMap */)
    .map(img => img.id)

  // 2. IndexedDB 먼저 삭제
  await deleteImages(imageIds)

  // 3. LocalStorage 갱신
  updateData(prev => prev.filter(/* 필터 조건 */))

  // 4. 선택 상태 초기화
  setSel[Level](null)
  // 필요 시 상위 선택도 초기화
}
```

---

## STEP 3 — 출력

채팅에 생성된 핸들러 코드를 출력한다.

출력 포맷:
```
✅ 삭제 핸들러 생성 완료
🔗 레벨: [삭제 레벨]
⚠️ 주의: deleteImages → updateData 순서 유지 필수

[전체 핸들러 코드]
```
