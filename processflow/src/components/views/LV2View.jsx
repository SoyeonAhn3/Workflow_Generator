import { C } from '../../constants'

/**
 * LV2View — 프로세스 카드 목록 (그룹 선택 후 표시)
 * @param {{ dept: object|null, group: object|null, onSelectProc: (proc: object) => void }} props
 */
export default function LV2View({ dept, group, onSelectProc }) {
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
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, color: C.gray500, marginBottom: 4 }}>
          {dept?.name}
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: C.gray700, margin: 0 }}>
          {group.name}
        </h2>
        <p style={{ fontSize: 13, color: C.gray500, marginTop: 4 }}>
          프로세스 {group.processes.length}개
        </p>
      </div>

      {/* 프로세스 카드 목록 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {group.processes.map((proc) => (
          <div
            key={proc.id}
            onClick={() => onSelectProc(proc)}
            style={{
              background: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: '16px 20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'box-shadow 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.10)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: C.gray700, marginBottom: 6 }}>
                {proc.name}
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: C.gray500 }}>
                <span>담당: {proc.owner || '—'}</span>
                <span>모듈: {proc.module || '—'}</span>
                <span>단계: {proc.steps?.length ?? 0}개</span>
              </div>
            </div>
            <span style={{ fontSize: 18, color: C.gray300 }}>›</span>
          </div>
        ))}
      </div>
    </div>
  )
}
