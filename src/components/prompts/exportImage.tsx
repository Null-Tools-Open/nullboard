'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CanvasElement } from '../canvas/shared'
import { cleanSvgNode } from '../canvas/utils/export'

export type ExportFormat = 'png' | 'svg' | 'jpeg' | 'webp'

interface ExportImagePromptProps {
    isOpen: boolean
    onClose: () => void
    onExport: (options: ExportOptions) => void
    elements: CanvasElement[]
    theme: 'light' | 'dark'
}

export interface ExportOptions {
    format: ExportFormat
    transparent: boolean
    scale: number
}

const formats: { id: ExportFormat; label: string; supportsTransparency: boolean }[] = [
    { id: 'png', label: 'PNG', supportsTransparency: true },
    { id: 'svg', label: 'SVG', supportsTransparency: true },
    { id: 'jpeg', label: 'JPEG', supportsTransparency: false },
    { id: 'webp', label: 'WebP', supportsTransparency: true },
]

const scales = [
    { value: 1, label: '1x' },
    { value: 2, label: '2x' },
    { value: 3, label: '3x' },
    { value: 4, label: '4x' },
]

function calculateBounds(elements: CanvasElement[]): { minX: number; minY: number; maxX: number; maxY: number } {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

    if (elements.length === 0) {
        return { minX: 0, minY: 0, maxX: 500, maxY: 500 }
    }

    elements.forEach(el => {
        if (el.type === 'path' && el.points.length > 0) {
            el.points.forEach(p => {
                minX = Math.min(minX, p.x)
                minY = Math.min(minY, p.y)
                maxX = Math.max(maxX, p.x)
                maxY = Math.max(maxY, p.y)
            })
        } else if (el.type === 'rect' || el.type === 'diamond' || el.type === 'image' || el.type === 'frame' || el.type === 'embed') {
            minX = Math.min(minX, el.x)
            minY = Math.min(minY, el.y)
            maxX = Math.max(maxX, el.x + el.width)
            maxY = Math.max(maxY, el.y + el.height)
        } else if (el.type === 'circle') {
            minX = Math.min(minX, el.x - el.radius)
            minY = Math.min(minY, el.y - el.radius)
            maxX = Math.max(maxX, el.x + el.radius)
            maxY = Math.max(maxY, el.y + el.radius)
        } else if (el.type === 'line' || el.type === 'arrow') {
            minX = Math.min(minX, el.start.x, el.end.x)
            minY = Math.min(minY, el.start.y, el.end.y)
            maxX = Math.max(maxX, el.start.x, el.end.x)
            maxY = Math.max(maxY, el.start.y, el.end.y)
        } else if (el.type === 'text') {
            const textWidth = el.width || el.text.length * el.fontSize * 0.6
            const textHeight = el.height || el.fontSize * 1.2
            minX = Math.min(minX, el.x)
            minY = Math.min(minY, el.y)
            maxX = Math.max(maxX, el.x + textWidth)
            maxY = Math.max(maxY, el.y + textHeight)
        }
    })

    return { minX, minY, maxX, maxY }
}

export function ExportImagePrompt({ isOpen, onClose, onExport, elements, theme }: ExportImagePromptProps) {
    const [format, setFormat] = useState<ExportFormat>('png')
    const [transparent, setTransparent] = useState(false)
    const [scale, setScale] = useState(2)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const previewRef = useRef<string | null>(null)

    const selectedFormat = formats.find(f => f.id === format)!
    const canBeTransparent = selectedFormat.supportsTransparency

    useEffect(() => {
        if (!isOpen) {
            if (previewRef.current) {
                URL.revokeObjectURL(previewRef.current)
                previewRef.current = null
            }
            setPreviewUrl(null)
            return
        }

        const generatePreview = () => {
            const svgElement = document.getElementById('canvas-svg')
            if (!svgElement || elements.length === 0) {
                setPreviewUrl(null)
                return
            }

            const { minX, minY, maxX, maxY } = calculateBounds(elements)
            const padding = 50
            const width = (maxX - minX) + padding * 2
            const height = (maxY - minY) + padding * 2

            const svgClone = svgElement.cloneNode(true) as SVGSVGElement
            svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
            svgClone.setAttribute('width', String(width))
            svgClone.setAttribute('height', String(height))
            svgClone.setAttribute('height', String(height))
            svgClone.setAttribute('viewBox', `${minX - padding} ${minY - padding} ${width} ${height}`)

            cleanSvgNode(svgClone)

            const defs = svgClone.querySelector('defs')
            if (defs) defs.remove()
            const gridRect = svgClone.querySelector('rect[fill="url(#grid)"]')
            if (gridRect) gridRect.remove()

            if (!transparent || !canBeTransparent) {
                const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
                bgRect.setAttribute('x', String(minX - padding))
                bgRect.setAttribute('y', String(minY - padding))
                bgRect.setAttribute('width', String(width))
                bgRect.setAttribute('height', String(height))
                bgRect.setAttribute('fill', theme === 'dark' ? '#1a1a1a' : '#ffffff')
                svgClone.insertBefore(bgRect, svgClone.firstChild)
            }

            const serializer = new XMLSerializer()
            const svgString = serializer.serializeToString(svgClone)
            const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })

            if (previewRef.current) {
                URL.revokeObjectURL(previewRef.current)
            }
            const url = URL.createObjectURL(svgBlob)
            previewRef.current = url
            setPreviewUrl(url)
        }

        generatePreview()
    }, [isOpen, transparent, canBeTransparent, elements, theme])

    const handleExport = () => {
        onExport({ format, transparent: canBeTransparent && transparent, scale })
        onClose()
    }

    const bounds = calculateBounds(elements)
    const exportWidth = Math.round((bounds.maxX - bounds.minX + 100) * scale)
    const exportHeight = Math.round((bounds.maxY - bounds.minY + 100) * scale)

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-[100]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] bg-white dark:bg-zinc-800 rounded-xl shadow-2xl border border-gray-200 dark:border-zinc-700 p-6 w-[480px]"
                    >
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 mb-1">Export Image</h3>
                            <p className="text-sm text-gray-600 dark:text-zinc-400">
                                {elements.length} element{elements.length !== 1 ? 's' : ''} • {exportWidth} × {exportHeight}px
                            </p>
                        </div>

                        <div className={cn(
                            "mb-4 rounded-lg border overflow-hidden h-40 flex items-center justify-center",
                            transparent && canBeTransparent
                                ? "bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZTVlNWU1Ii8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNlNWU1ZTUiLz48L3N2Zz4=')] border-gray-200 dark:border-zinc-700"
                                : "bg-gray-100 dark:bg-zinc-900 border-gray-200 dark:border-zinc-700"
                        )}>
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt="Export preview"
                                    className="max-w-full max-h-full object-contain"
                                />
                            ) : (
                                <span className="text-sm text-gray-400 dark:text-zinc-500">No elements to export</span>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="text-xs font-medium text-gray-500 dark:text-zinc-500 mb-2 block uppercase tracking-wide">Format</label>
                            <div className="flex gap-2">
                                {formats.map((f) => (
                                    <button
                                        key={f.id}
                                        onClick={() => setFormat(f.id)}
                                        className={cn(
                                            "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                                            format === f.id
                                                ? "bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                                                : "bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-600"
                                        )}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="text-xs font-medium text-gray-500 dark:text-zinc-500 mb-2 block uppercase tracking-wide">Scale</label>
                            <div className="flex gap-2">
                                {scales.map((s) => (
                                    <button
                                        key={s.value}
                                        onClick={() => setScale(s.value)}
                                        className={cn(
                                            "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                                            scale === s.value
                                                ? "bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                                                : "bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-600"
                                        )}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-6">
                            <button
                                onClick={() => canBeTransparent && setTransparent(!transparent)}
                                disabled={!canBeTransparent}
                                className={cn(
                                    "w-full flex items-center justify-between p-3 rounded-lg transition-colors",
                                    !canBeTransparent
                                        ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-zinc-900"
                                        : "bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600 cursor-pointer"
                                )}
                            >
                                <div className="text-left">
                                    <span className="text-sm font-medium text-gray-700 dark:text-zinc-300 block">Transparent background</span>
                                    {!canBeTransparent && (
                                        <span className="text-xs text-gray-400 dark:text-zinc-500">Not supported for {selectedFormat.label}</span>
                                    )}
                                </div>
                                <div className={cn(
                                    "w-10 h-6 rounded-full transition-colors relative",
                                    transparent && canBeTransparent ? "bg-blue-500" : "bg-gray-300 dark:bg-zinc-600"
                                )}>
                                    <div className={cn(
                                        "absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform",
                                        transparent && canBeTransparent ? "translate-x-5" : "translate-x-1"
                                    )} />
                                </div>
                            </button>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-700 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleExport}
                                disabled={elements.length === 0}
                                className={cn(
                                    "px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors cursor-pointer flex items-center gap-2",
                                    elements.length === 0
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-700"
                                )}
                            >
                                <Download size={16} />
                                Export {selectedFormat.label}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}