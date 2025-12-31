import type { Point } from '../shared'
import type { CircleElement } from '../shared'

/**
 * Checks if a point is inside a circle
 */
export function isPointInCircle(point: Point, circle: CircleElement): boolean {
    
  const dx = point.x - circle.x
  const dy = point.y - circle.y
  const distance = Math.hypot(dx, dy)
  return distance <= circle.radius
}

/**
 * Gets the resize handle at a given position
 */
export function getCircleResizeHandle(pos: Point, el: CircleElement): string | null {

  const handleSize = 8
  const handleX = el.x + el.radius
  const handleY = el.y

  if (Math.abs(pos.x - handleX) < handleSize && Math.abs(pos.y - handleY) < handleSize) {
    return 'r'
  }

  return null
}