import type { DiamondElement } from '../shared'

export type DiamondOptions = {
  strokeColor: string
  fillColor?: string | null
  strokeWidth: number
  strokeStyle: 'solid' | 'dashed' | 'dotted' | 'wavy'
  opacity: number
}

/**
 * Draws a diamond element on the canvas
 */
export function drawDiamond(ctx: CanvasRenderingContext2D, diamond: DiamondElement): void {

  ctx.globalAlpha = diamond.opacity

  const centerX = diamond.x + diamond.width / 2
  const centerY = diamond.y + diamond.height / 2

  ctx.beginPath()
  ctx.moveTo(centerX, diamond.y) // Top
  ctx.lineTo(diamond.x + diamond.width, centerY) // Right
  ctx.lineTo(centerX, diamond.y + diamond.height) // Bottom
  ctx.lineTo(diamond.x, centerY) // Left
  ctx.closePath()

  if (diamond.fillColor) {
    ctx.fillStyle = diamond.fillColor
    ctx.fill()
  }

  ctx.strokeStyle = diamond.strokeColor
  ctx.lineWidth = diamond.strokeWidth
  ctx.setLineDash(diamond.strokeStyle === 'dashed' ? [5, 5] : diamond.strokeStyle === 'dotted' ? [2, 2] : [])
  ctx.stroke()
  ctx.globalAlpha = 1
  ctx.setLineDash([])
}

/**
 * Draws a temporary diamond (while drawing)
 */
export function drawTempDiamond (

  ctx: CanvasRenderingContext2D,
  start: { x: number; y: number },
  end: { x: number; y: number },
  options: DiamondOptions
): void {
  const x = Math.min(start.x, end.x)
  const y = Math.min(start.y, end.y)
  const w = Math.abs(end.x - start.x)
  const h = Math.abs(end.y - start.y)
  const centerX = x + w / 2
  const centerY = y + h / 2
  ctx.globalAlpha = options.opacity / 100
  ctx.beginPath()
  ctx.moveTo(centerX, y) // Top
  ctx.lineTo(x + w, centerY) // Right
  ctx.lineTo(centerX, y + h) // Bottom
  ctx.lineTo(x, centerY) // Left
  ctx.closePath()
  
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