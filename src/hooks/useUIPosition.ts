import { useState, useEffect } from 'react'

export type ToolbarPosition = 'top' | 'bottom' | 'left' | 'right'
export type MenuPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

export interface UIPositions {
    toolbar: ToolbarPosition
    menu: MenuPosition
    zoom: MenuPosition
}

const DEFAULT_POSITIONS: UIPositions = {
    toolbar: 'bottom',
    menu: 'top-left',
    zoom: 'bottom-left'
}

export function useUIPosition() {
    const [positions, setPositions] = useState<UIPositions>(DEFAULT_POSITIONS)
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        try {
            const saved = localStorage.getItem('uiElementsPos')
            if (saved) {
                setPositions(JSON.parse(saved))
            }
        } catch (e) {
        } finally {
            setIsLoaded(true)
        }
    }, [])

    const updatePositions = (newPositions: Partial<UIPositions>) => {
        setPositions(prev => {
            const next = { ...prev, ...newPositions }
            localStorage.setItem('uiElementsPos', JSON.stringify(next))
            return next
        })
    }

    return {
        positions,
        updatePositions,
        isLoaded
    }
}