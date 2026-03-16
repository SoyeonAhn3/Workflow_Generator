import { useState, useEffect } from 'react'
import { C } from '../../constants'
import { saveImage, deleteImage, loadImage } from '../../imageDB'

/**
 * StepModal — 단계 추가/수정 + 이미지 첨부
 * @param {{
 *   mode: 'add'|'edit',
 *   step?: object,
 *   onSave: (stepData: object) => void,
 *   onClose: () => void,
 * }} props
 */
export default function StepModal({ mode, step, onSave, onClose }) {
  const [title, setTitle] = useState('')
  const [screenName, setScreenName] = useState('')
  const [dept, setDept] = useState('')
  const [pt, setPt] = useState('')
  const [logic, setLogic] = useState('')
  const [warning, setWarning] = useState('')
  const [images, setImages] = useState([])       // { id, name, previewUrl? }
  const [previews, setPreviews] = useState({})    // { [id]: blobUrl }

  // edit 모드: 기존 데이터 채우기
  useEffect(() => {
    if (mode === 'edit' && step) {
      setTitle(step.title || '')
      setScreenName(step.screenName || '')
      setDept(step.dept || '')
      setPt(step.pt || '')
      setLogic(step.logic || '')
      setWarning(step.warning || '')
      setImages(step.images || [])
      // 기존 이미지 미리보기 로드
      ;(step.images || []).forEach(async (img) => {
        const record = await loadImage(img.id)
        if (record?.blob) {
          setPreviews((prev) => ({ ...prev, [img.id]: URL.createObjectURL(record.blob) }))
        }
      })
    }
  }, [mode, step])

  // cleanup blob URLs
  useEffect(() => {
    return () => Object.values(previews).forEach((url) => URL.revokeObjectURL(url))
  }, [])

  const handleImageAdd = async (e) => {
    const files = Array.from(e.target.files || [])
    for (const file of files) {
      const blob = new Blob([await file.arrayBuffer()], { type: file.type })
      const id = 'img_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6)
      await saveImage(id, blob, file.name)
      setImages((prev) => [...prev, { id, name: file.name }])
      setPreviews((prev) => ({ ...prev, [id]: URL.createObjectURL(blob) }))
    }
    e.target.value = ''
  }

  const handleImageRemove = async (imageId) => {
    await deleteImage(imageId)
    setImages((prev) => prev.filter((img) => img.id !== imageId))
    if (previews[imageId]) {
      URL.revokeObjectURL(previews[imageId])
      setPreviews((prev) => {
        const next = { ...prev }
        delete next[imageId]
        return next
      })
    }
  }

  const handleSubmit = () => {
    const trimTitle = title.trim()
    if (!trimTitle) return alert('단계명을 입력하세요')
    onSave({
      id: mode === 'edit' ? step.id : 'step_' + Date.now(),
      title: trimTitle,
      screenName: screenName.trim(),
      dept: dept.trim(),
      pt: pt.trim(),
      logic: logic.trim(),
      warning: warning.trim(),
      images,
    })
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: C.gray700 }}>
          {mode === 'edit' ? '단계 수정' : '단계 추가'}
        </h3>

        {/* 단계명 */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>단계명 <span style={{ color: C.red }}>*</span></label>
          <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} autoFocus
            placeholder="예: 물류 미결 현황 조회" />
        </div>

        {/* 화면명 / 담당 / PT */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>화면명 (T-Code/프로그램)</label>
            <input style={inputStyle} value={screenName} onChange={(e) => setScreenName(e.target.value)}
              placeholder="예: MB52" />
          </div>
          <div>
            <label style={labelStyle}>담당</label>
            <input style={inputStyle} value={dept} onChange={(e) => setDept(e.target.value)}
              placeholder="예: CO팀" />
          </div>
          <div>
            <label style={labelStyle}>PT</label>
            <input style={inputStyle} value={pt} onChange={(e) => setPt(e.target.value)}
              placeholder="예: 30min" />
          </div>
        </div>

        {/* Logic */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Logic</label>
          <textarea style={{ ...inputStyle, height: 80, resize: 'vertical' }}
            value={logic} onChange={(e) => setLogic(e.target.value)}
            placeholder="단계별 상세 설명을 입력하세요" />
        </div>

        {/* 주의사항 */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>주의사항</label>
          <input style={inputStyle} value={warning} onChange={(e) => setWarning(e.target.value)}
            placeholder="예: 기한 내 미완료 시 escalation" />
        </div>

        {/* 이미지 첨부 */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>이미지 첨부</label>
          <label style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '6px 14px', fontSize: 12, fontWeight: 600,
            background: C.gray100, border: `1px solid ${C.border}`,
            borderRadius: 8, cursor: 'pointer', color: C.gray500,
          }}>
            📎 파일 선택
            <input type="file" accept="image/*" multiple onChange={handleImageAdd}
              style={{ display: 'none' }} />
          </label>

          {/* 이미지 미리보기 */}
          {images.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
              {images.map((img) => (
                <div key={img.id} style={{
                  position: 'relative', width: 80, height: 80,
                  borderRadius: 6, overflow: 'hidden', border: `1px solid ${C.border}`,
                }}>
                  {previews[img.id] ? (
                    <img src={previews[img.id]} alt={img.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: C.gray100,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, color: C.gray300 }}>로딩...</div>
                  )}
                  <button onClick={() => handleImageRemove(img.id)} style={{
                    position: 'absolute', top: 2, right: 2,
                    width: 18, height: 18, borderRadius: '50%',
                    background: 'rgba(0,0,0,0.5)', color: C.white,
                    border: 'none', cursor: 'pointer', fontSize: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 버튼 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={btnSecondaryStyle}>취소</button>
          <button onClick={handleSubmit} style={btnPrimaryStyle}>
            {mode === 'edit' ? '수정' : '추가'}
          </button>
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
  width: 520, maxHeight: '85vh', overflowY: 'auto',
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
