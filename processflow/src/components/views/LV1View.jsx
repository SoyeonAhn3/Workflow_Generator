import { C } from '../../constants'

/**
 * LV1View — 그룹 카드 목록 (부서 선택 후 표시)
 * @param {{ dept: object|null, onSelectGroup: (group: object) => void }} props
 */
export default function LV1View({ dept, onSelectGroup }) {
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
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: C.gray700, margin: 0 }}>
          {dept.name}
        </h2>
        <p style={{ fontSize: 13, color: C.gray500, marginTop: 4 }}>
          그룹 {dept.groups.length}개
        </p>
      </div>

      {/* 그룹 카드 목록 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {dept.groups.map((group) => (
          <div
            key={group.id}
            onClick={() => onSelectGroup(group)}
            style={{
              background: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: '18px 20px',
              cursor: 'pointer',
              transition: 'box-shadow 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.10)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
          >
            <div style={{ fontWeight: 600, fontSize: 14, color: C.gray700, marginBottom: 8 }}>
              {group.name}
            </div>
            <div style={{ fontSize: 12, color: C.gray500 }}>
              프로세스 {group.processes.length}개
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
