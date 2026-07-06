import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import type { CvSection } from '@cvoptimizer/shared'

interface ResumePreviewProps {
  sections: CvSection[]
  name?: string
  email?: string
  phone?: string
  atsScore: number
}

export function ResumePreview({ sections, name, email, phone, atsScore }: ResumePreviewProps) {
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    const originalTitle = document.title
    document.title = `${name || 'CV'}_Optimized`
    window.print()
    document.title = originalTitle
  }

  const atsColor = atsScore >= 80 ? 'text-green-500' : atsScore >= 60 ? 'text-yellow-500' : 'text-red-500'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-sm">
            <span className="text-muted-foreground">ATS Score: </span>
            <span className={`text-lg font-bold ${atsColor}`}>{atsScore}%</span>
          </div>
          <div className="h-2 w-32 rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${atsScore >= 80 ? 'bg-green-500' : atsScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${atsScore}%` }}
            />
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Download className="mr-1 h-4 w-4" /> Download PDF
        </Button>
      </div>

      <div
        ref={printRef}
        className="resume-preview rounded-lg border bg-white p-8 shadow-sm dark:bg-white"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">{name || 'Professional'}</h1>
          <p className="mt-1 text-sm text-gray-600">
            {[email, phone].filter(Boolean).join(' | ') || 'Contact information'}
          </p>
        </div>

        <div className="mt-6 space-y-5">
          {sections.map((section, i) => (
            <div key={i}>
              <h2 className="border-b border-gray-300 pb-1 text-sm font-bold uppercase tracking-wider text-gray-800">
                {section.heading}
              </h2>
              <div className="mt-2 space-y-1">
                {section.content.map((line, j) => (
                  <p key={j} className="text-sm leading-relaxed text-gray-700">
                    {line.startsWith('-') || line.startsWith('•') ? line : `• ${line}`}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .resume-preview, .resume-preview * { visibility: visible; }
          .resume-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0.75in;
            border: none;
            box-shadow: none;
            background: white !important;
          }
          .resume-preview h1 { font-size: 18pt; }
          .resume-preview h2 { font-size: 11pt; }
          .resume-preview p { font-size: 10pt; }
        }
      `}</style>
    </div>
  )
}
