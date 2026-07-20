import { defineConfig } from 'vitest/config'

// 스모크 테스트 설정 — node 환경 (localStorage는 storage.test.js에서 간이 폴리필)
export default defineConfig({
  test: {
    environment: 'node',
  },
})
