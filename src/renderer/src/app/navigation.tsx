import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react'

import type { AppRouteId } from './routing'
import { getRouteFromPath, getRoutePath, isAppRouteId, setRouteHash } from './routing'

interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: AppRouteId | string
  children: ReactNode
}

function resolveRoute(to: AppRouteId | string): AppRouteId {
  return isAppRouteId(to) ? to : getRouteFromPath(to)
}

export function Link({ to, onClick, children, ...props }: LinkProps): JSX.Element {
  const routeId = resolveRoute(to)

  function handleClick(event: MouseEvent<HTMLAnchorElement>): void {
    onClick?.(event)

    if (!event.defaultPrevented) {
      event.preventDefault()
      setRouteHash(routeId)
    }
  }

  return (
    <a href={`#${getRoutePath(routeId)}`} onClick={handleClick} {...props}>
      {children}
    </a>
  )
}

export function useNavigate(): (to: AppRouteId | string | number) => void {
  return (to) => {
    if (typeof to === 'number') {
      window.history.go(to)
      return
    }

    setRouteHash(resolveRoute(to))
  }
}
