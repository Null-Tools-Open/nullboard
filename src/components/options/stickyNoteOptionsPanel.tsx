'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ColorPicker } from '../colorPicker'

export interface StickyNoteOptions {
    color: string
    opacity: number
    foldCorner: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'none'
}

interface StickyNoteOptionsPanelProps {
    options: StickyNoteOptions
    onOptionsChange: (options: StickyNoteOptions) => void
    onClose?: () => void
}

const STICKY_NOTE_COLORS = [
    '#fef08a', // Yellow
    '#fca5a5', // Red
    '#86efac', // Green
    '#93c5fd', // Blue
    '#f9a8d4', // Pink
    '#fdba74', // Orange
    '#c4b5fd', // Purple
    '#ffffff', // White
]

export function StickyNoteOptionsPanel({ options, onOptionsChange, onClose }: StickyNoteOptionsPanelProps) {
    const [localOptions, setLocalOptions] = useState<StickyNoteOptions>(options)

    const updateOption = <K extends keyof StickyNoteOptions>(key: K, value: StickyNoteOptions[K]) => {
        const newOptions = { ...localOptions, [key]: value }
        setLocalOptions(newOptions)
        onOptionsChange(newOptions)
    }

    const FoldIcon = ({ corner }: { corner: StickyNoteOptions['foldCorner'] }) => {
        if (corner === 'none') {
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600 dark:text-zinc-400">
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                </svg>
            )
        }

        return (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600 dark:text-zinc-400">
                <path d={
                    corner === 'topRight' ? "M15 4v5h5 M4 4h11l5 5v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" :
                        corner === 'topLeft' ? "M9 4v5H4 M20 4H9L4 9v11a2 2 0 0 1 2 2h14a2 2 0 0 1 2-2V6a2 2 0 0 1-2-2z" :
                            corner === 'bottomRight' ? "M15 20v-5h5 M4 20h11l5-5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11z" :
                                "M9 20v-5H4 M20 20H9L4 15V4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v11z"
                } />
            </svg>
        )
    }

    return (
        <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl shadow-xl p-4 w-64">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Sticky Note</h3>
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
                <label className="text-xs text-gray-600 dark:text-zinc-400 mb-2 block">Color</label>
                <div className="flex gap-1 items-center flex-wrap">
                    {STICKY_NOTE_COLORS.slice(0, 6).map((color) => (
                        <button
                            key={color}
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
                        onChange={(color) => updateOption('color', color || '#fef08a')}
                        allowTransparent={false}
                        position="left"
                    />
                </div>
            </div>

            <div className="mb-4">
                <label className="text-xs text-gray-600 dark:text-zinc-400 mb-2 block">Fold Corner</label>
                <div className="flex gap-2">
                    {(['topRight', 'topLeft', 'bottomRight', 'bottomLeft', 'none'] as const).map((corner) => (
                        <button
                            key={corner}
                            onClick={() => updateOption('foldCorner', corner)}
                            className={cn(
                                'flex-1 h-10 rounded border-2 transition-all flex items-center justify-center',
                                localOptions.foldCorner === corner
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                                    : 'border-gray-300 dark:border-zinc-600 hover:border-gray-400 dark:hover:border-zinc-500'
                            )}
                            title={corner === 'none' ? 'No fold' : `Fold ${corner}`}
                        >
                            <FoldIcon corner={corner} />
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-2">
                <label className="text-xs text-gray-600 dark:text-zinc-400 mb-2 block">
                    Opacity: {localOptions.opacity}%
                </label>
                <input
                    type="range"
                    min="10"
                    max="100"
                    value={localOptions.opacity}
                    onChange={(e) => updateOption('opacity', Number(e.target.value))}
                    className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 dark:text-zinc-500 mt-1">
                    <span>10</span>
                    <span>100</span>
                </div>
            </div>
        </div>
    )
}