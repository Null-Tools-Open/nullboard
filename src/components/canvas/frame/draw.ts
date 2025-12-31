import type { FrameElement } from '../shared'

/**
 * Draws a frame element on the canvas
 */
export function drawFrame(ctx: CanvasRenderingContext2D, frame: FrameElement): void {
  const cornerRadius = 22 // Match the clip radius used in drawElements
  
  ctx.save()
  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = 2
  ctx.setLineDash([])
  ctx.globalAlpha = frame.opacity
  ctx.beginPath()
  ctx.roundRect(frame.x, frame.y, frame.width, frame.height, cornerRadius)
  ctx.stroke()
  ctx.globalAlpha = 1
  
  const frameName = frame.name || 'Frame'
  const textX = frame.x + 8
  const textY = frame.y - 4
  
  ctx.font = '12px sans-serif'
  ctx.textBaseline = 'bottom'
  ctx.textAlign = 'left'
  const textMetrics = ctx.measureText(frameName)
  const textWidth = textMetrics.width
  const textHeight = 14
  
  const isDark = typeof window !== 'undefined' && 
      document.documentElement.classList.contains('dark')
  
  const bgColor = isDark ? '#1a1a1a' : '#FFFFFF'
  const textColor = isDark ? '#FFFFFF' : '#000000'
  
  ctx.fillStyle = bgColor
  ctx.fillRect(textX - 2, textY - textHeight - 2, textWidth + 4, textHeight + 2)
  
  ctx.fillStyle = textColor
  ctx.font = '12px sans-serif'
  ctx.textBaseline = 'bottom'
  ctx.textAlign = 'left'
  ctx.fillText(frameName, textX, textY)
  ctx.restore()
}

/**
 * Draws a temporary frame (while drawing)
 */
export function drawTempFrame(
  ctx: CanvasRenderingContext2D,
  start: { x: number; y: number },
  end: { x: number; y: number }
): void {
  const x = Math.min(start.x, end.x)
  const y = Math.min(start.y, end.y)
  const w = Math.abs(end.x - start.x)
  const h = Math.abs(end.y - start.y)
  const cornerRadius = 12
  
  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = 2
  ctx.setLineDash([5, 5])
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, cornerRadius)
  ctx.stroke()
  ctx.setLineDash([])
  
  ctx.fillStyle = '#000000'
  ctx.font = '12px sans-serif'
  ctx.textBaseline = 'bottom'
  ctx.textAlign = 'left'
  ctx.fillText('Frame', x + 8, y - 4)
}