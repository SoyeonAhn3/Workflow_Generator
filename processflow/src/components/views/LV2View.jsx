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
      {/* 헤더 카드 */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 20,
        background: C.white,
        borderRadius: 12,
        padding: '16px 24px',
        boxShadow: C.cardShadow,
        border: `1px solid ${C.border}`,
      }}>
        <div>
          <button onClick={onBack} style={backBtnStyle}>
            ← {dept?.name}
          </button>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: C.navy, margin: '4px 0 0' }}>
            {group.name}
          </h2>
          <p style={{ fontSize: 13, color: C.gray500, margin: '4px 0 0' }}>
            프로세스 <strong style={{ color: C.blue }}>{group.processes.length}</strong>개
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onExportWord} style={exportBtnStyle}>
            📥 Word 내보내기
          </button>
          <button onClick={() => onDeleteGroup(group)} style={deleteBtnStyle}>
            🗑 그룹 삭제
          </button>
        </div>
      </div>

      {/* 프로세스 카드 목록 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {group.processes.map((proc, idx) => {
          const isExpanded = expandedProc === proc.id
          return (
            <div key={proc.id} style={{
              background: C.white,
              border: `1px solid ${C.border}`,
              borderLeft: `4px solid ${C.navy}`,
              borderRadius: 10,
              overflow: 'hidden',
              boxShadow: C.cardShadow,
              transition: 'box-shadow 0.15s',
            }}>
              {/* 카드 헤더 */}
              <div style={{
                padding: '14px 18px',
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                {/* 순번 뱃지 */}
                <div style={{
                  width: 32, height: 32, minWidth: 32,
                  borderRadius: 8,
                  background: C.navy, color: C.white,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700,
                }}>
                  {idx + 1}
                </div>

                {/* 본문 — 클릭 시 LV3 이동 */}
                <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => onSelectProc(proc)}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.gray700, marginBottom: 6 }}>
                    {proc.name}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {proc.owner && (
                      <span style={tagStyle}>👤 {proc.owner}</span>
                    )}
                    {proc.module && (
                      <span style={{ ...tagStyle, background: C.bluePale, color: C.blue, border: `1px solid ${C.blueLight}` }}>
                        {proc.module}
                      </span>
                    )}
                    <span style={{ ...tagStyle, background: '#F0F4F8', color: C.gray500, border: `1px solid #D8E4F0` }}>
                      단계 {proc.steps?.length ?? 0}개
                    </span>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); onEditProc(proc) }}
                    style={iconBtnStyle}
                    title="프로세스 수정"
                  >✏</button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteProc(proc) }}
                    style={{ ...iconBtnStyle, color: C.gray300 }}
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
                      fontSize: 11,
                      padding: '5px 8px',
                    }}
                    title={isExpanded ? 'Work flow 닫기' : 'Work flow 보기'}
                  >
                    {isExpanded ? '▲ 닫기' : '▼ 흐름도'}
                  </button>
                  <span
                    onClick={() => onSelectProc(proc)}
                    style={{ fontSize: 20, color: C.gray300, cursor: 'pointer', marginLeft: 2 }}
                  >›</span>
                </div>
              </div>

              {/* SwimLane 확장 */}
              {isExpanded && (
                <div style={{
                  borderTop: `1px solid ${C.border}`,
                  padding: '14px 18px',
                  background: '#F7FAFD',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.navy, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      display: 'inline-block', width: 3, height: 14,
                      background: C.blue, borderRadius: 2, marginRight: 4,
                    }} />
                    부서별 Work flow
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
          <span style={{ fontSize: 18 }}>＋</span>
          프로세스 추가
        </div>
      </div>
    </div>
  )
}

const backBtnStyle = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: 13, color: C.blue, fontWeight: 600,
  padding: 0, display: 'flex', alignItems: 'center', gap: 4,
}

const exportBtnStyle = {
  padding: '8px 16px', fontSize: 13, fontWeight: 600,
  background: C.blue, color: C.white, border: 'none',
  borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap',
  display: 'flex', alignItems: 'center', gap: 4,
}

const deleteBtnStyle = {
  padding: '8px 16px', fontSize: 13, fontWeight: 600,
  background: C.redLight, color: C.red, border: `1px solid ${C.redBorder}`,
  borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap',
  display: 'flex', alignItems: 'center', gap: 4,
}

const iconBtnStyle = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: 14, color: C.gray500,
  padding: '5px 7px', borderRadius: 6,
  transition: 'background 0.1s',
}

const tagStyle = {
  display: 'inline-flex', alignItems: 'center',
  background: C.gray100, color: C.gray500,
  border: `1px solid ${C.border}`,
  fontSize: 11, fontWeight: 500,
  padding: '2px 8px', borderRadius: 12,
}
