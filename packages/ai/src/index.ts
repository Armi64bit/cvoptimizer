import OpenAI from 'openai'
import type { OptimizeRequest, CoachSuggestion, CoverLetter, EmailDraft } from '@cvoptimizer/shared'
import { z } from 'zod'

const OPTIMIZE_SCHEMA = z.object({
  optimizedCv: z.string(),
  changes: z.array(z.object({
    section: z.string(),
    before: z.string(),
    after: z.string(),
    reason: z.string(),
  })),
  matchScore: z.number().min(0).max(100),
  atsScore: z.number().min(0).max(100),
  sections: z.array(z.object({
    heading: z.string(),
    content: z.array(z.string()),
  })),
})

const COVER_LETTER_SCHEMA = z.object({
  subject: z.string(),
  body: z.string(),
})

const EMAIL_SCHEMA = z.object({
  subject: z.string(),
  body: z.string(),
})

const COACH_SCHEMA = z.object({
  suggestions: z.array(z.object({
    category: z.enum(['skill', 'project', 'format', 'keyword', 'certification']),
    priority: z.enum(['high', 'medium', 'low']),
    title: z.string(),
    description: z.string(),
    actionItem: z.string().optional(),
  })),
})

function extractJson(text: string): string {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  return match ? match[1].trim() : text.trim()
}

const MODELS = [
  process.env.AI_MODEL,
  'meta-llama/llama-3.3-70b-instruct',
  'qwen/qwen-2.5-72b-instruct',
  'google/gemini-2.0-flash-001',
].filter(Boolean) as string[]

async function jsonFromModel(client: OpenAI, system: string, user: string, schema: z.ZodTypeAny) {
  let lastErr: unknown
  for (const model of MODELS) {
    try {
      const res = await client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: `${system}\n\nYou MUST respond with valid JSON only. No markdown, no code fences.` },
          { role: 'user', content: user },
        ],
        temperature: 0.2,
      })
      const choice = res.choices?.[0]
      if (!choice?.message?.content) continue
      const text = extractJson(choice.message.content)
      return schema.parse(JSON.parse(text))
    } catch (e) {
      lastErr = e
    }
  }
  throw new Error(`All AI models failed. Last error: ${(lastErr as Error)?.message || lastErr}`)
}

export function createAiClient(apiKey: string) {
  const client = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey,
    defaultHeaders: { 'HTTP-Referer': 'https://cvoptimizer.app', 'X-Title': 'CV Optimizer' },
  })

  async function optimizeCV(req: OptimizeRequest) {
    return jsonFromModel(client,
      'You are an expert CV optimizer. Rewrite the CV to better match the job description while PRESERVING ALL original details — dates, company names, job titles, bullet points, metrics, technologies, and projects. Do NOT remove or condense any experience or project entries. Only rephrase bullets to emphasize relevant keywords and skills from the job description. Keep the same number of bullets per entry. Add relevant missing keywords where natural, but never delete existing content. Respond with JSON.',
      `CV:\n${req.cvText}\n\nJob: ${req.jobTitle || 'N/A'}\n${req.jobDescription}\n\nReturn JSON: { "optimizedCv": "...full rewritten CV text...", "sections": [{ "heading": "Experience", "content": ["bullet 1", "bullet 2"] }], "changes": [{ "section": "Skills", "before": "...", "after": "...", "reason": "..." }], "matchScore": 0-100, "atsScore": 0-100 }`,
      OPTIMIZE_SCHEMA,
    )
  }

  async function generateCoverLetter(req: OptimizeRequest): Promise<CoverLetter> {
    return jsonFromModel(client,
      'You write professional cover letters. Respond with JSON.',
      `CV:\n${req.cvText}\n\nJob: ${req.jobTitle || 'N/A'}\n${req.jobDescription}\n\nReturn: { "subject": "...", "body": "..." }`,
      COVER_LETTER_SCHEMA,
    )
  }

  async function generateEmail(to?: string): Promise<EmailDraft> {
    const result = await jsonFromModel(client,
      'You write professional job application emails. Respond with JSON.',
      'Return: { "subject": "...", "body": "..." }',
      EMAIL_SCHEMA,
    )
    return { ...result, to: to || 'hiring@company.com' }
  }

  async function getCoachSuggestions(cvText: string, jobDescription?: string): Promise<CoachSuggestion[]> {
    const result = await jsonFromModel(client,
      'You are an expert career coach. Analyze CVs and suggest improvements. Respond with JSON.',
      `CV:\n${cvText}${jobDescription ? `\n\nTarget Job:\n${jobDescription}` : ''}\n\nReturn: { "suggestions": [{ "category": "skill|project|format|keyword|certification", "priority": "high|medium|low", "title": "...", "description": "...", "actionItem": "..." }] }`,
      COACH_SCHEMA,
    )
    return result.suggestions
  }

  return { optimizeCV, generateCoverLetter, generateEmail, getCoachSuggestions }
}
