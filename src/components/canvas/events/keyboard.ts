import type { CanvasElement } from '../shared'
import { calculatePathBounds } from '../pen'

export function setupKeyboardHandlers(
  selectedIds: string[],
  elements: CanvasElement[],
  clipboard: CanvasElement[],
  editingTextId: string | null,
  historyRef: React.MutableRefObject<CanvasElement[][]>,
  redoRef: React.MutableRefObject<CanvasElement[][]>,
  needsRedrawRef: React.MutableRefObject<boolean>,
  setElements: React.Dispatch<React.SetStateAction<CanvasElement[]>>,
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>,
  setClipboard: React.Dispatch<React.SetStateAction<CanvasElement[]>>
): () => void {
  const handleKeyDown = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return
    }

    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length > 0 && !editingTextId) {
      historyRef.current.push([...elements])
      redoRef.current = []
      setElements(prev => prev.filter(el => !selectedIds.includes(el.id)))
      setSelectedIds([])
      needsRedrawRef.current = true
    }

    if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
      e.preventDefault()
      if (historyRef.current.length > 0) {
        const current = [...elements]
        const prev = historyRef.current.pop()!
        redoRef.current.push(current)
        setElements(prev)
        setSelectedIds([])
        needsRedrawRef.current = true
      }
    }

    if ((e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey) ||
      (e.key === 'y' && (e.ctrlKey || e.metaKey))) {
      e.preventDefault()
      if (redoRef.current.length > 0) {
        const current = [...elements]
        const next = redoRef.current.pop()!
        historyRef.current.push(current)
        setElements(next)
        setSelectedIds([])
        needsRedrawRef.current = true
      }
    }

    if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      const allIds = elements.map(el => el.id)
      setSelectedIds(allIds)
      needsRedrawRef.current = true
    }

    if (e.key === 'c' && (e.ctrlKey || e.metaKey) && selectedIds.length > 0) {
      e.preventDefault()
      const copiedElements = elements.filter(el => selectedIds.includes(el.id))
      setClipboard(copiedElements)
    }

    if (e.key === 'v' && (e.ctrlKey || e.metaKey) && clipboard.length > 0) {
      e.preventDefault()
      historyRef.current.push([...elements])
      redoRef.current = []

      const pastedElements = clipboard.map(el => {
        const newId = `${el.type}-${Date.now()}-${Math.random()}`
        if (el.type === 'rect' || el.type === 'diamond' || el.type === 'circle') {
          return { ...el, id: newId, x: el.x + 20, y: el.y + 20 }
        } else if (el.type === 'path') {
          const offsetPoints = el.points.map(p => ({ x: p.x + 20, y: p.y + 20 }))
          return { ...el, id: newId, points: offsetPoints, bounds: calculatePathBounds(offsetPoints) }
        } else if (el.type === 'line' || el.type === 'arrow') {
          return {
            ...el,
            id: newId,
            start: { x: el.start.x + 20, y: el.start.y + 20 },
            end: { x: el.end.x + 20, y: el.end.y + 20 },
            controlPoint: el.type === 'arrow' && el.controlPoint
              ? { x: el.controlPoint.x + 20, y: el.controlPoint.y + 20 }
              : undefined
          }
        } else if (el.type === 'text') {
          return { ...el, id: newId, x: el.x + 20, y: el.y + 20 }
        }
        return Object.assign({}, el, { id: newId }) as CanvasElement
      })

      setElements(prev => [...prev, ...pastedElements])
      setSelectedIds(pastedElements.map(el => el.id))
      needsRedrawRef.current = true
    }

    if (e.key === 'd' && (e.ctrlKey || e.metaKey) && selectedIds.length > 0) {
      e.preventDefault()
      historyRef.current.push([...elements])
      redoRef.current = []

      const selectedElements = elements.filter(el => selectedIds.includes(el.id))
      const duplicatedElements = selectedElements.map(el => {
        const newId = `${el.type}-${Date.now()}-${Math.random()}`
        if (el.type === 'rect' || el.type === 'diamond' || el.type === 'circle') {
          return { ...el, id: newId, x: el.x + 20, y: el.y + 20 }
        } else if (el.type === 'path') {
          const offsetPoints = el.points.map(p => ({ x: p.x + 20, y: p.y + 20 }))
          return { ...el, id: newId, points: offsetPoints, bounds: calculatePathBounds(offsetPoints) }
        } else if (el.type === 'line' || el.type === 'arrow') {
          return {
            ...el,
            id: newId,
            start: { x: el.start.x + 20, y: el.start.y + 20 },
            end: { x: el.end.x + 20, y: el.end.y + 20 },
            controlPoint: el.type === 'arrow' && el.controlPoint
              ? { x: el.controlPoint.x + 20, y: el.controlPoint.y + 20 }
              : undefined
          }
        } else if (el.type === 'text') {
          return { ...el, id: newId, x: el.x + 20, y: el.y + 20 }
        }
        return Object.assign({}, el, { id: newId }) as CanvasElement
      })

      setElements(prev => [...prev, ...duplicatedElements])
      setSelectedIds(duplicatedElements.map(el => el.id))
      needsRedrawRef.current = true
    }
  }

  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}