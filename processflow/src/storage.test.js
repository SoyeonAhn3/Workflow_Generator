import { describe, test, expect, beforeEach } from 'vitest'

// node 환경에는 localStorage가 없으므로 간이 폴리필 (storage.js는 호출 시점에만 참조)
const store = {}
globalThis.localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v) },
  removeItem: (k) => { delete store[k] },
  clear: () => { for (const k of Object.keys(store)) delete store[k] },
}

const { saveToStorage, loadFromStorage } = await import('./storage.js')

describe('storage', () => {
  beforeEach(() => localStorage.clear())

  test('저장한 데이터를 그대로 불러온다', () => {
    const data = [{ id: 'd1', name: 'CO팀', groups: [] }]
    const res = saveToStorage(data)
    expect(res.ok).toBe(true)
    expect(loadFromStorage()).toEqual(data)
  })

  test('저장된 값이 없으면 null을 반환한다', () => {
    expect(loadFromStorage()).toBeNull()
  })

  test('용량(sizeKB)을 숫자로 계산해 반환한다', () => {
    const res = saveToStorage([{ id: 'd1', name: 'x', groups: [] }])
    expect(typeof res.sizeKB).toBe('number')
    expect(res.sizeKB).toBeGreaterThanOrEqual(0)
  })
})
