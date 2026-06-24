import { useState, useMemo } from 'react'
import { Link } from '@/app/navigation'
import { motion } from '@/lib/motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  Clock
} from 'lucide-react'
import AudioPlayer from '@/components/editor/AudioPlayer'
import SpeakerPanel from '@/components/editor/SpeakerPanel'
import TranscriptSegment from '@/components/editor/TranscriptSegment'

const TRANSCRIPT = [
  {
    id: 1,
    speaker: 'Speaker 1',
    name: 'Sarah Chen',
    time: '00:00:00',
    endTime: '00:00:15',
    text: "Good morning everyone. Thank you for joining today's product strategy meeting. We have a lot to cover, so let's get started right away."
  },
  {
    id: 2,
    speaker: 'Speaker 2',
    name: 'Michael Torres',
    time: '00:00:15',
    endTime: '00:00:32',
    text: "Thanks Sarah. I'd like to start by reviewing our Q3 metrics. Overall, we saw a 23% increase in user engagement, which exceeded our target of 18%."
  },
  {
    id: 3,
    speaker: 'Speaker 1',
    name: 'Sarah Chen',
    time: '00:00:32',
    endTime: '00:00:48',
    text: "That's excellent. Can you break down which features drove the most engagement? I'm particularly interested in the AI-powered suggestions we launched in August."
  },
  {
    id: 4,
    speaker: 'Speaker 2',
    name: 'Michael Torres',
    time: '00:00:48',
    endTime: '00:01:12',
    text: 'Absolutely. The AI suggestions feature had the highest adoption rate at 67% of active users. The real-time collaboration tools came in second at 45%. We also saw significant growth in our mobile usage, up 31% quarter over quarter.'
  },
  {
    id: 5,
    speaker: 'Speaker 3',
    name: 'Lisa Wang',
    time: '00:01:12',
    endTime: '00:01:35',
    text: 'I want to add some context from the user research side. We conducted 42 user interviews last quarter, and the feedback has been overwhelmingly positive. The main request is better integration with existing workflows, which aligns with our Q4 roadmap.'
  },
  {
    id: 6,
    speaker: 'Speaker 1',
    name: 'Sarah Chen',
    time: '00:01:35',
    endTime: '00:01:52',
    text: "Perfect. Let's talk about Q4 priorities then. I've outlined three key initiatives that I believe will position us well for next year. First, expanding our API ecosystem."
  },
  {
    id: 7,
    speaker: 'Speaker 2',
    name: 'Michael Torres',
    time: '00:01:52',
    endTime: '00:02:15',
    text: "The API expansion is critical. We've had over 200 requests from enterprise customers for deeper integrations. I'd suggest we prioritize the webhook system and the batch processing endpoints."
  },
  {
    id: 8,
    speaker: 'Speaker 3',
    name: 'Lisa Wang',
    time: '00:02:15',
    endTime: '00:02:38',
    text: "From a design perspective, we need to ensure the developer experience is world-class. I'd recommend we invest in comprehensive documentation and interactive playground environments."
  }
]

export default function Studio() {
  const [searchQuery, setSearchQuery] = useState('')
  const [replaceText, setReplaceText] = useState('')
  const [showReplace, setShowReplace] = useState(false)
  const [activeSegment, setActiveSegment] = useState(1)
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState('00:00:32')

  const filteredTranscript = useMemo(
    () =>
      TRANSCRIPT.filter((seg) => {
        const matchSearch = searchQuery
          ? seg.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
            seg.name.toLowerCase().includes(searchQuery.toLowerCase())
          : true
        const matchSpeaker = activeSpeaker ? seg.speaker === activeSpeaker : true
        return matchSearch && matchSpeaker
      }),
    [searchQuery, activeSpeaker]
  )

  const matchCount = searchQuery
    ? TRANSCRIPT.filter((s) => s.text.toLowerCase().includes(searchQuery.toLowerCase())).length
    : 0

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
                <h1 className="text-[15px] font-semibold truncate">Product Strategy Meeting Q4</h1>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-success/10 text-success text-[10px] font-medium">
                  <Check className="w-2.5 h-2.5" /> Transcribed
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 1h 23m
                </span>
                <span className="text-muted-foreground/30">·</span>
                <span>3 speakers</span>
                <span className="text-muted-foreground/30">·</span>
                <span>Large-v3</span>
                <span className="text-muted-foreground/30">·</span>
                <span>96.4% confidence</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
              <Languages className="w-3.5 h-3.5" /> EN
            </Button>
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
              <Tag className="w-3.5 h-3.5" /> Label
            </Button>

            <Link to="/export">
              <Button size="sm" className="gap-1.5 text-xs">
                <Download className="w-3.5 h-3.5" /> Export
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
                placeholder="Search transcript…"
                className="pl-9 h-8 text-[13px] bg-secondary/40 border-border/40"
              />
              {searchQuery && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted-foreground">
                  {matchCount} matches
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplace(!showReplace)}
              className="text-xs text-muted-foreground gap-1"
            >
              <Replace className="w-3.5 h-3.5" /> Replace
            </Button>
            <div className="flex-1" />
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1">
              <MessageSquare className="w-3.5 h-3.5" /> Comments
            </Button>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </Button>
          </div>

          {showReplace && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="shrink-0 px-6 py-2.5 border-b border-border/50 flex items-center gap-2 bg-secondary/20"
            >
              <Input
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                placeholder="Replace with…"
                className="flex-1 max-w-sm h-8 text-[13px] bg-secondary/40 border-border/40"
              />
              <Button variant="outline" size="sm" className="text-xs">
                Replace
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                Replace All
              </Button>
            </motion.div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="mx-auto space-y-1">
              {filteredTranscript.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground text-sm">
                  No segments match your filters.
                </div>
              ) : (
                filteredTranscript.map((seg) => (
                  <TranscriptSegment
                    key={seg.id}
                    seg={seg}
                    isActive={activeSegment === seg.id}
                    searchQuery={searchQuery}
                    onActivate={setActiveSegment}
                    onTimeClick={(t) => setCurrentTime(t)}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Inspector */}
        <SpeakerPanel activeSpeaker={activeSpeaker} onSelectSpeaker={setActiveSpeaker} />
      </div>

      {/* Player */}
      <AudioPlayer
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        currentTime={currentTime}
        progress={18}
      />
    </div>
  )
}
