import { useState, useEffect } from 'react'
import { C } from '../../constants'
import { loadImage } from '../../imageDB'

/**
 * StepCard — 단계 카드 (헤더 + 펼치면 상세 섹션)
 */
export default function StepCard({ step, index, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [imageUrls, setImageUrls] = useState({})

  useEffect(() => {
    if (!expanded || !step.images?.length) return
    let cancelled = false
    ;(async () => {
      const urls = {}
      for (const img of step.images) {
        if (imageUrls[img.id]) continue
        const record = await loadImage(img.id)
        if (record?.blob && !cancelled) {
          urls[img.id] = URL.createObjectURL(record.blob)
        }
      }
      if (!cancelled) setImageUrls((prev) => ({ ...prev, ...urls }))
    })()
    return () => { cancelled = true }
  }, [expanded, step.images])

  useEffect(() => {
    return () => Object.values(imageUrls).forEach((url) => URL.revokeObjectURL(url))
  }, [])

  const handleDelete = () => {
    if (window.confirm(`"${step.title}" 단계를 삭제하시겠습니까?`)) {
      onDelete()
    }
  }

  const hasWarning = !!step.warning

  return (
    <div style={{
      background: C.white,
      border: `1px solid ${C.border}`,
      borderLeft: `4px solid ${hasWarning ? '#f59e0b' : C.blue}`,
      borderRadius: 10,
      overflow: 'hidden',
      boxShadow: C.cardShadow,
      transition: 'box-shadow 0.15s',
    }}>
      {/* ── 헤더 (항상 표시) ── */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 16px', cursor: 'pointer',
        }}
        onClick={() => setExpanded((v) => !v)}
      >
        {/* 번호 뱃지 */}
        <div style={{
          width: 32, height: 32, minWidth: 32, borderRadius: 8,
          background: hasWarning ? '#f59e0b' : C.blue,
          color: C.white,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700, flexShrink: 0,
        }}>
          {index + 1}
        </div>

        {/* 단계명 + 메타 뱃지 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.gray700, marginBottom: 6 }}>
            {step.title}
            {hasWarning && (
              <span style={{
                marginLeft: 8, fontSize: 11, color: '#b45309',
                background: '#fffbeb', border: '1px solid #fde68a',
                padding: '1px 7px', borderRadius: 10, fontWeight: 500,
              }}>
                ⚠ 주의
              </span>
            )}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {step.screenName && (
              <span style={screenBadgeStyle}>{step.screenName}</span>
            )}
            {step.dept && (
              <span style={metaBadgeStyle}>🏢 {step.dept}</span>
            )}
            {step.pt && (
              <span style={{ ...metaBadgeStyle, background: '#F0F4F8', color: C.gray500 }}>
                ⏱ {step.pt}
              </span>
            )}
          </div>
        </div>

        {/* 액션 버튼 */}
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
          <button onClick={onEdit} style={iconBtnStyle} title="수정">✏</button>
          <button onClick={handleDelete} style={{ ...iconBtnStyle, color: C.gray300 }} title="삭제">🗑</button>
        </div>

        {/* 펼치기 */}
        <span style={{
          fontSize: 11, color: expanded ? C.blue : C.gray300,
          background: expanded ? C.bluePale : 'transparent',
          border: `1px solid ${expanded ? C.blueLight : 'transparent'}`,
          padding: '3px 7px', borderRadius: 6, marginLeft: 2, flexShrink: 0,
          transition: 'all 0.1s',
        }}>
          {expanded ? '▲' : '▼'}
        </span>
      </div>

      {/* ── 상세 본문 (펼쳤을 때) ── */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${C.border}` }}>

          {/* 정보 그리드 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            borderBottom: `1px solid ${C.border}`,
          }}>
            <InfoCell label="화면명 (T-Code)" value={step.screenName || '—'} />
            <InfoCell label="담당 부서" value={step.dept || '—'} noBorderRight={false} />
            <InfoCell label="소요 시간" value={step.pt || '—'} noBorderRight={true} />
          </div>

          {/* Logic */}
          {step.logic && (
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}` }}>
              <div style={sectionLabelStyle}>Logic</div>
              <div style={{
                fontSize: 13, color: C.gray700,
                background: '#F7FAFD',
                border: `1px solid #D8E8F6`,
                borderRadius: 6,
                padding: '10px 14px',
                whiteSpace: 'pre-line',
                lineHeight: 1.75,
              }}>
                {step.logic}
              </div>
            </div>
          )}

          {/* 이미지 */}
          {step.images?.length > 0 && (
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}` }}>
              <div style={sectionLabelStyle}>첨부 이미지</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {step.images.map((img) => (
                  <div key={img.id} style={{
                    borderRadius: 8, overflow: 'hidden',
                    border: `1px solid ${C.border}`,
                    boxShadow: C.cardShadow,
                  }}>
                    {imageUrls[img.id] ? (
                      <img
                        src={imageUrls[img.id]}
                        alt={img.name}
                        style={{ width: 200, height: 140, objectFit: 'cover', display: 'block' }}
                      />
                    ) : (
                      <div style={{
                        width: 200, height: 140,
                        background: C.gray100,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, color: C.gray300,
                      }}>로딩...</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 주의사항 */}
          {step.warning && (
            <div style={{ padding: '12px 18px' }}>
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                background: C.warningBg,
                border: `1px solid ${C.warningBorder}`,
                borderRadius: 8,
                padding: '10px 14px',
              }}>
                <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>⚠️</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.warning, marginBottom: 2 }}>주의사항</div>
                  <div style={{ fontSize: 13, color: C.warning, lineHeight: 1.6 }}>
                    {step.warning}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 내용 없음 */}
          {!step.logic && !step.warning && !step.images?.length && (
            <div style={{
              padding: '20px', textAlign: 'center',
              fontSize: 13, color: C.gray300,
            }}>
              상세 내용 없음
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/** 정보 그리드 셀 */
function InfoCell({ label, value, noBorderRight }) {
  return (
    <div style={{
      padding: '10px 16px',
      borderRight: noBorderRight ? 'none' : `1px solid ${C.border}`,
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: C.gray300, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: C.gray700 }}>
        {value}
      </div>
    </div>
  )
}

const screenBadgeStyle = {
  display: 'inline-flex', alignItems: 'center',
  background: C.navy, color: C.white,
  fontSize: 11, fontWeight: 700,
  padding: '2px 8px', borderRadius: 6,
  letterSpacing: '0.3px',
}

const metaBadgeStyle = {
  display: 'inline-flex', alignItems: 'center',
  background: C.gray100, color: C.gray500,
  border: `1px solid ${C.border}`,
  fontSize: 11, fontWeight: 500,
  padding: '2px 8px', borderRadius: 12,
}

const sectionLabelStyle = {
  fontSize: 11, fontWeight: 700, color: C.gray500,
  textTransform: 'uppercase', letterSpacing: '0.5px',
  marginBottom: 8,
}

const iconBtnStyle = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: 15, color: C.gray500,
  padding: '5px 7px', borderRadius: 6,
}
