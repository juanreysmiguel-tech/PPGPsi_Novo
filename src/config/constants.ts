export const EMAIL_SECRETARIA = 'ppgpsi@ufscar.br'

export const UFSCAR_DOMAINS = ['@ufscar.br', '@estudante.ufscar.br'] as const

export function isUFSCarEmail(email: string): boolean {
  const lower = email.toLowerCase().trim()
  return UFSCAR_DOMAINS.some((d) => lower.endsWith(d))
}

// Financial Aid Status Workflow (12 stages)
export const FINANCIAL_STATUS = {
  PENDING_ADVISOR: 'Aguardando Avaliacao do Orientador',
  PENDING_CG: 'Em Analise pela Comissao de Gestao (CG)',
  PENDING_INFO: 'Aguardando Elucidacao (Retornado para Ajustes)',
  APPROVED_CG: 'Aprovado pela CG (Aguardando Tramite da Secretaria)',
  IN_MEETING: 'Em Pauta (Reuniao do Colegiado)',
  ACCOUNTABILITY_REQUESTED: 'Prestacao de Contas Solicitada',
  WAITING_CHECK: 'Prestacao de Contas em Analise',
  WAITING_DEPOSIT: 'Aguardando Deposito Financeiro',
  COMPLETED: 'Concluido / Arquivado',
  REJECTED: 'Indeferido / Recusado',
  DELETED: 'Excluido',
  UPDATED: 'Dados Atualizados',
} as const

export type FinancialStatusKey = keyof typeof FINANCIAL_STATUS
export type FinancialStatusValue =
  (typeof FINANCIAL_STATUS)[FinancialStatusKey]

// Reverse map: human-readable -> code
export const STATUS_CODE_MAP = Object.fromEntries(
  Object.entries(FINANCIAL_STATUS).map(([k, v]) => [v, k]),
) as Record<FinancialStatusValue, FinancialStatusKey>

// Status color mapping for badges
export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  'Aguardando Avaliacao do Orientador': { bg: 'bg-amber-100', text: 'text-amber-800' },
  'Em Analise pela Comissao de Gestao (CG)': { bg: 'bg-blue-100', text: 'text-blue-800' },
  'Aguardando Elucidacao (Retornado para Ajustes)': { bg: 'bg-orange-100', text: 'text-orange-800' },
  'Aprovado pela CG (Aguardando Tramite da Secretaria)': { bg: 'bg-emerald-100', text: 'text-emerald-800' },
  'Em Pauta (Reuniao do Colegiado)': { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  'Prestacao de Contas Solicitada': { bg: 'bg-purple-100', text: 'text-purple-800' },
  'Prestacao de Contas em Analise': { bg: 'bg-violet-100', text: 'text-violet-800' },
  'Aguardando Deposito Financeiro': { bg: 'bg-cyan-100', text: 'text-cyan-800' },
  'Concluido / Arquivado': { bg: 'bg-green-100', text: 'text-green-800' },
  'Indeferido / Recusado': { bg: 'bg-red-100', text: 'text-red-800' },
  'Excluido': { bg: 'bg-gray-100', text: 'text-gray-800' },
  'Dados Atualizados': { bg: 'bg-sky-100', text: 'text-sky-800' },
  'Aprovado na CPG': { bg: 'bg-green-100', text: 'text-green-800' },
  'Aprovado com Ressalvas': { bg: 'bg-lime-100', text: 'text-lime-800' },
  'Reprovado na CPG': { bg: 'bg-red-100', text: 'text-red-800' },
  'Aprovado ad referendum pela Coordenacao': { bg: 'bg-teal-100', text: 'text-teal-800' },
}

// Stepper steps for request progress
export const REQUEST_STEPS = [
  { label: 'Enviado', icon: 'Send' },
  { label: 'Orientador', icon: 'UserCheck' },
  { label: 'CG / Secretaria', icon: 'ClipboardCheck' },
  { label: 'CPG', icon: 'Users' },
  { label: 'Concluido', icon: 'CheckCircle' },
] as const

// Diaria values for financial aid
export const DIARIA_VALUES = {
  SP: { perDay: 380, maxDays: 2, maxValue: 760 },
  OTHER_STATE: { perDay: 380, maxDays: 3, maxValue: 1140 },
} as const

// Country groups for international daily allowances (single fixed daily)
export const COUNTRY_GROUPS = {
  A: {
    valueUSD: 180,
    countries: 'Afeganistão, Armênia, Bangladesh, Belarus, Benin, Bolívia, Burkina-Fasso, Butão, Chile, Comores, República Popular Democrática da Coréia, Costa Rica, El Salvador, Equador, Eslovênia, Filipinas, Gâmbia, Guiana, Guiné Bissau, Guiné, Honduras, Indonésia, Irã, Iraque, Laos, Líbano, Malásia, Maldivas, Marrocos, Mongólia, Myanmar, Namíbia, Nauru, Nepal, Nicarágua, Panamá, Paraguai, Rep. Centro Africana, República Togolesa, Salomão, Samoa, Serra Leoa, Síria, Somália, Sri Lanka, Suriname, Tadjiquistão, Tailândia, Timor Leste, Tonga, Tunísia, Turcomenistão, Turquia, Tuvalu, Vietnã, Zimbábue',
  },
  B: {
    valueUSD: 260,
    countries: 'África do Sul, Albânia, Andorra, Argélia, Argentina, Austrália, Belize, Bósnia-Herzegóvina, Burundi, Cabo Verde, Camarões, Camboja, Catar, Chade, China, Chipre, Colômbia, Dominica, Egito, Eritréia, Estônia, Etiópia, Gana, Geórgia, Guiné-Equatorial, Haiti, Hungria, Iêmen, Ilhas Marshall, Índia, Kiribati, Lesoto, Líbia, Macedônia, Madagascar, Malauí, Micronésia, Moçambique, Moldávia, Níger, Nigéria, Nova Zelândia, Palau, Papua Nova Guiné, Paquistão, Peru, Polônia, Quênia, República Dominicana, República Eslovaca, Romênia, Ruanda, São Tomé e Príncipe, Senegal, Sudão, Tanzânia, Uruguai, Uzbequistão, Venezuela',
  },
  C: {
    valueUSD: 310,
    countries: 'Antígua e Barbuda, Arábia Saudita, Azerbaidjão, Bahamas, Bareine, Botsuana, Brunei Darussalam, Bulgária, Canadá, Cingapura, Congo, Costa do Marfim, Cuba, Djibuti, Emirados Árabes, Fiji, Gabão, Guatemala, Jamaica, Jordânia, Letônia, Libéria, Lituânia, Mali, Malta, Maurício, Mauritânia, México, República Democrática do Congo, República Tcheca, Rússia, San Marino, Santa Lúcia, São Cristovão e Névis, São Vicente e Granadinas, Taiwan, Trinidad e Tobago, Ucrânia, Uganda, Zâmbia',
  },
  D: {
    valueUSD: 370,
    countries: 'Alemanha, Angola, Áustria, Barbados, Bélgica, Cazaquistão, Coréia do Sul, Croácia, Dinamarca, Espanha, Estados Unidos da América, Finlândia, França, Granada, Grécia, Hong Kong, Irlanda, Islândia, Israel, Itália, Japão, Kuaite, Liechtenstein, Luxemburgo, Mônaco, Montenegro, Noruega, Omã, Países Baixos, Portugal, Reino Unido, República Quirguiz, Seicheles, Sérvia, Suazilândia, Suécia, Suíça, Vanuatu',
  },
} as const

export type CountryGroup = keyof typeof COUNTRY_GROUPS

// Accountability checklists
export const ACCOUNTABILITY_CHECKLISTS = {
  A: {
    title: 'A. Servicos de Traducao, Revisao e Publicacao (Artigos)',
    items: [
      'Nota Fiscal de Servico (NFS-e) com dados da CAPES e rodape',
      'Invoice original (em caso de revistas estrangeiras)',
      'Comprovante de Cambio ou extrato do cartao com a conversao',
      'Copia da versao final do artigo',
      'Certificado de traducao/revisao assinado pelo profissional/empresa',
      'Comprovante de aceite (e-mail ou carta da revista)',
      'Justificativa de escolha da revista (assinada pelo orientador)',
    ],
  },
  B: {
    title: 'B. Participacao em Eventos e Congressos',
    items: [
      'Nota Fiscal da Inscricao (ou Recibo original em nome da CAPES)',
      'Certificado de Apresentacao de Trabalho (especificando autores e titulo)',
      'Certificado de Participacao (Ouvinte)',
      'Copia do trabalho/resumo publicado nos anais',
      'Folder ou programacao completa do evento',
      'Relatorio de Atividades em Evento (descritivo)',
      'Comprovante de embarque (canhotos de passagens ou bilhetes)',
    ],
  },
  C: {
    title: 'C. Diarias e Viagens (Campo, Coletas ou Visitas Tecnicas)',
    items: [
      'Relatorio de Viagem Detalhado (cronograma diario)',
      'Declaracao de Permanencia/Frequencia',
      'Nota Fiscal de Hospedagem (em nome da CAPES)',
      'Recibos de taxi, aplicativos ou pedagios',
      'Fotos das atividades de campo',
      'Copia da autorizacao de afastamento (vinculo empregaticio)',
    ],
  },
  D: {
    title: 'D. Material de Consumo e Laboratorio',
    items: [
      'Nota Fiscal de Produto (NF-e) com rodape e quitacao',
      'Pesquisa de Precos (minimo de 3 orcamentos previos)',
      'Justificativa tecnica para a compra do material',
      'Termo de Fiel Depositario (se material permanente)',
      'Guia de recebimento (conferencia do material)',
    ],
  },
} as const

export const INVOICE_DATA_TEXT = `A nota fiscal deve ser emitida exclusivamente com os dados abaixo. Se houver erro em qualquer caractere, a prestacao de contas sera rejeitada.

Nome: Fundacao CAPES/Alex Sandro Gomes Pessoa
CPF: 346.974.078-06
Endereco: Rodovia Washington Luiz, Km 235 - CEP 13565-905
Insc. Estadual: Isento | Telefone: (16) 3351-8444

Exigencias Adicionais:
- Quitacao: Solicitar que a empresa carimbe ou escreva "Recebemos" na nota.
- Rodape Obrigatorio: Deve constar o texto: "Programa CAPES-PROEX-AUXPE N 3596/2025 e Processo N 88881.185837/2025-01"`

// Request Types - Academic & Financial (16+ types)
export const REQUEST_TYPE_DEFINITIONS = {
  // ACADEMIC
  'prorroga-qualificacao': {
    title: 'Prorrogacao de Qualificacao',
    category: 'academic',
    description: 'Solicitar extensao do prazo para exame de qualificacao',
    requiresAdvisor: true,
    requiresFinance: false,
  },
  'prorroga-defesa': {
    title: 'Prorrogacao de Defesa',
    category: 'academic',
    description: 'Solicitar extensao do prazo para defesa final',
    requiresAdvisor: true,
    requiresFinance: false,
  },
  'antecipacao-defesa': {
    title: 'Antecipacao de Defesa',
    category: 'academic',
    description: 'Solicitar defesa antes do prazo regulamentado',
    requiresAdvisor: true,
    requiresFinance: false,
  },
  'trancamento': {
    title: 'Trancamento de Matricula',
    category: 'academic',
    description: 'Suspender temporariamente a matricula no programa',
    requiresAdvisor: true,
    requiresFinance: false,
  },
  'reabertura': {
    title: 'Reabertura de Matricula',
    category: 'academic',
    description: 'Retomar matricula apos trancamento',
    requiresAdvisor: true,
    requiresFinance: false,
  },
  'mudanca-orientador': {
    title: 'Mudanca de Orientador',
    category: 'academic',
    description: 'Trocar de orientador academico',
    requiresAdvisor: false,
    requiresFinance: false,
  },
  'co-orientador': {
    title: 'Solicitacao de Co-Orientador',
    category: 'academic',
    description: 'Adicionar co-orientador ao trabalho',
    requiresAdvisor: true,
    requiresFinance: false,
  },
  'equivalencia-disciplina': {
    title: 'Equivalencia de Disciplina',
    category: 'academic',
    description: 'Solicitar reconhecimento de disciplina cursada',
    requiresAdvisor: true,
    requiresFinance: false,
  },

  // FINANCIAL
  'passagem-aerea': {
    title: 'Solicitacao de Passagem Aerea',
    category: 'financial',
    description: 'Reembolso de passagem aerea para evento/pesquisa',
    requiresAdvisor: true,
    requiresFinance: true,
  },
  'diarias': {
    title: 'Solicitacao de Diarias',
    category: 'financial',
    description: 'Diarias para viagem a evento, coleta de dados ou visita tecnica',
    requiresAdvisor: true,
    requiresFinance: true,
  },
  'combustivel': {
    title: 'Reembolso de Combustivel / Transporte',
    category: 'financial',
    description: 'Reembolso de despesas com transporte terrestre',
    requiresAdvisor: true,
    requiresFinance: true,
  },
  'inscricao-evento': {
    title: 'Inscricao em Evento / Congresso',
    category: 'financial',
    description: 'Taxa de inscricao em congresso ou evento cientifico',
    requiresAdvisor: true,
    requiresFinance: true,
  },
  'publicacao': {
    title: 'Publicacao / Traducao',
    category: 'financial',
    description: 'Custo de publicacao ou traducao de artigo cientifico',
    requiresAdvisor: true,
    requiresFinance: true,
  },
  'material-consumo': {
    title: 'Material de Consumo / Laboratorio',
    category: 'financial',
    description: 'Compra de material necessario para pesquisa',
    requiresAdvisor: true,
    requiresFinance: true,
  },
  'prestacao-contas': {
    title: 'Prestacao de Contas',
    category: 'financial',
    description: 'Envio de documentacao de prestacao de contas',
    requiresAdvisor: false,
    requiresFinance: true,
  },
} as const

export type RequestTypeKey = keyof typeof REQUEST_TYPE_DEFINITIONS
export type RequestTypeDefinition = (typeof REQUEST_TYPE_DEFINITIONS)[RequestTypeKey]

// Helper: Get all request types by category
export function getRequestTypesByCategory(category: 'academic' | 'financial') {
  return Object.entries(REQUEST_TYPE_DEFINITIONS).filter(
    ([_, def]) => def.category === category,
  )
}

// Helper: Get request type definition
export function getRequestTypeInfo(key: RequestTypeKey): RequestTypeDefinition {
  return REQUEST_TYPE_DEFINITIONS[key]
}
