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
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 24,
        background: C.white,
        borderRadius: 12,
        padding: '16px 24px',
        boxShadow: C.cardShadow,
        border: `1px solid ${C.border}`,
      }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: C.navy, margin: 0 }}>
            {dept.name}
          </h2>
          <p style={{ fontSize: 13, color: C.gray500, marginTop: 4, margin: '4px 0 0' }}>
            그룹 <strong style={{ color: C.blue }}>{dept.groups.length}</strong>개
          </p>
        </div>
        <button onClick={() => onDeleteDept(dept)} style={deleteBtnStyle} title="부서 삭제">
          🗑 부서 삭제
        </button>
      </div>

      {/* 그룹 카드 목록 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {dept.groups.map((group) => (
          <div
            key={group.id}
            style={{
              background: C.white,
              border: `1px solid ${C.border}`,
              borderLeft: `4px solid ${C.blue}`,
              borderRadius: 10,
              padding: '20px 20px 16px',
              cursor: 'pointer',
              boxShadow: C.cardShadow,
              transition: 'box-shadow 0.15s, transform 0.15s',
              position: 'relative',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = C.cardShadowHover
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = C.cardShadow
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            {/* 수정/삭제 버튼 — 우상단 */}
            <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 2 }}>
              <button
                onClick={(e) => { e.stopPropagation(); onEditGroup(group) }}
                style={actionBtnStyle}
                title="그룹 수정"
              >✏</button>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteGroup(group) }}
                style={{ ...actionBtnStyle, color: C.gray300 }}
                title="그룹 삭제"
              >🗑</button>
            </div>

            {/* 카드 본문 */}
            <div onClick={() => onSelectGroup(group)}>
              <div style={{ fontWeight: 700, fontSize: 15, color: C.gray700, marginBottom: 12, paddingRight: 52 }}>
                {group.name}
              </div>
              {/* 프로세스 수 뱃지 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  background: C.bluePale, color: C.blue,
                  border: `1px solid ${C.blueLight}`,
                  fontSize: 12, fontWeight: 600,
                  padding: '3px 10px', borderRadius: 20,
                }}>
                  📋 프로세스 {group.processes.length}개
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* 그룹 추가 카드 */}
        <div
          onClick={onAddGroup}
          style={{
            border: `2px dashed ${C.gray300}`,
            borderRadius: 10,
            padding: '20px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 100,
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
          <span style={{ fontSize: 22 }}>＋</span>
          <span>그룹 추가</span>
        </div>
      </div>
    </div>
  )
}

const deleteBtnStyle = {
  padding: '8px 16px', fontSize: 13, fontWeight: 600,
  background: C.redLight, color: C.red, border: `1px solid ${C.redBorder}`,
  borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap',
  display: 'flex', alignItems: 'center', gap: 4,
}

const actionBtnStyle = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: 14, color: C.gray500,
  padding: '4px 6px', borderRadius: 4,
  lineHeight: 1,
}
