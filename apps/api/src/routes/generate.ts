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
    res.status(500).json({ error: 'Cover letter generation failed', details: (err as Error).message })
  }
})

router.post('/email', async (req: Request, res: Response) => {
  try {
    const ai = getAiClient(req)
    const email = await ai.generateEmail()
    res.json(email)
  } catch (err) {
    res.status(500).json({ error: 'Email generation failed', details: (err as Error).message })
  }
})

export default router
