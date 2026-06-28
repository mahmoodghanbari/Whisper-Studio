import { ipcMain, type IpcMainInvokeEvent } from 'electron'
import {
  IPC_CHANNELS,
  type DownloadedWhisperModelsResult,
  type WhisperModelActionResult
} from '../../../shared/ipc'
import { deleteModel, downloadModel, getDownloadedModels } from './model-cache'

export function registerModelHandlers(): void {
  ipcMain.handle(
    IPC_CHANNELS.downloadedModels,
    async (): Promise<DownloadedWhisperModelsResult> => {
      return getDownloadedModels()
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.downloadModel,
    async (event: IpcMainInvokeEvent, repoId: string): Promise<WhisperModelActionResult> => {
      return downloadModel(repoId, (progress) => {
        event.sender.send(IPC_CHANNELS.modelDownloadProgress, progress)
      })
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.deleteModel,
    async (_event: IpcMainInvokeEvent, id: string): Promise<WhisperModelActionResult> => {
      return deleteModel(id)
    }
  )
}
