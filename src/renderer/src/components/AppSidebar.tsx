import { useState } from 'react'
import {
  LayoutDashboard,
  Settings,
  Search,
  ChevronLeft,
  ChevronRight,
  AudioLines
} from 'lucide-react'

import type { AppRouteId } from '@/app/routing'
import { SidebarSystemStatus } from './SidebarSystemStatus'

const navSections = [
  {
    title: 'Workspace',
    items: [{ icon: LayoutDashboard, label: 'Dashboard', routeId: 'overview' }]
  },
  {
    title: 'Transcription',
    items: [{ icon: AudioLines, label: 'New Transcription', routeId: 'new' }]
  }
] satisfies Array<{
  title: string
  items: Array<{ icon: typeof LayoutDashboard; label: string; routeId: AppRouteId }>
}>

interface AppSidebarProps {
  activeRoute: AppRouteId
  onNavigate: (routeId: AppRouteId) => void
}

export function AppSidebar({ activeRoute, onNavigate }: AppSidebarProps): JSX.Element {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`shell-sidebar h-full flex flex-col bg-sidebar-background text-sidebar-foreground border-r border-sidebar-border shrink-0 transition-[width] duration-200 ${
        collapsed ? 'w-[60px]' : 'w-[240px]'
      }`}
    >
      {/* Search / Command */}
      <div className="px-3 pt-3 pb-2">
        {collapsed ? (
          <button
            onClick={() => setCollapsed(false)}
            className="w-full h-8 flex items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-sidebar-foreground" />
            <input
              placeholder="Search…"
              className="w-full h-8 pl-8 pr-3 rounded-lg bg-sidebar-accent border border-sidebar-border text-[12px] text-sidebar-accent-foreground placeholder:text-sidebar-foreground/50 outline-none focus:border-sidebar-ring transition-colors"
            />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 pb-2">
        {navSections.map((section) => (
          <div key={section.title} className="mb-3">
            {!collapsed && (
              <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = activeRoute === item.routeId
                return (
                  <button
                    key={item.routeId}
                    onClick={() => onNavigate(item.routeId)}
                    title={collapsed ? item.label : undefined}
                    className={`relative flex w-full items-center gap-3 px-3 py-2 rounded-lg text-left text-[13px] font-medium transition-all duration-150 group
                      ${
                        isActive
                          ? 'bg-sidebar-primary/10 text-sidebar-primary'
                          : 'text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent'
                      }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-sidebar-primary" />
                    )}
                    <item.icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive
                          ? 'text-sidebar-primary'
                          : 'text-sidebar-foreground group-hover:text-sidebar-accent-foreground'
                      } transition-colors`}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* System status */}
      <SidebarSystemStatus collapsed={collapsed} />

      {/* Settings + collapse */}
      <div className="px-2 pb-3 pt-1 flex items-center gap-0.5">
        <button
          onClick={() => onNavigate('settings')}
          title="Settings"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left text-[13px] font-medium text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent transition-colors ${
            collapsed ? 'justify-center w-full' : 'flex-1'
          }`}
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand' : 'Collapse'}
          className="p-2 rounded-lg text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  )
}
