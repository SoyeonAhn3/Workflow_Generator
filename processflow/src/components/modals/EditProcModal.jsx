import { useState } from 'react'
import { C } from '../../constants'

/**
 * EditProcModal — 프로세스 정보 수정 (이름/부서/담당자/모듈/설명)
 * @param {{
 *   proc: object,
 *   onSave: (updated: object) => void,
 *   onClose: () => void,
 * }} props
 */
export default function EditProcModal({ proc, onSave, onClose }) {
  const [name,        setName]        = useState(proc.name || '')
  const [dept,        setDept]        = useState(proc.dept || '')
  const [owner,       setOwner]       = useState(proc.owner || '')
  const [module,      setModule]      = useState(proc.module || '')
  const [description, setDescription] = useState(proc.description || '')

  const handleSubmit = () => {
    if (!name.trim()) return alert('프로세스명을 입력하세요')
    onSave({ ...proc, name: name.trim(), dept: dept.trim(), owner: owner.trim(), module: module.trim(), description: description.trim() })
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: C.gray700 }}>프로세스 수정</h3>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>프로세스명 <span style={{ color: C.red }}>*</span></label>
          <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>담당 부서</label>
            <input style={inputStyle} value={dept} onChange={(e) => setDept(e.target.value)} placeholder="예: CO팀" />
          </div>
          <div>
            <label style={labelStyle}>담당자</label>
            <input style={inputStyle} value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="예: 김재무" />
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Module</label>
          <input style={inputStyle} value={module} onChange={(e) => setModule(e.target.value)} placeholder="예: CO, FI, MM" />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>설명</label>
          <textarea style={{ ...inputStyle, height: 64, resize: 'vertical' }}
            value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="프로세스 간략 설명" />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={btnSecondaryStyle}>취소</button>
          <button onClick={handleSubmit} style={btnPrimaryStyle}>저장</button>
        </div>
      </div>
    </div>
  )
}

const overlayStyle = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9000,
}
const modalStyle = {
  background: C.white, borderRadius: 12, padding: '28px 32px',
  width: 440, boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
}
const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: C.gray700, marginBottom: 6 }
const inputStyle = {
  width: '100%', padding: '8px 12px', fontSize: 13,
  border: `1px solid ${C.border}`, borderRadius: 8,
  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
}
const btnPrimaryStyle = {
  padding: '8px 20px', fontSize: 13, fontWeight: 600,
  background: C.blue, color: C.white, border: 'none', borderRadius: 8, cursor: 'pointer',
}
const btnSecondaryStyle = {
  padding: '8px 20px', fontSize: 13, fontWeight: 600,
  background: C.gray100, color: C.gray500, border: 'none', borderRadius: 8, cursor: 'pointer',
}
