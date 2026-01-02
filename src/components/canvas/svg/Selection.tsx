import { CanvasElement, ArrowElement, LineElement } from '@/components/canvas/shared'

interface SelectionProps {
    elements: CanvasElement[]
    selectedIds: string[]
}

export function Selection({ elements, selectedIds }: SelectionProps) {
    if (selectedIds.length === 0) return null

    const selectedElements = elements.filter(el => selectedIds.includes(el.id))

    return (
        <g>
            {selectedElements.map(element => {

                if (element.type === 'line' || element.type === 'arrow') {
                    const lineElement = element as LineElement | ArrowElement
                    const handleSize = 10

                    let controlPoint = null
                    let selectionPath = ''
                    let middlePoint = null

                    if (element.type === 'arrow') {
                        const arrow = element as ArrowElement
                        if (arrow.arrowType === 'curved') {
                            const dx = arrow.end.x - arrow.start.x
                            const dy = arrow.end.y - arrow.start.y
                            const distance = Math.hypot(dx, dy)
                            const offset = distance * 0.25
                            const mx = (arrow.start.x + arrow.end.x) / 2
                            const my = (arrow.start.y + arrow.end.y) / 2
                            const px = -dy / (distance || 1)
                            const py = dx / (distance || 1)
                            controlPoint = arrow.controlPoint || {
                                x: mx + px * offset,
                                y: my + py * offset
                            }
                            selectionPath = `M ${arrow.start.x} ${arrow.start.y} Q ${controlPoint.x} ${controlPoint.y} ${arrow.end.x} ${arrow.end.y}`
                        } else if (arrow.arrowType === 'elbowed') {
                            const midX = (arrow.start.x + arrow.end.x) / 2
                            middlePoint = { x: midX, y: arrow.start.y }
                            selectionPath = `M ${arrow.start.x} ${arrow.start.y} L ${midX} ${arrow.start.y} L ${midX} ${arrow.end.y} L ${arrow.end.x} ${arrow.end.y}`
                        } else {
                            selectionPath = `M ${arrow.start.x} ${arrow.start.y} L ${arrow.end.x} ${arrow.end.y}`
                        }
                    } else {
                        selectionPath = `M ${lineElement.start.x} ${lineElement.start.y} L ${lineElement.end.x} ${lineElement.end.y}`
                    }

                    return (
                        <g key={element.id}>
                            <path
                                d={selectionPath}
                                stroke="#4A90E2"
                                strokeWidth="1"
                                strokeDasharray="5,5"
                                fill="none"
                                pointerEvents="none"
                                opacity="0.5"
                            />

                            <circle
                                cx={lineElement.start.x}
                                cy={lineElement.start.y}
                                r={handleSize / 2}
                                fill="white"
                                stroke="#4A90E2"
                                strokeWidth="2"
                                style={{ cursor: 'move' }}
                            />

                            {/* End point handle */}
                            <circle
                                cx={lineElement.end.x}
                                cy={lineElement.end.y}
                                r={handleSize / 2}
                                fill="white"
                                stroke="#4A90E2"
                                strokeWidth="2"
                                style={{ cursor: 'move' }}
                            />

                            {controlPoint && (
                                <>
                                    <line
                                        x1={lineElement.start.x}
                                        y1={lineElement.start.y}
                                        x2={controlPoint.x}
                                        y2={controlPoint.y}
                                        stroke="#4A90E2"
                                        strokeWidth="1"
                                        strokeDasharray="3,3"
                                        opacity="0.5"
                                        pointerEvents="none"
                                    />
                                    <line
                                        x1={lineElement.end.x}
                                        y1={lineElement.end.y}
                                        x2={controlPoint.x}
                                        y2={controlPoint.y}
                                        stroke="#4A90E2"
                                        strokeWidth="1"
                                        strokeDasharray="3,3"
                                        opacity="0.5"
                                        pointerEvents="none"
                                    />
                                    <circle
                                        cx={controlPoint.x}
                                        cy={controlPoint.y}
                                        r={handleSize / 2}
                                        fill="#4A90E2"
                                        stroke="white"
                                        strokeWidth="2"
                                        style={{ cursor: 'move' }}
                                    />
                                </>
                            )}
                        </g>
                    )
                }

                let x = 0, y = 0, width = 0, height = 0

                if (element.type === 'diamond') {
                    const centerX = element.x + element.width / 2
                    const centerY = element.y + element.height / 2
                    const handleSize = 8
                    const handles = [
                        { x: centerX, y: element.y, id: 't' },
                        { x: element.x + element.width, y: centerY, id: 'r' },
                        { x: centerX, y: element.y + element.height, id: 'b' },
                        { x: element.x, y: centerY, id: 'l' },
                    ]

                    return (
                        <g key={element.id}>
                            {/* Diamond outline */}
                            <polygon
                                points={`${centerX},${element.y} ${element.x + element.width},${centerY} ${centerX},${element.y + element.height} ${element.x},${centerY}`}
                                fill="none"
                                stroke="#4A90E2"
                                strokeWidth="2"
                                strokeDasharray="5,5"
                                pointerEvents="none"
                            />
                            {/* Handles on diamond vertices */}
                            {handles.map(handle => (
                                <rect
                                    key={handle.id}
                                    x={handle.x - handleSize / 2}
                                    y={handle.y - handleSize / 2}
                                    width={handleSize}
                                    height={handleSize}
                                    fill="white"
                                    stroke="#4A90E2"
                                    strokeWidth="2"
                                    style={{ cursor: handle.id === 't' || handle.id === 'b' ? 'ns-resize' : 'ew-resize' }}
                                />
                            ))}
                        </g>
                    )
                }

                if (element.type === 'circle') {
                    const handleSize = 8
                    const handleX = element.x + element.radius
                    const handleY = element.y

                    return (
                        <g key={element.id}>
                            {/* Circle outline */}
                            <circle
                                cx={element.x}
                                cy={element.y}
                                r={element.radius}
                                fill="none"
                                stroke="#4A90E2"
                                strokeWidth="2"
                                strokeDasharray="5,5"
                                pointerEvents="none"
                            />
                            {/* Single handle on right for radius resize */}
                            <circle
                                cx={handleX}
                                cy={handleY}
                                r={handleSize / 2}
                                fill="white"
                                stroke="#4A90E2"
                                strokeWidth="2"
                                style={{ cursor: 'ew-resize' }}
                            />
                        </g>
                    )
                }

                switch (element.type) {
                    case 'rect':
                        x = element.x
                        y = element.y
                        width = element.width
                        height = element.height
                        break
                    case 'text': {
                        x = element.x
                        y = element.y
                        const lines = element.text.split('\n')
                        const lineHeight = element.fontSize * 1.2
                        width = element.width && element.width > 0 ? element.width : Math.max(...lines.map(l => l.length), 1) * element.fontSize * 0.6
                        height = element.height && element.height > 0 ? element.height : lines.length * lineHeight
                        break
                    }
                    case 'path':
                        if (element.bounds) {
                            x = element.bounds.minX
                            y = element.bounds.minY
                            width = element.bounds.maxX - element.bounds.minX
                            height = element.bounds.maxY - element.bounds.minY
                        } else if (element.points.length > 0) {
                            const xs = element.points.map(p => p.x)
                            const ys = element.points.map(p => p.y)
                            x = Math.min(...xs)
                            y = Math.min(...ys)
                            width = Math.max(...xs) - x
                            height = Math.max(...ys) - y
                        } else {
                            return null
                        }
                        break
                    case 'image':
                    case 'frame':
                    case 'embed':
                    case 'sticker':
                    case 'stickyNote':
                        x = element.x
                        y = element.y
                        width = element.width
                        height = element.height
                        break
                    default:
                        return null
                }

                const padding = 5

                return (
                    <g key={element.id}>
                        <rect
                            x={x - padding}
                            y={y - padding}
                            width={width + padding * 2}
                            height={height + padding * 2}
                            fill="none"
                            stroke="#4A90E2"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                            pointerEvents="none"
                        />

                        {['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'].map(handle => {
                            let hx = 0, hy = 0
                            const handleSize = 8

                            switch (handle) {
                                case 'nw':
                                    hx = x - padding
                                    hy = y - padding
                                    break
                                case 'ne':
                                    hx = x + width + padding
                                    hy = y - padding
                                    break
                                case 'sw':
                                    hx = x - padding
                                    hy = y + height + padding
                                    break
                                case 'se':
                                    hx = x + width + padding
                                    hy = y + height + padding
                                    break
                                case 'n':
                                    hx = x + width / 2
                                    hy = y - padding
                                    break
                                case 's':
                                    hx = x + width / 2
                                    hy = y + height + padding
                                    break
                                case 'e':
                                    hx = x + width + padding
                                    hy = y + height / 2
                                    break
                                case 'w':
                                    hx = x - padding
                                    hy = y + height / 2
                                    break
                            }

                            return (
                                <rect
                                    key={handle}
                                    x={hx - handleSize / 2}
                                    y={hy - handleSize / 2}
                                    width={handleSize}
                                    height={handleSize}
                                    fill="white"
                                    stroke="#4A90E2"
                                    strokeWidth="2"
                                    style={{ cursor: `${handle}-resize` }}
                                />
                            )
                        })}
                    </g>
                )
            })}
        </g>
    )
}