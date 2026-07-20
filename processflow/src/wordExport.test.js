import { describe, test, expect, vi } from 'vitest'

// file-saver를 목킹 (실제 파일 저장 대신 no-op) → 문서 "생성"까지만 검증
vi.mock('file-saver', () => ({ saveAs: vi.fn(), default: { saveAs: vi.fn() } }))

const { generateGroupWord } = await import('./wordExport.js')

const group = {
  id: 'g1', name: '마감 프로세스',
  processes: [
    { id: 'p1', name: '물류마감 Check 프로세스', dept: 'CO팀', owner: '김재무', module: 'CO', updatedAt: '2026.07', description: '테스트', steps: [
      { id: 's1', title: '물류 미결 현황 조회', screenName: 'MB52', dept: 'CO팀', pt: '30min', logic: '조회 후 확인', warning: '기한 내 미완료 시 escalation', images: [] },
      { id: 's2', title: '미결 항목 통보', screenName: '메일', dept: 'CO팀', pt: '20min', logic: '담당부서 통보', warning: '', images: [] },
    ] },
    { id: 'p2', name: '가공비 마감', dept: 'CO팀', owner: '이원가', module: 'CO', updatedAt: '2026.07', description: '', steps: [
      { id: 's3', title: '가공비 현황 조회', screenName: 'KSB5', dept: 'CO팀', pt: '30min', logic: '', warning: '', images: [] },
    ] },
  ],
}

describe('generateGroupWord', () => {
  // 이 테스트는 Phase 10 회귀(m·BorderStyle 미정의로 표지 조립 시 ReferenceError)를 잡는다
  test('이미지 없는 그룹의 Word 문서를 오류 없이 생성한다', async () => {
    const result = await generateGroupWord(group, 'CO팀')
    expect(result).toBeDefined()
    expect(result.skippedImages).toBe(0)
  })
})
