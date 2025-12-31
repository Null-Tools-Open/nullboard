'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface TypingTextProps {
  words: string[]
  className?: string
  speed?: number
}

export function TypingText({ words, className = '', speed = 150 }: TypingTextProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    const currentWord = words[currentWordIndex]
    
    const timeout = setTimeout(() => {
      if (isPaused) {
        setIsPaused(false)
        setIsDeleting(true)
        return
      }

      if (isDeleting) {
        setCurrentText(currentWord.substring(0, currentText.length - 1))
        
        if (currentText === '') {
          setIsDeleting(false)
          setCurrentWordIndex((prev) => (prev + 1) % words.length)
        }
      } else {
        setCurrentText(currentWord.substring(0, currentText.length + 1))
        
        if (currentText === currentWord) {
          setIsPaused(true)
        }
      }
    }, isDeleting ? speed / 2 : isPaused ? 2000 : speed)

    return () => clearTimeout(timeout)
  }, [currentText, isDeleting, isPaused, words, currentWordIndex, speed])

  return (
    <span className={className}>
      {currentText}
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className="inline-block w-1 h-[1em] bg-current ml-1"
      />
    </span>
  )
}