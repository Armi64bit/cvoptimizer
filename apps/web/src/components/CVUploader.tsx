import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CVUploaderProps {
  onFileSelect: (file: File) => void
  onTextPaste: (text: string) => void
  value: string
}

export function CVUploader({ onFileSelect, onTextPaste, value }: CVUploaderProps) {
  const [file, setFile] = useState<File | null>(null)

  const onDrop = useCallback(
    (accepted: File[]) => {
      const f = accepted[0]
      if (f) {
        setFile(f)
        onFileSelect(f)
      }
    },
    [onFileSelect],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    maxFiles: 1,
  })

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        }`}
      >
        <input {...getInputProps()} />
        {file ? (
          <div className="flex items-center gap-2">
            <File className="h-8 w-8 text-primary" />
            <span className="text-sm font-medium">{file.name}</span>
          </div>
        ) : (
          <>
            <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Drop your CV here or click to browse (PDF, DOCX)</p>
          </>
        )}
      </div>
      {file && (
        <Button variant="ghost" size="sm" onClick={() => { setFile(null); onTextPaste('') }}>
          <X className="mr-1 h-4 w-4" /> Remove
        </Button>
      )}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or paste your CV</span>
        </div>
      </div>
      <textarea
        className="min-h-[200px] w-full rounded-md border border-input bg-background p-3 text-sm"
        placeholder="Paste your CV text here..."
        value={value}
        onChange={(e) => onTextPaste(e.target.value)}
      />
    </div>
  )
}
