import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Link2, FileText } from 'lucide-react'
import { scrapeJob } from '@/lib/api'

interface JobInputProps {
  jobDescription: string
  onJobDescriptionChange: (text: string) => void
  onJobTitleChange: (title: string) => void
}

export function JobInput({ jobDescription, onJobDescriptionChange, onJobTitleChange }: JobInputProps) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleScrape = async () => {
    if (!url.trim()) return
    setLoading(true)
    setError('')
    try {
      const job = await scrapeJob(url)
      onJobDescriptionChange(job.description)
      onJobTitleChange(job.title)
    } catch {
      setError('Could not fetch job. Paste the description manually.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Paste job URL (LinkedIn, Glassdoor, Indeed...)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        <Button onClick={handleScrape} disabled={loading || !url.trim()}>
          {loading ? 'Fetching...' : 'Fetch'}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or paste manually</span>
        </div>
      </div>
      <div className="relative">
        <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Textarea
          className="min-h-[200px] pl-9"
          placeholder="Paste the job description here..."
          value={jobDescription}
          onChange={(e) => onJobDescriptionChange(e.target.value)}
        />
      </div>
    </div>
  )
}
