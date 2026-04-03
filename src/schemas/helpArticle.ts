import { z } from 'zod';

export const helpArticleSchema = z.object({
  id: z.string().optional(),
  titulo: z.string().min(3, "Título obrigatório"),
  tipoSolicitacao: z.string().optional(),
  perfil: z.string().optional(),
  quandoUsar: z.string().optional(),
  passoAPasso: z.string().optional(),
  prazo: z.string().optional(),
  contato: z.string().optional(),
  faq: z.string().optional(),
  nivel: z.string().optional(),
  tela: z.string().optional(),
  fluxo: z.string().optional(),
  baseLegal: z.string().optional(),
  motivo: z.string().optional(),
  ordem: z.number().optional(),
  linkReferencia: z.string().url("URL inválida").optional().or(z.literal('')),
  ativo: z.boolean().default(true),
});

export type HelpArticleFormData = z.infer<typeof helpArticleSchema>;
