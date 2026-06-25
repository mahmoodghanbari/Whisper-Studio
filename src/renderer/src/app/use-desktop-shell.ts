import { useEffect, useMemo, useState } from 'react'
import type { AppInfo, DesktopApi, DesktopPlatform, SystemStatus } from '@shared/ipc'
import { getDesktopApi } from '@/lib/desktop'

interface DesktopShellState {
  appInfo: AppInfo | null
  desktop: DesktopApi
  isWindowMaximized: boolean
  platform: DesktopPlatform
  systemStatus: SystemStatus | null
}

export function useDesktopShell(): DesktopShellState {
  const desktop = useMemo(() => getDesktopApi(), [])
  const [isWindowMaximized, setIsWindowMaximized] = useState(false)
  const [platform, setPlatform] = useState<DesktopPlatform>('win32')
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null)
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)

  useEffect(() => {
    void desktop.getPlatform().then(setPlatform)
    void desktop.getAppInfo().then(setAppInfo)
    void desktop.getSystemStatus().then(setSystemStatus)
    void desktop.windowControls.isMaximized().then(setIsWindowMaximized)

    return desktop.windowControls.onStateChange(setIsWindowMaximized)
  }, [desktop])

  return {
    appInfo,
    desktop,
    isWindowMaximized,
    platform,
    systemStatus
  }
}
