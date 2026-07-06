import type { CVData, CvSection } from '@cvoptimizer/shared'

export function parseCvText(text: string): CVData {
  const lines = text.split('\n').filter(l => l.trim())
  const sections: CvSection[] = []
  let currentSection: CvSection | null = null

  for (const line of lines) {
    const trimmed = line.trim()
    if (/^[A-Z][A-Z\s/]+$|^[A-Z][a-z]+.*:$/.test(trimmed)) {
      if (currentSection) sections.push(currentSection)
      currentSection = { heading: trimmed.replace(/:$/, ''), content: [] }
    } else if (currentSection) {
      currentSection.content.push(trimmed)
    }
  }
  if (currentSection) sections.push(currentSection)

  const email = text.match(/[\w.-]+@[\w.-]+\.\w+/)?.[0]
  const phone = text.match(/[\+]?[\d\s()-]{7,20}/)?.[0]
  const name = text.split('\n')[0]?.trim()

  return { rawText: text, sections, name, email, phone }
}

export async function parsePdf(buffer: Buffer): Promise<string> {
  const pdfParse = (await import('pdf-parse')).default
  const data = await pdfParse(buffer)
  return data.text
}

export async function parseDocx(buffer: Buffer): Promise<string> {
  const mammoth = await import('mammoth')
  const result = await mammoth.extractRawText({ buffer })
  return result.value
}
