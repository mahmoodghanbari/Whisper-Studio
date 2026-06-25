import { execFile } from 'node:child_process'
import { access, readdir, rm, stat } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'
import type {
  DownloadedWhisperModel,
  DownloadedWhisperModelsResult,
  WhisperModelActionResult,
  type WhisperModelDownloadProgress
} from '../../../shared/ipc'

const knownModelInfo: Record<string, { params: string; sizeOrder: number }> = {
  tiny: { params: '39M', sizeOrder: 1 },
  base: { params: '74M', sizeOrder: 2 },
  small: { params: '244M', sizeOrder: 3 },
  medium: { params: '769M', sizeOrder: 4 },
  'large-v1': { params: '1.55B', sizeOrder: 5 },
  'large-v2': { params: '1.55B', sizeOrder: 6 },
  'large-v3': { params: '1.55B', sizeOrder: 7 }
}
export const downloadableModelRepoIds = [
  'Systran/faster-whisper-tiny',
  'Systran/faster-whisper-base',
  'Systran/faster-whisper-small',
  'Systran/faster-whisper-medium',
  'Systran/faster-whisper-large-v3',
  'mobiuslabsgmbh/faster-whisper-large-v3-turbo'
] as const
const downloadedModelsCacheDurationMs = 5000
let downloadedModelsCache: { checkedAt: number; value: DownloadedWhisperModelsResult } | null = null
let downloadedModelsRequest: Promise<DownloadedWhisperModelsResult> | null = null
type CommandResult = {
  exitCode: number
  stderr: string
  stdout: string
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values.filter(Boolean))]
}

function getHubCacheCandidates(): string[] {
  const home = homedir()
  const env = process.env
  const hfHome = env.HF_HOME || (home ? join(home, '.cache', 'huggingface') : '')
  const xdgCacheHome = env.XDG_CACHE_HOME || (home ? join(home, '.cache') : '')
  const userProfile = env.USERPROFILE ?? ''
  const homeEnv = env.HOME ?? ''

  return unique([
    env.HF_HUB_CACHE ?? '',
    env.TRANSFORMERS_CACHE ?? '',
    hfHome ? join(hfHome, 'hub') : '',
    xdgCacheHome ? join(xdgCacheHome, 'huggingface', 'hub') : '',
    home ? join(home, '.cache', 'huggingface', 'hub') : '',
    homeEnv ? join(homeEnv, '.cache', 'huggingface', 'hub') : '',
    userProfile ? join(userProfile, '.cache', 'huggingface', 'hub') : '',
    env.LOCALAPPDATA ? join(env.LOCALAPPDATA, 'huggingface', 'hub') : ''
  ])
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

function clearDownloadedModelsCache(): void {
  downloadedModelsCache = null
  downloadedModelsRequest = null
}

function runCommand(
  command: string,
  args: readonly string[],
  timeoutMs = 30 * 60 * 1000
): Promise<CommandResult> {
  return new Promise((resolve) => {
    execFile(
      command,
      [...args],
      { timeout: timeoutMs, windowsHide: true },
      (error, stdout, stderr) => {
        const exitCode =
          typeof error === 'object' && error && 'code' in error && typeof error.code === 'number'
            ? error.code
            : error
              ? 1
              : 0

        resolve({
          exitCode,
          stderr: stderr.trim(),
          stdout: stdout.trim()
        })
      }
    )
  })
}

async function findPython(): Promise<string | null> {
  for (const command of ['python', 'python3', 'py']) {
    const args = command === 'py' ? ['-3', '--version'] : ['--version']
    const result = await runCommand(command, args, 2500)

    if (result.exitCode === 0 || result.stdout || result.stderr) {
      return command
    }
  }

  return null
}

async function getDirectorySize(
  path: string
): Promise<{ latestMtimeMs: number; sizeBytes: number }> {
  let latestMtimeMs = 0
  let sizeBytes = 0
  let entries

  try {
    entries = await readdir(path, { withFileTypes: true })
  } catch {
    return { latestMtimeMs, sizeBytes }
  }

  await Promise.all(
    entries.map(async (entry) => {
      const entryPath = join(path, entry.name)
      const entryStats = await stat(entryPath).catch(() => null)

      if (!entryStats) {
        return
      }

      latestMtimeMs = Math.max(latestMtimeMs, entryStats.mtimeMs)

      if (entry.isDirectory()) {
        const child = await getDirectorySize(entryPath)
        latestMtimeMs = Math.max(latestMtimeMs, child.latestMtimeMs)
        sizeBytes += child.sizeBytes
        return
      }

      if (entry.isFile()) {
        sizeBytes += entryStats.size
      }
    })
  )

  return { latestMtimeMs, sizeBytes }
}

function getRepoName(cacheDirectoryName: string): string {
  return cacheDirectoryName.replace(/^models--/, '').replace(/--/g, '/')
}

function getModelName(repoName: string): string {
  return (
    repoName
      .split('/')
      .at(-1)
      ?.replace(/^faster-whisper-/, '') ?? repoName
  )
}

function getModelInfo(name: string): { params: string; sizeOrder: number } {
  return knownModelInfo[name] ?? { params: '-', sizeOrder: 0 }
}

function getCacheDirectoryName(repoId: string): string {
  return `models--${repoId.replace(/\//g, '--')}`
}

async function getModelCacheSize(repoId: string): Promise<number> {
  const directoryName = getCacheDirectoryName(repoId)
  const hubPaths = getHubCacheCandidates()

  for (const hubPath of hubPaths) {
    const modelPath = join(hubPath, directoryName)

    if (!(await pathExists(modelPath))) {
      continue
    }

    return (await getDirectorySize(modelPath)).sizeBytes
  }

  return 0
}

async function readModelCacheDirectory(
  hubPath: string,
  directoryName: string
): Promise<DownloadedWhisperModel | null> {
  if (!directoryName.startsWith('models--') || !directoryName.includes('faster-whisper')) {
    return null
  }

  const modelPath = join(hubPath, directoryName)
  const modelStats = await stat(modelPath)

  if (!modelStats.isDirectory()) {
    return null
  }

  const repoName = getRepoName(directoryName)
  const name = getModelName(repoName)
  const modelInfo = getModelInfo(name)
  const { latestMtimeMs, sizeBytes } = await getDirectorySize(modelPath)

  return {
    downloadedAt: latestMtimeMs || modelStats.mtimeMs,
    id: repoName,
    languages: '99',
    name,
    params: modelInfo.params,
    path: modelPath,
    precision: 'CTranslate2',
    sizeBytes,
    source: repoName
  }
}

async function scanDownloadedModels(): Promise<DownloadedWhisperModelsResult> {
  const hubPaths = getHubCacheCandidates()
  const models: DownloadedWhisperModel[] = []

  for (const hubPath of hubPaths) {
    if (!(await pathExists(hubPath))) {
      continue
    }

    const entries = await readdir(hubPath, { withFileTypes: true }).catch(() => [])
    const hubModels = await Promise.all(
      entries
        .filter((entry) => entry.isDirectory())
        .map((entry) => readModelCacheDirectory(hubPath, entry.name).catch(() => null))
    )

    models.push(...hubModels.filter((model): model is DownloadedWhisperModel => Boolean(model)))
  }

  const dedupedModels = [...new Map(models.map((model) => [model.path, model])).values()].sort(
    (a, b) => b.downloadedAt - a.downloadedAt
  )

  return {
    models: dedupedModels,
    totalSizeBytes: dedupedModels.reduce((sum, model) => sum + model.sizeBytes, 0)
  }
}

export async function getDownloadedModels(): Promise<DownloadedWhisperModelsResult> {
  if (
    downloadedModelsCache &&
    Date.now() - downloadedModelsCache.checkedAt < downloadedModelsCacheDurationMs
  ) {
    return downloadedModelsCache.value
  }

  if (!downloadedModelsRequest) {
    downloadedModelsRequest = scanDownloadedModels().then((value) => {
      downloadedModelsCache = { checkedAt: Date.now(), value }
      downloadedModelsRequest = null
      return value
    })
  }

  return downloadedModelsRequest
}

export async function downloadModel(
  repoId: string,
  emitProgress?: (progress: WhisperModelDownloadProgress) => void
): Promise<WhisperModelActionResult> {
  if (!downloadableModelRepoIds.includes(repoId as (typeof downloadableModelRepoIds)[number])) {
    return {
      id: repoId,
      ok: false,
      stderr: 'This model is not in the allowed download list.'
    }
  }

  const python = await findPython()

  if (!python) {
    return {
      id: repoId,
      ok: false,
      stderr: 'Python was not found. Install Python before downloading models.'
    }
  }

  const prefixArgs = python === 'py' ? ['-3'] : []
  const code = [
    'from huggingface_hub import snapshot_download',
    `path = snapshot_download(repo_id=${JSON.stringify(repoId)})`,
    'print(path)'
  ].join('\n')
  const emitCurrentProgress = async (
    state: WhisperModelDownloadProgress['state'] = 'active'
  ): Promise<void> => {
    emitProgress?.({
      downloadedBytes: await getModelCacheSize(repoId),
      repoId,
      state
    })
  }
  await emitCurrentProgress()
  const progressInterval = setInterval(() => {
    void emitCurrentProgress()
  }, 750)
  const result = await runCommand(python, [...prefixArgs, '-c', code])
  clearInterval(progressInterval)
  clearDownloadedModelsCache()
  await emitCurrentProgress(result.exitCode === 0 ? 'complete' : 'error')

  return {
    id: repoId,
    ok: result.exitCode === 0,
    path: result.stdout.split(/\r?\n/).at(-1),
    stderr: result.stderr,
    stdout: result.stdout
  }
}

export async function deleteModel(id: string): Promise<WhisperModelActionResult> {
  const currentModels = await scanDownloadedModels()
  const matchingModels = currentModels.models.filter((model) => model.id === id)

  if (matchingModels.length === 0) {
    return {
      id,
      ok: false,
      stderr: 'Model was not found in the local cache.'
    }
  }

  await Promise.all(matchingModels.map((model) => rm(model.path, { force: true, recursive: true })))
  clearDownloadedModelsCache()

  return {
    id,
    ok: true
  }
}
