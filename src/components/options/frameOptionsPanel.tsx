'use client'

import { useState, useEffect } from 'react'

export interface FrameOptions {
  opacity: number
  name?: string
}

interface FrameOptionsPanelProps {
  options: FrameOptions
  onOptionsChange: (options: FrameOptions) => void
  onClose?: () => void
}

export function FrameOptionsPanel({ options, onOptionsChange, onClose }: FrameOptionsPanelProps) {
  const [localOptions, setLocalOptions] = useState<FrameOptions>(options)

  useEffect(() => {
    setLocalOptions(options)
  }, [options])

  const updateOption = <K extends keyof FrameOptions>(key: K, value: FrameOptions[K]) => {
    const newOptions = { ...localOptions, [key]: value }
    setLocalOptions(newOptions)
    onOptionsChange(newOptions)
  }

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl shadow-xl p-4 w-64">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Frame</h3>
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
        <label className="text-xs text-gray-600 dark:text-zinc-400 mb-2 block">
          Name
        </label>
        <input
          type="text"
          value={localOptions.name ?? ''}
          onChange={(e) => updateOption('name', e.target.value || undefined)}
          placeholder="Frame name"
          className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500"
          onKeyDown={(e) => {
            if (e.key === 'Backspace' || e.key === 'Delete') {
              e.stopPropagation()
            }
            if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault()
              e.currentTarget.select()
              e.stopPropagation()
            }
            if ((e.key === 'c' || e.key === 'v' || e.key === 'x') && (e.ctrlKey || e.metaKey)) {
              e.stopPropagation()
            }
          }}
        />
      </div>

      <div className="mb-4">
        <label className="text-xs text-gray-600 dark:text-zinc-400 mb-2 block">
          Opacity: {localOptions.opacity}%
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
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  )
}