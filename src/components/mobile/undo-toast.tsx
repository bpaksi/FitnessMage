'use client'

import { toast } from 'sonner'
import { apiClient } from '@/lib/mobile/api-client'

export function showUndoToast(entryId: string, foodName: string, onUndo: () => void) {
  toast(`Added ${foodName}`, {
    duration: 5000,
    action: {
      label: 'Undo',
      onClick: async () => {
        await apiClient(`/api/log/${entryId}`, { method: 'DELETE' })
        onUndo()
      },
    },
  })
}
