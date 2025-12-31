import type { Point } from '../shared'
import type { ImageElement } from '../shared'

/**
 * Checks if a point is inside an image element
 */
export function isPointInImage(point: Point, image: ImageElement): boolean {
  return point.x >= image.x && point.x <= image.x + image.width && point.y >= image.y && point.y <= image.y + image.height
}

/**
 * Gets the resize handle at a given position
 */
export function getImageResizeHandle(pos: Point, el: ImageElement): string | null {

  const handleSize = 8
  
  const handles = [
    { x: el.x, y: el.y, id: 'tl' },
    { x: el.x + el.width, y: el.y, id: 'tr' },
    { x: el.x, y: el.y + el.height, id: 'bl' },
    { x: el.x + el.width, y: el.y + el.height, id: 'br' },
  ]

  for (const handle of handles) {
    if (Math.abs(pos.x - handle.x) < handleSize && Math.abs(pos.y - handle.y) < handleSize) {
      return handle.id
    }
  }

  return null
}