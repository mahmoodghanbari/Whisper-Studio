import { execFile } from 'node:child_process'
import { readdir, rm, stat } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'
import type {
  DownloadedWhisperModel,
  DownloadedWhisperModelsResult,
  WhisperModelActionResult,
  type WhisperModelDownloadProgress
} from '../../../shared/ipc'

const knownModelInfo: Record<string, { params: string }> = {
  tiny: { params: '39M' },
  'tiny.en': { params: '39M' },
  base: { params: '74M' },
  'base.en': { params: '74M' },
  small: { params: '244M' },
  'small.en': { params: '244M' },
  medium: { params: '769M' },
  'medium.en': { params: '769M' },
  'large-v1': { params: '1.55B' },
  'large-v2': { params: '1.55B' },
  'large-v3': { params: '1.55B' },
  turbo: { params: '809M' }
}

export const downloadableModelRepoIds = [
  'tiny',
  'base',
  'small',
  'medium',
  'large-v2',
  'large-v3',
  'turbo'
] as const

const cacheDurationMs = 5000
let downloadedModelsCache: { checkedAt: number; value: DownloadedWhisperModelsResult } | null = null
let downloadedModelsRequest: Promise<DownloadedWhisperModelsResult> | null = null

type CommandResult = {
  exitCode: number
  stderr: string
  stdout: string
}

function clearDownloadedModelsCache(): void {
  downloadedModelsCache = null
  downloadedModelsRequest = null
}

function getWhisperCacheDir(): string {
  return process.env.WHISPER_CACHE_DIR ?? join(homedir(), '.cache', 'whisper')
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

async function scanDownloadedModels(): Promise<DownloadedWhisperModelsResult> {
  const cacheDir = getWhisperCacheDir()
  let entries: Awaited<ReturnType<typeof readdir>>

  try {
    entries = await readdir(cacheDir, { withFileTypes: true })
  } catch {
    return { models: [], totalSizeBytes: 0 }
  }

  const modelOrder = Object.keys(knownModelInfo)
  const models: DownloadedWhisperModel[] = []

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.pt')) {
      continue
    }

    const modelName = entry.name.slice(0, -3)
    const filePath = join(cacheDir, entry.name)
    const fileStats = await stat(filePath).catch(() => null)

    if (!fileStats) {
      continue
    }

    const info = knownModelInfo[modelName]

    models.push({
      downloadedAt: fileStats.mtimeMs,
      id: modelName,
      languages: '99',
      name: modelName,
      params: info?.params ?? '-',
      path: filePath,
      precision: 'fp32',
      sizeBytes: fileStats.size,
      source: `openai/whisper`
    })
  }

  models.sort((a, b) => {
    const aOrder = modelOrder.indexOf(a.name)
    const bOrder = modelOrder.indexOf(b.name)
    return (aOrder === -1 ? 999 : aOrder) - (bOrder === -1 ? 999 : bOrder)
  })

  return {
    models,
    totalSizeBytes: models.reduce((sum, model) => sum + model.sizeBytes, 0)
  }
}

export async function getDownloadedModels(): Promise<DownloadedWhisperModelsResult> {
  if (downloadedModelsCache && Date.now() - downloadedModelsCache.checkedAt < cacheDurationMs) {
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
  modelId: string,
  emitProgress?: (progress: WhisperModelDownloadProgress) => void
): Promise<WhisperModelActionResult> {
  if (!downloadableModelRepoIds.includes(modelId as (typeof downloadableModelRepoIds)[number])) {
    return {
      id: modelId,
      ok: false,
      stderr: 'This model is not in the allowed download list.'
    }
  }

  const python = await findPython()

  if (!python) {
    return {
      id: modelId,
      ok: false,
      stderr: 'Python was not found. Install Python before downloading models.'
    }
  }

  const cacheDir = getWhisperCacheDir()
  const ptPath = join(cacheDir, `${modelId}.pt`)

  const getDownloadedBytes = async (): Promise<number> => {
    const fileStats = await stat(ptPath).catch(() => null)
    return fileStats?.size ?? 0
  }

  const emitCurrentProgress = async (
    state: WhisperModelDownloadProgress['state'] = 'active'
  ): Promise<void> => {
    emitProgress?.({
      downloadedBytes: await getDownloadedBytes(),
      repoId: modelId,
      state
    })
  }

  await emitCurrentProgress()
  const progressInterval = setInterval(() => {
    void emitCurrentProgress()
  }, 750)

  const prefixArgs = python === 'py' ? ['-3'] : []
  const code = [
    'import whisper, json',
    `whisper.load_model(${JSON.stringify(modelId)}, download_root=${JSON.stringify(cacheDir)})`,
    'print(json.dumps({"ok": True}))'
  ].join('; ')
  const result = await runCommand(python, [...prefixArgs, '-c', code])

  clearInterval(progressInterval)
  clearDownloadedModelsCache()
  await emitCurrentProgress(result.exitCode === 0 ? 'complete' : 'error')

  return {
    id: modelId,
    ok: result.exitCode === 0,
    stderr: result.stderr,
    stdout: result.stdout
  }
}

export async function deleteModel(id: string): Promise<WhisperModelActionResult> {
  const cacheDir = getWhisperCacheDir()
  const ptPath = join(cacheDir, `${id}.pt`)

  try {
    await rm(ptPath, { force: true })
    clearDownloadedModelsCache()
    return { id, ok: true }
  } catch (error) {
    return {
      id,
      ok: false,
      stderr: error instanceof Error ? error.message : 'Failed to delete model file.'
    }
  }
}
