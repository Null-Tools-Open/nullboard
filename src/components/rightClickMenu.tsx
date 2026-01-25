'use client'

import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ClipboardPaste, Maximize, Minimize, Trash2, CheckSquare, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Kbd, KbdGroup } from '@/components/ui/kbd'

interface RightClickMenuProps {
    x: number
    y: number
    onClose: () => void
    onPaste: () => void
    onSelectAll: () => void
    onZoomIn: () => void
    onZoomOut: () => void
    onExportImage: () => void
    onClearWorkspace: () => void
    canPaste?: boolean
}

export function RightClickMenu({
    x,
    y,
    onClose,
    onPaste,
    onSelectAll,
    onZoomIn,
    onZoomOut,
    onExportImage,
    onClearWorkspace,
    canPaste = true
}: RightClickMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose()
            }
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        window.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [onClose])

    const adjustedPosition = () => {

        if (typeof window === 'undefined') return { left: x, top: y }

        const width = 220
        const height = 250
        const padding = 10

        let left = x
        let top = y

        if (left + width > window.innerWidth - padding) {
            left = window.innerWidth - width - padding
        }

        if (top + height > window.innerHeight - padding) {
            top = window.innerHeight - height - padding
        }

        return { left, top }
    }

    const pos = adjustedPosition()

    return (
        <AnimatePresence>
            <motion.div
                ref={menuRef}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.1 }}
                className="fixed z-[100] w-56 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-gray-200 dark:border-zinc-700 overflow-hidden py-1"
                style={{ left: pos.left, top: pos.top }}
            >
                <MenuItem
                    icon={ClipboardPaste}
                    label="Paste"
                    shortcut="Ctrl+V"
                    onClick={onPaste}
                    disabled={!canPaste}
                />
                <MenuItem
                    icon={CheckSquare}
                    label="Select All"
                    shortcut="Ctrl+A"
                    onClick={onSelectAll}
                />

                <div className="my-1 border-t border-gray-100 dark:border-zinc-700/50" />

                <MenuItem
                    icon={Maximize}
                    label="Zoom In"
                    shortcut="Ctrl++"
                    onClick={onZoomIn}
                />
                <MenuItem
                    icon={Minimize}
                    label="Zoom Out"
                    shortcut="Ctrl+-"
                    onClick={onZoomOut}
                />
                <MenuItem
                    icon={Download}
                    label="Export Image"
                    shortcut="Ctrl+Shift+E"
                    onClick={onExportImage}
                />

                <div className="my-1 border-t border-gray-100 dark:border-zinc-700/50" />

                <MenuItem
                    icon={Trash2}
                    label="Clear Workspace"
                    onClick={onClearWorkspace}
                    className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                />
            </motion.div>
        </AnimatePresence>
    )
}

interface MenuItemProps {
    icon: React.ElementType
    label: string
    shortcut?: string
    onClick: () => void
    disabled?: boolean
    className?: string
}

function MenuItem({ icon: Icon, label, shortcut, onClick, disabled, className }: MenuItemProps) {
    return (
        <button
            onClick={(e) => {
                e.stopPropagation()
                if (!disabled) onClick()
            }}
            disabled={disabled}
            className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors",
                disabled
                    ? "opacity-50 cursor-not-allowed text-gray-400 dark:text-zinc-500"
                    : "hover:bg-gray-100 dark:hover:bg-zinc-700/50 text-gray-700 dark:text-zinc-200 cursor-pointer",
                className
            )}
        >
            <Icon size={16} className={cn(disabled ? "opacity-50" : "")} />
            <span className="flex-1">{label}</span>
            {shortcut && (
                <KbdGroup>
                    {shortcut.split('+').map((key, idx, arr) => (
                        <React.Fragment key={idx}>
                            <Kbd>{key.trim()}</Kbd>
                            {idx < arr.length - 1 && <span className="text-gray-400 mx-0.5">+</span>}
                        </React.Fragment>
                    ))}
                </KbdGroup>
            )}
        </button>
    )
}