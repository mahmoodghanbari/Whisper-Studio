export const IPC_CHANNELS = {
  appInfo: 'app:info',
  platform: 'system:platform',
  systemStatus: 'system:status',
  prerequisites: 'system:prerequisites',
  prerequisiteInstall: 'system:prerequisite-install',
  downloadedModels: 'models:downloaded',
  downloadModel: 'models:download',
  modelDownloadProgress: 'models:download-progress',
  deleteModel: 'models:delete',
  windowIsMaximized: 'window:is-maximized',
  windowStateChanged: 'window:state-changed',
  windowMinimize: 'window:minimize',
  windowMaximize: 'window:maximize',
  windowClose: 'window:close',
  whisperSelectFile: 'whisper:select-file',
  whisperTranscribe: 'whisper:transcribe',
  whisperOutputChunk: 'whisper:output-chunk',
  whisperProgressUpdate: 'whisper:progress-update'
} as const

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS]

export type DesktopPlatform = 'aix' | 'darwin' | 'freebsd' | 'linux' | 'openbsd' | 'sunos' | 'win32'

export interface AppInfo {
  name: string
  version: string
  electron: string
  chrome: string
  node: string
}

export interface SystemStatusMetric {
  label: string
  value: string
}

export interface SystemStatus {
  activity: string
  metrics: readonly SystemStatusMetric[]
  ready: boolean
  status: string
}

export type PrerequisiteCheckId = 'python' | 'ffmpeg' | 'cuda' | 'openai-whisper' | 'torch'

export type PrerequisiteCheckStatus = 'ok' | 'missing'

export interface PrerequisiteCheck {
  id: PrerequisiteCheckId
  installed: string | null
  status: PrerequisiteCheckStatus
}

export type PrerequisiteInstallAction = 'installed' | 'opened'

export interface PrerequisiteInstallResult {
  action: PrerequisiteInstallAction
  command?: string
  id: PrerequisiteCheckId
  ok: boolean
  stderr?: string
  stdout?: string
}

export interface DownloadedWhisperModel {
  downloadedAt: number
  id: string
  languages: string
  name: string
  params: string
  path: string
  precision: string
  sizeBytes: number
  source: string
}

export interface DownloadedWhisperModelsResult {
  models: DownloadedWhisperModel[]
  totalSizeBytes: number
}

export interface WhisperModelActionResult {
  id: string
  ok: boolean
  path?: string
  stderr?: string
  stdout?: string
}

export type WhisperModelDownloadProgressState = 'active' | 'complete' | 'error'

export interface WhisperModelDownloadProgress {
  downloadedBytes: number
  repoId: string
  state: WhisperModelDownloadProgressState
}

export interface WhisperFileSelection {
  canceled: boolean
  filePath?: string
  fileName?: string
}

export interface WhisperTranscriptionResult {
  command: string
  exitCode: number | null
  outputDirectory?: string
  outputFiles?: WhisperOutputFile[]
  stdout: string
  stderr: string
  transcript?: string
  transcriptPath?: string
}

export interface WhisperTranscriptionRequest {
  compute: string
  diarization: boolean
  filePath: string
  formats: string[]
  language: string
  model: string
  noiseReduction: boolean
  removeSilence: boolean
  translate: boolean
  wordTimestamps: boolean
}

export interface WhisperOutputFile {
  format: string
  path: string
  sizeBytes: number
}

export interface WhisperOutputChunk {
  stream: 'stdout' | 'stderr'
  text: string
}

export type WhisperProgressPhase =
  | 'checking-command'
  | 'checking-whisper'
  | 'sending-command'
  | 'transcribing'
  | 'complete'
  | 'error'

export type WhisperProgressState = 'active' | 'complete' | 'error'

export interface WhisperProgressUpdate {
  message: string
  phase: WhisperProgressPhase
  state: WhisperProgressState
}

export interface DesktopApi {
  getAppInfo: () => Promise<AppInfo>
  getPlatform: () => Promise<DesktopPlatform>
  getSystemStatus: () => Promise<SystemStatus>
  getPrerequisites: () => Promise<PrerequisiteCheck[]>
  installPrerequisite: (id: PrerequisiteCheckId) => Promise<PrerequisiteInstallResult>
  getDownloadedModels: () => Promise<DownloadedWhisperModelsResult>
  downloadModel: (repoId: string) => Promise<WhisperModelActionResult>
  deleteModel: (id: string) => Promise<WhisperModelActionResult>
  getFilePath: (file: unknown) => string
  onModelDownloadProgress: (
    callback: (progress: WhisperModelDownloadProgress) => void
  ) => () => void
  selectWhisperFile: () => Promise<WhisperFileSelection>
  transcribeWithWhisper: (
    request: WhisperTranscriptionRequest
  ) => Promise<WhisperTranscriptionResult>
  onWhisperOutput: (callback: (chunk: WhisperOutputChunk) => void) => () => void
  onWhisperProgress: (callback: (update: WhisperProgressUpdate) => void) => () => void
  windowControls: {
    isMaximized: () => Promise<boolean>
    minimize: () => Promise<void>
    maximize: () => Promise<void>
    close: () => Promise<void>
    onStateChange: (callback: (isMaximized: boolean) => void) => () => void
  }
}
