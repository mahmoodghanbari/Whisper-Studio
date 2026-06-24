import type { ComponentPropsWithoutRef, ReactNode } from 'react'

type MotionDivProps = ComponentPropsWithoutRef<'div'> & {
  animate?: unknown
  exit?: unknown
  initial?: unknown
  transition?: unknown
}

function MotionDiv({ animate, exit, initial, transition, ...props }: MotionDivProps): JSX.Element {
  void animate
  void exit
  void initial
  void transition

  return <div {...props} />
}

export const motion = {
  div: MotionDiv
}

export function AnimatePresence({
  children
}: {
  children: ReactNode
  mode?: 'sync' | 'popLayout' | 'wait'
}): JSX.Element {
  return <>{children}</>
}
