/* global process */
import { spawn } from 'node:child_process'

const args = process.argv.slice(2)
const isWindows = process.platform === 'win32'
const command = isWindows ? 'electron-vite.cmd' : 'electron-vite'

const env = { ...process.env }
delete env.ELECTRON_RUN_AS_NODE

const child = spawn(command, args, {
  env,
  shell: isWindows,
  stdio: 'inherit'
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }

  process.exit(code ?? 1)
})
