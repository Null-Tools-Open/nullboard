import type { Point } from '../shared'

/**
 * Draws the lasso selection path
 */
export function drawLasso(
  ctx: CanvasRenderingContext2D,
  path: Point[]
): void {
  if (path.length < 2) return

  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = 1.5
  ctx.setLineDash([5, 5])
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  ctx.beginPath()
  ctx.moveTo(path[0].x, path[0].y)

  for (let i = 1; i < path.length; i++) {
    ctx.lineTo(path[i].x, path[i].y)
  }

  if (path.length >= 3) {
    ctx.lineTo(path[0].x, path[0].y)
    
    ctx.fillStyle = 'rgba(59, 130, 246, 0.1)'
    ctx.fill()
  }

  ctx.stroke()
  ctx.setLineDash([])
}