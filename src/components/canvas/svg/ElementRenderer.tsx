import { CanvasElement } from '@/components/canvas/shared'
import {
    SvgLine,
    SvgRectangle,
    SvgCircle,
    SvgDiamond,
    SvgArrow,
    SvgText,
    SvgPath,
    SvgImage,
    SvgFrame,
    SvgEmbed,
    SvgSticker,
    SvgStickyNote
} from './elements'

interface ElementRendererProps {
    elements: CanvasElement[]
    editingTextId?: string | null
    markedForErasureIds?: Set<string>
}

export function ElementRenderer({ elements, editingTextId, markedForErasureIds }: ElementRendererProps) {
    return (
        <>
            {elements.map((element) => {
                if (element.type === 'text' && element.id === editingTextId) {
                    return null
                }

                const isMarkedForErasure = markedForErasureIds?.has(element.id) ?? false
                const wrapperStyle = isMarkedForErasure ? {
                    filter: 'grayscale(1)',
                    opacity: 0.4
                } : undefined

                const renderElement = () => {
                    switch (element.type) {
                        case 'line':
                            return <SvgLine key={element.id} element={element} />
                        case 'rect':
                            return <SvgRectangle key={element.id} element={element} />
                        case 'circle':
                            return <SvgCircle key={element.id} element={element} />
                        case 'diamond':
                            return <SvgDiamond key={element.id} element={element} />
                        case 'arrow':
                            return <SvgArrow key={element.id} element={element} />
                        case 'text':
                            return <SvgText key={element.id} element={element} />
                        case 'path':
                            return <SvgPath key={element.id} element={element} />
                        case 'image':
                            return <SvgImage key={element.id} element={element} />
                        case 'frame':
                            return <SvgFrame key={element.id} element={element} />
                        case 'embed':
                            return <SvgEmbed key={element.id} element={element} />
                        case 'sticker':
                            return <SvgSticker key={element.id} element={element} />
                        case 'stickyNote':
                            return <SvgStickyNote key={element.id} element={element} isEditing={element.id === editingTextId} />
                        default:
                            return null
                    }
                }

                if (isMarkedForErasure) {
                    return (
                        <g key={element.id} style={wrapperStyle}>
                            {renderElement()}
                        </g>
                    )
                }

                return renderElement()
            })}
        </>
    )
}