'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface GlobeProps {
  className?: string
  dotCount?: number
  fileCount?: number
}

interface GlobePoint {
  x: number
  y: number
  z: number
  originalX: number
  originalY: number
  originalZ: number
}

interface FlyingFile {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  targetX: number
  targetY: number
  targetZ: number
  size: number
  type: 'image' | 'audio' | 'video' | 'document' | 'archive'
  trail: { x: number; y: number; alpha: number }[]
}

const drawFileIcon = (ctx: CanvasRenderingContext2D, type: string, x: number, y: number, size: number) => {
  const s = size * 0.5
  ctx.save()
  ctx.translate(x, y)
  ctx.strokeStyle = `rgba(255, 255, 255, 0.8)`
  ctx.fillStyle = `rgba(255, 255, 255, 0.6)`
  ctx.lineWidth = 1.5

  switch (type) {
    case 'image':
      ctx.beginPath()
      ctx.roundRect(-s/2, -s/2, s, s, 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(-s/3, s/4)
      ctx.lineTo(0, -s/4)
      ctx.lineTo(s/3, s/4)
      ctx.stroke()
      break
    case 'video':
      ctx.beginPath()
      ctx.roundRect(-s/2, -s/2, s, s, 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(-s/6, -s/4)
      ctx.lineTo(s/3, 0)
      ctx.lineTo(-s/6, s/4)
      ctx.closePath()
      ctx.fill()
      break
    case 'audio':
      ctx.beginPath()
      ctx.roundRect(-s/2, -s/2, s, s, 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(-s/4, 0, s/6, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(0, 0, s/4, 0, Math.PI * 2)
      ctx.stroke()
      break
    case 'document':
      ctx.beginPath()
      ctx.moveTo(-s/2, -s/2)
      ctx.lineTo(s/3, -s/2)
      ctx.lineTo(s/2, -s/3)
      ctx.lineTo(s/2, s/2)
      ctx.lineTo(-s/2, s/2)
      ctx.closePath()
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(s/3, -s/2)
      ctx.lineTo(s/3, -s/3)
      ctx.lineTo(s/2, -s/3)
      ctx.stroke()
      break
    case 'archive':
      ctx.beginPath()
      ctx.roundRect(-s/2, -s/2, s, s, 2)
      ctx.stroke()
      for (let i = 0; i < 3; i++) {
        ctx.beginPath()
        ctx.moveTo(-s/3, -s/4 + i * s/6)
        ctx.lineTo(s/3, -s/4 + i * s/6)
        ctx.stroke()
      }
      break
  }
  ctx.restore()
}

export function Globe({ className = '', dotCount = 1000, fileCount = 8 }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 800 })
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, screenX: 0, screenY: 0 })
  const animationRef = useRef<number>(0)
  const pointsRef = useRef<GlobePoint[]>([])
  const filesRef = useRef<FlyingFile[]>([])
  const rotationRef = useRef({ x: 0, y: 0 })
  const autoRotationRef = useRef(0)

  const generateGlobePoints = useCallback((count: number, radius: number): GlobePoint[] => {
    const points: GlobePoint[] = []
    const phi = Math.PI * (Math.sqrt(5) - 1)
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2
      const radiusAtY = Math.sqrt(1 - y * y)
      const theta = phi * i
      const x = Math.cos(theta) * radiusAtY
      const z = Math.sin(theta) * radiusAtY
      points.push({
        x: x * radius, y: y * radius, z: z * radius,
        originalX: x * radius, originalY: y * radius, originalZ: z * radius,
      })
    }
    return points
  }, [])

  const getRandomPointOnSphere = (radius: number) => {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    return {
      x: radius * Math.sin(phi) * Math.cos(theta),
      y: radius * Math.sin(phi) * Math.sin(theta),
      z: radius * Math.cos(phi),
    }
  }

  const generateFlyingFile = useCallback((radius: number, existingFiles?: FlyingFile[]): FlyingFile => {
    const safeRadius = Math.max(radius, 1) * 1.3
    let attempts = 0
    let start: { x: number; y: number; z: number } | null = null
    let end: { x: number; y: number; z: number } | null = null
    
    do {
      start = getRandomPointOnSphere(safeRadius)
      end = getRandomPointOnSphere(safeRadius)
      attempts++
      
      if (!existingFiles || attempts > 50) break
      
      const minDistance = safeRadius * 0.4
      const tooClose = existingFiles.some(file => {
        const dx = file.x - start!.x
        const dy = file.y - start!.y
        const dz = file.z - start!.z
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
        return distance < minDistance
      })
      
      if (!tooClose) break
    } while (attempts < 50)
    
    if (!start || !end) {
      start = getRandomPointOnSphere(safeRadius)
      end = getRandomPointOnSphere(safeRadius)
    }
    
    const types: FlyingFile['type'][] = ['image', 'audio', 'video', 'document', 'archive']
    const dx = end.x - start.x
    const dy = end.y - start.y
    const dz = end.z - start.z
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
    const speed = 0.8 + Math.random() * 0.4
    
    return {
      x: start.x, y: start.y, z: start.z,
      vx: (dx / distance) * speed,
      vy: (dy / distance) * speed,
      vz: (dz / distance) * speed,
      targetX: end.x, targetY: end.y, targetZ: end.z,
      size: 16 + Math.random() * 10,
      type: types[Math.floor(Math.random() * types.length)],
      trail: [],
    }
  }, [])

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const size = Math.max(Math.min(rect.width, rect.height, 1500), 100)
        setDimensions({ width: size, height: size })
      }
    }
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  useEffect(() => {
    const radius = Math.max(Math.min(dimensions.width, dimensions.height) / 2.3, 50)
    pointsRef.current = generateGlobePoints(dotCount, radius)
    filesRef.current = []
    for (let i = 0; i < fileCount; i++) {
      filesRef.current.push(generateFlyingFile(radius, filesRef.current))
    }
  }, [dimensions, dotCount, fileCount, generateGlobePoints, generateFlyingFile])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      mouseRef.current.targetX = (e.clientX - centerX) / rect.width
      mouseRef.current.targetY = (e.clientY - centerY) / rect.height
      
      mouseRef.current.screenX = ((e.clientX - rect.left) / rect.width) * dimensions.width
      mouseRef.current.screenY = ((e.clientY - rect.top) / rect.height) * dimensions.height
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [dimensions])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const centerX = dimensions.width / 2
    const centerY = dimensions.height / 2
    const radius = Math.max(Math.min(dimensions.width, dimensions.height) / 2.3, 50)

    const animate = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height)

      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.06
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.06

      autoRotationRef.current += 0.001
      rotationRef.current.y = autoRotationRef.current + mouseRef.current.x * 0.6
      rotationRef.current.x = mouseRef.current.y * 0.4

      const cosX = Math.cos(rotationRef.current.x)
      const sinX = Math.sin(rotationRef.current.x)
      const cosY = Math.cos(rotationRef.current.y)
      const sinY = Math.sin(rotationRef.current.y)

      const glowRadius = Math.max(radius * 1.5, 1)
      if (isFinite(glowRadius) && glowRadius > 0) {
        const glow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowRadius)
        glow.addColorStop(0, 'rgba(255, 255, 255, 0.03)')
        glow.addColorStop(0.5, 'rgba(255, 255, 255, 0.01)')
        glow.addColorStop(1, 'transparent')
        ctx.fillStyle = glow
        ctx.fillRect(0, 0, dimensions.width, dimensions.height)
      }

      const transformed = pointsRef.current.map((point) => {
        let { originalX: x, originalY: y, originalZ: z } = point
        let tx = x * cosY - z * sinY
        let tz = x * sinY + z * cosY
        let ty = y * cosX - tz * sinX
        tz = y * sinX + tz * cosX
        const depth = (tz + radius) / (radius * 2)
        return { x: tx + centerX, y: ty + centerY, z: tz, depth }
      }).sort((a, b) => a.z - b.z)

      const mouseX = mouseRef.current.screenX
      const mouseY = mouseRef.current.screenY
      const repulsionRadius = 80
      const repulsionStrength = 15

      transformed.forEach((point) => {
        if (point.depth < 0.1) return
        
        const dx = point.x - mouseX
        const dy = point.y - mouseY
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        let offsetX = 0
        let offsetY = 0
        if (distance < repulsionRadius && distance > 0) {
          const force = (1 - distance / repulsionRadius) * repulsionStrength
          offsetX = (dx / distance) * force
          offsetY = (dy / distance) * force
        }
        
        const finalX = point.x + offsetX
        const finalY = point.y + offsetY
        
        const size = 0.8 + point.depth * 1.2
        const alpha = point.depth * 0.8
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
        ctx.beginPath()
        ctx.arc(finalX, finalY, size, 0, Math.PI * 2)
        ctx.fill()
      })

      const minFileDistance = radius * 0.4
      
      filesRef.current.forEach((file, i) => {
        const dx = file.targetX - file.x
        const dy = file.targetY - file.y
        const dz = file.targetZ - file.z
        const distanceToTarget = Math.sqrt(dx * dx + dy * dy + dz * dz)
        
        if (distanceToTarget < radius * 0.15) {
          let newTarget = getRandomPointOnSphere(radius * 1.3)
          let attempts = 0
          
          while (attempts < 20) {
            const tooClose = filesRef.current.some((otherFile, j) => {
              if (i === j) return false
              const dx2 = otherFile.x - newTarget.x
              const dy2 = otherFile.y - newTarget.y
              const dz2 = otherFile.z - newTarget.z
              const dist = Math.sqrt(dx2 * dx2 + dy2 * dy2 + dz2 * dz2)
              return dist < minFileDistance
            })
            
            if (!tooClose) break
            newTarget = getRandomPointOnSphere(radius * 1.3)
            attempts++
          }
          
          file.targetX = newTarget.x
          file.targetY = newTarget.y
          file.targetZ = newTarget.z
        }
        
        const damping = 0.998
        file.vx *= damping
        file.vy *= damping
        file.vz *= damping
        
        const targetDx = file.targetX - file.x
        const targetDy = file.targetY - file.y
        const targetDz = file.targetZ - file.z
        const targetDistance = Math.sqrt(targetDx * targetDx + targetDy * targetDy + targetDz * targetDz)
        
        if (targetDistance > radius * 0.2) {
          const attraction = 0.03
          file.vx += (targetDx / targetDistance) * attraction
          file.vy += (targetDy / targetDistance) * attraction
          file.vz += (targetDz / targetDistance) * attraction
        }
        
        filesRef.current.forEach((otherFile, j) => {
          if (i === j) return
          const dx2 = file.x - otherFile.x
          const dy2 = file.y - otherFile.y
          const dz2 = file.z - otherFile.z
          const dist = Math.sqrt(dx2 * dx2 + dy2 * dy2 + dz2 * dz2)
          
          if (dist < minFileDistance && dist > 0) {
            const repulsion = (1 - dist / minFileDistance) * 0.2
            file.vx += (dx2 / dist) * repulsion
            file.vy += (dy2 / dist) * repulsion
            file.vz += (dz2 / dist) * repulsion
          }
        })
        
        file.x += file.vx
        file.y += file.vy
        file.z += file.vz
        
        let fx = file.x
        let fy = file.y
        let fz = file.z

        let tx = fx * cosY - fz * sinY
        let tz = fx * sinY + fz * cosY
        let ty = fy * cosX - tz * sinX
        tz = fy * sinX + tz * cosX

        const screenX = tx + centerX
        const screenY = ty + centerY
        const fileRadius = radius * 1.3
        const depth = (tz + fileRadius) / (fileRadius * 2)

        file.trail.unshift({ x: screenX, y: screenY, alpha: 0.5 })
        if (file.trail.length > 12) file.trail.pop()
        file.trail.forEach(t => t.alpha *= 0.85)

        if (depth < 0.15 || !isFinite(screenX) || !isFinite(screenY)) return

        const scale = 0.5 + depth * 0.6
        const alpha = 0.4 + depth * 0.6

        if (file.trail.length > 1) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.2})`
          ctx.lineWidth = 2 * scale
          ctx.lineCap = 'round'
          ctx.beginPath()
          ctx.moveTo(file.trail[0].x, file.trail[0].y)
          for (let j = 1; j < file.trail.length; j++) {
            ctx.lineTo(file.trail[j].x, file.trail[j].y)
          }
          ctx.stroke()
        }

        const fileGlowRadius = Math.max(file.size * scale * 2, 1)
        if (isFinite(fileGlowRadius) && fileGlowRadius > 0 && isFinite(screenX) && isFinite(screenY)) {
          const glowGrad = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, fileGlowRadius)
          glowGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.15})`)
          glowGrad.addColorStop(1, 'transparent')
          ctx.fillStyle = glowGrad
          ctx.beginPath()
          ctx.arc(screenX, screenY, fileGlowRadius, 0, Math.PI * 2)
          ctx.fill()
        }

        const s = file.size * scale
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.8})`
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.roundRect(screenX - s/2, screenY - s/2, s, s, 4)
        ctx.fill()
        ctx.stroke()

        ctx.globalAlpha = alpha * 0.8
        drawFileIcon(ctx, file.type, screenX, screenY, s)
        ctx.globalAlpha = 1
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()
    return () => cancelAnimationFrame(animationRef.current)
  }, [dimensions, generateFlyingFile])

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <canvas ref={canvasRef} width={dimensions.width} height={dimensions.height} className="w-full h-full" />
    </div>
  )
}