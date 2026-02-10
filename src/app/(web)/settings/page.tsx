'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Smartphone, Tablet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { QrLinkDialog } from '@/components/web/qr-link-dialog'
import type { UserSettings, MacroGoals, MealTimeBoundaries, WeekStartDay, Units } from '@/lib/types/settings'

interface DeviceToken {
  id: string
  device_name: string
  device_type: string | null
  created_at: string
  last_active_at: string
  revoked: boolean
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [devices, setDevices] = useState<DeviceToken[]>([])
  const [qrOpen, setQrOpen] = useState(false)
  const [goals, setGoals] = useState<MacroGoals>({ calories: 2000, protein: 150, carbs: 200, fat: 65 })
  const [weekStart, setWeekStart] = useState<WeekStartDay>('monday')
  const [units, setUnits] = useState<Units>('metric')
  const [mealTimes, setMealTimes] = useState<MealTimeBoundaries>({
    breakfast: { start: '06:00', end: '10:00' },
    lunch: { start: '11:00', end: '14:00' },
    dinner: { start: '17:00', end: '21:00' },
  })

  const fetchSettings = useCallback(async () => {
    const res = await fetch('/api/settings')
    if (res.ok) {
      const data: UserSettings = await res.json()
      setSettings(data)
      setGoals(data.goals)
      setWeekStart(data.week_start_day)
      setUnits(data.units)
      setMealTimes(data.meal_time_boundaries)
    }
  }, [])

  const fetchDevices = useCallback(async () => {
    const res = await fetch('/api/devices')
    if (res.ok) {
      const data: DeviceToken[] = await res.json()
      setDevices(data)
    }
  }, [])

  useEffect(() => {
    async function loadInitialData() {
      const settingsRes = await fetch('/api/settings')
      if (settingsRes.ok) {
        const data: UserSettings = await settingsRes.json()
        setSettings(data)
        setGoals(data.goals)
        setWeekStart(data.week_start_day)
        setUnits(data.units)
        setMealTimes(data.meal_time_boundaries)
      }
      const devicesRes = await fetch('/api/devices')
      if (devicesRes.ok) {
        const data: DeviceToken[] = await devicesRes.json()
        setDevices(data)
      }
    }
    loadInitialData()
  }, [])

  async function saveSettings(partial: Partial<UserSettings>) {
    const body = {
      goals: partial.goals ?? goals,
      week_start_day: partial.week_start_day ?? weekStart,
      units: partial.units ?? units,
      meal_time_boundaries: partial.meal_time_boundaries ?? mealTimes,
    }
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      toast.success('Settings saved')
      fetchSettings()
    } else {
      toast.error('Failed to save settings')
    }
  }

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

  function handleDeviceLinkedOrDialogClosed() {
    fetchDevices()
  }

  if (!settings) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#3b82f6] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-2xl font-light tracking-tight text-[#f8fafc]">Settings</h1>

      {/* Daily Goals */}
      <Card className="border-[#1e293b] bg-[#0f172a]">
        <CardHeader>
          <CardTitle className="text-base text-[#f8fafc]">Daily Goals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#94a3b8]">Calories</Label>
              <Input
                type="number"
                value={goals.calories}
                onChange={(e) => setGoals({ ...goals, calories: +e.target.value })}
                className="border-[#1e293b] bg-[#020817] text-[#f8fafc]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#94a3b8]">Protein (g)</Label>
              <Input
                type="number"
                value={goals.protein}
                onChange={(e) => setGoals({ ...goals, protein: +e.target.value })}
                className="border-[#1e293b] bg-[#020817] text-[#f8fafc]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#94a3b8]">Carbs (g)</Label>
              <Input
                type="number"
                value={goals.carbs}
                onChange={(e) => setGoals({ ...goals, carbs: +e.target.value })}
                className="border-[#1e293b] bg-[#020817] text-[#f8fafc]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#94a3b8]">Fat (g)</Label>
              <Input
                type="number"
                value={goals.fat}
                onChange={(e) => setGoals({ ...goals, fat: +e.target.value })}
                className="border-[#1e293b] bg-[#020817] text-[#f8fafc]"
              />
            </div>
          </div>
          <Button
            onClick={() => saveSettings({ goals })}
            className="bg-[#3b82f6] text-white hover:bg-[#2563eb]"
          >
            Save Goals
          </Button>
        </CardContent>
      </Card>

      {/* Linked Devices */}
      <Card className="border-[#1e293b] bg-[#0f172a]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base text-[#f8fafc]">Linked Devices</CardTitle>
          {devices.length > 0 && (
            <Button
              onClick={() => setQrOpen(true)}
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
                onClick={() => setQrOpen(true)}
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
                        onClick={() => revokeDevice(device.id)}
                        className="border-[#1e293b] text-[#94a3b8] hover:bg-[#1e293b]"
                      >
                        Revoke
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteDevice(device.id)}
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
      <QrLinkDialog open={qrOpen} onOpenChange={setQrOpen} trigger={null} onDeviceLinked={handleDeviceLinkedOrDialogClosed} />

      {/* Preferences */}
      <Card className="border-[#1e293b] bg-[#0f172a]">
        <CardHeader>
          <CardTitle className="text-base text-[#f8fafc]">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#94a3b8]">Week Starts On</Label>
              <Select
                value={weekStart}
                onValueChange={(val) => {
                  setWeekStart(val as WeekStartDay)
                  saveSettings({ week_start_day: val as WeekStartDay })
                }}
              >
                <SelectTrigger className="border-[#1e293b] bg-[#020817] text-[#f8fafc]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-[#1e293b] bg-[#0f172a]">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(
                    (day) => (
                      <SelectItem key={day} value={day} className="capitalize text-[#f8fafc]">
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[#94a3b8]">Units</Label>
              <Select
                value={units}
                onValueChange={(val) => {
                  setUnits(val as Units)
                  saveSettings({ units: val as Units })
                }}
              >
                <SelectTrigger className="border-[#1e293b] bg-[#020817] text-[#f8fafc]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-[#1e293b] bg-[#0f172a]">
                  <SelectItem value="metric" className="text-[#f8fafc]">Metric</SelectItem>
                  <SelectItem value="imperial" className="text-[#f8fafc]">Imperial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meal Time Boundaries */}
      <Card className="border-[#1e293b] bg-[#0f172a]">
        <CardHeader>
          <CardTitle className="text-base text-[#f8fafc]">Meal Time Boundaries</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(['breakfast', 'lunch', 'dinner'] as const).map((meal) => (
            <div key={meal} className="space-y-2">
              <Label className="capitalize text-[#94a3b8]">{meal}</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="time"
                  value={mealTimes[meal].start}
                  onChange={(e) =>
                    setMealTimes({
                      ...mealTimes,
                      [meal]: { ...mealTimes[meal], start: e.target.value },
                    })
                  }
                  className="border-[#1e293b] bg-[#020817] text-[#f8fafc]"
                />
                <span className="text-[#64748b]">to</span>
                <Input
                  type="time"
                  value={mealTimes[meal].end}
                  onChange={(e) =>
                    setMealTimes({
                      ...mealTimes,
                      [meal]: { ...mealTimes[meal], end: e.target.value },
                    })
                  }
                  className="border-[#1e293b] bg-[#020817] text-[#f8fafc]"
                />
              </div>
            </div>
          ))}
          <Button
            onClick={() => saveSettings({ meal_time_boundaries: mealTimes })}
            className="bg-[#3b82f6] text-white hover:bg-[#2563eb]"
          >
            Save Meal Times
          </Button>
        </CardContent>
      </Card>

      {/* Data Management */}
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  Delete All Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="border-[#1e293b] bg-[#0f172a]">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-[#f8fafc]">Delete All Data?</AlertDialogTitle>
                  <AlertDialogDescription className="text-[#64748b]">
                    This will permanently delete all your food logs, custom foods, and settings.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-[#1e293b] text-[#94a3b8]">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700">
                    Delete Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="border-[#1e293b] bg-[#0f172a]">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-[#f8fafc]">Delete Account?</AlertDialogTitle>
                  <AlertDialogDescription className="text-[#64748b]">
                    This will permanently delete your account and all associated data. This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-[#1e293b] text-[#94a3b8]">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700">
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
