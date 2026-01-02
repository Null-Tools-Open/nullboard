import { StickyNoteElement } from '@/components/canvas/shared'

interface SvgStickyNoteProps {
    element: StickyNoteElement
    isEditing?: boolean
}

export function SvgStickyNote(props: SvgStickyNoteProps) {
    const { element } = props
    const { x, y, width, height, color, opacity, text, foldCorner = 'topRight' } = element
    const cornerRadius = 4
    const foldSize = Math.min(width, height) * 0.15

    const getFoldPath = () => {
        if (foldCorner === 'none') {
            return {
                body: `
                    M ${x + cornerRadius} ${y}
                    L ${x + width - cornerRadius} ${y}
                    Q ${x + width} ${y} ${x + width} ${y + cornerRadius}
                    L ${x + width} ${y + height - cornerRadius}
                    Q ${x + width} ${y + height} ${x + width - cornerRadius} ${y + height}
                    L ${x + cornerRadius} ${y + height}
                    Q ${x} ${y + height} ${x} ${y + height - cornerRadius}
                    L ${x} ${y + cornerRadius}
                    Q ${x} ${y} ${x + cornerRadius} ${y}
                    Z
                `,
                fold: null,
                shadow: null
            }
        }

        if (foldCorner === 'topRight') {
            return {
                body: `
                    M ${x + cornerRadius} ${y}
                    L ${x + width - foldSize} ${y}
                    L ${x + width} ${y + foldSize}
                    L ${x + width} ${y + height - cornerRadius}
                    Q ${x + width} ${y + height} ${x + width - cornerRadius} ${y + height}
                    L ${x + cornerRadius} ${y + height}
                    Q ${x} ${y + height} ${x} ${y + height - cornerRadius}
                    L ${x} ${y + cornerRadius}
                    Q ${x} ${y} ${x + cornerRadius} ${y}
                    Z
                `,
                fold: `
                    M ${x + width - foldSize} ${y}
                    L ${x + width - foldSize} ${y + foldSize}
                    L ${x + width} ${y + foldSize}
                    Z
                `,
                shadow: `
                    M ${x + width - foldSize} ${y}
                    Q ${x + width - foldSize * 0.5} ${y + foldSize * 0.5} ${x + width} ${y + foldSize}
                    L ${x + width - foldSize} ${y + foldSize}
                    Z
                `
            }
        }

        if (foldCorner === 'topLeft') {
            return {
                body: `
                    M ${x + foldSize} ${y}
                    L ${x + width - cornerRadius} ${y}
                    Q ${x + width} ${y} ${x + width} ${y + cornerRadius}
                    L ${x + width} ${y + height - cornerRadius}
                    Q ${x + width} ${y + height} ${x + width - cornerRadius} ${y + height}
                    L ${x + cornerRadius} ${y + height}
                    Q ${x} ${y + height} ${x} ${y + height - cornerRadius}
                    L ${x} ${y + foldSize}
                    L ${x + foldSize} ${y}
                    Z
                `,
                fold: `
                    M ${x + foldSize} ${y}
                    L ${x} ${y + foldSize}
                    L ${x + foldSize} ${y + foldSize}
                    Z
                `,
                shadow: `
                    M ${x + foldSize} ${y}
                    Q ${x + foldSize * 0.5} ${y + foldSize * 0.5} ${x} ${y + foldSize}
                    L ${x + foldSize} ${y + foldSize}
                    Z
                `
            }
        }

        if (foldCorner === 'bottomRight') {
            return {
                body: `
                    M ${x + cornerRadius} ${y}
                    L ${x + width - cornerRadius} ${y}
                    Q ${x + width} ${y} ${x + width} ${y + cornerRadius}
                    L ${x + width} ${y + height - foldSize}
                    L ${x + width - foldSize} ${y + height}
                    L ${x + cornerRadius} ${y + height}
                    Q ${x} ${y + height} ${x} ${y + height - cornerRadius}
                    L ${x} ${y + cornerRadius}
                    Q ${x} ${y} ${x + cornerRadius} ${y}
                    Z
                `,
                fold: `
                    M ${x + width} ${y + height - foldSize}
                    L ${x + width - foldSize} ${y + height - foldSize}
                    L ${x + width - foldSize} ${y + height}
                    Z
                `,
                shadow: `
                    M ${x + width} ${y + height - foldSize}
                    Q ${x + width - foldSize * 0.5} ${y + height - foldSize * 0.5} ${x + width - foldSize} ${y + height}
                    L ${x + width - foldSize} ${y + height - foldSize}
                    Z
                `
            }
        }

        return {
            body: `
                M ${x + cornerRadius} ${y}
                L ${x + width - cornerRadius} ${y}
                Q ${x + width} ${y} ${x + width} ${y + cornerRadius}
                L ${x + width} ${y + height - cornerRadius}
                Q ${x + width} ${y + height} ${x + width - cornerRadius} ${y + height}
                L ${x + foldSize} ${y + height}
                L ${x} ${y + height - foldSize}
                L ${x} ${y + cornerRadius}
                Q ${x} ${y} ${x + cornerRadius} ${y}
                Z
            `,
            fold: `
                M ${x} ${y + height - foldSize}
                L ${x + foldSize} ${y + height - foldSize}
                L ${x + foldSize} ${y + height}
                Z
            `,
            shadow: `
                M ${x} ${y + height - foldSize}
                Q ${x + foldSize * 0.5} ${y + height - foldSize * 0.5} ${x + foldSize} ${y + height}
                L ${x + foldSize} ${y + height - foldSize}
                Z
            `
        }
    }

    const paths = getFoldPath()
    const fillColor = color || '#fef08a'
    const isDark = fillColor === '#000000' || fillColor === '#1e1e1e'

    return (
        <g opacity={opacity}>
            <defs>
                <filter id={`stickyNoteShadow-${element.id}`} x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="1" dy="1" stdDeviation="2" floodOpacity="0.15" />
                </filter>
                <linearGradient id={`foldGradient-${element.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(0,0,0,0.2)" />
                    <stop offset="100%" stopColor="rgba(0,0,0,0.05)" />
                </linearGradient>
            </defs>

            <path
                d={paths.body}
                fill={fillColor}
                stroke={isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"}
                strokeWidth="1"
                filter={`url(#stickyNoteShadow-${element.id})`}
            />

            {paths.shadow && (
                <path
                    d={paths.shadow}
                    fill={`url(#foldGradient-${element.id})`}
                />
            )}

            {paths.fold && (
                <path
                    d={paths.fold}
                    fill="rgba(0,0,0,0.1)"
                />
            )}

            {paths.fold && (
                <path
                    d={paths.fold}
                    fill="rgba(255,255,255,0.2)"
                    style={{ mixBlendMode: 'normal' }}
                />
            )}

            {text && !props.isEditing && (
                <foreignObject
                    x={x + 12}
                    y={y + 12}
                    width={width - 24}
                    height={height - 24 - (foldCorner === 'bottomLeft' || foldCorner === 'bottomRight' ? foldSize : 0)}
                    style={{ pointerEvents: 'none' }}
                >
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <div
                            style={{
                                width: '100%',
                                maxHeight: '100%',
                                color: isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.8)",
                                fontSize: `${element.fontSize || 24}px`,
                                fontFamily: '"Caveat", "Shadows Into Light", "Indie Flower", cursive',
                                lineHeight: 1.2,
                                wordWrap: 'break-word',
                                overflow: 'hidden',
                                whiteSpace: 'pre-wrap',
                                textAlign: 'center',
                            }}
                        >
                            {text}
                        </div>
                    </div>
                </foreignObject>
            )}
        </g>
    )
}