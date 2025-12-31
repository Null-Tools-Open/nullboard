import type { CanvasElement, TextElement, ImageElement, FrameElement, EmbedElement } from '../shared'
import { drawCurvedArrow, drawElbowedArrow, calculateCurvedArrowControlPoint } from '../arrow'
import { isElementInViewport, type Viewport } from './viewport'

function drawHandle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number = 10) {
  ctx.fillStyle = '#ffffff'
  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.roundRect(x - size / 2, y - size / 2, size, size, 2)
  ctx.fill()
  ctx.stroke()
}

function drawImageSelection(
  ctx: CanvasRenderingContext2D,
  el: ImageElement
) {
  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = 2
  ctx.setLineDash([4, 4])
  ctx.strokeRect(el.x - 3, el.y - 3, el.width + 6, el.height + 6)
  ctx.setLineDash([])

  const handles = [
    { x: el.x, y: el.y }, // tl
    { x: el.x + el.width, y: el.y }, // tr
    { x: el.x, y: el.y + el.height }, // bl
    { x: el.x + el.width, y: el.y + el.height } // br
  ]
  handles.forEach(h => {
    drawHandle(ctx, h.x, h.y, 8)
  })
}

function drawRectSelection(
  ctx: CanvasRenderingContext2D,
  el: Extract<CanvasElement, { type: 'rect' }>,
  isSingleSelection: boolean
) {
  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = 2
  ctx.setLineDash([4, 4])
  ctx.strokeRect(el.x - 3, el.y - 3, el.width + 6, el.height + 6)
  ctx.setLineDash([])

  if (isSingleSelection) {
    const handles = [
      { x: el.x, y: el.y },
      { x: el.x + el.width, y: el.y },
      { x: el.x, y: el.y + el.height },
      { x: el.x + el.width, y: el.y + el.height },
      { x: el.x, y: el.y + el.height / 2 },
      { x: el.x + el.width, y: el.y + el.height / 2 },
      { x: el.x + el.width / 2, y: el.y },
      { x: el.x + el.width / 2, y: el.y + el.height },
    ]
    handles.forEach(h => {
      drawHandle(ctx, h.x, h.y)
    })
  }
}

function drawDiamondSelection(
  ctx: CanvasRenderingContext2D,
  el: Extract<CanvasElement, { type: 'diamond' }>,
  isSingleSelection: boolean
) {
  const centerX = el.x + el.width / 2
  const centerY = el.y + el.height / 2
  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = 2
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.moveTo(centerX, el.y - 3)
  ctx.lineTo(el.x + el.width + 3, centerY)
  ctx.lineTo(centerX, el.y + el.height + 3)
  ctx.lineTo(el.x - 3, centerY)
  ctx.closePath()
  ctx.stroke()
  ctx.setLineDash([])

  if (isSingleSelection) {
    const handles = [
      { x: centerX, y: el.y }, // Top
      { x: el.x + el.width, y: centerY }, // Right
      { x: centerX, y: el.y + el.height }, // Bottom
      { x: el.x, y: centerY }, // Left
    ]
    handles.forEach(h => {
      drawHandle(ctx, h.x, h.y)
    })
  }
}

function drawCircleSelection(
  ctx: CanvasRenderingContext2D,
  el: Extract<CanvasElement, { type: 'circle' }>,
  isSingleSelection: boolean
) {
  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = 2
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.arc(el.x, el.y, el.radius + 3, 0, 2 * Math.PI)
  ctx.stroke()
  ctx.setLineDash([])

  if (isSingleSelection) {
    const handleX = el.x + el.radius
    const handleY = el.y
    drawHandle(ctx, handleX, handleY)
  }
}

function drawPathSelection(
  ctx: CanvasRenderingContext2D,
  el: Extract<CanvasElement, { type: 'path' }>
) {
  if (!el.bounds) return
  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = 2
  ctx.setLineDash([4, 4])
  ctx.strokeRect(el.bounds.minX - 3, el.bounds.minY - 3, el.bounds.maxX - el.bounds.minX + 6, el.bounds.maxY - el.bounds.minY + 6)
  ctx.setLineDash([])
}

function drawLineSelection(
  ctx: CanvasRenderingContext2D,
  el: Extract<CanvasElement, { type: 'line' }>
) {
  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = 3
  ctx.globalAlpha = 0.3
  ctx.beginPath()
  ctx.moveTo(el.start.x, el.start.y)
  ctx.lineTo(el.end.x, el.end.y)
  ctx.stroke()
  ctx.globalAlpha = 1

  const handles = [el.start, el.end]
  handles.forEach(h => {
    drawHandle(ctx, h.x, h.y)
  })
}

function drawArrowSelection(
  ctx: CanvasRenderingContext2D,
  el: Extract<CanvasElement, { type: 'arrow' }>
) {
  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = 3
  ctx.globalAlpha = 0.3

  if (el.arrowType === 'curved') {
    drawCurvedArrow(ctx, el.start, el.end, el.controlPoint)
  } else if (el.arrowType === 'elbowed') {
    drawElbowedArrow(ctx, el.start, el.end)
  } else {
    ctx.beginPath()
    ctx.moveTo(el.start.x, el.start.y)
    ctx.lineTo(el.end.x, el.end.y)
    ctx.stroke()
  }

  ctx.globalAlpha = 1

  const handles = [el.start, el.end]
  handles.forEach(h => {
    drawHandle(ctx, h.x, h.y)
  })

  if (el.arrowType === 'curved') {
    const control = el.controlPoint || calculateCurvedArrowControlPoint(el.start, el.end)
    ctx.fillStyle = '#ffffff'
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(control.x, control.y, 6, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()
  }
}

function drawEmbedSelection(
  ctx: CanvasRenderingContext2D,
  el: EmbedElement
) {
  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = 2
  ctx.setLineDash([4, 4])
  ctx.strokeRect(el.x - 3, el.y - 3, el.width + 6, el.height + 6)
  ctx.setLineDash([])

  const handles = [
    { x: el.x, y: el.y }, // tl
    { x: el.x + el.width, y: el.y }, // tr
    { x: el.x, y: el.y + el.height }, // bl
    { x: el.x + el.width, y: el.y + el.height }, // br
    { x: el.x, y: el.y + el.height / 2 }, // l
    { x: el.x + el.width, y: el.y + el.height / 2 }, // r
    { x: el.x + el.width / 2, y: el.y }, // t
    { x: el.x + el.width / 2, y: el.y + el.height }, // b
  ]
  handles.forEach(h => {
    drawHandle(ctx, h.x, h.y)
  })
}

function drawFrameSelection(
  ctx: CanvasRenderingContext2D,
  el: FrameElement,
  isSingleSelection: boolean
) {
  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = 2
  ctx.setLineDash([4, 4])
  ctx.strokeRect(el.x - 3, el.y - 3, el.width + 6, el.height + 6)
  ctx.setLineDash([])

  if (isSingleSelection) {
    const handles = [
      { x: el.x, y: el.y },
      { x: el.x + el.width, y: el.y },
      { x: el.x, y: el.y + el.height },
      { x: el.x + el.width, y: el.y + el.height },
      { x: el.x, y: el.y + el.height / 2 },
      { x: el.x + el.width, y: el.y + el.height / 2 },
      { x: el.x + el.width / 2, y: el.y },
      { x: el.x + el.width / 2, y: el.y + el.height },
    ]
    handles.forEach(h => {
      drawHandle(ctx, h.x, h.y)
    })
  }
}

function drawTextSelection(
  ctx: CanvasRenderingContext2D,
  el: TextElement,
  isSingleSelection: boolean,
  editingTextId: string | null
) {
  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = 2
  ctx.setLineDash([4, 4])
  
  let boxWidth = el.width
  let boxHeight = el.height
  
  if (!boxWidth || boxWidth <= 0 || !boxHeight || boxHeight <= 0) {
    let fontStyle = ''
    let fontFamily = el.fontFamily
    if (el.fontStyle === 'hand-drawn') {
      fontFamily = 'Caveat, "Shadows Into Light", "Indie Flower", cursive'
    } else if (el.fontStyle === 'code') {
      fontStyle = 'monospace '
      fontFamily = 'Courier New, monospace'
    } else if (el.fontStyle === 'n-dot') {
      fontFamily = 'Nothing, sans-serif'
    }
    ctx.font = `${fontStyle}${el.fontWeight} ${el.fontSize}px ${fontFamily}`
    
    const lines = el.text.split('\n')
    const lineHeight = el.fontSize * 1.2
    let maxWidth = 0
    lines.forEach(line => {
      const metrics = ctx.measureText(line || ' ')
      maxWidth = Math.max(maxWidth, metrics.width)
    })
    const textHeight = lines.length * lineHeight
    
    boxWidth = maxWidth
    boxHeight = textHeight
  }
  
  const boxX = el.x
  const boxY = el.y
  
  ctx.strokeRect(boxX - 3, boxY - 3, boxWidth + 6, boxHeight + 6)
  ctx.setLineDash([])
  
  if (isSingleSelection && editingTextId !== el.id) {
    const handles = [
      { x: boxX, y: boxY },
      { x: boxX + boxWidth, y: boxY },
      { x: boxX, y: boxY + boxHeight },
      { x: boxX + boxWidth, y: boxY + boxHeight },
    ]
    handles.forEach(h => {
      drawHandle(ctx, h.x, h.y)
    })
  }
}

export function drawSelection(
  ctx: CanvasRenderingContext2D,
  elements: CanvasElement[],
  selectedIds: string[],
  editingTextId: string | null,
  viewport: Viewport | null
) {
  elements.forEach(el => {
    if (selectedIds.includes(el.id)) {
      if (viewport && !isElementInViewport(el, viewport)) {
        return
      }
      if (el.type === 'image') {
        drawImageSelection(ctx, el)
      }
    }
  })

  selectedIds.forEach(id => {
    const el = elements.find(e => e.id === id)
    if (!el) return

    if (viewport && !isElementInViewport(el, viewport)) {
      return
    }

    const isSingleSelection = selectedIds.length === 1

    if (el.type === 'rect') {
      drawRectSelection(ctx, el, isSingleSelection)
    } else if (el.type === 'diamond') {
      drawDiamondSelection(ctx, el, isSingleSelection)
    } else if (el.type === 'circle') {
      drawCircleSelection(ctx, el, isSingleSelection)
    } else if (el.type === 'path') {
      drawPathSelection(ctx, el)
    } else if (el.type === 'line') {
      drawLineSelection(ctx, el)
    } else if (el.type === 'arrow') {
      drawArrowSelection(ctx, el)
    } else if (el.type === 'text') {
      drawTextSelection(ctx, el, isSingleSelection, editingTextId)
    } else if (el.type === 'frame') {
      drawFrameSelection(ctx, el, isSingleSelection)
    } else if (el.type === 'embed') {
      drawEmbedSelection(ctx, el)
    }
  })
}