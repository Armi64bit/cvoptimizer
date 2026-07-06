import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Copy, Check, Mail, FileText } from 'lucide-react'
import type { CoverLetter, EmailDraft } from '@cvoptimizer/shared'
import { optimize } from '@/lib/api'

export function CoverLetterTab() {
  const [cvText, setCvText] = useState('')
  const [jobDesc, setJobDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [coverLetter, setCoverLetter] = useState<CoverLetter | null>(null)
  const [email, setEmail] = useState<EmailDraft | null>(null)
  const [copied, setCopied] = useState<'letter' | 'email' | null>(null)

  const handleGenerate = async () => {
    if (!cvText || !jobDesc) return
    setLoading(true)
    try {
      const res = await optimize({ cvText, jobDescription: jobDesc })
      setCoverLetter(res.coverLetter)
      setEmail(res.emailDraft)
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const copyText = (text: string, type: 'letter' | 'email') => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Generate Cover Letter & Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste your CV text..."
            value={cvText}
            onChange={(e) => setCvText(e.target.value)}
            className="min-h-[120px]"
          />
          <Textarea
            placeholder="Paste job description..."
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
            className="min-h-[120px]"
          />
          <Button className="w-full" onClick={handleGenerate} disabled={loading || !cvText || !jobDesc}>
            <Mail className="mr-2 h-4 w-4" />
            {loading ? 'Generating...' : 'Generate Cover Letter & Email'}
          </Button>
        </CardContent>
      </Card>

      {coverLetter && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <CardTitle className="text-lg">Cover Letter</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={() => copyText(coverLetter.body, 'letter')}>
              {copied === 'letter' ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}
              {copied === 'letter' ? 'Copied' : 'Copy'}
            </Button>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-sm font-medium">Subject: {coverLetter.subject}</p>
            <pre className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm">{coverLetter.body}</pre>
          </CardContent>
        </Card>
      )}

      {email && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <CardTitle className="text-lg">Email Draft</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={() => copyText(email.body, 'email')}>
              {copied === 'email' ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}
              {copied === 'email' ? 'Copied' : 'Copy'}
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            <Input value={email.subject} readOnly className="text-sm" />
            <pre className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm">{email.body}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
