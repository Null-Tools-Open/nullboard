'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface AvatarProps {
  name?: string
  email?: string
  avatar?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function Avatar({ name, email, avatar, size = 'md', className = '' }: AvatarProps) {
  const getInitial = () => {
    if (name && name.trim()) {
      return name.trim().charAt(0).toUpperCase()
    }
    if (email) {
      return email.charAt(0).toUpperCase()
    }
    return '?'
  }

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl'
  }

  const getColorFromLetter = (letter: string) => {
    const colors = [
      'bg-red-500',
      'bg-blue-500', 
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-cyan-500',
      'bg-orange-500',
      'bg-emerald-500'
    ]
    
    const charCode = letter.charCodeAt(0)
    return colors[charCode % colors.length]
  }

  const initial = getInitial()
  const bgColor = getColorFromLetter(initial)

  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    setImageError(false)
  }, [avatar])

  if (avatar && avatar.trim() && avatar !== 'null' && avatar !== 'undefined' && !imageError) {
    return (
      <motion.div
        className={`
          ${sizeClasses[size]} 
          rounded-full 
          overflow-hidden
          flex 
          items-center 
          justify-center 
          shadow-lg
          ${className}
        `}
        style={{ lineHeight: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2 }}
        key={avatar}
      >
        <img
          src={avatar}
          alt={name || email || 'Avatar'}
          className="w-full h-full object-cover"
          onError={() => {
            setImageError(true)
          }}
          loading="lazy"
        />
      </motion.div>
    )
  }

  return (
    <motion.div
      className={`
        ${sizeClasses[size]} 
        ${bgColor} 
        rounded-full 
        flex 
        items-center 
        justify-center 
        text-white 
        font-nothing 
        font-bold 
        tracking-wider
        shadow-lg
        ${className}
      `}
      style={{ lineHeight: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <span className="flex items-center justify-center w-full h-full">{initial}</span>
    </motion.div>
  )
}