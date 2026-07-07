import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Navbar } from '@/components/Navbar'
import { OptimizerTab } from '@/pages/OptimizerTab'
import { CoverLetterTab } from '@/pages/CoverLetterTab'
import { CoachTab } from '@/pages/CoachTab'
import { TrackerTab } from '@/pages/TrackerTab'
import { Sparkles, FileText, Lightbulb, Briefcase } from 'lucide-react'

export default function App() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <main className="container flex-1 py-6">
        <Tabs defaultValue="optimizer" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
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
            <TabsTrigger value="tracker">
              <Briefcase className="mr-2 h-4 w-4" />
              Tracker
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
          <TabsContent value="tracker">
            <TrackerTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
