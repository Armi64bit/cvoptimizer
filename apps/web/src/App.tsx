import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Navbar } from '@/components/Navbar'
import { OptimizerTab } from '@/pages/OptimizerTab'
import { CoverLetterTab } from '@/pages/CoverLetterTab'
import { CoachTab } from '@/pages/CoachTab'
import { Sparkles, FileText, Lightbulb } from 'lucide-react'

export default function App() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <main className="container flex-1 py-6">
        <Tabs defaultValue="optimizer" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="optimizer">
              <Sparkles className="mr-2 h-4 w-4" />
              Optimizer
            </TabsTrigger>
            <TabsTrigger value="cover-letter">
              <FileText className="mr-2 h-4 w-4" />
              Cover Letter
            </TabsTrigger>
            <TabsTrigger value="coach">
              <Lightbulb className="mr-2 h-4 w-4" />
              AI Coach
            </TabsTrigger>
          </TabsList>
          <TabsContent value="optimizer">
            <OptimizerTab />
          </TabsContent>
          <TabsContent value="cover-letter">
            <CoverLetterTab />
          </TabsContent>
          <TabsContent value="coach">
            <CoachTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
