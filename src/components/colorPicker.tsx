'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Pencil } from 'lucide-react'

interface ColorPickerProps {
  value: string | null
  onChange: (color: string | null) => void
  allowTransparent?: boolean
  position?: 'left' | 'right'
}

const colorPalette = [
  { color: 'transparent', letter: 'q' },
  { color: '#FFFFFF', letter: 'w' },
  { color: '#808080', letter: 'e' },
  { color: '#000000', letter: 'r' },
  { color: '#8B4513', letter: 't' },
  { color: '#D2B48C', letter: 'y' },
  { color: '#008080', letter: 'a' },
  { color: '#0000FF', letter: 's' },
  { color: '#800080', letter: 'd' },
  { color: '#FF00FF', letter: 'f' },
  { color: '#FF0000', letter: 'g' },
  { color: '#8B0000', letter: 'h' },
  { color: '#006400', letter: 'z' },
  { color: '#00FF00', letter: 'x' },
  { color: '#FFA500', letter: 'c' },
  { color: '#FF4500', letter: 'v' },
  { color: '#DC143C', letter: 'b' },
  { color: '#8B0000', letter: 'n' },
]

export function ColorPicker({ value, onChange, allowTransparent = false, position = 'left' }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const getInitialHexValue = () => {
    if (value && value !== 'transparent' && value !== null) {
      return value.startsWith('#') ? value : '#' + value
    }
    return '#000000'
  }
  const [hexValue, setHexValue] = useState(getInitialHexValue())
  const [isEditingHex, setIsEditingHex] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [mostUsedColors] = useState<string[]>(['#FFFFFF'])

  useEffect(() => {
    if (!isEditingHex) {
      if (value && value !== 'transparent' && value !== null) {
        const hex = value.startsWith('#') ? value : '#' + value
        setHexValue(hex)
      } else if (value === null || value === 'transparent') {
        setHexValue('#000000')
      } else if (value) {
        const hex = value.startsWith('#') ? value : '#' + value
        setHexValue(hex)
      }
    }
  }, [value, isEditingHex])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setIsEditingHex(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleColorSelect = (color: string | null) => {
    onChange(color)
    if (color && color !== 'transparent') {
      const hex = color.startsWith('#') ? color : '#' + color
      setHexValue(hex)
    } else if (color === null || color === 'transparent') {
      setHexValue('#000000')
    }
  }

  const handleHexChange = (newHex: string) => {
    setHexValue(newHex)
    if (/^#[0-9A-F]{6}$/i.test(newHex)) {
      onChange(newHex)
    }
  }

  const hexToRgb = (hex: string): [number, number, number] | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
      ]
      : null
  }

  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }).join('')
  }

  const adjustBrightness = (hex: string, percent: number): string => {
    const rgb = hexToRgb(hex)
    if (!rgb) return hex

    const [r, g, b] = rgb

    let newR: number, newG: number, newB: number

    if (percent < 0) {
      const factor = 1 + (percent / 100)
      newR = Math.max(0, Math.round(r * factor))
      newG = Math.max(0, Math.round(g * factor))
      newB = Math.max(0, Math.round(b * factor))
    } else {
      const factor = percent / 100
      newR = Math.min(255, Math.round(r + (255 - r) * factor))
      newG = Math.min(255, Math.round(g + (255 - g) * factor))
      newB = Math.min(255, Math.round(b + (255 - b) * factor))
    }

    return rgbToHex(newR, newG, newB)
  }

  const getShades = (baseColor: string): string[] => {
    if (!baseColor || baseColor === 'transparent' || !/^#[0-9A-F]{6}$/i.test(baseColor)) {
      return []
    }

    const rgb = hexToRgb(baseColor)
    if (!rgb) return []

    const [r, g, b] = rgb
    const brightness = (r + g + b) / 3

    if (brightness > 240 || brightness < 15) {
      return []
    }

    const shade1 = adjustBrightness(baseColor, -40) // Darkmax
    const shade2 = adjustBrightness(baseColor, -20) // Darkm
    const shade3 = baseColor // Base
    const shade4 = adjustBrightness(baseColor, 20)  // Lightm
    const shade5 = adjustBrightness(baseColor, 40)  // Lighmax

    const uniqueShades = [shade1, shade2, shade3, shade4, shade5].filter((shade, index, self) =>
      self.indexOf(shade) === index
    )

    return uniqueShades
  }

  const currentColor = value || '#000000'

  const findBaseColorForShades = (color: string): string => {
    if (!color || color === 'transparent' || !/^#[0-9A-F]{6}$/i.test(color)) {
      return color
    }

    const paletteColor = colorPalette.find(c => c.color === color)
    if (paletteColor) {
      return color
    }

    return color
  }

  const [shadeBaseColor, setShadeBaseColor] = useState<string | null>(null)

  useEffect(() => {
    const paletteColor = colorPalette.find(c => c.color === currentColor)
    if (paletteColor && paletteColor.color !== 'transparent') {
      setShadeBaseColor(paletteColor.color)
    } else if (currentColor && currentColor !== 'transparent' && /^#[0-9A-F]{6}$/i.test(currentColor)) {
      setShadeBaseColor(prevBase => {
        if (prevBase) {
          const baseShades = getShades(prevBase)
          if (baseShades.includes(currentColor)) {
            return prevBase
          }
        }
        return currentColor
      })
    } else {
      setShadeBaseColor(null)
    }
  }, [currentColor])

  const shades = shadeBaseColor ? getShades(shadeBaseColor) : []
  const hasShades = shades.length > 0

  const getDisplayHex = () => {
    if (value === 'transparent' || value === null) {
      return ''
    }

    if (hexValue && hexValue !== '#' && hexValue.length > 1) {
      return hexValue.replace('#', '').toUpperCase()
    }

    const fallback = value || '#000000'
    const hex = fallback.startsWith('#') ? fallback : '#' + fallback
    return hex.replace('#', '').toUpperCase()
  }

  const displayHexValue = useMemo(() => {
    return getDisplayHex()
  }, [hexValue, value])

  return (
    <div className="relative" ref={pickerRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-8 h-8 rounded border-2 transition-all',
          'border-gray-300 hover:border-gray-400'
        )}
        style={
          currentColor === 'transparent'
            ? {
              backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
              backgroundSize: '8px 8px',
              backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px'
            }
            : { backgroundColor: currentColor }
        }
      />

      {isOpen && (
        <div
          className={cn(
            'absolute z-50 rounded-lg shadow-2xl bg-white dark:bg-zinc-800',
            position === 'left' ? 'left-full top-0 ml-8' : 'right-full top-0 mr-8'
          )}
          style={{ width: '200px' }}
        >
          <div
            className="bg-white dark:bg-zinc-800 p-4 rounded-lg relative"
          >
            <div
              className="absolute left-0 pointer-events-none w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-white dark:border-r-zinc-800"
              style={{
                transform: 'translateX(-100%)',
                top: '16px',
                zIndex: 1
              }}
            />
            <div className="mb-3">
              <h4 className="text-[11px] text-gray-500 dark:text-zinc-400 mb-2 font-normal">Most frequently used colors</h4>
              <div className="flex gap-1.5">
                {mostUsedColors.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => handleColorSelect(color)}
                    className={cn(
                      'w-7 h-7 rounded border transition-all flex items-center justify-center text-[10px] font-medium',
                      currentColor === color
                        ? 'border-blue-500 border-2'
                        : 'border-gray-300 hover:border-gray-400 dark:border-zinc-600 dark:hover:border-zinc-500'
                    )}
                    style={{ backgroundColor: color, color: color === '#FFFFFF' ? '#666666' : '#FFFFFF' }}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <h4 className="text-[11px] text-gray-500 dark:text-zinc-400 mb-2 font-normal">Colors</h4>
              <div className="grid grid-cols-6 gap-1">
                {colorPalette.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleColorSelect(item.color === 'transparent' ? null : item.color)}
                    className={cn(
                      'w-7 h-7 rounded border transition-all flex items-center justify-center text-[10px] font-medium',
                      (currentColor === item.color || (currentColor === null && item.color === 'transparent'))
                        ? 'border-blue-500 border-2'
                        : 'border-gray-300 hover:border-gray-400 dark:border-zinc-600 dark:hover:border-zinc-500'
                    )}
                    style={
                      item.color === 'transparent'
                        ? {
                          backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                          backgroundSize: '8px 8px',
                          backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px'
                        }
                        : { backgroundColor: item.color }
                    }
                  >
                    <span
                      className={cn(
                        'text-[10px] lowercase font-medium',
                        item.color === '#FFFFFF' || item.color === 'transparent'
                          ? 'text-gray-600'
                          : 'text-white'
                      )}
                      style={{
                        textShadow: item.color === '#FFFFFF' || item.color === 'transparent' ? 'none' : '0 0 2px rgba(0,0,0,0.5)'
                      }}
                    >
                      {item.letter}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <h4 className="text-[11px] text-gray-500 dark:text-zinc-400 mb-2 font-normal">Shades</h4>
              {hasShades ? (
                <div className="flex gap-1">
                  {shades.map((shade) => (
                    <button
                      key={shade}
                      onClick={() => handleColorSelect(shade)}
                      className={cn(
                        'w-7 h-7 rounded border transition-all',
                        currentColor === shade
                          ? 'border-blue-500 border-2'
                          : 'border-gray-300 hover:border-gray-400 dark:border-zinc-600 dark:hover:border-zinc-500'
                      )}
                      style={{ backgroundColor: shade }}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-gray-400 dark:text-zinc-500">No shades available for this color</p>
              )}
            </div>

            <div>
              <h4 className="text-[11px] text-gray-500 dark:text-zinc-400 mb-2 font-normal">HEX Code</h4>
              <div className="relative">
                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-600 dark:text-zinc-400 text-[11px] pointer-events-none">
                  #
                </div>
                <input
                  type="text"
                  value={displayHexValue || ''}
                  onChange={(e) => {
                    setIsEditingHex(true)
                    let inputValue = e.target.value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase()
                    if (inputValue.length > 6) {
                      inputValue = inputValue.slice(0, 6)
                    }
                    const newHex = inputValue.length > 0 ? '#' + inputValue : '#'
                    setHexValue(newHex)
                    if (inputValue.length === 6 && /^[0-9A-F]{6}$/i.test(inputValue)) {
                      onChange(newHex)
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' || e.key === 'Delete') {
                      e.stopPropagation()
                    }
                    if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault()
                      e.currentTarget.select()
                      e.stopPropagation()
                    }
                    if ((e.key === 'c' || e.key === 'v' || e.key === 'x') && (e.ctrlKey || e.metaKey)) {
                      e.stopPropagation()
                    }
                  }}
                  onBlur={() => {
                    setIsEditingHex(false)
                    if (hexValue && /^#[0-9A-F]{6}$/i.test(hexValue)) {
                      onChange(hexValue)
                    } else if (hexValue && hexValue.length > 1) {
                      const cleanHex = hexValue.replace('#', '').padEnd(6, '0')
                      const finalHex = '#' + cleanHex
                      setHexValue(finalHex)
                      onChange(finalHex)
                    }
                  }}
                  onFocus={() => {
                    setIsEditingHex(true)
                  }}
                  className="w-full pl-6 pr-8 py-1.5 text-[11px] border border-gray-300 dark:border-zinc-600 rounded focus:outline-none focus:border-gray-400 dark:focus:border-zinc-500 text-gray-900 dark:text-zinc-100 bg-white dark:bg-zinc-700"
                  placeholder="000000"
                />
                <div className="absolute right-8 top-1/2 -translate-y-1/2 w-px h-4 bg-gray-300 dark:bg-zinc-600 pointer-events-none" />
                <button
                  onClick={() => setIsEditingHex(!isEditingHex)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}