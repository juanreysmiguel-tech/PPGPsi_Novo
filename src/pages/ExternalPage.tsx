import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  GraduationCap,
  UserPlus,
  LogOut,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Clock,
  BookOpen,
  Globe,
  Award,
  ChevronRight,
  CheckCircle,
  Info,
} from 'lucide-react'
import { logoutUser } from '@/services/auth'

/* ---------------------------------------------------------------------------
   Placeholder data – replace with Firestore "eventos" collection fetch later
   --------------------------------------------------------------------------- */

interface ProcessoSeletivo {
  id: string
  titulo: string
  tipo: 'Mestrado' | 'Doutorado' | 'Mestrado e Doutorado'
  status: 'Aberto' | 'Em breve' | 'Encerrado'
  editalNumero: string
  dataInscricaoInicio: string
  dataInscricaoFim: string
  linkEdital: string
}

const PROCESSOS_SELETIVOS: ProcessoSeletivo[] = [
  {
    id: '1',
    titulo: 'Processo Seletivo Regular 2026 - Mestrado e Doutorado',
    tipo: 'Mestrado e Doutorado',
    editalNumero: 'Edital PPGPsi N. 01/2026',
    status: 'Aberto',
    dataInscricaoInicio: '01/03/2026',
    dataInscricaoFim: '30/04/2026',
    linkEdital: '#',
  },
  {
    id: '2',
    titulo: 'Processo Seletivo - Doutorado (Fluxo Continuo)',
    tipo: 'Doutorado',
    editalNumero: 'Edital PPGPsi N. 02/2026',
    status: 'Aberto',
    dataInscricaoInicio: '15/02/2026',
    dataInscricaoFim: '15/05/2026',
    linkEdital: '#',
  },
  {
    id: '3',
    titulo: 'Processo Seletivo Regular 2026/2 - Mestrado',
    tipo: 'Mestrado',
    editalNumero: 'Edital PPGPsi N. 03/2026',
    status: 'Em breve',
    dataInscricaoInicio: '01/07/2026',
    dataInscricaoFim: '31/08/2026',
    linkEdital: '#',
  },
]

const LINKS_UTEIS = [
  {
    titulo: 'Site do PPGPsi - UFSCar',
    url: 'https://www.ppgpsi.ufscar.br',
    descricao: 'Pagina oficial do Programa de Pos-Graduacao em Psicologia',
    icon: Globe,
  },
  {
    titulo: 'ProPGWeb - UFSCar',
    url: 'https://www.propgweb.ufscar.br',
    descricao: 'Sistema de Pos-Graduacao da UFSCar',
    icon: BookOpen,
  },
  {
    titulo: 'Plataforma Sucupira - CAPES',
    url: 'https://sucupira.capes.gov.br',
    descricao: 'Plataforma de coleta de dados da CAPES',
    icon: Award,
  },
  {
    titulo: 'Portal CAPES - Periodicos',
    url: 'https://www.periodicos.capes.gov.br',
    descricao: 'Acesso a periodicos e bases de dados cientificas',
    icon: FileText,
  },
  {
    titulo: 'ProPG - UFSCar',
    url: 'https://www.propg.ufscar.br',
    descricao: 'Pro-Reitoria de Pos-Graduacao da UFSCar',
    icon: GraduationCap,
  },
]

/* ---------------------------------------------------------------------------
   Helper: status badge variant
   --------------------------------------------------------------------------- */
function statusBadgeVariant(status: ProcessoSeletivo['status']) {
  switch (status) {
    case 'Aberto':
      return 'success'
    case 'Em breve':
      return 'warning'
    case 'Encerrado':
      return 'default'
  }
}

/* ---------------------------------------------------------------------------
   Component
   --------------------------------------------------------------------------- */

/**
 * Public-facing page for visitors and non-UFSCar users.
 * Replicated from the original Google Apps Script renderExternal (js.html).
 *
 * Shows: welcome header, processos seletivos, aluno especial info,
 *        useful links, contact info, and a login button.
 */
export function ExternalPage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* ===== Hero / Header ===== */}
      <header className="bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          <div className="flex flex-col items-center text-center animate-fade-in">
            <div className="w-20 h-20 mb-5 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
              <span className="font-heading font-bold text-4xl text-white">P</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold tracking-tight">
              PPGPsi - UFSCar
            </h1>
            <p className="text-primary-100 mt-2 text-lg max-w-xl">
              Programa de Pos-Graduacao em Psicologia
            </p>
            <p className="text-primary-200 mt-1 text-sm">
              Universidade Federal de Sao Carlos
            </p>

            {/* Login CTA */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
              <Button
                variant="outline"
                size="lg"
                className="border-white/40 text-white hover:bg-white/10 hover:text-white"
                onClick={() => logoutUser()}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Entrar com conta UFSCar
              </Button>
            </div>
            <p className="text-primary-200 text-xs mt-3">
              Acesso restrito para e-mails @ufscar.br e @estudante.ufscar.br
            </p>
          </div>
        </div>
      </header>

      {/* ===== Main Content ===== */}
      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-10">

        {/* ----- Processos Seletivos ----- */}
        <section className="animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary-500" />
            </div>
            <div>
              <h2 className="text-2xl font-heading font-bold text-gray-800">
                Processos Seletivos
              </h2>
              <p className="text-sm text-gray-500">
                Editais abertos para Mestrado e Doutorado no PPGPsi
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {PROCESSOS_SELETIVOS.map((processo) => (
              <Card
                key={processo.id}
                className="hover:shadow-card-hover transition-shadow"
              >
                <CardBody className="p-5 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    {/* Left: Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant={statusBadgeVariant(processo.status)}>
                          {processo.status}
                        </Badge>
                        <Badge variant="primary">{processo.tipo}</Badge>
                      </div>
                      <h3 className="text-base md:text-lg font-heading font-semibold text-gray-800 mb-1">
                        {processo.titulo}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3">
                        {processo.editalNumero}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          Inscricoes: {processo.dataInscricaoInicio} a{' '}
                          {processo.dataInscricaoFim}
                        </span>
                        {processo.status === 'Aberto' && (
                          <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium">
                            <Clock className="h-4 w-4" />
                            Inscricoes abertas
                          </span>
                        )}
                        {processo.status === 'Em breve' && (
                          <span className="inline-flex items-center gap-1.5 text-amber-600 font-medium">
                            <Clock className="h-4 w-4" />
                            Em breve
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Action */}
                    <div className="flex-shrink-0">
                      <a
                        href={processo.linkEdital}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors shadow-sm"
                      >
                        <FileText className="h-4 w-4" />
                        Ver Edital (PDF)
                        <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                      </a>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>

        {/* ----- Two-column: Aluno Especial + Informacoes ----- */}
        <div className="grid lg:grid-cols-2 gap-6 animate-fade-in">

          {/* Aluno Especial */}
          <Card className="hover:shadow-card-hover transition-shadow border-l-4 border-l-secondary-500">
            <CardHeader className="bg-secondary-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary-100 flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-secondary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-heading font-bold text-secondary-600">
                    Aluno Especial
                  </h2>
                  <p className="text-sm text-gray-500">
                    Disciplinas isoladas para nao matriculados
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardBody className="p-5 md:p-6 space-y-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                O PPGPsi permite que profissionais e estudantes externos cursem disciplinas
                isoladas na modalidade de <strong>Aluno Especial</strong>. As vagas sao
                limitadas e dependem da disponibilidade em cada disciplina ofertada no semestre.
              </p>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  <Info className="h-4 w-4 text-secondary-500" />
                  Requisitos
                </h4>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {[
                    'Diploma de graduacao (copia autenticada)',
                    'Curriculo Lattes atualizado',
                    'Carta de intencao justificando a disciplina',
                    'Documento de identidade e CPF',
                    'Anuencia do docente responsavel pela disciplina',
                  ].map((req) => (
                    <li key={req} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-secondary-400 mt-0.5 flex-shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-800">
                  <strong>Atencao:</strong> O periodo de inscricao para Aluno Especial
                  geralmente coincide com o inicio de cada semestre letivo. Fique atento
                  aos prazos divulgados no site do programa.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full"
                  onClick={() =>
                    window.open('https://www.ppgpsi.ufscar.br', '_blank')
                  }
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Informacoes e Inscricao
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Links Uteis */}
          <Card className="hover:shadow-card-hover transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                  <ExternalLink className="h-5 w-5 text-primary-500" />
                </div>
                <div>
                  <h2 className="text-xl font-heading font-bold text-gray-800">
                    Links Uteis
                  </h2>
                  <p className="text-sm text-gray-500">
                    Recursos e portais importantes
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              <ul className="divide-y divide-border-light">
                {LINKS_UTEIS.map((link) => {
                  const Icon = link.icon
                  return (
                    <li key={link.titulo}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 transition-colors">
                          <Icon className="h-4 w-4 text-primary-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 group-hover:text-primary-600 transition-colors">
                            {link.titulo}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {link.descricao}
                          </p>
                        </div>
                        <ExternalLink className="h-3.5 w-3.5 text-gray-300 group-hover:text-primary-400 flex-shrink-0 transition-colors" />
                      </a>
                    </li>
                  )
                })}
              </ul>
            </CardBody>
          </Card>
        </div>

        {/* ----- Contato da Secretaria ----- */}
        <section className="animate-fade-in">
          <Card className="bg-gradient-to-r from-primary-50/80 to-white border-primary-100">
            <CardBody className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1">
                  <h2 className="text-xl font-heading font-bold text-primary-700 mb-1">
                    Secretaria do PPGPsi
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Duvidas sobre processos seletivos, matriculas ou informacoes gerais?
                    Entre em contato com a secretaria do programa.
                  </p>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5 text-sm text-gray-700">
                      <Mail className="h-4 w-4 text-primary-500 flex-shrink-0" />
                      <a
                        href="mailto:ppgpsi@ufscar.br"
                        className="hover:text-primary-600 hover:underline font-medium"
                      >
                        ppgpsi@ufscar.br
                      </a>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-gray-700">
                      <Phone className="h-4 w-4 text-primary-500 flex-shrink-0" />
                      <span>(16) 3351-8444</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-sm text-gray-700">
                      <MapPin className="h-4 w-4 text-primary-500 flex-shrink-0 mt-0.5" />
                      <span>
                        Rodovia Washington Luis, Km 235 - CEP 13565-905
                        <br />
                        Sao Carlos - SP, Brasil
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <a
                    href="mailto:ppgpsi@ufscar.br"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors shadow-sm"
                  >
                    <Mail className="h-4 w-4" />
                    Enviar E-mail
                  </a>
                </div>
              </div>
            </CardBody>
          </Card>
        </section>
      </main>

      {/* ===== Footer ===== */}
      <footer className="border-t border-border-light bg-white mt-8">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400 text-center sm:text-left">
              PPGPsi - Programa de Pos-Graduacao em Psicologia - UFSCar
            </p>
            <button
              onClick={() => logoutUser()}
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-primary-600 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sair / Trocar conta
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}
