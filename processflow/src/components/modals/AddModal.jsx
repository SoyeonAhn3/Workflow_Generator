import { useState } from 'react'
import { C } from '../../constants'
import ModalBase, { ModalButtons } from './ModalBase'
import { labelStyle, inputStyle, btnPrimaryStyle, btnSecondaryStyle } from '../../styles/modalStyles'

const SAMPLES = {
  dept: { label: '부서명', placeholder: '예: CO팀, 재무팀, MM팀' },
  group: {
    fields: [
      { key: 'name', label: '그룹명', placeholder: '예: 마감 프로세스', required: true },
      { key: 'dept', label: '담당 부서', placeholder: '예: CO팀', required: true },
      { key: 'module', label: 'Module', placeholder: '예: CO, FI, MM' },
      { key: 'description', label: '설명', placeholder: '예: 월 마감 관련 프로세스 그룹', multiline: true },
    ],
  },
  proc: {
    fields: [
      { key: 'name', label: '프로세스명', placeholder: '예: 물류마감 Check 프로세스', required: true },
      { key: 'dept', label: '담당 부서', placeholder: '예: CO팀' },
      { key: 'owner', label: '담당자', placeholder: '예: 김재무' },
      { key: 'module', label: 'Module', placeholder: '예: CO' },
      { key: 'description', label: '설명', placeholder: '예: 월 마감 전 물류 미결 항목 확인 프로세스', multiline: true },
    ],
  },
}

export default function AddModal({ level, onSave, onClose, deptNames = [] }) {
  const [form, setForm] = useState({})
  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = () => {
    if (level === 'dept') {
      const name = (form.name || '').trim()
      if (!name) return alert('부서명을 입력하세요')
      onSave({ name })
    } else {
      const cfg = SAMPLES[level]
      const name = (form.name || '').trim()
      if (!name) return alert(`${cfg.fields[0].label}을(를) 입력하세요`)
      if (level === 'group' && !(form.dept || '').trim()) return alert('담당 부서를 입력하세요')
      if (level === 'group' && deptNames.length > 0 && !deptNames.includes((form.dept || '').trim())) {
        return alert(`"${(form.dept || '').trim()}" 부서는 존재하지 않습니다.\n등록된 부서: ${deptNames.join(', ')}`)
      }
      onSave({ ...form, name })
    }
  }

  const title = level === 'dept' ? '부서 추가' : level === 'group' ? '그룹 추가' : '프로세스 추가'

  return (
    <ModalBase title={title} width={420} onClose={onClose}>
      {level === 'dept' ? (
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>{SAMPLES.dept.label} <span style={{ color: C.red }}>*</span></label>
          <input
            style={inputStyle}
            placeholder={SAMPLES.dept.placeholder}
            value={form.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            autoFocus
          />
        </div>
      ) : (
        SAMPLES[level].fields.map((f) => (
          <div key={f.key} style={{ marginBottom: 14 }}>
            <label style={labelStyle}>
              {f.label} {f.required && <span style={{ color: C.red }}>*</span>}
            </label>
            {f.multiline ? (
              <textarea
                style={{ ...inputStyle, height: 64, resize: 'vertical' }}
                placeholder={f.placeholder}
                value={form[f.key] || ''}
                onChange={(e) => handleChange(f.key, e.target.value)}
              />
            ) : (
              <input
                style={inputStyle}
                placeholder={f.placeholder}
                value={form[f.key] || ''}
                onChange={(e) => handleChange(f.key, e.target.value)}
                autoFocus={f.required}
              />
            )}
          </div>
        ))
      )}

      <div style={{
        background: C.bluePale, borderRadius: 8, padding: '10px 14px',
        fontSize: 12, color: C.gray500, marginBottom: 20, lineHeight: 1.6,
      }}>
        {level === 'dept' && '💡 부서명은 간결하게 입력하세요 (예: CO팀, 재무팀)'}
        {level === 'group' && '💡 그룹은 관련 프로세스들의 묶음입니다 (예: 마감 프로세스, 예산 관리 프로세스)'}
        {level === 'proc' && '💡 프로세스는 그룹 내 세부 업무 흐름입니다 (예: 물류마감 Check 프로세스)'}
      </div>

      <ModalButtons>
        <button onClick={onClose} style={btnSecondaryStyle}>취소</button>
        <button onClick={handleSubmit} style={btnPrimaryStyle}>추가</button>
      </ModalButtons>
    </ModalBase>
  )
}
