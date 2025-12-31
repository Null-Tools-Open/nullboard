'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

export interface StickerOptions {
    opacity: number
    cornerStyle?: 'sharp' | 'rounded'
}

interface StickerOptionsPanelProps {
    options: StickerOptions
    onOptionsChange: (options: StickerOptions) => void
    onClose?: () => void
}

export function StickerOptionsPanel({ options, onOptionsChange, onClose }: StickerOptionsPanelProps) {
    const [localOptions, setLocalOptions] = useState<StickerOptions>(options)

    const updateOption = <K extends keyof StickerOptions>(key: K, value: StickerOptions[K]) => {
        const newOptions = { ...localOptions, [key]: value }
        setLocalOptions(newOptions)
        onOptionsChange(newOptions)
    }

    return (
        <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl shadow-xl p-4 w-64">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Sticker</h3>
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
                <label className="text-xs text-gray-600 dark:text-zinc-400 mb-2 block">Corners</label>
                <div className="flex gap-2">
                    <button
                        onClick={() => updateOption('cornerStyle', 'sharp')}
                        className={cn(
                            'flex-1 h-16 rounded border-2 transition-all flex items-center justify-center relative',
                            localOptions.cornerStyle === 'sharp' || !localOptions.cornerStyle
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                                : 'border-gray-300 dark:border-zinc-600 hover:border-gray-400 dark:hover:border-zinc-500 bg-gray-50 dark:bg-zinc-800/50'
                        )}
                    >
                        <div className="w-12 h-12 border-2 border-gray-600 dark:border-zinc-400" style={{ borderRadius: 0 }} />
                    </button>

                    <button
                        onClick={() => updateOption('cornerStyle', 'rounded')}
                        className={cn(
                            'flex-1 h-16 rounded border-2 transition-all flex items-center justify-center relative',
                            localOptions.cornerStyle === 'rounded'
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                                : 'border-gray-300 dark:border-zinc-600 hover:border-gray-400 dark:hover:border-zinc-500 bg-gray-50 dark:bg-zinc-800/50'
                        )}
                    >
                        <div className="w-12 h-12 border-2 border-gray-600 dark:border-zinc-400 rounded-xl" />
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
                <div className="flex justify-between text-xs text-gray-400 dark:text-zinc-500 mt-1">
                    <span>0</span>
                    <span>100</span>
                </div>
            </div>
        </div>
    )
}