import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useAuthStore } from '@/stores/authStore'
import type { Role } from '@/types'

const ROLE_LABELS: Record<Role, string> = {
  Externo: 'Visitante',
  Discente: 'Discente',
  Docente: 'Docente',
  Secretaria: 'Secretaria',
  Coordenacao: 'Coordenacao',
  CG: 'Conselho/CG',
}

const ROLE_COLORS: Record<Role, string> = {
  Externo: 'bg-gray-100 text-gray-600',
  Discente: 'bg-blue-100 text-blue-700',
  Docente: 'bg-purple-100 text-purple-700',
  Secretaria: 'bg-emerald-100 text-emerald-700',
  Coordenacao: 'bg-amber-100 text-amber-700',
  CG: 'bg-rose-100 text-rose-700',
}

export function RoleSwitcher() {
  const { roles, currentRole, switchRole } = useAuthStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (roles.length <= 1) {
    return (
      <span className={cn('px-3 py-1 rounded-full text-xs font-medium', ROLE_COLORS[currentRole])}>
        {ROLE_LABELS[currentRole]}
      </span>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
          ROLE_COLORS[currentRole],
          'hover:opacity-80',
        )}
      >
        {ROLE_LABELS[currentRole]}
        <ChevronDown className={cn('h-3 w-3 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-border-light py-1 z-50 animate-fade-in">
          <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase">
            Trocar perfil
          </div>
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => {
                switchRole(role)
                setOpen(false)
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
            >
              <span className={cn('px-2 py-0.5 rounded-full text-xs', ROLE_COLORS[role])}>
                {ROLE_LABELS[role]}
              </span>
              {role === currentRole && <Check className="h-3.5 w-3.5 text-success" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
