import { useRef, useEffect, useState, forwardRef } from 'react'
import type { StickyNoteElement } from './shared'

interface StickyNoteEditorProps {
    element: StickyNoteElement
    onChange: (text: string, fontSize: number) => void
    onBlur: () => void
}

export const StickyNoteEditor = forwardRef<HTMLTextAreaElement, StickyNoteEditorProps>(
    ({ element, onChange, onBlur }, ref) => {
        const internalRef = useRef<HTMLTextAreaElement>(null)
        const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef

        const [value, setValue] = useState(element.text || '')
        const [fontSize, setFontSize] = useState(element.fontSize || 24)

        const padding = 12
        const foldSize = Math.min(element.width, element.height) * 0.15
        const width = element.width - padding * 2
        const bottomFold = element.foldCorner === 'bottomLeft' || element.foldCorner === 'bottomRight'
        const height = element.height - padding * 2 - (bottomFold ? foldSize : 0)

        useEffect(() => {
            const maxFontSize = 60
            const minFontSize = 16
            const textLength = value.length
            let newSize = maxFontSize

            if (textLength > 10) {
                newSize = Math.max(minFontSize, maxFontSize - (textLength - 10) * 0.8)
            }

            const el = textareaRef.current
            if (el) {
                el.style.fontSize = `${newSize}px`
                if (el.scrollHeight > el.clientHeight) {
                    newSize = Math.max(minFontSize, newSize * 0.9)
                }
            }

            if (newSize !== fontSize) {
                setFontSize(newSize)
            }
        }, [value, fontSize, textareaRef])

        const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const newValue = e.target.value
            setValue(newValue)
            onChange(newValue, fontSize)
        }

        const handleKeyDown = (e: React.KeyboardEvent) => {
            if (e.key === 'Escape') {
                onBlur()
            }
            e.stopPropagation()
        }

        const isDark = element.color === '#000000' || element.color === '#1e1e1e'

        return (
            <div
                style={{
                    position: 'absolute',
                    left: `${element.x + padding}px`,
                    top: `${element.y + padding}px`,
                    width: `${width}px`,
                    height: `${height}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    pointerEvents: 'none',
                }}
            >
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={handleChange}
                    onBlur={onBlur}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    style={{
                        width: '100%',
                        maxHeight: '100%',
                        border: 'none',
                        outline: 'none',
                        padding: '0',
                        margin: '0',
                        fontSize: `${fontSize}px`,
                        fontFamily: '"Caveat", "Shadows Into Light", "Indie Flower", cursive',
                        lineHeight: '1.2',
                        color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)',
                        background: 'transparent',
                        pointerEvents: 'auto',
                        resize: 'none',
                        overflow: 'hidden',
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                        textAlign: 'center',
                        boxSizing: 'border-box',
                    }}
                />
            </div>
        )
    }
)

StickyNoteEditor.displayName = 'StickyNoteEditor'