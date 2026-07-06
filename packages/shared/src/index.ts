export interface CVData {
  rawText: string
  sections: CvSection[]
  name?: string
  email?: string
  phone?: string
}

export interface CvSection {
  heading: string
  content: string[]
}

export interface JobData {
  title: string
  company?: string
  description: string
  requirements: string[]
  source?: string
  url?: string
}

export interface OptimizedCV {
  original: CVData
  optimized: CVData
  changes: ChangeLog[]
  matchScore: number
}

export interface ChangeLog {
  section: string
  before: string
  after: string
  reason: string
}

export interface CoverLetter {
  subject: string
  body: string
  tone: 'professional' | 'enthusiastic' | 'concise'
}

export interface EmailDraft {
  to: string
  subject: string
  body: string
  attachments?: string[]
}

export interface CoachSuggestion {
  category: 'skill' | 'project' | 'format' | 'keyword' | 'certification'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  actionItem?: string
}

export interface AiProvider {
  name: 'gemini' | 'qwen' | 'openai'
  model: string
  apiKey: string
}

export interface OptimizeRequest {
  cvText: string
  jobDescription: string
  jobTitle?: string
  tone?: 'professional' | 'enthusiastic' | 'concise'
}

export interface OptimizeResponse {
  optimizedCv: string
  coverLetter: CoverLetter
  emailDraft: EmailDraft
  changes: ChangeLog[]
  matchScore: number
}
