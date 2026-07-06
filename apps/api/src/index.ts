import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cvRoutes from './routes/cv.js'
import jobRoutes from './routes/jobs.js'
import generateRoutes from './routes/generate.js'
import coachRoutes from './routes/coach.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(helmet())
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }))
app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

app.use('/api/cv', cvRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/generate', generateRoutes)
app.use('/api/coach', coachRoutes)

app.use((_req, res) => res.status(404).json({ error: 'Not found' }))

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`)
})

export default app
