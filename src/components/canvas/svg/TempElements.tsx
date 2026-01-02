import { Point } from '@/components/canvas/shared'
import { getStrokeOutline } from '../pen/strokeUtils'

interface TempElementsProps {
    tempPath?: Point[]
    tempLassoPath?: Point[]
    tempRect?: { start: Point; end: Point } | null
    tempDiamond?: { start: Point; end: Point } | null
    tempCircle?: { center: Point; radius: number } | null
    tempLine?: { start: Point; end: Point } | null
    tempArrow?: { start: Point; end: Point } | null
    tempFrame?: { start: Point; end: Point } | null
    tempEmbed?: { start: Point; end: Point } | null
    tempSticker?: { start: Point; end: Point } | null
    tempStickyNote?: { start: Point; end: Point } | null
    tempTextRect?: { start: Point; end: Point } | null
    selectionBox?: { start: Point; end: Point } | null
    strokeColor?: string
    strokeWidth?: number
    fillColor?: string | null
    strokeStyle?: 'solid' | 'dashed' | 'dotted' | 'wavy'
    arrowType?: 'straight' | 'curved' | 'elbowed'
}

export function TempElements({
    tempPath,
    tempLassoPath,
    tempRect,
    tempDiamond,
    tempCircle,
    tempLine,
    tempArrow,
    tempFrame,
    tempEmbed,
    tempSticker,
    tempStickyNote,
    tempTextRect,
    selectionBox,
    strokeColor = '#000000',
    strokeWidth = 2,
    fillColor = null,
    strokeStyle = 'solid',
    arrowType = 'straight'
}: TempElementsProps) {

    const getStrokeDasharray = () => {
        switch (strokeStyle) {
            case 'dashed': return '10,5'
            case 'dotted': return '2,4'
            default: return undefined
        }
    }
    const strokeDasharray = getStrokeDasharray()
    const isWavy = strokeStyle === 'wavy'

    return (
        <g>
            <defs>
                <marker
                    id="temp-arrow-marker"
                    viewBox="0 0 10 10"
                    refX="10"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto"
                >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill={strokeColor} />
                </marker>
                {/* Wavy filter for temp elements */}
                <filter id="temp-wavy-filter" x="-20%" y="-20%" width="140%" height="140%" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse">
                    <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" result="noise" seed={42} />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" result="displaced" />
                    <feMorphology in="displaced" operator="dilate" radius="0.5" result="dilated" />
                    <feMorphology in="dilated" operator="erode" radius="0.5" />
                </filter>
            </defs>

            {/* Temp path (pen tool) */}
            {tempPath && tempPath.length > 0 && (() => {
                const hasPressure = tempPath.some(p => p.pressure !== undefined)
                if (hasPressure) {
                    const outline = getStrokeOutline(tempPath, { size: strokeWidth / 2 })
                    if (outline.length < 3) return null
                    return (
                        <path
                            d={`M ${outline.map(p => `${p.x},${p.y}`).join(' L ')} Z`}
                            fill={strokeColor}
                            stroke="none"
                        />
                    )
                }
                return (
                    <path
                        d={`M ${tempPath.map(p => `${p.x},${p.y}`).join(' L ')}`}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                )
            })()}

            {/* Temp lasso path */}
            {tempLassoPath && tempLassoPath.length > 0 && (
                <path
                    d={tempLassoPath.length >= 3
                        ? `M ${tempLassoPath.map(p => `${p.x},${p.y}`).join(' L ')} Z`
                        : `M ${tempLassoPath.map(p => `${p.x},${p.y}`).join(' L ')}`
                    }
                    stroke="#3b82f6"
                    strokeWidth="1.5"
                    fill={tempLassoPath.length >= 3 ? "rgba(59, 130, 246, 0.1)" : "none"}
                    strokeDasharray="5,5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-stroke"
                />
            )}

            {/* Temp rectangle */}
            {tempRect && (
                <rect
                    x={Math.min(tempRect.start.x, tempRect.end.x)}
                    y={Math.min(tempRect.start.y, tempRect.end.y)}
                    width={Math.abs(tempRect.end.x - tempRect.start.x)}
                    height={Math.abs(tempRect.end.y - tempRect.start.y)}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    fill={fillColor || 'none'}
                    filter={isWavy ? 'url(#temp-wavy-filter)' : undefined}
                />
            )}

            {/* Temp diamond */}
            {tempDiamond && (() => {
                const x = Math.min(tempDiamond.start.x, tempDiamond.end.x)
                const y = Math.min(tempDiamond.start.y, tempDiamond.end.y)
                const width = Math.abs(tempDiamond.end.x - tempDiamond.start.x)
                const height = Math.abs(tempDiamond.end.y - tempDiamond.start.y)
                const points = `
          ${x + width / 2},${y}
          ${x + width},${y + height / 2}
          ${x + width / 2},${y + height}
          ${x},${y + height / 2}
        `.trim().replace(/\s+/g, ' ')

                return (
                    <polygon
                        points={points}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        strokeDasharray={strokeDasharray}
                        fill={fillColor || 'none'}
                        filter={isWavy ? 'url(#temp-wavy-filter)' : undefined}
                    />
                )
            })()}

            {/* Temp circle */}
            {tempCircle && (
                <circle
                    cx={tempCircle.center.x}
                    cy={tempCircle.center.y}
                    r={tempCircle.radius}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    fill={fillColor || 'none'}
                    filter={isWavy ? 'url(#temp-wavy-filter)' : undefined}
                />
            )}

            {/* Temp line */}
            {tempLine && (
                <line
                    x1={tempLine.start.x}
                    y1={tempLine.start.y}
                    x2={tempLine.end.x}
                    y2={tempLine.end.y}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeLinecap="round"
                />
            )}

            {/* Temp arrow */}
            {tempArrow && (() => {
                const dx = tempArrow.end.x - tempArrow.start.x
                const dy = tempArrow.end.y - tempArrow.start.y
                const distance = Math.hypot(dx, dy)

                let pathD = ''
                let cp = null

                if (arrowType === 'curved') {
                    const offset = distance * 0.25
                    const mx = (tempArrow.start.x + tempArrow.end.x) / 2
                    const my = (tempArrow.start.y + tempArrow.end.y) / 2
                    const px = -dy / (distance || 1)
                    const py = dx / (distance || 1)
                    cp = { x: mx + px * offset, y: my + py * offset }
                    pathD = `M ${tempArrow.start.x} ${tempArrow.start.y} Q ${cp.x} ${cp.y} ${tempArrow.end.x} ${tempArrow.end.y}`
                } else if (arrowType === 'elbowed') {
                    const midX = (tempArrow.start.x + tempArrow.end.x) / 2
                    pathD = `M ${tempArrow.start.x} ${tempArrow.start.y} L ${midX} ${tempArrow.start.y} L ${midX} ${tempArrow.end.y} L ${tempArrow.end.x} ${tempArrow.end.y}`
                } else {
                    pathD = `M ${tempArrow.start.x} ${tempArrow.start.y} L ${tempArrow.end.x} ${tempArrow.end.y}`
                }

                let endAngle = 0
                if (arrowType === 'curved' && cp) {
                    endAngle = Math.atan2(tempArrow.end.y - cp.y, tempArrow.end.x - cp.x)
                } else if (arrowType === 'elbowed') {
                    endAngle = tempArrow.end.x > tempArrow.start.x ? 0 : Math.PI
                } else {
                    endAngle = Math.atan2(dy, dx)
                }

                const headSize = Math.max(strokeWidth * 4, 12)
                const headAngle = Math.PI / 6
                const x1 = tempArrow.end.x - headSize * Math.cos(endAngle - headAngle)
                const y1 = tempArrow.end.y - headSize * Math.sin(endAngle - headAngle)
                const x2 = tempArrow.end.x - headSize * Math.cos(endAngle + headAngle)
                const y2 = tempArrow.end.y - headSize * Math.sin(endAngle + headAngle)

                return (
                    <g>
                        <path
                            d={pathD}
                            stroke={strokeColor}
                            strokeWidth={strokeWidth}
                            strokeDasharray={strokeDasharray}
                            strokeLinecap="round"
                            fill="none"
                        />
                        <polygon
                            points={`${tempArrow.end.x},${tempArrow.end.y} ${x1},${y1} ${x2},${y2}`}
                            fill={strokeColor}
                        />
                    </g>
                )
            })()}

            {/* Frame Box */}
            {tempFrame && (
                <g>
                    <text
                        x={Math.min(tempFrame.start.x, tempFrame.end.x)}
                        y={Math.min(tempFrame.start.y, tempFrame.end.y) - 8}
                        fill="#3b82f6"
                        fontSize="12"
                        fontFamily="Inter, sans-serif"
                        fontWeight="500"
                    >
                        Frame
                    </text>
                    <rect
                        x={Math.min(tempFrame.start.x, tempFrame.end.x)}
                        y={Math.min(tempFrame.start.y, tempFrame.end.y)}
                        width={Math.abs(tempFrame.end.x - tempFrame.start.x)}
                        height={Math.abs(tempFrame.end.y - tempFrame.start.y)}
                        stroke="#3b82f6"
                        strokeWidth="2"
                        strokeDasharray="8,4"
                        fill="rgba(59, 130, 246, 0.05)"
                        rx="8"
                    />
                </g>
            )}

            {/* Embed Box */}
            {tempEmbed && (
                <g>
                    <rect
                        x={Math.min(tempEmbed.start.x, tempEmbed.end.x)}
                        y={Math.min(tempEmbed.start.y, tempEmbed.end.y)}
                        width={Math.abs(tempEmbed.end.x - tempEmbed.start.x)}
                        height={Math.abs(tempEmbed.end.y - tempEmbed.start.y)}
                        stroke="#6366f1"
                        strokeWidth="2"
                        strokeDasharray="8,4"
                        fill="rgba(99, 102, 241, 0.05)"
                        rx="8"
                    />
                </g>
            )}


            {/* Sticker Box */}
            {tempSticker && (
                <g>
                    <rect
                        x={Math.min(tempSticker.start.x, tempSticker.end.x)}
                        y={Math.min(tempSticker.start.y, tempSticker.end.y)}
                        width={Math.abs(tempSticker.end.x - tempSticker.start.x)}
                        height={Math.abs(tempSticker.end.y - tempSticker.start.y)}
                        stroke="#10b981"
                        strokeWidth="2"
                        strokeDasharray="8,4"
                        fill="rgba(16, 185, 129, 0.05)"
                        rx="8"
                    />
                    <text
                        x={Math.min(tempSticker.start.x, tempSticker.end.x)}
                        y={Math.min(tempSticker.start.y, tempSticker.end.y) - 8}
                        fill="#10b981"
                        fontSize="12"
                        fontFamily="Inter, sans-serif"
                        fontWeight="500"
                    >
                        Sticker
                    </text>
                </g>
            )}

            {/* Sticky Note Box */}
            {tempStickyNote && (() => {
                const size = Math.max(
                    Math.abs(tempStickyNote.end.x - tempStickyNote.start.x),
                    Math.abs(tempStickyNote.end.y - tempStickyNote.start.y)
                )
                const x = tempStickyNote.end.x >= tempStickyNote.start.x
                    ? tempStickyNote.start.x
                    : tempStickyNote.start.x - size
                const y = tempStickyNote.end.y >= tempStickyNote.start.y
                    ? tempStickyNote.start.y
                    : tempStickyNote.start.y - size
                return (
                    <g>
                        <rect
                            x={x}
                            y={y}
                            width={size}
                            height={size}
                            stroke="#eab308"
                            strokeWidth="2"
                            strokeDasharray="8,4"
                            fill="rgba(234, 179, 8, 0.2)"
                            rx="4"
                        />
                    </g>
                )
            })()}

            {/* Text Box */}
            {tempTextRect && (
                <rect
                    x={Math.min(tempTextRect.start.x, tempTextRect.end.x)}
                    y={Math.min(tempTextRect.start.y, tempTextRect.end.y)}
                    width={Math.abs(tempTextRect.end.x - tempTextRect.start.x)}
                    height={Math.abs(tempTextRect.end.y - tempTextRect.start.y)}
                    stroke="#3b82f6"
                    strokeWidth="2"
                    strokeDasharray="8,4"
                    fill="rgba(59, 130, 246, 0.05)"
                    rx="4"
                />
            )}

            {/* Selection box */}
            {selectionBox && (
                <rect
                    x={Math.min(selectionBox.start.x, selectionBox.end.x)}
                    y={Math.min(selectionBox.start.y, selectionBox.end.y)}
                    width={Math.abs(selectionBox.end.x - selectionBox.start.x)}
                    height={Math.abs(selectionBox.end.y - selectionBox.start.y)}
                    stroke="#4A90E2"
                    strokeWidth="1"
                    strokeDasharray="5,5"
                    fill="rgba(74, 144, 226, 0.1)"
                    className="animate-stroke"
                />
            )}

            {/* Arrow marker */}
            <defs>
                <marker
                    id="temp-arrow-marker"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                    markerUnits="strokeWidth"
                >
                    <path d="M0,0 L0,6 L9,3 z" fill={strokeColor} />
                </marker>
            </defs>
        </g>
    )
}