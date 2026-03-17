import { C } from '../../constants'

/**
 * LV1View — 그룹 카드 목록 (부서 선택 후 표시)
 */
export default function LV1View({ dept, onSelectGroup, onAddGroup, onDeleteDept, onDeleteGroup, onEditGroup }) {
  if (!dept) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '60vh',
        color: C.gray300,
        fontSize: 15,
      }}>
        사이드바에서 부서를 선택하세요
      </div>
    )
  }

  return (
    <div>
      {/* 헤더 */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        marginBottom: 28,
      }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: C.navy, margin: 0, letterSpacing: '-0.5px' }}>
            {dept.name}
          </h2>
          <p style={{ fontSize: 13, color: C.gray500, margin: '6px 0 0' }}>
            프로세스 그룹 {dept.groups.length}개
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onAddGroup} style={addBtnStyle}>
            + 그룹 추가
          </button>
        </div>
      </div>

      {/* 그룹 카드 목록 — 세로 리스트 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {dept.groups.map((group) => (
          <div
            key={group.id}
            style={{
              background: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: '18px 22px',
              cursor: 'pointer',
              boxShadow: C.cardShadow,
              transition: 'box-shadow 0.15s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
            onClick={() => onSelectGroup(group)}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = C.cardShadowHover }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = C.cardShadow }}
          >
            {/* 왼쪽: 이름 + 세부 프로세스 수 */}
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: C.navy, marginBottom: 4 }}>
                {group.name}
              </div>
              <div style={{ fontSize: 12, color: C.gray500 }}>
                세부 프로세스 {group.processes.length}개
              </div>
            </div>

            {/* 오른쪽: 삭제 아이콘 + 화살표 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={(e) => { e.stopPropagation(); onEditGroup(group) }}
                style={actionBtnStyle}
                title="그룹 수정"
              >✏️</button>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteGroup(group) }}
                style={deleteIconStyle}
                title="그룹 삭제"
              >🗑</button>
              <span style={{ fontSize: 18, color: C.gray300, marginLeft: 4 }}>›</span>
            </div>
          </div>
        ))}

        {/* 그룹 추가 카드 */}
        <div
          onClick={onAddGroup}
          style={{
            border: `2px dashed ${C.gray300}`,
            borderRadius: 10,
            padding: '18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: C.gray500,
            fontSize: 13,
            fontWeight: 500,
            gap: 6,
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
          + 그룹 추가
        </div>
      </div>
    </div>
  )
}

const addBtnStyle = {
  padding: '9px 20px', fontSize: 13, fontWeight: 600,
  background: C.navy, color: C.white, border: 'none',
  borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap',
}

const actionBtnStyle = {
  background: C.white, border: `1px solid ${C.border}`, cursor: 'pointer',
  fontSize: 14, color: C.gray500,
  width: 30, height: 30, borderRadius: 6,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  lineHeight: 1,
}

const deleteIconStyle = {
  background: C.redLight, border: 'none', cursor: 'pointer',
  fontSize: 13, color: C.red,
  width: 28, height: 28, borderRadius: '50%',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  lineHeight: 1, flexShrink: 0,
}
