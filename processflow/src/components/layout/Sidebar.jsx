import { C, DEPT_COLORS } from '../../constants'

/**
 * Sidebar — LV1(부서)·LV2(그룹)만 표시. 프로세스 행 없음.
 * @param {{
 *   data: Array,
 *   open: boolean,
 *   selDept: object|null,
 *   selGroup: object|null,
 *   expDepts: object,
 *   onSelectDept: (dept: object) => void,
 *   onSelectGroup: (dept: object, group: object) => void,
 *   onToggleDept: (deptId: string) => void,
 *   onAddDept: () => void,
 * }} props
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
      width: open ? 250 : 48,
      minHeight: '100vh',
      background: C.white,
      borderRight: `1px solid ${C.border}`,
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.25s ease',
      overflow: 'hidden',
      position: 'fixed',
      top: 52,
      left: 0,
      bottom: 0,
      zIndex: 90,
    }}>
      {/* 스크롤 영역 */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
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
                  height: 40,
                  cursor: 'pointer',
                  background: isDeptSel ? C.bluePale : 'transparent',
                  borderLeft: isDeptSel ? `3px solid ${C.blue}` : '3px solid transparent',
                  paddingLeft: open ? 10 : 0,
                  gap: 8,
                  whiteSpace: 'nowrap',
                }}
              >
                <div style={{
                  width: 26,
                  height: 26,
                  minWidth: 26,
                  borderRadius: 6,
                  background: deptColor,
                  color: C.white,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 13,
                  marginLeft: open ? 0 : 11,
                }}>
                  {dept.icon || dept.name[0]}
                </div>
                {open && (
                  <>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: C.gray700, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {dept.name}
                    </span>
                    <span style={{ fontSize: 11, color: C.gray300, marginRight: 8 }}>
                      {isDeptExp ? '▲' : '▼'}
                    </span>
                  </>
                )}
              </div>

              {/* GroupRows (LV2) — 화살표 없음, 클릭 시 LV2 뷰로 이동 */}
              {open && isDeptExp && dept.groups.map((group) => {
                const isGroupSel = selGroup?.id === group.id

                return (
                  <div
                    key={group.id}
                    onClick={() => onSelectGroup(dept, group)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      height: 36,
                      cursor: 'pointer',
                      background: isGroupSel ? C.bluePale : 'transparent',
                      borderLeft: isGroupSel ? `3px solid ${C.navy}` : '3px solid transparent',
                      paddingLeft: 46,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span style={{ fontSize: 12, color: C.gray500, overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
        <div style={{ padding: '12px 12px 16px', borderTop: `1px solid ${C.border}` }}>
          <div style={{
            background: C.gray100,
            borderRadius: 8,
            padding: '8px 12px',
            marginBottom: 10,
            fontSize: 12,
            color: C.gray500,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>부서</span><span style={{ fontWeight: 600, color: C.gray700 }}>{data.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
              <span>그룹</span><span style={{ fontWeight: 600, color: C.gray700 }}>{totalGroups}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
              <span>프로세스</span><span style={{ fontWeight: 600, color: C.gray700 }}>{totalProcs}</span>
            </div>
          </div>

          <button
            onClick={onAddDept}
            style={{
              width: '100%',
              height: 34,
              background: 'none',
              border: `1.5px dashed ${C.gray300}`,
              borderRadius: 8,
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
