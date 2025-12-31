'use client'

import { ReactNode } from 'react'
import { AuthProvider } from '@/hooks/useAuth'
import { PrivacyProvider } from '@/contexts/privacyContext'
import { ThemeProvider } from '@/hooks/useTheme'
import { DebuggerProvider } from '@/contexts/debuggerContext'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <PrivacyProvider>
        <ThemeProvider>
          <DebuggerProvider>
            {children}
          </DebuggerProvider>
        </ThemeProvider>
      </PrivacyProvider>
    </AuthProvider>
  )
}