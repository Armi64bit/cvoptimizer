import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, ExternalLink, Trash2, Check, X } from 'lucide-react'
import { getApplications, createApplication, updateApplication, deleteApplication } from '@/lib/api'
import type { Application } from '@cvoptimizer/shared'

const STATUSES = ['applied', 'interview', 'rejected', 'offer', 'accepted']

export function TrackerTab() {
  const [apps, setApps] = useState<Application[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ company: '', position: '', jobUrl: '', source: '', notes: '' })
  const [loading, setLoading] = useState(false)

  const load = async () => {
    try { setApps(await getApplications()) } catch {}
  }
  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    if (!form.company || !form.position) return
    setLoading(true)
    try {
      await createApplication(form)
      setForm({ company: '', position: '', jobUrl: '', source: '', notes: '' })
      setShowForm(false)
      await load()
    } catch (err) { alert((err as Error).message) }
    finally { setLoading(false) }
  }

  const handleStatus = async (id: string, status: string) => {
    await updateApplication(id, { status, replied: status === 'interview' || status === 'offer' || status === 'rejected' })
    await load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this application?')) return
    await deleteApplication(id)
    await load()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Applications ({apps.length})</h2>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-1 h-4 w-4" /> Add
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input placeholder="Company" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
              <Input placeholder="Position" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} />
              <Input placeholder="Job URL" value={form.jobUrl} onChange={e => setForm({ ...form, jobUrl: e.target.value })} />
              <Input placeholder="Source (LinkedIn, Glassdoor...)" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} />
            </div>
            <Textarea placeholder="Notes..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={loading || !form.company || !form.position}>Save</Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {apps.map(app => (
          <Card key={app.id}>
            <CardContent className="flex items-center gap-4 py-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{app.company}</p>
                  <span className="text-xs text-muted-foreground">— {app.position}</span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span>{new Date(app.appliedAt).toLocaleDateString()}</span>
                  {app.source && <span>{app.source}</span>}
                  {app.jobUrl && (
                    <a href={app.jobUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                      <ExternalLink className="h-3 w-3" /> Link
                    </a>
                  )}
                </div>
                {app.notes && <p className="mt-1 text-xs text-muted-foreground">{app.notes}</p>}
              </div>
              <div className="flex items-center gap-1">
                {STATUSES.map(s => (
                  <Button
                    key={s}
                    variant={app.status === s ? 'default' : 'ghost'}
                    size="sm"
                    className={`text-xs capitalize ${app.status === s ? '' : 'text-muted-foreground'}`}
                    onClick={() => handleStatus(app.id, s)}
                  >
                    {s === 'applied' && <Check className="mr-1 h-3 w-3" />}
                    {s === 'rejected' && <X className="mr-1 h-3 w-3" />}
                    {s}
                  </Button>
                ))}
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(app.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {apps.length === 0 && !showForm && (
          <p className="py-8 text-center text-sm text-muted-foreground">No applications yet. Click "Add" to track your first one.</p>
        )}
      </div>
    </div>
  )
}
