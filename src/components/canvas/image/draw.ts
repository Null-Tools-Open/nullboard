import type { ImageElement } from '../shared'

// Cache for loaded images
const imageCache = new Map<string, HTMLImageElement>()

/**
 * Draws an image element on the canvas
 */
export function drawImage(ctx: CanvasRenderingContext2D, image: ImageElement, onLoad?: () => void): void {
  ctx.globalAlpha = image.opacity
  
  // Check cache first
  let img = imageCache.get(image.src)
  
  if (!img) {
    img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      imageCache.set(image.src, img!)
      if (onLoad) onLoad()
    }
    
    img.onerror = () => {
      console.error('Failed to load image:', image.src)
      ctx.globalAlpha = 1
    }
    
    img.src = image.src
    imageCache.set(image.src, img)
  }
  
  // Only draw if image is loaded
  if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
    const cornerRadius = image.cornerStyle === 'rounded' ? Math.min(image.width, image.height) * 0.2 : 0

    if (cornerRadius > 0) {
      ctx.save()
      ctx.beginPath()
      ctx.roundRect(image.x, image.y, image.width, image.height, cornerRadius)
      ctx.clip()
      ctx.drawImage(img, image.x, image.y, image.width, image.height)
      ctx.restore()
    } else {
      ctx.drawImage(img, image.x, image.y, image.width, image.height)
    }
  } else if (onLoad) {
    // If image is not loaded yet, wait for it
    img.onload = () => {
      imageCache.set(image.src, img!)
      if (onLoad) onLoad()
    }
  }

  ctx.globalAlpha = 1
}