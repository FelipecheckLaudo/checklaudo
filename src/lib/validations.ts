import { z } from "zod";

// Simplified CPF validation (format only)
const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/[^\d]/g, "");
  return cleanCPF.length === 11 && !/^(\d)\1+$/.test(cleanCPF);
};

// Cliente validation schema
export const clienteSchema = z.object({
  nome: z.string()
    .trim()
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  cpf: z.string()
    .refine(validateCPF, "CPF inválido"),
  observacoes: z.string()
    .max(1000, "Observações devem ter no máximo 1000 caracteres")
    .optional(),
  foto_url: z.string().url().optional().or(z.literal("")),
});

// Vistoria validation schema
export const vistoriaSchema = z.object({
  placa: z.string()
    .trim()
    .min(7, "Placa inválida")
    .max(8, "Placa inválida")
    .regex(/^[A-Z]{3}-?\d[A-Z0-9]\d{2}$/, "Formato de placa inválido"),
  modelo: z.string()
    .trim()
    .min(2, "Modelo deve ter no mínimo 2 caracteres")
    .max(50, "Modelo deve ter no máximo 50 caracteres"),
  tipo: z.string()
    .min(1, "Tipo é obrigatório"),
  valor: z.number()
    .positive("Valor deve ser positivo")
    .max(999999, "Valor muito alto"),
  pagamento: z.string()
    .min(1, "Forma de pagamento é obrigatória"),
  cliente_nome: z.string()
    .trim()
    .min(3, "Nome do cliente deve ter no mínimo 3 caracteres")
    .max(100, "Nome do cliente deve ter no máximo 100 caracteres"),
  cliente_cpf: z.string()
    .refine(validateCPF, "CPF do cliente inválido")
    .optional(),
  digitador: z.string().optional(),
  liberador: z.string().optional(),
});

export type ClienteFormData = z.infer<typeof clienteSchema>;
export type VistoriaFormData = z.infer<typeof vistoriaSchema>;
