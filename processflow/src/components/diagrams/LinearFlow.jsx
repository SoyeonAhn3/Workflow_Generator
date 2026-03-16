import { C } from '../../constants'

/**
 * LinearFlow — 일렬 흐름도 (a → b → c)
 * @param {{ steps: Array }} props
 */
export default function LinearFlow({ steps }) {
  if (!steps || steps.length === 0) {
    return (
      <div style={{
        textAlign: 'center', color: C.gray300, fontSize: 13,
        padding: '32px 0',
      }}>
        우상단 + 단계 추가 버튼으로 단계를 추가하세요
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      overflowX: 'auto', padding: '16px 8px',
      gap: 0,
    }}>
      {steps.map((step, idx) => (
        <div key={step.id} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {/* 노드 */}
          <div style={{
            position: 'relative',
            border: `2px solid ${C.blue}`,
            borderRadius: 8,
            padding: '14px 16px 12px',
            width: 130,
            background: C.white,
          }}>
            {/* 번호 뱃지 (우상단) */}
            <div style={{
              position: 'absolute', top: -10, right: -10,
              width: 22, height: 22, borderRadius: '50%',
              background: C.blue, color: C.white,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700,
            }}>
              {idx + 1}
            </div>

            {/* 단계명 */}
            <div style={{
              fontSize: 11, fontWeight: 700, color: C.gray700,
              marginBottom: 6, lineHeight: 1.4,
              overflow: 'hidden', textOverflow: 'ellipsis',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            }}>
              {step.title}
            </div>

            {/* 화면명 */}
            {step.screenName && (
              <div style={{ fontSize: 9, color: C.blue, fontWeight: 600, marginBottom: 2 }}>
                {step.screenName}
              </div>
            )}

            {/* PT */}
            {step.pt && (
              <div style={{ fontSize: 10, color: C.gray500 }}>
                {step.pt}
              </div>
            )}
          </div>

          {/* 화살표 (마지막 노드 뒤에는 없음) */}
          {idx < steps.length - 1 && (
            <svg width="28" height="40" style={{ flexShrink: 0, margin: '0 2px' }}>
              <polygon
                points="2,16 18,16 18,10 26,20 18,30 18,24 2,24"
                fill={C.blue}
              />
            </svg>
          )}
        </div>
      ))}
    </div>
  )
}
