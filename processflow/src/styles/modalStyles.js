import { C } from '../constants'

/** 모달 공통 스타일 — 모든 모달이 이 파일에서 import */

export const overlayStyle = {
  position: 'fixed', inset: 0,
  background: 'rgba(0,0,0,0.4)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 200,
}

export const modalStyle = (width = 440) => ({
  background: C.white,
  borderRadius: 12,
  padding: '28px 32px',
  width,
  maxHeight: '85vh',
  overflowY: 'auto',
  boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
})

export const labelStyle = {
  display: 'block', fontSize: 12, fontWeight: 600,
  color: C.gray700, marginBottom: 6,
}

export const inputStyle = {
  width: '100%', padding: '8px 12px', fontSize: 13,
  border: `1px solid ${C.border}`, borderRadius: 8,
  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
}

export const btnPrimaryStyle = {
  padding: '8px 20px', fontSize: 13, fontWeight: 600,
  background: C.blue, color: C.white, border: 'none',
  borderRadius: 8, cursor: 'pointer',
}

export const btnSecondaryStyle = {
  padding: '8px 20px', fontSize: 13, fontWeight: 600,
  background: C.gray100, color: C.gray500, border: 'none',
  borderRadius: 8, cursor: 'pointer',
}

export const btnDangerStyle = {
  padding: '8px 20px', fontSize: 13, fontWeight: 600,
  background: C.red, color: C.white, border: 'none',
  borderRadius: 8, cursor: 'pointer',
}
