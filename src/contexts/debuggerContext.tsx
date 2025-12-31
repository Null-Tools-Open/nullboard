'use client'

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface DebuggerContextType {
  debugView: boolean
  setDebugView: (enabled: boolean) => void
  debViewAlw: boolean
  setDebViewAlw: (enabled: boolean) => void
}

const DebuggerContext = createContext<DebuggerContextType | undefined>(undefined)

export function DebuggerProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [debugView, setDebugView] = useState(user?.debView || false)
  const [debViewAlw, setDebViewAlw] = useState(user?.debViewAlw || false)
  const lastUserDebViewRef = useRef<boolean | undefined>(user?.debView)
  const lastUserDebViewAlwRef = useRef<boolean | undefined>(user?.debViewAlw)

  useEffect(() => {
    if (user?.debView !== undefined && user.debView !== lastUserDebViewRef.current) {
      setDebugView(user.debView)
      lastUserDebViewRef.current = user.debView
    }
    if (user?.debViewAlw !== undefined && user.debViewAlw !== lastUserDebViewAlwRef.current) {
      setDebViewAlw(user.debViewAlw)
      lastUserDebViewAlwRef.current = user.debViewAlw
    }
  }, [user?.debView, user?.debViewAlw])

  return (
    <DebuggerContext.Provider value={{
      debugView,
      setDebugView,
      debViewAlw,
      setDebViewAlw
    }}>
      {children}
    </DebuggerContext.Provider>
  )
}

export function useDebugger() {
  const context = useContext(DebuggerContext)
  if (context === undefined) {
    return {
      debugView: false,
      setDebugView: () => { },
      debViewAlw: false,
      setDebViewAlw: () => { }
    }
  }
  return context
}