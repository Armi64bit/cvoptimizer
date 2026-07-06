import { useState, useEffect, useRef } from 'react'
import { CVUploader } from '@/components/CVUploader'
import { JobInput } from '@/components/JobInput'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { parseCv, optimize } from '@/lib/api'
import { Sparkles, Copy, Check } from 'lucide-react'
import type { OptimizeResponse } from '@cvoptimizer/shared'

export function OptimizerTab() {
  const [cvText, setCvText] = useState('')
  const [jobDesc, setJobDesc] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [result, setResult] = useState<OptimizeResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressMsg, setProgressMsg] = useState('')
  const [copied, setCopied] = useState(false)
  const progressRef = useRef(0)
  const msgRef = useRef('')

  useEffect(() => {
    if (!loading) { setProgress(0); return }
    const steps = [
      { at: 15, msg: 'Analyzing your CV against the job...' },
      { at: 40, msg: 'Rewriting experience section...' },
      { at: 60, msg: 'Optimizing skills & keywords...' },
      { at: 80, msg: 'Generating cover letter...' },
      { at: 92, msg: 'Finalizing...' },
    ]
    let stepIdx = 0
    const interval = setInterval(() => {
      progressRef.current = Math.min(progressRef.current + 1, 95)
      if (stepIdx < steps.length && progressRef.current >= steps[stepIdx].at) {
        msgRef.current = steps[stepIdx].msg
        setProgressMsg(msgRef.current)
        stepIdx++
      }
      setProgress(progressRef.current)
    }, 200)
    return () => clearInterval(interval)
  }, [loading])

  const handleFileSelect = async (file: File) => {
    try {
      const cv = await parseCv(file)
      setCvText(cv.rawText)
    } catch {
      setCvText('Failed to parse file. Paste manually.')
    }
  }

  const handleOptimize = async () => {
    if (!cvText || !jobDesc) return
    setLoading(true)
    setResult(null)
    progressRef.current = 0
    msgRef.current = 'Analyzing your CV against the job...'
    setProgress(0)
    setProgressMsg(msgRef.current)
    try {
      const res = await optimize({ cvText, jobDescription: jobDesc, jobTitle: jobTitle || undefined })
      progressRef.current = 100
      setProgress(100)
      setProgressMsg('Complete!')
      setTimeout(() => setResult(res), 500)
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const copyResult = () => {
    if (!result) return
    navigator.clipboard.writeText(result.optimizedCv)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your CV</CardTitle>
          </CardHeader>
          <CardContent>
            <CVUploader
              onFileSelect={handleFileSelect}
              onTextPaste={setCvText}
              value={cvText}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Job Description</CardTitle>
          </CardHeader>
          <CardContent>
            <JobInput
              jobDescription={jobDesc}
              onJobDescriptionChange={setJobDesc}
              onJobTitleChange={setJobTitle}
            />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        <Button
          className="w-full"
          size="lg"
          onClick={handleOptimize}
          disabled={loading || !cvText || !jobDesc}
        >
          <Sparkles className="mr-2 h-5 w-5" />
          {loading ? progressMsg || 'Optimizing...' : 'Optimize My CV'}
        </Button>
        {loading && (
          <div className="space-y-1">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-center text-xs text-muted-foreground">{progress}%</p>
          </div>
        )}
      </div>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Optimized CV</CardTitle>
              <Button variant="outline" size="sm" onClick={copyResult}>
                {copied ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm">{result.optimizedCv}</pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Match Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="h-3 flex-1 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${result.matchScore}%` }}
                  />
                </div>
                <span className="text-sm font-bold">{result.matchScore}%</span>
              </div>
            </CardContent>
          </Card>

          {result.changes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Changes Made</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.changes.map((c, i) => (
                  <div key={i} className="rounded-lg border p-3">
                    <p className="mb-1 text-sm font-medium">{c.section}</p>
                    <p className="mb-1 text-xs text-muted-foreground">Before: {c.before}</p>
                    <p className="mb-1 text-xs text-green-500">After: {c.after}</p>
                    <p className="text-xs text-muted-foreground italic">Why: {c.reason}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
