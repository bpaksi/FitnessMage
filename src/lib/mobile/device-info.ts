import { UAParser } from 'ua-parser-js'

export interface DeviceInfo {
  device_name: string
  device_type: 'phone' | 'tablet' | 'unknown'
  device_info: Record<string, unknown>
}

export function collectDeviceInfo(): DeviceInfo {
  const result = UAParser(navigator.userAgent)

  // navigator.userAgentData reports the real platform even during DevTools
  // device emulation, so prefer it over the UA string when available.
  const uaData = (navigator as unknown as {
    userAgentData?: { platform?: string; mobile?: boolean }
  }).userAgentData
  const realPlatform = uaData?.platform // e.g. "macOS", "Windows", "Android"

  const vendor = result.device.vendor || ''
  const model = result.device.model || ''
  const os = result.os.name || ''

  // Build device_name from vendor + model, fallback to OS name
  let device_name = [vendor, model].filter(Boolean).join(' ').trim()
  if (!device_name) {
    device_name = os || 'Mobile Device'
  }

  // If userAgentData reveals a desktop platform but UA parsed as a mobile
  // device (e.g. DevTools emulation), correct to the real platform name.
  const desktopPlatforms = ['macOS', 'Windows', 'Linux', 'ChromeOS']
  if (realPlatform && desktopPlatforms.includes(realPlatform) && result.device.type === 'mobile') {
    device_name = `${realPlatform} (browser)`
  }

  // Determine device_type
  let device_type: DeviceInfo['device_type'] = 'unknown'
  if (realPlatform && desktopPlatforms.includes(realPlatform)) {
    device_type = 'unknown'
  } else {
    const uaDeviceType = result.device.type
    if (uaDeviceType === 'mobile') {
      device_type = 'phone'
    } else if (uaDeviceType === 'tablet') {
      device_type = 'tablet'
    } else if (uaData?.mobile !== undefined) {
      device_type = uaData.mobile ? 'phone' : 'unknown'
    } else {
      // Screen-size heuristic: tablets typically have min dimension > 600px
      const minDim = Math.min(screen.width, screen.height)
      if (minDim > 600) {
        device_type = 'tablet'
      } else if ('ontouchstart' in window) {
        device_type = 'phone'
      }
    }
  }

  // Collect raw device info
  const nav = navigator as unknown as Record<string, unknown>
  const conn = (navigator as unknown as { connection?: Record<string, unknown> }).connection
  const device_info: Record<string, unknown> = {
    ua: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screen_width: screen.width,
    screen_height: screen.height,
    pixel_ratio: window.devicePixelRatio,
    touch_points: navigator.maxTouchPoints,
    color_depth: screen.colorDepth,
    hardware_concurrency: nav['hardwareConcurrency'],
    device_memory: nav['deviceMemory'],
    connection_type: conn?.effectiveType,
    ua_brands: (uaData as unknown as { brands?: unknown[] } | undefined)?.brands,
    os: `${result.os.name || ''} ${result.os.version || ''}`.trim(),
    browser: `${result.browser.name || ''} ${result.browser.version || ''}`.trim(),
  }

  return { device_name, device_type, device_info }
}
