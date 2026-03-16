import { useState } from 'react'
import { C } from '../../constants'

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

/**
 * AddModal — 부서/그룹/프로세스 추가
 * @param {{ level: 'dept'|'group'|'proc', onSave: (data: object) => void, onClose: () => void }} props
 */
export default function AddModal({ level, onSave, onClose }) {
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
      onSave({ ...form, name })
    }
  }

  const title = level === 'dept' ? '부서 추가' : level === 'group' ? '그룹 추가' : '프로세스 추가'

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: C.gray700 }}>{title}</h3>

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

        {/* 샘플 안내 */}
        <div style={{
          background: C.bluePale,
          borderRadius: 8,
          padding: '10px 14px',
          fontSize: 12,
          color: C.gray500,
          marginBottom: 20,
          lineHeight: 1.6,
        }}>
          {level === 'dept' && '💡 부서명은 간결하게 입력하세요 (예: CO팀, 재무팀)'}
          {level === 'group' && '💡 그룹은 관련 프로세스들의 묶음입니다 (예: 마감 프로세스, 예산 관리 프로세스)'}
          {level === 'proc' && '💡 프로세스는 그룹 내 세부 업무 흐름입니다 (예: 물류마감 Check 프로세스)'}
        </div>

        {/* 버튼 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={btnSecondaryStyle}>취소</button>
          <button onClick={handleSubmit} style={btnPrimaryStyle}>추가</button>
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
  width: 420, maxHeight: '80vh', overflowY: 'auto',
  boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
}

const labelStyle = {
  display: 'block', fontSize: 12, fontWeight: 600,
  color: C.gray700, marginBottom: 6,
}

const inputStyle = {
  width: '100%', padding: '8px 12px', fontSize: 13,
  border: `1px solid ${C.border}`, borderRadius: 8,
  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
}

const btnPrimaryStyle = {
  padding: '8px 20px', fontSize: 13, fontWeight: 600,
  background: C.blue, color: C.white, border: 'none',
  borderRadius: 8, cursor: 'pointer',
}

const btnSecondaryStyle = {
  padding: '8px 20px', fontSize: 13, fontWeight: 600,
  background: C.gray100, color: C.gray500, border: 'none',
  borderRadius: 8, cursor: 'pointer',
}
