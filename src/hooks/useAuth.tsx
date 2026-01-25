'use client'
import { useState, useEffect, createContext, useContext, ReactNode, FC } from 'react'
import { secureFetch } from '@/lib/crypto'

interface User {
  id: string
  email: string
  name?: string
  avatar?: string | null
  isPremium: boolean
  isPremiumBoard?: boolean
  premiumTierBoard?: string
  twoFactorEnabled?: boolean
  isNullBoardTeam?: boolean
  nullBoardTeamRole?: string
  userAcceptedCookies?: boolean
  userHideProfileInfo?: boolean
  cloudSyncEnabled?: boolean
  animTurnedOff?: boolean
  debView?: boolean
  debViewAlw?: boolean
  colabCursors?: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (user: User) => void
  logout: () => Promise<void>
  updateUser: (user: User) => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    let retryCount = 0
    const MAX_RETRIES = 2
    const RETRY_DELAY = 500

    const checkAuth = async (isRetry = false): Promise<void> => {
      try {
        const response = await secureFetch('/api/auth/me', {
          method: 'GET',
        })

        if (!isMounted) return

        if (response.ok) {
          const data = await response.json()
          if (isMounted) {
            setUser(data.user)
            setIsLoading(false)
          }
        } else {
          if (response.status === 401 && !isRetry && retryCount < MAX_RETRIES) {
            retryCount++
            setTimeout(() => {
              if (isMounted) {
                checkAuth(true)
              }
            }, RETRY_DELAY)
            return
          }

          if (isMounted) {
            setUser(null)
            setIsLoading(false)
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)

        if (!isRetry && retryCount < MAX_RETRIES) {
          retryCount++
          setTimeout(() => {
            if (isMounted) {
              checkAuth(true)
            }
          }, RETRY_DELAY)
          return
        }

        if (isMounted) {
          setUser(null)
          setIsLoading(false)
        }
      }
    }

    checkAuth()

    return () => {
      isMounted = false
    }
  }, [])

  const login = (userData: User) => {
    setUser(userData)
  }

  const logout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Logout failed')
      }

      setUser(null)

      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error) {
      console.error('Logout failed:', error)
      setUser(null)
      throw error
    }
  }

  const updateUser = (userData: User) => {
    setUser(userData)
  }

  const refreshUser = async () => {
    try {
      const response = await secureFetch('/api/auth/me', {
        method: 'GET',
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Failed to refresh user:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function useAuthState() {
  return useAuth()
}