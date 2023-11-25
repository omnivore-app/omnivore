import { keyframes } from './stitches.config'

export function expandWidthAnim(startWidth: string, endWidth: string): unknown {
  return keyframes({
    from: { width: startWidth },
    to: { width: endWidth },
  })
}

export function slideUpAnim(startBottom: string, endBottom: string): unknown {
  return keyframes({
    from: { bottom: startBottom },
    to: { bottom: endBottom },
  })
}
