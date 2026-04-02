import { useNotifications, useMarkAsRead, useMarkAllAsRead, useUnreadCount } from '@/hooks/useNotifications'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatRelativeDate } from '@/lib/utils'
import { cn } from '@/lib/cn'
import type { Notification } from '@/types'
import { Bell, CheckCheck, FileText, DollarSign, AlertCircle, Info } from 'lucide-react'

const TYPE_ICONS: Record<string, React.ReactNode> = {
  aprovado: <FileText className="h-4 w-4 text-emerald-500" />,
  aprovado_cg: <DollarSign className="h-4 w-4 text-emerald-500" />,
  reprovado: <AlertCircle className="h-4 w-4 text-red-500" />,
  elucidacao: <Info className="h-4 w-4 text-amber-500" />,
}

export function NotificationsPage() {
  const { data: notifications, isLoading } = useNotifications(100)
  const { data: unreadCount } = useUnreadCount()
  const markRead = useMarkAsRead()
  const markAllRead = useMarkAllAsRead()

  const handleMarkRead = (id: string) => {
    markRead.mutate(id)
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-800 flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            Notificacoes
            {(unreadCount ?? 0) > 0 && (
              <Badge variant="danger">{unreadCount}</Badge>
            )}
          </h1>
        </div>
        {(unreadCount ?? 0) > 0 && (
          <Button variant="ghost" size="sm" onClick={() => markAllRead.mutate()} loading={markAllRead.isPending}>
            <CheckCheck className="h-4 w-4" /> Marcar todas como lidas
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : !notifications || notifications.length === 0 ? (
        <EmptyState title="Sem notificacoes" description="Voce nao tem notificacoes." />
      ) : (
        <div className="space-y-2">
          {notifications.map((notif: Notification) => (
            <Card
              key={notif.id}
              className={cn(
                'transition-all cursor-pointer',
                !notif.lido && 'border-l-4 border-l-primary bg-primary/5',
              )}
              onClick={() => !notif.lido && handleMarkRead(notif.id)}
            >
              <CardBody className="p-4 flex items-start gap-3">
                <div className="mt-0.5">
                  {TYPE_ICONS[notif.tipo] ?? <Bell className="h-4 w-4 text-gray-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={cn('text-sm', !notif.lido ? 'font-semibold text-gray-800' : 'text-gray-600')}>
                      {notif.titulo}
                    </h4>
                    <span className="text-xs text-gray-400 shrink-0">{formatRelativeDate(notif.data)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.mensagem}</p>
                </div>
                {!notif.lido && (
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
