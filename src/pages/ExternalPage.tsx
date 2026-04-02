import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { GraduationCap, UserPlus, LogOut } from 'lucide-react'
import { logoutUser } from '@/services/auth'

/**
 * Page shown to visitors / non-UFSCar users.
 * Replicated from js.html renderExternal (line 536-554)
 */
export function ExternalPage() {
  return (
    <div className="min-h-screen bg-surface p-4 md:p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8 text-center animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-4 bg-primary-500 rounded-2xl flex items-center justify-center">
          <span className="text-white font-heading font-bold text-2xl">P</span>
        </div>
        <h1 className="text-3xl font-heading font-bold text-gray-800">PPGPsi - UFSCar</h1>
        <p className="text-gray-500 mt-2">Programa de Pos-Graduacao em Psicologia</p>
      </div>

      {/* Cards */}
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6 animate-fade-in">
        <Card className="hover:shadow-card-hover transition-shadow">
          <CardBody className="p-8 text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center mb-4">
              <GraduationCap className="h-7 w-7 text-primary-500" />
            </div>
            <h3 className="text-xl font-heading font-bold text-primary-500 mb-2">
              Processos Seletivos
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Acesse os editais abertos para Mestrado e Doutorado no PPGPsi.
            </p>
            <Button variant="primary" className="mt-auto">
              Ver Editais
            </Button>
          </CardBody>
        </Card>

        <Card className="hover:shadow-card-hover transition-shadow">
          <CardBody className="p-8 text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-xl bg-secondary-50 flex items-center justify-center mb-4">
              <UserPlus className="h-7 w-7 text-secondary-500" />
            </div>
            <h3 className="text-xl font-heading font-bold text-secondary-500 mb-2">
              Aluno Especial
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Inscricoes para cursar disciplinas isoladas neste semestre.
            </p>
            <Button variant="secondary" className="mt-auto">
              Inscreva-se
            </Button>
          </CardBody>
        </Card>
      </div>

      {/* Logout */}
      <div className="max-w-4xl mx-auto mt-8 text-center">
        <button
          onClick={() => logoutUser()}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sair / Trocar conta
        </button>
      </div>
    </div>
  )
}
