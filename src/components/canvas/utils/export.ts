import type { CanvasElement } from '../shared'

export function handleSaveAs(elements: CanvasElement[]) {
  const data = JSON.stringify({ elements, timestamp: Date.now() }, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `canvas-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function calculateBounds(elements: CanvasElement[]): { minX: number; minY: number; maxX: number; maxY: number } {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

  if (elements.length === 0) {
    return { minX: 0, minY: 0, maxX: 1000, maxY: 1000 }
  }

  elements.forEach(el => {
    if (el.type === 'path' && el.points.length > 0) {
      el.points.forEach(p => {
        minX = Math.min(minX, p.x)
        minY = Math.min(minY, p.y)
        maxX = Math.max(maxX, p.x)
        maxY = Math.max(maxY, p.y)
      })
    } else if (el.type === 'rect' || el.type === 'diamond' || el.type === 'image' || el.type === 'frame' || el.type === 'embed') {
      minX = Math.min(minX, el.x)
      minY = Math.min(minY, el.y)
      maxX = Math.max(maxX, el.x + el.width)
      maxY = Math.max(maxY, el.y + el.height)
    } else if (el.type === 'circle') {
      minX = Math.min(minX, el.x - el.radius)
      minY = Math.min(minY, el.y - el.radius)
      maxX = Math.max(maxX, el.x + el.radius)
      maxY = Math.max(maxY, el.y + el.radius)
    } else if (el.type === 'line' || el.type === 'arrow') {
      minX = Math.min(minX, el.start.x, el.end.x)
      minY = Math.min(minY, el.start.y, el.end.y)
      maxX = Math.max(maxX, el.start.x, el.end.x)
      maxY = Math.max(maxY, el.start.y, el.end.y)
    } else if (el.type === 'text') {
      const textWidth = el.width || el.text.length * el.fontSize * 0.6
      const textHeight = el.height || el.fontSize * 1.2
      minX = Math.min(minX, el.x)
      minY = Math.min(minY, el.y)
      maxX = Math.max(maxX, el.x + textWidth)
      maxY = Math.max(maxY, el.y + textHeight)
    }
  })

  return { minX, minY, maxX, maxY }
}

export function cleanSvgNode(node: Node): void {

  if (node.nodeType === Node.ELEMENT_NODE) {

    const el = node as HTMLElement | SVGElement

    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('data-') || attr.name === 'class') {
        el.removeAttribute(attr.name)
      }
    })

    if (el.style) {

      el.style.removeProperty('cursor')
      el.style.removeProperty('background-color')
      el.style.removeProperty('background')

      if (el.getAttribute('style') === '') {
        el.removeAttribute('style')
      }
    }
  }
  node.childNodes.forEach(child => cleanSvgNode(child))
}

export function handleExportImage(
  elements: CanvasElement[],
  theme: 'light' | 'dark'
) {
  const svgElement = document.getElementById('canvas-svg')
  if (!svgElement) {
    console.warn('SVG element not found for export')
    return
  }

  const { minX, minY, maxX, maxY } = calculateBounds(elements)
  const padding = 50
  const width = (maxX - minX) + padding * 2
  const height = (maxY - minY) + padding * 2

  const svgClone = svgElement.cloneNode(true) as SVGSVGElement
  svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  svgClone.setAttribute('width', String(width))
  svgClone.setAttribute('height', String(height))
  svgClone.setAttribute('viewBox', `${minX - padding} ${minY - padding} ${width} ${height}`)

  const defs = svgClone.querySelector('defs')
  if (defs) defs.remove()
  const gridRect = svgClone.querySelector('rect[fill="url(#grid)"]')
  if (gridRect) gridRect.remove()

  const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  bgRect.setAttribute('x', String(minX - padding))
  bgRect.setAttribute('y', String(minY - padding))
  bgRect.setAttribute('width', String(width))
  bgRect.setAttribute('height', String(height))
  bgRect.setAttribute('fill', theme === 'dark' ? '#1a1a1a' : '#ffffff')
  svgClone.insertBefore(bgRect, svgClone.firstChild)

  const serializer = new XMLSerializer()
  const svgString = serializer.serializeToString(svgClone)
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)

  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = width * 2
    canvas.height = height * 2
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.scale(2, 2)
      ctx.fillStyle = theme === 'dark' ? '#1a1a1a' : '#ffffff'
      ctx.fillRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0)

      canvas.toBlob((blob) => {
        if (blob) {
          const pngUrl = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = pngUrl
          a.download = `canvas-export-${Date.now()}.png`
          a.click()
          URL.revokeObjectURL(pngUrl)
        }
      }, 'image/png')
    }
    URL.revokeObjectURL(url)
  }
  img.src = url
}

export function handleExportPng(
  elements: CanvasElement[],
  theme: 'light' | 'dark'
) {

  const svgElement = document.getElementById('canvas-svg')

  if (!svgElement) return

  const { minX, minY, maxX, maxY } = calculateBounds(elements)
  const padding = 50
  const width = (maxX - minX) + padding * 2
  const height = (maxY - minY) + padding * 2

  const svgClone = svgElement.cloneNode(true) as SVGSVGElement
  svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  svgClone.setAttribute('width', String(width))
  svgClone.setAttribute('height', String(height))
  svgClone.setAttribute('viewBox', `${minX - padding} ${minY - padding} ${width} ${height}`)
  svgClone.removeAttribute('style')

  cleanSvgNode(svgClone)

  const defs = svgClone.querySelector('defs')
  if (defs) defs.remove()
  const gridRect = svgClone.querySelector('rect[fill="url(#grid)"]')

  if (gridRect) gridRect.remove()

  const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  bgRect.setAttribute('x', String(minX - padding))
  bgRect.setAttribute('y', String(minY - padding))
  bgRect.setAttribute('width', String(width))
  bgRect.setAttribute('height', String(height))
  bgRect.setAttribute('fill', theme === 'dark' ? '#1a1a1a' : '#ffffff')
  svgClone.insertBefore(bgRect, svgClone.firstChild)

  const serializer = new XMLSerializer()
  const svgString = serializer.serializeToString(svgClone)
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)

  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = width * 2
    canvas.height = height * 2
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.scale(2, 2)
      ctx.fillStyle = theme === 'dark' ? '#1a1a1a' : '#ffffff'
      ctx.fillRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0)

      canvas.toBlob((blob) => {
        if (blob) {
          const pngUrl = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = pngUrl
          a.download = `canvas-export-${Date.now()}.png`
          a.click()
          URL.revokeObjectURL(pngUrl)
        }
      }, 'image/png')
    }
    URL.revokeObjectURL(url)
  }
  img.src = url
}

export type ExportFormat = 'png' | 'svg' | 'jpeg' | 'webp'

export interface AdvancedExportOptions {
  format: ExportFormat
  transparent: boolean
  scale: number
}

export function handleAdvancedExport(
  elements: CanvasElement[],
  theme: 'light' | 'dark',
  options: AdvancedExportOptions
) {
  const { format, transparent, scale } = options

  const svgElement = document.getElementById('canvas-svg')
  if (!svgElement) {
    console.warn('SVG element not found for export')
    return
  }

  const { minX, minY, maxX, maxY } = calculateBounds(elements)
  const padding = 50
  const width = (maxX - minX) + padding * 2
  const height = (maxY - minY) + padding * 2

  const svgClone = svgElement.cloneNode(true) as SVGSVGElement
  svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  svgClone.setAttribute('width', String(width))
  svgClone.setAttribute('height', String(height))
  svgClone.setAttribute('viewBox', `${minX - padding} ${minY - padding} ${width} ${height}`)
  svgClone.removeAttribute('style')

  const defs = svgClone.querySelector('defs')

  if (defs) defs.remove()

  const gridRect = svgClone.querySelector('rect[fill="url(#grid)"]')

  if (gridRect) gridRect.remove()

  if (!transparent) {
    const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    bgRect.setAttribute('x', String(minX - padding))
    bgRect.setAttribute('y', String(minY - padding))
    bgRect.setAttribute('width', String(width))
    bgRect.setAttribute('height', String(height))
    bgRect.setAttribute('fill', theme === 'dark' ? '#1a1a1a' : '#ffffff')
    svgClone.insertBefore(bgRect, svgClone.firstChild)
  }

  const serializer = new XMLSerializer()
  const svgString = serializer.serializeToString(svgClone)

  if (format === 'svg') {
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `canvas-export-${Date.now()}.svg`
    a.click()
    URL.revokeObjectURL(url)
    return
  }

  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)

  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = width * scale
    canvas.height = height * scale
    const ctx = canvas.getContext('2d')

    if (ctx) {
      ctx.scale(scale, scale)

      if (!transparent) {
        ctx.fillStyle = theme === 'dark' ? '#1a1a1a' : '#ffffff'
        ctx.fillRect(0, 0, width, height)
      }

      ctx.drawImage(img, 0, 0)

      const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png'
      const quality = format === 'jpeg' ? 0.92 : undefined

      canvas.toBlob((blob) => {
        if (blob) {
          const blobUrl = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = blobUrl
          a.download = `canvas-export-${Date.now()}.${format}`
          a.click()
          URL.revokeObjectURL(blobUrl)
        }
      }, mimeType, quality)
    }
    URL.revokeObjectURL(url)
  }
  img.src = url
}