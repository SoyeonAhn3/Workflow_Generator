import { C } from '../../constants'
import { btnSecondaryStyle } from '../../styles/modalStyles'
import ModalBase from './ModalBase'

/**
 * RestoreConfirmModal — 복원(덮어쓰기) 확인 팝업
 *   - 백업 파일 요약을 보여주고, 현재 데이터가 사라짐을 경고한다.
 *
 * @param {{ summary: {depts,groups,procs,steps,images,exportedAt}, onConfirm: () => void, onClose: () => void }} props
 */
export default function RestoreConfirmModal({ summary, onConfirm, onClose }) {
  const exportedText = summary.exportedAt
    ? new Date(summary.exportedAt).toLocaleString('ko-KR')
    : '알 수 없음'

  return (
    <ModalBase width={420} onClose={onClose}>
      {/* 아이콘 */}
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        background: C.warningBg, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: 24, marginBottom: 16,
      }}>
        ⚠️
      </div>

      <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: C.gray700 }}>
        백업 파일에서 복원
      </h3>
      <p style={{ fontSize: 13, color: C.gray500, lineHeight: 1.6, margin: '0 0 14px' }}>
        아래 백업 내용으로 <strong style={{ color: C.gray700 }}>현재 데이터를 완전히 덮어씁니다.</strong>
      </p>

      {/* 백업 요약 */}
      <div style={{
        background: C.gray100, borderRadius: 8,
        padding: '12px 14px', fontSize: 12, color: C.gray500,
        marginBottom: 14, lineHeight: 1.9,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>백업 일시</span><span style={{ fontWeight: 600, color: C.gray700 }}>{exportedText}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>부서 / 그룹 / 프로세스</span>
          <span style={{ fontWeight: 600, color: C.blue }}>{summary.depts} / {summary.groups} / {summary.procs}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>단계 / 이미지</span>
          <span style={{ fontWeight: 600, color: C.blue }}>{summary.steps} / {summary.images}</span>
        </div>
      </div>

      <div style={{
        background: C.warningBg, border: `1px solid ${C.warningBorder}`,
        borderRadius: 8, padding: '10px 14px', fontSize: 12,
        color: C.warning, marginBottom: 20, lineHeight: 1.6,
      }}>
        현재 작업 중인 데이터는 사라집니다. 이 작업은 되돌릴 수 없습니다.
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button onClick={onClose} style={btnSecondaryStyle}>취소</button>
        <button
          onClick={onConfirm}
          style={{
            padding: '8px 20px', fontSize: 13, fontWeight: 600,
            background: C.blue, color: C.white, border: 'none',
            borderRadius: 8, cursor: 'pointer',
          }}
        >
          복원하기
        </button>
      </div>
    </ModalBase>
  )
}
