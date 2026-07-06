import { Router, Request, Response } from 'express'
import type { OptimizeRequest } from '@cvoptimizer/shared'
import { createAiClient } from '@cvoptimizer/ai'

const router = Router()

function getAiClient(req: Request) {
  const apiKey = req.headers['x-api-key'] as string || process.env.GEMINI_API_KEY || ''
  return createAiClient(apiKey)
}

router.post('/optimize', async (req: Request, res: Response) => {
  try {
    const body = req.body as OptimizeRequest
    if (!body.cvText || !body.jobDescription) {
      return res.status(400).json({ error: 'cvText and jobDescription are required' })
    }
    const ai = getAiClient(req)
    const [optimized, coverLetter, email] = await Promise.all([
      ai.optimizeCV(body),
      ai.generateCoverLetter(body),
      ai.generateEmail(),
    ])
    res.json({ ...optimized, coverLetter, emailDraft: email })
  } catch (err) {
    console.error('Optimize error:', (err as Error).message, (err as Error).stack)
    res.status(500).json({ error: 'Optimization failed', details: (err as Error).message })
  }
})

router.post('/cover-letter', async (req: Request, res: Response) => {
  try {
    const body = req.body as OptimizeRequest
    if (!body.cvText || !body.jobDescription) {
      return res.status(400).json({ error: 'cvText and jobDescription are required' })
    }
    const ai = getAiClient(req)
    const coverLetter = await ai.generateCoverLetter(body)
    res.json(coverLetter)
  } catch (err) {
    console.error('Cover letter error:', (err as Error).message)
    res.status(500).json({ error: 'Cover letter generation failed', details: (err as Error).message })
  }
})

router.post('/email', async (req: Request, res: Response) => {
  try {
    const ai = getAiClient(req)
    const email = await ai.generateEmail()
    res.json(email)
  } catch (err) {
    console.error('Email error:', (err as Error).message)
    res.status(500).json({ error: 'Email generation failed', details: (err as Error).message })
  }
})

router.post('/test-ai', async (req: Request, res: Response) => {
  try {
    const apiKey = req.headers['x-api-key'] as string || process.env.GEMINI_API_KEY || ''
    if (!apiKey) return res.status(400).json({ error: 'No API key found', env: !!process.env.GEMINI_API_KEY })
    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAi = new GoogleGenerativeAI(apiKey)
    const model = genAi.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const result = await model.generateContent('Say hello in one word')
    res.json({ success: true, response: result.response.text() })
  } catch (err) {
    console.error('AI test error:', err)
    res.status(500).json({ error: (err as Error).message, stack: (err as Error).stack })
  }
})

export default router
