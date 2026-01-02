'use client'

import { useDebugger } from '@/contexts/debuggerContext'
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

    const orderedKeys = ['type', 'id', 'x', 'y', 'width', 'height']

    orderedKeys.forEach(key => {
      if (key in el) {
        // @ts-ignore
        const val = el[key]
        lines.push(`${key}: ${typeof val === 'number' ? Math.round(val) : val}`)
      }
    })

    Object.entries(el).forEach(([key, value]) => {
      if (orderedKeys.includes(key)) return

      let displayVal = value
      if (typeof value === 'number') {
        displayVal = Math.round(value * 100) / 100
      } else if (key === 'points' && Array.isArray(value)) {
        displayVal = `${value.length} pts`
      } else if (typeof value === 'object' && value !== null) {
        if ('x' in value && 'y' in value) {
          displayVal = `(${Math.round(value.x)}, ${Math.round(value.y)})`
        } else {
          try {
            displayVal = JSON.stringify(value).substring(0, 20) + (JSON.stringify(value).length > 20 ? '...' : '')
          } catch {
            displayVal = '[object]'
          }
        }
      }

      lines.push(`${key}: ${displayVal}`)
    })

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