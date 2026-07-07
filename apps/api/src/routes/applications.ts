import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

function s(val: unknown): string {
  return typeof val === 'string' ? val : ''
}

function b(val: unknown): boolean {
  return val === true || val === 'true'
}

router.get('/', async (_req: Request, res: Response) => {
  try {
    const apps = await prisma.application.findMany({ orderBy: { appliedAt: 'desc' } })
    res.json(apps)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch applications', details: (err as Error).message })
  }
})

router.post('/', async (req: Request, res: Response) => {
  try {
    const { company, position } = req.body
    if (!company || !position) return res.status(400).json({ error: 'company and position are required' })
    const app = await prisma.application.create({
      data: {
        company: s(company),
        position: s(position),
        jobUrl: s(req.body.jobUrl),
        source: s(req.body.source),
        cvUsed: s(req.body.cvUsed),
        status: s(req.body.status) || 'applied',
        notes: s(req.body.notes),
      },
    })
    res.status(201).json(app)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create application', details: (err as Error).message })
  }
})

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = s(req.params.id)
    const data: Record<string, unknown> = {}
    if (req.body.company !== undefined) data.company = s(req.body.company)
    if (req.body.position !== undefined) data.position = s(req.body.position)
    if (req.body.jobUrl !== undefined) data.jobUrl = s(req.body.jobUrl)
    if (req.body.source !== undefined) data.source = s(req.body.source)
    if (req.body.cvUsed !== undefined) data.cvUsed = s(req.body.cvUsed)
    if (req.body.status !== undefined) data.status = s(req.body.status)
    if (req.body.notes !== undefined) data.notes = s(req.body.notes)
    if (req.body.replied !== undefined) data.replied = b(req.body.replied)
    if (req.body.repliedAt !== undefined) data.repliedAt = req.body.repliedAt
    const app = await prisma.application.update({ where: { id }, data })
    res.json(app)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update application', details: (err as Error).message })
  }
})

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.application.delete({ where: { id: s(req.params.id) } })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete application', details: (err as Error).message })
  }
})

export default router
