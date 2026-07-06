import type { OptimizeResponse, CVData, JobData, CoachSuggestion } from '@cvoptimizer/shared'

const API = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || err.details || 'Request failed')
  }
  return res.json()
}

export async function parseCv(file: File): Promise<CVData> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${API}/api/cv/parse`, { method: 'POST', body: form })
  if (!res.ok) throw new Error('Failed to parse CV')
  return res.json()
}

export async function scrapeJob(url: string): Promise<JobData> {
  return request('/jobs/scrape', { method: 'POST', body: JSON.stringify({ url }) })
}

export async function optimizeStream(
  data: { cvText: string; jobDescription: string; jobTitle?: string },
  onProgress: (progress: number, message: string) => void,
): Promise<OptimizeResponse> {
  const res = await fetch(`${API}/api/generate/optimize-stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || err.details || 'Request failed')
  }
  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  return new Promise((resolve, reject) => {
    function read() {
      reader.read().then(({ done, value }) => {
        if (done) return
        buffer += decoder.decode(value, { stream: true })
        for (const line of buffer.split('\n')) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.slice(6))
              if (event.type === 'progress') onProgress(event.progress, event.message)
              else if (event.type === 'result') resolve(event.data)
              else if (event.type === 'error') reject(new Error(event.message))
            } catch {}
          }
        }
        buffer = ''
        read()
      }).catch(reject)
    }
    read()
  })
}

export async function optimize(data: { cvText: string; jobDescription: string; jobTitle?: string }): Promise<OptimizeResponse> {
  return request('/generate/optimize', { method: 'POST', body: JSON.stringify(data) })
}

export async function getCoachSuggestions(data: { cvText: string; jobDescription?: string }): Promise<{ suggestions: CoachSuggestion[] }> {
  return request('/coach/suggestions', { method: 'POST', body: JSON.stringify(data) })
}
