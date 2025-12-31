import type { ToolType } from '../../Toolbar'

export function getCursor(
  selectedTool: ToolType,
  isDragging: boolean,
  isResizing: string | null,
  isPanning: boolean,
  isMiddleButtonDown: boolean,
  hoverHandle: string | null,
  hoverElement: string | null
): string {
  if (isMiddleButtonDown || (selectedTool === 'pan' && isPanning)) return 'grabbing'
  if (selectedTool === 'pen' || selectedTool === 'rectangle' || selectedTool === 'diamond' || selectedTool === 'circle' || selectedTool === 'text' || selectedTool === 'eraser' || selectedTool === 'arrow' || selectedTool === 'line') return 'crosshair'
  if (selectedTool === 'pan') return 'grab'
  if (selectedTool === 'select') {
    if (isDragging) return 'move'
    if (isResizing) {
      if (isResizing === 'tl' || isResizing === 'br') return 'nwse-resize'
      if (isResizing === 'tr' || isResizing === 'bl') return 'nesw-resize'
      if (isResizing === 'l' || isResizing === 'r') return 'ew-resize'
      if (isResizing === 't' || isResizing === 'b') return 'ns-resize'
      if (isResizing === 'start' || isResizing === 'end') return 'move'
    }
    if (hoverHandle) {
      if (hoverHandle === 'tl' || hoverHandle === 'br') return 'nwse-resize'
      if (hoverHandle === 'tr' || hoverHandle === 'bl') return 'nesw-resize'
      if (hoverHandle === 'l' || hoverHandle === 'r') return 'ew-resize'
      if (hoverHandle === 't' || hoverHandle === 'b') return 'ns-resize'
    }
    if (hoverElement) return 'move'
    return 'default'
  }
  return 'default'
}