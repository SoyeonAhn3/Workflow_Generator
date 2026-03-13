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
      height: 52,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px 0 0',
      position: 'fixed',
      top: 0, left: 0, right: 0,
      zIndex: 100,
    }}>
      {/* 왼쪽: 사이드바 토글 + 로고 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        <button
          onClick={onToggleSidebar}
          title={sidebarOpen ? '사이드바 닫기' : '사이드바 열기'}
          style={{
            background: 'none',
            border: 'none',
            color: C.white,
            width: 52,
            height: 52,
            cursor: 'pointer',
            fontSize: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ☰
        </button>
        <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.3px' }}>
          ⚡ ProcessFlow
        </span>
      </div>

      {/* 오른쪽: 저장 상태 뱃지 */}
      <span style={{
        fontSize: 12,
        background: storageOk ? '#16a34a' : C.red,
        color: C.white,
        padding: '3px 10px',
        borderRadius: 12,
        fontWeight: 500,
      }}>
        {storageOk
          ? `💾 저장됨 · ${storageSizeKB}KB`
          : '⚠️ 저장 실패'
        }
      </span>
    </div>
  )
}
