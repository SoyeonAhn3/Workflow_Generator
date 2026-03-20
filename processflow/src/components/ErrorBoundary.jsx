import { Component } from 'react'
import { C } from '../constants'

/**
 * ErrorBoundary — 하위 컴포넌트 에러 시 전체 앱 크래시 방지
 * 에러 발생 영역만 안내 메시지로 대체
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          height: '60vh', gap: 16, padding: 40,
        }}>
          <div style={{ fontSize: 40 }}>⚠️</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.gray700 }}>
            문제가 발생했습니다
          </div>
          <div style={{ fontSize: 13, color: C.gray500, textAlign: 'center', lineHeight: 1.6 }}>
            화면을 표시하는 중 오류가 발생했습니다.<br />
            아래 버튼을 눌러 새로고침해 주세요. 데이터는 유지됩니다.
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 24px', fontSize: 14, fontWeight: 600,
              background: C.blue, color: C.white, border: 'none',
              borderRadius: 8, cursor: 'pointer', marginTop: 8,
            }}
          >
            새로고침
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
