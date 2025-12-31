import type { LineElement } from '../shared'

export type LineOptions = {
  strokeColor: string
  strokeWidth: number
  strokeStyle: 'solid' | 'dashed' | 'dotted' | 'wavy'
  opacity: number
}

/**
 * Draws a line element on the canvas
 */
export function drawLine(ctx: CanvasRenderingContext2D, line: LineElement): void {
  ctx.globalAlpha = line.opacity
  ctx.beginPath()
  ctx.moveTo(line.start.x, line.start.y)
  ctx.lineTo(line.end.x, line.end.y)
  ctx.strokeStyle = line.strokeColor
  ctx.lineWidth = line.strokeWidth
  ctx.setLineDash(line.strokeStyle === 'dashed' ? [5, 5] : line.strokeStyle === 'dotted' ? [2, 2] : [])
  ctx.stroke()
  ctx.globalAlpha = 1
  ctx.setLineDash([])
}

/**
 * Draws a temporary line (while drawing)
 */
export function drawTempLine(
  ctx: CanvasRenderingContext2D,
  start: { x: number; y: number },
  end: { x: number; y: number },
  options: LineOptions
): void {
  ctx.globalAlpha = options.opacity / 100
  ctx.beginPath()
  ctx.moveTo(start.x, start.y)
  ctx.lineTo(end.x, end.y)
  ctx.strokeStyle = options.strokeColor
  ctx.lineWidth = options.strokeWidth
  ctx.setLineDash(options.strokeStyle === 'dashed' ? [5, 5] : options.strokeStyle === 'dotted' ? [2, 2] : [])
  ctx.stroke()
  ctx.globalAlpha = 1
  ctx.setLineDash([])
}