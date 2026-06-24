import * as React from 'react'

import { cn } from '@/lib/utils'

interface SwitchProps extends Omit<React.ComponentProps<'button'>, 'onChange' | 'value'> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked = false, className, disabled, onCheckedChange, onClick, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={(event) => {
        onClick?.(event)

        if (!event.defaultPrevented) {
          onCheckedChange?.(!checked)
        }
      }}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-transparent bg-secondary transition-colors outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary',
        checked && 'bg-primary',
        className
      )}
      data-state={checked ? 'checked' : 'unchecked'}
      {...props}
    >
      <span
        className={cn(
          'pointer-events-none block h-4 w-4 rounded-full bg-background shadow-sm transition-transform',
          checked ? 'translate-x-4' : 'translate-x-0.5'
        )}
      />
    </button>
  )
)
Switch.displayName = 'Switch'

export { Switch }
