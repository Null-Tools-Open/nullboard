import type { RectElement } from '../shared'

export type RectangleOptions = {
  strokeColor: string
  fillColor?: string | null
  strokeWidth: number
  strokeStyle: 'solid' | 'dashed' | 'dotted' | 'wavy'
  opacity: number
}

/**
 * Draws a rectangle element on the canvas
 */
export function drawRectangle(ctx: CanvasRenderingContext2D, rect: RectElement): void {

  ctx.globalAlpha = rect.opacity

  if (rect.fillColor) {
    ctx.fillStyle = rect.fillColor
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height)
  }

  ctx.strokeStyle = rect.strokeColor
  ctx.lineWidth = rect.strokeWidth
  ctx.setLineDash(rect.strokeStyle === 'dashed' ? [5, 5] : rect.strokeStyle === 'dotted' ? [2, 2] : [])
  ctx.strokeRect(rect.x, rect.y, rect.width, rect.height)
  ctx.globalAlpha = 1
  ctx.setLineDash([])
}

/**
 * Draws a temporary rectangle (while drawing)
 */
export function drawTempRectangle (
  ctx: CanvasRenderingContext2D,
  start: { x: number; y: number },
  end: { x: number; y: number },
  options: RectangleOptions
): void {
  const x = Math.min(start.x, end.x)
  const y = Math.min(start.y, end.y)
  const w = Math.abs(end.x - start.x)
  const h = Math.abs(end.y - start.y)
  ctx.globalAlpha = options.opacity / 100
  if (options.fillColor) {
    ctx.fillStyle = options.fillColor
    ctx.fillRect(x, y, w, h)
  }
  
  ctx.strokeStyle = options.strokeColor
  ctx.lineWidth = options.strokeWidth
  ctx.setLineDash(options.strokeStyle === 'dashed' ? [5, 5] : options.strokeStyle === 'dotted' ? [2, 2] : [])
  ctx.strokeRect(x, y, w, h)
  ctx.globalAlpha = 1
  ctx.setLineDash([])
}