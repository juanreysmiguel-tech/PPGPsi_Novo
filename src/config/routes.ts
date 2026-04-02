import type { Role } from '@/types'

export interface RouteConfig {
  path: string
  label: string
  icon: string
  roles: Role[]
}

export const ROUTES: RouteConfig[] = [
  { path: '/', label: 'Inicio', icon: 'Home', roles: ['Discente', 'Docente', 'Secretaria', 'Coordenacao', 'CG'] },
  { path: '/solicitacoes', label: 'Solicitacoes', icon: 'FileText', roles: ['Secretaria', 'Coordenacao'] },
  { path: '/reunioes', label: 'Reunioes', icon: 'Calendar', roles: ['Secretaria', 'Coordenacao'] },
  { path: '/financeiro', label: 'Financeiro', icon: 'DollarSign', roles: ['Secretaria', 'Coordenacao', 'CG'] },
  { path: '/parecer', label: 'Parecer CG', icon: 'ClipboardCheck', roles: ['CG'] },
  { path: '/usuarios', label: 'Usuarios', icon: 'Users', roles: ['Secretaria', 'Coordenacao'] },
  { path: '/arquivo', label: 'Arquivo', icon: 'Archive', roles: ['Secretaria', 'Coordenacao'] },
  { path: '/defesa', label: 'Defesa', icon: 'GraduationCap', roles: ['Discente'] },
  { path: '/ppgpsiu', label: 'PPGPsiu', icon: 'BookOpen', roles: ['Discente', 'Docente'] },
  { path: '/mural', label: 'Mural', icon: 'MessageSquare', roles: ['Discente', 'Docente', 'Secretaria', 'Coordenacao', 'CG'] },
  { path: '/ajuda', label: 'Ajuda', icon: 'HelpCircle', roles: ['Discente', 'Docente', 'Secretaria', 'Coordenacao', 'CG'] },
  { path: '/notificacoes', label: 'Notificacoes', icon: 'Bell', roles: ['Discente', 'Docente', 'Secretaria', 'Coordenacao', 'CG'] },
]

export function getRoutesForRole(role: Role): RouteConfig[] {
  return ROUTES.filter((r) => r.roles.includes(role))
}
