// NEEDS REFACTORING ASAPPPPPPPPPPPPPPPPPPPPPPPPPP

import type { Point, CanvasElement, TextElement } from '../shared'
import type { ToolType } from '../../Toolbar'
import type { LaserPointerManager } from '../lasterPointer'
import type { Point as LaserPoint } from '../lasterPointer/types'
import { LaserPointerManager as LaserPointerManagerClass } from '../lasterPointer'
import { getResizeHandle } from '../rectangle'
import { getDiamondResizeHandle } from '../diamond'
import { getCircleResizeHandle } from '../circle'
import { getLineResizeHandle } from '../line'
import { getArrowResizeHandle, isPointNearControlPoint } from '../arrow'
import { getTextResizeHandle, getTextDimensions } from '../text'
import { isPointInDiamond } from '../diamond'
import { isPointInCircle } from '../circle'
import { isPointNearPath, getPathResizeHandle } from '../pen'
import { isPointNearLine } from '../line'
import { isPointNearArrow } from '../arrow'
import { isPointInText } from '../text'
import { isPointInImage } from '../image'
import { isPointOnFrameBorder, isPointOnFrame, getFrameResizeHandle, getFrameElements } from '../frame'
import { isPointOnEmbedBorder } from '../embed'
import type { FrameElement } from '../shared'

export function handleMouseDown(
  e: React.MouseEvent,
  pos: Point,
  context: {
    isLocked: boolean
    selectedTool: ToolType
    elements: CanvasElement[]
    selectedIds: string[]
    editingTextId: string | null
    editingTextValue: string
    canvasRef: React.RefObject<HTMLCanvasElement | null>
    textInputRef: React.RefObject<HTMLTextAreaElement | null>
    historyRef: React.MutableRefObject<CanvasElement[][]>
    redoRef: React.MutableRefObject<CanvasElement[][]>
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
    isDrawingLaserRef: React.MutableRefObject<boolean>
    selectedToolRef: React.MutableRefObject<ToolType>
    laserFadeOutStartRef: React.MutableRefObject<number | null>
    lastTextClickRef: React.MutableRefObject<{ id: string | null; time: number }>
    needsRedrawRef: React.MutableRefObject<boolean>
    eraserTrailHistoryRef: React.MutableRefObject<Array<{ x: number; y: number; timestamp: number; alpha: number; trailId: number }>>
    currentEraserTrailIdRef: React.MutableRefObject<number>
    isDrawingEraserRef: React.MutableRefObject<boolean>
    markedForErasureIds: Set<string>
    setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>
    setIsDrawing: React.Dispatch<React.SetStateAction<boolean>>
    setIsPanning: React.Dispatch<React.SetStateAction<boolean>>
    setIsMiddleButtonDown: React.Dispatch<React.SetStateAction<boolean>>
    setIsResizing: React.Dispatch<React.SetStateAction<string | null>>
    setIsDragging: React.Dispatch<React.SetStateAction<boolean>>
    setIsSelecting: React.Dispatch<React.SetStateAction<boolean>>
    setDragStart: React.Dispatch<React.SetStateAction<Point | null>>
    setDraggingControlPointId: React.Dispatch<React.SetStateAction<string | null>>
    setEditingTextId: React.Dispatch<React.SetStateAction<string | null>>
    setEditingTextValue: React.Dispatch<React.SetStateAction<string>>
    setEditingTextPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>
    setElements: React.Dispatch<React.SetStateAction<CanvasElement[]>>
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
    setImageClickPosition: React.Dispatch<React.SetStateAction<Point | null>>
    setStickerClickPosition: React.Dispatch<React.SetStateAction<Point | null>>
    setLaserPointerOutline: React.Dispatch<React.SetStateAction<LaserPoint[]>>
    setLaserPointerOpacity: React.Dispatch<React.SetStateAction<number>>
    setShouldFadeOut: React.Dispatch<React.SetStateAction<boolean>>
    setSelectionBox: React.Dispatch<React.SetStateAction<{ start: Point; end: Point } | null>>
    setTempSticker: React.Dispatch<React.SetStateAction<{ start: Point; end: Point } | null>>
    setMarkedForErasureIds: React.Dispatch<React.SetStateAction<Set<string>>>
  }
) {
  if (context.isLocked) return

  const target = e.target as HTMLElement
  if (target.closest('.fixed') || target.closest('[class*="OptionsPanel"]')) {
    return
  }

  if (context.editingTextId && context.textInputRef.current && !(context.textInputRef.current as any).contains?.(e.target as Node)) {
    if (target.tagName !== 'TEXTAREA' && !target.closest('textarea')) {
      if (context.editingTextValue.trim() === '') {
        context.setElements(prev => prev.filter(el => el.id !== context.editingTextId))
      }
      context.setEditingTextId(null)
      context.setEditingTextValue('')
      context.setEditingTextPosition(null)
      context.needsRedrawRef.current = true
    }
  }

  if (e.button === 1) {
    e.preventDefault()
    context.setIsMiddleButtonDown(true)
    context.setIsPanning(true)
    return
  }

  if (context.selectedTool === 'pan') {
    context.setIsPanning(true)
    return
  } else if (context.selectedTool === 'pen') {
    context.setSelectedIds([])
    context.setIsDrawing(true)
    context.setTempPath([pos])
  } else if (context.selectedTool === 'laser') {
    context.setSelectedIds([])
    context.setIsDrawing(true)
    context.isDrawingLaserRef.current = true
    context.selectedToolRef.current = 'laser'
    if (!context.laserPointerRef.current) {
      context.laserPointerRef.current = new LaserPointerManagerClass({
        size: 2,
        streamline: 0.42,
        simplify: 0.1,
        simplifyPhase: 'output',
        keepHead: false,
      })
    }
    const laserPoint: LaserPoint = [pos.x, pos.y, 1]
    context.laserPointerRef.current.start(laserPoint)
    context.setLaserPointerOutline([])
    context.setLaserPointerOpacity(0.8)
    context.laserFadeOutStartRef.current = null
    context.setShouldFadeOut(false)
    context.currentTrailIdRef.current = context.currentTrailIdRef.current + 1
  } else if (context.selectedTool === 'eraser') {
    context.setSelectedIds([])
    context.setIsDrawing(true)
    context.isDrawingEraserRef.current = true
    context.selectedToolRef.current = 'eraser'
    context.currentEraserTrailIdRef.current = context.currentEraserTrailIdRef.current + 1
    context.eraserTrailHistoryRef.current.push({
      x: pos.x,
      y: pos.y,
      timestamp: Date.now(),
      alpha: 1.0,
      trailId: context.currentEraserTrailIdRef.current
    })
  } else if (context.selectedTool === 'rectangle') {
    context.setSelectedIds([])
    context.setIsDrawing(true)
    context.setTempRect({ start: pos, end: pos })
  } else if (context.selectedTool === 'diamond') {
    context.setSelectedIds([])
    context.setIsDrawing(true)
    context.setTempDiamond({ start: pos, end: pos })
  } else if (context.selectedTool === 'circle') {
    context.setSelectedIds([])
    context.setIsDrawing(true)
    context.setTempCircle({ center: pos, radius: 0 })
  } else if (context.selectedTool === 'line') {
    const clickedElement = [...context.elements].reverse().find(el => {
      if (el.type === 'line') return isPointNearLine(pos, el)
      if (el.type === 'arrow') return isPointNearArrow(pos, el)
      return false
    })
    if (clickedElement) {
      context.setSelectedIds([clickedElement.id])
      context.setIsDragging(true)
      context.setDragStart(pos)
      context.historyRef.current.push([...context.elements])
      context.redoRef.current = []
      return
    }
    context.setSelectedIds([])
    context.setIsDrawing(true)
    context.setTempLine({ start: pos, end: pos })
  } else if (context.selectedTool === 'arrow') {

    if (context.selectedIds.length === 1) {
      const selectedEl = context.elements.find(e => e.id === context.selectedIds[0])
      if (selectedEl?.type === 'arrow' && isPointNearControlPoint(pos, selectedEl)) {
        context.historyRef.current.push([...context.elements])
        context.redoRef.current = []
        context.setDraggingControlPointId(selectedEl.id)
        return
      }
    }

    const clickedElement = [...context.elements].reverse().find(el => {
      if (el.type === 'line') return isPointNearLine(pos, el)
      if (el.type === 'arrow') {
        if (el.arrowType === 'curved' && isPointNearControlPoint(pos, el)) {
          return true
        }
        return isPointNearArrow(pos, el)
      }
      return false
    })
    if (clickedElement) {
      if (clickedElement.type === 'arrow' && clickedElement.arrowType === 'curved' && isPointNearControlPoint(pos, clickedElement)) {
        context.setSelectedIds([clickedElement.id])
        context.historyRef.current.push([...context.elements])
        context.redoRef.current = []
        context.setDraggingControlPointId(clickedElement.id)
        return
      }
      context.setSelectedIds([clickedElement.id])
      context.setIsDragging(true)
      context.setDragStart(pos)
      context.historyRef.current.push([...context.elements])
      context.redoRef.current = []
      return
    }
    context.setSelectedIds([])
    context.setIsDrawing(true)
    context.setTempArrow({ start: pos, end: pos })
  } else if (context.selectedTool === 'text') {
    context.setSelectedIds([])
    context.setIsDrawing(true)
    context.setTempTextRect({ start: pos, end: pos })
  } else if (context.selectedTool === 'lasso') {
    context.setSelectedIds([])
    context.setIsDrawing(true)
    context.setTempLassoPath([pos])
  } else if (context.selectedTool === 'frame') {
    context.setSelectedIds([])
    context.setIsDrawing(true)
    context.setTempFrame({ start: pos, end: pos })
  } else if (context.selectedTool === 'embed') {
    context.setSelectedIds([])
    context.setIsDrawing(true)
    context.setTempEmbed({ start: pos, end: pos })
  } else if (context.selectedTool === 'sticker') {
    context.setSelectedIds([])
    context.setStickerClickPosition(pos)
  } else if (context.selectedTool === 'image') {
    context.setSelectedIds([])
    context.setImageClickPosition(pos)
  } else if (context.selectedTool === 'select') {
    if (context.selectedIds.length === 1) {
      const el = context.elements.find(e => e.id === context.selectedIds[0])
      if (el?.type === 'rect') {
        const handle = getResizeHandle(pos, el)
        if (handle) {
          context.historyRef.current.push([...context.elements])
          context.redoRef.current = []
          context.setIsResizing(handle)
          context.setDragStart(pos)
          return
        }
      } else if (el?.type === 'embed' || el?.type === 'image') {
        const handle = getResizeHandle(pos, el)
        if (handle) {
          context.historyRef.current.push([...context.elements])
          context.redoRef.current = []
          context.setIsResizing(handle)
          context.setDragStart(pos)
          return
        }
      } else if (el?.type === 'sticker') {
        const handle = getResizeHandle(pos, el)
        if (handle) {
          context.historyRef.current.push([...context.elements])
          context.redoRef.current = []
          context.setIsResizing(handle)
          context.setDragStart(pos)
          return
        }
      } else if (el?.type === 'diamond') {
        const handle = getDiamondResizeHandle(pos, el)
        if (handle) {
          context.historyRef.current.push([...context.elements])
          context.redoRef.current = []
          context.setIsResizing(handle)
          context.setDragStart(pos)
          return
        }
      } else if (el?.type === 'circle') {
        const handle = getCircleResizeHandle(pos, el)
        if (handle) {
          context.historyRef.current.push([...context.elements])
          context.redoRef.current = []
          context.setIsResizing(handle)
          context.setDragStart(pos)
          return
        }
      } else if (el?.type === 'line') {
        const handle = getLineResizeHandle(pos, el)
        if (handle) {
          context.historyRef.current.push([...context.elements])
          context.redoRef.current = []
          context.setIsResizing(handle)
          context.setDragStart(pos)
          return
        }
      } else if (el?.type === 'arrow') {
        if (isPointNearControlPoint(pos, el)) {
          context.historyRef.current.push([...context.elements])
          context.redoRef.current = []
          context.setDraggingControlPointId(el.id)
          return
        }

        const handle = getArrowResizeHandle(pos, el)
        if (handle) {
          context.historyRef.current.push([...context.elements])
          context.redoRef.current = []
          context.setIsResizing(handle)
          context.setDragStart(pos)
          return
        }
      } else if (el?.type === 'text') {
        const handle = getTextResizeHandle(pos, el)
        if (handle) {
          context.historyRef.current.push([...context.elements])
          context.redoRef.current = []
          const textEl = el as TextElement
          const { width: currentWidth, height: currentHeight } = getTextDimensions(textEl)

          context.textResizeInitialStateRef.current = {
            fontSize: textEl.fontSize,
            width: currentWidth,
            height: currentHeight,
            x: textEl.x,
            y: textEl.y,
            boxX: textEl.x,
            boxWidth: currentWidth
          }
          context.setIsResizing(handle)
          context.setDragStart(pos)
          return
        }
      } else if (el?.type === 'frame') {
        const handle = getFrameResizeHandle(pos, el)
        if (handle) {
          context.historyRef.current.push([...context.elements])
          context.redoRef.current = []
          context.setIsResizing(handle)
          context.setDragStart(pos)
          return
        }
      } else if (el?.type === 'path') {

        const handle = getPathResizeHandle(pos, el)
        if (handle) {
          context.historyRef.current.push([...context.elements])
          context.redoRef.current = []
          context.setIsResizing(handle)
          context.setDragStart(pos)
          return
        }
      }
    }

    let clickedSelected = false
    for (const id of context.selectedIds) {
      const el = context.elements.find(e => e.id === id)
      if (!el) continue

      if (el.type === 'rect' && pos.x >= el.x && pos.x <= el.x + el.width && pos.y >= el.y && pos.y <= el.y + el.height) {
        clickedSelected = true
        break
      } else if (el.type === 'diamond' && isPointInDiamond(pos, el)) {
        clickedSelected = true
        break
      } else if (el.type === 'circle' && isPointInCircle(pos, el)) {
        clickedSelected = true
        break
      } else if (el.type === 'path') {
        if (el.bounds) {
          const padding = 5
          if (pos.x >= el.bounds.minX - padding && pos.x <= el.bounds.maxX + padding &&
            pos.y >= el.bounds.minY - padding && pos.y <= el.bounds.maxY + padding) {
            clickedSelected = true
            break
          }
        }
        if (isPointNearPath(pos, el)) {
          clickedSelected = true
          break
        }
      } else if (el.type === 'line' && isPointNearLine(pos, el)) {
        clickedSelected = true
        break
      } else if (el.type === 'arrow' && isPointNearArrow(pos, el)) {
        clickedSelected = true
        break
      } else if (el.type === 'text') {
        const handle = getTextResizeHandle(pos, el)
        if (!handle && isPointInText(pos, el)) {
          clickedSelected = true
          break
        }
      } else if (el.type === 'image' && isPointInImage(pos, el)) {
        clickedSelected = true
        break
      } else if (el.type === 'embed') {
        if (isPointOnEmbedBorder(pos, el)) {
          clickedSelected = true
          break
        }
        break
      }
      else if (el.type === 'sticker') {
        if (pos.x >= el.x && pos.x <= el.x + el.width && pos.y >= el.y && pos.y <= el.y + el.height) {
          clickedSelected = true
          break
        }
      } else if (el.type === 'frame') {

        const handle = getFrameResizeHandle(pos, el)

        if (handle) {

          break
        }

        const frameElements = getFrameElements(el, context.elements)

        let clickedOnElementInside = false

        for (const innerEl of frameElements) {

          if (context.selectedIds.includes(innerEl.id)) continue

          if (innerEl.type === 'rect' && pos.x >= innerEl.x && pos.x <= innerEl.x + innerEl.width && pos.y >= innerEl.y && pos.y <= innerEl.y + innerEl.height) {
            clickedOnElementInside = true
            break
          } else if (innerEl.type === 'diamond' && isPointInDiamond(pos, innerEl)) {
            clickedOnElementInside = true
            break
          } else if (innerEl.type === 'circle' && isPointInCircle(pos, innerEl)) {
            clickedOnElementInside = true
            break
          } else if (innerEl.type === 'path' && isPointNearPath(pos, innerEl)) {
            clickedOnElementInside = true
            break
          } else if (innerEl.type === 'line' && isPointNearLine(pos, innerEl)) {
            clickedOnElementInside = true
            break
          } else if (innerEl.type === 'arrow' && isPointNearArrow(pos, innerEl)) {
            clickedOnElementInside = true
            break
          } else if (innerEl.type === 'text' && isPointInText(pos, innerEl)) {
            clickedOnElementInside = true
            break
          } else if (innerEl.type === 'image' && isPointInImage(pos, innerEl)) {
            clickedOnElementInside = true
            break
          }
        }

        if (!clickedOnElementInside && isPointOnFrame(pos, el)) {
          clickedSelected = true
          break
        }
      }
    }

    if (clickedSelected) {
      context.historyRef.current.push([...context.elements])
      context.redoRef.current = []

      const draggedFrames = context.elements.filter(
        el => context.selectedIds.includes(el.id) && el.type === 'frame'
      ) as FrameElement[]

      context.frameDragInitialElementsRef.current.clear()
      draggedFrames.forEach(frame => {
        const frameElements = getFrameElements(frame, context.elements)
        frameElements.forEach(el => {
          context.frameDragInitialElementsRef.current.add(el.id)
        })
      })

      context.setIsDragging(true)
      context.setDragStart(pos)
      return
    }

    let found: string | null = null
    for (let i = context.elements.length - 1; i >= 0; i--) {
      const el = context.elements[i]
      if (context.selectedIds.includes(el.id)) continue

      if (el.type === 'rect' && pos.x >= el.x && pos.x <= el.x + el.width && pos.y >= el.y && pos.y <= el.y + el.height) {
        found = el.id
        break
      } else if (el.type === 'diamond' && isPointInDiamond(pos, el)) {
        found = el.id
        break
      } else if (el.type === 'circle' && isPointInCircle(pos, el)) {
        found = el.id
        break
      } else if (el.type === 'path' && isPointNearPath(pos, el)) {
        found = el.id
        break
      } else if (el.type === 'line' && isPointNearLine(pos, el)) {
        found = el.id
        break
      } else if (el.type === 'arrow' && isPointNearArrow(pos, el)) {
        found = el.id
        break
      } else if (el.type === 'text' && isPointInText(pos, el)) {
        found = el.id
        break
      } else if (el.type === 'image' && isPointInImage(pos, el)) {
        found = el.id
        break
      } else if (el.type === 'embed') {
        if (pos.x >= el.x && pos.x <= el.x + el.width && pos.y >= el.y && pos.y <= el.y + el.height) {
          found = el.id
          break
        }
      } else if (el.type === 'sticker') {
        if (pos.x >= el.x && pos.x <= el.x + el.width && pos.y >= el.y && pos.y <= el.y + el.height) {
          found = el.id
          break
        }
      } else if (el.type === 'frame' && isPointOnFrameBorder(pos, el)) {
        found = el.id
        break
      }
    }

    if (found) {
      context.setSelectedIds([found])
      const foundEl = context.elements.find(e => e.id === found)
      if (foundEl?.type === 'text') {
        const now = Date.now()
        if (context.lastTextClickRef.current.id === found && now - context.lastTextClickRef.current.time < 300) {
          context.setEditingTextId(found)
          context.setEditingTextValue(foundEl.text)
          context.setEditingTextPosition({ x: foundEl.x, y: foundEl.y })
        }
        context.lastTextClickRef.current = { id: found, time: now }
      }
    } else {
      context.setSelectedIds([])
      context.setIsSelecting(true)
      context.setSelectionBox({ start: pos, end: pos })
    }
  }
}