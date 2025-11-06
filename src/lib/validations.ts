import { z } from "zod";

// CPF validation with proper format and checksum
const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/[^\d]/g, "");
  
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleanCPF)) return false; // All same digits
  
  // Validate checksum digits
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let checkDigit = 11 - (sum % 11);
  if (checkDigit >= 10) checkDigit = 0;
  if (checkDigit !== parseInt(cleanCPF.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  checkDigit = 11 - (sum % 11);
  if (checkDigit >= 10) checkDigit = 0;
  if (checkDigit !== parseInt(cleanCPF.charAt(10))) return false;
  
  return true;
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
