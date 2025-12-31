import { LineElement } from '@/components/canvas/shared'

interface SvgLineProps {
    element: LineElement
}

export function SvgLine({ element }: SvgLineProps) {
    const { start, end, strokeColor, strokeWidth, strokeStyle, opacity } = element

    const strokeDasharray = strokeStyle === 'dashed'
        ? '10,5'
        : strokeStyle === 'dotted'
            ? '2,3'
            : undefined

    return (
        <line
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            opacity={opacity}
            strokeLinecap="round"
        />
    )
}