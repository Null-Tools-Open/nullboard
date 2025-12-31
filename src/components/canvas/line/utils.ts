import type { Point } from '../shared'
import type { LineElement } from '../shared'
import { distanceToSegment } from '../shared'

/**
 * Checks if a point is near a line
 */
export function isPointNearLine(point: Point, line: LineElement, tolerance = 5): boolean {
    
  const dist = distanceToSegment(point, line.start, line.end)
  return dist < tolerance
}

/**
 * Gets the resize handle at a given position
 */
export function getLineResizeHandle(pos: Point, line: LineElement): string | null {

  const handleSize = 8
  const startDist = Math.hypot(pos.x - line.start.x, pos.y - line.start.y)
  const endDist = Math.hypot(pos.x - line.end.x, pos.y - line.end.y)
  
  if (startDist < handleSize) return 'start'
  if (endDist < handleSize) return 'end'

  return null
}