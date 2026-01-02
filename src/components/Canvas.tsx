'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { Toolbar, ToolType } from './Toolbar'
import { Menu } from './Menu'
import { RectangleOptionsPanel, RectangleOptions } from './options/rectangleOptionsPanel'
import { DiamondOptionsPanel, DiamondOptions } from './options/diamondOptionsPanel'
import { CircleOptionsPanel, CircleOptions } from './options/circleOptionsPanel'
import { PenOptionsPanel, PenOptions } from './options/penOptionsPanel'
import { LineOptionsPanel, LineOptions } from './options/lineOptionsPanel'
import { ArrowOptionsPanel, ArrowOptions } from './options/arrowOptionsPanel'
import { TextOptionsPanel, TextOptions } from './options/textOptionsPanel'
import { ImageOptionsPanel, ImageOptions } from './options/imageOptionsPanel'
import { FrameOptionsPanel, FrameOptions } from './options/frameOptionsPanel'
import { EmbedOptionsPanel, EmbedOptions } from './options/embedOptionsPanel'
import { StickerOptionsPanel, StickerOptions } from './options/stickerOptionsPanel'
import { ZoomControls } from './zoomControls'
import { LaserPointerManager } from './canvas/lasterPointer'
import type { Point as LaserPoint } from './canvas/lasterPointer/types'
import { useUIPosition, type MenuPosition, type UIPositions } from '@/hooks/useUIPosition'
import { useTheme } from '@/hooks/useTheme'

import { Grid as SvgGrid, ElementRenderer, Selection, TempElements } from './canvas/svg'

import type { CanvasElement, Point, TextElement, ImageElement, StickerElement } from './canvas/shared'

import { isPointInText } from './canvas/text'
import { handleMouseDown, handleMouseMove, handleMouseUp, setupKeyboardHandlers } from './canvas/events'
import { getCursor } from './canvas/utils/cursor'
import { getSelectedElementType, getSelectedElementOptions, updateSelectedElements } from './canvas/utils/elementOptions'
import { handleUndo, handleRedo } from './canvas/utils/history'
import { saveAsset } from '@/lib/assetStore'
import { handleSaveAs, handleExportImage } from './canvas/utils/export'
import { handleOpen } from './canvas/utils/import'
import { generateTestWorkspace } from './canvas/utils/testWorkspace'
import { FindOnCanvas } from './sidebar/FindOnCanvas'
import { WorkspacesSidebar } from './sidebar/Workspaces'
import { useWorkspaces } from '@/hooks/useWorkspaces'
import { DebuggerOverlay } from './debugger/overlay/basic'
import { DropImport } from './prompts/DropImport'
import { useAuth } from '@/hooks/useAuth'

export function Canvas() {
  const laserCanvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const transformRef = useRef<any>(null)
  const needsRedrawRef = useRef(true)
  const scaleChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isZoomingRef = useRef(false)
  const { positions, updatePositions: updateUIPositions } = useUIPosition()
  const { resolvedTheme, setTheme, canvasColor } = useTheme()
  const [isDropImportOpen, setIsDropImportOpen] = useState(false)

  const {
    workspaces,
    activeWorkspaceId,
    createWorkspace,
    deleteWorkspace,
    switchWorkspace,
    saveWorkspaceData,
    loadWorkspaceData,
    isLoaded: isWorkspacesLoaded
  } = useWorkspaces()

  const [isWorkspacesSidebarOpen, setIsWorkspacesSidebarOpen] = useState(false)
  const isWorkspaceLoadingRef = useRef(false)

  const updatePositions = useCallback((updates: Partial<UIPositions>) => {
    updateUIPositions(updates)
  }, [updateUIPositions])



  const handleZoomPosChange = useCallback((pos: MenuPosition) => updatePositions({ zoom: pos }), [updatePositions])

  const handleDragPreviewZoom = useCallback((pos: MenuPosition | null) => setDragSnapPreview(pos ? { type: 'zoom', position: pos } : null), [])
  const [elements, setElements] = useState<CanvasElement[]>([])
  const [selectedTool, setSelectedTool] = useState<ToolType>('pan')
  const [isLocked, setIsLocked] = useState(false)
  const [isFindSidebarOpen, setIsFindSidebarOpen] = useState(false)

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState<string | null>(null)
  const [isPanning, setIsPanning] = useState(false)
  const [isMiddleButtonDown, setIsMiddleButtonDown] = useState(false)
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionBox, setSelectionBox] = useState<{ start: Point; end: Point } | null>(null)
  const [dragStart, setDragStart] = useState<Point | null>(null)
  const [hoverHandle, setHoverHandle] = useState<string | null>(null)
  const [hoverElement, setHoverElement] = useState<string | null>(null)
  const historyRef = useRef<CanvasElement[][]>([])
  const redoRef = useRef<CanvasElement[][]>([])
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const textResizeInitialStateRef = useRef<{ fontSize: number; width: number; height: number; x: number; y: number; boxX: number; boxWidth: number } | null>(null)
  const frameDragInitialElementsRef = useRef<Set<string>>(new Set())
  const [tempPath, setTempPath] = useState<Point[]>([])
  const [tempLassoPath, setTempLassoPath] = useState<Point[]>([])
  const [tempRect, setTempRect] = useState<{ start: Point; end: Point } | null>(null)
  const [tempDiamond, setTempDiamond] = useState<{ start: Point; end: Point } | null>(null)
  const [tempCircle, setTempCircle] = useState<{ center: Point; radius: number } | null>(null)
  const [tempLine, setTempLine] = useState<{ start: Point; end: Point } | null>(null)
  const [tempArrow, setTempArrow] = useState<{ start: Point; end: Point } | null>(null)
  const [tempTextRect, setTempTextRect] = useState<{ start: Point; end: Point } | null>(null)
  const [tempFrame, setTempFrame] = useState<{ start: Point; end: Point } | null>(null)
  const [tempEmbed, setTempEmbed] = useState<{ start: Point; end: Point } | null>(null)
  const [tempSticker, setTempSticker] = useState<{ start: Point; end: Point } | null>(null)
  const [imageClickPosition, setImageClickPosition] = useState<Point | null>(null)
  const [stickerClickPosition, setStickerClickPosition] = useState<Point | null>(null)
  const [isShiftPressed, setIsShiftPressed] = useState(false)
  const [draggingControlPointId, setDraggingControlPointId] = useState<string | null>(null)
  const [clipboard, setClipboard] = useState<CanvasElement[]>([])
  const laserPointerRef = useRef<LaserPointerManager | null>(null)
  const [laserPointerOutline, setLaserPointerOutline] = useState<LaserPoint[]>([])
  const [laserPointerOpacity, setLaserPointerOpacity] = useState(0.8)
  const laserFadeOutStartRef = useRef<number | null>(null)
  const [shouldFadeOut, setShouldFadeOut] = useState(false)
  const laserTrailHistoryRef = useRef<Array<{ x: number; y: number; timestamp: number; alpha: number; trailId: number }>>([])
  const currentTrailIdRef = useRef<number>(0)
  const isDrawingLaserRef = useRef(false)
  const selectedToolRef = useRef<ToolType>('pan')
  const shouldFadeOutRef = useRef(false)
  const laserPointerOutlineRef = useRef<LaserPoint[]>([])
  const laserPointerOpacityRef = useRef(0.8)

  const eraserTrailHistoryRef = useRef<Array<{ x: number; y: number; timestamp: number; alpha: number; trailId: number }>>([])
  const currentEraserTrailIdRef = useRef<number>(0)
  const isDrawingEraserRef = useRef(false)
  const [markedForErasureIds, setMarkedForErasureIds] = useState<Set<string>>(new Set())

  const [isLayoutEditing, setIsLayoutEditing] = useState(false)
  const [dragSnapPreview, setDragSnapPreview] = useState<{ type: 'menu' | 'toolbar' | 'zoom', position: string | null } | null>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const files = e.dataTransfer.files

    if (files && files.length > 0) {

      const file = files[0]

      if (file.type.startsWith('image/')) {

        const dragEnabled = false // set to true if you want to enable :)

        if (!dragEnabled) {

          setIsDropImportOpen(true)

          return
        }

        try {

          const assetId = await saveAsset(file)

          const reader = new FileReader()

          reader.onload = (event) => {
            const src = event.target?.result as string
            const img = new Image()
            img.src = src
            img.onload = () => {

              const state = transformRef.current?.instance?.transformState || { positionX: 0, positionY: 0, scale: 1 }
              const rect = containerRef.current?.getBoundingClientRect() || { left: 0, top: 0 }
              const mouseX = e.clientX - rect.left
              const mouseY = e.clientY - rect.top
              const worldX = (mouseX - state.positionX) / state.scale
              const worldY = (mouseY - state.positionY) / state.scale

              const newImage: ImageElement = {
                id: crypto.randomUUID(),
                type: 'image',
                x: worldX - (img.width / 2),
                y: worldY - (img.height / 2),
                width: img.width,
                height: img.height,
                src: assetId,
                opacity: 100,
                cornerStyle: 'sharp'
              }

              historyRef.current.push([...elements])
              redoRef.current = []
              setElements(prev => [...prev, newImage])
              needsRedrawRef.current = true
            }
          }
          reader.readAsDataURL(file)
        } catch (error) {
          console.error('Failed to save asset:', error)
        }
      }
    }
  }

  useEffect(() => {
    if (isWorkspacesLoaded) {
      isWorkspaceLoadingRef.current = true
      const data = loadWorkspaceData(activeWorkspaceId)
      setElements(data)
      historyRef.current = []
      redoRef.current = []
      setCanUndo(false)
      setCanRedo(false)
      setTimeout(() => {
        isWorkspaceLoadingRef.current = false
      }, 50)
    }
  }, [activeWorkspaceId, isWorkspacesLoaded, loadWorkspaceData])

  useEffect(() => {
    if (isWorkspacesLoaded && !isWorkspaceLoadingRef.current) {
      saveWorkspaceData(activeWorkspaceId, elements)
    }
  }, [elements, activeWorkspaceId, isWorkspacesLoaded, saveWorkspaceData])

  const [rectOptions, setRectOptions] = useState<RectangleOptions>({
    strokeColor: '#000000',
    fillColor: null,
    strokeWidth: 3,
    strokeStyle: 'solid',
    opacity: 100
  })

  const [diamondOptions, setDiamondOptions] = useState<DiamondOptions>({
    strokeColor: '#000000',
    fillColor: null,
    strokeWidth: 3,
    strokeStyle: 'solid',
    opacity: 100
  })

  const [circleOptions, setCircleOptions] = useState<CircleOptions>({
    strokeColor: '#000000',
    fillColor: null,
    strokeWidth: 3,
    strokeStyle: 'solid',
    opacity: 100
  })

  const [penOptions, setPenOptions] = useState<PenOptions>({
    strokeColor: '#000000',
    fillColor: null,
    strokeWidth: 3,
    opacity: 100
  })

  const [lineOptions, setLineOptions] = useState<LineOptions>({
    strokeColor: '#000000',
    strokeWidth: 3,
    strokeStyle: 'solid',
    opacity: 100
  })

  const [arrowOptions, setArrowOptions] = useState<ArrowOptions>({
    strokeColor: '#000000',
    strokeWidth: 3,
    strokeStyle: 'solid',
    arrowStart: false,
    arrowEnd: true,
    arrowType: 'straight',
    opacity: 100
  })

  const [textOptions, setTextOptions] = useState<TextOptions>({
    color: '#000000',
    fontSize: 16,
    fontFamily: 'Arial',
    fontWeight: 'normal',
    fontStyle: 'normal',
    textAlign: 'left',
    opacity: 100
  })

  const [imageOptions, setImageOptions] = useState<ImageOptions>({
    cornerStyle: 'sharp',
    opacity: 100
  })

  const [frameOptions, setFrameOptions] = useState<FrameOptions>({
    opacity: 100,
    name: undefined
  })

  const [embedOptions, setEmbedOptions] = useState<EmbedOptions>({
    url: '',
    opacity: 100
  })

  const [stickerOptions, setStickerOptions] = useState<StickerOptions>({
    opacity: 100
  })

  const [stickerImage, setStickerImage] = useState<string | null>(null)

  const [editingTextId, setEditingTextId] = useState<string | null>(null)
  const [editingTextValue, setEditingTextValue] = useState<string>('')
  const [editingTextPosition, setEditingTextPosition] = useState<Point | null>(null)
  const [textareaHeight, setTextareaHeight] = useState<number>(0)
  const textInputRef = useRef<HTMLTextAreaElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const stickerInputRef = useRef<HTMLInputElement>(null)
  const lastTextClickRef = useRef<{ id: string | null; time: number }>({ id: null, time: 0 })
  const imageDialogOpenedRef = useRef(false)
  const stickerDialogOpenedRef = useRef(false)
  const addingImageRef = useRef(false)

  const toWorld = useCallback((e: React.MouseEvent): Point => {
    if (!containerRef.current) {
      return { x: 0, y: 0 }
    }

    const container = containerRef.current
    const state = transformRef.current?.instance?.transformState || {
      positionX: 0,
      positionY: 0,
      scale: 1
    }

    const rect = container.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const worldX = (mouseX - state.positionX) / state.scale
    const worldY = (mouseY - state.positionY) / state.scale
    return { x: worldX, y: worldY }
  }, [])

  useEffect(() => {
    if (!shouldFadeOut || laserFadeOutStartRef.current === null) return

    const fadeDuration = 500
    const startTime = laserFadeOutStartRef.current

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / fadeDuration, 1)
      const newOpacity = 0.8 * (1 - progress)

      setLaserPointerOpacity(newOpacity)
      needsRedrawRef.current = true

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setLaserPointerOutline([])
        setLaserPointerOpacity(0.8)
        laserFadeOutStartRef.current = null
        setShouldFadeOut(false)
        laserTrailHistoryRef.current = []
      }
    }

    animate()
  }, [shouldFadeOut])

  useEffect(() => {
    isDrawingLaserRef.current = isDrawing && selectedTool === 'laser'
    isDrawingEraserRef.current = isDrawing && selectedTool === 'eraser'
    selectedToolRef.current = selectedTool
    shouldFadeOutRef.current = shouldFadeOut
  }, [isDrawing, selectedTool, shouldFadeOut])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault()
        setIsFindSidebarOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    laserPointerOutlineRef.current = laserPointerOutline
  }, [laserPointerOutline])

  useEffect(() => {
    laserPointerOpacityRef.current = laserPointerOpacity
  }, [laserPointerOpacity])

  useEffect(() => {
    let animationFrameId: number | null = null
    let isActive = true

    const drawLaserPointer = () => {
      if (!isActive) return

      const canvas = laserCanvasRef.current
      if (!canvas) {
        animationFrameId = requestAnimationFrame(drawLaserPointer)
        return
      }

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        animationFrameId = requestAnimationFrame(drawLaserPointer)
        return
      }

      if (containerRef.current) {
        const container = containerRef.current
        const dpr = window.devicePixelRatio || 1
        const targetWidth = container.clientWidth * dpr
        const targetHeight = container.clientHeight * dpr
        if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
          canvas.width = targetWidth
          canvas.height = targetHeight
        }
      }

      const shouldDraw = (isDrawingLaserRef.current && selectedToolRef.current === 'laser') || (laserTrailHistoryRef.current.length > 0)
      const shouldDrawEraser = (isDrawingEraserRef.current && selectedToolRef.current === 'eraser') || (eraserTrailHistoryRef.current.length > 0)

      if (!shouldDraw && !shouldDrawEraser) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        animationFrameId = requestAnimationFrame(drawLaserPointer)
        return
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const dpr = window.devicePixelRatio || 1
      const transformState = transformRef.current?.instance?.transformState
      if (transformState) {
        const { scale, positionX, positionY } = transformState
        ctx.setTransform(dpr * scale, 0, 0, dpr * scale, positionX * dpr, positionY * dpr)
      } else {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      }


      const now = Date.now()
      const fadeSpeed = 0.012
      const maxTrailLength = 100

      laserTrailHistoryRef.current = laserTrailHistoryRef.current
        .map(point => ({
          ...point,
          alpha: Math.max(0, point.alpha - fadeSpeed)
        }))
        .filter(point => point.alpha > 0)

      if (laserTrailHistoryRef.current.length > maxTrailLength) {
        laserTrailHistoryRef.current = laserTrailHistoryRef.current.slice(-maxTrailLength)
      }

      if (laserTrailHistoryRef.current.length > 1) {
        const points = laserTrailHistoryRef.current.filter(p => p.alpha > 0)

        if (points.length >= 2) {
          ctx.lineCap = 'round'
          ctx.lineJoin = 'round'
          ctx.strokeStyle = '#ff0000'

          const trailsMap = new Map<number, typeof points>()

          for (const point of points) {
            const trailId = point.trailId
            if (!trailsMap.has(trailId)) {
              trailsMap.set(trailId, [])
            }
            trailsMap.get(trailId)!.push(point)
          }

          const trails = Array.from(trailsMap.entries())
            .sort((a, b) => a[0] - b[0])
            .map(([_, points]) => points)

          trails.forEach((trail, trailIndex) => {
            if (trail.length >= 2) {
              let shouldSkipFirstPoint = false
              if (trailIndex > 0) {
                const prevTrail = trails[trailIndex - 1]
                if (prevTrail.length > 0) {
                  const prevLast = prevTrail[prevTrail.length - 1]
                  const distance = Math.hypot(trail[0].x - prevLast.x, trail[0].y - prevLast.y)

                  if (distance < 50) {
                    shouldSkipFirstPoint = true
                  }
                }
              }

              const startIndex = shouldSkipFirstPoint && trail.length > 2 ? 1 : 0
              const pointsToDraw = trail.slice(startIndex)

              if (pointsToDraw.length >= 2) {
                ctx.beginPath()
                ctx.moveTo(pointsToDraw[0].x, pointsToDraw[0].y)

                if (pointsToDraw.length === 2) {
                  const avgAlpha = (pointsToDraw[0].alpha + pointsToDraw[1].alpha) / 2
                  const baseWidth = 16
                  const lineWidth = baseWidth * avgAlpha

                  ctx.globalAlpha = avgAlpha
                  ctx.lineWidth = lineWidth
                  ctx.lineTo(pointsToDraw[1].x, pointsToDraw[1].y)
                  ctx.stroke()
                } else {
                  for (let i = 1; i < pointsToDraw.length - 1; i++) {
                    const p1 = pointsToDraw[i]
                    const p2 = pointsToDraw[i + 1]
                    const midX = (p1.x + p2.x) / 2
                    const midY = (p1.y + p2.y) / 2
                    ctx.quadraticCurveTo(p1.x, p1.y, midX, midY)
                  }
                  const last = pointsToDraw[pointsToDraw.length - 1]
                  ctx.lineTo(last.x, last.y)

                  const avgAlpha = pointsToDraw.reduce((sum, p) => sum + p.alpha, 0) / pointsToDraw.length
                  const baseWidth = 16
                  const lineWidth = baseWidth * avgAlpha

                  ctx.globalAlpha = avgAlpha
                  ctx.lineWidth = lineWidth
                  ctx.stroke()
                }
              }
            }
          })
        }
      }

      eraserTrailHistoryRef.current = eraserTrailHistoryRef.current
        .map(point => ({
          ...point,
          alpha: Math.max(0, point.alpha - fadeSpeed)
        }))
        .filter(point => point.alpha > 0)

      if (eraserTrailHistoryRef.current.length > maxTrailLength) {
        eraserTrailHistoryRef.current = eraserTrailHistoryRef.current.slice(-maxTrailLength)
      }

      if (eraserTrailHistoryRef.current.length > 1) {
        const points = eraserTrailHistoryRef.current.filter(p => p.alpha > 0)

        if (points.length >= 2) {
          ctx.lineCap = 'round'
          ctx.lineJoin = 'round'
          ctx.strokeStyle = '#888888'

          const trailsMap = new Map<number, typeof points>()

          for (const point of points) {
            const trailId = point.trailId
            if (!trailsMap.has(trailId)) {
              trailsMap.set(trailId, [])
            }
            trailsMap.get(trailId)!.push(point)
          }

          const trails = Array.from(trailsMap.entries())
            .sort((a, b) => a[0] - b[0])
            .map(([_, points]) => points)

          trails.forEach((trail, trailIndex) => {
            if (trail.length >= 2) {
              let shouldSkipFirstPoint = false
              if (trailIndex > 0) {
                const prevTrail = trails[trailIndex - 1]
                if (prevTrail.length > 0) {
                  const prevLast = prevTrail[prevTrail.length - 1]
                  const distance = Math.hypot(trail[0].x - prevLast.x, trail[0].y - prevLast.y)

                  if (distance < 50) {
                    shouldSkipFirstPoint = true
                  }
                }
              }

              const startIndex = shouldSkipFirstPoint && trail.length > 2 ? 1 : 0
              const pointsToDraw = trail.slice(startIndex)

              if (pointsToDraw.length >= 2) {
                ctx.beginPath()
                ctx.moveTo(pointsToDraw[0].x, pointsToDraw[0].y)

                if (pointsToDraw.length === 2) {
                  const avgAlpha = (pointsToDraw[0].alpha + pointsToDraw[1].alpha) / 2
                  const baseWidth = 16
                  const lineWidth = baseWidth * avgAlpha

                  ctx.globalAlpha = avgAlpha
                  ctx.lineWidth = lineWidth
                  ctx.lineTo(pointsToDraw[1].x, pointsToDraw[1].y)
                  ctx.stroke()
                } else {
                  for (let i = 1; i < pointsToDraw.length - 1; i++) {
                    const p1 = pointsToDraw[i]
                    const p2 = pointsToDraw[i + 1]
                    const midX = (p1.x + p2.x) / 2
                    const midY = (p1.y + p2.y) / 2
                    ctx.quadraticCurveTo(p1.x, p1.y, midX, midY)
                  }
                  const last = pointsToDraw[pointsToDraw.length - 1]
                  ctx.lineTo(last.x, last.y)

                  const avgAlpha = pointsToDraw.reduce((sum, p) => sum + p.alpha, 0) / pointsToDraw.length
                  const baseWidth = 16
                  const lineWidth = baseWidth * avgAlpha

                  ctx.globalAlpha = avgAlpha
                  ctx.lineWidth = lineWidth
                  ctx.stroke()
                }
              }
            }
          })
        }
      }

      ctx.globalAlpha = 1.0

      animationFrameId = requestAnimationFrame(drawLaserPointer)
    }

    drawLaserPointer()

    return () => {
      isActive = false
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
      }

      if (laserCanvasRef.current) {
        const canvas = laserCanvasRef.current
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
        }
      }
    }
  }, [])

  useEffect(() => {
    if (selectedTool === 'image' && !imageDialogOpenedRef.current) {
      imageDialogOpenedRef.current = true
      setTimeout(() => {
        imageInputRef.current?.click()
      }, 0)
    } else if (selectedTool !== 'image') {
      imageDialogOpenedRef.current = false
      if (!addingImageRef.current) {
        setSelectedIds([])
      }
      addingImageRef.current = false
    }
  }, [selectedTool])

  useEffect(() => {
    if (selectedTool === 'sticker') {
      setTimeout(() => {
        stickerInputRef.current?.click()
      }, 0)
    }
  }, [selectedTool])

  useEffect(() => {
    if (editingTextId && textInputRef.current) {
      setTimeout(() => {
        if (textInputRef.current) {
          textInputRef.current.focus()
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (textInputRef.current) {
                textInputRef.current.style.height = '1px'
                const scrollHeight = textInputRef.current.scrollHeight
                textInputRef.current.style.height = `${scrollHeight}px`
                setTextareaHeight(scrollHeight)
              }
            })
          })
        }
      }, 50)
    }
  }, [editingTextId])

  useEffect(() => {
    if (editingTextId && textInputRef.current) {
      setTimeout(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (textInputRef.current) {
              textInputRef.current.style.height = 'auto'
              const scrollHeight = textInputRef.current.scrollHeight
              const textElement = elements.find(e => e.id === editingTextId && e.type === 'text') as TextElement | undefined
              const fontSize = textElement?.fontSize || textOptions.fontSize
              const minHeight = fontSize * 1.2
              const newHeight = Math.max(scrollHeight, minHeight)
              textInputRef.current.style.height = `${newHeight}px`
              setTextareaHeight(newHeight)

              setElements(prev => prev.map(el => {
                if (el.id === editingTextId && el.type === 'text') {
                  return { ...el, height: newHeight }
                }
                return el
              }))
              needsRedrawRef.current = true
            }
          })
        })
      }, 0)
    }
  }, [editingTextValue, editingTextId, elements, textOptions.fontSize, textOptions.fontFamily])

  const lastPathIdRef = useRef<string | null>(null)
  useEffect(() => {
    if (lastPathIdRef.current) {
      const pathExists = elements.some(el => el.id === lastPathIdRef.current && el.type === 'path')
      if (pathExists) {
        setSelectedIds(prev => {
          if (!prev.includes(lastPathIdRef.current!)) {
            return [lastPathIdRef.current!]
          }
          return prev
        })
      }
      lastPathIdRef.current = null
    }
  }, [elements])

  useEffect(() => {
    setCanUndo(historyRef.current.length > 0)
    setCanRedo(redoRef.current.length > 0)
  }, [elements])

  useEffect(() => {
    return setupKeyboardHandlers(
      selectedIds,
      elements,
      clipboard,
      editingTextId,
      historyRef,
      redoRef,
      needsRedrawRef,
      setElements,
      setSelectedIds,
      setClipboard
    )
  }, [selectedIds, elements, clipboard, editingTextId])

  useEffect(() => {
    const handleShiftDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(true)
      }
    }
    const handleShiftUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(false)
      }
    }
    window.addEventListener('keydown', handleShiftDown)
    window.addEventListener('keyup', handleShiftUp)
    return () => {
      window.removeEventListener('keydown', handleShiftDown)
      window.removeEventListener('keyup', handleShiftUp)
    }
  }, [])


  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 1 && isMiddleButtonDown) {
        setIsMiddleButtonDown(false)
        setIsPanning(false)
        e.preventDefault()
      }
    }
    window.addEventListener('mouseup', handleMouseUp)
    return () => window.removeEventListener('mouseup', handleMouseUp)
  }, [isMiddleButtonDown])

  const onMouseDown = (e: React.MouseEvent) => {
    const pos = toWorld(e)
    handleMouseDown(e, pos, {
      isLocked,
      selectedTool,
      elements,
      selectedIds,
      editingTextId,
      editingTextValue,
      canvasRef: { current: null } as React.RefObject<HTMLCanvasElement | null>,
      textInputRef,
      historyRef,
      redoRef,
      textResizeInitialStateRef,
      frameDragInitialElementsRef,
      laserPointerRef,
      laserTrailHistoryRef,
      currentTrailIdRef,
      isDrawingLaserRef,
      selectedToolRef,
      laserFadeOutStartRef,
      lastTextClickRef,
      needsRedrawRef,
      eraserTrailHistoryRef,
      currentEraserTrailIdRef,
      isDrawingEraserRef,
      markedForErasureIds,
      setSelectedIds,
      setIsDrawing,
      setIsPanning,
      setIsMiddleButtonDown,
      setIsResizing,
      setIsDragging,
      setIsSelecting,
      setDragStart,
      setDraggingControlPointId,
      setEditingTextId,
      setEditingTextValue,
      setEditingTextPosition,
      setElements,
      setTempPath,
      setTempRect,
      setTempDiamond,
      setTempCircle,
      setTempLine,
      setTempArrow,
      setTempTextRect,
      setTempLassoPath,
      setTempFrame,
      setTempEmbed,
      setTempSticker,
      setImageClickPosition,
      setStickerClickPosition,
      setLaserPointerOutline,
      setLaserPointerOpacity,
      setShouldFadeOut,
      setSelectionBox,
      setMarkedForErasureIds,
    })
  }

  const onMouseMove = (e: React.MouseEvent) => {
    const pos = toWorld(e)
    handleMouseMove(e, pos, {
      isPanning,
      isDrawing,
      selectedTool,
      isSelecting,
      selectionBox,
      isDragging,
      dragStart,
      selectedIds,
      isResizing,
      draggingControlPointId,
      tempPath,
      tempRect,
      tempDiamond,
      tempCircle,
      tempLine,
      tempArrow,
      tempTextRect,
      tempFrame,
      isShiftPressed,
      elements,
      textResizeInitialStateRef,
      frameDragInitialElementsRef,
      laserPointerRef,
      laserTrailHistoryRef,
      currentTrailIdRef,
      needsRedrawRef,
      eraserTrailHistoryRef,
      currentEraserTrailIdRef,
      markedForErasureIds,
      setTempPath,
      setTempRect,
      setTempDiamond,
      setTempCircle,
      setTempLine,
      setTempArrow,
      setTempTextRect,
      setTempLassoPath,
      setTempFrame,
      tempEmbed,
      setTempEmbed,
      tempSticker,
      setTempSticker,
      setSelectionBox,
      setElements,
      setDragStart,
      setLaserPointerOutline,
      setHoverHandle,
      setHoverElement,
      setMarkedForErasureIds,
    })
  }

  const onMouseUp = (e?: React.MouseEvent) => {
    handleMouseUp(e, {
      isMiddleButtonDown,
      isDrawing,
      selectedTool,
      isSelecting,
      selectionBox,
      tempPath,
      tempRect,
      tempDiamond,
      tempCircle,
      tempLine,
      tempArrow,
      tempTextRect,
      tempLassoPath,
      tempFrame,
      tempEmbed,
      tempSticker,
      elements,
      canvasRef: { current: null } as React.RefObject<HTMLCanvasElement | null>,
      historyRef,
      redoRef,
      textResizeInitialStateRef,
      laserPointerRef,
      isDrawingLaserRef,
      isDrawingEraserRef,
      lastPathIdRef,
      needsRedrawRef,
      eraserTrailHistoryRef,
      penOptions,
      rectOptions,
      diamondOptions,
      circleOptions,
      lineOptions,
      arrowOptions,
      textOptions,
      frameOptions,
      setIsMiddleButtonDown,
      setIsPanning,
      setIsDrawing,
      setIsDragging,
      setIsResizing,
      setIsSelecting,
      setSelectionBox,
      setDraggingControlPointId,
      setTempPath,
      setTempRect,
      setTempDiamond,
      setTempCircle,
      setTempLine,
      setTempArrow,
      setTempTextRect,
      setTempLassoPath,
      setTempFrame,
      embedOptions,
      setTempEmbed,
      setTempSticker,
      stickerImage,
      stickerOptions,
      setElements,
      setSelectedIds,
      setEditingTextId,
      setEditingTextValue,
      setEditingTextPosition,
      setTextareaHeight,
      markedForErasureIds,
      setMarkedForErasureIds,
    })
  }

  const getSelectedElementTypeWrapper = useCallback((): string | null => {
    return getSelectedElementType(selectedIds, elements)
  }, [selectedIds, elements])

  const getSelectedElementOptionsWrapper = useCallback(() => {
    return getSelectedElementOptions(selectedIds, elements)
  }, [selectedIds, elements])

  const updateSelectedElementsWrapper = useCallback((updates: Partial<RectangleOptions | CircleOptions | DiamondOptions | PenOptions | LineOptions | ArrowOptions | TextOptions | ImageOptions | FrameOptions | EmbedOptions>) => {
    setElements(prev => {
      const updated = updateSelectedElements(selectedIds, prev, updates)
      needsRedrawRef.current = true
      return updated
    })
  }, [selectedIds])

  const cursor = getCursor(selectedTool, isDragging, isResizing, isPanning, isMiddleButtonDown, hoverHandle, hoverElement)

  const handleClearWorkspace = useCallback(() => {
    historyRef.current.push([...elements])
    redoRef.current = []
    setElements([])
    setSelectedIds([])
    needsRedrawRef.current = true
  }, [elements])

  const handleSaveAsWrapper = useCallback(() => {
    handleSaveAs(elements)
  }, [elements])

  const handleExportImageWrapper = useCallback(() => {
    handleExportImage(elements, resolvedTheme)
  }, [elements, resolvedTheme])

  const handleOpenWrapper = useCallback(() => {
    handleOpen(elements, historyRef, redoRef, setElements, setSelectedIds, needsRedrawRef)
  }, [elements])

  const handleTestWorkspace = useCallback(() => {
    historyRef.current.push([...elements])
    redoRef.current = []
    const testElements = generateTestWorkspace()
    setElements(testElements)
    setSelectedIds([])
    needsRedrawRef.current = true
  }, [elements])

  const handleUndoWrapper = useCallback(() => {
    handleUndo(historyRef, redoRef, elements, setElements, setSelectedIds, setCanUndo, setCanRedo, needsRedrawRef)
  }, [elements])

  const handleRedoWrapper = useCallback(() => {
    handleRedo(historyRef, redoRef, elements, setElements, setSelectedIds, setCanUndo, setCanRedo, needsRedrawRef)
  }, [elements])

  return (
    <div className="flex w-full h-screen overflow-hidden">
      <div className="flex-1 relative w-full h-full">
        <Menu
          onDocumentThemeChange={setTheme}
          onClearWorkspace={handleClearWorkspace}
          onSaveAs={handleSaveAsWrapper}
          onExportImage={handleExportImageWrapper}
          onOpen={handleOpenWrapper}
          onTestWorkspace={handleTestWorkspace}
          position={positions.menu}
          toolbarPosition={positions.toolbar}
          onMenuPositionChange={(pos) => updatePositions({ menu: pos })}
          onToolbarPositionChange={(pos) => updatePositions({ toolbar: pos })}
          isLayoutEditing={isLayoutEditing}
          onLayoutEditToggle={() => setIsLayoutEditing(!isLayoutEditing)}
          onDragPreview={(pos) => setDragSnapPreview(pos ? { type: 'menu', position: pos } : null)}
          onFindCanvas={() => setIsFindSidebarOpen(true)}
          onWorkspaces={() => setIsWorkspacesSidebarOpen(true)}
          elementCount={elements.length}
        />

        {isLayoutEditing && (
          <div
            className="fixed inset-0 z-[55] bg-black/5 flex items-center justify-center pointer-events-auto"
            onClick={() => setIsLayoutEditing(false)}
          />
        )}
        {isLayoutEditing && (
          <>
            {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((pos) => {
              const isActive = dragSnapPreview?.type === 'menu' && dragSnapPreview.position === pos

              return (
                <div
                  key={pos}
                  className={cn(
                    "fixed w-8 h-8 border-2 rounded-lg transition-all duration-200 pointer-events-none",
                    isActive
                      ? "z-[100] border-blue-500 bg-blue-500/40 scale-110 shadow-[0_0_20px_rgba(59,130,246,0.6)]"
                      : "z-[54] border-blue-400 bg-blue-500/10 scale-95 opacity-80 border-dashed"
                  )}
                  style={{
                    top: pos.startsWith('top') ? '1rem' : undefined,
                    bottom: pos.startsWith('bottom') ? '1rem' : undefined,
                    left: pos.endsWith('left') ? '1rem' : undefined,
                    right: pos.endsWith('right') ? '1rem' : undefined,
                  }}
                />
              )
            })}

            {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((pos) => {
              const isActive = dragSnapPreview?.type === 'zoom' && dragSnapPreview.position === pos

              const style = {
                top: pos.startsWith('top') ? '1rem' : undefined,
                bottom: pos.startsWith('bottom') ? '1rem' : undefined,
                left: pos.endsWith('left') ? '80px' : undefined,
                right: pos.endsWith('right') ? '80px' : undefined,
              }

              return (
                <div
                  key={`zoom-${pos}`}
                  className={cn(
                    "fixed flex gap-8 transition-all duration-200 pointer-events-none",
                    pos.endsWith('right') && "flex-row-reverse",
                    isActive
                      ? "z-[100] scale-105"
                      : "z-[54] scale-95 opacity-80"
                  )}
                  style={style}
                >
                  <div className={cn(
                    "w-[140px] h-12 border-2 rounded-2xl",
                    isActive
                      ? "border-green-500 bg-green-500/40 shadow-[0_0_20px_rgba(34,197,94,0.6)]"
                      : "border-green-400 bg-green-500/10 border-dashed"
                  )} />

                  <div className={cn(
                    "w-[80px] h-12 border-2 rounded-2xl",
                    isActive
                      ? "border-green-500 bg-green-500/40 shadow-[0_0_20px_rgba(34,197,94,0.6)]"
                      : "border-green-400 bg-green-500/10 border-dashed"
                  )} />
                </div>
              )
            })}

            {['top', 'bottom', 'left', 'right'].map((pos) => {
              const isActive = dragSnapPreview?.type === 'toolbar' && dragSnapPreview.position === pos
              const isVertical = pos === 'left' || pos === 'right'

              return (
                <div
                  key={pos}
                  className={cn(
                    "fixed border-2 rounded-2xl transition-all duration-200 pointer-events-none",
                    isVertical ? "w-16 h-[520px] top-1/2 -translate-y-1/2" : "w-[520px] h-16 left-1/2 -translate-x-1/2",
                    isActive
                      ? "z-[100] border-blue-500 bg-blue-500/40 scale-105 shadow-[0_0_20px_rgba(59,130,246,0.6)]"
                      : "z-[54] border-blue-400 bg-blue-500/10 scale-95 opacity-80 border-dashed"
                  )}
                  style={{
                    top: pos === 'top' ? '1rem' : undefined,
                    bottom: pos === 'bottom' ? '1rem' : undefined,
                    left: pos === 'left' ? '1rem' : undefined,
                    right: pos === 'right' ? '1rem' : undefined,
                  }}
                />
              )
            })}
          </>
        )}

        <Toolbar
          selectedTool={selectedTool}
          onToolChange={setSelectedTool}
          isLocked={isLocked}
          onLockToggle={() => setIsLocked(!isLocked)}
          position={positions.toolbar}
          isLayoutEditing={isLayoutEditing}
          onPositionChange={(pos) => updatePositions({ toolbar: pos })}
          onDragPreview={(pos) => setDragSnapPreview(pos ? { type: 'toolbar', position: pos } : null)}
        />
        {(selectedTool === 'rectangle' || (getSelectedElementTypeWrapper() === 'rect' && selectedIds.length === 1)) && (
          <RectangleOptionsPanel
            options={getSelectedElementOptionsWrapper() as RectangleOptions || rectOptions}
            onOptionsChange={(options) => {
              if (selectedIds.length === 1 && getSelectedElementTypeWrapper() === 'rect') {
                updateSelectedElementsWrapper(options)
              } else {
                setRectOptions(options)
              }
            }}
          />
        )}
        {(selectedTool === 'diamond' || (getSelectedElementTypeWrapper() === 'diamond' && selectedIds.length === 1)) && (
          <DiamondOptionsPanel
            options={getSelectedElementOptionsWrapper() as DiamondOptions || diamondOptions}
            onOptionsChange={(options) => {
              if (selectedIds.length === 1 && getSelectedElementTypeWrapper() === 'diamond') {
                updateSelectedElementsWrapper(options)
              } else {
                setDiamondOptions(options)
              }
            }}
          />
        )}
        {(selectedTool === 'circle' || (getSelectedElementTypeWrapper() === 'circle' && selectedIds.length === 1)) && (
          <CircleOptionsPanel
            options={getSelectedElementOptionsWrapper() as CircleOptions || circleOptions}
            onOptionsChange={(options) => {
              if (selectedIds.length === 1 && getSelectedElementTypeWrapper() === 'circle') {
                updateSelectedElementsWrapper(options)
              } else {
                setCircleOptions(options)
              }
            }}
          />
        )}
        {(selectedTool === 'pen' || (getSelectedElementTypeWrapper() === 'path' && selectedIds.length === 1)) && (
          <PenOptionsPanel
            options={getSelectedElementOptionsWrapper() as PenOptions || penOptions}
            onOptionsChange={(options) => {
              if (selectedIds.length === 1 && getSelectedElementTypeWrapper() === 'path') {
                updateSelectedElementsWrapper(options)
              } else {
                setPenOptions(options)
              }
            }}
          />
        )}
        {(selectedTool === 'line' || (getSelectedElementTypeWrapper() === 'line' && selectedIds.length === 1)) && (
          <LineOptionsPanel
            options={(getSelectedElementOptionsWrapper() as LineOptions) ?? lineOptions}
            onOptionsChange={(options) => {
              if (selectedIds.length === 1 && getSelectedElementTypeWrapper() === 'line') {
                updateSelectedElementsWrapper(options)
              } else {
                setLineOptions(options)
              }
            }}
          />
        )}
        {(selectedTool === 'arrow' || (getSelectedElementTypeWrapper() === 'arrow' && selectedIds.length === 1)) && (
          <ArrowOptionsPanel
            options={(getSelectedElementOptionsWrapper() as ArrowOptions) ?? arrowOptions}
            onOptionsChange={(options) => {
              if (selectedIds.length === 1 && getSelectedElementTypeWrapper() === 'arrow') {
                updateSelectedElementsWrapper(options)
              } else {
                setArrowOptions(options)
              }
            }}
          />
        )}
        {(selectedTool === 'text' || (getSelectedElementTypeWrapper() === 'text' && selectedIds.length === 1)) && (
          <TextOptionsPanel
            options={(getSelectedElementOptionsWrapper() as TextOptions) ?? textOptions}
            onOptionsChange={(options) => {
              if (selectedIds.length === 1 && getSelectedElementTypeWrapper() === 'text') {
                updateSelectedElementsWrapper(options)
              } else {
                setTextOptions(options)
              }
            }}
          />
        )}
        {(selectedTool === 'image' || (getSelectedElementTypeWrapper() === 'image' && selectedIds.length === 1)) && (
          <ImageOptionsPanel
            options={(getSelectedElementOptionsWrapper() as ImageOptions) ?? imageOptions}
            onOptionsChange={(options) => {
              if (selectedIds.length === 1 && getSelectedElementTypeWrapper() === 'image') {
                updateSelectedElementsWrapper(options)
              } else {
                setImageOptions(options)
              }
            }}
          />
        )}
        {(selectedTool === 'frame' || (getSelectedElementTypeWrapper() === 'frame' && selectedIds.length === 1)) && (
          <FrameOptionsPanel
            options={(getSelectedElementOptionsWrapper() as FrameOptions) ?? frameOptions}
            onOptionsChange={(options) => {
              if (selectedIds.length === 1 && getSelectedElementTypeWrapper() === 'frame') {
                updateSelectedElementsWrapper(options)
              } else {
                setFrameOptions(options)
              }
            }}
          />
        )}
        {(selectedTool === 'embed' || (getSelectedElementTypeWrapper() === 'embed' && selectedIds.length === 1)) && (
          <EmbedOptionsPanel
            options={(getSelectedElementOptionsWrapper() as EmbedOptions) ?? embedOptions}
            onOptionsChange={(options) => {
              if (selectedIds.length === 1 && getSelectedElementTypeWrapper() === 'embed') {
                updateSelectedElementsWrapper(options)
              } else {
                setEmbedOptions(options)
              }
            }}
          />
        )}

        <div
          ref={containerRef}
          className="relative w-full h-screen overflow-hidden transition-colors duration-300 ease-in-out"
          style={{ backgroundColor: canvasColor }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <TransformWrapper
            ref={transformRef}
            initialScale={1}
            minScale={0.1}
            maxScale={5}
            panning={{ disabled: selectedTool !== 'pan' && !isMiddleButtonDown }}
            wheel={{ step: 0.1 }}
            doubleClick={{ disabled: true }}
            limitToBounds={false}
            centerOnInit={false}
            alignmentAnimation={{ disabled: true }}
            onTransformed={() => {
              isZoomingRef.current = true

              if (scaleChangeTimeoutRef.current) {
                clearTimeout(scaleChangeTimeoutRef.current)
              }

              scaleChangeTimeoutRef.current = setTimeout(() => {
                isZoomingRef.current = false
                needsRedrawRef.current = true
              }, 200)
            }}
          >
            <TransformComponent
              wrapperClass="w-full h-full"
              contentClass="w-full h-full"
              wrapperStyle={{ width: '100%', height: '100vh', overflow: 'hidden' }}
              contentStyle={{ width: '100%', height: '100vh' }}
            >
              <svg
                className="w-full h-full transition-colors duration-300 ease-in-out"
                width="100%"
                height="100%"
                style={{
                  cursor: cursor,
                  backgroundColor: canvasColor,
                  overflow: 'visible'
                }}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
                onDoubleClick={(e) => {
                  e.stopPropagation()
                  if (selectedTool === 'select') {
                    const pos = toWorld(e)
                    for (let i = elements.length - 1; i >= 0; i--) {
                      const el = elements[i]
                      if (el.type === 'text' && isPointInText(pos, el)) {
                        setEditingTextId(el.id)
                        setEditingTextValue(el.text)
                        setEditingTextPosition({ x: el.x, y: el.y })
                        setSelectedIds([el.id])
                        break
                      }
                    }
                  }
                }}
              >
                <SvgGrid
                  canvasColor={canvasColor || '#ffffff'}
                  transformState={transformRef.current?.instance?.transformState || null}
                  containerWidth={containerRef.current?.clientWidth}
                  containerHeight={containerRef.current?.clientHeight}
                />
                <ElementRenderer elements={elements} editingTextId={editingTextId} markedForErasureIds={markedForErasureIds} />
                <TempElements
                  tempPath={tempPath}
                  tempLassoPath={tempLassoPath}
                  tempRect={tempRect}
                  tempDiamond={tempDiamond}
                  tempCircle={tempCircle}
                  tempLine={tempLine}
                  tempArrow={tempArrow}
                  tempFrame={tempFrame}
                  tempEmbed={tempEmbed}
                  tempSticker={tempSticker}
                  tempTextRect={tempTextRect}
                  selectionBox={selectionBox}
                  strokeColor={
                    selectedTool === 'pen' ? penOptions.strokeColor :
                      selectedTool === 'line' ? lineOptions.strokeColor :
                        selectedTool === 'rectangle' ? rectOptions.strokeColor :
                          selectedTool === 'circle' ? circleOptions.strokeColor :
                            selectedTool === 'diamond' ? diamondOptions.strokeColor :
                              selectedTool === 'arrow' ? arrowOptions.strokeColor :
                                '#000000'
                  }
                  strokeWidth={
                    selectedTool === 'pen' ? penOptions.strokeWidth :
                      selectedTool === 'line' ? lineOptions.strokeWidth :
                        selectedTool === 'rectangle' ? rectOptions.strokeWidth :
                          selectedTool === 'circle' ? circleOptions.strokeWidth :
                            selectedTool === 'diamond' ? diamondOptions.strokeWidth :
                              selectedTool === 'arrow' ? arrowOptions.strokeWidth :
                                2
                  }
                  fillColor={
                    selectedTool === 'rectangle' ? rectOptions.fillColor :
                      selectedTool === 'circle' ? circleOptions.fillColor :
                        selectedTool === 'diamond' ? diamondOptions.fillColor :
                          null
                  }
                  strokeStyle={
                    selectedTool === 'rectangle' ? rectOptions.strokeStyle :
                      selectedTool === 'circle' ? circleOptions.strokeStyle :
                        selectedTool === 'diamond' ? diamondOptions.strokeStyle :
                          selectedTool === 'line' ? lineOptions.strokeStyle :
                            selectedTool === 'arrow' ? arrowOptions.strokeStyle :
                              'solid'
                  }
                  arrowType={arrowOptions.arrowType}
                />
                <Selection elements={elements} selectedIds={selectedIds} />
              </svg>
              {editingTextId && editingTextPosition && (() => {
                const textElement = elements.find(e => e.id === editingTextId && e.type === 'text') as TextElement | undefined
                const minWidth = 200
                const width = Math.max(textElement?.width || minWidth, minWidth)
                const fontSize = textElement?.fontSize || textOptions.fontSize
                const currentHeight = textareaHeight || textElement?.height || fontSize * 2
                const textAlign = textElement?.textAlign || textOptions.textAlign
                const fontStyle = textElement?.fontStyle || textOptions.fontStyle
                let fontFamily = textElement?.fontFamily || textOptions.fontFamily
                if (fontStyle === 'hand-drawn') {
                  fontFamily = 'Caveat, "Shadows Into Light", "Indie Flower", cursive'
                } else if (fontStyle === 'code') {
                  fontFamily = 'Courier New, monospace'
                } else if (fontStyle === 'n-dot') {
                  fontFamily = 'Nothing, sans-serif'
                }
                const fontStyleCSS = 'normal'
                return (
                  <textarea
                    ref={textInputRef}
                    value={editingTextValue}
                    onChange={(e) => {
                      const newValue = e.target.value
                      setEditingTextValue(newValue)
                      setElements(prev => prev.map(el => {
                        if (el.id === editingTextId && el.type === 'text') {
                          return { ...el, text: newValue }
                        }
                        return el
                      }))
                      requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                          if (textInputRef.current) {
                            textInputRef.current.style.height = 'auto'
                            const scrollHeight = textInputRef.current.scrollHeight
                            const currentTextElement = elements.find(e => e.id === editingTextId && e.type === 'text') as TextElement | undefined
                            const currentFontSize = currentTextElement?.fontSize || textOptions.fontSize
                            const minHeight = currentFontSize * 1.2
                            const newHeight = Math.max(scrollHeight, minHeight)
                            textInputRef.current.style.height = `${newHeight}px`
                            setTextareaHeight(newHeight)

                            const scrollWidth = textInputRef.current.scrollWidth
                            const currentWidth = currentTextElement?.width || 200
                            const newWidth = Math.max(scrollWidth, currentWidth)

                            setElements(prev => prev.map(el => {
                              if (el.id === editingTextId && el.type === 'text') {
                                return { ...el, height: newHeight, width: newWidth }
                              }
                              return el
                            }))
                          }
                        })
                      })
                      needsRedrawRef.current = true
                    }}
                    onBlur={() => {
                      const currentValue = editingTextValue
                      const currentId = editingTextId
                      setTimeout(() => {
                        if (editingTextId === currentId) {
                          if (currentValue.trim() === '') {
                            setElements(prev => prev.filter(el => el.id !== currentId))
                          }
                          setEditingTextId(null)
                          setEditingTextValue('')
                          setEditingTextPosition(null)
                          needsRedrawRef.current = true
                        }
                      }, 150)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        const el = elements.find(e => e.id === editingTextId)
                        if (el?.type === 'text') {
                          if (el.text.trim() === '') {
                            setElements(prev => prev.filter(e => e.id !== editingTextId))
                          } else {
                            setElements(prev => prev.map(e => {
                              if (e.id === editingTextId && e.type === 'text') {
                                return { ...e, text: el.text }
                              }
                              return e
                            }))
                          }
                        }
                        setEditingTextId(null)
                        setEditingTextValue('')
                        setEditingTextPosition(null)
                        needsRedrawRef.current = true
                      }
                    }}
                    autoFocus
                    style={{
                      position: 'absolute',
                      left: `${editingTextPosition.x}px`,
                      top: `${editingTextPosition.y}px`,
                      width: `${width}px`,
                      height: `${currentHeight}px`,
                      border: 'none',
                      outline: 'none',
                      padding: '0',
                      margin: '0',
                      fontSize: fontSize + 'px',
                      fontFamily: fontFamily,
                      fontStyle: fontStyleCSS,
                      fontWeight: textElement?.fontWeight || textOptions.fontWeight,
                      color: textElement?.color || textOptions.color,
                      background: 'transparent',
                      zIndex: 1000,
                      pointerEvents: 'auto',
                      resize: 'none',
                      overflow: 'visible',
                      lineHeight: `${fontSize * 1.2}px`,
                      whiteSpace: 'pre',
                      minWidth: `${minWidth}px`,
                      minHeight: `${fontSize * 1.2}px`,
                      textAlign: textAlign
                    }}
                  />
                )
              })()}
            </TransformComponent>
          </TransformWrapper>
          <canvas
            ref={laserCanvasRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 10
            }}
          />
        </div>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              const reader = new FileReader()
              reader.onload = (event) => {
                const src = event.target?.result as string
                if (src) {
                  const img = new Image()
                  img.onload = async () => {
                    let pos = { x: 500, y: 500 }
                    if (containerRef.current && transformRef.current?.instance?.transformState) {
                      const container = containerRef.current
                      const state = transformRef.current.instance.transformState
                      const containerWidth = container.clientWidth
                      const containerHeight = container.clientHeight
                      const centerX = (containerWidth / 2 - state.positionX) / state.scale
                      const centerY = (containerHeight / 2 - state.positionY) / state.scale
                      pos = { x: centerX, y: centerY }
                    } else if (imageClickPosition) {
                      pos = imageClickPosition
                    }
                    setImageClickPosition(null)

                    // Resize logic
                    const maxSize = 1500 // Max dimension for stored asset
                    let width = img.width
                    let height = img.height

                    // Calculate display size (separate from storage size if needed, but here we sync)
                    const displayMaxSize = 500
                    let displayWidth = img.width
                    let displayHeight = img.height
                    if (displayWidth > displayMaxSize || displayHeight > displayMaxSize) {
                      const scale = Math.min(displayMaxSize / displayWidth, displayMaxSize / displayHeight)
                      displayWidth = displayWidth * scale
                      displayHeight = displayHeight * scale
                    }

                    // Canvas for resizing storage asset
                    const canvas = document.createElement('canvas')
                    let storeWidth = img.width
                    let storeHeight = img.height
                    if (storeWidth > maxSize || storeHeight > maxSize) {
                      const scale = Math.min(maxSize / storeWidth, maxSize / storeHeight)
                      storeWidth = storeWidth * scale
                      storeHeight = storeHeight * scale
                    }
                    canvas.width = storeWidth
                    canvas.height = storeHeight
                    const ctx = canvas.getContext('2d')
                    if (ctx) {
                      ctx.drawImage(img, 0, 0, storeWidth, storeHeight)
                      canvas.toBlob(async (blob) => {
                        if (blob) {
                          try {
                            const assetId = await saveAsset(blob)

                            const newImageElement: ImageElement = {
                              id: `image-${Date.now()}`,
                              type: 'image',
                              x: pos.x,
                              y: pos.y,
                              width: displayWidth,
                              height: displayHeight,
                              src: assetId,
                              opacity: imageOptions.opacity / 100,
                              cornerStyle: imageOptions.cornerStyle
                            }

                            historyRef.current.push([...elements])
                            redoRef.current = []
                            setElements(prev => [...prev, newImageElement])
                            addingImageRef.current = true
                            setSelectedIds([newImageElement.id])
                            setSelectedTool('select')
                            imageDialogOpenedRef.current = false

                          } catch (err) {
                            console.error('Failed to save asset', err)
                          }
                        }
                      }, file.type)
                    }
                  }
                  img.src = src
                }
              }
              reader.readAsDataURL(file)
            } else {
              imageDialogOpenedRef.current = false
              setSelectedIds([])
              setSelectedTool('select')
            }
            e.target.value = ''
          }}
        />

        <input
          ref={stickerInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              const reader = new FileReader()
              reader.onload = (event) => {
                const src = event.target?.result as string
                if (src) {
                  setStickerImage(src)
                  const img = new Image()
                  img.onload = async () => {
                    let pos = { x: 500, y: 500 }
                    if (containerRef.current && transformRef.current?.instance?.transformState) {
                      const container = containerRef.current
                      const state = transformRef.current.instance.transformState
                      const containerWidth = container.clientWidth
                      const containerHeight = container.clientHeight
                      const centerX = (containerWidth / 2 - state.positionX) / state.scale
                      const centerY = (containerHeight / 2 - state.positionY) / state.scale
                      pos = { x: centerX, y: centerY }
                    } else if (stickerClickPosition) {
                      pos = stickerClickPosition
                    }
                    setStickerClickPosition(null)

                    const maxDisplaySize = 300
                    let displayWidth = img.width
                    let displayHeight = img.height
                    if (displayWidth > maxDisplaySize || displayHeight > maxDisplaySize) {
                      const scale = Math.min(maxDisplaySize / displayWidth, maxDisplaySize / displayHeight)
                      displayWidth = displayWidth * scale
                      displayHeight = displayHeight * scale
                    }

                    const maxStorageSize = 512
                    let storeWidth = img.width
                    let storeHeight = img.height
                    if (storeWidth > maxStorageSize || storeHeight > maxStorageSize) {
                      const scale = Math.min(maxStorageSize / storeWidth, maxStorageSize / storeHeight)
                      storeWidth = storeWidth * scale
                      storeHeight = storeHeight * scale
                    }

                    const canvas = document.createElement('canvas')
                    canvas.width = storeWidth
                    canvas.height = storeHeight
                    const ctx = canvas.getContext('2d')

                    let finalSrc = src

                    if (ctx) {
                      ctx.drawImage(img, 0, 0, storeWidth, storeHeight)
                      canvas.toBlob(async (blob) => {
                        if (blob) {
                          try {
                            finalSrc = await saveAsset(blob)
                          } catch (e) {
                            console.error('Failed to save sticker asset', e)
                          }
                        }

                        const newStickerElement: StickerElement = {
                          id: `sticker-${Date.now()}`,
                          type: 'sticker',
                          x: pos.x - displayWidth / 2,
                          y: pos.y - displayHeight / 2,
                          width: displayWidth,
                          height: displayHeight,
                          src: finalSrc,
                          opacity: stickerOptions.opacity / 100,
                        }

                        historyRef.current.push([...elements])
                        redoRef.current = []
                        setElements(prev => [...prev, newStickerElement])
                        setSelectedIds([newStickerElement.id])
                        setSelectedTool('select')

                      }, file.type)
                    } else {
                      const newStickerElement: StickerElement = {
                        id: `sticker-${Date.now()}`,
                        type: 'sticker',
                        x: pos.x - displayWidth / 2,
                        y: pos.y - displayHeight / 2,
                        width: displayWidth,
                        height: displayHeight,
                        src: finalSrc,
                        opacity: stickerOptions.opacity / 100,
                      }

                      historyRef.current.push([...elements])
                      redoRef.current = []
                      setElements(prev => [...prev, newStickerElement])
                      setSelectedIds([newStickerElement.id])
                      setSelectedTool('select')
                    }
                  }
                  img.src = src
                }
              }
              reader.readAsDataURL(file)
            }
          }}
        />

        {getSelectedElementTypeWrapper() === 'sticker' && (
          <div className="absolute top-4 left-20 z-10">
            <StickerOptionsPanel
              options={Object.assign({ opacity: 100 }, getSelectedElementOptionsWrapper() as any)}
              onOptionsChange={(newOptions) => setElements(updateSelectedElements(selectedIds, elements, newOptions))}
            />
          </div>
        )}
        <ZoomControls
          transformRef={transformRef}
          onUndo={handleUndoWrapper}
          onRedo={handleRedoWrapper}
          canUndo={canUndo}
          canRedo={canRedo}
          position={positions.zoom}
          menuPosition={positions.menu}
          isLayoutEditing={isLayoutEditing}
          onPositionChange={handleZoomPosChange}
          onDragPreview={handleDragPreviewZoom}
        />
      </div>
      <FindOnCanvas
        isOpen={isFindSidebarOpen}
        onClose={() => setIsFindSidebarOpen(false)}
        elements={elements}
        onSelectElement={(id) => {
          setSelectedIds([id])
          const el = elements.find(e => e.id === id)
          if (el && transformRef.current && containerRef.current) {
            const containerWidth = containerRef.current.clientWidth
            const containerHeight = containerRef.current.clientHeight

            let elCenterX = 0
            let elCenterY = 0
            let elWidth = 0
            let elHeight = 0

            if (el.type === 'rect' || el.type === 'diamond' || el.type === 'image' || el.type === 'embed' || el.type === 'frame') {

              elCenterX = el.x + el.width / 2
              elCenterY = el.y + el.height / 2
              elWidth = el.width
              elHeight = el.height

            } else if (el.type === 'circle') {

              elCenterX = el.x
              elCenterY = el.y
              elWidth = el.radius * 2
              elHeight = el.radius * 2

            } else if (el.type === 'line' || el.type === 'arrow') {

              const minX = Math.min(el.start.x, el.end.x)
              const maxX = Math.max(el.start.x, el.end.x)
              const minY = Math.min(el.start.y, el.end.y)
              const maxY = Math.max(el.start.y, el.end.y)

              elCenterX = (minX + maxX) / 2
              elCenterY = (minY + maxY) / 2
              elWidth = maxX - minX || 100
              elHeight = maxY - minY || 100

            } else if (el.type === 'path') {

              if (el.bounds) {

                elCenterX = (el.bounds.minX + el.bounds.maxX) / 2
                elCenterY = (el.bounds.minY + el.bounds.maxY) / 2
                elWidth = el.bounds.maxX - el.bounds.minX || 100
                elHeight = el.bounds.maxY - el.bounds.minY || 100

              } else if (el.points.length > 0) {

                const minX = Math.min(...el.points.map(p => p.x))
                const maxX = Math.max(...el.points.map(p => p.x))
                const minY = Math.min(...el.points.map(p => p.y))
                const maxY = Math.max(...el.points.map(p => p.y))

                elCenterX = (minX + maxX) / 2
                elCenterY = (minY + maxY) / 2
                elWidth = maxX - minX || 100
                elHeight = maxY - minY || 100
              }

            } else if (el.type === 'text') {

              elCenterX = el.x + (el.width || 200) / 2
              elCenterY = el.y + (el.height || el.fontSize * 1.2) / 2
              elWidth = el.width || 200
              elHeight = el.height || el.fontSize * 1.2

            }

            let targetScale = 1

            if (elWidth > 0 && elHeight > 0) {

              const padding = 100
              const scaleX = (containerWidth - padding * 2) / elWidth
              const scaleY = (containerHeight - padding * 2) / elHeight
              targetScale = Math.min(Math.min(scaleX, scaleY), 1.5)
              targetScale = Math.max(targetScale, 0.5)

            }

            const targetX = (containerWidth / 2) - (elCenterX * targetScale)
            const targetY = (containerHeight / 2) - (elCenterY * targetScale)

            transformRef.current.setTransform(targetX, targetY, targetScale)
          }
        }}
      />
      <WorkspacesSidebar
        isOpen={isWorkspacesSidebarOpen}
        onClose={() => setIsWorkspacesSidebarOpen(false)}
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
        onCreateWorkspace={(name) => createWorkspace(name)}
        onDeleteWorkspace={(id) => deleteWorkspace(id)}
        onSwitchWorkspace={(id) => switchWorkspace(id)}
      />
      <DebuggerOverlay elements={elements} selectedIds={selectedIds} transformRef={transformRef} containerRef={containerRef} />
      <DropImport isOpen={isDropImportOpen} onClose={() => setIsDropImportOpen(false)} />
    </div >
  )
}