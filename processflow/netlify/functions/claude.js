// Netlify Function — Claude API 프록시
// API 키는 Netlify 환경변수 ANTHROPIC_API_KEY에만 보관 (클라이언트 노출 금지)

const Anthropic = require("@anthropic-ai/sdk")

const FALLBACK_MODEL = "claude-sonnet-4-20250514"

exports.handler = async (event) => {
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

  const { prompt, system } = body
  if (!prompt) {
    return { statusCode: 400, body: JSON.stringify({ error: "prompt is required" }) }
  }

  const client = new Anthropic({ apiKey })
  const model = process.env.CLAUDE_MODEL || FALLBACK_MODEL

  const message = await client.messages.create({
    model,
    max_tokens: 4096,
    ...(system ? { system } : {}),
    messages: [{ role: "user", content: prompt }],
  })

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: message.content[0].text }),
  }
}
