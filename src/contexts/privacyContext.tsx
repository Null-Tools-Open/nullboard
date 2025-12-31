'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { secureFetch } from '@/lib/crypto'

interface PrivacyContextType {
  hidePersonalInfo: boolean
  setHidePersonalInfo: (hide: boolean) => void
  blurEmail: (email: string) => string
  blurName: (name: string) => string
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined)

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const { user, isLoading, updateUser, refreshUser } = useAuth()
  const [hidePersonalInfo, setHidePersonalInfo] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (isLoading) return
    
    if (user && user.userHideProfileInfo !== undefined) {
      setHidePersonalInfo(user.userHideProfileInfo)
    } else {
      setHidePersonalInfo(false)
    }
  }, [user, isLoading])

  const handleSetHidePersonalInfo = async (value: boolean) => {
    if (isUpdating) return
    
    setHidePersonalInfo(value)
    setIsUpdating(true)
    
    try {
      const encrypted = await import('@/lib/crypto').then(m => m.encryptData({ userHideProfileInfo: value }))
      const response = await secureFetch('/api/user/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ encrypted }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.user) {
          updateUser(data.user)
        } else {
          await refreshUser()
        }
      } else {
        setHidePersonalInfo(!value)
      }
    } catch (error) {
      console.error('Failed to update hide profile info:', error)
      setHidePersonalInfo(!value)
    } finally {
      setIsUpdating(false)
    }
  }

  const blurEmail = (email: string) => {
    if (!hidePersonalInfo) return email
    return email
  }

  const blurName = (name: string) => {
    if (!hidePersonalInfo || !name) return name
    return name
  }

  return (
    <PrivacyContext.Provider value={{
      hidePersonalInfo,
      setHidePersonalInfo: handleSetHidePersonalInfo,
      blurEmail,
      blurName
    }}>
      {children}
    </PrivacyContext.Provider>
  )
}

export function usePrivacy() {
  const context = useContext(PrivacyContext)
  if (context === undefined) {
    throw new Error('usePrivacy must be used within a PrivacyProvider')
  }
  return context
}