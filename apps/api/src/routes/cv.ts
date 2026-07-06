import { Router, Request, Response } from 'express'
import { parseCvText, parsePdf, parseDocx } from '../services/parser.js'
import multer from 'multer'

const router = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })

router.post('/parse', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
    const ext = req.file.originalname.split('.').pop()?.toLowerCase()
    let text: string

    if (ext === 'pdf') {
      text = await parsePdf(req.file.buffer)
    } else if (ext === 'docx' || ext === 'doc') {
      text = await parseDocx(req.file.buffer)
    } else {
      text = req.file.buffer.toString('utf-8')
    }

    const cv = parseCvText(text)
    res.json(cv)
  } catch (err) {
    res.status(500).json({ error: 'Failed to parse CV', details: (err as Error).message })
  }
})

export default router
