'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Pencil, Type, Code, AlignLeft, AlignCenter, AlignRight, Circle } from 'lucide-react'
import { ColorPicker } from '../colorPicker'

export interface TextOptions {
  color: string
  fontSize: number
  fontFamily: string
  fontWeight: 'normal' | 'bold'
  fontStyle: 'hand-drawn' | 'normal' | 'code' | 'n-dot'
  textAlign: 'left' | 'center' | 'right'
  opacity: number
}

interface TextOptionsPanelProps {
  options: TextOptions
  onOptionsChange: (options: TextOptions) => void
  onClose?: () => void
}

const textColors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFA500', '#FFFFFF']
const fontStyles = [
  { id: 'hand-drawn', icon: Pencil, label: 'Hand-drawn' },
  { id: 'normal', icon: Type, label: 'Normal' },
  { id: 'code', icon: Code, label: 'Code' },
  { id: 'n-dot', icon: Circle, label: 'N Dot' }
] as const
const fontSizes = [
  { id: 'small', value: 12, label: 'S' },
  { id: 'medium', value: 16, label: 'M' },
  { id: 'large', value: 24, label: 'L' },
  { id: 'xl', value: 32, label: 'XL' }
] as const
const textAlignments = [
  { id: 'left', icon: AlignLeft },
  { id: 'center', icon: AlignCenter },
  { id: 'right', icon: AlignRight }
] as const

export function TextOptionsPanel({ options, onOptionsChange, onClose }: TextOptionsPanelProps) {
  const [localOptions, setLocalOptions] = useState<TextOptions>(options)

  useEffect(() => {
    setLocalOptions(options)
  }, [options.color, options.fontSize, options.fontFamily, options.fontWeight, options.fontStyle, options.textAlign, options.opacity])

  const updateOption = <K extends keyof TextOptions>(key: K, value: TextOptions[K]) => {
    const newOptions = { ...localOptions, [key]: value }
    setLocalOptions(newOptions)
    onOptionsChange(newOptions)
  }

  const currentSizeId = fontSizes.find(s => s.value === localOptions.fontSize)?.id || 'medium'

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl shadow-xl p-4 w-64">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Text</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      <div className="mb-4">
        <label className="text-xs text-gray-600 dark:text-zinc-400 mb-2 block">Stroke</label>
        <div className="flex gap-1 items-center">
          {textColors.map((color, index) => (
            <button
              key={index}
              onClick={() => updateOption('color', color)}
              className={cn(
                'w-8 h-8 rounded border-2 transition-all',
                localOptions.color === color
                  ? 'border-blue-500 scale-110'
                  : 'border-gray-300 dark:border-zinc-600 hover:border-gray-400 dark:hover:border-zinc-500'
              )}
              style={{ backgroundColor: color }}
            />
          ))}
          <div className="w-px h-8 bg-gray-300 dark:bg-zinc-700 mx-1" />
          <ColorPicker
            value={localOptions.color}
            onChange={(color) => updateOption('color', color || '#000000')}
            allowTransparent={false}
            position="left"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="text-xs text-gray-600 dark:text-zinc-400 mb-2 block">Font Style</label>
        <div className="grid grid-cols-4 gap-2">
          {fontStyles.map((style) => {
            const Icon = style.icon
            return (
              <button
                key={style.id}
                onClick={() => updateOption('fontStyle', style.id)}
                className={cn(
                  'h-10 rounded border-2 transition-all flex items-center justify-center',
                  localOptions.fontStyle === style.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                    : 'border-gray-300 dark:border-zinc-600 hover:border-gray-400 dark:hover:border-zinc-500'
                )}
                title={style.label}
              >
                <Icon size={16} className={localOptions.fontStyle === style.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-zinc-400'} />
              </button>
            )
          })}
        </div>
      </div>

      <div className="mb-4">
        <label className="text-xs text-gray-600 dark:text-zinc-400 mb-2 block">Text Size</label>
        <div className="grid grid-cols-4 gap-2">
          {fontSizes.map((size) => (
            <button
              key={size.id}
              onClick={() => updateOption('fontSize', size.value)}
              className={cn(
                'h-10 rounded border-2 transition-all flex items-center justify-center text-sm font-medium',
                currentSizeId === size.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'border-gray-300 dark:border-zinc-600 hover:border-gray-400 dark:hover:border-zinc-500 text-gray-700 dark:text-zinc-300'
              )}
            >
              {size.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="text-xs text-gray-600 dark:text-zinc-400 mb-2 block">Text Alignment</label>
        <div className="grid grid-cols-3 gap-2">
          {textAlignments.map((align) => {
            const Icon = align.icon
            return (
              <button
                key={align.id}
                onClick={() => updateOption('textAlign', align.id)}
                className={cn(
                  'h-10 rounded border-2 transition-all flex items-center justify-center',
                  localOptions.textAlign === align.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                    : 'border-gray-300 dark:border-zinc-600 hover:border-gray-400 dark:hover:border-zinc-500'
                )}
              >
                <Icon size={16} className={localOptions.textAlign === align.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-zinc-400'} />
              </button>
            )
          })}
        </div>
      </div>

      <div className="mb-4">
        <label className="text-xs text-gray-600 dark:text-zinc-400 mb-2 block">
          Opacity: {localOptions.opacity}
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={localOptions.opacity}
          onChange={(e) => updateOption('opacity', Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0</span>
          <span>100</span>
        </div>
      </div>
    </div>
  )
}