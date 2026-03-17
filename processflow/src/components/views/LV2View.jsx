import { useState } from 'react'
import { C } from '../../constants'
import SwimLane from '../diagrams/SwimLane'

/**
 * LV2View — 프로세스 카드 목록 (그룹 선택 후 표시)
 */
export default function LV2View({ dept, group, onSelectProc, onAddProc, onDeleteGroup, onDeleteProc, onEditProc, onExportWord, onBack }) {
  const [expandedProc, setExpandedProc] = useState(null)

  if (!group) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '60vh',
        color: C.gray300,
        fontSize: 15,
      }}>
        사이드바에서 그룹을 선택하세요
      </div>
    )
  }

  return (
    <div>
      {/* 헤더 */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        marginBottom: 24,
      }}>
        <div>
          <button onClick={onBack} style={backBtnStyle}>
            ← {dept?.name}
          </button>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: C.navy, margin: '4px 0 0', letterSpacing: '-0.5px' }}>
            {group.name}
          </h2>
          <p style={{ fontSize: 13, color: C.gray500, margin: '4px 0 0' }}>
            세부 프로세스 {group.processes.length}개
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={onExportWord} style={exportBtnStyle}>
            📥 Word 내보내기
          </button>
        </div>
      </div>

      {/* 프로세스 카드 목록 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {group.processes.map((proc, idx) => {
          const isExpanded = expandedProc === proc.id
          return (
            <div key={proc.id} style={{
              background: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              overflow: 'hidden',
              boxShadow: C.cardShadow,
              transition: 'box-shadow 0.15s',
            }}>
              {/* 카드 헤더 */}
              <div style={{
                padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                {/* 프로세스 제목 + 정보 */}
                <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => onSelectProc(proc)}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: C.gray700, marginBottom: 4 }}>
                    {proc.name}
                  </div>
                  <div style={{ fontSize: 12, color: C.gray500 }}>
                    {[proc.dept, proc.owner, `${proc.steps?.length ?? 0}단계`].filter(Boolean).join(' · ')}
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); onSelectProc(proc) }}
                    style={detailBtnStyle}
                  >
                    상세 보기 →
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onEditProc(proc) }}
                    style={editIconStyle}
                    title="프로세스 수정"
                  >✏️</button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteProc(proc) }}
                    style={deleteIconStyle}
                    title="프로세스 삭제"
                  >🗑</button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setExpandedProc(isExpanded ? null : proc.id)
                    }}
                    style={{
                      ...iconBtnStyle,
                      background: isExpanded ? C.bluePale : 'transparent',
                      color: isExpanded ? C.blue : C.gray500,
                      border: `1px solid ${isExpanded ? C.blueLight : 'transparent'}`,
                    }}
                    title={isExpanded ? 'Work flow 닫기' : 'Work flow 보기'}
                  >
                    {isExpanded ? '▲' : '▼'}
                  </button>
                </div>
              </div>

              {/* SwimLane 확장 */}
              {isExpanded && (
                <div style={{
                  borderTop: `1px solid ${C.border}`,
                  padding: '16px 20px',
                  background: C.bgVeryLight,
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.navy, marginBottom: 10 }}>
                    부서별 업무 흐름
                  </div>
                  <SwimLane steps={proc.steps ?? []} />
                </div>
              )}
            </div>
          )
        })}

        {/* 프로세스 추가 */}
        <div
          onClick={onAddProc}
          style={{
            border: `2px dashed ${C.gray300}`,
            borderRadius: 10,
            padding: '16px 20px',
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
          + 프로세스 추가
        </div>
      </div>
    </div>
  )
}

const backBtnStyle = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: 13, color: C.blue, fontWeight: 500,
  padding: 0, display: 'flex', alignItems: 'center', gap: 4,
}

const exportBtnStyle = {
  padding: '10px 20px', fontSize: 14, fontWeight: 600,
  background: C.white, color: C.gray700,
  border: `1px solid ${C.border}`,
  borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap',
  display: 'flex', alignItems: 'center', gap: 6,
}

const detailBtnStyle = {
  padding: '6px 14px', fontSize: 12, fontWeight: 600,
  background: C.navy, color: C.white, border: 'none',
  borderRadius: 6, cursor: 'pointer', whiteSpace: 'nowrap',
}

const editIconStyle = {
  background: C.white, border: `1px solid ${C.border}`, cursor: 'pointer',
  fontSize: 14, color: C.gray500,
  width: 30, height: 30, borderRadius: 6,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}

const deleteIconStyle = {
  background: C.redLight, border: 'none', cursor: 'pointer',
  fontSize: 12, color: C.red,
  width: 30, height: 30, borderRadius: 6,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  lineHeight: 1, flexShrink: 0,
}

const iconBtnStyle = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: 11, color: C.gray500,
  padding: '5px 8px', borderRadius: 6,
  transition: 'background 0.1s',
}
