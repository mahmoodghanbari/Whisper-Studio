import type { TranscriptionRecord } from '@shared/ipc'

let pendingRecord: TranscriptionRecord | null = null

export function setStudioRecord(record: TranscriptionRecord): void {
  pendingRecord = record
}

export function takeStudioRecord(): TranscriptionRecord | null {
  const record = pendingRecord
  pendingRecord = null
  return record
}
