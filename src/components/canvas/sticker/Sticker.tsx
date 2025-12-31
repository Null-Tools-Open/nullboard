import React, { useRef, useMemo, CSSProperties, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface StickerProps {
    imageSrc: string;
    width?: number;
    rotation?: number;
    peelDirection?: number;
    shadowIntensity?: number;
    lightingIntensity?: number;
    className?: string;
    onPointerDown?: (e: React.PointerEvent) => void;
    cornerStyle?: 'sharp' | 'rounded';
    x?: number;
    y?: number;
}

interface CSSVars extends CSSProperties {
    '--sticker-rotate'?: string;
    '--sticker-p'?: string;
    '--sticker-peelback-hover'?: string;
    '--sticker-peelback-active'?: string;
    '--sticker-width'?: string;
    '--sticker-shadow-opacity'?: number;
    '--peel-direction'?: string;
    '--sticker-start'?: string;
    '--sticker-end'?: string;
}

export const Sticker: React.FC<StickerProps> = ({
    imageSrc,
    width = 200,
    rotation = 0,
    peelDirection = 0,
    shadowIntensity = 0.8,
    className = '',
    onPointerDown,
    cornerStyle = 'sharp',
    x = 0,
    y = 0
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const prevPos = useRef({ x, y });
    const tiltRef = useRef(0);
    const rafRef = useRef<number | null>(null);
    const { user } = useAuth();
    const animationsEnabled = !user?.animTurnedOff;

    const MAX_TILT = 15;
    const VELOCITY_FACTOR = 0.2;

    useEffect(() => {
        if (!animationsEnabled) {
            if (containerRef.current) containerRef.current.style.transform = `rotate(0deg)`;
            return;
        }

        const dx = x - prevPos.current.x;

        const targetTilt = Math.max(-MAX_TILT, Math.min(MAX_TILT, dx * VELOCITY_FACTOR));

        if (Math.abs(targetTilt) > 0.1) {
            tiltRef.current = targetTilt;
            if (containerRef.current) {
                containerRef.current.style.transform = `rotate(${targetTilt}deg)`;
            }
        }

        const decay = () => {
            tiltRef.current *= 0.85;

            if (Math.abs(tiltRef.current) < 0.1) {
                tiltRef.current = 0;
                if (containerRef.current) {
                    containerRef.current.style.transform = `rotate(0deg)`;
                }
                return;
            }

            if (containerRef.current) {
                containerRef.current.style.transform = `rotate(${tiltRef.current}deg)`;
            }
            rafRef.current = requestAnimationFrame(decay);
        };

        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(decay);

        prevPos.current = { x, y };

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [x, y, animationsEnabled]);

    const defaultPadding = 12;
    const peelBackHoverPct = 30;
    const peelBackActivePct = 40;

    const cssVars: CSSVars = useMemo(
        () => ({
            '--sticker-rotate': `${rotation}deg`,
            '--sticker-p': `${defaultPadding}px`,
            '--sticker-peelback-hover': `${peelBackHoverPct}%`,
            '--sticker-peelback-active': `${peelBackActivePct}%`,
            '--sticker-width': `${width}px`,
            '--sticker-shadow-opacity': shadowIntensity,
            '--peel-direction': `${peelDirection}deg`,
            '--sticker-start': `calc(-1 * ${defaultPadding}px)`,
            '--sticker-end': `calc(100% + ${defaultPadding}px)`
        }),
        [
            rotation,
            width,
            peelDirection,
            shadowIntensity,
            defaultPadding,
            peelBackHoverPct,
            peelBackActivePct
        ]
    );

    const stickerMainStyle: CSSProperties = {
        clipPath: `polygon(var(--sticker-start) var(--sticker-start), var(--sticker-end) var(--sticker-start), var(--sticker-end) var(--sticker-end), var(--sticker-start) var(--sticker-end))`,
        transition: animationsEnabled ? 'clip-path 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), border-radius 0.2s ease' : 'none',
        filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.5))',
        willChange: 'clip-path, transform',
        width: '100%',
        height: '100%'
    };

    const flapStyle: CSSProperties = {
        clipPath: `polygon(var(--sticker-start) var(--sticker-start), var(--sticker-end) var(--sticker-start), var(--sticker-end) var(--sticker-start), var(--sticker-start) var(--sticker-start))`,
        top: `calc(-100% - var(--sticker-p) - var(--sticker-p))`,
        transform: 'scaleY(-1)',
        transition: animationsEnabled ? 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
        willChange: 'clip-path, transform',
        width: '100%',
        height: '100%',
        filter: 'brightness(0.9) opacity(0.8)'
    };

    const imageStyle: CSSProperties = {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        pointerEvents: 'none',
        borderRadius: cornerStyle === 'rounded' ? '24px' : '0px'
    };


    return (
        <div
            className={`trigger-peel relative select-none ${className}`}
            ref={containerRef}
            style={{
                ...cssVars,
                width: '100%',
                height: '100%',
                touchAction: 'none',
                transformOrigin: 'center center'
            }}
            onPointerDown={onPointerDown}
        >
            {animationsEnabled && (
                <style>
                    {`
                .trigger-peel:hover .sticker-main {
                    clip-path: polygon(var(--sticker-start) var(--sticker-peelback-hover), var(--sticker-end) var(--sticker-peelback-hover), var(--sticker-end) var(--sticker-end), var(--sticker-start) var(--sticker-end)) !important;
                }
                .trigger-peel:hover .sticker-flap {
                    clip-path: polygon(var(--sticker-start) var(--sticker-start), var(--sticker-end) var(--sticker-start), var(--sticker-end) var(--sticker-peelback-hover), var(--sticker-start) var(--sticker-peelback-hover)) !important;
                    top: calc(-100% + 2 * var(--sticker-peelback-hover) - 1px) !important;
                }
                .trigger-peel:active .sticker-main {
                    clip-path: polygon(var(--sticker-start) var(--sticker-peelback-active), var(--sticker-end) var(--sticker-peelback-active), var(--sticker-end) var(--sticker-end), var(--sticker-start) var(--sticker-end)) !important;
                }
                .trigger-peel:active .sticker-flap {
                    clip-path: polygon(var(--sticker-start) var(--sticker-start), var(--sticker-end) var(--sticker-start), var(--sticker-end) var(--sticker-peelback-active), var(--sticker-start) var(--sticker-peelback-active)) !important;
                }
                `}
                </style>
            )}

            <div
                className="sticker-container relative w-full h-full"
                style={{
                    transformOrigin: 'center'
                }}
            >
                <div
                    className="sticker-main absolute inset-0"
                    style={stickerMainStyle}
                >
                    <div style={{ width: '100%', height: '100%' }}>
                        <img
                            src={imageSrc}
                            alt=""
                            className="block w-full h-full"
                            style={imageStyle}
                            draggable="false"
                            onContextMenu={e => e.preventDefault()}
                        />
                    </div>
                </div>

                <div className="sticker-flap absolute inset-0 pointer-events-none" style={flapStyle}>
                    <img
                        src={imageSrc}
                        alt=""
                        className="block w-full h-full"
                        style={imageStyle}
                        draggable="false"
                        onContextMenu={e => e.preventDefault()}
                    />
                </div>
            </div>
        </div>
    );
};