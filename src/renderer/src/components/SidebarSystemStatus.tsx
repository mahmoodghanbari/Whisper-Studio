import { Dot } from 'lucide-react'

interface SidebarSystemStatusProps {
  collapsed: boolean
}

export function SidebarSystemStatus({ collapsed }: SidebarSystemStatusProps): JSX.Element {
  return (
    <div className="px-2 pb-2">
      {!collapsed && (
        <div className="px-3 py-3 rounded-lg bg-sidebar-accent border border-sidebar-border">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="relative flex">
              <span className="w-2 h-2 rounded-full bg-success" />
              <span className="absolute inline-flex w-2 h-2 rounded-full bg-success opacity-60 animate-ping" />
            </span>
            <span className="text-[11px] font-medium text-sidebar-accent-foreground">
              System Ready
            </span>
            <Dot className="w-4 h-4 text-sidebar-foreground/40 -ml-1" />
            <span className="text-[10px] text-sidebar-foreground font-mono">Idle</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-sidebar-foreground">GPU</span>
              <span className="text-sidebar-accent-foreground/80 font-mono">RTX 4090</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-sidebar-foreground">VRAM</span>
              <span className="text-sidebar-accent-foreground/80 font-mono">24 GB</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-sidebar-foreground">Model</span>
              <span className="text-sidebar-accent-foreground/80 font-mono">large-v3</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
