import { C } from '../../constants'

/**
 * LV3View — 프로세스 상세 (단계 목록)
 * @param {{ dept: object|null, group: object|null, proc: object|null }} props
 */
export default function LV3View({ dept, group, proc }) {
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
      {/* Breadcrumb */}
      <div style={{ fontSize: 12, color: C.gray500, marginBottom: 8 }}>
        {dept?.name} › {group?.name}
      </div>

      {/* 프로세스 헤더 */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: C.gray700, margin: 0 }}>
          {proc.name}
        </h2>
        <div style={{ display: 'flex', gap: 20, marginTop: 8, fontSize: 13, color: C.gray500 }}>
          <span>담당자: {proc.owner || '—'}</span>
          <span>모듈: {proc.module || '—'}</span>
          <span>업데이트: {proc.updatedAt || '—'}</span>
        </div>
        {proc.description && (
          <p style={{ marginTop: 10, fontSize: 13, color: C.gray500, lineHeight: 1.6 }}>
            {proc.description}
          </p>
        )}
      </div>

      {/* 단계 목록 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {(proc.steps ?? []).map((step, idx) => (
          <div
            key={step.id}
            style={{
              background: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: '16px 20px',
              display: 'flex',
              gap: 16,
            }}
          >
            {/* 단계 번호 */}
            <div style={{
              width: 28,
              height: 28,
              minWidth: 28,
              borderRadius: '50%',
              background: C.blue,
              color: C.white,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 700,
              marginTop: 2,
            }}>
              {idx + 1}
            </div>

            {/* 단계 내용 */}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: C.gray700, marginBottom: 8 }}>
                {step.title}
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: C.gray500, marginBottom: 8 }}>
                <span>화면명 (T-Code/프로그램): {step.screenName || '—'}</span>
                <span>PT: {step.pt || '—'}</span>
                <span>담당: {step.dept || '—'}</span>
              </div>
              {step.logic && (
                <div style={{
                  fontSize: 12,
                  color: C.gray500,
                  background: C.gray100,
                  borderRadius: 6,
                  padding: '8px 12px',
                  whiteSpace: 'pre-line',
                  lineHeight: 1.6,
                }}>
                  {step.logic}
                </div>
              )}
              {step.warning && (
                <div style={{
                  marginTop: 8,
                  fontSize: 12,
                  color: '#b45309',
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: 6,
                  padding: '6px 10px',
                }}>
                  ⚠️ {step.warning}
                </div>
              )}
            </div>
          </div>
        ))}

        {proc.steps?.length === 0 && (
          <div style={{ textAlign: 'center', color: C.gray300, fontSize: 14, padding: '40px 0' }}>
            아직 단계가 없습니다
          </div>
        )}
      </div>
    </div>
  )
}
