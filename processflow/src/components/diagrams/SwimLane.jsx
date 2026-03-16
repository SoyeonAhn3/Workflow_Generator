import { C, DEPT_COLORS } from '../../constants'

/**
 * SwimLane — 부서별 수영 레인 다이어그램
 * @param {{ steps: Array }} props
 */
export default function SwimLane({ steps }) {
  if (!steps || steps.length === 0) {
    return (
      <div style={{
        textAlign: 'center', color: C.gray300, fontSize: 12,
        padding: '20px 0',
      }}>
        단계가 없습니다
      </div>
    )
  }

  // 부서 목록 추출 (등장 순서 유지)
  const depts = [...new Set(steps.map((s) => s.dept || '미지정'))]
  const deptColorMap = {}
  depts.forEach((d, i) => { deptColorMap[d] = DEPT_COLORS[i % DEPT_COLORS.length] })

  // 레인 전환 여부
  const isLaneChange = (i) => i > 0 && (steps[i].dept || '미지정') !== (steps[i - 1].dept || '미지정')

  const colCount = steps.length

  return (
    <div style={{ overflowX: 'auto', fontSize: 11 }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `80px repeat(${colCount}, minmax(100px, 1fr))`,
        minWidth: colCount * 110 + 80,
      }}>
        {/* ── 헤더 행 ── */}
        <div style={headerCellStyle}>부서</div>
        {steps.map((step, i) => (
          <div key={`h-${step.id}`} style={{
            ...headerCellStyle,
            borderLeft: `1px solid rgba(255,255,255,0.2)`,
          }}>
            <span style={{ fontWeight: 600 }}>{i + 1}. </span>
            <span style={{
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {step.title}
            </span>
          </div>
        ))}

        {/* ── 레인 행 (부서별) ── */}
        {depts.map((dept, di) => {
          const deptColor = deptColorMap[dept]
          const isOdd = di % 2 === 1

          return [
            // 부서 레이블 셀
            <div key={`d-${dept}`} style={{
              padding: '10px 8px',
              background: isOdd ? C.gray100 : C.white,
              fontWeight: 700, fontSize: 11, color: deptColor,
              display: 'flex', alignItems: 'center',
              borderBottom: `1px solid ${C.border}`,
            }}>
              {dept}
            </div>,

            // 각 단계 셀
            ...steps.map((step, si) => {
              const stepDept = step.dept || '미지정'
              const isActive = stepDept === dept

              return (
                <div key={`c-${dept}-${step.id}`} style={{
                  padding: '8px 6px',
                  background: isOdd ? C.gray100 : C.white,
                  borderBottom: `1px solid ${C.border}`,
                  borderLeft: `1px solid ${C.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  minHeight: 48,
                }}>
                  {isActive ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {/* 노드 */}
                      <div style={{
                        background: deptColor, color: C.white,
                        borderRadius: 6, padding: '6px 10px',
                        fontSize: 10, fontWeight: 600, textAlign: 'center',
                        maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {step.screenName || step.title}
                      </div>

                      {/* 화살표 (마지막 단계 아닌 경우) */}
                      {si < steps.length - 1 && (
                        isLaneChange(si + 1) ? (
                          // 레인 전환: 점선 회색 화살표
                          <svg width="18" height="20" style={{ flexShrink: 0 }}>
                            <line x1="0" y1="10" x2="12" y2="10"
                              stroke={C.gray300} strokeWidth="2" strokeDasharray="3,2" />
                            <polygon points="11,6 18,10 11,14" fill={C.gray300} />
                          </svg>
                        ) : (
                          // 같은 레인: 실선 부서색 화살표
                          <svg width="18" height="20" style={{ flexShrink: 0 }}>
                            <line x1="0" y1="10" x2="12" y2="10"
                              stroke={deptColor} strokeWidth="2" />
                            <polygon points="11,6 18,10 11,14" fill={deptColor} />
                          </svg>
                        )
                      )}
                    </div>
                  ) : null}
                </div>
              )
            }),
          ]
        })}
      </div>
    </div>
  )
}

const headerCellStyle = {
  background: C.navy, color: C.white,
  padding: '8px 8px', fontWeight: 600, fontSize: 10,
  display: 'flex', alignItems: 'center',
  overflow: 'hidden',
}
