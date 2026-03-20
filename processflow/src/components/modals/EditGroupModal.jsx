import { useState } from 'react'
import { C } from '../../constants'
import ModalBase, { ModalButtons } from './ModalBase'
import { labelStyle, inputStyle, btnPrimaryStyle, btnSecondaryStyle } from '../../styles/modalStyles'

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

    if (currentDeptObj && newDeptName !== currentDeptObj.name) {
      const targetDept = allDepts.find((d) => d.name === newDeptName)
      if (!targetDept) {
        setDeptError(`"${newDeptName}" 부서가 없습니다. 먼저 사이드바에서 해당 부서를 추가해 주세요.`)
        return
      }
      onSave({ ...group, name: name.trim(), dept: newDeptName, module: module.trim() }, targetDept.id)
    } else {
      onSave({ ...group, name: name.trim(), dept: newDeptName, module: module.trim() }, null)
    }
  }

  return (
    <ModalBase title="그룹 수정" width={440} onClose={onClose}>
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

      <ModalButtons>
        <button onClick={onClose} style={btnSecondaryStyle}>취소</button>
        <button onClick={handleSubmit} style={btnPrimaryStyle}>저장</button>
      </ModalButtons>
    </ModalBase>
  )
}
