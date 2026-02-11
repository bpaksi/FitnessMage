'use client'

import { useState, useCallback, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { CheckCircle2, XCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

const VALID_CHARS = /[ABCDEFGHJKMNPQRSTUVWXYZ23456789]/g

interface QrLinkDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode | null
  onDeviceLinked?: () => void
}

export function QrLinkDialog({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  trigger,
  onDeviceLinked,
}: QrLinkDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [codeInput, setCodeInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [linked, setLinked] = useState(false)
  const [linkedName, setLinkedName] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const open = controlledOpen ?? internalOpen
  const setOpen = controlledOnOpenChange ?? setInternalOpen

  const resetState = useCallback(() => {
    setCodeInput('')
    setSubmitting(false)
    setLinked(false)
    setLinkedName('')
    setErrorMsg('')
  }, [])

  function handleCodeChange(value: string) {
    const filtered = value.toUpperCase().match(VALID_CHARS)?.join('') || ''
    setCodeInput(filtered.slice(0, 6))
    setErrorMsg('')
  }

  async function handleSubmit() {
    if (codeInput.length !== 6) return
    setSubmitting(true)
    setErrorMsg('')

    try {
      const res = await fetch('/api/auth/pairing/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeInput }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to link device')
        setSubmitting(false)
        return
      }

      setLinked(true)
      setLinkedName(data.device_name || 'Mobile Device')
      onDeviceLinked?.()
      setTimeout(() => {
        setOpen(false)
        resetState()
      }, 1500)
    } catch {
      setErrorMsg('Network error. Please try again.')
      setSubmitting(false)
    }
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) return
    setOpen(isOpen)
  }

  function handleClose() {
    setOpen(false)
    if (linked) onDeviceLinked?.()
    resetState()
  }

  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : ''
  const linkUrl = `${baseUrl}/link`

  const displayCode = codeInput.length > 3
    ? `${codeInput.slice(0, 3)} ${codeInput.slice(3)}`
    : codeInput

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger !== null && (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button className="bg-[#3b82f6] text-white hover:bg-[#2563eb]">Link New Device</Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent
        className="border-[#1e293b] bg-[#0f172a] sm:max-w-md"
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-[#f8fafc]">Link Mobile Device</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          {linked ? (
            <>
              <CheckCircle2 className="h-16 w-16 text-[#22c55e]" />
              <p className="text-center text-sm text-[#f8fafc]">
                {linkedName} linked successfully!
              </p>
            </>
          ) : (
            <>
              {/* QR Code */}
              <div className="rounded-xl bg-white p-4">
                <QRCodeSVG value={linkUrl} size={160} />
              </div>
              <p className="text-center text-sm text-[#64748b]">
                Scan with your phone to install the app
              </p>

              <Separator className="bg-[#1e293b]" />

              {/* Code input */}
              <div className="w-full space-y-3">
                <p className="text-center text-sm text-[#94a3b8]">
                  Then enter the code from your phone
                </p>
                <Input
                  ref={inputRef}
                  value={displayCode}
                  onChange={(e) => handleCodeChange(e.target.value.replace(/\s/g, ''))}
                  placeholder="ABC 123"
                  maxLength={7}
                  className="border-[#1e293b] bg-[#020817] text-center font-mono text-lg tracking-[0.2em] text-[#f8fafc] uppercase placeholder:text-[#334155] placeholder:tracking-[0.2em]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && codeInput.length === 6) handleSubmit()
                  }}
                />
                {errorMsg && (
                  <div className="flex items-center justify-center gap-2">
                    <XCircle className="h-4 w-4 text-red-400" />
                    <p className="text-sm text-red-400">{errorMsg}</p>
                  </div>
                )}
                <Button
                  onClick={handleSubmit}
                  disabled={codeInput.length !== 6 || submitting}
                  className="w-full bg-[#3b82f6] text-white hover:bg-[#2563eb] disabled:opacity-50"
                >
                  {submitting ? 'Linking...' : 'Link Device'}
                </Button>
              </div>
            </>
          )}
        </div>
        {!linked && (
          <DialogFooter>
            <Button
              variant="outline"
              className="w-full border-[#1e293b] text-[#f8fafc] hover:bg-[#1e293b]"
              onClick={handleClose}
            >
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
