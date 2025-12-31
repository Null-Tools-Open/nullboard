'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp, ArrowDown, ArrowUp } from 'lucide-react'
import { ColorPicker } from '../colorPicker'

export interface PenOptions {
    strokeColor: string
    fillColor: string | null
    strokeWidth: number
    opacity: number
}

interface PenOptionsPanelProps {
    options: PenOptions
    onOptionsChange: (options: PenOptions) => void
    onLayerChange?: (direction: 'up' | 'down' | 'top' | 'bottom') => void
    onClose?: () => void
}

const strokeColors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFA500', '#FFFFFF']
const fillColors = ['transparent', '#FFB6C1', '#90EE90', '#87CEEB', '#FFFFE0', '#FFFFFF']

export function PenOptionsPanel({ options, onOptionsChange, onLayerChange, onClose }: PenOptionsPanelProps) {
    const [localOptions, setLocalOptions] = useState<PenOptions>(options)

    const updateOption = <K extends keyof PenOptions>(key: K, value: PenOptions[K]) => {
        const newOptions = { ...localOptions, [key]: value }
        setLocalOptions(newOptions)
        onOptionsChange(newOptions)
    }

    return (
        <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl shadow-xl p-4 w-56">
            <div className="mb-4">
                <label className="text-xs text-gray-600 dark:text-zinc-400 mb-2 block">Stroke Color</label>
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
                    {[3, 5, 7].map((width) => (
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
                                className="bg-gray-600 dark:bg-zinc-400 rounded-full"
                                style={{ width: '60%', height: `${width + 1}px` }}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-4">
                <label className="text-xs text-gray-600 dark:text-zinc-400 mb-2 block">Opacity</label>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={localOptions.opacity}
                    onChange={(e) => updateOption('opacity', Number(e.target.value))}
                    className="w-full accent-blue-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0</span>
                    <span>100</span>
                </div>
            </div>

            {onLayerChange && (
                <div>
                    <label className="text-xs text-gray-600 dark:text-zinc-400 mb-2 block">Layers</label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onLayerChange('bottom')}
                            className="flex-1 h-10 rounded border-2 border-gray-300 dark:border-zinc-600 hover:border-gray-400 dark:hover:border-zinc-500 transition-all flex items-center justify-center"
                            title="To the bottom"
                        >
                            <ChevronDown className="w-5 h-5 text-gray-600 dark:text-zinc-400" />
                        </button>
                        <button
                            onClick={() => onLayerChange('down')}
                            className="flex-1 h-10 rounded border-2 border-gray-300 dark:border-zinc-600 hover:border-gray-400 dark:hover:border-zinc-500 transition-all flex items-center justify-center"
                            title="Down"
                        >
                            <ArrowDown className="w-5 h-5 text-gray-600 dark:text-zinc-400" />
                        </button>
                        <button
                            onClick={() => onLayerChange('up')}
                            className="flex-1 h-10 rounded border-2 border-gray-300 dark:border-zinc-600 hover:border-gray-400 dark:hover:border-zinc-500 transition-all flex items-center justify-center"
                            title="Up"
                        >
                            <ArrowUp className="w-5 h-5 text-gray-600 dark:text-zinc-400" />
                        </button>
                        <button
                            onClick={() => onLayerChange('top')}
                            className="flex-1 h-10 rounded border-2 border-gray-300 dark:border-zinc-600 hover:border-gray-400 dark:hover:border-zinc-500 transition-all flex items-center justify-center"
                            title="To the top"
                        >
                            <ChevronUp className="w-5 h-5 text-gray-600 dark:text-zinc-400" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}