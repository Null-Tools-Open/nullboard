import { TextElement } from '@/components/canvas/shared'

interface SvgTextProps {
    element: TextElement
}

export function SvgText({ element }: SvgTextProps) {
    const { x, y, text, color, fontSize, fontFamily, fontWeight, fontStyle, textAlign, opacity, width } = element

    let actualFontFamily = fontFamily
    if (fontStyle === 'hand-drawn') {
        actualFontFamily = 'Caveat, "Shadows Into Light", "Indie Flower", cursive'
    } else if (fontStyle === 'code') {
        actualFontFamily = 'Courier New, monospace'
    } else if (fontStyle === 'n-dot') {
        actualFontFamily = 'Nothing, sans-serif'
    }

    const textAnchor = textAlign === 'center' ? 'middle' : textAlign === 'right' ? 'end' : 'start'

    let textX = x
    if (width && width > 0) {
        if (textAlign === 'center') {
            textX = x + width / 2
        } else if (textAlign === 'right') {
            textX = x + width
        }
    }

    return (
        <text
            x={textX}
            y={y + fontSize}
            fill={color}
            fontSize={fontSize}
            fontFamily={actualFontFamily}
            fontWeight={fontWeight}
            textAnchor={textAnchor}
            opacity={opacity}
            style={{ userSelect: 'none' }}
        >
            {text.split('\n').map((line, i) => (
                <tspan key={i} x={textX} dy={i === 0 ? 0 : fontSize * 1.2}>
                    {line || '\u00A0'}
                </tspan>
            ))}
        </text>
    )
}