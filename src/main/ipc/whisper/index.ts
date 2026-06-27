import { dialog, ipcMain, type IpcMainInvokeEvent } from 'electron'
import { basename, join } from 'node:path'
import { readdir, readFile, rm, writeFile } from 'node:fs/promises'
import {
  IPC_CHANNELS,
  type TranscriptionRecord,
  type WhisperFileSelection,
  type WhisperTranscriptionRequest,
  type WhisperTranscriptionResult
} from '../../../shared/ipc'
import { SUPPORTED_MEDIA_EXTENSIONS } from '../../../shared/constants'
import { runWhisper, getOutputDirectory } from './executor'
import { parseWhisperJson } from './parser'

export function registerWhisperHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.whisperSelectFile, async (): Promise<WhisperFileSelection> => {
    const selection = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Audio and video', extensions: [...SUPPORTED_MEDIA_EXTENSIONS] },
        { name: 'All files', extensions: ['*'] }
      ]
    })

    if (selection.canceled || selection.filePaths.length === 0) {
      return { canceled: true }
    }

    const filePath = selection.filePaths[0]
    return { canceled: false, filePath, fileName: basename(filePath) }
  })

  ipcMain.handle(
    IPC_CHANNELS.whisperTranscribe,
    async (
      event: IpcMainInvokeEvent,
      request: WhisperTranscriptionRequest
    ): Promise<WhisperTranscriptionResult> => {
      const { command, exitCode, outputDirectory, stdout, stderr } = await runWhisper(
        request,
        (chunk) => event.sender.send(IPC_CHANNELS.whisperOutputChunk, chunk),
        (update) => event.sender.send(IPC_CHANNELS.whisperProgressUpdate, update)
      )

      const { segments, jsonFile } = await parseWhisperJson(
        outputDirectory,
        basename(request.filePath)
      )

      const record: TranscriptionRecord = {
        id: basename(outputDirectory),
        sourceFileName: basename(request.filePath),
        sourceFilePath: request.filePath,
        model: request.model || 'base',
        language: request.language || 'auto',
        compute: request.compute,
        outputDirectory,
        outputFiles: jsonFile ? [jsonFile] : [],
        segments,
        durationSeconds: segments.length > 0 ? segments[segments.length - 1].end : null,
        createdAt: Date.now(),
        exitCode
      }

      await writeFile(
        join(outputDirectory, 'whisper-studio.json'),
        JSON.stringify(record, null, 2),
        'utf8'
      ).catch(() => undefined)

      return {
        command,
        exitCode,
        outputDirectory,
        outputFiles: record.outputFiles,
        record,
        stderr,
        stdout
      }
    }
  )

  ipcMain.handle(IPC_CHANNELS.listTranscriptions, async (): Promise<TranscriptionRecord[]> => {
    const exportsDir = getOutputDirectory()
    const entries = await readdir(exportsDir, { withFileTypes: true }).catch(() => [])
    const records: TranscriptionRecord[] = []

    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      const metaPath = join(exportsDir, entry.name, 'whisper-studio.json')
      try {
        const raw = await readFile(metaPath, 'utf8')
        const rec = JSON.parse(raw) as TranscriptionRecord
        // Backfill segments for records created before segment embedding was added
        if (!rec.segments || rec.segments.length === 0) {
          const { segments } = await parseWhisperJson(
            join(exportsDir, entry.name),
            rec.sourceFileName
          )
          rec.segments = segments
          if (segments.length > 0) {
            await writeFile(metaPath, JSON.stringify(rec, null, 2), 'utf8').catch(() => undefined)
          }
        }
        records.push(rec)
      } catch {
        // skip folders without valid metadata
      }
    }

    return records.sort((a, b) => b.createdAt - a.createdAt)
  })

  ipcMain.handle(
    IPC_CHANNELS.deleteTranscription,
    async (_event: IpcMainInvokeEvent, id: string): Promise<{ ok: boolean }> => {
      // Guard: id must be a plain folder name with no path separators
      if (!id || id.includes('/') || id.includes('\\') || id.includes('..')) {
        return { ok: false }
      }
      const dir = join(getOutputDirectory(), id)
      await rm(dir, { force: true, recursive: true }).catch(() => undefined)
      return { ok: true }
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.readTextFile,
    async (_event: IpcMainInvokeEvent, filePath: string): Promise<string> => {
      return readFile(filePath, 'utf8')
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.writeTextFile,
    async (_event: IpcMainInvokeEvent, filePath: string, content: string): Promise<void> => {
      await writeFile(filePath, content, 'utf8')
    }
  )
}

// Re-export for callers that only need the output directory path
export { getOutputDirectory }
