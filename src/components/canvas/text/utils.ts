import type { Point } from '../shared'
import type { TextElement } from '../shared'

/**
 * Estimates text dimensions using stored values or font-based calculation
 */
export function getTextDimensions(text: TextElement): { width: number; height: number } {
  const lines = text.text.split('\n')
  const lineHeight = text.fontSize * 1.2

  if (text.width && text.width > 0 && text.height && text.height > 0) {
    return { width: text.width, height: text.height }
  }

  const maxLineLength = Math.max(...lines.map(l => l.length), 1)
  const estimatedWidth = text.width || maxLineLength * text.fontSize * 0.6
  const estimatedHeight = text.height || lines.length * lineHeight

  return { width: estimatedWidth, height: estimatedHeight }
}

/**
 * Checks if a point is inside a text element
 */
export function isPointInText(point: Point, text: TextElement): boolean {

  const { width, height } = getTextDimensions(text)

  return point.x >= text.x && point.x <= text.x + width && point.y >= text.y && point.y <= text.y + height
}

/**
 * Gets the resize handle at a given position
 */
export function getTextResizeHandle(pos: Point, text: TextElement): string | null {
  const { width: boxWidth, height: boxHeight } = getTextDimensions(text)

  const boxX = text.x
  const boxY = text.y

  const handleSize = 8

  const handles = [
    { x: boxX, y: boxY, id: 'tl' },
    { x: boxX + boxWidth, y: boxY, id: 'tr' },
    { x: boxX, y: boxY + boxHeight, id: 'bl' },
    { x: boxX + boxWidth, y: boxY + boxHeight, id: 'br' },
  ]

  for (const handle of handles) {
    if (Math.abs(pos.x - handle.x) < handleSize && Math.abs(pos.y - handle.y) < handleSize) {
      return handle.id
    }
  }
  return null
}