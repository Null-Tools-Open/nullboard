import { StickerElement } from '@/components/canvas/shared'
import { Sticker } from '../../sticker/Sticker'
import { useEffect, useState } from 'react'
import { getAsset } from '@/lib/assetStore'

interface SvgStickerProps {
    element: StickerElement
}

export function SvgSticker({ element }: SvgStickerProps) {
    const { x, y, width, height, opacity, src, cornerStyle } = element
    const [resolvedSrc, setResolvedSrc] = useState<string>(src)

    useEffect(() => {
        let active = true
        let objectUrl: string | null = null

        const loadAsset = async () => {
            if (src.startsWith('assetId:')) {
                try {
                    const blob = await getAsset(src)
                    if (active && blob) {
                        objectUrl = URL.createObjectURL(blob)
                        setResolvedSrc(objectUrl)
                    }
                } catch (e) {
                    console.error('Failed to load sticker asset', e)
                }
            } else {
                setResolvedSrc(src)
            }
        }

        loadAsset()

        return () => {
            active = false
            if (objectUrl) URL.revokeObjectURL(objectUrl)
        }
    }, [src])

    return (
        <g opacity={opacity}>
            <foreignObject
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    transformOrigin: `${x + width / 2}px ${y + height / 2}px`,
                    pointerEvents: 'none'
                }}
            >
                <div style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}>
                    <Sticker
                        imageSrc={resolvedSrc}
                        width={width}
                        rotation={0}
                        x={x}
                        y={y}
                        cornerStyle={cornerStyle}
                    />
                </div>
            </foreignObject>
        </g>
    )
}