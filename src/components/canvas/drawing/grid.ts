export function drawGrid(
  ctx: CanvasRenderingContext2D,
  canvasSize: number,
  theme: 'light' | 'dark',
  transformState: { positionX: number; positionY: number; scale: number } | null,
  containerWidth: number | undefined,
  containerHeight: number | undefined
) {
  if (transformState) {
    const viewportWidth = (containerWidth || 1920) / transformState.scale
    const viewportHeight = (containerHeight || 1080) / transformState.scale
    const viewportX = -transformState.positionX / transformState.scale
    const viewportY = -transformState.positionY / transformState.scale

    const baseGridStep = 100
    const gridStep = transformState.scale > 1.65 ? baseGridStep * 2 : baseGridStep

    const padding = transformState.scale > 1.65 ? 100 : 200
    const startX = Math.max(0, Math.floor((viewportX - padding) / gridStep) * gridStep)
    const endX = Math.min(canvasSize, Math.ceil((viewportX + viewportWidth + padding) / gridStep) * gridStep)
    const startY = Math.max(0, Math.floor((viewportY - padding) / gridStep) * gridStep)
    const endY = Math.min(canvasSize, Math.ceil((viewportY + viewportHeight + padding) / gridStep) * gridStep)

    ctx.strokeStyle = theme === 'light' ? '#f0f0f0' : '#2a2a2a'
    ctx.lineWidth = 1

    ctx.beginPath()
    for (let i = startX; i <= endX; i += gridStep) {
      ctx.moveTo(i, startY)
      ctx.lineTo(i, endY)
    }
    ctx.stroke()

    ctx.beginPath()
    for (let i = startY; i <= endY; i += gridStep) {
      ctx.moveTo(startX, i)
      ctx.lineTo(endX, i)
    }
    ctx.stroke()
  } else {
    ctx.strokeStyle = theme === 'light' ? '#f0f0f0' : '#2a2a2a'
    ctx.lineWidth = 1
    for (let i = 0; i < canvasSize; i += 100) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, canvasSize)
      ctx.moveTo(0, i)
      ctx.lineTo(canvasSize, i)
      ctx.stroke()
    }
  }
}