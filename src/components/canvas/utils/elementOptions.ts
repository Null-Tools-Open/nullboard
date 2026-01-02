import type { CanvasElement } from '../shared'
import type { RectangleOptions } from '../../options/rectangleOptionsPanel'
import type { DiamondOptions } from '../../options/diamondOptionsPanel'
import type { CircleOptions } from '../../options/circleOptionsPanel'
import type { PenOptions } from '../../options/penOptionsPanel'
import type { LineOptions } from '../../options/lineOptionsPanel'
import type { ArrowOptions } from '../../options/arrowOptionsPanel'
import type { TextOptions } from '../../options/textOptionsPanel'
import type { ImageOptions } from '../../options/imageOptionsPanel'
import type { FrameOptions } from '../../options/frameOptionsPanel'
import type { EmbedOptions } from '../../options/embedOptionsPanel'
import type { StickerOptions } from '../../options/stickerOptionsPanel'
import type { StickyNoteOptions } from '../../options/stickyNoteOptionsPanel'

export function getSelectedElementType(
  selectedIds: string[],
  elements: CanvasElement[]
): string | null {
  if (selectedIds.length === 1) {
    const el = elements.find(e => e.id === selectedIds[0])
    return el?.type || null
  }
  return null
}

export function getSelectedElementOptions(
  selectedIds: string[],
  elements: CanvasElement[]
): RectangleOptions | DiamondOptions | CircleOptions | PenOptions | LineOptions | ArrowOptions | TextOptions | ImageOptions | FrameOptions | EmbedOptions | StickyNoteOptions | null {
  if (selectedIds.length === 1) {
    const el = elements.find(e => e.id === selectedIds[0])
    if (!el) return null

    if (el.type === 'rect') {
      return {
        strokeColor: el.strokeColor,
        fillColor: el.fillColor || null,
        strokeWidth: el.strokeWidth,
        strokeStyle: el.strokeStyle,
        opacity: Math.round(el.opacity * 100)
      }
    } else if (el.type === 'diamond') {
      return {
        strokeColor: el.strokeColor,
        fillColor: el.fillColor || null,
        strokeWidth: el.strokeWidth,
        strokeStyle: el.strokeStyle,
        opacity: Math.round(el.opacity * 100)
      }
    } else if (el.type === 'circle') {
      return {
        strokeColor: el.strokeColor,
        fillColor: el.fillColor || null,
        strokeWidth: el.strokeWidth,
        strokeStyle: el.strokeStyle,
        opacity: Math.round(el.opacity * 100)
      }
    } else if (el.type === 'path') {
      return {
        strokeColor: el.color,
        fillColor: null,
        strokeWidth: el.width,
        opacity: Math.round(el.opacity * 100)
      }
    } else if (el.type === 'line') {
      return {
        strokeColor: el.strokeColor,
        fillColor: null,
        strokeWidth: el.strokeWidth,
        strokeStyle: el.strokeStyle,
        opacity: Math.round(el.opacity * 100)
      }
    } else if (el.type === 'arrow') {
      return {
        strokeColor: el.strokeColor,
        fillColor: null,
        strokeWidth: el.strokeWidth,
        strokeStyle: el.strokeStyle,
        arrowStart: el.arrowStart,
        arrowEnd: el.arrowEnd,
        arrowType: el.arrowType,
        opacity: Math.round(el.opacity * 100)
      }
    } else if (el.type === 'text') {
      return {
        color: el.color,
        fontSize: el.fontSize,
        fontFamily: el.fontFamily,
        fontWeight: el.fontWeight,
        fontStyle: el.fontStyle,
        textAlign: el.textAlign,
        opacity: Math.round(el.opacity * 100)
      }
    } else if (el.type === 'image') {
      return {
        cornerStyle: el.cornerStyle || 'sharp',
        opacity: Math.round(el.opacity * 100)
      }
    } else if (el.type === 'frame') {
      return {
        opacity: Math.round(el.opacity * 100),
        name: el.name
      }
    } else if (el.type === 'embed') {
      return {
        url: el.url || '',
        opacity: Math.round(el.opacity * 100)
      }
    } else if (el.type === 'sticker') {
      return {
        opacity: Math.round(el.opacity * 100),
        cornerStyle: el.cornerStyle || 'sharp'
      }
    } else if (el.type === 'stickyNote') {
      return {
        color: el.color,
        opacity: Math.round(el.opacity * 100),
        foldCorner: el.foldCorner || 'topRight'
      }
    }
  }
  return null
}

export function updateSelectedElements(
  selectedIds: string[],
  elements: CanvasElement[],
  updates: Partial<RectangleOptions | CircleOptions | DiamondOptions | PenOptions | LineOptions | ArrowOptions | TextOptions | ImageOptions | FrameOptions | EmbedOptions | StickerOptions | StickyNoteOptions>
): CanvasElement[] {
  if (selectedIds.length === 0) return elements

  return elements.map(el => {
    if (!selectedIds.includes(el.id)) return el

    if (el.type === 'rect' || el.type === 'diamond' || el.type === 'circle') {
      const shapeUpdates = updates as Partial<RectangleOptions | CircleOptions | DiamondOptions>
      return {
        ...el,
        strokeColor: (shapeUpdates as any).strokeColor ?? el.strokeColor,
        fillColor: shapeUpdates.fillColor !== undefined ? (shapeUpdates.fillColor || undefined) : el.fillColor,
        strokeWidth: (shapeUpdates as any).strokeWidth ?? el.strokeWidth,
        strokeStyle: shapeUpdates.strokeStyle ?? el.strokeStyle,
        opacity: (shapeUpdates as any).opacity !== undefined ? (shapeUpdates as any).opacity / 100 : el.opacity
      }
    } else if (el.type === 'path') {
      const pathUpdates = updates as Partial<PenOptions>
      return {
        ...el,
        color: (pathUpdates as any).strokeColor ?? el.color,
        width: (pathUpdates as any).strokeWidth ?? el.width,
        opacity: (pathUpdates as any).opacity !== undefined ? (pathUpdates as any).opacity / 100 : el.opacity
      }
    } else if (el.type === 'line') {
      const lineUpdates = updates as Partial<LineOptions>
      return {
        ...el,
        strokeColor: ('strokeColor' in lineUpdates ? lineUpdates.strokeColor : undefined) ?? el.strokeColor,
        strokeWidth: ('strokeWidth' in lineUpdates ? lineUpdates.strokeWidth : undefined) ?? el.strokeWidth,
        strokeStyle: lineUpdates.strokeStyle ?? el.strokeStyle,
        opacity: lineUpdates.opacity !== undefined ? lineUpdates.opacity / 100 : el.opacity
      }
    } else if (el.type === 'arrow') {
      const arrowUpdates = updates as Partial<ArrowOptions>
      return {
        ...el,
        strokeColor: ('strokeColor' in arrowUpdates ? arrowUpdates.strokeColor : undefined) ?? el.strokeColor,
        strokeWidth: ('strokeWidth' in arrowUpdates ? arrowUpdates.strokeWidth : undefined) ?? el.strokeWidth,
        strokeStyle: arrowUpdates.strokeStyle ?? el.strokeStyle,
        arrowStart: arrowUpdates.arrowStart ?? el.arrowStart,
        arrowEnd: arrowUpdates.arrowEnd ?? el.arrowEnd,
        arrowType: arrowUpdates.arrowType ?? el.arrowType,
        opacity: arrowUpdates.opacity !== undefined ? arrowUpdates.opacity / 100 : el.opacity
      }
    } else if (el.type === 'text') {
      const textUpdates = updates as Partial<TextOptions>
      const oldFontSize = el.fontSize
      const newFontSize = textUpdates.fontSize ?? el.fontSize

      let newWidth = el.width
      let newHeight = el.height

      if (textUpdates.fontSize !== undefined && textUpdates.fontSize !== oldFontSize && oldFontSize > 0) {
        const fontSizeScale = newFontSize / oldFontSize
        if (el.width && el.width > 0) {
          newWidth = el.width * fontSizeScale
        }
        if (el.height && el.height > 0) {
          newHeight = el.height * fontSizeScale
        }
      }

      return {
        ...el,
        color: textUpdates.color ?? el.color,
        fontSize: newFontSize,
        fontFamily: textUpdates.fontFamily ?? el.fontFamily,
        fontWeight: textUpdates.fontWeight ?? el.fontWeight,
        fontStyle: textUpdates.fontStyle ?? el.fontStyle,
        textAlign: textUpdates.textAlign ?? el.textAlign,
        opacity: textUpdates.opacity !== undefined ? textUpdates.opacity / 100 : el.opacity,
        width: newWidth,
        height: newHeight
      }
    } else if (el.type === 'image') {
      const imageUpdates = updates as Partial<ImageOptions>
      return {
        ...el,
        cornerStyle: imageUpdates.cornerStyle ?? el.cornerStyle ?? 'sharp',
        opacity: imageUpdates.opacity !== undefined ? imageUpdates.opacity / 100 : el.opacity
      }
    } else if (el.type === 'frame') {
      const frameUpdates = updates as Partial<FrameOptions>
      return {
        ...el,
        opacity: frameUpdates.opacity !== undefined ? frameUpdates.opacity / 100 : el.opacity,
        name: frameUpdates.name !== undefined ? frameUpdates.name : el.name
      }
    } else if (el.type === 'embed') {
      const embedUpdates = updates as Partial<EmbedOptions>
      return {
        ...el,
        url: embedUpdates.url !== undefined ? embedUpdates.url : el.url,
        opacity: embedUpdates.opacity !== undefined ? embedUpdates.opacity / 100 : el.opacity
      }
    } else if (el.type === 'sticker') {
      const stickerUpdates = updates as Partial<StickerOptions>
      return {
        ...el,
        opacity: stickerUpdates.opacity !== undefined ? stickerUpdates.opacity / 100 : el.opacity,
        cornerStyle: stickerUpdates.cornerStyle ?? el.cornerStyle ?? 'sharp'
      }
    } else if (el.type === 'stickyNote') {
      const stickyNoteUpdates = updates as Partial<StickyNoteOptions>
      return {
        ...el,
        color: stickyNoteUpdates.color ?? el.color,
        opacity: stickyNoteUpdates.opacity !== undefined ? stickyNoteUpdates.opacity / 100 : el.opacity,
        foldCorner: stickyNoteUpdates.foldCorner ?? el.foldCorner ?? 'topRight'
      }
    }
    return el
  })
}