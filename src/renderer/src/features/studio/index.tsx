import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { Link } from '@/app/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { captions } from '@/captions'
import {
  Search,
  Replace,
  Download,
  Check,
  Languages,
  Tag,
  MessageSquare,
  MoreHorizontal,
  FileAudio,
  Clock,
  Loader2
} from 'lucide-react'
import AudioPlayer from '@/components/studio/audio-player'
import SpeakerPanel from '@/components/studio/speaker-panel'
import TranscriptSegment from '@/components/studio/transcript-segment'
import type { DesktopApi, TranscriptionRecord } from '@shared/ipc'
import { takeStudioRecord } from '@/lib/studio-store'
import { parseSrt, type SrtSegment } from '@/lib/srt-parser'

interface StudioProps {
  desktop: DesktopApi
}

function secondsToDisplay(s: number): string {
  if (!s || isNaN(s)) return '0:00'
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = Math.floor(s % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return `${m}:${String(sec).padStart(2, '0')}`
}

export default function Studio({ desktop }: StudioProps) {
  const [record, setRecord] = useState<TranscriptionRecord | null>(null)
  const [segments, setSegments] = useState<SrtSegment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [replaceText, setReplaceText] = useState('')
  const [showReplace, setShowReplace] = useState(false)
  const [activeSegment, setActiveSegment] = useState<number>(1)
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null)
  const seekToRef = useRef<((s: number) => void) | null>(null)

  useEffect(() => {
    const rec = takeStudioRecord()
    setRecord(rec)

    if (!rec) {
      setLoading(false)
      return
    }

    const srtFile = rec.outputFiles.find((f) => f.format === 'srt')
    if (!srtFile) {
      setLoading(false)
      return
    }

    desktop
      .readTextFile(srtFile.path)
      .then((content) => {
        const parsed = parseSrt(content)
        setSegments(parsed)
        if (parsed.length > 0) setActiveSegment(parsed[0].id)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [desktop])

  const handleTimeUpdate = useCallback((seconds: number) => {
    setSegments((segs) => {
      const active = segs.find((s) => seconds >= s.startSeconds && seconds < s.endSeconds)
      if (active) setActiveSegment(active.id)
      return segs
    })
  }, [])

  const filteredSegments = useMemo(
    () =>
      segments.filter((seg) =>
        searchQuery ? seg.text.toLowerCase().includes(searchQuery.toLowerCase()) : true
      ),
    [segments, searchQuery]
  )

  const matchCount = searchQuery
    ? segments.filter((s) => s.text.toLowerCase().includes(searchQuery.toLowerCase())).length
    : 0

  const audioSrc = record?.sourceFilePath
  const fileName = record?.sourceFileName ?? captions.studio.header.title
  const modelDisplay = record?.model ?? captions.studio.header.model

  // Compute stats from segments
  const srtDurationSeconds = segments.length > 0 ? segments[segments.length - 1].endSeconds : 0
  const effectiveDurationSeconds = record?.durationSeconds ?? srtDurationSeconds

  const wordCount = useMemo(
    () => segments.reduce((n, s) => n + s.text.split(/\s+/).filter(Boolean).length, 0),
    [segments]
  )
  const durationMinutes = effectiveDurationSeconds / 60
  const wpm = durationMinutes > 0 ? Math.round(wordCount / durationMinutes) : 0

  function formatDuration(s: number): string {
    if (!s) return '—'
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    if (h > 0) return `${h}h ${m}m`
    const sec = Math.floor(s % 60)
    return `${m}m ${sec}s`
  }

  const durationDisplay = effectiveDurationSeconds
    ? secondsToDisplay(effectiveDurationSeconds)
    : captions.studio.header.duration

  const panelStats =
    segments.length > 0
      ? [
          { label: 'Word Count', value: wordCount.toLocaleString() },
          { label: 'Duration', value: formatDuration(effectiveDurationSeconds) },
          { label: 'Confidence', value: '—' },
          { label: 'WPM', value: wpm > 0 ? String(wpm) : '—' }
        ]
      : undefined

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 border-b border-border/50 bg-card/40 backdrop-blur-xl px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0">
              <FileAudio className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-[15px] font-semibold truncate">{fileName}</h1>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-success/10 text-success text-[10px] font-medium">
                  <Check className="w-2.5 h-2.5" /> {captions.studio.header.status}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {durationDisplay}
                </span>
                <span className="text-muted-foreground/30">·</span>
                <span>{modelDisplay}</span>
                {record?.language && (
                  <>
                    <span className="text-muted-foreground/30">·</span>
                    <span>{record.language}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
              <Languages className="w-3.5 h-3.5" /> {captions.studio.actions.language}
            </Button>
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
              <Tag className="w-3.5 h-3.5" /> {captions.studio.actions.label}
            </Button>
            <Link to="/export">
              <Button size="sm" className="gap-1.5 text-xs">
                <Download className="w-3.5 h-3.5" /> {captions.studio.actions.export}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Transcript */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="shrink-0 px-6 py-2.5 border-b border-border/50 flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={captions.studio.placeholders.search}
                className="pl-9 h-8 text-[13px] bg-secondary/40 border-border/40"
              />
              {searchQuery && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted-foreground">
                  {matchCount} {captions.studio.matchesLabel}
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplace(!showReplace)}
              className="text-xs text-muted-foreground gap-1"
            >
              <Replace className="w-3.5 h-3.5" /> {captions.studio.actions.replace}
            </Button>
            <div className="flex-1" />
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1">
              <MessageSquare className="w-3.5 h-3.5" /> {captions.studio.actions.comments}
            </Button>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </Button>
          </div>

          {showReplace && (
            <div className="shrink-0 px-6 py-2.5 border-b border-border/50 flex items-center gap-2 bg-secondary/20">
              <Input
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                placeholder={captions.studio.placeholders.replace}
                className="flex-1 max-w-sm h-8 text-[13px] bg-secondary/40 border-border/40"
              />
              <Button variant="outline" size="sm" className="text-xs">
                {captions.studio.actions.replace}
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                {captions.studio.actions.replaceAll}
              </Button>
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="mx-auto space-y-1">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-sm">Loading transcript…</span>
                </div>
              ) : !record ? (
                <div className="text-center py-20 text-muted-foreground text-sm">
                  No transcription selected. Go to the{' '}
                  <Link to="/dashboard" className="text-primary underline">
                    dashboard
                  </Link>{' '}
                  and open one.
                </div>
              ) : filteredSegments.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground text-sm">
                  {searchQuery ? `No results for "${searchQuery}"` : captions.studio.emptyState}
                </div>
              ) : (
                filteredSegments.map((seg) => (
                  <TranscriptSegment
                    key={seg.id}
                    seg={seg}
                    isActive={activeSegment === seg.id}
                    searchQuery={searchQuery}
                    onActivate={setActiveSegment}
                    onTimeClick={() => {
                      seekToRef.current?.(seg.startSeconds)
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Inspector */}
        <SpeakerPanel
          activeSpeaker={activeSpeaker}
          onSelectSpeaker={setActiveSpeaker}
          stats={panelStats}
        />
      </div>

      {/* Player */}
      <AudioPlayer
        src={audioSrc}
        knownDuration={effectiveDurationSeconds || undefined}
        onTimeUpdate={handleTimeUpdate}
        seekToRef={seekToRef}
      />
    </div>
  )
}
