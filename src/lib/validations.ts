import { z } from "zod";

// Simple CPF format check
const validateCPF = (cpf: string) => /^\d{11}$/.test(cpf.replace(/\D/g, ""));

export const clienteSchema = z.object({
  nome: z.string().trim().min(1, "Nome obrigatório"),
  cpf: z.string().refine(validateCPF, "CPF inválido"),
  observacoes: z.string().optional(),
  foto_url: z.string().optional(),
});

export const vistoriaSchema = z.object({
  placa: z.string().trim().min(7, "Placa inválida"),
  modelo: z.string().trim().min(1, "Modelo obrigatório"),
  tipo: z.string().min(1, "Tipo obrigatório"),
  valor: z.number().positive("Valor inválido"),
  pagamento: z.string().min(1, "Pagamento obrigatório"),
  cliente_nome: z.string().trim().min(1, "Cliente obrigatório"),
  cliente_cpf: z.string().optional(),
  digitador: z.string().optional(),
  liberador: z.string().optional(),
});

export type ClienteFormData = z.infer<typeof clienteSchema>;
export type VistoriaFormData = z.infer<typeof vistoriaSchema>;
