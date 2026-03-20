import { useState } from 'react'
import { C } from '../../constants'
import StepCard from '../cards/StepCard'
import LinearFlow from '../diagrams/LinearFlow'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

/**
 * SortableStepCard — useSortable 훅으로 StepCard를 감싸는 래퍼
 */
function SortableStepCard({ step, index, onEdit, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : 'auto',
  }

  return (
    <div ref={setNodeRef} style={style}>
      <StepCard
        step={step}
        index={index}
        onEdit={onEdit}
        onDelete={onDelete}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  )
}

/**
 * LV3View — 프로세스 상세 (단계 목록)
 */
export default function LV3View({ dept, group, proc, onDeleteProc, onEditProc, onAddStep, onEditStep, onDeleteStep, onReorderSteps, onBack }) {
  const [activeDragId, setActiveDragId] = useState(null)

  // steps를 colIndex 기준으로 정렬 (같은 colIndex면 배열 순서 유지)
  const sortedSteps = [...(proc?.steps ?? [])].map((s, i) => ({ ...s, _origIdx: i }))
  sortedSteps.sort((a, b) => {
    const aCol = a.colIndex ?? (a._origIdx + 1) * 1000  // colIndex 없으면 맨 뒤
    const bCol = b.colIndex ?? (b._origIdx + 1) * 1000
    if (aCol !== bCol) return aCol - bCol
    return a._origIdx - b._origIdx  // 같은 colIndex면 원본 순서 유지
  })

  // colIndex 기반 번호 맵 (같은 colIndex → 같은 번호, 미설정은 각각 고유 번호)
  const getEffectiveCol = (s) => s.colIndex ?? (s._origIdx + 1) * 1000
  const uniqueCols = [...new Set(sortedSteps.map(getEffectiveCol))].sort((a, b) => a - b)
  const colNumberMap = {}
  uniqueCols.forEach((col, i) => { colNumberMap[col] = i + 1 })
  const getStepNumber = (step) => colNumberMap[getEffectiveCol(step)]

  // 드래그 중인 카드 정보 (DragOverlay용)
  const activeStep = activeDragId
    ? sortedSteps.find(s => s.id === activeDragId)
    : null
  const activeIndex = activeStep ? getStepNumber(activeStep) - 1 : -1

  // 센서 설정: 5px 이상 움직여야 드래그 시작 (클릭과 드래그 구분)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  // 드래그 시작 → 어떤 카드를 잡았는지 기록
  const handleDragStart = (event) => {
    setActiveDragId(event.active.id)
  }

  // 드래그 끝 → 배열 재배치 + colIndex 재부여
  const handleDragEnd = (event) => {
    setActiveDragId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = sortedSteps.findIndex(s => s.id === active.id)
    const newIndex = sortedSteps.findIndex(s => s.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    // 1) sortedSteps 배열에서 위치 이동
    const reordered = arrayMove(sortedSteps, oldIndex, newIndex)

    // 2) 새 순서대로 colIndex 1, 2, 3, 4... 재부여 (1-based: 사용자 직관에 맞춤)
    //    _origIdx 등 임시 필드 제거, 원본 step 데이터 기반으로 갱신
    const nextSteps = reordered.map((s, i) => {
      const { _origIdx, ...clean } = s
      return { ...clean, colIndex: i + 1 }
    })

    // 3) 부모(App.jsx)에 전달
    onReorderSteps(nextSteps)
  }

  if (!proc) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '60vh',
        color: C.gray300,
        fontSize: 15,
      }}>
        사이드바에서 프로세스를 선택하세요
      </div>
    )
  }

  return (
    <div>
      {/* 뒤로가기 + 프로세스 그룹명 */}
      <button onClick={onBack} style={backBtnStyle}>
        ← {group?.name}
      </button>

      {/* 프로세스 상위 그룹 레이블 */}
      <div style={{ fontSize: 13, color: C.blue, fontWeight: 600, marginBottom: 4 }}>
        {group?.name}
      </div>

      {/* 프로세스 헤더 */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        marginBottom: 6,
      }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: C.navy, margin: 0, letterSpacing: '-0.5px' }}>
            {proc.name}
          </h2>
          {proc.description && (
            <p style={{ margin: '8px 0 0', fontSize: 13, color: C.gray500, lineHeight: 1.65 }}>
              {proc.description}
            </p>
          )}
        </div>
        <button onClick={onAddStep} style={addBtnStyle}>
          + 단계 추가
        </button>
      </div>

      {/* 메타 정보 테이블 */}
      <div style={{
        display: 'flex',
        borderTop: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
        marginBottom: 28,
        marginTop: 16,
      }}>
        {[
          { label: '담당 부서', value: proc.dept || '—' },
          { label: '프로세스 담당자', value: proc.owner || '—' },
          { label: 'Module', value: proc.module || '—' },
          { label: '업데이트', value: proc.updatedAt || '—' },
          { label: '총 단계', value: `${proc.steps?.length ?? 0}단계` },
        ].map((item, i) => (
          <div key={i} style={{
            flex: 1,
            padding: '12px 16px',
            borderRight: i < 4 ? `1px solid ${C.border}` : 'none',
          }}>
            <div style={{ fontSize: 11, color: C.gray500, marginBottom: 4, fontWeight: 500 }}>
              {item.label}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.gray700 }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* 전체 흐름도 */}
      <div style={{
        background: C.white, border: `1px solid ${C.border}`,
        borderRadius: 10, padding: '18px 22px', marginBottom: 28,
        boxShadow: C.cardShadow,
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 14 }}>
          전체 흐름도
        </div>
        <LinearFlow steps={sortedSteps} />
      </div>

      {/* 단계별 상세 */}
      <div style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 14 }}>
        단계별 상세
      </div>

      {/* 단계 목록 — DnD 영역 */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedSteps.map(s => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sortedSteps.map((step) => (
              <SortableStepCard
                key={step.id}
                step={step}
                index={getStepNumber(step) - 1}
                onEdit={() => onEditStep(step)}
                onDelete={() => onDeleteStep(step)}
              />
            ))}

            {proc.steps?.length === 0 && (
              <div style={{
                textAlign: 'center', color: C.gray300, fontSize: 14,
                padding: '40px 0',
                background: C.white, borderRadius: 10, border: `1px solid ${C.border}`,
              }}>
                아직 단계가 없습니다
              </div>
            )}

            {/* 단계 추가 */}
            <div
              onClick={onAddStep}
              style={{
                border: `2px dashed ${C.gray300}`,
                borderRadius: 10,
                padding: '14px 20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                color: C.gray500,
                fontSize: 13,
                fontWeight: 500,
                transition: 'border-color 0.15s, color 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = C.blue
                e.currentTarget.style.color = C.blue
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = C.gray300
                e.currentTarget.style.color = C.gray500
              }}
            >
              + 단계 추가
            </div>
          </div>
        </SortableContext>

        {/* 드래그 중 떠다니는 미리보기 */}
        <DragOverlay>
          {activeStep ? (
            <div style={{ opacity: 0.85 }}>
              <StepCard
                step={activeStep}
                index={activeIndex}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

const backBtnStyle = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: 13, color: C.blue, fontWeight: 500,
  padding: 0, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 4,
}

const addBtnStyle = {
  padding: '9px 20px', fontSize: 13, fontWeight: 600,
  background: C.navy, color: C.white, border: 'none',
  borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap',
  flexShrink: 0,
}
