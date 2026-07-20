import { useRef } from 'react'
import { C, DEPT_COLORS } from '../../constants'

/**
 * Sidebar — LV1(부서)·LV2(그룹)만 표시. 프로세스 행 없음.
 * isMobile 시 오버레이 모드로 전환.
 */
export default function Sidebar({
  data,
  open,
  isMobile,
  selDept,
  selGroup,
  expDepts,
  onSelectDept,
  onSelectGroup,
  onToggleDept,
  onAddDept,
  onBackup,
  onRestore,
  onClose,
}) {
  const totalGroups = data.reduce((s, d) => s + d.groups.length, 0)
  const totalProcs  = data.reduce((s, d) => s + d.groups.reduce((ss, g) => ss + g.processes.length, 0), 0)

  // 복원용 숨김 파일 입력
  const fileInputRef = useRef(null)
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // 같은 파일 재선택 가능하도록 초기화
    if (file) onRestore(file)
  }

  const sidebarWidth = isMobile ? 260 : (open ? 220 : 48)
  const isVisible = isMobile ? open : true

  // 모바일: 오버레이 dim 배경
  const overlay = isMobile && open ? (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        top: 48,
        background: 'rgba(0,0,0,0.35)',
        zIndex: 89,
      }}
    />
  ) : null

  return (
    <>
      {overlay}
      <div style={{
        width: isVisible ? sidebarWidth : 0,
        minWidth: isVisible ? sidebarWidth : 0,
        background: C.white,
        borderRight: `1px solid ${C.border}`,
        display: 'flex',
        flexDirection: 'column',
        transition: isMobile ? 'transform 0.25s ease' : 'width 0.25s ease',
        overflow: 'hidden',
        position: 'fixed',
        top: 48,
        left: 0,
        bottom: 0,
        zIndex: 90,
        ...(isMobile && {
          width: sidebarWidth,
          minWidth: sidebarWidth,
          transform: open ? 'translateX(0)' : `translateX(-${sidebarWidth + 1}px)`,
          boxShadow: open ? '4px 0 16px rgba(0,0,0,0.12)' : 'none',
        }),
      }}>
        {/* NAVIGATOR 헤더 */}
        {(isMobile || open) && (
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
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingTop: (isMobile || open) ? 4 : 0 }}>
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
                    if (isMobile || open) onToggleDept(dept.id)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    height: 38,
                    cursor: 'pointer',
                    background: isDeptSel ? C.sidebarActiveBg : 'transparent',
                    borderLeft: isDeptSel ? `3px solid ${C.blue}` : '3px solid transparent',
                    paddingLeft: (isMobile || open) ? 10 : 0,
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
                    marginLeft: (isMobile || open) ? 0 : 11,
                  }}>
                    {dept.icon || dept.name[0]}
                  </div>
                  {(isMobile || open) && (
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
                {(isMobile || open) && isDeptExp && dept.groups.map((group) => {
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
        {(isMobile || open) && (
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

            {/* 데이터 백업 / 복원 */}
            <div style={{
              display: 'flex', gap: 6, marginTop: 8,
              paddingTop: 10, borderTop: `1px solid ${C.border}`,
            }}>
              <button
                onClick={onBackup}
                title="전체 데이터를 파일로 내보내기"
                style={backupBtnStyle}
              >
                ⬇ 백업
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                title="백업 파일에서 데이터 복원 (덮어쓰기)"
                style={backupBtnStyle}
              >
                ⬆ 복원
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  )
}

const backupBtnStyle = {
  flex: 1,
  height: 30,
  background: 'none',
  border: `1px solid ${C.border}`,
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 11,
  fontWeight: 600,
  color: C.gray500,
}
