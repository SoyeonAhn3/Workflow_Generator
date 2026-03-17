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
        gridTemplateColumns: `110px repeat(${colCount}, 180px)`,
        width: 'max-content',
      }}>
        {/* ── 헤더 행 ── */}
        <div style={headerCellStyle}>부서</div>
        <div style={{
          ...headerCellStyle,
          gridColumn: `2 / ${colCount + 2}`,
          borderLeft: '1px solid rgba(255,255,255,0.15)',
        }}>
          업무 흐름
        </div>

        {/* ── 레인 행 (부서별) ── */}
        {depts.map((dept, di) => {
          const deptColor = deptColorMap[dept]
          const isOdd = di % 2 === 1
          return [
            // 부서 레이블 셀
            <div key={`d-${dept}`} style={{
              padding: '16px 12px',
              background: isOdd ? C.gray100 : C.white,
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              borderBottom: `1px solid ${C.border}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  display: 'inline-block', width: 3, height: 24,
                  background: deptColor, borderRadius: 2, flexShrink: 0,
                }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: deptColor }}>
                    {dept}
                  </div>
                </div>
              </div>
            </div>,

            // 각 단계 셀
            ...steps.map((step, si) => {
              const stepDept = step.dept || '미지정'
              const isActive = stepDept === dept

              return (
                <div key={`c-${dept}-${step.id}`} style={{
                  padding: '12px 10px',
                  background: isOdd ? C.gray100 : C.white,
                  borderBottom: `1px solid ${C.border}`,
                  borderLeft: `1px solid ${C.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  minHeight: 70,
                }}>
                  {isActive ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {/* 노드 */}
                      <div style={{
                        position: 'relative',
                        border: `2px solid ${deptColor}`,
                        borderRadius: 7, padding: '10px 12px',
                        background: C.white,
                        textAlign: 'center',
                        minWidth: 100,
                        maxWidth: 140,
                      }}>
                        {/* 번호 뱃지 */}
                        <div style={{
                          position: 'absolute', top: -9, right: -9,
                          width: 20, height: 20, borderRadius: '50%',
                          background: deptColor, color: C.white,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, fontWeight: 700,
                        }}>
                          {si + 1}
                        </div>
                        {/* 화면명 / T-Code */}
                        {step.screenName && (
                          <div style={{ fontSize: 10, color: deptColor, fontWeight: 600, marginBottom: 3 }}>
                            {step.screenName}
                          </div>
                        )}
                        {/* 단계명 — 줄바꿈 허용 */}
                        <div style={{
                          fontSize: 11, fontWeight: 700, color: C.gray700,
                          lineHeight: 1.4,
                          wordBreak: 'keep-all',
                          overflowWrap: 'break-word',
                        }}>
                          {step.title}
                        </div>
                        {/* PT */}
                        {step.pt && (
                          <div style={{ fontSize: 9, color: C.gray500, marginTop: 3 }}>
                            PT: {step.pt}
                          </div>
                        )}
                      </div>

                      {/* 화살표 (마지막 단계 아닌 경우) */}
                      {si < steps.length - 1 && (
                        isLaneChange(si + 1) ? (
                          // 레인 전환: 점선 회색 화살표
                          <svg width="24" height="20" style={{ flexShrink: 0 }}>
                            <line x1="0" y1="10" x2="15" y2="10"
                              stroke={C.gray300} strokeWidth="1.5" strokeDasharray="3,2" />
                            <polygon points="14,6 22,10 14,14" fill={C.gray300} />
                          </svg>
                        ) : (
                          // 같은 레인: 실선 부서색 화살표
                          <svg width="24" height="20" style={{ flexShrink: 0 }}>
                            <line x1="0" y1="10" x2="15" y2="10"
                              stroke={deptColor} strokeWidth="1.5" />
                            <polygon points="14,6 22,10 14,14" fill={deptColor} />
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

      {/* 범례 */}
      <div style={{ display: 'flex', gap: 18, marginTop: 12, paddingLeft: 4, flexWrap: 'wrap' }}>
        {depts.map((dept) => (
          <div key={dept} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
            <span style={{
              display: 'inline-block', width: 14, height: 3,
              background: deptColorMap[dept], borderRadius: 1,
            }} />
            <span style={{ color: deptColorMap[dept], fontWeight: 600 }}>{dept}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
          <span style={{
            display: 'inline-block', width: 14, height: 0,
            borderTop: `2px dashed ${C.gray300}`,
          }} />
          <span style={{ color: C.gray500 }}>레인 전환</span>
        </div>
      </div>
    </div>
  )
}

const headerCellStyle = {
  background: C.navy, color: C.white,
  padding: '10px 12px', fontWeight: 600, fontSize: 12,
  display: 'flex', alignItems: 'center',
  overflow: 'hidden',
}
