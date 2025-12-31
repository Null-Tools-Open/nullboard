interface GridProps {
    canvasColor: string
    transformState: { positionX: number; positionY: number; scale: number } | null
    containerWidth?: number
    containerHeight?: number
}

function isLightColor(color: string) {
    if (!color || typeof color !== 'string') return true

    let hex = color.replace('#', '')

    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('')
    }

    if (hex.length !== 6) return true

    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000
    return brightness > 155
}

export function Grid({ canvasColor, transformState, containerWidth, containerHeight }: GridProps) {
    const gridStep = transformState && transformState.scale > 1.65 ? 200 : 100
    const isLight = isLightColor(canvasColor)

    const gridColor = isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'

    return (
        <>
            <defs>
                <pattern
                    id="grid"
                    width={gridStep}
                    height={gridStep}
                    patternUnits="userSpaceOnUse"
                >
                    <rect width={gridStep} height={gridStep} fill="none" />
                    <path
                        d={`M ${gridStep} 0 L 0 0 0 ${gridStep}`}
                        fill="none"
                        stroke={gridColor}
                        strokeWidth="1"
                    />
                </pattern>
            </defs>
            <rect x="-50000" y="-50000" width="100000" height="100000" fill="url(#grid)" />
        </>
    )
}