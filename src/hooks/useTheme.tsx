'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

interface UseThemeProps {
    theme: Theme
    setTheme: (theme: Theme) => void
    resolvedTheme: ResolvedTheme
    canvasColor: string
    setCanvasColor: (color: string) => void
}

const ThemeContext = createContext<UseThemeProps | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('system')
    const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light')
    const [canvasColorLight, setCanvasColorLight] = useState<string>('#ffffff')
    const [canvasColorDark, setCanvasColorDark] = useState<string>('#1a1a1a')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const savedTheme = localStorage.getItem('theme') as Theme | null
        if (savedTheme) {
            setThemeState(savedTheme)
        }
        const savedLight = localStorage.getItem('canvas-color-light')
        if (savedLight) setCanvasColorLight(savedLight)

        const savedDark = localStorage.getItem('canvas-color-dark')
        if (savedDark) setCanvasColorDark(savedDark)
    }, [])

    useEffect(() => {
        if (!mounted) return

        const root = window.document.documentElement
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

        let targetTheme: ResolvedTheme

        if (theme === 'system') {
            targetTheme = systemTheme
        } else {
            targetTheme = theme
        }

        setResolvedTheme(targetTheme)

        if (targetTheme === 'dark') {
            root.classList.add('dark')
        } else {
            root.classList.remove('dark')
        }

        localStorage.setItem('theme', theme)
    }, [theme, mounted])

    useEffect(() => {
        if (!mounted) return
        localStorage.setItem('canvas-color-light', canvasColorLight)
        localStorage.setItem('canvas-color-dark', canvasColorDark)
    }, [canvasColorLight, canvasColorDark, mounted])

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = () => {
            if (theme === 'system') {
                const newSystemTheme = mediaQuery.matches ? 'dark' : 'light'
                setResolvedTheme(newSystemTheme)
                if (newSystemTheme === 'dark') {
                    document.documentElement.classList.add('dark')
                } else {
                    document.documentElement.classList.remove('dark')
                }
            }
        }

        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [theme])

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme)
    }

    const setCanvasColor = (newColor: string) => {
        if (resolvedTheme === 'light') {
            setCanvasColorLight(newColor)
        } else {
            setCanvasColorDark(newColor)
        }
    }

    const canvasColor = resolvedTheme === 'light' ? canvasColorLight : canvasColorDark

    const value = {
        theme,
        setTheme,
        resolvedTheme,
        canvasColor,
        setCanvasColor
    }

    if (!mounted) {
        // can return children wrapped or null, keeping safe render
    }

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        return {
            theme: 'system' as Theme,
            setTheme: () => { },
            resolvedTheme: 'light' as ResolvedTheme,
            canvasColor: '#ffffff',
            setCanvasColor: () => { }
        }
    }
    return context
}