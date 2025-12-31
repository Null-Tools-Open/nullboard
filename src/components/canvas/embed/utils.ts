import type { Point } from '../shared'
import type { EmbedElement } from '../shared'

/**
 * Checks if a point is on the border of an embed element
 */
export function isPointOnEmbedBorder(point: Point, embed: EmbedElement): boolean {
    
  const borderTolerance = 30
  
  const extendedLeft = embed.x - borderTolerance
  const extendedRight = embed.x + embed.width + borderTolerance
  const extendedTop = embed.y - borderTolerance
  const extendedBottom = embed.y + embed.height + borderTolerance
  
  if (point.x < extendedLeft || point.x > extendedRight ||
      point.y < extendedTop || point.y > extendedBottom) {
    return false
  }
  
  const distToLeft = point.x - embed.x
  const distToRight = embed.x + embed.width - point.x
  const distToTop = point.y - embed.y
  const distToBottom = embed.y + embed.height - point.y
  
  const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom)
  
  return Math.abs(minDist) <= borderTolerance
}