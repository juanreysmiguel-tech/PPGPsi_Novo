import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Timestamp } from 'firebase/firestore'

export function formatDate(date: Date | Timestamp | string | undefined): string {
  if (!date) return '-'
  try {
    const d = date instanceof Date ? date : typeof date === 'string' ? new Date(date) : date.toDate()
    return format(d, 'dd/MM/yyyy', { locale: ptBR })
  } catch {
    return '-'
  }
}

export function formatDateTime(date: Date | Timestamp | string | undefined): string {
  if (!date) return '-'
  try {
    const d = date instanceof Date ? date : typeof date === 'string' ? new Date(date) : date.toDate()
    return format(d, "dd/MM/yyyy 'as' HH:mm", { locale: ptBR })
  } catch {
    return '-'
  }
}

export function formatRelativeDate(date: Date | Timestamp | string | undefined): string {
  if (!date) return '-'
  try {
    const d = date instanceof Date ? date : typeof date === 'string' ? new Date(date) : date.toDate()
    return formatDistanceToNow(d, { addSuffix: true, locale: ptBR })
  } catch {
    return '-'
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function daysUntil(date: Date | Timestamp | string | undefined): number | null {
  if (!date) return null
  try {
    const d = date instanceof Date ? date : typeof date === 'string' ? new Date(date) : date.toDate()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    d.setHours(0, 0, 0, 0)
    return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  } catch {
    return null
  }
}
