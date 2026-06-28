import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../../shared/ipc'
import { getAppInfo, getDesktopPlatform, getSystemStatus } from './status'

export function registerAppInfoHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.appInfo, getAppInfo)
  ipcMain.handle(IPC_CHANNELS.platform, getDesktopPlatform)
  ipcMain.handle(IPC_CHANNELS.systemStatus, getSystemStatus)
}
