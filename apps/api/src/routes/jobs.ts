import { Router, Request, Response } from 'express'
import { scrapeJobDescription } from '../services/scraper.js'

const router = Router()

router.post('/scrape', async (req: Request, res: Response) => {
  try {
    const { url } = req.body
    if (!url) return res.status(400).json({ error: 'URL is required' })
    const job = await scrapeJobDescription(url)
    res.json(job)
  } catch (err) {
    res.status(500).json({ error: 'Failed to scrape job', details: (err as Error).message })
  }
})

export default router
