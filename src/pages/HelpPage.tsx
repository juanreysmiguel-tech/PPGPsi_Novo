import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getHelpArticles } from '@/services/firestore'
import { useAuthStore } from '@/stores/authStore'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { AccordionItem } from '@/components/ui/Accordion'
import { EmptyState } from '@/components/ui/EmptyState'
import { HelpCircle, Search, BookOpen, Clock, Phone, FileText } from 'lucide-react'

export function HelpPage() {
  const { currentRole } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')

  const { data: articles, isLoading } = useQuery({
    queryKey: ['helpArticles', currentRole],
    queryFn: () => getHelpArticles(currentRole ?? undefined),
    staleTime: 10 * 60 * 1000,
  })

  const filtered = (articles ?? []).filter((a) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      (a.titulo?.toLowerCase().includes(q) ?? false) ||
      (a.tipoSolicitacao?.toLowerCase().includes(q) ?? false) ||
      (a.passoAPasso?.toLowerCase().includes(q) ?? false)
    )
  })

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-800 flex items-center gap-2">
          <HelpCircle className="h-6 w-6 text-primary" />
          Central de Ajuda
        </h1>
        <p className="text-gray-500">Encontre orientacoes sobre como usar o sistema.</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar artigos de ajuda..."
          className="w-full rounded-xl border border-gray-300 pl-10 pr-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
        />
      </div>

      {/* Articles */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="Nenhum artigo encontrado" description="Tente outra busca ou entre em contato com a secretaria." />
      ) : (
        <div className="space-y-3">
          {filtered.map((article) => (
            <Card key={article.id}>
              <AccordionItem
                title={article.titulo}
                badge={<Badge variant="info">{article.tipoSolicitacao || 'Geral'}</Badge>}
              >
                <div className="space-y-4 text-sm">
                  {article.quandoUsar && (
                    <Section icon={<BookOpen className="h-4 w-4" />} title="Quando usar">
                      {article.quandoUsar}
                    </Section>
                  )}
                  {article.passoAPasso && (
                    <Section icon={<FileText className="h-4 w-4" />} title="Passo a passo">
                      <div className="whitespace-pre-wrap">{article.passoAPasso}</div>
                    </Section>
                  )}
                  {article.prazo && (
                    <Section icon={<Clock className="h-4 w-4" />} title="Prazo">
                      {article.prazo}
                    </Section>
                  )}
                  {article.contato && (
                    <Section icon={<Phone className="h-4 w-4" />} title="Contato">
                      {article.contato}
                    </Section>
                  )}
                  {article.faq && (
                    <Section icon={<HelpCircle className="h-4 w-4" />} title="Perguntas Frequentes">
                      <div className="whitespace-pre-wrap">{article.faq}</div>
                    </Section>
                  )}
                  {article.baseLegal && (
                    <Section icon={<FileText className="h-4 w-4" />} title="Base Legal">
                      {article.baseLegal}
                    </Section>
                  )}
                </div>
              </AccordionItem>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <h5 className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase mb-1">
        {icon} {title}
      </h5>
      <div className="text-gray-700">{children}</div>
    </div>
  )
}
