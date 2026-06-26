export interface SrtSegment {
  id: number
  startSeconds: number
  endSeconds: number
  time: string
  endTime: string
  text: string
  speaker: string
  name: string
}

function srtTimeToSeconds(time: string): number {
  // Format: HH:MM:SS,mmm or HH:MM:SS.mmm
  const normalized = time.replace(',', '.')
  const [hms, ms] = normalized.split('.')
  const parts = hms.split(':').map(Number)
  const [h, m, s] = parts
  return h * 3600 + m * 60 + s + (ms ? parseInt(ms) / 1000 : 0)
}

function secondsToDisplay(s: number): string {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = Math.floor(s % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return `${m}:${String(sec).padStart(2, '0')}`
}

export function parseSrt(content: string): SrtSegment[] {
  const blocks = content.trim().split(/\r?\n\r?\n/)
  const segments: SrtSegment[] = []

  for (const block of blocks) {
    const lines = block.trim().split(/\r?\n/)
    if (lines.length < 3) continue

    const idLine = lines[0].trim()
    const timeLine = lines[1].trim()
    const textLines = lines.slice(2)

    const id = parseInt(idLine)
    if (isNaN(id)) continue

    const timeMatch = timeLine.match(
      /(\d{2}:\d{2}:\d{2}[,.]?\d{0,3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,.]?\d{0,3})/
    )
    if (!timeMatch) continue

    const startSeconds = srtTimeToSeconds(timeMatch[1])
    const endSeconds = srtTimeToSeconds(timeMatch[2])
    const text = textLines.join(' ').trim()

    segments.push({
      id,
      startSeconds,
      endSeconds,
      time: secondsToDisplay(startSeconds),
      endTime: secondsToDisplay(endSeconds),
      text,
      speaker: '',
      name: ''
    })
  }

  return segments
}
