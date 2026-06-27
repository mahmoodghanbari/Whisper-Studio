import { Box, Circle, Cpu, Dot, HardDrive } from 'lucide-react'
import type { SystemStatus } from '@shared/ipc'
import { captions } from '@/lib/strings'

const metricIcons = [Cpu, HardDrive, Box] as const

interface SystemStatusBarProps {
  status: SystemStatus | null
}

export function SystemStatusBar({ status }: SystemStatusBarProps): JSX.Element {
  const displayStatus: SystemStatus = status ?? {
    ready: true,
    status: captions.statusBar.ready,
    activity: captions.statusBar.idle,
    metrics: captions.statusBar.metrics
  }

  return (
    <footer
      className="flex h-7 min-w-0 items-center justify-between gap-3 border-t border-sidebar-border bg-sidebar-background px-3 text-[11px] text-sidebar-foreground"
      aria-label={captions.statusBar.label}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span className="relative flex size-2 shrink-0">
          <span className="size-2 rounded-full bg-success" />
          {displayStatus.ready && (
            <span className="absolute inline-flex size-2 rounded-full bg-success opacity-60 animate-ping" />
          )}
        </span>
        <span className="truncate font-medium text-sidebar-accent-foreground">
          {displayStatus.status}
        </span>
        <Dot className="size-4 shrink-0 text-sidebar-foreground/40 -mx-1" />
        <span className="font-mono text-sidebar-foreground">{displayStatus.activity}</span>
      </div>

      <div className="flex min-w-0 items-center justify-end gap-3 overflow-hidden">
        {displayStatus.metrics.map((metric, index) => {
          const MetricIcon = metricIcons[index] ?? Circle

          return (
            <div key={metric.label} className="flex min-w-0 items-center gap-1.5">
              <MetricIcon className="size-3.5 shrink-0 text-sidebar-foreground/70" />
              <span className="hidden text-sidebar-foreground/70 sm:inline">{metric.label}</span>
              <span className="truncate font-mono text-sidebar-accent-foreground/90">
                {metric.value}
              </span>
            </div>
          )
        })}
      </div>
    </footer>
  )
}
