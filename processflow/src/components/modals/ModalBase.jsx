import { useEffect, useId } from 'react'
import { C } from '../../constants'
import { overlayStyle, modalStyle as modalStyleFn } from '../../styles/modalStyles'

/**
 * ModalBase — 모든 모달의 공통 래퍼
 *
 * 제공 기능:
 *   - 오버레이(어두운 배경) + 흰색 모달 박스
 *   - 제목(h3)
 *   - Escape 키로 닫기
 *   - role="dialog" + aria-labelledby (접근성)
 *   - 오버레이 클릭으로 닫기
 *
 * @param {{ title: string, width?: number, onClose: () => void, children: React.ReactNode }} props
 */
export default function ModalBase({ title, width = 440, onClose, children }) {
  const titleId = useId()

  // Escape 키로 닫기
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      style={overlayStyle}
      role="dialog"
      aria-labelledby={titleId}
      aria-modal="true"
      onClick={onClose}
    >
      <div style={modalStyleFn(width)} onClick={(e) => e.stopPropagation()}>
        <h3
          id={titleId}
          style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: C.gray700 }}
        >
          {title}
        </h3>
        {children}
      </div>
    </div>
  )
}

/** 버튼 행 래퍼 (우측 정렬) */
export function ModalButtons({ children }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
      {children}
    </div>
  )
}

