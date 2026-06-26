/// <reference types="vite/client" />

import type { DesktopApi } from '../../../shared/ipc'

declare module '*.svg' {
  const url: string
  export default url
}

declare global {
  interface Window {
    desktop?: DesktopApi
  }
}

export {}
