import type { TextElement } from '../shared'

/**
 * Draws a text element on the canvas
 */
export function drawText(ctx: CanvasRenderingContext2D, text: TextElement, maxWidth?: number): void {

  if (!text.text || text.text.trim() === '') return

  ctx.globalAlpha = text.opacity
  ctx.fillStyle = text.color

  let fontStyle = ''
  let fontFamily = text.fontFamily

  if (text.fontStyle === 'hand-drawn') {
    fontFamily = 'Caveat, "Shadows Into Light", "Indie Flower", cursive'
  } else if (text.fontStyle === 'code') {
    fontStyle = 'monospace '
    fontFamily = 'Courier New, monospace'
  } else if (text.fontStyle === 'n-dot') {
    fontFamily = 'Nothing, sans-serif'
  }

  ctx.font = `${fontStyle}${text.fontWeight} ${text.fontSize}px ${fontFamily}`
  ctx.textBaseline = 'top'
  ctx.textAlign = text.textAlign

  const lineHeight = text.fontSize * 1.2
  let wrappedLines: string[] = []
  
  const wrapWidth = maxWidth ?? (text.width && text.width > 0 ? text.width : undefined)
  
  if (wrapWidth) {
    const rawLines = text.text.split('\n')
    rawLines.forEach(line => {
      if (line.trim() === '') {
        wrappedLines.push(' ')
        return
      }
      
      const words = line.split(' ')
      let currentLine = ''
      
      words.forEach((word, wordIndex) => {
        const wordMetrics = ctx.measureText(word)
        if (wordMetrics.width > wrapWidth) {
          if (currentLine) {
            wrappedLines.push(currentLine)
            currentLine = ''
          }
          
          let wordLine = ''
          for (let i = 0; i < word.length; i++) {
            const char = word[i]
            const testWordLine = wordLine + char
            const charMetrics = ctx.measureText(testWordLine)
            
            if (charMetrics.width > wrapWidth && wordLine) {
              wrappedLines.push(wordLine)
              wordLine = char
            } else {
              wordLine = testWordLine
            }
          }
          
          if (wordLine) {
            currentLine = wordLine
          }
        } else {
          const testLine = currentLine ? `${currentLine} ${word}` : word
          const metrics = ctx.measureText(testLine)
          
          if (metrics.width > wrapWidth && currentLine) {
            wrappedLines.push(currentLine)
            currentLine = word
          } else {
            currentLine = testLine
          }
        }
        
        if (wordIndex === words.length - 1 && currentLine) {
          wrappedLines.push(currentLine)
        }
      })
    })
  } else {
    wrappedLines = text.text.split('\n')
  }

  wrappedLines.forEach((line, index) => {
    let x = text.x
    if (text.textAlign === 'center' && text.width) {
      x = text.x + text.width / 2
    } else if (text.textAlign === 'right' && text.width) {
      x = text.x + text.width
    }
    const y = text.y + index * lineHeight
    ctx.fillText(line || ' ', x, y)
  })

  ctx.globalAlpha = 1
}