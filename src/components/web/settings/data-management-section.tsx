'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { DeleteConfirmationDialog } from './delete-confirmation-dialog'

interface DataManagementSectionProps {
  onDeleteAllData: () => void
  onDeleteAccount: () => void
}

export function DataManagementSection({
  onDeleteAllData,
  onDeleteAccount,
}: DataManagementSectionProps) {
  const [deleteAllOpen, setDeleteAllOpen] = useState(false)
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false)

  return (
    <>
      <Card className="border-[#1e293b] bg-[#0f172a]">
        <CardHeader>
          <CardTitle className="text-base text-[#f8fafc]">Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="border-[#1e293b] text-[#94a3b8] hover:bg-[#1e293b]"
          >
            Export Data
          </Button>
          <Separator className="bg-[#1e293b]" />
          <div className="space-y-3">
            <Button
              variant="outline"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              onClick={() => setDeleteAllOpen(true)}
            >
              Delete All Data
            </Button>
            <Button
              variant="outline"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              onClick={() => setDeleteAccountOpen(true)}
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      <DeleteConfirmationDialog
        open={deleteAllOpen}
        onOpenChange={setDeleteAllOpen}
        title="Delete All Data?"
        description="This will permanently delete all your food logs, custom foods, and settings. This action cannot be undone."
        confirmButtonText="Delete Everything"
        onConfirm={onDeleteAllData}
      />

      <DeleteConfirmationDialog
        open={deleteAccountOpen}
        onOpenChange={setDeleteAccountOpen}
        title="Delete Account?"
        description="This will permanently delete your account and all associated data. This action cannot be undone."
        confirmButtonText="Delete Account"
        onConfirm={onDeleteAccount}
      />
    </>
  )
}
