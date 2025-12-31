import type { Point } from '../shared'
import type { ArrowElement } from '../shared'
import { calculateCurvedArrowControlPoint } from './draw'

/**
 * Calculates distance from a point to a line segment
 */
function distanceToSegment(p: Point, a: Point, b: Point): number {

  const dx = b.x - a.x
  const dy = b.y - a.y
  const len2 = dx * dx + dy * dy

  if (len2 === 0) return Math.hypot(p.x - a.x, p.y - a.y)

  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2
  
  t = Math.max(0, Math.min(1, t))
  
  const projX = a.x + t * dx
  const projY = a.y + t * dy
  
  return Math.hypot(p.x - projX, p.y - projY)
}

/**
 * Checks if a point is near an arrow
 */
export function isPointNearArrow(point: Point, arrow: ArrowElement, tolerance = 5): boolean {

  if (arrow.arrowType === 'curved') {
    const control = arrow.controlPoint || calculateCurvedArrowControlPoint(arrow.start, arrow.end)
    const curvedTolerance = 10

    let minDist = Infinity
    for (let t = 0; t <= 1; t += 0.05) {
      const curveX = (1 - t) * (1 - t) * arrow.start.x + 2 * (1 - t) * t * control.x + t * t * arrow.end.x
      const curveY = (1 - t) * (1 - t) * arrow.start.y + 2 * (1 - t) * t * control.y + t * t * arrow.end.y
      const dist = Math.hypot(point.x - curveX, point.y - curveY)
      minDist = Math.min(minDist, dist)
    }

    return minDist < curvedTolerance

  } else if (arrow.arrowType === 'elbowed') {

    const midX = (arrow.start.x + arrow.end.x) / 2
    const seg1Dist = distanceToSegment(point, arrow.start, { x: midX, y: arrow.start.y })
    const seg2Dist = distanceToSegment(point, { x: midX, y: arrow.start.y }, { x: midX, y: arrow.end.y })
    const seg3Dist = distanceToSegment(point, { x: midX, y: arrow.end.y }, arrow.end)

    return Math.min(seg1Dist, seg2Dist, seg3Dist) < tolerance
  }

  const dist = distanceToSegment(point, arrow.start, arrow.end)

  return dist < tolerance
}

/**
 * Checks if a point is near the control point of a curved arrow
 */
export function isPointNearControlPoint(point: Point, arrow: ArrowElement, tolerance = 8): boolean {

  if (arrow.arrowType !== 'curved') return false

  let control: Point

  if (arrow.controlPoint) {

    control = arrow.controlPoint

  } else {
    control = calculateCurvedArrowControlPoint(arrow.start, arrow.end)
  }

  const dist = Math.hypot(point.x - control.x, point.y - control.y)

  return dist < tolerance
}

/**
 * Gets the resize handle at a given position
 */
export function getArrowResizeHandle(pos: Point, arrow: ArrowElement): string | null {

  const handleSize = 8
  const startDist = Math.hypot(pos.x - arrow.start.x, pos.y - arrow.start.y)
  const endDist = Math.hypot(pos.x - arrow.end.x, pos.y - arrow.end.y)

  if (startDist < handleSize) return 'start'
  if (endDist < handleSize) return 'end'
  
  return null
}