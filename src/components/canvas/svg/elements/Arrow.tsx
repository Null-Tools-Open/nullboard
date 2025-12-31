import { ArrowElement } from '@/components/canvas/shared'

interface SvgArrowProps {
    element: ArrowElement
}

function getArrowHeadPoints(
    tipX: number,
    tipY: number,
    angle: number,
    size: number
): string {
    const headAngle = Math.PI / 6

    const x1 = tipX - size * Math.cos(angle - headAngle)
    const y1 = tipY - size * Math.sin(angle - headAngle)
    const x2 = tipX - size * Math.cos(angle + headAngle)
    const y2 = tipY - size * Math.sin(angle + headAngle)

    return `${tipX},${tipY} ${x1},${y1} ${x2},${y2}`
}

export function SvgArrow({ element }: SvgArrowProps) {
    const { start, end, strokeColor, strokeWidth, strokeStyle, arrowStart, arrowEnd, arrowType, controlPoint, opacity } = element

    const strokeDasharray = strokeStyle === 'dashed'
        ? '10,5'
        : strokeStyle === 'dotted'
            ? '2,3'
            : undefined

    let cp = controlPoint
    if (arrowType === 'curved' && !cp) {
        const dx = end.x - start.x
        const dy = end.y - start.y
        const distance = Math.hypot(dx, dy)
        const offset = distance * 0.25
        const mx = (start.x + end.x) / 2
        const my = (start.y + end.y) / 2
        const px = -dy / (distance || 1)
        const py = dx / (distance || 1)
        cp = { x: mx + px * offset, y: my + py * offset }
    }

    let pathD = ''
    if (arrowType === 'curved' && cp) {
        pathD = `M ${start.x} ${start.y} Q ${cp.x} ${cp.y} ${end.x} ${end.y}`
    } else if (arrowType === 'elbowed') {
        const midX = (start.x + end.x) / 2
        pathD = `M ${start.x} ${start.y} L ${midX} ${start.y} L ${midX} ${end.y} L ${end.x} ${end.y}`
    } else {
        pathD = `M ${start.x} ${start.y} L ${end.x} ${end.y}`
    }

    const headSize = Math.max(strokeWidth * 4, 12)

    let endAngle = 0
    if (arrowType === 'curved' && cp) {
        endAngle = Math.atan2(end.y - cp.y, end.x - cp.x)
    } else if (arrowType === 'elbowed') {
        endAngle = end.x > start.x ? 0 : Math.PI
    } else {
        endAngle = Math.atan2(end.y - start.y, end.x - start.x)
    }

    let startAngle = 0
    if (arrowType === 'curved' && cp) {
        startAngle = Math.atan2(start.y - cp.y, start.x - cp.x)
    } else if (arrowType === 'elbowed') {
        startAngle = Math.PI
    } else {
        startAngle = Math.atan2(start.y - end.y, start.x - end.x)
    }

    return (
        <g opacity={opacity}>
            {/* Main line/path */}
            <path
                d={pathD}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* End arrowhead */}
            {arrowEnd && (
                <polygon
                    points={getArrowHeadPoints(end.x, end.y, endAngle, headSize)}
                    fill={strokeColor}
                />
            )}

            {/* Start arrowhead */}
            {arrowStart && (
                <polygon
                    points={getArrowHeadPoints(start.x, start.y, startAngle, headSize)}
                    fill={strokeColor}
                />
            )}
        </g>
    )
}