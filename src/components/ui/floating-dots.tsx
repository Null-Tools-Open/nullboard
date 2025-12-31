'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

interface FloatingDotsProps {
  count?: number
  className?: string
}

export function FloatingDots({ count = 50, className = '' }: FloatingDotsProps) {
  const [dots, setDots] = useState<Array<{
    id: number
    x: number
    y: number
    size: number
    duration: number
    delay: number
  }>>([])

  useEffect(() => {
    // Generate random values only on client side after hydration
    setDots(Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    })))
  }, [count])

  if (dots.length === 0) {
    return null
  }

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {dots.map((dot) => (
        <motion.div
          key={dot.id}
          className="absolute rounded-full bg-white/20"
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            width: dot.size,
            height: dot.size,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: dot.duration,
            repeat: Infinity,
            delay: dot.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}