'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface HoverPreviewProps {
    color: string | null
}

export function HoverPreview({ color }: HoverPreviewProps) {
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        if (!color) {
            setIsVisible(false)
            return
        }

        const handleMouseMove = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY })
            if (!isVisible) setIsVisible(true)
        }

        window.addEventListener('mousemove', handleMouseMove)

        // Initial position if possible (though effect runs after render)
        setIsVisible(true)

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
        }
    }, [color, isVisible])

    if (!color || !isVisible) return null

    // Use a portal to ensure it's always on top and not constrained by parent overflow
    return createPortal(
        <div
            className="fixed z-[9999] pointer-events-none"
            style={{
                left: `${position.x + 16}px`,
                top: `${position.y + 16}px`,
            }}
        >
            <div
                className="w-8 h-8 rounded-lg border border-white/20 shadow-xl"
                style={{
                    backgroundColor: color === 'transparent' ? 'transparent' : color,
                    backgroundImage: color === 'transparent'
                        ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)'
                        : 'none',
                    backgroundSize: '8px 8px',
                    backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px'
                }}
            />
        </div>,
        document.body
    )
}
