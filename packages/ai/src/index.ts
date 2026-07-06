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

async function jsonFromModel(client: OpenAI, system: string, user: string, schema: z.ZodTypeAny) {
  const res = await client.chat.completions.create({
    model: process.env.AI_MODEL || 'qwen/qwen-2.5-72b-instruct',
    messages: [
      { role: 'system', content: `${system}\n\nYou MUST respond with valid JSON only. No markdown, no code fences.` },
      { role: 'user', content: user },
    ],
    temperature: 0.2,
  })
  const choice = res.choices?.[0]
  if (!choice?.message?.content) {
    throw new Error(`AI returned empty response: ${JSON.stringify(res)}`)
  }
  const text = extractJson(choice.message.content)
  return schema.parse(JSON.parse(text))
}

export function createAiClient(apiKey: string) {
  const client = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey,
    defaultHeaders: { 'HTTP-Referer': 'https://cvoptimizer.app', 'X-Title': 'CV Optimizer' },
  })

  async function optimizeCV(req: OptimizeRequest) {
    return jsonFromModel(client,
      'You are an expert CV optimizer. Rewrite CVs to match job descriptions. Keep all facts truthful. Respond with JSON.',
      `CV:\n${req.cvText}\n\nJob: ${req.jobTitle || 'N/A'}\n${req.jobDescription}\n\nReturn: { "optimizedCv": "...", "changes": [{ "section": "...", "before": "...", "after": "...", "reason": "..." }], "matchScore": 0-100 }`,
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
