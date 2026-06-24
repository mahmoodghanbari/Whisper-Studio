import type { Dispatch, SetStateAction } from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import {
  FileText,
  Subtitles,
  Code,
  FileCode,
  Globe,
  LayoutTemplate,
  FolderOpen
} from 'lucide-react'

const FORMATS = [
  {
    value: 'txt',
    label: 'Plain Text',
    ext: '.txt',
    icon: FileText,
    desc: 'Simple text transcript'
  },
  {
    value: 'srt',
    label: 'SRT Subtitles',
    ext: '.srt',
    icon: Subtitles,
    desc: 'Standard subtitle format'
  },
  { value: 'vtt', label: 'WebVTT', ext: '.vtt', icon: Globe, desc: 'Web-compatible subtitles' },
  { value: 'json', label: 'JSON', ext: '.json', icon: Code, desc: 'Structured data with metadata' },
  {
    value: 'md',
    label: 'Markdown',
    ext: '.md',
    icon: FileCode,
    desc: 'Formatted text with headers'
  },
  {
    value: 'html',
    label: 'HTML',
    ext: '.html',
    icon: LayoutTemplate,
    desc: 'Styled web page output'
  }
]

interface StepOutputProps {
  exportMode: string
  outputFormats: string[]
  setExportMode: Dispatch<SetStateAction<string>>
  setOutputFormats: Dispatch<SetStateAction<string[]>>
}

export default function StepOutput({
  outputFormats,
  setOutputFormats
}: StepOutputProps): JSX.Element {
  const toggleFormat = (value: string): void => {
    setOutputFormats(
      outputFormats.includes(value)
        ? outputFormats.filter((f) => f !== value)
        : [...outputFormats, value]
    )
  }

  return (
    <div className="space-y-6">
      {/* Output Formats */}
      <div>
        <h3 className="text-sm font-semibold mb-1">Output Formats</h3>
        <p className="text-xs text-muted-foreground mb-4">Select one or more export formats</p>
        <div className="grid grid-cols-3 gap-3">
          {FORMATS.map((format) => {
            const isSelected = outputFormats.includes(format.value)
            return (
              <button
                key={format.value}
                onClick={() => toggleFormat(format.value)}
                className={`relative flex items-start gap-3 p-4 rounded-xl border transition-all text-left
                  ${
                    isSelected
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-border/50 bg-card/50 hover:bg-secondary/30 hover:border-muted-foreground/20'
                  }`}
              >
                <div className="absolute top-3 right-3">
                  <Checkbox checked={isSelected} />
                </div>
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-primary/10' : 'bg-secondary'}`}
                >
                  <format.icon
                    className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}
                  />
                </div>
                <div>
                  <p className="text-[13px] font-medium">{format.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">{format.ext}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{format.desc}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Output Path */}
      <div>
        <h3 className="text-sm font-semibold mb-1">Output Folder</h3>
        <p className="text-xs text-muted-foreground mb-3">Where to save exported files</p>
        <button className="flex items-center gap-3 w-full p-3 rounded-xl border border-border/50 bg-card/50 hover:bg-secondary/30 transition-all text-left">
          <FolderOpen className="w-4 h-4 text-muted-foreground" />
          <span className="text-[13px] font-mono text-muted-foreground">
            ~/Documents/Whisper Studio/exports
          </span>
        </button>
      </div>

      {/* Estimated Processing */}
      <div className="glass-panel rounded-xl p-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">
              Estimated Time
            </span>
            <span className="text-lg font-semibold font-mono">~21 min</span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">
              Model
            </span>
            <span className="text-[13px] font-medium">Large-v3</span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">
              Output Files
            </span>
            <span className="text-[13px] font-medium">{outputFormats.length * 2} files</span>
          </div>
        </div>
      </div>
    </div>
  )
}
