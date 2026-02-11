'use client'

import { Smartphone, Tablet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { QrLinkDialog } from '@/components/web/qr-link-dialog'

interface DeviceToken {
  id: string
  device_name: string
  device_type: string | null
  created_at: string
  last_active_at: string
  revoked: boolean
}

interface LinkedDevicesSectionProps {
  devices: DeviceToken[]
  qrOpen: boolean
  onQrOpenChange: (open: boolean) => void
  onRevoke: (id: string) => void
  onDelete: (id: string) => void
  onDeviceLinked: () => void
}

export function LinkedDevicesSection({
  devices,
  qrOpen,
  onQrOpenChange,
  onRevoke,
  onDelete,
  onDeviceLinked,
}: LinkedDevicesSectionProps) {
  return (
    <>
      <Card className="border-[#1e293b] bg-[#0f172a]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base text-[#f8fafc]">Linked Devices</CardTitle>
          {devices.length > 0 && (
            <Button
              onClick={() => onQrOpenChange(true)}
              className="bg-[#3b82f6] text-white hover:bg-[#2563eb]"
            >
              Link New Device
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {devices.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <Smartphone className="h-10 w-10 text-[#64748b]" />
              <p className="text-sm text-[#64748b]">No linked devices</p>
              <Button
                onClick={() => onQrOpenChange(true)}
                className="bg-[#3b82f6] text-white hover:bg-[#2563eb]"
              >
                Link a Device
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {devices.map((device) => {
                const DeviceIcon = device.device_type === 'tablet' ? Tablet : Smartphone
                return (
                  <div
                    key={device.id}
                    className="flex items-center justify-between rounded-md border border-[#1e293b] p-3"
                  >
                    <div className="flex items-center gap-3">
                      <DeviceIcon className="h-4 w-4 shrink-0 text-[#64748b]" />
                      <div>
                        <p className="text-sm text-[#f8fafc]">{device.device_name}</p>
                        <p className="text-xs text-[#64748b]">
                          Last active: {new Date(device.last_active_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {device.revoked ? (
                        <Badge variant="secondary" className="bg-[#1e293b] text-[#64748b]">
                          Revoked
                        </Badge>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onRevoke(device.id)}
                          className="border-[#1e293b] text-[#94a3b8] hover:bg-[#1e293b]"
                        >
                          Revoke
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(device.id)}
                        className="text-red-400 hover:bg-red-500/10 hover:text-red-400"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
      <QrLinkDialog
        open={qrOpen}
        onOpenChange={onQrOpenChange}
        trigger={null}
        onDeviceLinked={onDeviceLinked}
      />
    </>
  )
}
