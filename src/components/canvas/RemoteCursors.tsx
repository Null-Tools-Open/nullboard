import { RemoteCursor } from '@/hooks/useCollaboration'
import { useEffect, useState } from 'react'
import { Crown, AtSign, HatGlasses } from 'lucide-react'

interface RemoteCursorsProps {
    cursors: Map<string, RemoteCursor>
    transformRef: React.RefObject<any>
}

export function RemoteCursors({ cursors, transformRef }: RemoteCursorsProps) {
    const [screenCursors, setScreenCursors] = useState<Array<RemoteCursor & { screenX: number; screenY: number }>>([])

    useEffect(() => {
        const updateCursorPositions = () => {
            if (!transformRef.current) return

            const state = transformRef.current?.instance?.transformState || {
                positionX: 0,
                positionY: 0,
                scale: 1
            }

            const updated = Array.from(cursors.values()).map(cursor => ({
                ...cursor,
                screenX: cursor.x * state.scale + state.positionX,
                screenY: cursor.y * state.scale + state.positionY
            }))

            setScreenCursors(updated)
        }

        updateCursorPositions()

        const interval = setInterval(updateCursorPositions, 16)

        return () => clearInterval(interval)
    }, [cursors, transformRef])

    return (
        <div className="fixed inset-0 pointer-events-none z-[90]">
            {screenCursors.map((cursor) => (
                <div
                    key={cursor.clientId}
                    className="absolute transition-all duration-75 ease-out"
                    style={{
                        left: cursor.screenX,
                        top: cursor.screenY,
                        transform: 'translate(-2px, -2px)'
                    }}
                >
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
                    >
                        <path
                            d="M5.65376 12.3673L8.94989 18.9238C9.52635 20.0764 11.0635 20.4735 12.2161 19.8971C13.3687 19.3206 13.7658 17.7835 13.1893 16.6309L11.4699 13.4847L15.2311 14.5228C16.5341 14.8897 17.8813 14.1103 18.2482 12.8073C18.6151 11.5043 17.8357 10.1571 16.5327 9.79016L6.67608 7.0881C5.37308 6.72119 4.0259 7.50062 3.65899 8.80362C3.29208 10.1066 4.07151 11.4538 5.37451 11.8207L5.65376 12.3673Z"
                            fill={cursor.color}
                            stroke="white"
                            strokeWidth="1.5"
                        />
                    </svg>

                    <div
                        className="absolute top-6 left-2 flex items-center gap-2 px-4 py-2 rounded-full shadow-lg text-sm font-bold whitespace-nowrap pointer-events-none border border-white/20 backdrop-blur-md min-w-max"
                        style={{
                            backgroundColor: cursor.color + 'dd',
                            color: '#fff'
                        }}
                    >
                        <span className="flex items-center gap-1.5 px-0.5">
                            <span className="flex items-center gap-1">
                                {cursor.isHost ? (
                                    <Crown size={14} className="fill-yellow-400 text-yellow-600" strokeWidth={2.5} />
                                ) : cursor.isAnonymous ? (
                                    <HatGlasses size={14} strokeWidth={2.5} />
                                ) : (
                                    <AtSign size={14} strokeWidth={2.5} />
                                )}
                            </span>
                            {cursor.name}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    )
}