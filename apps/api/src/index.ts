import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { execSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
import cvRoutes from './routes/cv.js'
import jobRoutes from './routes/jobs.js'
import generateRoutes from './routes/generate.js'
import coachRoutes from './routes/coach.js'
import applicationRoutes from './routes/applications.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
try {
  execSync('npx prisma db push --skip-generate', {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'pipe',
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db' },
  })
} catch {
  console.log('Database already initialized or push skipped')
}

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(helmet())
app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

app.use('/api/cv', cvRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/generate', generateRoutes)
app.use('/api/coach', coachRoutes)
app.use('/api/applications', applicationRoutes)

app.use((_req, res) => res.status(404).json({ error: 'Not found' }))

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`)
})

export default app
