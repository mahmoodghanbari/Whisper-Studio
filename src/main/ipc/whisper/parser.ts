import { readFile } from 'node:fs/promises'
import { statSync } from 'node:fs'
import { join } from 'node:path'
import type { WhisperOutputFile, WhisperSegment } from '../../../shared/ipc'

export function getFileSize(path: string): number {
  try {
    return statSync(path).size
  } catch {
    return 0
  }
}

export async function parseWhisperJson(
  outputDir: string,
  sourceFileName: string
): Promise<{ segments: WhisperSegment[]; jsonFile: WhisperOutputFile | null }> {
  const baseName = sourceFileName.replace(/\.[^.]+$/, '')
  const jsonPath = join(outputDir, `${baseName}.json`)

  try {
    const raw = await readFile(jsonPath, 'utf8')
    const parsed = JSON.parse(raw) as {
      segments?: Array<{ id: number; start: number; end: number; text: string }>
    }
    const segments: WhisperSegment[] = (parsed.segments ?? []).map((s, i) => ({
      id: i + 1,
      start: s.start,
      end: s.end,
      text: s.text.trim()
    }))
    const jsonFile: WhisperOutputFile = {
      format: 'json',
      path: jsonPath,
      sizeBytes: getFileSize(jsonPath)
    }
    return { segments, jsonFile }
  } catch {
    return { segments: [], jsonFile: null }
  }
}
