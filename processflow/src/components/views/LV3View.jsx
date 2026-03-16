import { C } from '../../constants'
import StepCard from '../cards/StepCard'
import LinearFlow from '../diagrams/LinearFlow'

/**
 * LV3View — 프로세스 상세 (단계 목록)
 */
export default function LV3View({ dept, group, proc, onDeleteProc, onEditProc, onAddStep, onEditStep, onDeleteStep, onBack }) {
  if (!proc) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '60vh',
        color: C.gray300,
        fontSize: 15,
      }}>
        사이드바에서 프로세스를 선택하세요
      </div>
    )
  }

  return (
    <div>
      {/* 뒤로가기 */}
      <button onClick={onBack} style={backBtnStyle}>
        ← {group?.name}
      </button>

      {/* 프로세스 헤더 카드 */}
      <div style={{
        background: C.white,
        border: `1px solid ${C.border}`,
        borderLeft: `5px solid ${C.navy}`,
        borderRadius: 12,
        padding: '20px 24px',
        marginBottom: 20,
        boxShadow: C.cardShadow,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: C.navy, margin: '0 0 12px' }}>
              {proc.name}
            </h2>
            {/* 메타 정보 행 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: proc.description ? 12 : 0 }}>
              {proc.dept && (
                <span style={metaTagStyle}>
                  🏢 {proc.dept}
                </span>
              )}
              {proc.owner && (
                <span style={metaTagStyle}>
                  👤 {proc.owner}
                </span>
              )}
              {proc.module && (
                <span style={{ ...metaTagStyle, background: C.bluePale, color: C.blue, border: `1px solid ${C.blueLight}` }}>
                  {proc.module}
                </span>
              )}
              <span style={{ ...metaTagStyle, background: '#F0F4F8', color: C.gray500 }}>
                📋 단계 {proc.steps?.length ?? 0}개
              </span>
            </div>
            {proc.description && (
              <p style={{ margin: 0, fontSize: 13, color: C.gray500, lineHeight: 1.65, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
                {proc.description}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, marginLeft: 16, flexShrink: 0 }}>
            <button onClick={() => onEditProc(proc)} style={editBtnStyle}>
              ✏ 수정
            </button>
            <button onClick={() => onDeleteProc(proc)} style={deleteBtnStyle}>
              🗑 삭제
            </button>
          </div>
        </div>
      </div>

      {/* 전체 흐름도 */}
      <div style={{
        background: C.white, border: `1px solid ${C.border}`,
        borderRadius: 10, padding: '16px 20px', marginBottom: 20,
        boxShadow: C.cardShadow,
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ display: 'inline-block', width: 3, height: 14, background: C.blue, borderRadius: 2 }} />
          전체 흐름도
        </div>
        <LinearFlow steps={proc.steps ?? []} />
      </div>

      {/* 단계 목록 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ display: 'inline-block', width: 3, height: 14, background: C.blue, borderRadius: 2 }} />
          단계 목록
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: C.blue, color: C.white,
            fontSize: 11, fontWeight: 700,
            width: 20, height: 20, borderRadius: '50%', marginLeft: 4,
          }}>
            {proc.steps?.length ?? 0}
          </span>
        </div>
      </div>

      {/* 단계 목록 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(proc.steps ?? []).map((step, idx) => (
          <StepCard
            key={step.id}
            step={step}
            index={idx}
            onEdit={() => onEditStep(step)}
            onDelete={() => onDeleteStep(step)}
          />
        ))}

        {proc.steps?.length === 0 && (
          <div style={{
            textAlign: 'center', color: C.gray300, fontSize: 14,
            padding: '40px 0',
            background: C.white, borderRadius: 10, border: `1px solid ${C.border}`,
          }}>
            아직 단계가 없습니다
          </div>
        )}

        {/* 단계 추가 */}
        <div
          onClick={onAddStep}
          style={{
            border: `2px dashed ${C.gray300}`,
            borderRadius: 10,
            padding: '14px 20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            color: C.gray500,
            fontSize: 13,
            fontWeight: 500,
            transition: 'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = C.blue
            e.currentTarget.style.color = C.blue
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = C.gray300
            e.currentTarget.style.color = C.gray500
          }}
        >
          <span style={{ fontSize: 18 }}>＋</span>
          단계 추가
        </div>
      </div>
    </div>
  )
}

const backBtnStyle = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: 13, color: C.blue, fontWeight: 600,
  padding: 0, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4,
}

const editBtnStyle = {
  padding: '8px 16px', fontSize: 13, fontWeight: 600,
  background: C.bluePale, color: C.blue, border: `1px solid ${C.blueLight}`,
  borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap',
  display: 'flex', alignItems: 'center', gap: 4,
}

const deleteBtnStyle = {
  padding: '8px 16px', fontSize: 13, fontWeight: 600,
  background: C.redLight, color: C.red, border: `1px solid ${C.redBorder}`,
  borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap',
  display: 'flex', alignItems: 'center', gap: 4,
}

const metaTagStyle = {
  display: 'inline-flex', alignItems: 'center',
  background: C.gray100, color: C.gray500,
  border: `1px solid ${C.border}`,
  fontSize: 12, fontWeight: 500,
  padding: '4px 10px', borderRadius: 20,
}
