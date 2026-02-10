'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { apiClient } from '@/lib/mobile/api-client'
import type { UserSettings } from '@/lib/types/settings'

function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

interface MobileContextValue {
  selectedDate: string
  setSelectedDate: (date: string) => void
  userSettings: UserSettings | null
  refreshSettings: () => Promise<void>
}

const MobileContext = createContext<MobileContextValue | null>(null)

export function MobileProvider({ children }: { children: ReactNode }) {
  const [selectedDate, setSelectedDate] = useState(getTodayString)
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null)

  const refreshSettings = useCallback(async () => {
    try {
      const data = await apiClient<UserSettings>('/api/settings')
      setUserSettings(data)
    } catch {
      // Will redirect to /link if unauthorized
    }
  }, [])

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await apiClient<UserSettings>('/api/settings')
        setUserSettings(data)
      } catch {
        // Will redirect to /link if unauthorized
      }
    }
    loadSettings()
  }, [])

  return (
    <MobileContext.Provider value={{ selectedDate, setSelectedDate, userSettings, refreshSettings }}>
      {children}
    </MobileContext.Provider>
  )
}

export function useMobileContext() {
  const ctx = useContext(MobileContext)
  if (!ctx) throw new Error('useMobileContext must be used within MobileProvider')
  return ctx
}
