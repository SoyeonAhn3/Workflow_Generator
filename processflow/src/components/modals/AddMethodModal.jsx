import { C } from '../../constants'

/**
 * AddMethodModal — 프로세스 추가 방법 선택 (직접 입력 vs AI 자동 생성)
 * @param {{
 *   onSelectDirect: () => void,
 *   onSelectAI: () => void,
 *   onClose: () => void,
 * }} props
 */
export default function AddMethodModal({ onSelectDirect, onSelectAI, onClose }) {
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: C.gray700 }}>
          프로세스 추가
        </h3>
        <p style={{ margin: '0 0 24px', fontSize: 13, color: C.gray500 }}>
          추가 방법을 선택하세요
        </p>

        <div style={{ display: 'flex', gap: 14 }}>
          {/* 직접 입력 카드 */}
          <div
            onClick={onSelectDirect}
            style={cardStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = C.blue
              e.currentTarget.style.background = C.bluePale
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = C.border
              e.currentTarget.style.background = C.white
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 12 }}>📝</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.gray700, marginBottom: 6 }}>
              직접 입력
            </div>
            <div style={{ fontSize: 12, color: C.gray500, lineHeight: 1.5 }}>
              빈 프로세스를 생성한 후<br />단계를 직접 입력합니다
            </div>
          </div>

          {/* AI 자동 생성 카드 */}
          <div
            onClick={onSelectAI}
            style={cardStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = C.blue
              e.currentTarget.style.background = C.bluePale
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = C.border
              e.currentTarget.style.background = C.white
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 12 }}>✨</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.gray700, marginBottom: 6 }}>
              AI 자동 생성
            </div>
            <div style={{ fontSize: 12, color: C.gray500, lineHeight: 1.5 }}>
              업무 흐름을 텍스트로 설명하면<br />AI가 단계를 자동 구성합니다
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
          <button onClick={onClose} style={cancelBtnStyle}>취소</button>
        </div>
      </div>
    </div>
  )
}

const overlayStyle = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 9000,
}

const modalStyle = {
  background: C.white, borderRadius: 12, padding: '24px 28px',
  width: 460, boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
}

const cardStyle = {
  flex: 1, padding: '24px 16px', textAlign: 'center',
  border: `1.5px solid ${C.border}`, borderRadius: 10,
  cursor: 'pointer', transition: 'all 0.15s',
  background: C.white,
}

const cancelBtnStyle = {
  padding: '8px 20px', fontSize: 13, fontWeight: 600,
  background: C.white, color: C.gray500,
  border: `1px solid ${C.border}`, borderRadius: 8, cursor: 'pointer',
}
