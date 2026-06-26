import type { WhisperSegment } from '@shared/ipc'

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

function toSrtTime(s: number): string {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = Math.floor(s % 60)
  const ms = Math.round((s % 1) * 1000)
  return `${pad2(h)}:${pad2(m)}:${pad2(sec)},${String(ms).padStart(3, '0')}`
}

function toVttTime(s: number): string {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = Math.floor(s % 60)
  const ms = Math.round((s % 1) * 1000)
  return `${pad2(h)}:${pad2(m)}:${pad2(sec)}.${String(ms).padStart(3, '0')}`
}

export function generateSrt(segments: WhisperSegment[]): string {
  return (
    segments
      .map((s) => `${s.id}\n${toSrtTime(s.start)} --> ${toSrtTime(s.end)}\n${s.text}`)
      .join('\n\n') + '\n'
  )
}

export function generateVtt(segments: WhisperSegment[]): string {
  const body = segments
    .map((s) => `${toVttTime(s.start)} --> ${toVttTime(s.end)}\n${s.text}`)
    .join('\n\n')
  return `WEBVTT\n\n${body}\n`
}

export function generateTxt(segments: WhisperSegment[]): string {
  return segments.map((s) => s.text).join('\n') + '\n'
}

export function generateTsv(segments: WhisperSegment[]): string {
  const header = 'start\tend\ttext'
  const rows = segments.map((s) => `${s.start.toFixed(3)}\t${s.end.toFixed(3)}\t${s.text}`)
  return [header, ...rows].join('\n') + '\n'
}

export type ExportFormat = 'srt' | 'vtt' | 'txt' | 'tsv'

export const FORMAT_LABELS: Record<ExportFormat, string> = {
  srt: 'SRT',
  vtt: 'VTT',
  txt: 'TXT',
  tsv: 'TSV'
}

export const FORMAT_DESCRIPTIONS: Record<ExportFormat, string> = {
  srt: 'SubRip subtitle file, widely supported by video players',
  vtt: 'WebVTT for HTML5 video and streaming',
  txt: 'Plain text transcript, no timestamps',
  tsv: 'Tab-separated values, import into spreadsheets'
}

export function generate(format: ExportFormat, segments: WhisperSegment[]): string {
  switch (format) {
    case 'srt':
      return generateSrt(segments)
    case 'vtt':
      return generateVtt(segments)
    case 'txt':
      return generateTxt(segments)
    case 'tsv':
      return generateTsv(segments)
  }
}
