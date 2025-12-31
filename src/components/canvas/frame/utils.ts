import type { Point, CanvasElement, FrameElement } from '../shared'

/**
 * Checks if a point is on the frame border (for selection)
 * Selection works only on the border (not in the center) to allow clicking elements inside
 */
export function isPointOnFrameBorder(point: Point, frame: FrameElement): boolean {
  const borderTolerance = 12
  
  if (point.x < frame.x || point.x > frame.x + frame.width ||
      point.y < frame.y || point.y > frame.y + frame.height) {
    return false
  }
  
  const distToLeft = point.x - frame.x
  const distToRight = frame.x + frame.width - point.x
  const distToTop = point.y - frame.y
  const distToBottom = frame.y + frame.height - point.y
  
  const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom)
  
  if (minDist > borderTolerance) {
    return false
  }
  
  const centerX = frame.x + frame.width / 2
  const centerY = frame.y + frame.height / 2
  
  const distFromCenterX = Math.abs(point.x - centerX)
  const distFromCenterY = Math.abs(point.y - centerY)
  
  const centerThresholdX = frame.width * 0.3
  const centerThresholdY = frame.height * 0.3
  
  if (distFromCenterX < centerThresholdX && distFromCenterY < centerThresholdY) {
    return false
  }
  
  const normalizedDistX = distFromCenterX / (frame.width / 2)
  const normalizedDistY = distFromCenterY / (frame.height / 2)
  const minNormalizedDist = Math.min(normalizedDistX, normalizedDistY)
  
  if (minNormalizedDist < 0.3) {
    return false
  }
  
  return true
}

/**
 * Checks if a point is anywhere on the frame
 */
export function isPointOnFrame(point: Point, frame: FrameElement): boolean {

  return (
    point.x >= frame.x &&
    point.x <= frame.x + frame.width &&
    point.y >= frame.y &&
    point.y <= frame.y + frame.height
  )
}

/**
 * Checks if a point is inside a frame
 */
export function isPointInFrame(point: Point, frame: FrameElement): boolean {

  return (
    point.x >= frame.x &&
    point.x <= frame.x + frame.width &&
    point.y >= frame.y &&
    point.y <= frame.y + frame.height
  )
}

/**
 * Gets the resize handle at a given position for a frame
 */
export function getFrameResizeHandle(pos: Point, frame: FrameElement): string | null {

  const handleSize = 8
  
  const handles = [
    { x: frame.x, y: frame.y, id: 'tl' },
    { x: frame.x + frame.width, y: frame.y, id: 'tr' },
    { x: frame.x, y: frame.y + frame.height, id: 'bl' },
    { x: frame.x + frame.width, y: frame.y + frame.height, id: 'br' },
    { x: frame.x, y: frame.y + frame.height / 2, id: 'l' },
    { x: frame.x + frame.width, y: frame.y + frame.height / 2, id: 'r' },
    { x: frame.x + frame.width / 2, y: frame.y, id: 't' },
    { x: frame.x + frame.width / 2, y: frame.y + frame.height, id: 'b' },
  ]

  for (const handle of handles) {

    if (Math.abs(pos.x - handle.x) < handleSize && Math.abs(pos.y - handle.y) < handleSize) {

      return handle.id
    }
  }
  return null
}

/**
 * Checks if an element is inside a frame
 */
export function isElementInFrame(element: CanvasElement, frame: FrameElement): boolean {

  if (element.type === 'rect' || element.type === 'diamond' || element.type === 'text' || element.type === 'image' || element.type === 'embed') {
    const centerX = element.x + (element.width || 0) / 2
    const centerY = element.y + (element.height || 0) / 2

    return isPointInFrame({ x: centerX, y: centerY }, frame)

  } else if (element.type === 'circle') {

    return isPointInFrame({ x: element.x, y: element.y }, frame)

  } else if (element.type === 'path') {

    if (element.points.length === 0) return false

    const center = element.bounds
      ? { x: (element.bounds.minX + element.bounds.maxX) / 2, y: (element.bounds.minY + element.bounds.maxY) / 2 } : element.points[Math.floor(element.points.length / 2)]

    return isPointInFrame(center, frame)

  } else if (element.type === 'line' || element.type === 'arrow') {

    const centerX = (element.start.x + element.end.x) / 2
    const centerY = (element.start.y + element.end.y) / 2

    return isPointInFrame({ x: centerX, y: centerY }, frame)
  }

  return false
}

/**
 * Gets the frame that contains an element
 */
export function getElementFrame(
  element: CanvasElement,
  frames: FrameElement[]
): FrameElement | null {
    
  const containingFrames = frames
    .filter(frame => isElementInFrame(element, frame))
    .sort((a, b) => b.layer - a.layer)
  
  return containingFrames.length > 0 ? containingFrames[0] : null
}

/**
 * Gets all elements inside a frame
 */
export function getFrameElements(
  frame: FrameElement,
  elements: CanvasElement[]
): CanvasElement[] {
  return elements.filter(el => el.type !== 'frame' && isElementInFrame(el, frame))
}