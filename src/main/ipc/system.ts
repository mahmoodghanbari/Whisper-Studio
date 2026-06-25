import { app, BrowserWindow, ipcMain } from 'electron'
import { cpus, totalmem } from 'node:os'
import {
  IPC_CHANNELS,
  type AppInfo,
  type DesktopPlatform,
  type SystemStatus
} from '../../shared/ipc'

type WindowResolver = () => BrowserWindow | null

function formatMemory(bytes: number): string {
  return `${Math.round(bytes / 1024 / 1024 / 1024)} GB`
}

export function registerSystemHandlers(resolveWindow: WindowResolver): void {
  ipcMain.handle(IPC_CHANNELS.appInfo, (): AppInfo => {
    return {
      name: app.getName(),
      version: app.getVersion(),
      electron: process.versions.electron,
      chrome: process.versions.chrome,
      node: process.versions.node
    }
  })

  ipcMain.handle(IPC_CHANNELS.platform, (): DesktopPlatform => {
    return process.platform as DesktopPlatform
  })

  ipcMain.handle(IPC_CHANNELS.systemStatus, (): SystemStatus => {
    const primaryCpu = cpus()[0]?.model?.replace(/\s+/g, ' ').trim() || process.arch

    return {
      ready: true,
      status: 'System Ready',
      activity: 'Idle',
      metrics: [
        { label: 'CPU', value: primaryCpu },
        { label: 'Memory', value: formatMemory(totalmem()) },
        { label: 'Platform', value: process.platform }
      ]
    }
  })

  ipcMain.handle(IPC_CHANNELS.windowIsMaximized, () => {
    return resolveWindow()?.isMaximized() ?? false
  })

  ipcMain.handle(IPC_CHANNELS.windowMinimize, () => {
    resolveWindow()?.minimize()
  })

  ipcMain.handle(IPC_CHANNELS.windowMaximize, () => {
    const window = resolveWindow()

    if (!window) {
      return
    }

    if (window.isMaximized()) {
      window.unmaximize()
    } else {
      window.maximize()
    }
  })

  ipcMain.handle(IPC_CHANNELS.windowClose, () => {
    resolveWindow()?.close()
  })
}
