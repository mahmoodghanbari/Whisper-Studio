import { Clock, Gauge, Hash, TrendingUp } from 'lucide-react'

const SPEAKERS = [
  { name: 'Sarah Chen', speaker: 'Speaker 1', segments: 3, color: 'bg-chart-1' },
  { name: 'Michael Torres', speaker: 'Speaker 2', segments: 3, color: 'bg-primary' },
  { name: 'Lisa Wang', speaker: 'Speaker 3', segments: 2, color: 'bg-chart-2' }
]

interface SpeakerPanelProps {
  activeSpeaker: string | null
  onSelectSpeaker: (speaker: string | null) => void
}
const STATS = [
  { icon: Hash, label: 'Word Count', value: '2,847' },
  { icon: Clock, label: 'Duration', value: '1h 23m' },
  { icon: Gauge, label: 'Confidence', value: '96.4%' },
  { icon: TrendingUp, label: 'WPM', value: '142' }
]

export default function SpeakerPanel({
  activeSpeaker,
  onSelectSpeaker
}: SpeakerPanelProps): JSX.Element {
  return (
    <aside className="w-[300px] border-l border-border/50 bg-card/30 p-4 shrink-0 overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Speakers
        </h3>
        {activeSpeaker && (
          <button
            onClick={() => onSelectSpeaker(null)}
            className="text-[10px] text-primary hover:text-foreground transition-colors"
          >
            Clear
          </button>
        )}
      </div>
      <div className="space-y-2">
        {SPEAKERS.map((speaker) => {
          const isActive = activeSpeaker === speaker.speaker

          return (
            <button
              key={speaker.speaker}
              onClick={() => onSelectSpeaker(isActive ? null : speaker.speaker)}
              className={`w-full p-3 rounded-lg border text-left transition-all ${
                isActive
                  ? 'bg-primary/10 border-primary/30'
                  : 'bg-secondary/30 border-transparent hover:bg-secondary/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${speaker.color}`} />
                <span className="text-[12px] font-medium text-foreground">{speaker.name}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">{speaker.segments} segments</p>
            </button>
          )
        })}
      </div>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 mt-6">
        Statistics
      </h3>
      <div className="">
        <div className="grid grid-cols-2 gap-2">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="p-3 rounded-xl bg-secondary/20 border border-border/30"
            >
              <stat.icon className="w-3.5 h-3.5 text-muted-foreground mb-2" />
              <p className="text-[10px] text-muted-foreground mb-0.5">{stat.label}</p>
              <p className="text-[13px] font-mono font-semibold">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Quality */}{' '}
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 mt-6">
        Quality
      </h3>
      <div className="">
        <div className="space-y-2.5">
          <div>
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-muted-foreground">Accuracy</span>
              <span className="font-mono text-foreground">96%</span>
            </div>
            <div className="h-1 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-success rounded-full" style={{ width: '96%' }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-muted-foreground">Clarity</span>
              <span className="font-mono text-foreground">89%</span>
            </div>
            <div className="h-1 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: '89%' }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-muted-foreground">Noise</span>
              <span className="font-mono text-foreground">Low</span>
            </div>
            <div className="h-1 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-warning rounded-full" style={{ width: '22%' }} />
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
