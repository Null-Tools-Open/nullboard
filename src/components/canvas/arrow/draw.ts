// REFACTOR THIS SLOP!!!!!!!!!!!!!!!!!!

import type { Point } from '../shared'
import type { ArrowElement } from '../shared'

export type ArrowOptions = {
  strokeColor: string
  strokeWidth: number
  strokeStyle: 'solid' | 'dashed' | 'dotted'
  arrowStart: boolean
  arrowEnd: boolean
  arrowType: 'straight' | 'curved' | 'elbowed'
  opacity: number
}

/**
 * Draws an arrow head at specified point
 */
export function drawArrowHead(
  ctx: CanvasRenderingContext2D,
  from: Point,
  to: Point,
  strokeWidth: number
): void {
  const headLength = strokeWidth * 6
  const angle = Math.atan2(to.y - from.y, to.x - from.x)
  const arrowAngle = Math.PI / 6

  ctx.beginPath()
  ctx.moveTo(to.x, to.y)
  ctx.lineTo(
    to.x - headLength * Math.cos(angle - arrowAngle),
    to.y - headLength * Math.sin(angle - arrowAngle)
  )
  ctx.lineTo(
    to.x - headLength * Math.cos(angle + arrowAngle),
    to.y - headLength * Math.sin(angle + arrowAngle)
  )
  ctx.closePath()
  ctx.fill()
}

/**
 * Calculates default control point for curved arrow
 */
export function calculateCurvedArrowControlPoint(start: Point, end: Point): Point {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const distance = Math.hypot(dx, dy)
  const offset = distance * 0.25
  const mx = (start.x + end.x) / 2
  const my = (start.y + end.y) / 2
  const px = -dy / distance
  const py = dx / distance

  return {
    x: mx + px * offset,
    y: my + py * offset
  }
}

/**
 * Draws curved arrow path
 */
export function drawCurvedArrow(
  ctx: CanvasRenderingContext2D,
  start: Point,
  end: Point,
  controlPoint?: Point
): void {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const distance = Math.hypot(dx, dy)

  const offset = distance * 0.25
  const mx = (start.x + end.x) / 2
  const my = (start.y + end.y) / 2
  const px = -dy / distance
  const py = dx / distance

  const controlX = controlPoint?.x ?? mx + px * offset
  const controlY = controlPoint?.y ?? my + py * offset

  ctx.beginPath()
  ctx.moveTo(start.x, start.y)
  ctx.quadraticCurveTo(controlX, controlY, end.x, end.y)
  ctx.stroke()
}

/**
 * Draws elbowed arrow path
 */
export function drawElbowedArrow(
  ctx: CanvasRenderingContext2D,
  start: Point,
  end: Point
): void {
  const midX = (start.x + end.x) / 2

  ctx.beginPath()
  ctx.moveTo(start.x, start.y)
  ctx.lineTo(midX, start.y)
  ctx.lineTo(midX, end.y)
  ctx.lineTo(end.x, end.y)
  ctx.stroke()
}

/**
 * Gets the angle at the end of a curved arrow for proper arrow head placement
 */
export function getCurvedArrowEndAngle(
  start: Point,
  end: Point,
  isStart: boolean,
  controlPoint?: Point
): number {
  let control: Point
  if (controlPoint) {
    control = controlPoint
  } else {
    control = calculateCurvedArrowControlPoint(start, end)
  }

  if (isStart) {
    return Math.atan2(control.y - start.y, control.x - start.x)
  } else {
    return Math.atan2(end.y - control.y, end.x - control.x)
  }
}

/**
 * Draws an arrow element on the canvas
 */
export function drawArrow(ctx: CanvasRenderingContext2D, arrow: ArrowElement): void {
  ctx.globalAlpha = arrow.opacity
  ctx.strokeStyle = arrow.strokeColor
  ctx.lineWidth = arrow.strokeWidth
  ctx.setLineDash(arrow.strokeStyle === 'dashed' ? [5, 5] : arrow.strokeStyle === 'dotted' ? [2, 2] : [])

  if (arrow.arrowType === 'curved') {
    drawCurvedArrow(ctx, arrow.start, arrow.end, arrow.controlPoint)
  } else if (arrow.arrowType === 'elbowed') {
    drawElbowedArrow(ctx, arrow.start, arrow.end)
  } else {
    ctx.beginPath()
    ctx.moveTo(arrow.start.x, arrow.start.y)
    ctx.lineTo(arrow.end.x, arrow.end.y)
    ctx.stroke()
  }

  ctx.setLineDash([])

  ctx.fillStyle = arrow.strokeColor

  if (arrow.arrowStart) {
    if (arrow.arrowType === 'curved') {
      const angle = getCurvedArrowEndAngle(arrow.start, arrow.end, true, arrow.controlPoint)
      const headLength = arrow.strokeWidth * 6
      const arrowAngle = Math.PI / 6
      ctx.beginPath()
      ctx.moveTo(arrow.start.x, arrow.start.y)
      ctx.lineTo(
        arrow.start.x - headLength * Math.cos(angle - arrowAngle),
        arrow.start.y - headLength * Math.sin(angle - arrowAngle)
      )
      ctx.lineTo(
        arrow.start.x - headLength * Math.cos(angle + arrowAngle),
        arrow.start.y - headLength * Math.sin(angle + arrowAngle)
      )
      ctx.closePath()
      ctx.fill()
    } else if (arrow.arrowType === 'elbowed') {
      drawArrowHead(ctx, { x: arrow.start.x + 10, y: arrow.start.y }, arrow.start, arrow.strokeWidth)
    } else {
      drawArrowHead(ctx, arrow.end, arrow.start, arrow.strokeWidth)
    }
  }

  if (arrow.arrowEnd) {
    if (arrow.arrowType === 'curved') {
      const angle = getCurvedArrowEndAngle(arrow.start, arrow.end, false, arrow.controlPoint)
      const headLength = arrow.strokeWidth * 6
      const arrowAngle = Math.PI / 6
      ctx.beginPath()
      ctx.moveTo(arrow.end.x, arrow.end.y)
      ctx.lineTo(
        arrow.end.x - headLength * Math.cos(angle - arrowAngle),
        arrow.end.y - headLength * Math.sin(angle - arrowAngle)
      )
      ctx.lineTo(
        arrow.end.x - headLength * Math.cos(angle + arrowAngle),
        arrow.end.y - headLength * Math.sin(angle + arrowAngle)
      )
      ctx.closePath()
      ctx.fill()
    } else if (arrow.arrowType === 'elbowed') {
      drawArrowHead(ctx, { x: arrow.end.x - 10, y: arrow.end.y }, arrow.end, arrow.strokeWidth)
    } else {
      drawArrowHead(ctx, arrow.start, arrow.end, arrow.strokeWidth)
    }
  }

  ctx.globalAlpha = 1
}

/**
 * Draws a temporary arrow (while drawing)
 */
export function drawTempArrow(
  ctx: CanvasRenderingContext2D,
  start: { x: number; y: number },
  end: { x: number; y: number },
  options: ArrowOptions
): void {
  ctx.globalAlpha = options.opacity / 100
  ctx.strokeStyle = options.strokeColor
  ctx.lineWidth = options.strokeWidth
  ctx.setLineDash(options.strokeStyle === 'dashed' ? [5, 5] : options.strokeStyle === 'dotted' ? [2, 2] : [])

  if (options.arrowType === 'curved') {
    drawCurvedArrow(ctx, start, end)
  } else if (options.arrowType === 'elbowed') {
    drawElbowedArrow(ctx, start, end)
  } else {
    ctx.beginPath()
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(end.x, end.y)
    ctx.stroke()
  }

  ctx.setLineDash([])

  ctx.fillStyle = options.strokeColor
  if (options.arrowStart) {
    if (options.arrowType === 'curved') {
      const angle = getCurvedArrowEndAngle(start, end, true)
      const headLength = options.strokeWidth * 6
      const arrowAngle = Math.PI / 6
      ctx.beginPath()
      ctx.moveTo(start.x, start.y)
      ctx.lineTo(
        start.x - headLength * Math.cos(angle - arrowAngle),
        start.y - headLength * Math.sin(angle - arrowAngle)
      )
      ctx.lineTo(
        start.x - headLength * Math.cos(angle + arrowAngle),
        start.y - headLength * Math.sin(angle + arrowAngle)
      )
      ctx.closePath()
      ctx.fill()
    } else if (options.arrowType === 'elbowed') {
      drawArrowHead(ctx, { x: start.x + 10, y: start.y }, start, options.strokeWidth)
    } else {
      drawArrowHead(ctx, end, start, options.strokeWidth)
    }
  }
  if (options.arrowEnd) {
    if (options.arrowType === 'curved') {
      const angle = getCurvedArrowEndAngle(start, end, false)
      const headLength = options.strokeWidth * 6
      const arrowAngle = Math.PI / 6
      ctx.beginPath()
      ctx.moveTo(end.x, end.y)
      ctx.lineTo(
        end.x - headLength * Math.cos(angle - arrowAngle),
        end.y - headLength * Math.sin(angle - arrowAngle)
      )
      ctx.lineTo(
        end.x - headLength * Math.cos(angle + arrowAngle),
        end.y - headLength * Math.sin(angle + arrowAngle)
      )
      ctx.closePath()
      ctx.fill()
    } else if (options.arrowType === 'elbowed') {
      drawArrowHead(ctx, { x: end.x - 10, y: end.y }, end, options.strokeWidth)
    } else {
      drawArrowHead(ctx, start, end, options.strokeWidth)
    }
  }

  ctx.globalAlpha = 1
}