import { FileText, Subtitles, Code, Globe, FileSpreadsheet, type LucideIcon } from 'lucide-react'

export const FORMAT_ICONS: Record<string, LucideIcon> = {
  txt: FileText,
  srt: Subtitles,
  vtt: Globe,
  json: Code,
  tsv: FileSpreadsheet
}

export const FALLBACK_FORMAT_ICON = FileText
