import type { CanvasElement, RectElement, DiamondElement, CircleElement, LineElement, ArrowElement, PathElement, TextElement, FrameElement, EmbedElement } from '../shared'
import { calculatePathBounds } from '../pen/utils'

/**
 * Generates test workspace with all available element types in various configurations
 */
export function generateTestWorkspace(): CanvasElement[] {
  const elements: CanvasElement[] = []
  let x = 50
  let y = 50
  const spacing = 550
  const rowHeight = 450
  let currentRow = 0

  const nextPos = () => {
    const pos = { x: x, y: y + currentRow * rowHeight }
    x += spacing
    if (x > 3000) {
      x = 50
      currentRow++
    }
    return pos
  }

  const rectStyles: Array<'solid' | 'dashed' | 'dotted' | 'wavy'> = ['solid', 'dashed', 'dotted', 'wavy']
  rectStyles.forEach((style, i) => {
    const pos = nextPos()
    const rect: RectElement = {
      id: `rect-${Date.now()}-${i}`,
      type: 'rect',
      x: pos.x,
      y: pos.y,
      width: 100 + i * 20,
      height: 80 + i * 15,
      strokeColor: '#000000',
      fillColor: i % 2 === 0 ? undefined : '#f0f0f0',
      strokeWidth: 2 + i,
      strokeStyle: style,
      opacity: 1
    }
    elements.push(rect)
  })

  rectStyles.forEach((style, i) => {
    const pos = nextPos()
    const diamond: DiamondElement = {
      id: `diamond-${Date.now()}-${i}`,
      type: 'diamond',
      x: pos.x,
      y: pos.y,
      width: 100 + i * 20,
      height: 100 + i * 20,
      strokeColor: '#000000',
      fillColor: i % 2 === 0 ? undefined : '#f0f0f0',
      strokeWidth: 2 + i,
      strokeStyle: style,
      opacity: 1
    }
    elements.push(diamond)
  })

  rectStyles.forEach((style, i) => {
    const pos = nextPos()
    const circle: CircleElement = {
      id: `circle-${Date.now()}-${i}`,
      type: 'circle',
      x: pos.x,
      y: pos.y,
      radius: 40 + i * 10,
      strokeColor: '#000000',
      fillColor: i % 2 === 0 ? undefined : '#f0f0f0',
      strokeWidth: 2 + i,
      strokeStyle: style,
      opacity: 1
    }
    elements.push(circle)
  })

  rectStyles.forEach((style, i) => {
    const pos = nextPos()
    const angle = (i * 45) % 360
    const length = 100
    const endX = pos.x + length * Math.cos(angle * Math.PI / 180)
    const endY = pos.y + length * Math.sin(angle * Math.PI / 180)
    const line: LineElement = {
      id: `line-${Date.now()}-${i}`,
      type: 'line',
      start: { x: pos.x, y: pos.y },
      end: { x: endX, y: endY },
      strokeColor: '#000000',
      strokeWidth: 2 + i,
      strokeStyle: style,
      opacity: 1
    }
    elements.push(line)
  })

  const arrowTypes: Array<'straight' | 'curved' | 'elbowed'> = ['straight', 'curved', 'elbowed']
  arrowTypes.forEach((arrowType, i) => {
    const pos = nextPos()
    const endX = pos.x + 120
    const endY = pos.y + (i * 30 - 30)
    const arrow: ArrowElement = {
      id: `arrow-${Date.now()}-${i}`,
      type: 'arrow',
      start: { x: pos.x, y: pos.y },
      end: { x: endX, y: endY },
      strokeColor: '#000000',
      strokeWidth: 2,
      strokeStyle: i === 0 ? 'solid' : i === 1 ? 'dashed' : 'dotted',
      arrowStart: i % 2 === 0,
      arrowEnd: true,
      arrowType: arrowType,
      opacity: 1
    }
    if (arrowType === 'curved' || arrowType === 'elbowed') {
      arrow.controlPoint = { x: pos.x + 60, y: pos.y - 20 }
    }
    elements.push(arrow)
  })

  const pathShapes = [
    [{ x: 0, y: 0 }, { x: 50, y: 30 }, { x: 100, y: 0 }, { x: 80, y: 50 }, { x: 100, y: 100 }, { x: 50, y: 70 }, { x: 0, y: 100 }, { x: 20, y: 50 }], // Star-like
    [{ x: 0, y: 50 }, { x: 25, y: 0 }, { x: 50, y: 50 }, { x: 75, y: 0 }, { x: 100, y: 50 }, { x: 75, y: 100 }, { x: 50, y: 50 }, { x: 25, y: 100 }], // Wave
    [{ x: 50, y: 0 }, { x: 100, y: 50 }, { x: 50, y: 100 }, { x: 0, y: 50 }], // Diamond path
  ]
  pathShapes.forEach((shape, i) => {
    const pos = nextPos()
    const points = shape.map(p => ({ x: pos.x + p.x, y: pos.y + p.y }))
    const bounds = calculatePathBounds(points)
    const path: PathElement = {
      id: `path-${Date.now()}-${i}`,
      type: 'path',
      points: points,
      color: '#000000',
      width: 2 + i,
      opacity: 1,
      bounds: bounds
    }
    elements.push(path)
  })

  const fontStyles: Array<'hand-drawn' | 'normal' | 'code' | 'n-dot'> = ['normal', 'hand-drawn', 'code', 'n-dot']
  const textAligns: Array<'left' | 'center' | 'right'> = ['left', 'center', 'right']
  const fontWeights: Array<'normal' | 'bold'> = ['normal', 'bold']
  
  fontStyles.forEach((fontStyle, i) => {
    textAligns.forEach((textAlign, j) => {
      fontWeights.forEach((fontWeight, k) => {
        const pos = nextPos()
        const text: TextElement = {
          id: `text-${Date.now()}-${i}-${j}-${k}`,
          type: 'text',
          x: pos.x,
          y: pos.y,
          text: `Text ${fontStyle} ${textAlign} ${fontWeight}`,
          color: '#000000',
          fontSize: 16 + i * 4,
          fontFamily: 'Arial',
          fontWeight: fontWeight,
          fontStyle: fontStyle,
          textAlign: textAlign,
          opacity: 1,
          width: 200,
          height: 50
        }
        elements.push(text)
      })
    })
  })

  for (let i = 0; i < 4; i++) {
    const pos = nextPos()
    const frame: FrameElement = {
      id: `frame-${Date.now()}-${i}`,
      type: 'frame',
      x: pos.x,
      y: pos.y,
      width: 200 + i * 50,
      height: 150 + i * 40,
      layer: i,
      opacity: 1,
      name: i % 2 === 0 ? `Frame ${i + 1}` : undefined
    }
    elements.push(frame)
  }

  const embedUrls = [
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://www.youtube.com/embed/jNQXAC9IVRw',
    'https://player.vimeo.com/video/148751763',
    'https://codepen.io/team/codepen/embed/preview/example',
  ]
  
  embedUrls.forEach((url, i) => {
    const pos = nextPos()
    const embed: EmbedElement = {
      id: `embed-${Date.now()}-${i}`,
      type: 'embed',
      x: pos.x,
      y: pos.y,
      width: 400,
      height: 300,
      url: url,
      opacity: 1
    }
    elements.push(embed)
  })

  return elements
}