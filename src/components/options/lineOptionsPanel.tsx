'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ColorPicker } from '../colorPicker'

export interface LineOptions {
  strokeColor: string
  strokeWidth: number
  strokeStyle: 'solid' | 'dashed' | 'dotted' | 'wavy'
  opacity: number
}

interface LineOptionsPanelProps {
  options: LineOptions
  onOptionsChange: (options: LineOptions) => void
  onClose?: () => void
}

const strokeColors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFA500', '#FFFFFF']

export function LineOptionsPanel({ options, onOptionsChange, onClose }: LineOptionsPanelProps) {
  const [localOptions, setLocalOptions] = useState<LineOptions>(options)

  const updateOption = <K extends keyof LineOptions>(key: K, value: LineOptions[K]) => {
    const newOptions = { ...localOptions, [key]: value }
    setLocalOptions(newOptions)
    onOptionsChange(newOptions)
  }

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl shadow-xl p-4 w-64">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Line</h3>
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
          {strokeColors.map((color, index) => (
            <button
              key={index}
              onClick={() => updateOption('strokeColor', color)}
              className={cn(
                'w-8 h-8 rounded border-2 transition-all',
                localOptions.strokeColor === color
                  ? 'border-blue-500 scale-110'
                  : 'border-gray-300 dark:border-zinc-600 hover:border-gray-400 dark:hover:border-zinc-500'
              )}
              style={{ backgroundColor: color }}
            />
          ))}
          <div className="w-px h-8 bg-gray-300 dark:bg-zinc-700 mx-1" />
          <ColorPicker
            value={localOptions.strokeColor}
            onChange={(color) => updateOption('strokeColor', color || '#000000')}
            allowTransparent={false}
            position="left"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="text-xs text-gray-600 dark:text-zinc-400 mb-2 block">Stroke Width</label>
        <div className="flex gap-2">
          {[1, 3, 5].map((width) => (
            <button
              key={width}
              onClick={() => updateOption('strokeWidth', width)}
              className={cn(
                'flex-1 h-10 rounded border-2 transition-all flex items-center justify-center',
                localOptions.strokeWidth === width
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                  : 'border-gray-300 dark:border-zinc-600 hover:border-gray-400 dark:hover:border-zinc-500'
              )}
            >
              <div
                className="bg-gray-600 dark:bg-zinc-400"
                style={{ width: '80%', height: `${width}px` }}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="text-xs text-gray-600 dark:text-zinc-400 mb-2 block">Stroke Style</label>
        <div className="grid grid-cols-3 gap-2 mb-2">
          <button
            onClick={() => updateOption('strokeStyle', 'solid')}
            className={cn(
              'h-10 rounded border-2 transition-all flex items-center justify-center',
              localOptions.strokeStyle === 'solid'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                : 'border-gray-300 dark:border-zinc-600 hover:border-gray-400 dark:hover:border-zinc-500'
            )}
          >
            <div className="w-3/4 h-0.5 bg-gray-600 dark:bg-zinc-400" />
          </button>
          <button
            onClick={() => updateOption('strokeStyle', 'dashed')}
            className={cn(
              'h-10 rounded border-2 transition-all flex items-center justify-center',
              localOptions.strokeStyle === 'dashed'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                : 'border-gray-300 dark:border-zinc-600 hover:border-gray-400 dark:hover:border-zinc-500'
            )}
          >
            <svg width="40" height="4" viewBox="0 0 40 4">
              <line x1="0" y1="2" x2="40" y2="2" stroke="currentColor" className="text-gray-600 dark:text-zinc-400" strokeWidth="2" strokeDasharray="8,4" />
            </svg>
          </button>
          <button
            onClick={() => updateOption('strokeStyle', 'dotted')}
            className={cn(
              'h-10 rounded border-2 transition-all flex items-center justify-center',
              localOptions.strokeStyle === 'dotted'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                : 'border-gray-300 dark:border-zinc-600 hover:border-gray-400 dark:hover:border-zinc-500'
            )}
          >
            <svg width="40" height="4" viewBox="0 0 40 4">
              <line x1="0" y1="2" x2="40" y2="2" stroke="currentColor" className="text-gray-600 dark:text-zinc-400" strokeWidth="2" strokeDasharray="2,4" />
            </svg>
          </button>
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