// REFACTOR 

import type { Point, CanvasElement, TextElement, FrameElement } from '../shared'
import type { ToolType } from '../../Toolbar'
import type { LaserPointerManager } from '../lasterPointer'
import { calculatePathBounds } from '../pen'
import { isElementInBox } from '../shared/selection'
import { isElementInLasso } from '../lassoSelection'
import type { PenOptions } from '../../options/penOptionsPanel'
import type { RectangleOptions } from '../../options/rectangleOptionsPanel'
import type { DiamondOptions } from '../../options/diamondOptionsPanel'
import type { CircleOptions } from '../../options/circleOptionsPanel'
import type { LineOptions } from '../../options/lineOptionsPanel'
import type { ArrowOptions } from '../../options/arrowOptionsPanel'
import type { TextOptions } from '../../options/textOptionsPanel'
import type { FrameOptions } from '../../options/frameOptionsPanel'

export function handleMouseUp(
  e: React.MouseEvent | undefined,
  context: {
    isMiddleButtonDown: boolean
    isDrawing: boolean
    selectedTool: ToolType
    isSelecting: boolean
    selectionBox: { start: Point; end: Point } | null
    tempPath: Point[]
    tempRect: { start: Point; end: Point } | null
    tempDiamond: { start: Point; end: Point } | null
    tempCircle: { center: Point; radius: number } | null
    tempLine: { start: Point; end: Point } | null
    tempArrow: { start: Point; end: Point } | null
    tempTextRect: { start: Point; end: Point } | null
    tempLassoPath: Point[]
    tempFrame: { start: Point; end: Point } | null
    tempEmbed: { start: Point; end: Point } | null
    tempSticker: { start: Point; end: Point } | null
    elements: CanvasElement[]
    canvasRef: React.RefObject<HTMLCanvasElement | null>
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
    laserPointerRef: React.MutableRefObject<LaserPointerManager | null>
    isDrawingLaserRef: React.MutableRefObject<boolean>
    isDrawingEraserRef: React.MutableRefObject<boolean>
    lastPathIdRef: React.MutableRefObject<string | null>
    needsRedrawRef: React.MutableRefObject<boolean>
    eraserTrailHistoryRef: React.MutableRefObject<Array<{ x: number; y: number; timestamp: number; alpha: number; trailId: number }>>
    penOptions: PenOptions
    rectOptions: RectangleOptions
    diamondOptions: DiamondOptions
    circleOptions: CircleOptions
    lineOptions: LineOptions
    arrowOptions: ArrowOptions
    textOptions: TextOptions
    frameOptions: FrameOptions
    embedOptions: { url: string; opacity: number }
    stickerOptions: { opacity: number }
    stickerImage: string | null
    setIsMiddleButtonDown: React.Dispatch<React.SetStateAction<boolean>>
    setIsPanning: React.Dispatch<React.SetStateAction<boolean>>
    setIsDrawing: React.Dispatch<React.SetStateAction<boolean>>
    setIsDragging: React.Dispatch<React.SetStateAction<boolean>>
    setIsResizing: React.Dispatch<React.SetStateAction<string | null>>
    setIsSelecting: React.Dispatch<React.SetStateAction<boolean>>
    setSelectionBox: React.Dispatch<React.SetStateAction<{ start: Point; end: Point } | null>>
    setDraggingControlPointId: React.Dispatch<React.SetStateAction<string | null>>
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
    setElements: React.Dispatch<React.SetStateAction<CanvasElement[]>>
    setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>
    setEditingTextId: React.Dispatch<React.SetStateAction<string | null>>
    setEditingTextValue: React.Dispatch<React.SetStateAction<string>>
    setEditingTextPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>
    setTextareaHeight: React.Dispatch<React.SetStateAction<number>>
    markedForErasureIds: Set<string>
    setMarkedForErasureIds: React.Dispatch<React.SetStateAction<Set<string>>>
  }
) {
  if (context.isMiddleButtonDown) {
    context.setIsMiddleButtonDown(false)
    if (e?.button === 1) {
      e.preventDefault()
    }
  }
  context.setIsPanning(false)

  if (context.isDrawing) {
    if (context.selectedTool === 'laser' && context.laserPointerRef.current) {
      context.laserPointerRef.current.close()
      context.isDrawingLaserRef.current = false
      context.setIsDrawing(false)
      context.laserPointerRef.current = null
    } else if (context.selectedTool === 'eraser') {
      if (context.markedForErasureIds.size > 0) {
        context.historyRef.current.push([...context.elements])
        context.redoRef.current = []
        context.setElements(prev => prev.filter(el => !context.markedForErasureIds.has(el.id)))
        context.setMarkedForErasureIds(new Set())
      }
      context.isDrawingEraserRef.current = false
      context.setIsDrawing(false)
    } else if (context.selectedTool === 'pen' && context.tempPath.length > 1) {
      const bounds = calculatePathBounds(context.tempPath)
      context.historyRef.current.push([...context.elements])
      context.redoRef.current = []
      const newId = `path-${Date.now()}`
      context.lastPathIdRef.current = newId
      context.setElements(prev => [...prev, {
        id: newId,
        type: 'path',
        points: context.tempPath,
        color: context.penOptions.strokeColor,
        width: context.penOptions.strokeWidth,
        opacity: context.penOptions.opacity / 100,
        bounds
      }])
      context.setTempPath([])
    } else if (context.selectedTool === 'rectangle' && context.tempRect) {
      const x = Math.min(context.tempRect.start.x, context.tempRect.end.x)
      const y = Math.min(context.tempRect.start.y, context.tempRect.end.y)
      const w = Math.abs(context.tempRect.end.x - context.tempRect.start.x)
      const h = Math.abs(context.tempRect.end.y - context.tempRect.start.y)
      if (w > 5 && h > 5) {
        context.historyRef.current.push([...context.elements])
        context.redoRef.current = []
        const newId = `rect-${Date.now()}`
        context.setElements(prev => [...prev, {
          id: newId,
          type: 'rect',
          x, y, width: w, height: h,
          strokeColor: context.rectOptions.strokeColor,
          fillColor: context.rectOptions.fillColor || undefined,
          strokeWidth: context.rectOptions.strokeWidth,
          strokeStyle: context.rectOptions.strokeStyle,
          opacity: context.rectOptions.opacity / 100
        }])
        context.setSelectedIds([newId])
      }
      context.setTempRect(null)
    } else if (context.selectedTool === 'diamond' && context.tempDiamond) {
      const x = Math.min(context.tempDiamond.start.x, context.tempDiamond.end.x)
      const y = Math.min(context.tempDiamond.start.y, context.tempDiamond.end.y)
      const w = Math.abs(context.tempDiamond.end.x - context.tempDiamond.start.x)
      const h = Math.abs(context.tempDiamond.end.y - context.tempDiamond.start.y)
      if (w > 5 && h > 5) {
        context.historyRef.current.push([...context.elements])
        context.redoRef.current = []
        const newId = `diamond-${Date.now()}`
        context.setElements(prev => [...prev, {
          id: newId,
          type: 'diamond',
          x, y, width: w, height: h,
          strokeColor: context.diamondOptions.strokeColor,
          fillColor: context.diamondOptions.fillColor || undefined,
          strokeWidth: context.diamondOptions.strokeWidth,
          strokeStyle: context.diamondOptions.strokeStyle,
          opacity: context.diamondOptions.opacity / 100
        }])
        context.setSelectedIds([newId])
      }
      context.setTempDiamond(null)
    } else if (context.selectedTool === 'circle' && context.tempCircle && context.tempCircle.radius > 5) {
      context.historyRef.current.push([...context.elements])
      context.redoRef.current = []
      const newId = `circle-${Date.now()}`
      context.setElements(prev => [...prev, {
        id: newId,
        type: 'circle',
        x: context.tempCircle!.center.x,
        y: context.tempCircle!.center.y,
        radius: context.tempCircle!.radius,
        strokeColor: context.circleOptions.strokeColor,
        fillColor: context.circleOptions.fillColor || undefined,
        strokeWidth: context.circleOptions.strokeWidth,
        strokeStyle: context.circleOptions.strokeStyle,
        opacity: context.circleOptions.opacity / 100
      }])
      context.setSelectedIds([newId])
      context.setTempCircle(null)
    } else if (context.selectedTool === 'line' && context.tempLine) {
      const distance = Math.hypot(context.tempLine.end.x - context.tempLine.start.x, context.tempLine.end.y - context.tempLine.start.y)
      if (distance > 5) {
        context.historyRef.current.push([...context.elements])
        context.redoRef.current = []
        const newId = `line-${Date.now()}`
        context.setElements(prev => [...prev, {
          id: newId,
          type: 'line',
          start: context.tempLine!.start,
          end: context.tempLine!.end,
          strokeColor: context.lineOptions.strokeColor,
          strokeWidth: context.lineOptions.strokeWidth,
          strokeStyle: context.lineOptions.strokeStyle,
          opacity: context.lineOptions.opacity / 100
        }])
        context.setSelectedIds([newId])
      }
      context.setTempLine(null)
    } else if (context.selectedTool === 'arrow' && context.tempArrow) {
      const distance = Math.hypot(context.tempArrow.end.x - context.tempArrow.start.x, context.tempArrow.end.y - context.tempArrow.start.y)
      if (distance > 5) {
        context.historyRef.current.push([...context.elements])
        context.redoRef.current = []
        const newId = `arrow-${Date.now()}`
        context.setElements(prev => [...prev, {
          id: newId,
          type: 'arrow',
          start: context.tempArrow!.start,
          end: context.tempArrow!.end,
          strokeColor: context.arrowOptions.strokeColor,
          strokeWidth: context.arrowOptions.strokeWidth,
          strokeStyle: context.arrowOptions.strokeStyle,
          arrowStart: context.arrowOptions.arrowStart,
          arrowEnd: context.arrowOptions.arrowEnd,
          arrowType: context.arrowOptions.arrowType,
          opacity: context.arrowOptions.opacity / 100
        }])
        context.setSelectedIds([newId])
      }
      context.setTempArrow(null)
    } else if (context.selectedTool === 'text' && context.tempTextRect) {
      const x = Math.min(context.tempTextRect.start.x, context.tempTextRect.end.x)
      const y = Math.min(context.tempTextRect.start.y, context.tempTextRect.end.y)
      const w = Math.abs(context.tempTextRect.end.x - context.tempTextRect.start.x)
      const h = Math.abs(context.tempTextRect.end.y - context.tempTextRect.start.y)
      if (w > 10 && h > 10) {
        context.historyRef.current.push([...context.elements])
        context.redoRef.current = []
        const newId = `text-${Date.now()}`
        const newTextElement: TextElement = {
          id: newId,
          type: 'text',
          x: x,
          y: y,
          text: '',
          color: context.textOptions.color,
          fontSize: context.textOptions.fontSize,
          fontFamily: context.textOptions.fontFamily,
          fontWeight: context.textOptions.fontWeight,
          fontStyle: context.textOptions.fontStyle,
          textAlign: context.textOptions.textAlign,
          opacity: context.textOptions.opacity / 100,
          width: w,
          height: h
        }
        context.setElements(prev => [...prev, newTextElement])
        setTimeout(() => {
          context.setEditingTextId(newId)
          context.setEditingTextValue('')
          context.setEditingTextPosition({ x, y })
          context.setTextareaHeight(h)
          context.setSelectedIds([newId])
        }, 10)
      }
      context.setTempTextRect(null)
    } else if (context.selectedTool === 'lasso') {
      const lassoPath = context.tempLassoPath || []
      if (lassoPath.length >= 3) {
        const selected = context.elements.filter(el =>
          isElementInLasso(el, lassoPath, context.canvasRef.current ?? undefined)
        ).map(el => el.id)
        context.setSelectedIds(selected)
      }
      context.setTempLassoPath([])
    } else if (context.selectedTool === 'frame' && context.tempFrame) {
      const x = Math.min(context.tempFrame.start.x, context.tempFrame.end.x)
      const y = Math.min(context.tempFrame.start.y, context.tempFrame.end.y)
      const w = Math.abs(context.tempFrame.end.x - context.tempFrame.start.x)
      const h = Math.abs(context.tempFrame.end.y - context.tempFrame.start.y)

      if (w > 50 && h > 50) {
        context.historyRef.current.push([...context.elements])
        context.redoRef.current = []

        const frames = context.elements.filter((el): el is FrameElement => el.type === 'frame')
        const maxLayer = frames.length > 0
          ? Math.max(...frames.map(f => f.layer))
          : 0

        const newFrame: FrameElement = {
          id: `frame-${Date.now()}`,
          type: 'frame',
          x,
          y,
          width: w,
          height: h,
          layer: maxLayer + 1,
          opacity: context.frameOptions.opacity / 100
        }

        context.setElements(prev => [...prev, newFrame])
        context.setSelectedIds([newFrame.id])
      }
      context.setTempFrame(null)
    } else if (context.selectedTool === 'embed' && context.tempEmbed) {
      const x = Math.min(context.tempEmbed.start.x, context.tempEmbed.end.x)
      const y = Math.min(context.tempEmbed.start.y, context.tempEmbed.end.y)
      const w = Math.abs(context.tempEmbed.end.x - context.tempEmbed.start.x)
      const h = Math.abs(context.tempEmbed.end.y - context.tempEmbed.start.y)

      if (w > 50 && h > 50) {
        context.historyRef.current.push([...context.elements])
        context.redoRef.current = []

        const newEmbed = {
          id: `embed-${Date.now()}`,
          type: 'embed' as const,
          x,
          y,
          width: w,
          height: h,
          url: '',
          opacity: context.embedOptions.opacity / 100
        }

        context.setElements(prev => [...prev, newEmbed])
        context.setSelectedIds([newEmbed.id])
      }
      context.setTempEmbed(null)
    } else if (context.selectedTool === 'sticker' && context.tempSticker && context.stickerImage) {
      const x = Math.min(context.tempSticker.start.x, context.tempSticker.end.x)
      const y = Math.min(context.tempSticker.start.y, context.tempSticker.end.y)
      const w = Math.abs(context.tempSticker.end.x - context.tempSticker.start.x)
      const h = Math.abs(context.tempSticker.end.y - context.tempSticker.start.y)

      if (w > 20 && h > 20) {
        context.historyRef.current.push([...context.elements])
        context.redoRef.current = []

        const newSticker = {
          id: `sticker-${Date.now()}`,
          type: 'sticker' as const,
          x,
          y,
          width: w,
          height: h,
          src: context.stickerImage,
          opacity: context.stickerOptions.opacity / 100
        }

        context.setElements(prev => [...prev, newSticker])
        context.setSelectedIds([newSticker.id])
      }
      context.setTempSticker(null)
    }
    context.setIsDrawing(false)
  }

  if (context.isSelecting && context.selectionBox) {
    const selected = context.elements.filter(el => isElementInBox(el, context.selectionBox!, context.canvasRef.current ?? undefined)).map(el => el.id)
    context.setSelectedIds(selected)
    context.setSelectionBox(null)
    context.setIsSelecting(false)
  }

  context.setIsDragging(false)
  context.setIsResizing(null)
  context.textResizeInitialStateRef.current = null
  context.setIsSelecting(false)
  context.setDraggingControlPointId(null)
  context.needsRedrawRef.current = true
}