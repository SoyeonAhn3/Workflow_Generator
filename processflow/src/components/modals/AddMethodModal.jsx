import { C } from '../../constants'
import ModalBase from './ModalBase'
import { btnSecondaryStyle } from '../../styles/modalStyles'

export default function AddMethodModal({ onSelectDirect, onSelectAI, onClose }) {
  return (
    <ModalBase title="프로세스 추가" width={460} onClose={onClose}>
      <p style={{ margin: '-12px 0 24px', fontSize: 13, color: C.gray500 }}>
        추가 방법을 선택하세요
      </p>

      <div style={{ display: 'flex', gap: 14 }}>
        <button
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
        </button>

        <button
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
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
        <button onClick={onClose} style={{ ...btnSecondaryStyle, background: C.white, border: `1px solid ${C.border}` }}>취소</button>
      </div>
    </ModalBase>
  )
}

const cardStyle = {
  flex: 1, padding: '24px 16px', textAlign: 'center',
  border: `1.5px solid ${C.border}`, borderRadius: 10,
  cursor: 'pointer', transition: 'all 0.15s',
  background: C.white, fontFamily: 'inherit',
}
