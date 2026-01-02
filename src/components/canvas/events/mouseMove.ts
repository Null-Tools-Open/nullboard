import type { Point, CanvasElement, FrameElement } from '../shared'
import type { ToolType } from '../../Toolbar'
import type { LaserPointerManager } from '../lasterPointer'
import type { Point as LaserPoint } from '../lasterPointer/types'
import { calculatePathBounds } from '../pen'
import { snapToAngle } from '../shared'
import { getResizeHandle } from '../rectangle'
import { getDiamondResizeHandle, isPointInDiamond } from '../diamond'
import { getCircleResizeHandle, isPointInCircle } from '../circle'
import { isPointNearPath, getPathResizeHandle } from '../pen'
import { isPointNearLine } from '../line'
import { isPointNearArrow } from '../arrow'
import { isPointOnFrameBorder } from '../frame'
import { isPointOnEmbedBorder } from '../embed'

export function handleMouseMove(
  e: React.MouseEvent,
  pos: Point,
  context: {
    isPanning: boolean
    isDrawing: boolean
    selectedTool: ToolType
    isSelecting: boolean
    selectionBox: { start: Point; end: Point } | null
    isDragging: boolean
    dragStart: Point | null
    selectedIds: string[]
    isResizing: string | null
    draggingControlPointId: string | null
    tempPath: Point[]
    tempRect: { start: Point; end: Point } | null
    tempDiamond: { start: Point; end: Point } | null
    tempCircle: { center: Point; radius: number } | null
    tempLine: { start: Point; end: Point } | null
    tempArrow: { start: Point; end: Point } | null
    tempTextRect: { start: Point; end: Point } | null
    tempFrame: { start: Point; end: Point } | null
    tempEmbed: { start: Point; end: Point } | null
    tempSticker: { start: Point; end: Point } | null
    tempStickyNote: { start: Point; end: Point } | null
    isShiftPressed: boolean
    elements: CanvasElement[]
    textResizeInitialStateRef: React.MutableRefObject<{
      fontSize: number
      width: number
      height: number
      x: number
      y: number
      boxX: number
      boxWidth: number
    } | null>
    frameDragInitialElementsRef: React.MutableRefObject<Set<string>>
    laserPointerRef: React.MutableRefObject<LaserPointerManager | null>
    laserTrailHistoryRef: React.MutableRefObject<Array<{ x: number; y: number; timestamp: number; alpha: number; trailId: number }>>
    currentTrailIdRef: React.MutableRefObject<number>
    needsRedrawRef: React.MutableRefObject<boolean>
    eraserTrailHistoryRef: React.MutableRefObject<Array<{ x: number; y: number; timestamp: number; alpha: number; trailId: number }>>
    currentEraserTrailIdRef: React.MutableRefObject<number>
    markedForErasureIds: Set<string>
    setTempPath: React.Dispatch<React.SetStateAction<Point[]>>
    setTempRect: React.Dispatch<React.SetStateAction<{ start: Point; end: Point } | null>>
    setTempDiamond: React.Dispatch<React.SetStateAction<{ start: Point; end: Point } | null>>
    setTempCircle: React.Dispatch<React.SetStateAction<{ center: Point; radius: number } | null>>
    setTempLine: React.Dispatch<React.SetStateAction<{ start: Point; end: Point } | null>>
    setTempArrow: React.Dispatch<React.SetStateAction<{ start: Point; end: Point } | null>>
    setTempTextRect: React.Dispatch<React.SetStateAction<{ start: Point; end: Point } | null>>
    setTempLassoPath: React.Dispatch<React.SetStateAction<Point[]>>
    setTempFrame: React.Dispatch<React.SetStateAction<{ start: Point; end: Point } | null>>
    setTempEmbed: React.Dispatch<React.SetStateAction<{ start: Point; end: Point } | null>>
    setTempSticker: React.Dispatch<React.SetStateAction<{ start: Point; end: Point } | null>>
    setTempStickyNote: React.Dispatch<React.SetStateAction<{ start: Point; end: Point } | null>>
    setSelectionBox: React.Dispatch<React.SetStateAction<{ start: Point; end: Point } | null>>
    setElements: React.Dispatch<React.SetStateAction<CanvasElement[]>>
    setDragStart: React.Dispatch<React.SetStateAction<Point | null>>
    setLaserPointerOutline: React.Dispatch<React.SetStateAction<LaserPoint[]>>
    setHoverHandle: React.Dispatch<React.SetStateAction<string | null>>
    setHoverElement: React.Dispatch<React.SetStateAction<string | null>>
    setMarkedForErasureIds: React.Dispatch<React.SetStateAction<Set<string>>>
  }
) {
  if (context.isPanning) return

  if (context.isDrawing) {
    if (context.selectedTool === 'pen') {
      context.setTempPath(prev => {

        if (prev.length === 0) return [pos]

        if (context.isShiftPressed) {

          const start = prev[0]
          const snapped = snapToAngle(start, pos)

          context.needsRedrawRef.current = true

          return [start, snapped]
        }

        const last = prev[prev.length - 1]
        const dist = Math.hypot(pos.x - last.x, pos.y - last.y)
        if (dist > 2) {
          context.needsRedrawRef.current = true

          const maxDistForMinPressure = 40
          const minPressure = 0.2
          const rawPressure = 1 - Math.min(dist / maxDistForMinPressure, 1 - minPressure)

          const pressure = Math.max(minPressure, rawPressure)

          return [...prev, { ...pos, pressure }]
        }
        return prev
      })
    } else if (context.selectedTool === 'laser' && context.laserPointerRef.current) {
      const laserPoint: LaserPoint = [pos.x, pos.y, 1]
      context.laserPointerRef.current.addPoint(laserPoint)
      const outline = context.laserPointerRef.current.getCurrentOutline()

      const now = Date.now()
      context.laserTrailHistoryRef.current.push({
        x: pos.x,
        y: pos.y,
        timestamp: now,
        alpha: 1.0,
        trailId: context.currentTrailIdRef.current
      })

      context.setLaserPointerOutline(outline)
    } else if (context.selectedTool === 'eraser') {
      const now = Date.now()
      context.eraserTrailHistoryRef.current.push({
        x: pos.x,
        y: pos.y,
        timestamp: now,
        alpha: 1.0,
        trailId: context.currentEraserTrailIdRef.current
      })

      for (const el of context.elements) {
        if (context.markedForErasureIds.has(el.id)) continue

        let isHit = false
        if ((el.type === 'rect' || el.type === 'image' || el.type === 'embed' || el.type === 'frame' || el.type === 'sticker') && pos.x >= el.x && pos.x <= el.x + el.width && pos.y >= el.y && pos.y <= el.y + el.height) {
          isHit = true
        } else if (el.type === 'text' && pos.x >= el.x && pos.x <= el.x + (el.width || 0) && pos.y >= el.y && pos.y <= el.y + (el.height || 0)) {
          isHit = true
        } else if (el.type === 'diamond' && isPointInDiamond(pos, el)) {
          isHit = true
        } else if (el.type === 'circle' && isPointInCircle(pos, el)) {
          isHit = true
        } else if (el.type === 'path' && isPointNearPath(pos, el)) {
          isHit = true
        } else if (el.type === 'line' && isPointNearLine(pos, el)) {
          isHit = true
        } else if (el.type === 'arrow' && isPointNearArrow(pos, el)) {
          isHit = true
        }

        if (isHit) {
          context.setMarkedForErasureIds(prev => new Set([...prev, el.id]))
        }
      }
      context.needsRedrawRef.current = true
    } else if (context.selectedTool === 'rectangle' && context.tempRect) {
      let endPos = pos
      if (context.isShiftPressed) {
        const width = Math.abs(pos.x - context.tempRect.start.x)
        const height = Math.abs(pos.y - context.tempRect.start.y)
        const size = Math.max(width, height)
        endPos = {
          x: context.tempRect.start.x + (pos.x > context.tempRect.start.x ? size : -size),
          y: context.tempRect.start.y + (pos.y > context.tempRect.start.y ? size : -size)
        }
      }
      context.setTempRect({ ...context.tempRect, end: endPos })
      context.needsRedrawRef.current = true
    } else if (context.selectedTool === 'diamond' && context.tempDiamond) {
      let endPos = pos
      if (context.isShiftPressed) {
        const width = Math.abs(pos.x - context.tempDiamond.start.x)
        const height = Math.abs(pos.y - context.tempDiamond.start.y)
        const size = Math.max(width, height)
        endPos = {
          x: context.tempDiamond.start.x + (pos.x > context.tempDiamond.start.x ? size : -size),
          y: context.tempDiamond.start.y + (pos.y > context.tempDiamond.start.y ? size : -size)
        }
      }
      context.setTempDiamond({ ...context.tempDiamond, end: endPos })
      context.needsRedrawRef.current = true
    } else if (context.selectedTool === 'circle' && context.tempCircle) {
      const radius = Math.hypot(pos.x - context.tempCircle.center.x, pos.y - context.tempCircle.center.y)
      context.setTempCircle({ ...context.tempCircle, radius })
      context.needsRedrawRef.current = true
    } else if (context.selectedTool === 'line' && context.tempLine) {
      const endPos = context.isShiftPressed ? snapToAngle(context.tempLine.start, pos) : pos
      context.setTempLine({ ...context.tempLine, end: endPos })
      context.needsRedrawRef.current = true
    } else if (context.selectedTool === 'arrow' && context.tempArrow) {
      const endPos = context.isShiftPressed ? snapToAngle(context.tempArrow.start, pos) : pos
      context.setTempArrow({ ...context.tempArrow, end: endPos })
      context.needsRedrawRef.current = true
    } else if (context.selectedTool === 'text' && context.tempTextRect) {
      context.setTempTextRect({ ...context.tempTextRect, end: pos })
      context.needsRedrawRef.current = true
    } else if (context.selectedTool === 'lasso') {
      context.setTempLassoPath(prev => {
        if (prev.length === 0) return [pos]
        const last = prev[prev.length - 1]
        const dist = Math.hypot(pos.x - last.x, pos.y - last.y)
        if (dist > 2) {
          context.needsRedrawRef.current = true
          return [...prev, pos]
        }
        return prev
      })
    } else if (context.selectedTool === 'frame' && context.tempFrame) {
      context.setTempFrame({ ...context.tempFrame, end: pos })
      context.needsRedrawRef.current = true
    } else if (context.selectedTool === 'embed' && context.tempEmbed) {
      context.setTempEmbed({ ...context.tempEmbed, end: pos })
      context.needsRedrawRef.current = true
    } else if (context.selectedTool === 'sticker' && context.tempSticker) {
      context.setTempSticker({ ...context.tempSticker, end: pos })
      context.needsRedrawRef.current = true
    } else if (context.selectedTool === 'stickyNote' && context.tempStickyNote) {
      // Force square (symmetrical) - use max dimension for both width and height
      context.setTempStickyNote({ ...context.tempStickyNote, end: pos })
      context.needsRedrawRef.current = true
    }
  } else if (context.isSelecting && context.selectionBox) {
    context.setSelectionBox({ ...context.selectionBox, end: pos })
    context.needsRedrawRef.current = true
  } else if (context.isDragging && context.dragStart && context.selectedIds.length > 0) {
    const dx = pos.x - context.dragStart.x
    const dy = pos.y - context.dragStart.y

    context.setElements(prev => {

      const elementsInDraggedFrames = context.frameDragInitialElementsRef.current

      return prev.map(el => {

        if (context.selectedIds.includes(el.id)) {

          if (el.type === 'rect' || el.type === 'diamond' || el.type === 'circle') {

            return { ...el, x: el.x + dx, y: el.y + dy }

          } else if (el.type === 'path') {
            const newPoints = el.points.map(p => ({ ...p, x: p.x + dx, y: p.y + dy }))
            return { ...el, points: newPoints, bounds: calculatePathBounds(newPoints) }
          } else if (el.type === 'line') {
            return {
              ...el,
              start: { x: el.start.x + dx, y: el.start.y + dy },
              end: { x: el.end.x + dx, y: el.end.y + dy }
            }
          } else if (el.type === 'arrow') {
            return {
              ...el,
              start: { x: el.start.x + dx, y: el.start.y + dy },
              end: { x: el.end.x + dx, y: el.end.y + dy },
              controlPoint: el.controlPoint ? { x: el.controlPoint.x + dx, y: el.controlPoint.y + dy } : undefined
            }
          } else if (el.type === 'text') {
            return { ...el, x: el.x + dx, y: el.y + dy }
          } else if (el.type === 'image' || el.type === 'embed' || el.type === 'sticker' || el.type === 'stickyNote') {
            return { ...el, x: el.x + dx, y: el.y + dy }
          } else if (el.type === 'frame') {
            return { ...el, x: el.x + dx, y: el.y + dy }
          }
        }

        if (elementsInDraggedFrames.has(el.id)) {

          if (el.type === 'rect' || el.type === 'diamond' || el.type === 'circle') {

            return { ...el, x: el.x + dx, y: el.y + dy }

          } else if (el.type === 'path') {

            const newPoints = el.points.map(p => ({ ...p, x: p.x + dx, y: p.y + dy }))

            return { ...el, points: newPoints, bounds: calculatePathBounds(newPoints) }

          } else if (el.type === 'line') {

            return {
              ...el,
              start: { x: el.start.x + dx, y: el.start.y + dy },
              end: { x: el.end.x + dx, y: el.end.y + dy }
            }
          } else if (el.type === 'arrow') {
            return {
              ...el,
              start: { x: el.start.x + dx, y: el.start.y + dy },
              end: { x: el.end.x + dx, y: el.end.y + dy },
              controlPoint: el.controlPoint ? { x: el.controlPoint.x + dx, y: el.controlPoint.y + dy } : undefined
            }
          } else if (el.type === 'text') {

            return { ...el, x: el.x + dx, y: el.y + dy }
          } else if (el.type === 'image' || el.type === 'embed' || el.type === 'sticker' || el.type === 'stickyNote') {

            return { ...el, x: el.x + dx, y: el.y + dy }
          }
        }

        return el
      })
    })

    context.setDragStart(pos)
    context.needsRedrawRef.current = true

  } else if (context.isResizing && context.dragStart && context.selectedIds.length === 1) {
    const dx = pos.x - context.dragStart.x
    const dy = pos.y - context.dragStart.y

    context.setElements(prev => prev.map(el => {
      if (el.id !== context.selectedIds[0]) return el

      if (el.type === 'rect') {
        let newEl = { ...el }

        if (context.isShiftPressed && (context.isResizing === 'tl' || context.isResizing === 'tr' || context.isResizing === 'bl' || context.isResizing === 'br')) {
          const aspectRatio = el.width / el.height
          let newWidth = el.width
          let newHeight = el.height
          let newX = el.x
          let newY = el.y

          if (context.isResizing === 'tl') {
            newWidth = el.width - dx
            newHeight = newWidth / aspectRatio
            newX = el.x + dx
            newY = el.y + (el.height - newHeight)
          } else if (context.isResizing === 'tr') {
            newWidth = el.width + dx
            newHeight = newWidth / aspectRatio
            newY = el.y - (newHeight - el.height)
          } else if (context.isResizing === 'bl') {
            newWidth = el.width - dx
            newHeight = newWidth / aspectRatio
            newX = el.x + dx
          } else if (context.isResizing === 'br') {
            newWidth = el.width + dx
            newHeight = newWidth / aspectRatio
          }

          if (newWidth >= 10 && newHeight >= 10) {
            newEl.width = newWidth
            newEl.height = newHeight
            newEl.x = newX
            newEl.y = newY
          }
        } else {
          if (context.isResizing && context.isResizing.includes('l')) {
            newEl.x += dx
            newEl.width -= dx
          }
          if (context.isResizing && context.isResizing.includes('r')) {
            newEl.width += dx
          }
          if (context.isResizing && context.isResizing.includes('t')) {
            newEl.y += dy
            newEl.height -= dy
          }
          if (context.isResizing && context.isResizing.includes('b')) {
            newEl.height += dy
          }
          if (newEl.width < 10) newEl.width = 10
          if (newEl.height < 10) newEl.height = 10
        }
        return newEl

      } else if (el.type === 'frame') {
        let newEl = { ...el }

        if (context.isShiftPressed && (context.isResizing === 'tl' || context.isResizing === 'tr' || context.isResizing === 'bl' || context.isResizing === 'br')) {
          const aspectRatio = el.width / el.height
          let newWidth = el.width
          let newHeight = el.height
          let newX = el.x
          let newY = el.y

          if (context.isResizing === 'tl') {
            newWidth = el.width - dx
            newHeight = newWidth / aspectRatio
            newX = el.x + dx
            newY = el.y + (el.height - newHeight)
          } else if (context.isResizing === 'tr') {
            newWidth = el.width + dx
            newHeight = newWidth / aspectRatio
            newY = el.y - (newHeight - el.height)
          } else if (context.isResizing === 'bl') {
            newWidth = el.width - dx
            newHeight = newWidth / aspectRatio
            newX = el.x + dx
          } else if (context.isResizing === 'br') {
            newWidth = el.width + dx
            newHeight = newWidth / aspectRatio
          }

          if (newWidth >= 50 && newHeight >= 50) {
            newEl.width = newWidth
            newEl.height = newHeight
            newEl.x = newX
            newEl.y = newY
          }
        } else {
          if (context.isResizing && context.isResizing.includes('l')) {
            newEl.x += dx
            newEl.width -= dx
          }
          if (context.isResizing && context.isResizing.includes('r')) {
            newEl.width += dx
          }
          if (context.isResizing && context.isResizing.includes('t')) {
            newEl.y += dy
            newEl.height -= dy
          }
          if (context.isResizing && context.isResizing.includes('b')) {
            newEl.height += dy
          }
          if (newEl.width < 50) newEl.width = 50
          if (newEl.height < 50) newEl.height = 50
        }
        return newEl
      } else if (el.type === 'diamond') {
        let newEl = { ...el }

        // Diamond only has cardinal handles (t, b, l, r)
        if (context.isShiftPressed) {
          const aspectRatio = el.width / el.height

          if (context.isResizing === 'l') {
            newEl.x += dx
            newEl.width -= dx
            // Maintain aspect ratio: width changed, so update height centered
            const newHeight = newEl.width / aspectRatio
            newEl.y = el.y + (el.height - newHeight) / 2
            newEl.height = newHeight
          } else if (context.isResizing === 'r') {
            newEl.width += dx
            const newHeight = newEl.width / aspectRatio
            newEl.y = el.y + (el.height - newHeight) / 2
            newEl.height = newHeight
          } else if (context.isResizing === 't') {
            newEl.y += dy
            newEl.height -= dy
            // same thing here, aspect ratio
            const newWidth = newEl.height * aspectRatio
            newEl.x = el.x + (el.width - newWidth) / 2
            newEl.width = newWidth
          } else if (context.isResizing === 'b') {
            newEl.height += dy
            const newWidth = newEl.height * aspectRatio
            newEl.x = el.x + (el.width - newWidth) / 2
            newEl.width = newWidth
          }
        } else {
          if (context.isResizing === 't') {
            newEl.y += dy
            newEl.height -= dy
          } else if (context.isResizing === 'b') {
            newEl.height += dy
          } else if (context.isResizing === 'l') {
            newEl.x += dx
            newEl.width -= dx
          } else if (context.isResizing === 'r') {
            newEl.width += dx
          }
        }

        if (newEl.width < 10) newEl.width = 10
        if (newEl.height < 10) newEl.height = 10
        return newEl
      } else if (el.type === 'circle') {
        let newEl = { ...el }
        const newRadius = Math.hypot(pos.x - el.x, pos.y - el.y)
        if (newRadius >= 5) {
          newEl.radius = newRadius
        } else {
          newEl.radius = 5
        }
        return newEl
      } else if (el.type === 'line') {
        let newEl = { ...el }
        if (context.isResizing === 'start') {
          newEl.start = { x: pos.x, y: pos.y }
        } else if (context.isResizing === 'end') {
          newEl.end = { x: pos.x, y: pos.y }
        }
        return newEl
      } else if (el.type === 'arrow') {
        let newEl = { ...el }
        if (context.isResizing === 'start') {
          newEl.start = { x: pos.x, y: pos.y }
        } else if (context.isResizing === 'end') {
          newEl.end = { x: pos.x, y: pos.y }
        }
        return newEl
      } else if (el.type === 'text') {
        if (!context.textResizeInitialStateRef.current) return el

        let newEl = { ...el }
        const { x: initialX, y: initialY, width: initialWidth, height: initialHeight, fontSize: initialFontSize } = context.textResizeInitialStateRef.current

        let anchorX: number
        let anchorY: number
        let initialCornerX: number
        let initialCornerY: number

        if (context.isResizing === 'tl') {
          anchorX = initialX + initialWidth
          anchorY = initialY + initialHeight
          initialCornerX = initialX
          initialCornerY = initialY
        } else if (context.isResizing === 'tr') {
          anchorX = initialX
          anchorY = initialY + initialHeight
          initialCornerX = initialX + initialWidth
          initialCornerY = initialY
        } else if (context.isResizing === 'bl') {
          anchorX = initialX + initialWidth
          anchorY = initialY
          initialCornerX = initialX
          initialCornerY = initialY + initialHeight
        } else if (context.isResizing === 'br') {
          anchorX = initialX
          anchorY = initialY
          initialCornerX = initialX + initialWidth
          initialCornerY = initialY + initialHeight
        } else {
          return el
        }

        const diagonalDx = initialCornerX - anchorX
        const diagonalDy = initialCornerY - anchorY
        const diagonalLength = Math.sqrt(diagonalDx * diagonalDx + diagonalDy * diagonalDy)

        if (diagonalLength === 0) return el

        const diagonalUnitX = diagonalDx / diagonalLength
        const diagonalUnitY = diagonalDy / diagonalLength

        const cursorDx = pos.x - anchorX
        const cursorDy = pos.y - anchorY

        const projectionLength = cursorDx * diagonalUnitX + cursorDy * diagonalUnitY

        const clampedProjection = Math.max(0, projectionLength)

        const newCornerX = anchorX + clampedProjection * diagonalUnitX
        const newCornerY = anchorY + clampedProjection * diagonalUnitY

        let newX: number
        let newY: number
        let newWidth: number
        let newHeight: number

        if (context.isResizing === 'tl') {
          newX = newCornerX
          newY = newCornerY
          newWidth = anchorX - newCornerX
          newHeight = anchorY - newCornerY
        } else if (context.isResizing === 'tr') {
          newX = anchorX
          newY = newCornerY
          newWidth = newCornerX - anchorX
          newHeight = anchorY - newCornerY
        } else if (context.isResizing === 'bl') {
          newX = newCornerX
          newY = anchorY
          newWidth = anchorX - newCornerX
          newHeight = newCornerY - anchorY
        } else {
          newX = anchorX
          newY = anchorY
          newWidth = newCornerX - anchorX
          newHeight = newCornerY - anchorY
        }

        const minWidth = 50
        const minHeight = initialFontSize * 1.2

        if (newWidth < minWidth) {
          newWidth = minWidth
          if (context.isResizing === 'tl' || context.isResizing === 'bl') {
            newX = anchorX - newWidth
          }
        }

        if (newHeight < minHeight) {
          newHeight = minHeight
          if (context.isResizing === 'tl' || context.isResizing === 'tr') {
            newY = anchorY - newHeight
          }
        }

        newEl.x = newX
        newEl.y = newY
        newEl.width = newWidth
        newEl.height = newHeight

        if (Math.abs(newWidth - initialWidth) > 0.1 || Math.abs(newHeight - initialHeight) > 0.1) {
          const scaleX = initialWidth > 0 ? newWidth / initialWidth : 1
          const scaleY = initialHeight > 0 ? newHeight / initialHeight : 1
          const avgScale = (scaleX + scaleY) / 2
          const newFontSize = Math.max(8, Math.min(200, initialFontSize * avgScale))
          newEl.fontSize = newFontSize
        }

        return newEl
      } else if (el.type === 'image' || el.type === 'sticker' || el.type === 'stickyNote') {
        let newEl = { ...el }
        const dx = pos.x - (context.dragStart?.x || el.x)
        const dy = pos.y - (context.dragStart?.y || el.y)

        if (context.isResizing === 'tl' || context.isResizing === 'tr' || context.isResizing === 'bl' || context.isResizing === 'br') {
          const aspectRatio = el.width / el.height
          let newWidth = el.width
          let newHeight = el.height
          let newX = el.x
          let newY = el.y

          if (context.isResizing === 'tl') {
            newWidth = el.width - dx
            newHeight = newWidth / aspectRatio
            newX = el.x + dx
            newY = el.y + (el.height - newHeight)
          } else if (context.isResizing === 'tr') {
            newWidth = el.width + dx
            newHeight = newWidth / aspectRatio
            newY = el.y - (newHeight - el.height)
          } else if (context.isResizing === 'bl') {
            newWidth = el.width - dx
            newHeight = newWidth / aspectRatio
            newX = el.x + dx
          } else if (context.isResizing === 'br') {
            newWidth = el.width + dx
            newHeight = newWidth / aspectRatio
          }

          if (newWidth >= 20 && newHeight >= 20) {
            newEl.width = newWidth
            newEl.height = newHeight
            newEl.x = newX
            newEl.y = newY
          }
        } else {
          if (context.isResizing === 't') {
            newEl.y += dy
            newEl.height -= dy
          } else if (context.isResizing === 'b') {
            newEl.height += dy
          } else if (context.isResizing === 'l') {
            newEl.x += dx
            newEl.width -= dx
          } else if (context.isResizing === 'r') {
            newEl.width += dx
          }
          if (newEl.width < 20) newEl.width = 20
          if (newEl.height < 20) newEl.height = 20
        }

        return newEl
      } else if (el.type === 'embed') {
        let newEl = { ...el }
        if (context.isResizing && context.isResizing.includes('l')) {
          newEl.x += dx
          newEl.width -= dx
        }
        if (context.isResizing && context.isResizing.includes('r')) {
          newEl.width += dx
        }
        if (context.isResizing && context.isResizing.includes('t')) {
          newEl.y += dy
          newEl.height -= dy
        }
        if (context.isResizing && context.isResizing.includes('b')) {
          newEl.height += dy
        }
        if (newEl.width < 10) newEl.width = 10
        if (newEl.height < 10) newEl.height = 10
        return newEl
      } else if (el.type === 'path') {
        let newEl = { ...el }
        if (!newEl.bounds) return el

        const { minX, minY, maxX, maxY } = newEl.bounds
        const width = maxX - minX
        const height = maxY - minY

        let newMinX = minX
        let newMinY = minY
        let newMaxX = maxX
        let newMaxY = maxY

        if (context.isShiftPressed && (context.isResizing === 'tl' || context.isResizing === 'tr' || context.isResizing === 'bl' || context.isResizing === 'br')) {
          const aspectRatio = width / height
          let newBoxW = width
          let newBoxH = height

          if (context.isResizing === 'tl') {
            newBoxW = width - dx
            newBoxH = newBoxW / aspectRatio
            newMinX = maxX - newBoxW
            newMinY = maxY - newBoxH
            newMaxX = maxX
            newMaxY = maxY
          } else if (context.isResizing === 'tr') {
            newBoxW = width + dx
            newBoxH = newBoxW / aspectRatio
            newMinX = minX
            newMinY = maxY - newBoxH
            newMaxX = minX + newBoxW
            newMaxY = maxY
          } else if (context.isResizing === 'bl') {
            newBoxW = width - dx
            newBoxH = newBoxW / aspectRatio
            newMinX = maxX - newBoxW
            newMinY = minY
            newMaxX = maxX
            newMaxY = minY + newBoxH
          } else if (context.isResizing === 'br') {
            newBoxW = width + dx
            newBoxH = newBoxW / aspectRatio
            newMinX = minX
            newMinY = minY
            newMaxX = minX + newBoxW
            newMaxY = minY + newBoxH
          }
        } else {
          if (context.isResizing && context.isResizing.includes('l')) newMinX += dx
          if (context.isResizing && context.isResizing.includes('r')) newMaxX += dx
          if (context.isResizing && context.isResizing.includes('t')) newMinY += dy
          if (context.isResizing && context.isResizing.includes('b')) newMaxY += dy
        }

        const newWidth = newMaxX - newMinX
        const newHeight = newMaxY - newMinY

        if (newWidth < 5 || newHeight < 5) return el

        const scaleX = width === 0 ? 1 : newWidth / width
        const scaleY = height === 0 ? 1 : newHeight / height

        newEl.points = newEl.points.map(p => ({
          ...p,
          x: newMinX + (p.x - minX) * scaleX,
          y: newMinY + (p.y - minY) * scaleY
        }))

        newEl.bounds = calculatePathBounds(newEl.points)
        return newEl
      }
      return el
    }))

    context.setDragStart(pos)
    context.needsRedrawRef.current = true
  } else if (context.draggingControlPointId) {
    context.setElements(prev => prev.map(el => {
      if (el.id !== context.draggingControlPointId || el.type !== 'arrow') return el
      return { ...el, controlPoint: pos }
    }))
    context.needsRedrawRef.current = true
  } else if (context.selectedTool === 'select' && !context.isDrawing && !context.isDragging && !context.isResizing && !context.isSelecting) {
    let foundHandle: string | null = null
    let foundElement: string | null = null

    if (context.selectedIds.length === 1) {
      const el = context.elements.find(e => e.id === context.selectedIds[0])
      if (el?.type === 'rect' || el?.type === 'embed' || el?.type === 'image' || el?.type === 'sticker') {
        foundHandle = getResizeHandle(pos, el)
        if (!foundHandle && pos.x >= el.x && pos.x <= el.x + el.width && pos.y >= el.y && pos.y <= el.y + el.height) {
          foundElement = el.id
        }
      } else if (el?.type === 'diamond') {
        foundHandle = getDiamondResizeHandle(pos, el)
        if (!foundHandle && isPointInDiamond(pos, el)) {
          foundElement = el.id
        }
      } else if (el?.type === 'circle') {
        foundHandle = getCircleResizeHandle(pos, el)
        if (!foundHandle && isPointInCircle(pos, el)) {
          foundElement = el.id
        }
        if (!foundHandle && isPointInCircle(pos, el)) {
          foundElement = el.id
        }
      } else if (el?.type === 'path') {
        foundHandle = getPathResizeHandle(pos, el)
        if (!foundHandle && isPointNearPath(pos, el)) {
          foundElement = el.id
        }
      }
    }

    if (!foundHandle && !foundElement) {
      for (let i = context.elements.length - 1; i >= 0; i--) {
        const el = context.elements[i]
        if (el.type === 'rect' && pos.x >= el.x && pos.x <= el.x + el.width && pos.y >= el.y && pos.y <= el.y + el.height) {
          foundElement = el.id
          break
        } else if (el.type === 'diamond' && isPointInDiamond(pos, el)) {
          foundElement = el.id
          break
        } else if (el.type === 'path' && isPointNearPath(pos, el)) {
          foundElement = el.id
          break
        } else if (el.type === 'circle' && isPointInCircle(pos, el)) {
          foundElement = el.id
          break
        } else if (el.type === 'line' && isPointNearLine(pos, el)) {
          foundElement = el.id
          break
        } else if (el.type === 'arrow' && isPointNearArrow(pos, el)) {
          foundElement = el.id
          break
        } else if (el.type === 'frame' && isPointOnFrameBorder(pos, el)) {
          foundElement = el.id
          break
        } else if (el.type === 'embed' && isPointOnEmbedBorder(pos, el)) {
          foundElement = el.id
          break
        } else if (el.type === 'sticker' && pos.x >= el.x && pos.x <= el.x + el.width && pos.y >= el.y && pos.y <= el.y + el.height) {
          foundElement = el.id
          break
        }
      }
    }

    context.setHoverHandle(foundHandle)
    context.setHoverElement(foundElement)
  }
}