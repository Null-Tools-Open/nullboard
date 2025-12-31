'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { Minus, Plus, RotateCcw, RotateCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MenuPosition } from '@/hooks/useUIPosition'
import { motion } from 'framer-motion'

interface ZoomControlsProps {
  transformRef: React.RefObject<any>
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  onZoomChange?: (zoom: number) => void
  position?: MenuPosition
  menuPosition?: MenuPosition
  previewPosition?: MenuPosition | null
  isLayoutEditing?: boolean
  onPositionChange?: (pos: MenuPosition) => void
  onDragPreview?: (pos: MenuPosition | null) => void
}

export function ZoomControls({
  transformRef,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onZoomChange,
  position = 'bottom-left',
  isLayoutEditing = false,
  onPositionChange,
  onDragPreview

}: ZoomControlsProps) {

  const [zoomLevel, setZoomLevel] = useState(100)
  const [snapKey, setSnapKey] = useState(0)
  const lastPreviewRef = useRef<MenuPosition | null>(null)
  const isDraggingRef = useRef(false)
  const onZoomChangeRef = useRef(onZoomChange)
  const dragThrottleRef = useRef<number | null>(null)

  useEffect(() => {
    onZoomChangeRef.current = onZoomChange
  }, [onZoomChange])

  const updateZoomLevel = useCallback(() => {
    if (isDraggingRef.current) return

    if (transformRef.current?.instance?.transformState) {
      const scale = transformRef.current.instance.transformState.scale || 1
      const newZoom = Math.round(scale * 100)
      setZoomLevel(newZoom)
      if (onZoomChangeRef.current) {
        onZoomChangeRef.current(newZoom)
      }
    }
  }, [transformRef])

  useEffect(() => {
    if (isLayoutEditing) return

    const interval = setInterval(() => {

      if (!isDraggingRef.current) {
        updateZoomLevel()
      }
    }, 50)
    updateZoomLevel()

    return () => clearInterval(interval)
  }, [updateZoomLevel, isLayoutEditing])

  const handleZoomIn = () => {
    if (transformRef.current?.zoomIn) {
      transformRef.current.zoomIn(0.5, 200)
      setTimeout(updateZoomLevel, 250)
    }
  }

  const handleZoomOut = () => {
    if (transformRef.current?.zoomOut) {
      transformRef.current.zoomOut(0.5, 200)
      setTimeout(updateZoomLevel, 250)
    }
  }

  const positionClasses = useMemo(() => {
    const effectivePosition = position

    switch (effectivePosition) {
      case 'bottom-left':
        return cn('bottom-4 left-[80px]')
      case 'bottom-right':
        return cn('bottom-4 flex-row-reverse right-[80px]')
      case 'top-left':
        return cn('top-4 left-[80px]')
      case 'top-right':
        return cn('top-4 flex-row-reverse right-[80px]')
      default:
        return 'bottom-4 left-[80px]'
    }
  }, [position])

  return (
    <motion.div
      key={`${position}-${snapKey}`}
      className={cn(
        "fixed z-50 flex gap-3 transition-[top,left,right,bottom] duration-300",
        positionClasses,
        isLayoutEditing && "z-[70] cursor-grab active:cursor-grabbing"
      )}
      drag={isLayoutEditing}
      dragMomentum={false}
      dragElastic={0}
      whileDrag={{ scale: 1.05, cursor: 'grabbing', opacity: 0.8 }}
      onDragStart={() => {
        isDraggingRef.current = true
      }}
      onDrag={(_, info) => {
        if (!onDragPreview) return

        if (dragThrottleRef.current !== null) return

        dragThrottleRef.current = requestAnimationFrame(() => {
          dragThrottleRef.current = null

          const { x, y } = info.point
          const width = window.innerWidth
          const height = window.innerHeight

          const isLeft = x < width / 2
          const isTop = y < height / 2

          let newPos: MenuPosition = 'top-left'
          if (isTop && isLeft) newPos = 'top-left'
          else if (isTop && !isLeft) newPos = 'top-right'
          else if (!isTop && isLeft) newPos = 'bottom-left'
          else if (!isTop && !isLeft) newPos = 'bottom-right'

          if (lastPreviewRef.current !== newPos) {
            lastPreviewRef.current = newPos
            onDragPreview(newPos)
          }
        })
      }}
      onDragEnd={(_, info) => {
        isDraggingRef.current = false
        if (dragThrottleRef.current !== null) {
          cancelAnimationFrame(dragThrottleRef.current)
          dragThrottleRef.current = null
        }
        lastPreviewRef.current = null
        onDragPreview?.(null)
        if (!onPositionChange) return

        const { x, y } = info.point
        const width = window.innerWidth
        const height = window.innerHeight
        const isLeft = x < width / 2
        const isTop = y < height / 2

        let newPos: MenuPosition = 'top-left'
        if (isTop && isLeft) newPos = 'top-left'
        else if (isTop && !isLeft) newPos = 'top-right'
        else if (!isTop && isLeft) newPos = 'bottom-left'
        else if (!isTop && !isLeft) newPos = 'bottom-right'

        if (newPos === position) {
          setSnapKey(prev => prev + 1)
        } else {
          onPositionChange(newPos)
        }
      }}
    >
      <div className={cn(
        "flex items-center gap-0 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md rounded-2xl px-3 py-2 shadow-sm border border-gray-200/50 dark:border-zinc-700/50",
        isLayoutEditing && "pointer-events-none cursor-grab active:cursor-grabbing"
      )}>
        <button
          onClick={handleZoomOut}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-700/50 rounded-lg transition-colors cursor-pointer"
          aria-label="Zoom out"
        >
          <Minus size={18} className="text-gray-700 dark:text-zinc-200" />
        </button>
        <span className="px-3 text-sm font-medium text-gray-700 dark:text-zinc-200 min-w-[3rem] text-center select-none">
          {zoomLevel}%
        </span>
        <button
          onClick={handleZoomIn}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-700/50 rounded-lg transition-colors cursor-pointer"
          aria-label="Zoom in"
        >
          <Plus size={18} className="text-gray-700 dark:text-zinc-200" />
        </button>
      </div>

      <div className={cn(
        "flex items-center gap-0 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md rounded-2xl px-3 py-2 shadow-sm border border-gray-200/50 dark:border-zinc-700/50",
        isLayoutEditing && "pointer-events-none cursor-grab active:cursor-grabbing"
      )}>
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={cn(
            "p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-700/50 rounded-lg transition-colors cursor-pointer",
            !canUndo && "opacity-40 cursor-not-allowed"
          )}
          aria-label="Undo"
        >
          <RotateCcw size={18} className="text-gray-700 dark:text-zinc-200" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={cn(
            "p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-700/50 rounded-lg transition-colors cursor-pointer",
            !canRedo && "opacity-40 cursor-not-allowed"
          )}
          aria-label="Redo"
        >
          <RotateCw size={18} className="text-gray-700 dark:text-zinc-200" />
        </button>
      </div>
    </motion.div>
  )
}