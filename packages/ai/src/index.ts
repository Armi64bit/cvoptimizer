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

export function createAiClient(apiKey: string, model = 'gemini-2.0-flash') {
  const genAi = new GoogleGenerativeAI(apiKey)
  const genModel: GenerativeModel = genAi.getGenerativeModel({ model })

  async function optimizeCV(req: OptimizeRequest) {
    const prompt = `You are an expert CV optimizer and career coach. Given the following CV text and job description, rewrite the CV to best match the job requirements while keeping all facts truthful.

CV:
${req.cvText}

Job Title: ${req.jobTitle || 'N/A'}
Job Description:
${req.jobDescription}

Return a JSON object with:
- optimizedCv: the full rewritten CV text
- changes: array of { section, before, after, reason } for each change made
- matchScore: a number 0-100 estimating how well the optimized CV matches the job`

    const result = await genModel.generateContent(prompt)
    const text = result.response.text()
    const parsed = OPTIMIZE_SCHEMA.parse(JSON.parse(text))
    return parsed
  }

  async function generateCoverLetter(req: OptimizeRequest): Promise<CoverLetter> {
    const prompt = `Write a professional cover letter for the following job application. Be specific, reference skills from the CV that match the job.

CV:
${req.cvText}

Job Title: ${req.jobTitle || 'N/A'}
Job Description:
${req.jobDescription}

Return JSON: { subject: string, body: string }`

    const result = await genModel.generateContent(prompt)
    const text = result.response.text()
    const parsed = COVER_LETTER_SCHEMA.parse(JSON.parse(text))
    return { ...parsed, tone: req.tone || 'professional' }
  }

  async function generateEmail(to?: string): Promise<EmailDraft> {
    const prompt = `Write a professional email to send with a job application. Include a clear subject line, polite greeting, brief introduction, mention of the attached CV and cover letter, and a call to action.

Return JSON: { subject: string, body: string }`

    const result = await genModel.generateContent(prompt)
    const text = result.response.text()
    const parsed = EMAIL_SCHEMA.parse(JSON.parse(text))
    return { ...parsed, to: to || 'hiring@company.com' }
  }

  async function getCoachSuggestions(cvText: string, jobDescription?: string): Promise<CoachSuggestion[]> {
    const prompt = `You are an expert career coach. Analyze this CV${jobDescription ? ' and the target job description' : ''} and suggest improvements.

CV:
${cvText}
${jobDescription ? `\nJob Description:\n${jobDescription}` : ''}

Return JSON: { suggestions: [{ category: "skill"|"project"|"format"|"keyword"|"certification", priority: "high"|"medium"|"low", title: string, description: string, actionItem?: string }] }`

    const result = await genModel.generateContent(prompt)
    const text = result.response.text()
    const parsed = COACH_SCHEMA.parse(JSON.parse(text))
    return parsed.suggestions
  }

  return { optimizeCV, generateCoverLetter, generateEmail, getCoachSuggestions }
}
