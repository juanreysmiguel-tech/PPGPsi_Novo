/**
 * Configuração de tipos de requisição
 * Migrado de RequestConfig no código legado (js.html:5234-5541)
 */

export type FieldType = 'text' | 'textarea' | 'date' | 'number' | 'select' | 'file' | 'email' | 'checkbox' | 'radio' | 'heading' | 'info'

export interface FormField {
  label: string
  type: FieldType
  required?: boolean
  id?: string
  readonly?: boolean
  helpText?: string
  options?: string[]
  conditional?: boolean
  showWhen?: {
    field: string
    value: string
  }
  step?: number
}

export interface RequestTypeConfig {
  title: string
  category: 'academic' | 'financial' | 'outro'
  hasDiariaCalculation?: boolean
  hasCurrencyLogic?: boolean
  fields: FormField[]
}

// CAPES evaluation fields (js.html:5148-5168)
export const CAPES_FIELDS: FormField[] = [
  { type: 'heading', label: 'Contribuição para as Diretrizes Avaliativas do PPGPsi' },
  { type: 'info', label: 'Selecione uma ou mais opções que melhor expressem como o pedido se vincula às diretrizes avaliativas da CAPES e do PPGPsi:' },
  { type: 'heading', label: 'Quesito 1 - Programa' },
  { label: 'Contribui para consolidar a identidade do Programa (missão, linhas de pesquisa, estrutura curricular)', type: 'checkbox', id: 'capes-q1-1' },
  { label: 'Apoia iniciativas de autoavaliação e planejamento estratégico do PPGPsi', type: 'checkbox', id: 'capes-q1-2' },
  { label: 'Favorece ações de equidade, diversidade e inclusão', type: 'checkbox', id: 'capes-q1-3' },
  { type: 'heading', label: 'Quesito 2 - Formação e Produção Intelectual' },
  { label: 'Fortalece a qualidade de teses, dissertações ou TCCs', type: 'checkbox', id: 'capes-q2-1' },
  { label: 'Valoriza a atuação de egressos e amplia seu impacto profissional', type: 'checkbox', id: 'capes-q2-2' },
  { label: 'Gera ou amplia produção intelectual de discentes e egressos', type: 'checkbox', id: 'capes-q2-3' },
  { label: 'Melhora a produção intelectual do corpo docente', type: 'checkbox', id: 'capes-q2-4' },
  { type: 'heading', label: 'Quesito 3 - Impacto' },
  { label: 'Favorece a inserção acadêmica do Programa em redes e colaborações', type: 'checkbox', id: 'capes-q3-1' },
  { label: 'Aumenta a visibilidade ou a popularização do conhecimento científico', type: 'checkbox', id: 'capes-q3-2' },
  { label: 'Gera inovação ou transferência de conhecimento', type: 'checkbox', id: 'capes-q3-3' },
  { label: 'Produz impacto social relevante', type: 'checkbox', id: 'capes-q3-4' },
  { label: 'Contribui para a internacionalização do Programa', type: 'checkbox', id: 'capes-q3-5' },
  { label: 'Justificativa (descreva como o pedido se relaciona com os itens marcados)', type: 'textarea', required: true, id: 'capes-justificativa', helpText: 'Vincule ao desenvolvimento do PPGPsi e as diretrizes avaliativas da CAPES.' },
]

export const REQUEST_TYPES: Record<string, RequestTypeConfig> = {
  // ========================================================================
  // ACADEMIC REQUESTS (Requisições Acadêmicas)
  // ========================================================================
  '2': {
    title: 'Prorrogação de Prazo do Exame de Qualificação',
    category: 'academic',
    fields: [
      { label: 'Prazo Regulamentar para Qualificação', type: 'date', required: true },
      { label: 'Prazo solicitado', type: 'date', required: true },
      { label: 'Justificativa da Solicitação', type: 'textarea', required: true },
      { label: 'Pedidos anteriores', type: 'textarea', required: false },
    ],
  },
  '3': {
    title: 'Prorrogação de Prazo da Defesa',
    category: 'academic',
    fields: [
      { label: 'Prazo regulamentar para a defesa', type: 'date', required: true },
      { label: 'Prazo solicitado', type: 'date', required: true },
      { label: 'Justificativa da solicitação para Prorrogação da Defesa', type: 'textarea', required: true },
      { label: 'Pedidos anteriores de prorrogação de prazo de defesa', type: 'textarea', required: false },
      { label: 'Anexos (comprovantes, etc)', type: 'file', required: false },
    ],
  },
  '4': {
    title: 'Incorporação de Créditos Optativos (cursados em outro PPG)',
    category: 'academic',
    fields: [
      { label: 'Disciplina', type: 'text', required: true },
      { label: 'Programa de Pós-Graduação e Instituição que cursou a disciplina', type: 'text', required: true },
      { label: 'Quantidade de Créditos da Disciplina', type: 'number', required: true },
      { label: 'Semestre/Ano de conclusão', type: 'text', required: true },
      { label: 'Conceito Obtido', type: 'text', required: true },
      { label: 'Frequência Obtida (em %)', type: 'number', required: true },
      { label: 'Ementa(s) da(s) disciplina(s) cursada(s)', type: 'file', required: true },
      { label: 'Comprovante de conclusão (Frequência e Conceito)', type: 'file', required: true },
      { label: 'Justificativa', type: 'textarea', required: true },
    ],
  },
  '5': {
    title: 'Incorporação de Créditos cursados como aluno(a) especial no PPGPsi',
    category: 'academic',
    fields: [
      { label: 'Disciplina(s) solicitada(s)', type: 'textarea', required: true },
      { label: 'Quantidade de créditos solicitados', type: 'number', required: true },
      { label: 'Semestre/Ano de conclusão de cada disciplina', type: 'text', required: true },
      { label: 'Comprovante de Conclusão', type: 'file', required: true },
    ],
  },
  '6': {
    title: 'Incorporação de Créditos em "Disciplina de Outra Área" (somente doutorado)',
    category: 'academic',
    fields: [
      { label: 'Disciplina', type: 'text', required: true },
      { label: 'A qual Programa de Pós-Graduação a disciplina pertence?', type: 'text', required: true },
      { label: 'Em qual Universidade/Instituição de Pesquisa a disciplina foi/será ministrada?', type: 'text', required: true },
      { label: 'Período em que a disciplina foi/será realizada', type: 'text', required: true },
      { label: 'Créditos', type: 'number', required: true },
      { label: 'Já cursou a disciplina ou pretende cursar?', type: 'select', options: ['Já cursei', 'Pretendo cursar'], required: true },
      { label: 'A incorporação desses créditos em seu histórico já foi aprovada anteriormente pela CPG?', type: 'select', options: ['Sim', 'Não'], required: true },
      { label: 'Caso já tenha sido aprovada, número da reunião', type: 'text', required: false },
      { label: 'Ementa da disciplina', type: 'file', required: true },
      { label: 'Comprovante oficial de conclusão (se já cursou)', type: 'file', required: false },
    ],
  },
  '7': {
    title: 'Validação de Créditos cursados no Mestrado do PPGPsi (somente doutorado)',
    category: 'academic',
    fields: [
      { label: 'Nome da(s) disciplina(s) solicitada(s)', type: 'textarea', required: true },
      { label: 'Quantidade de créditos', type: 'number', required: true },
      { label: 'Histórico do mestrado', type: 'file', required: true },
      { label: 'Ementas das Disciplinas', type: 'file', required: false },
    ],
  },
  '8': {
    title: 'Trancamento de Matrícula',
    category: 'academic',
    fields: [
      { label: 'Período do trancamento', type: 'text', required: true, id: 'trancamento-periodo', readonly: true, helpText: 'Preenchido automaticamente pelo sistema' },
      { label: 'Motivo do trancamento', type: 'textarea', required: true },
      { label: 'Bolsista?', type: 'select', options: ['Sim', 'Não'], required: true, id: 'trancamento-bolsista' },
      { label: 'Agência de fomento', type: 'text', required: true, conditional: true, showWhen: { field: 'trancamento-bolsista', value: 'Sim' } },
      { label: 'Vigência da Bolsa (Início)', type: 'date', required: true, conditional: true, showWhen: { field: 'trancamento-bolsista', value: 'Sim' } },
      { label: 'Vigência da Bolsa (Fim)', type: 'date', required: true, conditional: true, showWhen: { field: 'trancamento-bolsista', value: 'Sim' } },
      { label: 'Trancamentos anteriores?', type: 'select', options: ['Sim', 'Não'], required: true, id: 'trancamento-anterior' },
    ],
  },
  '9': {
    title: 'Cancelamento de Inscrição em Disciplinas',
    category: 'academic',
    fields: [
      { label: 'Disciplina que deseja cancelar', type: 'text', required: true },
      { label: 'Motivo do cancelamento', type: 'textarea', required: true },
    ],
  },
  '10': {
    title: 'Desligamento do Programa',
    category: 'academic',
    fields: [
      { label: 'Motivo do Desligamento', type: 'textarea', required: true },
      { label: 'É ou foi bolsista CAPES do Programa?', type: 'select', options: ['Sim', 'Não'], required: true },
    ],
  },
  '11': {
    title: 'Solicitação de Co-orientação',
    category: 'academic',
    fields: [
      { label: 'Coorientador pretendido', type: 'text', required: true },
      { label: 'Justificativa do pedido de coorientação', type: 'textarea', required: true },
      { label: 'CV ou Lattes do Coorientador pretendido', type: 'file', required: true },
    ],
  },
  '14': {
    title: 'Homologação de Defesa para Emissão do Diploma',
    category: 'academic',
    fields: [
      { label: 'Título definitivo do Trabalho', type: 'text', required: true },
      { label: 'Data da Defesa', type: 'date', required: true },
      { label: 'Versão final da tese/dissertação', type: 'file', required: true },
      { label: 'Carta comprovante de versão definitiva', type: 'file', required: true },
      { label: 'Relatório de Defesa (assinado)', type: 'file', required: true },
      { label: 'Atestado Negativo da BCo', type: 'file', required: true },
      { label: 'E-mail comprovando submissão ao RI', type: 'file', required: true },
      { label: 'Termo de Conferência para Impressão do Diploma', type: 'file', required: true },
    ],
  },
  '15': {
    title: 'Outras solicitações',
    category: 'academic',
    fields: [
      { label: 'Solicitação', type: 'text', required: true },
      { label: 'Justificativa da solicitação', type: 'textarea', required: true },
      { label: 'Anexos (opcional)', type: 'file', required: false },
    ],
  },
  '16': {
    title: 'Solicitação de bolsista para exercer trabalho remunerado',
    category: 'academic',
    fields: [
      { label: 'Qual atividade pretende desempenhar?', type: 'text', required: true },
      { label: 'Descrição da atividade remunerada', type: 'textarea', required: true },
      { label: 'Instituição em que exercerá atividade remunerada', type: 'text', required: true },
      { label: 'Qual tipo/natureza do vínculo', type: 'text', required: true },
      { label: 'Carga horária (horas/semana)', type: 'number', required: true },
      { label: 'Data em que iniciará a atividade?', type: 'date', required: true },
      { label: 'Data que finalizará a atividade?', type: 'date', required: true },
      { label: 'Já realiza outra atividade remunerada aprovada pela Comissão?', type: 'select', options: ['Sim', 'Não'], required: true },
      { label: 'Caso sim, quantas horas por semana?', type: 'number', required: false },
      { label: 'A atividade que desempenhará é Clínica?', type: 'select', options: ['Sim', 'Não'], required: true },
      { label: 'Qual relação a atividade terá com sua área/tema de pesquisa?', type: 'textarea', required: true },
      { label: 'Quais benefícios a experiência trará à sua formação?', type: 'textarea', required: true },
      { label: 'Anuência do(a) orientador(a) (PDF)', type: 'file', required: true },
    ],
  },

  // ========================================================================
  // FINANCIAL REQUESTS (Requisições Financeiras)
  // ========================================================================
  'FIN_EVENTO': {
    title: 'Auxílio Financeiro - Participação em Evento Científico',
    category: 'financial',
    hasDiariaCalculation: true,
    hasCurrencyLogic: true,
    fields: [
      { label: 'Nome do Evento', type: 'text', required: true },
      { label: 'Data de Início do Evento', type: 'date', required: true, id: 'diaria-data-inicio' },
      { label: 'Data de Término do Evento', type: 'date', required: true, id: 'diaria-data-fim' },
      { label: 'Localização do Evento', type: 'select', required: true, id: 'diaria-localizacao', options: ['Selecione...', 'São Paulo (Estado)', 'Outro Estado (Brasil)', 'Exterior'] },
      { label: 'Participação Presencial?', type: 'select', required: true, id: 'diaria-presencial', options: ['Selecione...', 'Sim', 'Não'] },
      { label: 'Grupo de País (para diária no exterior)', type: 'text', required: false, id: 'diaria-grupo-display', conditional: true, showWhen: { field: 'diaria-localizacao', value: 'Exterior' }, readonly: true, helpText: 'Clique para selecionar o grupo de país na tabela auxiliar.' },
      { label: 'Tipo de Participação', type: 'select', options: ['Apresentação de Trabalho', 'Ouvinte', 'Organização', 'Outro'], required: true },
      { label: 'Moeda do Pagamento', type: 'select', required: false, id: 'fin-moeda', options: ['Real (BRL)', 'Dolar (USD)', 'Euro (EUR)', 'Libra (GBP)'], conditional: true, showWhen: { field: 'diaria-presencial', value: 'Não' } },
      { label: 'Data do Pagamento/Invoice', type: 'date', required: false, id: 'fin-data-invoice', conditional: true, showWhen: { field: 'diaria-presencial', value: 'Não' }, helpText: 'Necessário para conversão se pago em moeda estrangeira.' },
      { label: 'Valor Original (Moeda Selecionada)', type: 'number', required: false, id: 'fin-valor-original', step: 0.01, conditional: true, showWhen: { field: 'diaria-presencial', value: 'Não' } },
      { label: 'Valor do Auxílio (R$)', type: 'text', required: false, id: 'diaria-valor-calculado', readonly: true, helpText: 'Calculado automaticamente (Eventos Presenciais) ou convertido (Remoto).' },
      { label: 'Rubrica', type: 'select', options: ['Diária', 'Inscrição', 'Passagem', 'Outros'], required: true },
      { label: 'Comprovante de Aceite/Inscrição', type: 'file', required: true },
      { label: 'Orçamento/Cotação (PDF)', type: 'file', required: false },
      ...CAPES_FIELDS,
    ],
  },
  'FIN_MATERIAL': {
    title: 'Auxílio Financeiro - Material de Consumo',
    category: 'financial',
    hasCurrencyLogic: true,
    fields: [
      { label: 'Material de Consumo solicitado', type: 'text', required: true },
      { label: 'Descrição do Material', type: 'textarea', required: true },
      { label: 'Fornecedor do Material', type: 'text', required: true },
      { label: 'Moeda do Orçamento', type: 'select', required: true, id: 'fin-moeda', options: ['Real (BRL)', 'Dolar (USD)', 'Euro (EUR)', 'Libra (GBP)'] },
      { label: 'Data da Emissão da Invoice/Nota', type: 'date', required: false, id: 'fin-data-invoice', helpText: 'Necessário para conversão de valores estrangeiros (BCB).' },
      { label: 'Valor Original (Moeda Selecionada)', type: 'number', required: true, id: 'fin-valor-original', step: 0.01 },
      { label: 'Valor Solicitado (R$)', type: 'text', required: true, id: 'diaria-valor-calculado', readonly: true, helpText: 'Valor em Reais (convertido se necessário).' },
      { label: 'PDF do Orçamento', type: 'file', required: true },
      ...CAPES_FIELDS,
    ],
  },
  'FIN_OUTROS': {
    title: 'Auxílio Financeiro - Contratação de Serviços',
    category: 'financial',
    hasCurrencyLogic: true,
    fields: [
      { label: 'Serviço Solicitado', type: 'text', required: true },
      { label: 'Descrição do Serviço', type: 'textarea', required: true },
      { label: 'Fornecedor do Serviço', type: 'text', required: true },
      { label: 'Moeda do Orçamento', type: 'select', required: true, id: 'fin-moeda', options: ['Real (BRL)', 'Dolar (USD)', 'Euro (EUR)', 'Libra (GBP)'] },
      { label: 'Data da Emissão da Invoice/Nota', type: 'date', required: false, id: 'fin-data-invoice', helpText: 'Necessário para conversão de valores estrangeiros (BCB).' },
      { label: 'Valor Original (Moeda Selecionada)', type: 'number', required: true, id: 'fin-valor-original', step: 0.01 },
      { label: 'Valor Solicitado (R$)', type: 'text', required: true, id: 'diaria-valor-calculado', readonly: true, helpText: 'Valor em Reais (convertido se necessário).' },
      { label: 'PDF do Orçamento', type: 'file', required: true },
      ...CAPES_FIELDS,
    ],
  },

  // ========================================================================
  // OTHER REQUESTS (Outras Requisições)
  // ========================================================================
  'CANCELAMENTO_BOLSA': {
    title: 'Cancelamento de Bolsa',
    category: 'outro',
    fields: [
      { label: 'Data do cancelamento', type: 'date', required: true },
      { label: 'Motivo do Cancelamento', type: 'textarea', required: true },
      { label: 'Contemplado com bolsa de outra agência de fomento?', type: 'radio', options: ['Não', 'Sim'], required: true },
    ],
  },
}

export function getRequestTypeConfig(typeId: string): RequestTypeConfig | null {
  return REQUEST_TYPES[typeId] || null
}

// Alias for backward compatibility
export const REQUEST_CONFIG = REQUEST_TYPES

export const CATEGORY_LABELS: Record<string, string> = {
  academic: 'Acadêmico',
  financial: 'Financeiro',
  administrative: 'Administrativo',
  outro: 'Outro',
}

export function getRequestTypesByCategory(): Record<string, Array<{ value: string; label: string }>> {
  const grouped: Record<string, Array<{ value: string; label: string }>> = {}

  for (const [typeId, config] of Object.entries(REQUEST_TYPES)) {
    if (!grouped[config.category]) {
      grouped[config.category] = []
    }
    grouped[config.category].push({
      value: typeId,
      label: config.title,
    })
  }

  return grouped
}
