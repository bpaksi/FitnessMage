'use client'

import { Smartphone } from 'lucide-react'
import { QrLinkDialog } from '@/components/web/qr-link-dialog'
import { Button } from '@/components/ui/button'

export function NoDevicesBanner() {
  return (
    <div className="mb-6 flex items-center justify-between rounded-lg border border-[#1e293b] bg-[#0f172a] px-4 py-3">
      <div className="flex items-center gap-3">
        <Smartphone className="h-5 w-5 text-[#3b82f6]" />
        <p className="text-sm text-[#94a3b8]">
          No linked devices.{' '}
          <span className="text-[#64748b]">Link your phone to log meals on the go.</span>
        </p>
      </div>
      <QrLinkDialog
        trigger={
          <Button className="shrink-0 bg-[#3b82f6] text-sm font-medium text-white hover:bg-[#2563eb]">
            Link a Device
          </Button>
        }
      />
    </div>
  )
}
