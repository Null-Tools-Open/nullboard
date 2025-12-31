import { CircleElement } from '@/components/canvas/shared'

interface SvgCircleProps {
    element: CircleElement
}

export function SvgCircle({ element }: SvgCircleProps) {
    const { x, y, radius, strokeColor, fillColor, strokeWidth, strokeStyle, opacity } = element

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
                    <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
                        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise" seed={42} />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" />
                        <feMorphology in="displaced" operator="dilate" radius="0.5" result="dilated" />
                        <feMorphology in="dilated" operator="erode" radius="0.5" />
                    </filter>
                </defs>
            )}
            <circle
                cx={x}
                cy={y}
                r={radius}
                stroke={strokeColor}
                fill={fillColor || 'none'}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                opacity={opacity}
                filter={isWavy ? `url(#${filterId})` : undefined}
            />
        </g>
    )
}