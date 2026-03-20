import { useEffect } from 'react'
import { C } from '../../constants'
import { overlayStyle, modalStyle as modalStyleFn, btnSecondaryStyle, btnDangerStyle } from '../../styles/modalStyles'

/**
 * DeleteConfirmModal — 삭제 확인 팝업
 */
export default function DeleteConfirmModal({ targetName, targetType, childInfo, onConfirm, onClose }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true" onClick={onClose}>
      <div style={modalStyleFn(400)} onClick={(e) => e.stopPropagation()}>
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

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={btnSecondaryStyle}>취소</button>
          <button onClick={onConfirm} style={btnDangerStyle}>삭제</button>
        </div>
      </div>
    </div>
  )
}
