import { useEffect, useState } from 'react'
import type { DesktopApi, TranscriptionRecord } from '@shared/ipc'
import { Mic, Clock, FileAudio, MoreHorizontal, Trash2, Loader2, FolderOpen } from 'lucide-react'
import { setStudioRecord } from '@/lib/studio-store'
import { useAppRoute } from '@/app/use-app-route'

const ACCENTS = [
  'from-primary/20 to-primary/5',
  'from-chart-1/20 to-chart-1/5',
  'from-chart-2/20 to-chart-2/5',
  'from-warning/20 to-warning/5',
  'from-chart-4/20 to-chart-4/5',
  'from-chart-5/20 to-chart-5/5'
]

function formatRelativeDate(ts: number): string {
  const diff = Date.now() - ts
  const minutes = Math.floor(diff / 60000)
  if (minutes < 2) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return new Date(ts).toLocaleDateString()
}

function getAccent(id: string): string {
  let hash = 0
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffffff
  return ACCENTS[Math.abs(hash) % ACCENTS.length]
}

interface TranscriptionGridProps {
  desktop: DesktopApi
}

export default function TranscriptionGrid({ desktop }: TranscriptionGridProps) {
  const [records, setRecords] = useState<TranscriptionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const { navigateTo } = useAppRoute()

  function openInStudio(item: TranscriptionRecord) {
    setStudioRecord(item)
    navigateTo('studio')
  }

  useEffect(() => {
    desktop
      .listTranscriptions()
      .then(setRecords)
      .finally(() => setLoading(false))
  }, [desktop])

  async function handleDelete(id: string) {
    setDeletingId(id)
    setMenuOpenId(null)
    await desktop.deleteTranscription(id)
    setRecords((prev) => prev.filter((r) => r.id !== id))
    setDeletingId(null)
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm py-8">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading transcriptions...
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center">
        <FolderOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm font-medium text-muted-foreground">No transcriptions yet</p>
        <p className="text-[11px] text-muted-foreground/60 mt-1">
          Start a new transcription to see it here
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Recent Transcriptions</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {records.length} {records.length === 1 ? 'transcription' : 'transcriptions'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {records.map((item) => (
          <div
            key={item.id}
            className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card hover:border-primary/30 hover:-translate-y-0.5 transition-all"
          >
            {/* Gradient header */}
            <div
              className={`h-20 bg-gradient-to-br ${getAccent(item.id)} relative overflow-hidden`}
            >
              <div className="absolute inset-0 flex items-center justify-end pr-4">
                <Mic className="w-12 h-12 text-foreground/5 group-hover:text-primary/10 transition-colors" />
              </div>
              <div className="absolute top-3 left-4 flex items-center gap-1.5 px-2 py-1 rounded-md bg-background/60 backdrop-blur-sm">
                <FileAudio className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] font-mono text-muted-foreground uppercase">
                  {item.sourceFileName.split('.').pop() ?? '—'}
                </span>
              </div>
              <div className="absolute top-3 right-3">
                {deletingId === item.id ? (
                  <div className="p-1.5 rounded-md bg-background/60 backdrop-blur-sm">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setMenuOpenId(menuOpenId === item.id ? null : item.id)
                      }}
                      className="p-1.5 rounded-md bg-background/60 backdrop-blur-sm text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                    {menuOpenId === item.id && (
                      <div className="absolute right-0 top-full mt-1 z-10 min-w-[130px] rounded-lg border border-border bg-popover shadow-lg py-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            void handleDelete(item.id)
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Body */}
            <button onClick={() => openInStudio(item)} className="block w-full text-left p-4">
              <h3 className="text-[13px] font-medium truncate group-hover:text-primary transition-colors mb-2">
                {item.sourceFileName}
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatRelativeDate(item.createdAt)}
                </span>
                <span className="text-muted-foreground/30">·</span>
                <span className="uppercase">{item.model}</span>
                {item.outputFiles.length > 0 && (
                  <>
                    <span className="text-muted-foreground/30">·</span>
                    <span>{item.outputFiles.map((f) => f.format.toUpperCase()).join(', ')}</span>
                  </>
                )}
              </div>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
