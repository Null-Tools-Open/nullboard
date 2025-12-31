import type { CanvasElement } from '../shared'

export function handleOpen(
  elements: CanvasElement[],
  historyRef: React.MutableRefObject<CanvasElement[][]>,
  redoRef: React.MutableRefObject<CanvasElement[][]>,
  setElements: React.Dispatch<React.SetStateAction<CanvasElement[]>>,
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>,
  needsRedrawRef: React.MutableRefObject<boolean>
) {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json,application/json'
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string)
          if (data.elements && Array.isArray(data.elements)) {
            historyRef.current.push([...elements])
            redoRef.current = []
            setElements(data.elements)
            setSelectedIds([])
            needsRedrawRef.current = true
          }
        } catch (error) {
          console.error('Error loading file:', error)
          alert('Error loading file. Please make sure it is a valid JSON file.')
        }
      }
      reader.readAsText(file)
    }
  }
  input.click()
}