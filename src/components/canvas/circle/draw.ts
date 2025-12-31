import type { CircleElement } from '../shared'

export type CircleOptions = {
  strokeColor: string
  fillColor?: string | null
  strokeWidth: number
  strokeStyle: 'solid' | 'dashed' | 'dotted' | 'wavy'
  opacity: number
}

/**
 * Draws a circle element on the canvas
 */
export function drawCircle(ctx: CanvasRenderingContext2D, circle: CircleElement): void {

  ctx.globalAlpha = circle.opacity
  ctx.beginPath()
  ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI)

  if (circle.fillColor) {
    ctx.fillStyle = circle.fillColor
    ctx.fill()
  }

  ctx.strokeStyle = circle.strokeColor
  ctx.lineWidth = circle.strokeWidth
  ctx.setLineDash(circle.strokeStyle === 'dashed' ? [5, 5] : circle.strokeStyle === 'dotted' ? [2, 2] : [])
  ctx.stroke()
  ctx.globalAlpha = 1
  ctx.setLineDash([])
}

/**
 * Draws a temporary circle (while drawing)
 */
export function drawTempCircle (

  ctx: CanvasRenderingContext2D,
  center: { x: number; y: number },
  radius: number,
  options: CircleOptions
): void {
  
    if (radius <= 0) return

    ctx.globalAlpha = options.opacity / 100
    ctx.beginPath()
    ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI)
  
    if (options.fillColor) {
        ctx.fillStyle = options.fillColor
        ctx.fill()
    }

    ctx.strokeStyle = options.strokeColor
    ctx.lineWidth = options.strokeWidth
    ctx.setLineDash(options.strokeStyle === 'dashed' ? [5, 5] : options.strokeStyle === 'dotted' ? [2, 2] : [])
    ctx.stroke()
    ctx.globalAlpha = 1
    ctx.setLineDash([])
}