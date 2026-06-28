import { dialog, ipcMain } from 'electron'
import { basename } from 'node:path'
import { IPC_CHANNELS, type WhisperFileSelection } from '../../../shared/ipc'
import { SUPPORTED_MEDIA_EXTENSIONS } from '../../../shared/constants'

export function registerWhisperFileHandlers(): void {
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
}
