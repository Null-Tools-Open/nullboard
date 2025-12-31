'use client'

import { useDebugger } from '@/contexts/debuggerContext'
import { useWorkspaces } from '@/hooks/useWorkspaces'
import { useTheme } from '@/hooks/useTheme'
import type { CanvasElement, Point } from '@/components/canvas/shared'
import { toScreen } from '@/components/canvas/shared'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface DebuggerOverlayProps {
  elements?: CanvasElement[]
  selectedIds?: string[]
  transformRef?: React.RefObject<any>
  containerRef?: React.RefObject<HTMLDivElement | null>
}

export function DebuggerOverlay({ elements = [], selectedIds = [], transformRef, containerRef }: DebuggerOverlayProps) {
  const { debugView, debViewAlw } = useDebugger()
  const { resolvedTheme } = useTheme()
  const [transformState, setTransformState] = useState<{ positionX: number; positionY: number; scale: number } | null>(null)

  useEffect(() => {
    if (!transformRef?.current) return

    const updateTransform = () => {
      const state = transformRef.current?.instance?.transformState
      if (state) {
        setTransformState({
          positionX: state.positionX,
          positionY: state.positionY,
          scale: state.scale
        })
      }
    }

    updateTransform()
    const interval = setInterval(updateTransform, 16)
    return () => clearInterval(interval)
  }, [transformRef])

  if (!debugView) return null

  const elementsToShow = debViewAlw ? elements : elements.filter(el => selectedIds.includes(el.id))

  const getElementPosition = (el: CanvasElement): Point | null => {
    if (!transformState || !containerRef?.current) return null

    const container = containerRef.current
    const rect = container.getBoundingClientRect()

    let worldPos: Point

    if ('x' in el && 'y' in el) {
      worldPos = { x: el.x, y: el.y }
    } else if ('start' in el) {
      worldPos = el.start
    } else if ('points' in el && el.points.length > 0) {
      worldPos = el.points[0]
    } else {
      return null
    }

    const screenPos = toScreen(worldPos, transformState)
    return {
      x: screenPos.x + rect.left,
      y: screenPos.y + rect.top
    }
  }

  const getElementCenter = (el: CanvasElement): Point | null => {
    if (!transformState || !containerRef?.current) return null

    const container = containerRef.current
    const rect = container.getBoundingClientRect()

    let worldPos: Point
    let offsetY = 0

    if ('x' in el && 'y' in el) {
      worldPos = { x: el.x, y: el.y }
      if ('height' in el && el.height !== undefined) {
        offsetY = -el.height / 2
      } else if ('radius' in el) {
        offsetY = -el.radius
      }
    } else if ('start' in el && 'end' in el) {
      worldPos = {
        x: (el.start.x + el.end.x) / 2,
        y: (el.start.y + el.end.y) / 2
      }
    } else if ('points' in el && el.points.length > 0) {
      const bounds = el.bounds
      if (bounds) {
        worldPos = {
          x: (bounds.minX + bounds.maxX) / 2,
          y: (bounds.minY + bounds.maxY) / 2
        }
      } else {
        worldPos = el.points[0]
      }
    } else {
      return null
    }

    const screenPos = toScreen(worldPos, transformState)
    return {
      x: screenPos.x + rect.left,
      y: screenPos.y + rect.top + offsetY * transformState.scale
    }
  }

  const getElementInfoLines = (el: CanvasElement): string[] => {
    const lines: string[] = []
    lines.push(`type: ${el.type}`)
    lines.push(`id: ${el.id}`)

    if ('x' in el) lines.push(`x: ${Math.round(el.x)}`)
    if ('y' in el) lines.push(`y: ${Math.round(el.y)}`)
    if ('width' in el && el.width !== undefined) lines.push(`width: ${Math.round(el.width)}`)
    if ('height' in el && el.height !== undefined) lines.push(`height: ${Math.round(el.height)}`)
    if ('radius' in el) lines.push(`radius: ${Math.round(el.radius)}`)
    if ('strokeColor' in el) lines.push(`strokeColor: ${el.strokeColor}`)
    if ('fillColor' in el) lines.push(`fillColor: ${el.fillColor || 'none'}`)
    if ('strokeWidth' in el) lines.push(`strokeWidth: ${el.strokeWidth}`)
    if ('strokeStyle' in el) lines.push(`strokeStyle: ${el.strokeStyle}`)
    if ('color' in el) lines.push(`color: ${el.color}`)
    if (el.type === 'path' && 'width' in el) lines.push(`width: ${el.width}`)
    if ('points' in el) lines.push(`points: ${el.points.length}`)
    if ('start' in el) {
      lines.push(`start: (${Math.round(el.start.x)}, ${Math.round(el.start.y)})`)
      lines.push(`end: (${Math.round(el.end.x)}, ${Math.round(el.end.y)})`)
    }
    if ('text' in el) lines.push(`text: "${el.text}"`)
    if ('fontSize' in el) lines.push(`fontSize: ${el.fontSize}`)
    if ('fontFamily' in el) lines.push(`fontFamily: ${el.fontFamily}`)
    if ('fontWeight' in el) lines.push(`fontWeight: ${el.fontWeight}`)
    if ('fontStyle' in el) lines.push(`fontStyle: ${el.fontStyle}`)
    if ('textAlign' in el) lines.push(`textAlign: ${el.textAlign}`)
    if ('src' in el) lines.push(`src: ${el.src}`)
    if ('url' in el) lines.push(`url: ${el.url || 'none'}`)
    if ('name' in el) lines.push(`name: ${el.name || 'unnamed'}`)
    if ('layer' in el) lines.push(`layer: ${el.layer}`)
    if ('arrowStart' in el) lines.push(`arrowStart: ${el.arrowStart}`)
    if ('arrowEnd' in el) lines.push(`arrowEnd: ${el.arrowEnd}`)
    if ('arrowType' in el) lines.push(`arrowType: ${el.arrowType}`)
    if ('cornerStyle' in el) lines.push(`cornerStyle: ${el.cornerStyle}`)
    if ('opacity' in el) lines.push(`opacity: ${Math.round(el.opacity * 100)}%`)

    return lines
  }

  if (elementsToShow.length === 0) return null

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {elementsToShow.map((el) => {
        const position = getElementCenter(el)
        if (!position) return null

        const lines = getElementInfoLines(el)

        const isDark = resolvedTheme === 'dark'
        
        return (
          <div
            key={el.id}
            className={cn(
              "absolute font-mono text-[10px] leading-tight",
              isDark ? "text-white" : "text-black"
            )}
            style={{
              left: `${position.x}px`,
              top: `${position.y - (lines.length * 12 + 10)}px`,
              transform: 'translateX(-50%)',
              textShadow: isDark 
                ? '0 0 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6), 1px 1px 2px rgba(0,0,0,0.8)'
                : 'none'
            }}
          >
            {lines.map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
          </div>
        )
      })}
    </div>
  )
}