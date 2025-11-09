/**
 * Centralized application constants
 */

/**
 * Tipos de laudo disponíveis
 */
export const TIPOS_LAUDO = [
  "ECV/TRANSFERENCIA",
  "REVISTORIA/INFRAÇÃO DE TRÂNSITO",
  "INSTALAÇÃO DE EQUIPAMENTO GÁS/GNV/ACESSIBILIDADE",
  "DESCARACTERIZAÇÃO DE BLINDAGEM",
  "DESCARACTERIZAÇÃO",
  "TROCA DE MOTOR",
  "TROCA DE CARROCERIA",
  "AVARIAS",
  "AUTORIZAÇÃO ESTRANGEIRO",
  "OUTROS",
] as const;

export type TipoLaudo = typeof TIPOS_LAUDO[number];

/**
 * Modalidades de vistoria
 */
export const MODALIDADES = [
  "INTERNO",
  "EXTERNO",
] as const;

export type Modalidade = typeof MODALIDADES[number];

/**
 * Situações de vistoria
 */
export const SITUACOES = [
  "PENDENTE",
  "APROVADO",
  "REPROVADO",
  "CANCELADO",
] as const;

export type Situacao = typeof SITUACOES[number];

/**
 * Formas de pagamento
 */
export const FORMAS_PAGAMENTO = [
  "DÉBITO",
  "CRÉDITO",
  "PIX",
  "DINHEIRO",
  "TRANSFERÊNCIA",
  "BOLETO",
] as const;

export type FormaPagamento = typeof FORMAS_PAGAMENTO[number];

/**
 * Badges de cores para situações
 */
export const SITUACAO_VARIANTS = {
  PENDENTE: "secondary",
  APROVADO: "default",
  REPROVADO: "destructive",
  CANCELADO: "outline",
} as const;

/**
 * Limites de validação
 */
export const VALIDATION_LIMITS = {
  NOME_MIN: 3,
  NOME_MAX: 100,
  MODELO_MIN: 2,
  MODELO_MAX: 50,
  OBSERVACOES_MAX: 1000,
  VALOR_MIN: 0,
  VALOR_MAX: 999999,
  CPF_LENGTH: 11,
} as const;

/**
 * Mensagens de validação padrão
 */
export const VALIDATION_MESSAGES = {
  NOME_MIN: `Nome deve ter no mínimo ${VALIDATION_LIMITS.NOME_MIN} caracteres`,
  NOME_MAX: `Nome deve ter no máximo ${VALIDATION_LIMITS.NOME_MAX} caracteres`,
  MODELO_MIN: `Modelo deve ter no mínimo ${VALIDATION_LIMITS.MODELO_MIN} caracteres`,
  MODELO_MAX: `Modelo deve ter no máximo ${VALIDATION_LIMITS.MODELO_MAX} caracteres`,
  OBSERVACOES_MAX: `Observações devem ter no máximo ${VALIDATION_LIMITS.OBSERVACOES_MAX} caracteres`,
  CPF_INVALIDO: "CPF inválido",
  PLACA_INVALIDA: "Formato de placa inválido",
  VALOR_POSITIVO: "Valor deve ser positivo",
  VALOR_ALTO: "Valor muito alto",
  EMAIL_INVALIDO: "Email inválido",
  CAMPO_OBRIGATORIO: "Campo obrigatório",
} as const;

/**
 * Storage bucket names
 */
export const STORAGE_BUCKETS = {
  LOGOS: "logos",
  VISTORIA_FOTOS: "vistoria-fotos",
} as const;
