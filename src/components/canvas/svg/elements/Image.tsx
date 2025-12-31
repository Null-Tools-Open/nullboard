import { ImageElement } from '@/components/canvas/shared'
import { useEffect, useState } from 'react'
import { getAsset } from '@/lib/assetStore'

interface SvgImageProps {
    element: ImageElement
}

export function SvgImage({ element }: SvgImageProps) {
    const { x, y, width, height, src, opacity, cornerStyle } = element
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
                    console.error('Failed to load asset', e)
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
        <g>
            {cornerStyle === 'rounded' && (
                <defs>
                    <clipPath id={`clip-${element.id}`}>
                        <rect x={x} y={y} width={width} height={height} rx="36" ry="36" />
                    </clipPath>
                </defs>
            )}
            <image
                x={x}
                y={y}
                width={width}
                height={height}
                href={resolvedSrc}
                opacity={opacity}
                clipPath={cornerStyle === 'rounded' ? `url(#clip-${element.id})` : undefined}
                preserveAspectRatio="none"
            />
        </g>
    )
}