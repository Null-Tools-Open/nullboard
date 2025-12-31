'use client'

import React, { ReactNode } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'

interface SvgCanvasProps {
    children: ReactNode
    selectedTool: string
    isMiddleButtonDown: boolean
    transformRef: React.MutableRefObject<any>
    isZoomingRef: React.MutableRefObject<boolean>
    scaleChangeTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>
    needsRedrawRef: React.MutableRefObject<boolean>
    theme: 'light' | 'dark'
}

export function SvgCanvas({
    children,
    selectedTool,
    isMiddleButtonDown,
    transformRef,
    isZoomingRef,
    scaleChangeTimeoutRef,
    needsRedrawRef,
    theme
}: SvgCanvasProps) {
    return (
        <TransformWrapper
            ref={transformRef}
            initialScale={1}
            minScale={0.1}
            maxScale={5}
            panning={{ disabled: selectedTool !== 'pan' && !isMiddleButtonDown }}
            wheel={{ step: 0.1 }}
            doubleClick={{ disabled: true }}
            limitToBounds={false}
            centerOnInit={false}
            alignmentAnimation={{ disabled: true }}
            onTransformed={() => {
                isZoomingRef.current = true

                if (scaleChangeTimeoutRef.current) {
                    clearTimeout(scaleChangeTimeoutRef.current)
                }

                scaleChangeTimeoutRef.current = setTimeout(() => {
                    isZoomingRef.current = false
                    needsRedrawRef.current = true
                }, 200)
            }}
        >
            <TransformComponent wrapperClass="w-full h-full" contentClass="w-full h-full">
                <svg
                    width="5000"
                    height="5000"
                    viewBox="0 0 5000 5000"
                    style={{
                        background: theme === 'light' ? '#ffffff' : '#1a1a1a'
                    }}
                >
                    {children}
                </svg>
            </TransformComponent>
        </TransformWrapper>
    )
}