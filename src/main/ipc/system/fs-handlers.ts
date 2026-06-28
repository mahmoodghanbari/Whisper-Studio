import { dialog, ipcMain, type IpcMainInvokeEvent } from 'electron'
import { readFile, writeFile } from 'node:fs/promises'
import { IPC_CHANNELS } from '../../../shared/ipc'

export function registerFsHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.selectDirectory, async (): Promise<string | null> => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory']
    })
    return result.canceled ? null : (result.filePaths[0] ?? null)
  })

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

