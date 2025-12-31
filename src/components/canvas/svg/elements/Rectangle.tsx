import { RectElement } from '@/components/canvas/shared'

interface SvgRectangleProps {
    element: RectElement
}

export function SvgRectangle({ element }: SvgRectangleProps) {
    const { x, y, width, height, strokeColor, fillColor, strokeWidth, strokeStyle, opacity } = element

    const strokeDasharray = strokeStyle === 'dashed'
        ? '10,5'
        : strokeStyle === 'dotted'
            ? '2,3'
            : undefined

    const isWavy = strokeStyle === 'wavy'
    const filterId = `wavy-filter-${element.id}`

    return (
        <g>
            {isWavy && (
                <defs>
                    <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse">
                        <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" result="noise" seed={42} />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" result="displaced" />
                        <feMorphology in="displaced" operator="dilate" radius="0.5" result="dilated" />
                        <feMorphology in="dilated" operator="erode" radius="0.5" />
                    </filter>
                </defs>
            )}
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                stroke={strokeColor}
                fill={fillColor || 'none'}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                opacity={opacity}
                strokeLinejoin="round"
                filter={isWavy ? `url(#${filterId})` : undefined}
            />
        </g>
    )
}