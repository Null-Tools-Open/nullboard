import type { Point } from '../shared'
import type { RectElement, ImageElement, EmbedElement, StickerElement, StickyNoteElement } from '../shared'

/**
 * Gets the resize handle at a given position
 */
export function getResizeHandle(pos: Point, el: RectElement | ImageElement | EmbedElement | StickerElement | StickyNoteElement): string | null {

  const handleSize = 8

  const handles = [
    { x: el.x, y: el.y, id: 'tl' },
    { x: el.x + el.width, y: el.y, id: 'tr' },
    { x: el.x, y: el.y + el.height, id: 'bl' },
    { x: el.x + el.width, y: el.y + el.height, id: 'br' },
    { x: el.x, y: el.y + el.height / 2, id: 'l' },
    { x: el.x + el.width, y: el.y + el.height / 2, id: 'r' },
    { x: el.x + el.width / 2, y: el.y, id: 't' },
    { x: el.x + el.width / 2, y: el.y + el.height, id: 'b' },
  ]

  for (const handle of handles) {
    if (Math.abs(pos.x - handle.x) < handleSize && Math.abs(pos.y - handle.y) < handleSize) {
      return handle.id
    }
  }
  return null
}