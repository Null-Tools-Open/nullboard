'use client'

import React, { useState, useEffect, useCallback, useRef, Fragment } from 'react'
import { motion } from 'framer-motion'
import {
  Lock,
  Unlock,
  Hand,
  MousePointer2,
  Square,
  Diamond,
  Circle,
  ArrowRight,
  Minus,
  Pencil,
  Type,
  Image as ImageIcon,
  Eraser,
  Box,
  Hash,
  Code,
  Wand2,
  Lasso,
  StickyNote,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type ToolbarPosition } from '@/hooks/useUIPosition'

export type ToolType =
  | 'select'
  | 'pan'
  | 'rectangle'
  | 'diamond'
  | 'circle'
  | 'arrow'
  | 'line'
  | 'pen'
  | 'text'
  | 'image'
  | 'eraser'
  | 'laser'
  | 'lasso'
  | 'frame'
  | 'embed'
  | 'sticker'
  | 'more_tools'
  | 'lock'

interface Tool {
  id: ToolType
  icon: React.ComponentType<{ size?: number; className?: string; fill?: string }>
  label: string
  shortcut?: string
}

const tools: Tool[] = [
  { id: 'pan', icon: Hand, label: 'Pan', shortcut: 'H' },
  { id: 'select', icon: MousePointer2, label: 'Select', shortcut: 'V' },
  { id: 'rectangle', icon: Square, label: 'Rectangle', shortcut: 'R' },
  { id: 'diamond', icon: Diamond, label: 'Diamond', shortcut: 'D' },
  { id: 'circle', icon: Circle, label: 'Circle', shortcut: 'C' },
  { id: 'arrow', icon: ArrowRight, label: 'Arrow', shortcut: 'A' },
  { id: 'line', icon: Minus, label: 'Line', shortcut: 'L' },
  { id: 'pen', icon: Pencil, label: 'Pen', shortcut: 'P' },
  { id: 'text', icon: Type, label: 'Text', shortcut: 'T' },
  { id: 'image', icon: ImageIcon, label: 'Image', shortcut: 'I' },
  { id: 'eraser', icon: Eraser, label: 'Eraser', shortcut: 'E' },
  { id: 'more_tools', icon: Box, label: 'More Tools', shortcut: 'M' },
]

interface ToolbarProps {
  selectedTool?: ToolType
  onToolChange?: (tool: ToolType) => void
  isLocked?: boolean
  onLockToggle?: () => void
  position?: ToolbarPosition
  isLayoutEditing?: boolean
  onPositionChange?: (pos: ToolbarPosition) => void
  onDragPreview?: (pos: ToolbarPosition | null) => void
}

export function Toolbar({ selectedTool = 'select', onToolChange, isLocked = false, onLockToggle, position = 'bottom', isLayoutEditing = false, onPositionChange, onDragPreview }: ToolbarProps) {
  const [activeTool, setActiveTool] = useState<ToolType>(selectedTool)
  const [isVisible, setIsVisible] = useState(false)
  const [snapKey, setSnapKey] = useState(0)
  const lastPreviewRef = useRef<ToolbarPosition | null>(null)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    setActiveTool(selectedTool)
  }, [selectedTool])

  const handleToolClick = useCallback((toolId: ToolType) => {
    if (isLocked) return
    setActiveTool(toolId)
    onToolChange?.(toolId)
  }, [isLocked, onToolChange])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      if (isLocked) return

      if (event.ctrlKey || event.altKey || event.metaKey) return

      const key = event.key.toUpperCase()

      const numericToTool: Record<string, ToolType> = {
        '1': 'pan',
        '2': 'select',
        '3': 'rectangle',
        '4': 'diamond',
        '5': 'circle',
        '6': 'arrow',
        '7': 'line',
        '8': 'pen',
        '9': 'text',
        '0': 'image',
      }

      const keyToTool: Record<string, ToolType> = {
        H: 'pan',
        V: 'select',
        R: 'rectangle',
        D: 'diamond',
        C: 'circle',
        A: 'arrow',
        L: 'line',
        P: 'pen',
        T: 'text',
        I: 'image',
        E: 'eraser',
        M: 'more_tools',
        F: 'frame',
        K: 'laser',
        ...numericToTool,
      }

      const tool = keyToTool[key]
      if (tool) {
        event.preventDefault()
        handleToolClick(tool)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isLocked, handleToolClick])

  const isVertical = position === 'left' || position === 'right'

  const getPositionClasses = () => {
    switch (position) {
      case 'left':
        return 'fixed left-4 top-1/2 -translate-y-1/2'
      case 'right':
        return 'fixed right-4 top-1/2 -translate-y-1/2'
      case 'top':
        return 'fixed top-4 left-1/2 -translate-x-1/2'
      case 'bottom':
      default:
        return 'fixed bottom-4 left-1/2 -translate-x-1/2'
    }
  }

  const getInitialAnimation = () => {
    switch (position) {
      case 'left': return { x: -20, y: 0 }
      case 'right': return { x: 20, y: 0 }
      case 'top': return { x: 0, y: -20 }
      case 'bottom': default: return { x: 0, y: 20 }
    }
  }

  return (
    <motion.div
      key={`${position}-${snapKey}`}
      initial={{ opacity: 0, ...getInitialAnimation() }}
      animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : getInitialAnimation().x, y: isVisible ? 0 : getInitialAnimation().y }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        getPositionClasses(),
        "z-[60]",
        isLayoutEditing && "cursor-grab active:cursor-grabbing"
      )}
      drag={isLayoutEditing}
      dragMomentum={false}
      dragElastic={0}
      whileDrag={{ scale: 1.05, cursor: 'grabbing', opacity: 0.8 }}
      onDrag={(_, info) => {
        if (!onDragPreview) return

        const { x, y } = info.point
        const width = window.innerWidth
        const height = window.innerHeight

        const distTop = y
        const distBottom = height - y
        const distLeft = x
        const distRight = width - x

        const min = Math.min(distTop, distBottom, distLeft, distRight)

        let newPos: ToolbarPosition = 'bottom'
        if (min === distTop) newPos = 'top'
        else if (min === distBottom) newPos = 'bottom'
        else if (min === distLeft) newPos = 'left'
        else if (min === distRight) newPos = 'right'

        if (lastPreviewRef.current !== newPos) {
          lastPreviewRef.current = newPos
          onDragPreview(newPos)
        }
      }}
      onDragEnd={(_, info) => {
        lastPreviewRef.current = null
        onDragPreview?.(null)
        if (!onPositionChange) return

        const { x, y } = info.point
        const width = window.innerWidth
        const height = window.innerHeight

        const distTop = y
        const distBottom = height - y
        const distLeft = x
        const distRight = width - x

        const min = Math.min(distTop, distBottom, distLeft, distRight)

        let newPos: ToolbarPosition = 'bottom'
        if (min === distTop) newPos = 'top'
        else if (min === distBottom) newPos = 'bottom'
        else if (min === distLeft) newPos = 'left'
        else if (min === distRight) newPos = 'right'

        if (newPos === position) {
          setSnapKey(prev => prev + 1)
        } else {
          onPositionChange(newPos)
        }
      }}
    >
      {isLayoutEditing && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse z-[60]" />
      )}
      <div className={cn(
        "flex items-center gap-1 p-2 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 dark:border-zinc-700/50 transition-all duration-300",
        isVertical ? "flex-col" : "flex-row",
        isLayoutEditing && "pointer-events-none cursor-grab active:cursor-grabbing"
      )}>
        {onLockToggle && (
          <>
            <button
              onClick={onLockToggle}
              className={cn(
                'relative flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 cursor-pointer',
                'group',
                isLocked && 'bg-blue-100 dark:bg-blue-900/30'
              )}
              title={isLocked ? 'Unlock tools' : 'Lock tools'}
            >
              <div className="relative z-10">
                {isLocked ? (
                  <Lock size={20} className="text-blue-600 dark:text-blue-400" />
                ) : (
                  <Unlock size={20} className="text-gray-600 dark:text-zinc-400 group-hover:text-gray-900 dark:group-hover:text-zinc-200" />
                )}
              </div>
            </button>
            <div className={cn(
              "bg-gray-300",
              isVertical ? "w-8 h-px my-1" : "w-px h-8 mx-1"
            )} />
          </>
        )}

        {tools.map((tool, index) => {
          const Icon = tool.icon
          const isActive = activeTool === tool.id
          const shouldUseBackground = tool.id === 'pan' || tool.id === 'arrow' || tool.id === 'line' || tool.id === 'pen' || tool.id === 'text' || tool.id === 'image' || tool.id === 'eraser' || tool.id === 'laser'
          const isEraser = tool.id === 'eraser'
          const isMoreTools = tool.id === 'more_tools'
          const isLaserActive = activeTool === 'laser'
          const isLassoActive = activeTool === 'lasso'
          const isFrameActive = activeTool === 'frame'
          const isEmbedActive = activeTool === 'embed'

          const isStickerActive = activeTool === 'sticker'

          const DisplayIcon = isMoreTools && isLaserActive ? Wand2 : (isMoreTools && isLassoActive ? Lasso : (isMoreTools && isFrameActive ? Hash : (isMoreTools && isEmbedActive ? Code : (isMoreTools && isStickerActive ? StickyNote : Icon))))

          const buttonContent = (
            <motion.button
              key={tool.id}
              onClick={() => !isMoreTools && handleToolClick(tool.id)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.15,
                delay: Math.min(index * 0.01, 0.1),
                ease: 'easeOut'
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'relative flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 cursor-pointer',
                'group',
                (isActive && shouldUseBackground) || (isMoreTools && (isLaserActive || isLassoActive || isFrameActive || isEmbedActive)) ? 'bg-blue-100 dark:bg-blue-900/30' : '',
                isLocked && 'opacity-50 cursor-not-allowed'
              )}
              disabled={isLocked}
              title={
                isMoreTools ? 'More Tools' :
                  `${tool.label}${tool.shortcut ? ` (${tool.shortcut})` : ''}`
              }
            >
              <div className={cn(
                'relative z-10',
                shouldUseBackground && '[&_svg_path]:!fill-none [&_svg_circle]:!fill-none [&_svg_rect]:!fill-none [&_svg_polygon]:!fill-none [&_svg_ellipse]:!fill-none [&_svg_path]:!stroke-currentColor [&_svg_circle]:!stroke-currentColor [&_svg_rect]:!stroke-currentColor [&_svg_polygon]:!stroke-currentColor [&_svg_ellipse]:!stroke-currentColor',
                isActive && !shouldUseBackground && !(isMoreTools && (isLaserActive || isFrameActive)) && '[&_svg]:[&_*]:!fill-black dark:[&_svg]:[&_*]:!fill-white [&_svg_path]:!fill-black dark:[&_svg_path]:!fill-white [&_svg_circle]:!fill-black dark:[&_svg_circle]:!fill-white [&_svg_rect]:!fill-black dark:[&_svg_rect]:!fill-white [&_svg_polygon]:!fill-black dark:[&_svg_polygon]:!fill-white [&_svg_ellipse]:!fill-black dark:[&_svg_ellipse]:!fill-white [&_svg_line]:!fill-black dark:[&_svg_line]:!fill-white [&_svg_polyline]:!fill-black dark:[&_svg_polyline]:!fill-white [&_svg_g]:[&_*]:!fill-black dark:[&_svg_g]:[&_*]:!fill-white [&_svg_path]:!stroke-none [&_svg_circle]:!stroke-none [&_svg_rect]:!stroke-none [&_svg_polygon]:!stroke-none [&_svg_ellipse]:!stroke-none'
              )}>
                <DisplayIcon
                  size={20}
                  className={cn(
                    'transition-colors duration-200',
                    (isActive || (isMoreTools && (isLaserActive || isLassoActive || isFrameActive || isEmbedActive || isStickerActive)))
                      ? shouldUseBackground || (isMoreTools && (isLaserActive || isLassoActive || isFrameActive || isEmbedActive || isStickerActive))
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-black dark:text-white'
                      : 'text-gray-600 dark:text-zinc-400 group-hover:text-gray-900 dark:group-hover:text-zinc-200'
                  )}
                />
              </div>

              {index < 10 && (
                <span
                  className={cn(
                    'absolute bottom-0.5 right-0.5 text-[10px] font-medium z-10 transition-colors duration-200',
                    isActive ? 'text-gray-400' : 'text-gray-400'
                  )}
                >
                  {index === 9 ? '0' : index + 1}
                </span>
              )}
            </motion.button>
          )

          if (isMoreTools) {
            return (
              <DropdownMenu key={tool.id} onOpenChange={(open) => {
                if (isLocked && open) {
                  return
                }
              }}>
                <DropdownMenuTrigger asChild disabled={isLocked}>
                  {buttonContent}
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align={isVertical ? "start" : "end"}
                  side={isVertical ? (position === 'left' ? "right" : "left") : "top"}
                  sideOffset={8}
                  className="w-64 bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700"
                >
                  <DropdownMenuItem onClick={() => handleToolClick('frame' as ToolType)}>
                    <Hash size={16} />
                    <span>Frame</span>
                    <span className="ml-auto text-xs text-gray-400">F</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleToolClick('embed' as ToolType)}>
                    <Code size={16} />
                    <span>Media Embed</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleToolClick('sticker' as ToolType)}>
                    <StickyNote size={16} />
                    <span>Sticker</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    if (activeTool === 'laser') {
                      handleToolClick('select' as ToolType)
                    } else {
                      handleToolClick('laser' as ToolType)
                    }
                  }}>
                    <Wand2 size={16} />
                    <span>Laser Pointer</span>
                    <span className="ml-auto text-xs text-gray-400">K</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleToolClick('lasso' as ToolType)}>
                    <Lasso size={16} />
                    <span>Lasso selection</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          }

          return (
            <Fragment key={tool.id}>
              {buttonContent}
              {isEraser && <div className={cn(
                "bg-gray-300",
                isVertical ? "w-8 h-px my-1" : "w-px h-8 mx-1"
              )} />}
            </Fragment>
          )
        })}
      </div>
    </motion.div>
  )
}