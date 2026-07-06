import { format, formatDistanceToNowStrict } from 'date-fns'
import { vi } from 'date-fns/locale'
import { FEE_FIRST_HOUR, FEE_NEXT_HOUR } from '@/lib/constants'

export function calculateFee(durationMinutes: number): number {
  if (durationMinutes <= 0) return 0
  if (durationMinutes <= 60) return FEE_FIRST_HOUR
  const extraHours = Math.ceil((durationMinutes - 60) / 60)
  return FEE_FIRST_HOUR + extraHours * FEE_NEXT_HOUR
}

export function formatVND(amount: number): string {
  return `${new Intl.NumberFormat('vi-VN').format(amount)}đ`
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h} giờ ${m} phút` : `${m} phút`
}

export function formatTime(value: string | Date): string {
  return format(new Date(value), 'HH:mm dd/MM', { locale: vi })
}

export function formatClock(value: Date): string {
  return format(value, 'HH:mm:ss - dd/MM/yyyy')
}

export function liveDurationSince(value: string): string {
  return formatDistanceToNowStrict(new Date(value), { locale: vi, roundingMethod: 'floor' })
}
