import { ipcMain } from 'electron'
import {
  IPC_CHANNELS,
  type PrerequisiteCheck,
  type PrerequisiteCheckId,
  type PrerequisiteInstallResult
} from '../../../shared/ipc'
import { getCachedPrerequisites, installPrerequisite, prerequisiteIds } from './prerequisites'

export function registerPrerequisiteHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.prerequisites, async (): Promise<PrerequisiteCheck[]> => {
    return getCachedPrerequisites()
  })

  ipcMain.handle(
    IPC_CHANNELS.prerequisiteInstall,
    async (_event, id: PrerequisiteCheckId): Promise<PrerequisiteInstallResult> => {
      if (!prerequisiteIds.includes(id)) {
        return { action: 'opened', id, ok: false, stderr: 'Unknown prerequisite.' }
      }

      return installPrerequisite(id)
    }
  )
}
