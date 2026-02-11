'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface DeleteConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmButtonText: string
  onConfirm: () => void
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmButtonText,
  onConfirm,
}: DeleteConfirmationDialogProps) {
  const [input, setInput] = useState('')
  const [prevOpen, setPrevOpen] = useState(open)
  if (prevOpen !== open) {
    setPrevOpen(open)
    if (!open) setInput('')
  }
  const confirmed = input === 'DELETE'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#1e293b] bg-[#0f172a]">
        <DialogHeader>
          <DialogTitle className="text-[#f8fafc]">{title}</DialogTitle>
          <DialogDescription className="text-[#64748b]">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <Label className="text-[#94a3b8]">
            Type &quot;DELETE&quot; to confirm
          </Label>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="DELETE"
            className="border-[#1e293b] bg-[#020817] text-[#f8fafc] placeholder:text-[#334155]"
            autoComplete="off"
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[#1e293b] text-[#94a3b8]"
          >
            Cancel
          </Button>
          <Button
            disabled={!confirmed}
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
            className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-40"
          >
            {confirmButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
