import { Router, Request, Response } from 'express'
import { createAiClient } from '@cvoptimizer/ai'

const router = Router()

router.post('/suggestions', async (req: Request, res: Response) => {
  try {
    const { cvText, jobDescription } = req.body
    if (!cvText) return res.status(400).json({ error: 'cvText is required' })
    const apiKey = req.headers['x-api-key'] as string || process.env.GEMINI_API_KEY || ''
    const ai = createAiClient(apiKey)
    const suggestions = await ai.getCoachSuggestions(cvText, jobDescription)
    res.json({ suggestions })
  } catch (err) {
    res.status(500).json({ error: 'Failed to get suggestions', details: (err as Error).message })
  }
})

export default router
