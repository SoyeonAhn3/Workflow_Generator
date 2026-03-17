import { C, DEPT_COLORS } from '../../constants'

/**
 * Sidebar — LV1(부서)·LV2(그룹)만 표시. 프로세스 행 없음.
 */
export default function Sidebar({
  data,
  open,
  selDept,
  selGroup,
  expDepts,
  onSelectDept,
  onSelectGroup,
  onToggleDept,
  onAddDept,
}) {
  const totalGroups = data.reduce((s, d) => s + d.groups.length, 0)
  const totalProcs  = data.reduce((s, d) => s + d.groups.reduce((ss, g) => ss + g.processes.length, 0), 0)

  return (
    <div style={{
      width: open ? 220 : 48,
      background: C.white,
      borderRight: `1px solid ${C.border}`,
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.25s ease',
      overflow: 'hidden',
      position: 'fixed',
      top: 48,
      left: 0,
      bottom: 0,
      zIndex: 90,
    }}>
      {/* NAVIGATOR 헤더 */}
      {open && (
        <div style={{
          padding: '14px 14px 10px',
          fontSize: 11,
          fontWeight: 600,
          color: C.gray500,
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          borderBottom: `1px solid ${C.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span>Navigator</span>
        </div>
      )}

      {/* 스크롤 영역 */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingTop: open ? 4 : 0 }}>
        {data.map((dept, di) => {
          const deptColor = dept.color || DEPT_COLORS[di % DEPT_COLORS.length]
          const isDeptSel = selDept?.id === dept.id
          const isDeptExp = expDepts[dept.id]

          return (
            <div key={dept.id}>
              {/* DeptRow (LV1) */}
              <div
                onClick={() => {
                  onSelectDept(dept)
                  if (open) onToggleDept(dept.id)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  height: 38,
                  cursor: 'pointer',
                  background: isDeptSel ? C.sidebarActiveBg : 'transparent',
                  borderLeft: isDeptSel ? `3px solid ${C.blue}` : '3px solid transparent',
                  paddingLeft: open ? 10 : 0,
                  gap: 8,
                  whiteSpace: 'nowrap',
                  transition: 'background 0.1s',
                }}
              >
                <div style={{
                  width: 24,
                  height: 24,
                  minWidth: 24,
                  borderRadius: 5,
                  background: deptColor,
                  color: C.white,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 12,
                  marginLeft: open ? 0 : 11,
                }}>
                  {dept.icon || dept.name[0]}
                </div>
                {open && (
                  <>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: C.gray700, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {dept.name}
                    </span>
                    <span style={{ fontSize: 10, color: C.gray300, marginRight: 10 }}>
                      {isDeptExp ? '▲' : '▼'}
                    </span>
                  </>
                )}
              </div>

              {/* GroupRows (LV2) */}
              {open && isDeptExp && dept.groups.map((group) => {
                const isGroupSel = selGroup?.id === group.id

                return (
                  <div
                    key={group.id}
                    onClick={() => onSelectGroup(dept, group)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      height: 32,
                      cursor: 'pointer',
                      background: isGroupSel ? C.sidebarActiveBg : 'transparent',
                      borderLeft: isGroupSel ? `3px solid ${C.navy}` : '3px solid transparent',
                      paddingLeft: 42,
                      whiteSpace: 'nowrap',
                      transition: 'background 0.1s',
                    }}
                  >
                    <span style={{ fontSize: 12, color: isGroupSel ? C.blue : C.gray500, overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: isGroupSel ? 600 : 400 }}>
                      {group.name}
                    </span>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* 하단: 통계 위젯 + 부서 추가 버튼 */}
      {open && (
        <div style={{ padding: '10px 12px 14px', borderTop: `1px solid ${C.border}` }}>
          <div style={{
            fontSize: 11,
            fontWeight: 600,
            color: C.blue,
            marginBottom: 6,
            letterSpacing: '-0.2px',
          }}>
            전체 현황
          </div>
          <div style={{
            background: C.gray100,
            borderRadius: 6,
            padding: '7px 10px',
            marginBottom: 8,
            fontSize: 12,
            color: C.gray500,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>부서</span><span style={{ fontWeight: 600, color: C.blue }}>{data.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
              <span>프로세스 그룹</span><span style={{ fontWeight: 600, color: C.blue }}>{totalGroups}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
              <span>세부 프로세스</span><span style={{ fontWeight: 600, color: C.blue }}>{totalProcs}</span>
            </div>
          </div>

          <button
            onClick={onAddDept}
            style={{
              width: '100%',
              height: 32,
              background: 'none',
              border: `1.5px dashed ${C.gray300}`,
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 12,
              color: C.gray500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            + 부서 추가
          </button>
        </div>
      )}
    </div>
  )
}
