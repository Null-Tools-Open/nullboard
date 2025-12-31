import type { Point } from '../shared'
import type { PathElement } from './types'

/**
 * Calculates bounds for a path
 */
export function calculatePathBounds(points: Point[]): { minX: number; minY: number; maxX: number; maxY: number } {

  if (points.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 }

  let minX = points[0].x, minY = points[0].y, maxX = points[0].x, maxY = points[0].y

  points.forEach(p => {
    if (p.x < minX) minX = p.x
    if (p.y < minY) minY = p.y
    if (p.x > maxX) maxX = p.x
    if (p.y > maxY) maxY = p.y
  })
  return { minX, minY, maxX, maxY }
}

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
 * Checks if a point is near a path
 */
export function isPointNearPath(point: Point, path: PathElement, tolerance = 5): boolean {

  if (!path.bounds) return false

  const maxTolerance = tolerance + path.width + 5

  if (point.x < path.bounds.minX - maxTolerance || point.x > path.bounds.maxX + maxTolerance ||
    point.y < path.bounds.minY - maxTolerance || point.y > path.bounds.maxY + maxTolerance) {
    return false
  }

  for (let i = 0; i < path.points.length - 1; i++) {
    const p1 = path.points[i]
    const p2 = path.points[i + 1]
    const dist = distanceToSegment(point, p1, p2)

    let effectiveWidth = tolerance

    if (p1.pressure !== undefined && p2.pressure !== undefined) {
      const maxPressure = Math.max(p1.pressure, p2.pressure)
      const radius = (maxPressure * path.width) + 1
      effectiveWidth = radius + tolerance
    } else {
      effectiveWidth = (path.width / 2) + tolerance
    }

    if (dist < effectiveWidth) return true
  }

  return false
}

/**
 * Gets the resize handle at a given position for a path
 */
export function getPathResizeHandle(pos: Point, path: PathElement): string | null {
  if (!path.bounds) return null

  const { minX, minY, maxX, maxY } = path.bounds
  const width = maxX - minX
  const height = maxY - minY
  const handleSize = 8

  const handles = [
    { x: minX, y: minY, id: 'tl' },
    { x: maxX, y: minY, id: 'tr' },
    { x: minX, y: maxY, id: 'bl' },
    { x: maxX, y: maxY, id: 'br' },
    { x: minX, y: minY + height / 2, id: 'l' },
    { x: maxX, y: minY + height / 2, id: 'r' },
    { x: minX + width / 2, y: minY, id: 't' },
    { x: minX + width / 2, y: maxY, id: 'b' },
  ]

  for (const handle of handles) {
    if (Math.abs(pos.x - handle.x) < handleSize && Math.abs(pos.y - handle.y) < handleSize) {
      return handle.id
    }
  }
  return null
}