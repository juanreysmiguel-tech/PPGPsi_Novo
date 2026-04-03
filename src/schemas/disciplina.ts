import { z } from 'zod';

export const disciplinaSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(3, "O nome da disciplina é obrigatório"),
  creditos: z.number().min(0, "Créditos não podem ser negativos").optional(),
  tipoMestrado: z.string().optional(),
  tipoDoutorado: z.string().optional(),
});

export type DisciplinaFormData = z.infer<typeof disciplinaSchema>;
