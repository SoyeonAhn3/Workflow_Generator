import { C } from '../../constants'

/**
 * TopNav
 * @param {{ storageSizeKB: number, storageOk: boolean, sidebarOpen: boolean, onToggleSidebar: () => void }} props
 */
export default function TopNav({ storageSizeKB, storageOk, sidebarOpen, onToggleSidebar }) {
  return (
    <div style={{
      background: C.navy,
      color: C.white,
      height: 48,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px 0 0',
      position: 'fixed',
      top: 0, left: 0, right: 0,
      zIndex: 100,
    }}>
      {/* 왼쪽: 로고 + 부제 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        <button
          onClick={onToggleSidebar}
          title={sidebarOpen ? '사이드바 닫기' : '사이드바 열기'}
          style={{
            background: 'none',
            border: 'none',
            color: C.white,
            width: 48,
            height: 48,
            cursor: 'pointer',
            fontSize: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.85,
          }}
        >
          ☰
        </button>
        <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.3px' }}>
          ProcessFlow
        </span>
        <span style={{ fontSize: 12, opacity: 0.7, marginLeft: 10, fontWeight: 400 }}>
          업무 프로세스 관리 플랫폼
        </span>
      </div>

      {/* 오른쪽: 저장 상태 뱃지 */}
      <span style={{
        fontSize: 11,
        background: storageOk ? 'rgba(255,255,255,0.15)' : 'rgba(239,68,68,0.8)',
        color: C.white,
        padding: '4px 12px',
        borderRadius: 14,
        fontWeight: 500,
        border: '1px solid rgba(255,255,255,0.2)',
      }}>
        {storageOk
          ? `저장됨 · ${storageSizeKB}KB`
          : '저장 실패'
        }
      </span>
    </div>
  )
}
