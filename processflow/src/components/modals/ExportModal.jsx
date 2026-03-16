import { useState } from 'react'
import { C } from '../../constants.js'
import { generateGroupWord } from '../../wordExport.js'

/**
 * ExportModal — Word 내보내기 모달
 * @param {{
 *   group: object,
 *   deptName: string,
 *   onClose: () => void,
 * }} props
 */
export default function ExportModal({ group, deptName, onClose }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const totalSteps = group.processes.reduce((s, p) => s + (p.steps?.length || 0), 0)

  const handleExport = async () => {
    setLoading(true)
    setError(null)
    try {
      await generateGroupWord(group, deptName)
      onClose()
    } catch (err) {
      console.error("Word 생성 실패:", err)
      setError("생성 중 오류가 발생했습니다. 다시 시도해 주세요.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.gray700 }}>
            Word 내보내기
          </h3>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: C.gray500 }}>
            {group.name} — {deptName}
          </p>
        </div>

        {/* 포함 프로세스 목록 */}
        <div style={{
          border: `1px solid ${C.border}`, borderRadius: 8,
          overflow: 'hidden', marginBottom: 16,
        }}>
          <div style={{
            background: C.navy, color: C.white, padding: '8px 14px',
            fontSize: 12, fontWeight: 600,
          }}>
            포함 프로세스 ({group.processes.length}개, 총 {totalSteps}단계)
          </div>
          {group.processes.map((proc, i) => (
            <div key={proc.id} style={{
              padding: '10px 14px',
              borderBottom: i < group.processes.length - 1 ? `1px solid ${C.border}` : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: i % 2 === 1 ? C.gray100 : C.white,
              fontSize: 13,
            }}>
              <div>
                <span style={{ color: C.blue, fontWeight: 700, marginRight: 8 }}>{i + 1}</span>
                <span style={{ fontWeight: 600, color: C.gray700 }}>{proc.name}</span>
              </div>
              <div style={{ fontSize: 12, color: C.gray500 }}>
                {proc.owner || '—'} · {proc.steps?.length || 0}단계
              </div>
            </div>
          ))}
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div style={{
            background: C.redLight, border: `1px solid ${C.redBorder}`,
            borderRadius: 8, padding: '10px 14px', marginBottom: 16,
            fontSize: 13, color: C.red,
          }}>
            {error}
          </div>
        )}

        {/* 버튼 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={cancelBtnStyle} disabled={loading}>
            닫기
          </button>
          <button onClick={handleExport} style={{
            ...exportBtnStyle,
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }} disabled={loading}>
            {loading ? '생성 중...' : 'Word 파일 다운로드'}
          </button>
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
  width: 520, maxHeight: '80vh', overflowY: 'auto',
  boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
}

const cancelBtnStyle = {
  padding: '8px 20px', fontSize: 13, fontWeight: 600,
  background: C.white, color: C.gray500,
  border: `1px solid ${C.border}`, borderRadius: 8, cursor: 'pointer',
}

const exportBtnStyle = {
  padding: '8px 20px', fontSize: 13, fontWeight: 600,
  background: C.blue, color: C.white,
  border: 'none', borderRadius: 8, cursor: 'pointer',
}
