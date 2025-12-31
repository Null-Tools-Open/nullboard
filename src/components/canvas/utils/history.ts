import type { CanvasElement } from '../shared'

export function handleUndo(
  historyRef: React.MutableRefObject<CanvasElement[][]>,
  redoRef: React.MutableRefObject<CanvasElement[][]>,
  elements: CanvasElement[],
  setElements: React.Dispatch<React.SetStateAction<CanvasElement[]>>,
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>,
  setCanUndo: React.Dispatch<React.SetStateAction<boolean>>,
  setCanRedo: React.Dispatch<React.SetStateAction<boolean>>,
  needsRedrawRef: React.MutableRefObject<boolean>
) {
  if (historyRef.current.length > 0) {
    const current = [...elements]
    const prev = historyRef.current.pop()!
    redoRef.current.push(current)
    setElements(prev)
    setSelectedIds([])
    setCanUndo(historyRef.current.length > 0)
    setCanRedo(redoRef.current.length > 0)
    needsRedrawRef.current = true
  }
}

export function handleRedo(
  historyRef: React.MutableRefObject<CanvasElement[][]>,
  redoRef: React.MutableRefObject<CanvasElement[][]>,
  elements: CanvasElement[],
  setElements: React.Dispatch<React.SetStateAction<CanvasElement[]>>,
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>,
  setCanUndo: React.Dispatch<React.SetStateAction<boolean>>,
  setCanRedo: React.Dispatch<React.SetStateAction<boolean>>,
  needsRedrawRef: React.MutableRefObject<boolean>
) {
  if (redoRef.current.length > 0) {
    const current = [...elements]
    const next = redoRef.current.pop()!
    historyRef.current.push(current)
    setElements(next)
    setSelectedIds([])
    setCanUndo(historyRef.current.length > 0)
    setCanRedo(redoRef.current.length > 0)
    needsRedrawRef.current = true
  }
}