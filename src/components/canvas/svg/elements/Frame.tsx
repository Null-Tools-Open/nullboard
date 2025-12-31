import { useState, useEffect } from 'react'
import { FrameElement } from '@/components/canvas/shared'

interface SvgFrameProps {
    element: FrameElement
}

export function SvgFrame({ element }: SvgFrameProps) {
    const { x, y, width, height, opacity, name } = element
    const cornerRadius = 22
    const frameName = name || 'Frame'
    const textX = x + 8
    const textY = y - 4
    const textWidth = frameName.length * 7
    const textHeight = 14

    const [isDark, setIsDark] = useState(() => 
        typeof window !== 'undefined' && 
        document.documentElement.classList.contains('dark')
    )

    useEffect(() => {
        const checkTheme = () => {
            setIsDark(document.documentElement.classList.contains('dark'))
        }

        checkTheme()

        const observer = new MutationObserver(checkTheme)
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        })

        return () => observer.disconnect()
    }, [])

    const bgColor = isDark ? '#1a1a1a' : '#FFFFFF'
    const textColor = isDark ? '#FFFFFF' : '#000000'

    return (
        <g opacity={opacity}>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                stroke="#3b82f6"
                strokeWidth="2"
                fill="none"
                rx={cornerRadius}
                ry={cornerRadius}
            />
            <rect
                x={textX - 2}
                y={textY - textHeight - 2}
                width={textWidth + 4}
                height={textHeight + 2}
                fill={bgColor}
            />
            <text
                x={textX}
                y={textY}
                fill={textColor}
                fontSize="12"
                fontFamily="sans-serif"
                dominantBaseline="text-after-edge"
            >
                {frameName}
            </text>
        </g>
    )
}