export type Point = { x: number; y: number; pressure?: number }

export type PathElement = {
  id: string
  type: 'path'
  points: Point[]
  color: string
  width: number
  opacity: number
  bounds?: { minX: number; minY: number; maxX: number; maxY: number }
}

export type RectElement = {
  id: string
  type: 'rect'
  x: number
  y: number
  width: number
  height: number
  strokeColor: string
  fillColor?: string
  strokeWidth: number
  strokeStyle: 'solid' | 'dashed' | 'dotted' | 'wavy'
  opacity: number
}

export type DiamondElement = {
  id: string
  type: 'diamond'
  x: number
  y: number
  width: number
  height: number
  strokeColor: string
  fillColor?: string
  strokeWidth: number
  strokeStyle: 'solid' | 'dashed' | 'dotted' | 'wavy'
  opacity: number
}

export type CircleElement = {
  id: string
  type: 'circle'
  x: number
  y: number
  radius: number
  strokeColor: string
  fillColor?: string
  strokeWidth: number
  strokeStyle: 'solid' | 'dashed' | 'dotted' | 'wavy'
  opacity: number
}

export type LineElement = {
  id: string
  type: 'line'
  start: Point
  end: Point
  strokeColor: string
  strokeWidth: number
  strokeStyle: 'solid' | 'dashed' | 'dotted' | 'wavy'
  opacity: number
}

export type ArrowElement = {
  id: string
  type: 'arrow'
  start: Point
  end: Point
  strokeColor: string
  strokeWidth: number
  strokeStyle: 'solid' | 'dashed' | 'dotted'
  arrowStart: boolean
  arrowEnd: boolean
  arrowType: 'straight' | 'curved' | 'elbowed'
  controlPoint?: Point
  opacity: number
}

export type TextElement = {
  id: string
  type: 'text'
  x: number
  y: number
  text: string
  color: string
  fontSize: number
  fontFamily: string
  fontWeight: 'normal' | 'bold'
  fontStyle: 'hand-drawn' | 'normal' | 'code' | 'n-dot'
  textAlign: 'left' | 'center' | 'right'
  opacity: number
  width?: number
  height?: number
}

export type ImageElement = {
  id: string
  type: 'image'
  x: number
  y: number
  width: number
  height: number
  src: string
  opacity: number
  cornerStyle?: 'sharp' | 'rounded'
}

export type FrameElement = {
  id: string
  type: 'frame'
  x: number
  y: number
  width: number
  height: number
  layer: number
  opacity: number
  name?: string
}

export type EmbedElement = {
  id: string
  type: 'embed'
  x: number
  y: number
  width: number
  height: number
  url?: string
  opacity: number
}

export type StickerElement = {
  id: string
  type: 'sticker'
  x: number
  y: number
  width: number
  height: number
  src: string
  opacity: number
  cornerStyle?: 'sharp' | 'rounded'
}

export type CanvasElement = PathElement | RectElement | DiamondElement | CircleElement | LineElement | ArrowElement | TextElement | ImageElement | FrameElement | EmbedElement | StickerElement

/**
 * Converts screen coordinates to world coordinates
 */
export function toWorld(
  // I think we should rename function "toWorld" to "toCanvas" because it's more intuitive idk tho
  e: React.MouseEvent | MouseEvent,
  container: HTMLElement,
  transformState: { positionX: number; positionY: number; scale: number }
): Point {
  const rect = container.getBoundingClientRect()
  const x = (e.clientX - rect.left - transformState.positionX) / transformState.scale
  const y = (e.clientY - rect.top - transformState.positionY) / transformState.scale
  return { x, y }
}

/**
 * Converts world coordinates to screen coordinates
 */
export function toScreen(
  point: Point,
  transformState: { positionX: number; positionY: number; scale: number }
): Point {
  return {
    x: point.x * transformState.scale + transformState.positionX,
    y: point.y * transformState.scale + transformState.positionY,
  }
}

/**
 * Calculates distance between two points
 */
export function distance(p1: Point, p2: Point): number {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y)
}

/**
 * Checks if a point is near another point within tolerance
 */
export function isPointNear(point: Point, target: Point, tolerance: number = 5): boolean {
  return distance(point, target) < tolerance
}

/**
 * Calculates distance from a point to a line segment
 */
export function distanceToSegment(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len2 = dx * dx + dy * dy
  if (len2 === 0) return Math.hypot(p.x - a.x, p.y - a.y)
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2
  t = Math.max(0, Math.min(1, t))
  const projX = a.x + t * dx
  const projY = a.y + t * dy
  return Math.hypot(p.x - projX, p.y - projY)
}

/**
 * Snaps a line to 45 angles when Shift is pressed
 */
export function snapToAngle(start: Point, end: Point): Point {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const angle = Math.atan2(dy, dx)
  const dist = Math.hypot(dx, dy)

  const snapAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4)

  return {
    x: start.x + dist * Math.cos(snapAngle),
    y: start.y + dist * Math.sin(snapAngle)
  }
}