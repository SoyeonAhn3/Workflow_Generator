import { C } from '../../constants'

/**
 * DeleteConfirmModal — 삭제 확인 팝업
 * @param {{
 *   targetName: string,
 *   targetType: '부서'|'그룹'|'프로세스',
 *   childInfo?: string,
 *   onConfirm: () => void,
 *   onClose: () => void,
 * }} props
 */
export default function DeleteConfirmModal({ targetName, targetType, childInfo, onConfirm, onClose }) {
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* 아이콘 */}
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: C.redLight, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: 22, marginBottom: 16,
        }}>
          🗑
        </div>

        <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: C.gray700 }}>
          {targetType} 삭제
        </h3>
        <p style={{ fontSize: 13, color: C.gray500, lineHeight: 1.6, margin: '0 0 8px' }}>
          <strong style={{ color: C.gray700 }}>"{targetName}"</strong> {targetType}를 삭제하시겠습니까?
        </p>

        {childInfo && (
          <div style={{
            background: C.redLight, border: `1px solid ${C.redBorder}`,
            borderRadius: 8, padding: '10px 14px', fontSize: 12,
            color: C.red, marginBottom: 16, lineHeight: 1.6,
          }}>
            ⚠️ {childInfo}
          </div>
        )}

        <p style={{ fontSize: 12, color: C.gray300, margin: '0 0 20px' }}>
          이 작업은 되돌릴 수 없습니다.
        </p>

        {/* 버튼 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={btnSecondaryStyle}>취소</button>
          <button onClick={onConfirm} style={btnDangerStyle}>삭제</button>
        </div>
      </div>
    </div>
  )
}

const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.4)', display: 'flex',
  alignItems: 'center', justifyContent: 'center', zIndex: 200,
}

const modalStyle = {
  background: C.white, borderRadius: 12, padding: '28px 32px',
  width: 400, boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
}

const btnDangerStyle = {
  padding: '8px 20px', fontSize: 13, fontWeight: 600,
  background: C.red, color: C.white, border: 'none',
  borderRadius: 8, cursor: 'pointer',
}

const btnSecondaryStyle = {
  padding: '8px 20px', fontSize: 13, fontWeight: 600,
  background: C.gray100, color: C.gray500, border: 'none',
  borderRadius: 8, cursor: 'pointer',
}
