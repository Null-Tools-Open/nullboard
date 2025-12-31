import type { CanvasElement, TextElement, FrameElement } from '../shared'
import { drawPath } from '../pen'
import { drawRectangle } from '../rectangle'
import { drawDiamond } from '../diamond'
import { drawCircle } from '../circle'
import { drawLine } from '../line'
import { drawArrow } from '../arrow'
import { drawText } from '../text'
import { drawImage } from '../image'
import { drawFrame, getFrameElements, getElementFrame } from '../frame'
import { isElementInViewport, type Viewport } from './viewport'

export function drawElements(
  ctx: CanvasRenderingContext2D,
  elements: CanvasElement[],
  editingTextId: string | null,
  needsRedrawRef: React.MutableRefObject<boolean>,
  animFrameRef: React.MutableRefObject<number | undefined>,
  drawCallback: () => void,
  viewport: Viewport | null,
  currentScale?: number
) {

  const frames = elements.filter((el): el is FrameElement => el.type === 'frame')
    .sort((a, b) => a.layer - b.layer)
  const regularElements = elements.filter(el => el.type !== 'frame')
  
  const elementsNotInFrames: CanvasElement[] = []
  const elementsInFrames = new Map<FrameElement, CanvasElement[]>()
  
  regularElements.forEach(el => {

    let assigned = false

    for (let i = frames.length - 1; i >= 0; i--) {

      const frame = frames[i]
      const frameElements = getFrameElements(frame, [el])

      if (frameElements.length > 0) {

        if (!elementsInFrames.has(frame)) {
          elementsInFrames.set(frame, [])
        }

        elementsInFrames.get(frame)!.push(el)

        assigned = true

        break
      }
    }

    if (!assigned) {
      elementsNotInFrames.push(el)
    }
  })
  
  frames.forEach(frame => {

    if (viewport && !isElementInViewport(frame, viewport)) {

      return
    }

    drawFrame(ctx, frame)
  })
  
  elementsNotInFrames.forEach(el => {

    if (viewport && !isElementInViewport(el, viewport)) {

      return
    }

    if (el.type === 'path') {
      drawPath(ctx, el, viewport, currentScale)
    } else if (el.type === 'rect') {
      drawRectangle(ctx, el)
    } else if (el.type === 'diamond') {
      drawDiamond(ctx, el)
    } else if (el.type === 'circle') {
      drawCircle(ctx, el)
    } else if (el.type === 'line') {
      drawLine(ctx, el)
    } else if (el.type === 'arrow') {
      drawArrow(ctx, el)
    } else if (el.type === 'text') {
      if (editingTextId !== el.id && el.text && el.text.trim() !== '') {
        drawText(ctx, el)
      }
    } else if (el.type === 'image') {
      drawImage(ctx, el, () => {
        needsRedrawRef.current = true
        if (animFrameRef.current === undefined) {
          animFrameRef.current = requestAnimationFrame(() => {
            drawCallback()
            animFrameRef.current = undefined
          })
        }
      })
    }
  })
  
  frames.forEach(frame => {
    if (viewport && !isElementInViewport(frame, viewport)) {
      return
    }
    
    const frameElements = elementsInFrames.get(frame) || []
    if (frameElements.length > 0) {
      ctx.save()
      
      const cornerRadius = 22
      ctx.beginPath()
      ctx.roundRect(frame.x, frame.y, frame.width, frame.height, cornerRadius)
      ctx.clip()
      
      frameElements.forEach(el => {

        if (viewport && !isElementInViewport(el, viewport)) {
          return
        }

        if (el.type === 'path') {
          // Reset line dash for paths inside frames
          ctx.setLineDash([])
          drawPath(ctx, el, viewport, currentScale)
        } else if (el.type === 'rect') {
          drawRectangle(ctx, el)
        } else if (el.type === 'diamond') {
          drawDiamond(ctx, el)
        } else if (el.type === 'circle') {
          drawCircle(ctx, el)
        } else if (el.type === 'line') {
          drawLine(ctx, el)
        } else if (el.type === 'arrow') {
          drawArrow(ctx, el)
        } else if (el.type === 'text') {

          if (editingTextId !== el.id && el.text && el.text.trim() !== '') {
            const textFrame = getElementFrame(el, frames)
            const frameMaxWidth = textFrame ? textFrame.width - 20 : undefined
            drawText(ctx, el, frameMaxWidth)
          }

        } else if (el.type === 'image') {
          drawImage(ctx, el, () => {
            needsRedrawRef.current = true

            if (animFrameRef.current === undefined) {
              animFrameRef.current = requestAnimationFrame(() => {
                
                drawCallback()
                animFrameRef.current = undefined
              })
            }
          })
        }
      })
      
      ctx.restore()
    }
  })
}