import { PathElement } from '@/components/canvas/shared'
import { getStrokeOutline } from '../../pen/strokeUtils'

interface SvgPathProps {
    element: PathElement
}

export function SvgPath({ element }: SvgPathProps) {
    const { points, color, width, opacity } = element

    if (points.length === 0) return null

    const hasPressure = points.some(p => p.pressure !== undefined)

    if (hasPressure) {
        const outline = getStrokeOutline(points, { size: width / 2 })
        if (outline.length < 3) return null

        const pathData = `M ${outline[0].x},${outline[0].y} ${outline.slice(1).map(p => `L ${p.x},${p.y}`).join(' ')} Z`

        return (
            <path
                d={pathData}
                fill={color}
                stroke="none"
                opacity={opacity}
            />
        )
    }

    const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`

    return (
        <path
            d={pathData}
            stroke={color}
            strokeWidth={width}
            fill="none"
            opacity={opacity}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    )
}