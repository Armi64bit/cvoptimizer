import type { JobData } from '@cvoptimizer/shared'
import * as cheerio from 'cheerio'

const PLATFORMS = [
  { host: 'linkedin.com', name: 'LinkedIn' },
  { host: 'glassdoor.com', name: 'Glassdoor' },
  { host: 'tanitjobs.com', name: 'TanitJobs' },
  { host: 'keepjob.com', name: 'KeepJob' },
  { host: 'indeed.com', name: 'Indeed' },
]

function identifyPlatform(url: string): string | null {
  const u = new URL(url)
  const platform = PLATFORMS.find(p => u.hostname.includes(p.host))
  return platform?.name || null
}

export async function scrapeJobDescription(url: string): Promise<JobData> {
  const source = identifyPlatform(url)
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml',
    },
  })

  const html = await response.text()
  const $ = cheerio.load(html)

  const title = $('h1').first().text().trim() || $('title').text().trim()
  const description = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 5000)

  const requirements: string[] = []
  $('ul li, .description li, .qualifications li').each((_, el) => {
    const text = $(el).text().trim()
    if (text) requirements.push(text)
  })

    return {
      title: title || 'Unknown Position',
      description,
      requirements: requirements.length ? requirements : [description],
      source: source || undefined,
      url,
    }
}
