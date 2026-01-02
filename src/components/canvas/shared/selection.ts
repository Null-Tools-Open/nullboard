import type { Point, CanvasElement, RectElement, DiamondElement, CircleElement, PathElement, LineElement, ArrowElement, TextElement, ImageElement, FrameElement, EmbedElement } from '../shared'
import { distanceToSegment } from '../shared'
import { isPointInDiamond } from '../diamond'

function lineIntersectsLine(a: Point, b: Point, c: Point, d: Point) {
  const det = (b.x - a.x) * (d.y - c.y) - (d.x - c.x) * (b.y - a.y);
  if (det === 0) return false;
  const lambda = ((d.y - c.y) * (d.x - a.x) + (c.x - d.x) * (d.y - a.y)) / det;
  const gamma = ((a.y - b.y) * (d.x - a.x) + (b.x - a.x) * (d.y - a.y)) / det;
  return (0 <= lambda && lambda <= 1) && (0 <= gamma && gamma <= 1);
}

function segmentIntersectsRect(p1: Point, p2: Point, minX: number, minY: number, maxX: number, maxY: number) {
  if ((p1.x >= minX && p1.x <= maxX && p1.y >= minY && p1.y <= maxY) ||
    (p2.x >= minX && p2.x <= maxX && p2.y >= minY && p2.y <= maxY)) {
    return true;
  }
  const tl = { x: minX, y: minY };
  const tr = { x: maxX, y: minY };
  const bl = { x: minX, y: maxY };
  const br = { x: maxX, y: maxY };

  return lineIntersectsLine(p1, p2, tl, tr) ||
    lineIntersectsLine(p1, p2, tr, br) ||
    lineIntersectsLine(p1, p2, br, bl) ||
    lineIntersectsLine(p1, p2, bl, tl);
}

/**
 * Checks if an element is inside a selection box
 */
export function isElementInBox(
  el: CanvasElement,
  box: { start: Point; end: Point },
  canvas?: HTMLCanvasElement | null
): boolean {
  const minX = Math.min(box.start.x, box.end.x)
  const maxX = Math.max(box.start.x, box.end.x)
  const minY = Math.min(box.start.y, box.end.y)
  const maxY = Math.max(box.start.y, box.end.y)

  if (el.type === 'rect') {
    return !(el.x + el.width < minX || el.x > maxX || el.y + el.height < minY || el.y > maxY)
  } else if (el.type === 'path' && el.bounds) {
    if (el.bounds.maxX < minX || el.bounds.minX > maxX || el.bounds.maxY < minY || el.bounds.minY > maxY) {
      return false
    }

    for (let i = 0; i < el.points.length - 1; i++) {
      if (segmentIntersectsRect(el.points[i], el.points[i + 1], minX, minY, maxX, maxY)) {
        return true
      }
    }
    return false

  } else if (el.type === 'diamond') {
    const cx = el.x + el.width / 2
    const cy = el.y + el.height / 2
    const top = { x: cx, y: el.y }
    const right = { x: el.x + el.width, y: cy }
    const bottom = { x: cx, y: el.y + el.height }
    const left = { x: el.x, y: cy }

    const points = [top, right, bottom, left]
    for (const p of points) {
      if (p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY) return true
    }

    const boxCenter = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 }
    if (isPointInDiamond(boxCenter, el)) return true

    return false
  } else if (el.type === 'circle') {
    const closestX = Math.max(minX, Math.min(el.x, maxX))
    const closestY = Math.max(minY, Math.min(el.y, maxY))

    const dx = el.x - closestX
    const dy = el.y - closestY
    const dist = Math.hypot(dx, dy)

    return dist <= el.radius
  } else if (el.type === 'line') {
    const startInBox = el.start.x >= minX && el.start.x <= maxX && el.start.y >= minY && el.start.y <= maxY
    const endInBox = el.end.x >= minX && el.end.x <= maxX && el.end.y >= minY && el.end.y <= maxY

    if (startInBox || endInBox) return true

    const boxPoints = [
      { x: minX, y: minY }, { x: maxX, y: minY },
      { x: maxX, y: maxY }, { x: minX, y: maxY }
    ]

    for (const point of boxPoints) {
      const dist = distanceToSegment(point, el.start, el.end)
      if (dist < 1) return true
    }

    return false
  } else if (el.type === 'arrow') {
    const startInBox = el.start.x >= minX && el.start.x <= maxX && el.start.y >= minY && el.start.y <= maxY
    const endInBox = el.end.x >= minX && el.end.x <= maxX && el.end.y >= minY && el.end.y <= maxY

    if (startInBox || endInBox) return true

    const boxPoints = [
      { x: minX, y: minY }, { x: maxX, y: minY },
      { x: maxX, y: maxY }, { x: minX, y: maxY }
    ]

    for (const point of boxPoints) {
      if (el.arrowType === 'curved') {
        const dx = el.end.x - el.start.x
        const dy = el.end.y - el.start.y
        const dist = Math.hypot(dx, dy)
        const offset = dist * 0.25
        const mx = (el.start.x + el.end.x) / 2
        const my = (el.start.y + el.end.y) / 2
        const px = -dy / dist
        const py = dx / dist
        const controlX = mx + px * offset
        const controlY = my + py * offset

        for (let t = 0; t <= 1; t += 0.1) {
          const curveX = (1 - t) * (1 - t) * el.start.x + 2 * (1 - t) * t * controlX + t * t * el.end.x
          const curveY = (1 - t) * (1 - t) * el.start.y + 2 * (1 - t) * t * controlY + t * t * el.end.y
          if (curveX >= minX && curveX <= maxX && curveY >= minY && curveY <= maxY) {
            return true
          }
        }
      } else if (el.arrowType === 'elbowed') {
        const midX = (el.start.x + el.end.x) / 2
        const seg1Dist = distanceToSegment(point, el.start, { x: midX, y: el.start.y })
        const seg2Dist = distanceToSegment(point, { x: midX, y: el.start.y }, { x: midX, y: el.end.y })
        const seg3Dist = distanceToSegment(point, { x: midX, y: el.end.y }, el.end)
        if (Math.min(seg1Dist, seg2Dist, seg3Dist) < 1) return true
      } else {
        const dist = distanceToSegment(point, el.start, el.end)
        if (dist < 1) return true
      }
    }

    return false
  } else if (el.type === 'text') {
    const lines = el.text.split('\n')
    const lineHeight = el.fontSize * 1.2
    const textHeight = el.height && el.height > 0 ? el.height : lines.length * lineHeight
    const textWidth = el.width && el.width > 0 ? el.width : Math.max(...lines.map(l => l.length), 1) * el.fontSize * 0.6

    return !(el.x + textWidth < minX || el.x > maxX || el.y + textHeight < minY || el.y > maxY)
  } else if (el.type === 'image') {
    return !(el.x + el.width < minX || el.x > maxX || el.y + el.height < minY || el.y > maxY)
  } else if (el.type === 'frame') {
    return !(el.x + el.width < minX || el.x > maxX || el.y + el.height < minY || el.y > maxY)
  } else if (el.type === 'embed') {
    return !(el.x + el.width < minX || el.x > maxX || el.y + el.height < minY || el.y > maxY)
  } else if (el.type === 'sticker') {
    return !(el.x + el.width < minX || el.x > maxX || el.y + el.height < minY || el.y > maxY)
  } else if (el.type === 'stickyNote') {
    return !(el.x + el.width < minX || el.x > maxX || el.y + el.height < minY || el.y > maxY)
  }

  return false
}