import type { CanvasElement } from '../shared'

export type Viewport = {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Checks if an element is visible in the viewport
 */
export function isElementInViewport(el: CanvasElement, viewport: Viewport): boolean {

  const padding = 100
  
  const viewportMinX = viewport.x - padding
  const viewportMaxX = viewport.x + viewport.width + padding
  const viewportMinY = viewport.y - padding
  const viewportMaxY = viewport.y + viewport.height + padding

  if (el.type === 'rect' || el.type === 'diamond' || el.type === 'image' || el.type === 'embed') {
    const elMaxX = el.x + el.width
    const elMaxY = el.y + el.height

    return !(elMaxX < viewportMinX || el.x > viewportMaxX || elMaxY < viewportMinY || el.y > viewportMaxY)

  } else if (el.type === 'circle') {

    const elMinX = el.x - el.radius
    const elMaxX = el.x + el.radius
    const elMinY = el.y - el.radius
    const elMaxY = el.y + el.radius

    return !(elMaxX < viewportMinX || elMinX > viewportMaxX || elMaxY < viewportMinY || elMinY > viewportMaxY)

  } else if (el.type === 'path' && el.bounds) {

    return !(el.bounds.maxX < viewportMinX || el.bounds.minX > viewportMaxX || el.bounds.maxY < viewportMinY || el.bounds.minY > viewportMaxY)

  } else if (el.type === 'line' || el.type === 'arrow') {

    const minX = Math.min(el.start.x, el.end.x)
    const maxX = Math.max(el.start.x, el.end.x)
    const minY = Math.min(el.start.y, el.end.y)
    const maxY = Math.max(el.start.y, el.end.y)

    return !(maxX < viewportMinX || minX > viewportMaxX || maxY < viewportMinY || minY > viewportMaxY)

  } else if (el.type === 'text') {

    const estimatedWidth = el.width || 200
    const estimatedHeight = el.height || el.fontSize * 1.2
    const elMaxX = el.x + estimatedWidth
    const elMaxY = el.y + estimatedHeight

    return !(elMaxX < viewportMinX || el.x > viewportMaxX || elMaxY < viewportMinY || el.y > viewportMaxY)
  } else if (el.type === 'frame') {
    const elMaxX = el.x + el.width
    const elMaxY = el.y + el.height

    return !(elMaxX < viewportMinX || el.x > viewportMaxX || elMaxY < viewportMinY || el.y > viewportMaxY)
  }
  
  return true
}

/**
 * Calculates viewport bounds from transform state
 */
export function calculateViewport(
  transformState: { positionX: number; positionY: number; scale: number } | null,
  containerWidth: number | undefined,
  containerHeight: number | undefined
): Viewport | null {
    
  if (!transformState) return null
  
  const viewportWidth = (containerWidth || 1920) / transformState.scale
  const viewportHeight = (containerHeight || 1080) / transformState.scale
  const viewportX = -transformState.positionX / transformState.scale
  const viewportY = -transformState.positionY / transformState.scale
  
  return {
    x: viewportX,
    y: viewportY,
    width: viewportWidth,
    height: viewportHeight
  }
}