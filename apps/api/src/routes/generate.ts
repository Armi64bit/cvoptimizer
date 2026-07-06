import { Router, Request, Response } from 'express'
import type { OptimizeRequest } from '@cvoptimizer/shared'
import { createAiClient } from '@cvoptimizer/ai'

const router = Router()

function getAiClient(req: Request) {
  const apiKey = req.headers['x-api-key'] as string || process.env.OPENROUTER_API_KEY || ''
  return createAiClient(apiKey)
}

router.post('/optimize', async (req: Request, res: Response) => {
  try {
    const body = req.body as OptimizeRequest
    if (!body.cvText || !body.jobDescription) {
      return res.status(400).json({ error: 'cvText and jobDescription are required' })
    }
    const ai = getAiClient(req)
    const optimized = await ai.optimizeCV(body)
    const coverLetter = await ai.generateCoverLetter(body)
    const email = await ai.generateEmail()
    res.json({ ...optimized, coverLetter, emailDraft: email })
  } catch (err) {
    const msg = (err as Error).message
    console.error('Optimize error:', msg)
    if (msg.includes('429') || msg.includes('quota') || msg.includes('insufficient_quota')) {
      return res.status(429).json({ error: 'Rate limit hit. Wait a moment and try again, or check your OpenRouter credits at https://openrouter.ai' })
    }
    res.status(500).json({ error: 'Optimization failed', details: msg })
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

router.post('/optimize-stream', async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')

  const send = (data: object) => res.write(`data: ${JSON.stringify(data)}\n\n`)

  try {
    const body = req.body as OptimizeRequest
    if (!body.cvText || !body.jobDescription) {
      send({ type: 'error', message: 'cvText and jobDescription are required' })
      return res.end()
    }
    const ai = getAiClient(req)

    send({ type: 'progress', progress: 5, message: 'Starting optimization...' })
    const optimized = await ai.optimizeCV(body)
    send({ type: 'progress', progress: 45, message: 'CV optimized! Writing cover letter...' })

    const coverLetter = await ai.generateCoverLetter(body)
    send({ type: 'progress', progress: 75, message: 'Cover letter done! Generating email...' })

    const email = await ai.generateEmail()
    send({ type: 'progress', progress: 100, message: 'Complete!' })

    send({ type: 'result', data: { ...optimized, coverLetter, emailDraft: email } })
  } catch (err) {
    const msg = (err as Error).message
    console.error('Stream optimize error:', msg)
    send({ type: 'error', message: msg.includes('429') || msg.includes('quota') ? 'Rate limit hit. Wait a moment.' : msg })
  } finally {
    res.end()
  }
})

router.post('/test-ai', async (req: Request, res: Response) => {
  try {
    const apiKey = req.headers['x-api-key'] as string || process.env.OPENROUTER_API_KEY || ''
    if (!apiKey) return res.status(400).json({ error: 'No API key found' })
    const { default: OpenAI } = await import('openai')
    const client = new OpenAI({ baseURL: 'https://openrouter.ai/api/v1', apiKey })
    const result = await client.chat.completions.create({
      model: 'qwen/qwen-2.5-72b-instruct',
      messages: [{ role: 'user', content: 'Say hello in one word' }],
    })
    res.json({ success: true, response: result.choices[0]?.message?.content })
  } catch (err) {
    console.error('AI test error:', err)
    res.status(500).json({ error: (err as Error).message })
  }
})

export default router
