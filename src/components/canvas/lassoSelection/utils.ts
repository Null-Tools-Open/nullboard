import type { Point, CanvasElement } from '../shared'

/**
 * Point-in-polygon algorithm using ray casting
 * Returns true if point is inside the polygon defined by points
 */
export function isPointInPolygon(point: Point, polygon: Point[]): boolean {
  if (polygon.length < 3) return false

  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x
    const yi = polygon[i].y
    const xj = polygon[j].x
    const yj = polygon[j].y

    const intersect = ((yi > point.y) !== (yj > point.y)) &&
      (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)

    if (intersect) {
      inside = !inside
    }
  }

  return inside
}

/**
 * Auto-close lasso path by connecting last point to first point
 */
export function closeLassoPath(path: Point[]): Point[] {

  if (path.length < 2) return path

  if (path.length === 2) {

    return path
  }

  return [...path, path[0]]
}

/**
 * Check if an element is inside the lasso path
 */
export function isElementInLasso(
  el: CanvasElement,
  lassoPath: Point[],
  canvas?: HTMLCanvasElement | null
): boolean {
  if (lassoPath.length < 3) return false

  const closedPath = closeLassoPath(lassoPath)

  if (el.type === 'rect') {

    const corners = [
      { x: el.x, y: el.y },
      { x: el.x + el.width, y: el.y },
      { x: el.x + el.width, y: el.y + el.height },
      { x: el.x, y: el.y + el.height }
    ]

    const center = { x: el.x + el.width / 2, y: el.y + el.height / 2 }

    return isPointInPolygon(center, closedPath) ||
      corners.some(corner => isPointInPolygon(corner, closedPath))

  } else if (el.type === 'diamond') {

    const cx = el.x + el.width / 2
    const cy = el.y + el.height / 2
    const center = { x: cx, y: cy }

    const corners = [
      { x: cx, y: el.y },
      { x: el.x + el.width, y: cy },
      { x: cx, y: el.y + el.height },
      { x: el.x, y: cy }
    ]

    return isPointInPolygon(center, closedPath) ||
      corners.some(corner => isPointInPolygon(corner, closedPath))

  } else if (el.type === 'circle') {

    const center = { x: el.x, y: el.y }

    if (isPointInPolygon(center, closedPath)) return true

    for (let angle = 0; angle < 360; angle += 45) {

      const rad = (angle * Math.PI) / 180
      const checkPoint = {
        x: center.x + el.radius * Math.cos(rad),
        y: center.y + el.radius * Math.sin(rad)
      }

      if (isPointInPolygon(checkPoint, closedPath)) return true
    }
    return false
  } else if (el.type === 'path') {

    if (el.points.length === 0) return false

    const center = el.bounds
      ? { x: (el.bounds.minX + el.bounds.maxX) / 2, y: (el.bounds.minY + el.bounds.maxY) / 2 } : el.points[Math.floor(el.points.length / 2)]

    return isPointInPolygon(center, closedPath) || el.points.some(point => isPointInPolygon(point, closedPath))

  } else if (el.type === 'line') {

    const startInside = isPointInPolygon(el.start, closedPath)
    const endInside = isPointInPolygon(el.end, closedPath)
    const midPoint = { x: (el.start.x + el.end.x) / 2, y: (el.start.y + el.end.y) / 2 }
    const midInside = isPointInPolygon(midPoint, closedPath)

    return startInside || endInside || midInside
  } else if (el.type === 'arrow') {

    const startInside = isPointInPolygon(el.start, closedPath)
    const endInside = isPointInPolygon(el.end, closedPath)
    const midPoint = { x: (el.start.x + el.end.x) / 2, y: (el.start.y + el.end.y) / 2 }
    const midInside = isPointInPolygon(midPoint, closedPath)

    return startInside || endInside || midInside
  } else if (el.type === 'text') {

    const lines = el.text.split('\n')
    const lineHeight = el.fontSize * 1.2
    const boxWidth = el.width && el.width > 0 ? el.width : Math.max(...lines.map(l => l.length), 1) * el.fontSize * 0.6
    const boxHeight = el.height && el.height > 0 ? el.height : lines.length * lineHeight
    const center = { x: el.x + boxWidth / 2, y: el.y + boxHeight / 2 }

    return isPointInPolygon(center, closedPath)

  } else if (el.type === 'image' || el.type === 'embed' || el.type === 'sticker') {

    const center = { x: el.x + el.width / 2, y: el.y + el.height / 2 }

    const corners = [
      { x: el.x, y: el.y },
      { x: el.x + el.width, y: el.y },
      { x: el.x + el.width, y: el.y + el.height },
      { x: el.x, y: el.y + el.height }
    ]

    return isPointInPolygon(center, closedPath) || corners.some(corner => isPointInPolygon(corner, closedPath))
  }

  return false
}