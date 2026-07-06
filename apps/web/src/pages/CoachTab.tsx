import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { getCoachSuggestions } from '@/lib/api'
import type { CoachSuggestion } from '@cvoptimizer/shared'
import { Lightbulb, Sparkles, BookOpen, Code, Brain } from 'lucide-react'

const categoryIcons: Record<string, React.ReactNode> = {
  skill: <Brain className="h-4 w-4" />,
  project: <Code className="h-4 w-4" />,
  format: <BookOpen className="h-4 w-4" />,
  keyword: <Sparkles className="h-4 w-4" />,
  certification: <Lightbulb className="h-4 w-4" />,
}

const priorityColors: Record<string, string> = {
  high: 'border-red-500/50 bg-red-500/5',
  medium: 'border-yellow-500/50 bg-yellow-500/5',
  low: 'border-blue-500/50 bg-blue-500/5',
}

export function CoachTab() {
  const [cvText, setCvText] = useState('')
  const [jobDesc, setJobDesc] = useState('')
  const [suggestions, setSuggestions] = useState<CoachSuggestion[]>([])
  const [loading, setLoading] = useState(false)

  const handleAnalyze = async () => {
    if (!cvText) return
    setLoading(true)
    try {
      const res = await getCoachSuggestions({ cvText, jobDescription: jobDesc || undefined })
      setSuggestions(res.suggestions)
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">AI Career Coach</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste your CV text for analysis..."
            value={cvText}
            onChange={(e) => setCvText(e.target.value)}
            className="min-h-[150px]"
          />
          <Textarea
            placeholder="Optional: paste target job description for tailored suggestions..."
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
            className="min-h-[100px]"
          />
          <Button className="w-full" onClick={handleAnalyze} disabled={loading || !cvText}>
            <Lightbulb className="mr-2 h-4 w-4" />
            {loading ? 'Analyzing...' : 'Analyze & Suggest Improvements'}
          </Button>
        </CardContent>
      </Card>

      {suggestions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Suggestions ({suggestions.length})</h3>
          {suggestions.map((s, i) => (
            <Card key={i} className={`border-l-4 ${priorityColors[s.priority]}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  {categoryIcons[s.category]}
                  <CardTitle className="text-sm font-medium">{s.title}</CardTitle>
                  <span className={`ml-auto text-[10px] uppercase ${s.priority === 'high' ? 'text-red-400' : s.priority === 'medium' ? 'text-yellow-400' : 'text-blue-400'}`}>
                    {s.priority}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{s.description}</p>
                {s.actionItem && (
                  <p className="mt-2 text-sm font-medium text-primary">→ {s.actionItem}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
