import { useState, useEffect } from 'react'
import { C } from '../../constants'
import { overlayStyle, modalStyle as modalStyleFn, labelStyle, inputStyle, btnPrimaryStyle, btnSecondaryStyle } from '../../styles/modalStyles'

/**
 * AIGenerateModal — AI 자동 구조화 3단계 위자드
 */
export default function AIGenerateModal({ deptName, onComplete, onClose }) {
  const [wizardStep, setWizardStep] = useState(1)
  const [procName, setProcName] = useState('')
  const [dept, setDept] = useState(deptName || '')
  const [owner, setOwner] = useState('')
  const [description, setDescription] = useState('')
  const [generatedSteps, setGeneratedSteps] = useState([])
  const [errorMsg, setErrorMsg] = useState(null)

  // Escape 키로 닫기
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleGenerate = async () => {
    if (!procName.trim()) return alert('프로세스명을 입력하세요')
    if (!description.trim()) return alert('업무 흐름 설명을 입력하세요')

    setWizardStep(2)
    setErrorMsg(null)

    try {
      const res = await fetch('/.netlify/functions/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInput: description.trim(),
          dept: dept.trim() || deptName,
        }),
      })

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody.error || `HTTP ${res.status}`)
      }

      const { steps } = await res.json()
      const stepsWithId = (steps || []).map((s, i) => ({
        id: 'step_' + Date.now() + '_' + i,
        title: s.title || '',
        screenName: s.screenName || '',
        dept: s.dept || dept.trim() || deptName,
        pt: s.pt || '',
        logic: s.logic || '',
        warning: s.warning || '',
        images: [],
      }))

      setGeneratedSteps(stepsWithId)
      setWizardStep(3)
    } catch (err) {
      setErrorMsg(err.message || 'AI 생성에 실패했습니다. 다시 시도해 주세요.')
      setWizardStep(1)
    }
  }

  const handleComplete = () => {
    const now = new Date()
    onComplete({
      id: 'proc_' + Date.now(),
      name: procName.trim(),
      dept: dept.trim() || deptName,
      owner: owner.trim(),
      module: '',
      description: '',
      updatedAt: `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}`,
      steps: generatedSteps,
    })
  }

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true" onClick={onClose}>
      <div style={modalStyleFn(540)} onClick={(e) => e.stopPropagation()}>

        {/* Step 1: 입력 폼 */}
        {wizardStep === 1 && (
          <>
            <h3 style={titleStyle}>✨ AI 자동 생성</h3>
            <p style={subtitleStyle}>
              업무 흐름을 텍스트로 설명하면 AI가 단계를 자동 구성합니다
            </p>

            {errorMsg && <div style={errorBoxStyle}>{errorMsg}</div>}

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>프로세스명 <span style={{ color: C.red }}>*</span></label>
              <input style={inputStyle} value={procName} onChange={(e) => setProcName(e.target.value)}
                placeholder="예: 물류마감 Check 프로세스" autoFocus />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>담당 부서</label>
                <input style={inputStyle} value={dept} onChange={(e) => setDept(e.target.value)}
                  placeholder={deptName || '예: CO팀'} />
              </div>
              <div>
                <label style={labelStyle}>담당자</label>
                <input style={inputStyle} value={owner} onChange={(e) => setOwner(e.target.value)}
                  placeholder="예: 김재무" />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>업무 흐름 설명 <span style={{ color: C.red }}>*</span></label>
              <textarea
                style={{ ...inputStyle, height: 120, resize: 'vertical' }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="예: MB52에서 미결 현황 조회 → 담당자 메일 발송 → 처리 완료 후 MB52에서 재확인. 기한 미준수 시 escalation 필요"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={onClose} style={btnSecondaryStyle}>취소</button>
              <button onClick={handleGenerate} style={btnPrimaryStyle}>
                ✨ AI로 구조화
              </button>
            </div>
          </>
        )}

        {/* Step 2: 로딩 */}
        {wizardStep === 2 && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={spinnerStyle} />
            <div style={{ fontSize: 15, fontWeight: 600, color: C.gray700, marginTop: 20 }}>
              AI가 프로세스를 분석 중입니다...
            </div>
            <div style={{ fontSize: 12, color: C.gray500, marginTop: 8 }}>
              업무 흐름을 단계별로 구조화하고 있습니다
            </div>
          </div>
        )}

        {/* Step 3: 결과 미리보기 */}
        {wizardStep === 3 && (
          <>
            <h3 style={titleStyle}>생성 결과 미리보기</h3>
            <p style={subtitleStyle}>
              {procName} — {generatedSteps.length}개 단계 생성됨
            </p>

            <div style={{ maxHeight: 360, overflowY: 'auto', marginBottom: 20 }}>
              {generatedSteps.map((step, i) => (
                <div key={step.id} style={stepCardStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={stepBadgeStyle}>{i + 1}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.gray700 }}>
                      {step.title}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 11, color: C.gray500 }}>
                    <span>화면: {step.screenName || '—'}</span>
                    <span>부서: {step.dept || '—'}</span>
                    <span>PT: {step.pt || '—'}</span>
                  </div>
                  {step.logic && (
                    <div style={{ fontSize: 11, color: C.gray500, marginTop: 4, lineHeight: 1.4 }}>
                      {step.logic.split('\n')[0]}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setWizardStep(1)} style={btnSecondaryStyle}>
                ← 다시 입력
              </button>
              <button onClick={handleComplete} style={btnPrimaryStyle}>
                편집기에서 열기 →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── 이 모달 고유 스타일 (공통 스타일은 modalStyles.js에서 import) ──

const titleStyle = {
  margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: C.gray700,
}
const subtitleStyle = {
  margin: '0 0 20px', fontSize: 13, color: C.gray500,
}
const errorBoxStyle = {
  background: C.redLight, border: `1px solid ${C.redBorder}`,
  borderRadius: 8, padding: '10px 14px', marginBottom: 16,
  fontSize: 13, color: C.red,
}
const spinnerStyle = {
  width: 40, height: 40, margin: '0 auto',
  border: `3px solid ${C.gray100}`,
  borderTop: `3px solid ${C.blue}`,
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
}
const stepCardStyle = {
  padding: '12px 14px', marginBottom: 8,
  border: `1px solid ${C.border}`, borderRadius: 8,
  background: C.white,
}
const stepBadgeStyle = {
  width: 22, height: 22, borderRadius: '50%',
  background: C.blue, color: C.white,
  fontSize: 11, fontWeight: 700,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0,
}
