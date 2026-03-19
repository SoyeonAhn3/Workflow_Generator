import { useRef, useLayoutEffect, useState } from 'react'
import { C, DEPT_COLORS } from '../../constants'

/**
 * SwimLane — 부서별 수영 레인 다이어그램
 *
 * props:
 *   steps       : Step[]       — 단계 배열
 *   connections : Connection[] — [선택] { from: stepId, to: stepId }[]
 *                                없으면 steps 배열 순서대로 순차 연결
 *
 * Step에 colIndex(number)가 있으면 해당 열에 배치.
 * 없으면 배열 인덱스를 colIndex로 사용 (기존 데이터 하위 호환).
 */
export default function SwimLane({ steps }) {
  // ── hooks는 항상 최상단에 (React 규칙) ──
  const nodeRefs    = useRef({})       // 스텝 노드 DOM 요소 저장
  const containerRef = useRef(null)    // SVG 오버레이 기준점
  const [arrows, setArrows] = useState([])  // 계산된 화살표 경로 목록

  // ── 1. colIndex 정규화 ──
  // colIndex가 있으면 사용, 없으면 현재까지의 최대 colIndex + 1 (마지막 열 자동 배정)
  const safeSteps = steps ?? []
  const stepsWithCol = safeSteps.reduce((acc, step) => {
    if (step.colIndex !== undefined && step.colIndex !== null && step.colIndex !== '') {
      acc.push({ ...step, colIndex: Number(step.colIndex) })
    } else {
      const maxCol = acc.length > 0 ? Math.max(...acc.map(s => s.colIndex)) : -1
      acc.push({ ...step, colIndex: maxCol + 1 })
    }
    return acc
  }, [])

  // ── 2. 고유 colIndex 목록 (오름차순) ──
  const colIndices = [...new Set(stepsWithCol.map(s => s.colIndex))].sort((a, b) => a - b)
  const colCount = colIndices.length

  // ── 3. 부서 목록 (등장 순서 유지) ──
  const depts = [...new Set(stepsWithCol.map(s => s.dept || '미지정'))]
  const deptColorMap = {}
  depts.forEach((d, i) => { deptColorMap[d] = DEPT_COLORS[i % DEPT_COLORS.length] })

  // ── 4. 스텝 번호 맵 (colIndex 정렬 기준 순서 번호) ──
  const sortedForNumber = [...stepsWithCol].sort((a, b) => a.colIndex - b.colIndex)
  const stepNumberMap = {}
  sortedForNumber.forEach((s, i) => { stepNumberMap[s.id] = i + 1 })

  // ── 5. connections 자동 파생 (colIndex 그룹핑 기반) ──
  // 같은 colIndex끼리 그룹핑 후, 인접한 두 열 사이를 전부 연결 (분기·합류 자동 처리)
  const colGroups = {}
  stepsWithCol.forEach(s => {
    if (!colGroups[s.colIndex]) colGroups[s.colIndex] = []
    colGroups[s.colIndex].push(s.id)
  })
  const resolvedConnections = []
  for (let i = 0; i < colIndices.length - 1; i++) {
    const fromIds = colGroups[colIndices[i]]
    const toIds   = colGroups[colIndices[i + 1]]
    fromIds.forEach(fromId => toIds.forEach(toId => {
      resolvedConnections.push({ from: fromId, to: toId })
    }))
  }

  // ── 6. 노드 위치 측정 후 화살표 경로 계산 ──
  // steps/connections가 바뀔 때만 재실행 (의존성 배열로 무한루프 방지)
  const stepsKey = safeSteps.map(s => s.id).join(',')
  const connKey  = resolvedConnections.map(c => `${c.from}-${c.to}`).join(',')

  useLayoutEffect(() => {
    if (safeSteps.length === 0 || !containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()

    const computed = resolvedConnections.map(({ from, to }) => {
      const fromEl = nodeRefs.current[from]
      const toEl   = nodeRefs.current[to]
      if (!fromEl || !toEl) return null

      const fRect = fromEl.getBoundingClientRect()
      const tRect = toEl.getBoundingClientRect()

      // 컨테이너 기준 상대 좌표
      const x1 = fRect.right  - containerRect.left
      const y1 = fRect.top    - containerRect.top + fRect.height / 2
      const x2 = tRect.left   - containerRect.left
      const y2 = tRect.top    - containerRect.top + tRect.height / 2

      const fromStep = stepsWithCol.find(s => s.id === from)
      const toStep   = stepsWithCol.find(s => s.id === to)
      const isSameLane = (fromStep?.dept || '미지정') === (toStep?.dept || '미지정')

      const color = isSameLane
        ? deptColorMap[fromStep?.dept || '미지정']
        : C.gray300

      // 경로: y 차이가 없으면 직선, 있으면 중간 x에서 꺾임
      const midX = (x1 + x2) / 2
      const d = Math.abs(y1 - y2) < 4
        ? `M ${x1} ${y1} L ${x2} ${y2}`
        : `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`

      return { d, color, isSameLane }
    }).filter(Boolean)

    setArrows(computed)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepsKey, connKey])

  // SVG 마커에 사용할 색상 목록
  const markerColors = [...new Set([...Object.values(deptColorMap), C.gray300])]

  // ── 빈 상태 렌더링 (hooks 선언 이후에 배치) ──
  if (safeSteps.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: C.gray300, fontSize: 12, padding: '20px 0' }}>
        단계가 없습니다
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto', fontSize: 11 }}>
      {/* 컨테이너: SVG 오버레이의 position 기준점 */}
      <div ref={containerRef} style={{ position: 'relative', width: 'max-content' }}>

        {/* ── 스텝 노드 그리드 ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `110px repeat(${colCount}, 180px)`,
          width: 'max-content',
        }}>

          {/* 헤더 행 */}
          <div style={headerCellStyle}>부서</div>
          <div style={{
            ...headerCellStyle,
            gridColumn: `2 / ${colCount + 2}`,
            borderLeft: '1px solid rgba(255,255,255,0.15)',
          }}>
            업무 흐름
          </div>

          {/* 레인 행 (부서별) */}
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
                  <div style={{ fontWeight: 700, fontSize: 14, color: deptColor }}>
                    {dept}
                  </div>
                </div>
              </div>,

              // 각 열(colIndex)별 셀 — filter로 같은 셀에 여러 스텝 허용
              ...colIndices.map((colIdx) => {
                const cellSteps = stepsWithCol.filter(
                  s => (s.dept || '미지정') === dept && s.colIndex === colIdx
                )

                return (
                  <div key={`c-${dept}-col${colIdx}`} style={{
                    padding: '12px 10px',
                    background: isOdd ? C.gray100 : C.white,
                    borderBottom: `1px solid ${C.border}`,
                    borderLeft: `1px solid ${C.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 6, flexWrap: 'wrap',
                    minHeight: 70,
                  }}>
                    {cellSteps.map(step => (
                      <div
                        key={step.id}
                        ref={el => { nodeRefs.current[step.id] = el }}
                        style={{
                          position: 'relative',
                          border: `2px solid ${deptColor}`,
                          borderRadius: 7, padding: '10px 12px',
                          background: C.white,
                          textAlign: 'center',
                          minWidth: 100, maxWidth: 140,
                        }}
                      >
                        {/* 번호 뱃지 */}
                        <div style={{
                          position: 'absolute', top: -9, right: -9,
                          width: 20, height: 20, borderRadius: '50%',
                          background: deptColor, color: C.white,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, fontWeight: 700,
                        }}>
                          {stepNumberMap[step.id]}
                        </div>
                        {/* 화면명 */}
                        {step.screenName && (
                          <div style={{ fontSize: 10, color: deptColor, fontWeight: 600, marginBottom: 3 }}>
                            {step.screenName}
                          </div>
                        )}
                        {/* 단계명 */}
                        <div style={{
                          fontSize: 11, fontWeight: 700, color: C.gray700,
                          lineHeight: 1.4, wordBreak: 'keep-all', overflowWrap: 'break-word',
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
                    ))}
                  </div>
                )
              }),
            ]
          })}
        </div>

        {/* ── SVG 오버레이: 화살표 ── */}
        <svg style={{
          position: 'absolute', top: 0, left: 0,
          width: '100%', height: '100%',
          pointerEvents: 'none',
          overflow: 'visible',
        }}>
          <defs>
            {/* 색상별 화살촉 마커 */}
            {markerColors.map(color => (
              <marker
                key={color}
                id={`arrow-${color.replace('#', '')}`}
                markerWidth="8" markerHeight="8"
                refX="6" refY="3"
                orient="auto"
              >
                <path d="M0,0 L0,6 L8,3 z" fill={color} />
              </marker>
            ))}
          </defs>

          {arrows.map((arrow, i) => (
            <path
              key={i}
              d={arrow.d}
              stroke={arrow.color}
              strokeWidth="1.5"
              strokeDasharray={arrow.isSameLane ? 'none' : '4,2'}
              fill="none"
              markerEnd={`url(#arrow-${arrow.color.replace('#', '')})`}
            />
          ))}
        </svg>
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
          <svg width="20" height="6">
            <line x1="0" y1="3" x2="20" y2="3"
              stroke={C.gray300} strokeWidth="1.5" strokeDasharray="4,2" />
          </svg>
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
