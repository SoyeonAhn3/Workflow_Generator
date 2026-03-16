// Netlify Function — Claude API 프록시 (Direct fetch, ESM)
// SDK 대신 직접 fetch 호출 — 한글 ByteString 오류 우회

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"
const FALLBACK_MODEL = "claude-sonnet-4-6"
const MAX_RETRIES = 3

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
    }
  }

  let body
  try {
    body = JSON.parse(event.body)
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON body" }) }
  }

  const { userInput, dept } = body
  if (!userInput || !dept) {
    return { statusCode: 400, body: JSON.stringify({ error: "userInput과 dept는 필수입니다" }) }
  }

  const model = process.env.CLAUDE_MODEL || FALLBACK_MODEL

  const basePrompt = `다음 업무 흐름을 분석하여 JSON 배열만 응답하세요.
배열 외 다른 텍스트 없이 JSON만 출력하세요.
설명, 인사말, 마크다운 코드블록 없이 순수 JSON 배열만 반환하세요.

업무흐름: ${userInput}
담당부서: ${dept}

각 항목 형식:
{ "title": "단계명", "screenName": "화면명/T-Code", "dept": "담당부서", "pt": "소요시간", "logic": "상세 설명", "warning": "주의사항 (없으면 빈 문자열)" }`

  let currentPrompt = basePrompt
  let lastResponse = ""

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    // ① 직접 HTTP fetch (헤더는 모두 ASCII — ByteString 오류 없음)
    let apiRes
    try {
      apiRes = await fetch(ANTHROPIC_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: 2048,
          messages: [{ role: "user", content: currentPrompt }],
        }),
      })
    } catch (fetchErr) {
      console.error("[claude] fetch 실패:", fetchErr?.message || fetchErr)
      return {
        statusCode: 500,
        body: JSON.stringify({ error: `API 네트워크 오류: ${fetchErr?.message || String(fetchErr)}` }),
      }
    }

    if (!apiRes.ok) {
      const errText = await apiRes.text()
      console.error(`[claude] API 오류 ${apiRes.status}:`, errText)
      return {
        statusCode: 500,
        body: JSON.stringify({ error: `Claude API 오류 ${apiRes.status}: ${errText}` }),
      }
    }

    const apiData = await apiRes.json()
    lastResponse = apiData.content?.[0]?.text || ""

    // ② JSON 파싱 시도 (실패 시에만 재시도)
    try {
      const jsonStr = lastResponse
        .replace(/^```json\s*\n?/, "")
        .replace(/\n?\s*```$/, "")
        .trim()

      const parsed = JSON.parse(jsonStr)
      const stepsArray = Array.isArray(parsed) ? parsed : parsed.steps || []

      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steps: stepsArray }),
      }
    } catch {
      console.warn(`[claude] JSON 파싱 실패 (attempt ${attempt}), 재시도...`)
      currentPrompt = `이전 응답이 유효한 JSON이 아닙니다. JSON 배열만 다시 반환하세요.
설명 텍스트, 마크다운 없이 순수 JSON 배열만 반환하세요.
잘못된 응답: ${lastResponse}`
    }
  }

  return {
    statusCode: 500,
    body: JSON.stringify({
      error: `${MAX_RETRIES}회 재시도 후에도 유효한 JSON을 받지 못했습니다.`,
    }),
  }
}
