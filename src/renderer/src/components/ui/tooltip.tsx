import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { captions } from '@/captions'
import { cn } from '@/lib/utils'

interface TooltipContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLButtonElement>
}

const TooltipContext = React.createContext<TooltipContextValue | null>(null)

function TooltipProvider({ children }: { children: React.ReactNode }): JSX.Element {
  return <>{children}</>
}

function Tooltip({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}): JSX.Element {
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLButtonElement>(null)

  return (
    <TooltipContext.Provider value={{ open, setOpen, triggerRef }}>
      <span className={cn('relative inline-flex', className)}>{children}</span>
    </TooltipContext.Provider>
  )
}

function useTooltip(): TooltipContextValue {
  const context = React.useContext(TooltipContext)

  if (!context) {
    throw new Error(captions.errors.tooltipContext)
  }

  return context
}

function TooltipTrigger({ children, ...props }: React.ComponentProps<'button'>): JSX.Element {
  const { setOpen, triggerRef } = useTooltip()

  return (
    <button
      ref={triggerRef}
      type="button"
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </button>
  )
}

interface TooltipContentProps extends React.ComponentProps<'div'> {
  side?: 'top' | 'right' | 'bottom' | 'left'
}

function TooltipContent({
  children,
  className,
  side = 'top',
  ...props
}: TooltipContentProps): JSX.Element | null {
  const { open, triggerRef } = useTooltip()
  const [coords, setCoords] = React.useState<{ top: number; left: number } | null>(null)

  React.useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const GAP = 8
      let top = 0
      let left = 0
      if (side === 'right') {
        top = rect.top + rect.height / 2
        left = rect.right + GAP
      } else if (side === 'left') {
        top = rect.top + rect.height / 2
        left = rect.left - GAP
      } else if (side === 'bottom') {
        top = rect.bottom + GAP
        left = rect.left + rect.width / 2
      } else {
        // top
        top = rect.top - GAP
        left = rect.left + rect.width / 2
      }
      setCoords({ top, left })
    }
  }, [open, side, triggerRef])

  if (!open || !coords) return null

  const transformMap: Record<string, string> = {
    top: 'translate(-50%, -100%)',
    bottom: 'translate(-50%, 0)',
    left: 'translate(-100%, -50%)',
    right: 'translate(0, -50%)'
  }

  return ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed',
        top: coords.top,
        left: coords.left,
        transform: transformMap[side],
        zIndex: 9999
      }}
      className={cn(
        'rounded-md border border-border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md whitespace-nowrap pointer-events-none',
        className
      )}
      {...props}
    >
      {children}
    </div>,
    document.body
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
