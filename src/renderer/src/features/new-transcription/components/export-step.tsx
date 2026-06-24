import { useState } from 'react'
import { useNavigate } from '@/app/navigation'
import { motion } from '@/lib/motion'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  Copy,
  Check,
  Download,
  FileText,
  Subtitles,
  Code,
  FileCode,
  Globe,
  LayoutTemplate,
  FolderOpen,
  Eye
} from 'lucide-react'

const FORMATS = [
  { value: 'txt', label: 'TXT', icon: FileText },
  { value: 'srt', label: 'SRT', icon: Subtitles },
  { value: 'vtt', label: 'VTT', icon: Globe },
  { value: 'json', label: 'JSON', icon: Code },
  { value: 'md', label: 'Markdown', icon: FileCode },
  { value: 'html', label: 'HTML', icon: LayoutTemplate }
] as const

type ExportFormat = (typeof FORMATS)[number]['value']

const PREVIEWS: Record<ExportFormat, string> = {
  txt: `Product Strategy Meeting Q4

[00:00:00] Sarah Chen: Good morning everyone. Thank you for joining today's product strategy meeting. We have a lot to cover, so let's get started right away.

[00:00:15] Michael Torres: Thanks Sarah. I'd like to start by reviewing our Q3 metrics. Overall, we saw a 23% increase in user engagement, which exceeded our target of 18%.

[00:00:32] Sarah Chen: That's excellent. Can you break down which features drove the most engagement? I'm particularly interested in the AI-powered suggestions we launched in August.

[00:00:48] Michael Torres: Absolutely. The AI suggestions feature had the highest adoption rate at 67% of active users. The real-time collaboration tools came in second at 45%.`,

  srt: `1
00:00:00,000 --> 00:00:15,000
Good morning everyone. Thank you for joining
today's product strategy meeting. We have a lot
to cover, so let's get started right away.

2
00:00:15,000 --> 00:00:32,000
Thanks Sarah. I'd like to start by reviewing
our Q3 metrics. Overall, we saw a 23% increase
in user engagement, which exceeded our target of 18%.

3
00:00:32,000 --> 00:00:48,000
That's excellent. Can you break down which
features drove the most engagement? I'm particularly
interested in the AI-powered suggestions.`,

  vtt: `WEBVTT

00:00:00.000 --> 00:00:15.000
<v Sarah Chen>Good morning everyone. Thank you
for joining today's product strategy meeting.

00:00:15.000 --> 00:00:32.000
<v Michael Torres>Thanks Sarah. I'd like to start
by reviewing our Q3 metrics. Overall, we saw a
23% increase in user engagement.

00:00:32.000 --> 00:00:48.000
<v Sarah Chen>That's excellent. Can you break down
which features drove the most engagement?`,

  json: `{
  "metadata": {
    "title": "Product Strategy Meeting Q4",
    "duration": "1:23:45",
    "speakers": 3,
    "model": "large-v3",
    "language": "en"
  },
  "segments": [
    {
      "id": 1,
      "start": 0.0,
      "end": 15.0,
      "speaker": "Sarah Chen",
      "text": "Good morning everyone...",
      "confidence": 0.97,
      "words": [
        {"word": "Good", "start": 0.0, "end": 0.3},
        {"word": "morning", "start": 0.3, "end": 0.7}
      ]
    }
  ]
}`,

  md: `# Product Strategy Meeting Q4

**Date:** December 12, 2024  
**Duration:** 1h 23m  
**Speakers:** Sarah Chen, Michael Torres, Lisa Wang

---

## Transcript

**Sarah Chen** *(00:00:00)*  
Good morning everyone. Thank you for joining today's product strategy meeting. We have a lot to cover, so let's get started right away.

**Michael Torres** *(00:00:15)*  
Thanks Sarah. I'd like to start by reviewing our Q3 metrics. Overall, we saw a 23% increase in user engagement, which exceeded our target of 18%.

**Sarah Chen** *(00:00:32)*  
That's excellent. Can you break down which features drove the most engagement?`,

  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Product Strategy Meeting Q4</title>
  <style>
    body { font-family: system-ui; max-width: 800px; margin: 0 auto; padding: 2rem; }
    .speaker { font-weight: 600; color: #6C63FF; }
    .timestamp { color: #888; font-size: 0.85em; font-family: monospace; }
    .segment { margin-bottom: 1.5rem; line-height: 1.6; }
  </style>
</head>
<body>
  <h1>Product Strategy Meeting Q4</h1>
  <div class="segment">
    <span class="speaker">Sarah Chen</span>
    <span class="timestamp">00:00:00</span>
    <p>Good morning everyone...</p>
  </div>
</body>
</html>`
}

export default function Export() {
  const navigate = useNavigate()
  const [activeFormat, setActiveFormat] = useState<ExportFormat>('txt')
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    void navigator.clipboard.writeText(PREVIEWS[activeFormat])
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-8 max-w-[1000px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Export</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Preview and export your transcription
          </p>
        </div>
      </div>

      {/* File Info */}
      <div className="glass-panel rounded-xl p-4 mb-6 flex items-center justify-between">
        <div>
          <p className="text-[13px] font-medium">Product Strategy Meeting Q4</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            1h 23m · 3 speakers · 2,847 words · Large-v3
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
              Confidence
            </span>
            <span className="text-[13px] font-mono font-medium">96.4%</span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
              Language
            </span>
            <span className="text-[13px] font-medium">English</span>
          </div>
        </div>
      </div>

      {/* Format Tabs + Preview */}
      <Tabs
        value={activeFormat}
        onValueChange={(value) => setActiveFormat(value as ExportFormat)}
      >
        <div className="flex items-center justify-between mb-4">
          <TabsList className="bg-secondary/50 p-1">
            {FORMATS.map((f) => (
              <TabsTrigger
                key={f.value}
                value={f.value}
                className="gap-1.5 text-xs data-[state=active]:bg-background"
              >
                <f.icon className="w-3.5 h-3.5" />
                {f.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1.5 text-xs">
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy to Clipboard'}
            </Button>
          </div>
        </div>

        {FORMATS.map((f) => (
          <TabsContent key={f.value} value={f.value}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-panel rounded-xl overflow-hidden"
            >
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/50 bg-secondary/20">
                <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[11px] font-medium text-muted-foreground">
                  Preview — {f.label}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground/50 ml-auto">
                  product_strategy_q4.{f.value}
                </span>
              </div>
              <pre className="p-5 text-[12px] font-mono leading-relaxed text-foreground/80 overflow-x-auto max-h-[400px] overflow-y-auto whitespace-pre-wrap">
                {PREVIEWS[f.value]}
              </pre>
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Export Actions */}
      <div className="flex items-center justify-between mt-6 pt-6 border-t border-border/50">
        <div>
          <h3 className="text-sm font-semibold mb-1">Export Options</h3>
          <p className="text-xs text-muted-foreground">
            Export as {activeFormat.toUpperCase()} format
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 text-sm">
            <FolderOpen className="w-4 h-4" />
            Choose Folder
          </Button>
          <Button className="gap-2 text-sm glow-primary">
            <Download className="w-4 h-4" />
            Save Locally
          </Button>
        </div>
      </div>
    </div>
  )
}
