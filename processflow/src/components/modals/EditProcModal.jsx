import { useState } from 'react'
import { C } from '../../constants'
import ModalBase, { ModalButtons } from './ModalBase'
import { labelStyle, inputStyle, btnPrimaryStyle, btnSecondaryStyle } from '../../styles/modalStyles'

export default function EditProcModal({ proc, allDepts = [], onSave, onClose }) {
  const [name,        setName]        = useState(proc.name || '')
  const [dept,        setDept]        = useState(proc.dept || '')
  const [owner,       setOwner]       = useState(proc.owner || '')
  const [module,      setModule]      = useState(proc.module || '')
  const [description, setDescription] = useState(proc.description || '')
  const [deptError,   setDeptError]   = useState('')

  const deptNames = allDepts.map((d) => d.name)

  const handleDeptChange = (val) => {
    setDept(val)
    if (val.trim() && !deptNames.includes(val.trim())) {
      setDeptError(`"${val.trim()}" 부서가 존재하지 않습니다`)
    } else {
      setDeptError('')
    }
  }

  const handleSubmit = () => {
    if (!name.trim()) return alert('프로세스명을 입력하세요')
    if (dept.trim() && !deptNames.includes(dept.trim())) {
      return alert(`"${dept.trim()}" 부서가 존재하지 않습니다.\n등록된 부서: ${deptNames.join(', ')}`)
    }
    onSave({ ...proc, name: name.trim(), dept: dept.trim(), owner: owner.trim(), module: module.trim(), description: description.trim() })
  }

  return (
    <ModalBase title="프로세스 수정" width={440} onClose={onClose}>
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>프로세스명 <span style={{ color: C.red }}>*</span></label>
        <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <div>
          <label style={labelStyle}>담당 부서</label>
          <input
            style={{ ...inputStyle, borderColor: deptError ? C.red : C.border }}
            value={dept}
            onChange={(e) => handleDeptChange(e.target.value)}
            placeholder="예: CO팀"
          />
          {deptError && (
            <div style={{ fontSize: 11, color: C.red, marginTop: 4 }}>{deptError}</div>
          )}
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

      <ModalButtons>
        <button onClick={onClose} style={btnSecondaryStyle}>취소</button>
        <button onClick={handleSubmit} style={btnPrimaryStyle}>저장</button>
      </ModalButtons>
    </ModalBase>
  )
}
