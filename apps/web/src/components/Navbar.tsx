import { ThemeToggle } from './ThemeToggle'
import { FileText } from 'lucide-react'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <FileText className="h-5 w-5" />
          <span>CV Optimizer</span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  )
}
