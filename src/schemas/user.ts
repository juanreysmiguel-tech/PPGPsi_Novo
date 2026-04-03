import { z } from 'zod';

export const userSchema = z.object({
  id: z.string().optional(),
  email: z.string().email(),
  nome: z.string().min(2, "Nome muito curto"),
  roles: z.array(z.enum(['Externo', 'Discente', 'Docente', 'Secretaria', 'Coordenacao', 'CG'])),
  status: z.enum(['Ativo', 'Inativo', 'Suspenso']).default('Ativo'),
  telefone: z.string().optional(),
  celular: z.string().optional(),
  endereco: z.string().optional(),
  emergenciaNome: z.string().optional(),
  emergenciaTel: z.string().optional(),
  fotoUrl: z.string().optional(),

  // Student-specific
  dataIngresso: z.any().optional(), // Date or firestore Timestamp
  creditosTotais: z.number().optional(),
  dataDefesa: z.any().optional(),
  dataQualificacao: z.any().optional(),
  dataIntegralizacao: z.any().optional(),
  nomeOrientador: z.string().optional(),
  emailOrientador: z.string().email().optional(),
  nivel: z.enum(['Mestrado', 'Doutorado']).optional(),
  creditosOptativas: z.number().optional(),
  creditosObrigatorias: z.number().optional(),
  dataDefesaRealizada: z.any().optional(),
  cpf: z.string().optional(),
  rg: z.string().optional(),
  rgOrgao: z.string().optional(),
  rgDataEmissao: z.any().optional(),
  dataNascimento: z.any().optional(),
  sexo: z.string().optional(),
  raca: z.string().optional(),
  logradouro: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  uf: z.string().optional(),
  cep: z.string().optional(),
  prazoAcesso: z.any().optional(),

  // Faculty-specific
  docenteCredenciamentoReuniao: z.string().optional(),
  docenteCategoria: z.string().optional(),
  docentePodeOrientar: z.boolean().optional(),
});

export type UserFormData = z.infer<typeof userSchema>;
