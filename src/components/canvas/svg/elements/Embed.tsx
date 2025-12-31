import { EmbedElement } from '@/components/canvas/shared'

interface SvgEmbedProps {
    element: EmbedElement
}

export function SvgEmbed({ element }: SvgEmbedProps) {
    const { x, y, width, height, opacity, url } = element
    const cornerRadius = 8

    const getEmbedUrl = (inputUrl: string): string => {
        try {
            const urlObj = new URL(inputUrl)

            if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
                let videoId = ''
                if (urlObj.hostname.includes('youtu.be')) {
                    videoId = urlObj.pathname.slice(1)
                } else {
                    videoId = urlObj.searchParams.get('v') || ''
                }
                if (videoId) {
                    return `https://www.youtube.com/embed/${videoId}`
                }
            }

            if (urlObj.hostname.includes('vimeo.com')) {
                const videoId = urlObj.pathname.split('/').pop()
                if (videoId) {
                    return `https://player.vimeo.com/video/${videoId}`
                }
            }

            return inputUrl
        } catch {
            return inputUrl
        }
    }

    const embedUrl = url ? getEmbedUrl(url) : null
    const hasContent = embedUrl && embedUrl.trim().length > 0

    return (
        <g opacity={opacity}>
            {/* Border */}
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                stroke="#6366f1"
                strokeWidth="2"
                fill="#f8fafc"
                rx={cornerRadius}
                ry={cornerRadius}
            />
            {hasContent ? (
                /* Iframe container */
                <foreignObject
                    x={x + 2}
                    y={y + 2}
                    width={width - 4}
                    height={height - 4}
                    style={{ pointerEvents: 'auto' }}
                >
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            overflow: 'hidden',
                            borderRadius: `${cornerRadius - 2}px`,
                            pointerEvents: 'auto',
                        }}
                    >
                        <iframe
                            src={embedUrl}
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 'none',
                                borderRadius: `${cornerRadius - 2}px`,
                                pointerEvents: 'auto',
                            }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                </foreignObject>
            ) : null}
        </g>
    )
}