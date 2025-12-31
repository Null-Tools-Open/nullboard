import type { Point } from '../shared'
import type { PenOptions } from '../../options/penOptionsPanel'
import type { RectangleOptions } from '../../options/rectangleOptionsPanel'
import type { DiamondOptions } from '../../options/diamondOptionsPanel'
import type { CircleOptions } from '../../options/circleOptionsPanel'
import type { LineOptions } from '../../options/lineOptionsPanel'
import type { ArrowOptions } from '../../options/arrowOptionsPanel'
import { drawTempPath } from '../pen'
import { drawTempRectangle } from '../rectangle'
import { drawTempDiamond } from '../diamond'
import { drawTempCircle } from '../circle'
import { drawTempLine } from '../line'
import { drawTempArrow } from '../arrow'
import { drawLasso } from '../lassoSelection'
import { drawTempFrame } from '../frame'

export function drawTempElements(
  ctx: CanvasRenderingContext2D,
  tempPath: Point[],
  tempRect: { start: Point; end: Point } | null,
  tempDiamond: { start: Point; end: Point } | null,
  tempCircle: { center: Point; radius: number } | null,
  tempLine: { start: Point; end: Point } | null,
  tempArrow: { start: Point; end: Point } | null,
  tempTextRect: { start: Point; end: Point } | null,
  selectionBox: { start: Point; end: Point } | null,
  tempLassoPath: Point[],
  tempFrame: { start: Point; end: Point } | null,
  penOptions: PenOptions,
  rectOptions: RectangleOptions,
  diamondOptions: DiamondOptions,
  circleOptions: CircleOptions,
  lineOptions: LineOptions,
  arrowOptions: ArrowOptions
) {
  // Temp path
  if (tempPath.length > 1) {
    drawTempPath(ctx, tempPath, penOptions)
  }

  // Temp rect
  if (tempRect) {
    drawTempRectangle(ctx, tempRect.start, tempRect.end, rectOptions)
  }

  // Temp diamond
  if (tempDiamond) {
    drawTempDiamond(ctx, tempDiamond.start, tempDiamond.end, diamondOptions)
  }

  // Temp circle
  if (tempCircle && tempCircle.radius > 0) {
    drawTempCircle(ctx, tempCircle.center, tempCircle.radius, circleOptions)
  }

  // Temp line
  if (tempLine) {
    drawTempLine(ctx, tempLine.start, tempLine.end, lineOptions)
  }

  // Temp arrow
  if (tempArrow) {
    drawTempArrow(ctx, tempArrow.start, tempArrow.end, arrowOptions)
  }

  // Temp text rect
  if (tempTextRect) {
    const x = Math.min(tempTextRect.start.x, tempTextRect.end.x)
    const y = Math.min(tempTextRect.start.y, tempTextRect.end.y)
    const w = Math.abs(tempTextRect.end.x - tempTextRect.start.x)
    const h = Math.abs(tempTextRect.end.y - tempTextRect.start.y)
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.strokeRect(x, y, w, h)
    ctx.fillStyle = 'rgba(59, 130, 246, 0.05)'
    ctx.fillRect(x, y, w, h)
    ctx.setLineDash([])
  }

  // Selection box
  if (selectionBox) {
    const x = Math.min(selectionBox.start.x, selectionBox.end.x)
    const y = Math.min(selectionBox.start.y, selectionBox.end.y)
    const w = Math.abs(selectionBox.end.x - selectionBox.start.x)
    const h = Math.abs(selectionBox.end.y - selectionBox.start.y)
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 1
    ctx.setLineDash([5, 5])
    ctx.strokeRect(x, y, w, h)
    ctx.fillStyle = 'rgba(59, 130, 246, 0.1)'
    ctx.fillRect(x, y, w, h)
    ctx.setLineDash([])
  }

  // Lasso selection path
  if (tempLassoPath.length >= 2) {
    drawLasso(ctx, tempLassoPath)
  }

  // Temp frame
  if (tempFrame) {
    drawTempFrame(ctx, tempFrame.start, tempFrame.end)
  }
}