import { ipcMain } from 'electron'
import {
  IPC_CHANNELS,
  type DownloadedWhisperModelsResult,
  type PrerequisiteCheck,
  type PrerequisiteCheckId,
  type PrerequisiteInstallResult,
  type WhisperModelActionResult
} from '../../shared/ipc'
import { deleteModel, downloadModel, getDownloadedModels } from './system/model-cache'
import {
  getCachedPrerequisites,
  installPrerequisite,
  prerequisiteIds
} from './system/prerequisites'
import { getAppInfo, getDesktopPlatform, getSystemStatus } from './system/status'
import { registerWindowControlHandlers, type WindowResolver } from './system/window-controls'

export function registerSystemHandlers(resolveWindow: WindowResolver): void {
  ipcMain.handle(IPC_CHANNELS.appInfo, getAppInfo)
  ipcMain.handle(IPC_CHANNELS.platform, getDesktopPlatform)
  ipcMain.handle(IPC_CHANNELS.systemStatus, getSystemStatus)

  ipcMain.handle(
    IPC_CHANNELS.downloadedModels,
    async (): Promise<DownloadedWhisperModelsResult> => {
      return getDownloadedModels()
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.downloadModel,
    async (event, repoId: string): Promise<WhisperModelActionResult> => {
      return downloadModel(repoId, (progress) => {
        event.sender.send(IPC_CHANNELS.modelDownloadProgress, progress)
      })
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.deleteModel,
    async (_event, id: string): Promise<WhisperModelActionResult> => {
      return deleteModel(id)
    }
  )

  ipcMain.handle(IPC_CHANNELS.prerequisites, async (): Promise<PrerequisiteCheck[]> => {
    return getCachedPrerequisites()
  })

  ipcMain.handle(
    IPC_CHANNELS.prerequisiteInstall,
    async (_event, id: PrerequisiteCheckId): Promise<PrerequisiteInstallResult> => {
      if (!prerequisiteIds.includes(id)) {
        return {
          action: 'opened',
          id,
          ok: false,
          stderr: 'Unknown prerequisite.'
        }
      }

      return installPrerequisite(id)
    }
  )

  registerWindowControlHandlers(resolveWindow)
}
