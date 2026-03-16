import { useState } from 'react'
import { C } from '../../constants'

/**
 * EditGroupModal — 그룹 이름/부서 수정
 * 부서 변경 시: 해당 부서 존재 → 그룹 이동, 없는 부서 → 경고
 * @param {{
 *   group: object,
 *   allDepts: object[],
 *   onSave: (updated: object, newDeptId: string|null) => void,
 *   onClose: () => void,
 * }} props
 */
export default function EditGroupModal({ group, allDepts, onSave, onClose }) {
  const [name,   setName]   = useState(group.name || '')
  const [dept,   setDept]   = useState(group.dept || '')
  const [module, setModule] = useState(group.module || '')
  const [deptError, setDeptError] = useState(null)

  const handleSubmit = () => {
    if (!name.trim()) return alert('그룹명을 입력하세요')
    if (!dept.trim()) return alert('담당 부서를 입력하세요')

    const newDeptName = dept.trim()
    const currentDeptObj = allDepts.find((d) => d.groups.some((g) => g.id === group.id))

    // 부서가 변경된 경우
    if (currentDeptObj && newDeptName !== currentDeptObj.name) {
      const targetDept = allDepts.find((d) => d.name === newDeptName)
      if (!targetDept) {
        setDeptError(`"${newDeptName}" 부서가 없습니다. 먼저 사이드바에서 해당 부서를 추가해 주세요.`)
        return
      }
      // 다른 부서로 이동
      onSave({ ...group, name: name.trim(), dept: newDeptName, module: module.trim() }, targetDept.id)
    } else {
      // 같은 부서 내 수정
      onSave({ ...group, name: name.trim(), dept: newDeptName, module: module.trim() }, null)
    }
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: C.gray700 }}>그룹 수정</h3>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>그룹명 <span style={{ color: C.red }}>*</span></label>
          <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>담당 부서 <span style={{ color: C.red }}>*</span></label>
          <input style={inputStyle} value={dept}
            onChange={(e) => { setDept(e.target.value); setDeptError(null) }}
            placeholder="예: CO팀" />
          {deptError && (
            <div style={{ marginTop: 6, fontSize: 12, color: C.red }}>{deptError}</div>
          )}
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Module</label>
          <input style={inputStyle} value={module} onChange={(e) => setModule(e.target.value)} placeholder="예: CO, FI" />
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
