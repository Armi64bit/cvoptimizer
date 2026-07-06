import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai'
import type { OptimizeRequest, CoachSuggestion, CoverLetter, EmailDraft, ChangeLog } from '@cvoptimizer/shared'
import { z } from 'zod'

const CV_SECTION = z.object({
  heading: z.string(),
  content: z.array(z.string()),
})

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

export function createAiClient(apiKey: string, model = 'gemini-2.0-flash') {
  const genAi = new GoogleGenerativeAI(apiKey)
  const genModel: GenerativeModel = genAi.getGenerativeModel({ model })

  async function optimizeCV(req: OptimizeRequest) {
    const prompt = `You are an expert CV optimizer. Rewrite this CV to match the job. Return ONLY valid JSON.

CV:
${req.cvText}

Job Title: ${req.jobTitle || 'N/A'}
Job Description:
${req.jobDescription}

{ "optimizedCv": "...full rewritten CV...", "changes": [{ "section": "Skills", "before": "...", "after": "...", "reason": "..." }], "matchScore": 85 }`

    const result = await genModel.generateContent(prompt)
    const text = extractJson(result.response.text())
    const parsed = OPTIMIZE_SCHEMA.parse(JSON.parse(text))
    return parsed
  }

  async function generateCoverLetter(req: OptimizeRequest): Promise<CoverLetter> {
    const prompt = `Write a cover letter matching this CV to this job. Return ONLY valid JSON.

CV:
${req.cvText}

Job Title: ${req.jobTitle || 'N/A'}
Job Description:
${req.jobDescription}

{ "subject": "...", "body": "..." }`

    const result = await genModel.generateContent(prompt)
    const text = extractJson(result.response.text())
    const parsed = COVER_LETTER_SCHEMA.parse(JSON.parse(text))
    return { ...parsed, tone: req.tone || 'professional' }
  }

  async function generateEmail(to?: string): Promise<EmailDraft> {
    const prompt = `Write a job application email. Return ONLY valid JSON.

{ "subject": "Application for...", "body": "Dear Hiring Manager...\\n\\nPlease find attached..." }`

    const result = await genModel.generateContent(prompt)
    const text = extractJson(result.response.text())
    const parsed = EMAIL_SCHEMA.parse(JSON.parse(text))
    return { ...parsed, to: to || 'hiring@company.com' }
  }

  async function getCoachSuggestions(cvText: string, jobDescription?: string): Promise<CoachSuggestion[]> {
    const prompt = `Analyze this CV${jobDescription ? ' for this job' : ''} and suggest improvements. Return ONLY valid JSON.

CV:
${cvText}
${jobDescription ? `\nJob:\n${jobDescription}` : ''}

{ "suggestions": [{ "category": "skill", "priority": "high", "title": "...", "description": "...", "actionItem": "..." }] }`

    const result = await genModel.generateContent(prompt)
    const text = extractJson(result.response.text())
    const parsed = COACH_SCHEMA.parse(JSON.parse(text))
    return parsed.suggestions
  }

  return { optimizeCV, generateCoverLetter, generateEmail, getCoachSuggestions }
}
