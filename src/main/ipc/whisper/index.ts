import { registerWhisperFileHandlers } from './file-handlers'
import { registerTranscriptionHandlers } from './transcription-handlers'
import { registerRecordHandlers } from './record-handlers'

export function registerWhisperHandlers(): void {
  registerWhisperFileHandlers()
  registerTranscriptionHandlers()
  registerRecordHandlers()
}

// Re-export for callers that only need the output directory path
export { getOutputDirectory } from './transcription-handlers'
