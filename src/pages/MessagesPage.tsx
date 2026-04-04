import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/stores/authStore'
import { useAllUsers } from '@/hooks/useUser'
import { subscribeToUserMessages, sendMessage, type ChatMessage } from '@/services/firestore/messages'
import { Send, User as UserIcon, MessageSquare, Search } from 'lucide-react'
import { cn } from '@/lib/cn'

export function MessagesPage() {
  const { userProfile: me } = useAuthStore()
  const { data: users } = useAllUsers()
  
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [activeContactId, setActiveContactId] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!me?.id) return
    const unsubscribe = subscribeToUserMessages(me.id, setMessages)
    return () => unsubscribe()
  }, [me?.id])

  // Group contacts based on messages + people list
  const contacts = useMemo(() => {
    if (!users || !me) return []
    const withMessages = new Set<string>()
    messages.forEach(m => {
      withMessages.add(m.senderId === me.id ? m.receiverId : m.senderId)
    })
    
    // Sort so contacts with messages are first
    return users
      .filter(u => u.id !== me.id && u.nome.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        const aHas = withMessages.has(a.id) ? 1 : 0
        const bHas = withMessages.has(b.id) ? 1 : 0
        if (aHas !== bHas) return bHas - aHas
        return a.nome.localeCompare(b.nome)
      })
  }, [users, messages, me, search])

  const conversation = useMemo(() => {
    if (!activeContactId) return []
    return messages.filter(m => 
      (m.senderId === me?.id && m.receiverId === activeContactId) ||
      (m.receiverId === me?.id && m.senderId === activeContactId)
    )
  }, [messages, activeContactId, me?.id])

  const handleSend = async () => {
    if (!text.trim() || !activeContactId || !me) return
    
    const activeContact = users?.find(u => u.id === activeContactId)
    
    await sendMessage({
      senderId: me.id,
      senderName: me.nome,
      receiverId: activeContactId,
      receiverName: activeContact?.nome || 'Usuário',
      content: text.trim()
    })
    
    setText('')
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex rounded-2xl overflow-hidden border border-gray-200/60 bg-white shadow-xl isolate">
      {/* Sidebar Contacts */}
      <div className="w-80 border-r border-gray-100 bg-gray-50/50 flex flex-col backdrop-blur-md">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-xl font-heading font-bold text-gray-800 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Workspace
          </h2>
          <div className="mt-3 relative">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar pessoas..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50/50 p-2 space-y-1">
          {contacts.map(c => {
            const unread = messages.filter(m => m.senderId === c.id && m.receiverId === me?.id && !m.read).length
            const active = activeContactId === c.id
            return (
              <button
                key={c.id}
                onClick={() => setActiveContactId(c.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left",
                  active ? "bg-white shadow-sm ring-1 ring-gray-200" : "hover:bg-white/60"
                )}
              >
                <div className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm text-white",
                  active ? "bg-primary" : "bg-primary/60"
                )}>
                  {c.nome.charAt(0)}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-semibold text-gray-800 truncate">{c.nome}</p>
                  <p className="text-xs text-gray-500 truncate">{c.roles.join(', ')}</p>
                </div>
                {unread > 0 && (
                  <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {unread}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white bg-[url('https://www.transparenttextures.com/patterns/inspiration-geometry.png')] bg-opacity-5">
        {activeContactId ? (
          <>
            <div className="h-16 border-b border-gray-100 flex items-center px-6 bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <UserIcon className="h-5 w-5 text-gray-500" />
                <h3 className="font-semibold text-gray-800">
                  {users?.find(u => u.id === activeContactId)?.nome}
                </h3>
              </div>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {conversation.map(msg => {
                const isMe = msg.senderId === me?.id
                return (
                  <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-md px-4 py-2.5 rounded-2xl shadow-sm text-sm",
                      isMe 
                        ? "bg-primary text-white rounded-br-none" 
                        : "bg-white border border-gray-100 text-gray-800 rounded-bl-none"
                    )}>
                      {msg.content}
                      <p className={cn(
                        "text-[10px] mt-1 text-right",
                        isMe ? "text-white/70" : "text-gray-400"
                      )}>
                        {msg.createdAt?.toDate?.().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="p-4 bg-white/80 backdrop-blur-md border-t border-gray-100">
              <form 
                className="flex gap-2"
                onSubmit={e => { e.preventDefault(); handleSend() }}
              >
                <input
                  type="text"
                  placeholder="Digite sua mensagem..."
                  value={text}
                  onChange={e => setText(e.target.value)}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all duration-200"
                />
                <Button type="submit" variant="primary" className="rounded-full w-10 h-10 p-0 flex items-center justify-center">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm">
              <MessageSquare className="h-8 w-8 text-gray-400" />
            </div>
            <p className="font-medium text-gray-500">Selecione um contato para iniciar no Workspace</p>
          </div>
        )}
      </div>
    </div>
  )
}
