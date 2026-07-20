import { describe, test, expect } from 'vitest'
import { summarizeBackup, parseBackup } from './backup.js'

const sampleData = [
  { id: 'd1', name: 'CO팀', groups: [
    { id: 'g1', name: '마감', processes: [
      { id: 'p1', name: '물류마감', steps: [
        { id: 's1', title: '조회', images: [{ id: 'img_1', name: 'a.png' }] },
        { id: 's2', title: '통보', images: [] },
      ] },
    ] },
  ] },
]

describe('summarizeBackup', () => {
  test('부서/그룹/프로세스/단계/이미지 개수를 센다', () => {
    const s = summarizeBackup({ data: sampleData, images: [{ id: 'img_1' }] })
    expect(s.depts).toBe(1)
    expect(s.groups).toBe(1)
    expect(s.procs).toBe(1)
    expect(s.steps).toBe(2)
    expect(s.images).toBe(1)
  })

  test('빈 백업도 0으로 안전 처리한다', () => {
    const s = summarizeBackup({})
    expect(s).toMatchObject({ depts: 0, groups: 0, procs: 0, steps: 0, images: 0 })
  })
})

describe('parseBackup', () => {
  test('올바른 백업 파일을 파싱한다', async () => {
    const backup = { version: 2, exportedAt: '2026-07-20', data: sampleData, images: [] }
    const file = new Blob([JSON.stringify(backup)], { type: 'application/json' })
    const parsed = await parseBackup(file)
    expect(parsed.data).toHaveLength(1)
    expect(parsed.version).toBe(2)
  })

  test('JSON이 깨지면 오류를 던진다', async () => {
    const file = new Blob(['{not json'], { type: 'application/json' })
    await expect(parseBackup(file)).rejects.toThrow()
  })

  test('data 배열이 없으면 오류를 던진다', async () => {
    const file = new Blob([JSON.stringify({ foo: 1 })], { type: 'application/json' })
    await expect(parseBackup(file)).rejects.toThrow()
  })
})
