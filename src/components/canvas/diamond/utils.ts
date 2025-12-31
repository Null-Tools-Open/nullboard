import type { Point } from '../shared'
import type { DiamondElement } from '../shared'

/**
 * Checks if a point is inside a diamond
 */
export function isPointInDiamond(point: Point, diamond: DiamondElement): boolean {
    
  const centerX = diamond.x + diamond.width / 2
  const centerY = diamond.y + diamond.height / 2
  const dx = Math.abs(point.x - centerX)
  const dy = Math.abs(point.y - centerY)
  const hw = diamond.width / 2
  const hh = diamond.height / 2
  return (dx / hw + dy / hh) <= 1
}

/**
 * Gets the resize handle at a given position
 */
export function getDiamondResizeHandle(pos: Point, el: DiamondElement): string | null {

  const handleSize = 8
  const centerX = el.x + el.width / 2
  const centerY = el.y + el.height / 2
  const handles = [
    { x: centerX, y: el.y, id: 't' },
    { x: el.x + el.width, y: centerY, id: 'r' },
    { x: centerX, y: el.y + el.height, id: 'b' },
    { x: el.x, y: centerY, id: 'l' },
  ]

  for (const handle of handles) {
    if (Math.abs(pos.x - handle.x) < handleSize && Math.abs(pos.y - handle.y) < handleSize) {
      return handle.id
    }
  }
  return null
}