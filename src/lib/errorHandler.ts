import { logger } from "./logger";

interface PostgresError {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
}

interface SupabaseError {
  code?: string;
  message?: string;
  status?: number;
}

/**
 * Maps database and authentication errors to user-friendly messages
 * Prevents information leakage by hiding technical details
 * @param error - The error object from Supabase or database
 * @param context - Optional context about where the error occurred
 * @returns User-friendly error message
 */
export function getUserFriendlyError(
  error: unknown,
  context?: string
): string {
  // Log the full error for debugging (hidden in production)
  logger.error(`Error in ${context || "operation"}`, error);

  // Handle null/undefined errors
  if (!error) {
    return "Erro ao processar solicitação. Tente novamente.";
  }

  const err = error as PostgresError & SupabaseError;

  // PostgreSQL error codes - map to friendly messages
  if (err.code) {
    switch (err.code) {
      // Unique constraint violations
      case "23505":
        if (err.message?.includes("cpf")) {
          return "Este CPF já está cadastrado no sistema.";
        }
        return "Este registro já existe no sistema.";

      // Foreign key violations
      case "23503":
        return "Operação não permitida. Registro referenciado não existe.";

      // Check constraint violations
      case "23514":
        if (err.message?.includes("CPF")) {
          return "CPF inválido. Verifique os dados informados.";
        }
        if (err.message?.includes("placa")) {
          return "Formato de placa inválido. Use o formato ABC-1234.";
        }
        if (err.message?.includes("nome")) {
          return "Nome deve ter entre 3 e 100 caracteres.";
        }
        if (err.message?.includes("valor")) {
          return "Valor deve ser positivo e não pode exceder R$ 999.999,00.";
        }
        return "Dados inválidos. Verifique as informações.";

      // Not null violations
      case "23502":
        return "Campos obrigatórios não foram preenchidos.";

      // String data right truncation
      case "22001":
        return "Texto muito longo. Reduza o tamanho dos campos.";

      // Invalid text representation
      case "22P02":
        return "Formato de dados inválido.";
    }
  }

  // Authentication errors
  if (err.message) {
    const msg = err.message.toLowerCase();

    if (msg.includes("invalid login credentials") || msg.includes("invalid credentials")) {
      return "Email ou senha incorretos.";
    }

    if (msg.includes("already registered") || msg.includes("already exists")) {
      return "Este email já está cadastrado.";
    }

    if (msg.includes("email not confirmed")) {
      return "Por favor, confirme seu email antes de fazer login.";
    }

    if (msg.includes("unauthorized") || msg.includes("não autenticado")) {
      return "Você precisa estar logado para realizar esta ação.";
    }

    if (msg.includes("não autorizado")) {
      return "Você não tem permissão para realizar esta ação.";
    }

    if (msg.includes("network") || msg.includes("fetch")) {
      return "Erro de conexão. Verifique sua internet.";
    }
  }

  // HTTP status codes
  if (err.status) {
    switch (err.status) {
      case 401:
        return "Sessão expirada. Por favor, faça login novamente.";
      case 403:
        return "Você não tem permissão para realizar esta ação.";
      case 404:
        return "Registro não encontrado.";
      case 409:
        return "Este registro já existe.";
      case 422:
        return "Dados inválidos. Verifique as informações.";
      case 500:
      case 502:
      case 503:
        return "Erro no servidor. Tente novamente em alguns instantes.";
    }
  }

  // Default generic message
  return "Erro ao processar solicitação. Tente novamente.";
}
