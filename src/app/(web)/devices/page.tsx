'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { LinkedDevicesSection } from '@/components/web/settings/linked-devices-section'

interface DeviceToken {
  id: string
  device_name: string
  device_type: string | null
  created_at: string
  last_active_at: string
  revoked: boolean
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<DeviceToken[]>([])
  const [qrOpen, setQrOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchDevices = useCallback(async () => {
    const res = await fetch('/api/devices')
    if (res.ok) {
      const data: DeviceToken[] = await res.json()
      setDevices(data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void (async () => {
      const res = await fetch('/api/devices')
      if (res.ok) {
        const data: DeviceToken[] = await res.json()
        setDevices(data)
      }
      setLoading(false)
    })()
  }, [])

  async function revokeDevice(id: string) {
    await fetch(`/api/devices/${id}`, { method: 'PATCH' })
    fetchDevices()
    toast.success('Device revoked')
  }

  async function deleteDevice(id: string) {
    await fetch(`/api/devices/${id}`, { method: 'DELETE' })
    fetchDevices()
    toast.success('Device removed')
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#3b82f6] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <LinkedDevicesSection
        devices={devices}
        qrOpen={qrOpen}
        onQrOpenChange={setQrOpen}
        onRevoke={revokeDevice}
        onDelete={deleteDevice}
        onDeviceLinked={fetchDevices}
      />
    </div>
  )
}
