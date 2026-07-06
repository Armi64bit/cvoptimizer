import type { OptimizeResponse, CVData, JobData, CoachSuggestion } from '@cvoptimizer/shared'

const BASE = import.meta.env.VITE_API_URL || '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
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
  const res = await fetch(`${BASE}/cv/parse`, { method: 'POST', body: form })
  if (!res.ok) throw new Error('Failed to parse CV')
  return res.json()
}

export async function scrapeJob(url: string): Promise<JobData> {
  return request('/jobs/scrape', { method: 'POST', body: JSON.stringify({ url }) })
}

export async function optimize(data: { cvText: string; jobDescription: string; jobTitle?: string }): Promise<OptimizeResponse> {
  return request('/generate/optimize', { method: 'POST', body: JSON.stringify(data) })
}

export async function getCoachSuggestions(data: { cvText: string; jobDescription?: string }): Promise<{ suggestions: CoachSuggestion[] }> {
  return request('/coach/suggestions', { method: 'POST', body: JSON.stringify(data) })
}
