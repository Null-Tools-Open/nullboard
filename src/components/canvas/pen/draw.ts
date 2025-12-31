import type { Point } from '../shared'
import type { PathElement } from './types'
import { getStrokeOutline } from './strokeUtils'

/**
 * Defines a smooth path using quadratic curves
 */
export function defineSmoothPath(ctx: CanvasRenderingContext2D, points: Point[]): void {
  if (!points || points.length < 2) return

  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)

  if (points.length === 2) {
    ctx.lineTo(points[1].x, points[1].y)
  } else {
    for (let i = 1; i < points.length - 1; i++) {
      const p1 = points[i]
      const p2 = points[i + 1]
      const midX = (p1.x + p2.x) / 2
      const midY = (p1.y + p2.y) / 2
      ctx.quadraticCurveTo(p1.x, p1.y, midX, midY)
    }
    const last = points[points.length - 1]
    ctx.lineTo(last.x, last.y)
  }
}

function drawVariableWidthPath(ctx: CanvasRenderingContext2D, points: Point[], options: { color: string, width: number, opacity: number }): void {
  const outline = getStrokeOutline(points, { size: options.width })
  if (outline.length < 3) return

  ctx.globalAlpha = options.opacity
  ctx.fillStyle = options.color

  ctx.beginPath()
  ctx.moveTo(outline[0].x, outline[0].y)
  for (let i = 1; i < outline.length; i++) {
    ctx.lineTo(outline[i].x, outline[i].y)
  }
  ctx.closePath()
  ctx.fill()

  ctx.globalAlpha = 1
}

/**
 * Draws a path element on the canvas
 */
export function drawPath(ctx: CanvasRenderingContext2D, path: PathElement, viewport?: { x: number; y: number; width: number; height: number } | null, currentScale?: number): void {
  if (path.points.length < 2) return

  let pointsToRender = path.points

  const optimizationThreshold = currentScale && currentScale > 1.65 ? 20 : 50

  if (viewport && path.points.length > optimizationThreshold) {
    const padding = currentScale && currentScale > 1.65 ? 100 : 50
    const viewportMinX = viewport.x - padding
    const viewportMaxX = viewport.x + viewport.width + padding
    const viewportMinY = viewport.y - padding
    const viewportMaxY = viewport.y + viewport.height + padding

    let startIdx = 0
    let endIdx = path.points.length - 1

    if (path.points.length > 100) {
      if (path.bounds) {
        if (path.bounds.maxX < viewportMinX || path.bounds.minX > viewportMaxX ||
          path.bounds.maxY < viewportMinY || path.bounds.minY > viewportMaxY) {
          return
        }
      }
    }

    for (let i = 0; i < path.points.length; i++) {
      const p = path.points[i]
      if (p.x >= viewportMinX && p.x <= viewportMaxX && p.y >= viewportMinY && p.y <= viewportMaxY) {
        startIdx = Math.max(0, i - 1)
        break
      }
    }

    for (let i = path.points.length - 1; i >= 0; i--) {
      const p = path.points[i]
      if (p.x >= viewportMinX && p.x <= viewportMaxX && p.y >= viewportMinY && p.y <= viewportMaxY) {
        endIdx = Math.min(path.points.length - 1, i + 1)
        break
      }
    }

    if (startIdx < endIdx) {
      pointsToRender = path.points.slice(startIdx, endIdx + 1)
    } else {
      return
    }
  }

  const hasPressure = pointsToRender.some(p => p.pressure !== undefined)

  if (hasPressure) {
    drawVariableWidthPath(ctx, pointsToRender, { color: path.color, width: path.width / 2, opacity: path.opacity }) // Divide width by 2 because strokeUtils uses it as radius-ish
  } else {
    ctx.globalAlpha = path.opacity
    defineSmoothPath(ctx, pointsToRender)
    ctx.strokeStyle = path.color
    ctx.lineWidth = path.width
    ctx.stroke()
    ctx.globalAlpha = 1
  }
}

/**
 * Draws a temporary path (while drawing)
 */
export function drawTempPath(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  options: { strokeColor: string; strokeWidth: number; opacity: number }
): void {

  if (points.length <= 1) return

  const hasPressure = points.some(p => p.pressure !== undefined)

  if (hasPressure) {
    drawVariableWidthPath(ctx, points, { color: options.strokeColor, width: options.strokeWidth / 2, opacity: options.opacity / 100 })
  } else {
    ctx.globalAlpha = options.opacity / 100
    defineSmoothPath(ctx, points)
    ctx.strokeStyle = options.strokeColor
    ctx.lineWidth = options.strokeWidth
    ctx.stroke()
    ctx.globalAlpha = 1
  }
}