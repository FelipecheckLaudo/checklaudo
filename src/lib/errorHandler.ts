interface PostgresError {
  code?: string;
  message?: string;
}

interface SupabaseError {
  code?: string;
  message?: string;
  status?: number;
}

/**
 * Maps database errors to user-friendly messages
 */
export function getUserFriendlyError(
  error: unknown,
  context?: string
): string {
  if (import.meta.env.DEV) {
    console.error(`Error in ${context || "operation"}`, error);
  }

  // Handle null/undefined errors
  if (!error) {
    return "Erro ao processar solicitação. Tente novamente.";
  }

  const err = error as PostgresError & SupabaseError;

  // Database constraint errors
  if (err.code === "23505") return "Este registro já existe no sistema.";
  if (err.code === "23514") return "Dados inválidos. Verifique as informações.";
  if (err.code === "23502") return "Campos obrigatórios não foram preenchidos.";
  
  // Authentication errors
  if (err.message) {
    const msg = err.message.toLowerCase();
    if (msg.includes("invalid") && msg.includes("credentials")) return "Email ou senha incorretos.";
    if (msg.includes("unauthorized") || msg.includes("não autenticado")) return "Você precisa estar logado.";
    if (msg.includes("network") || msg.includes("fetch")) return "Erro de conexão. Verifique sua internet.";
  }

  // HTTP status codes
  if (err.status === 401) return "Sessão expirada. Faça login novamente.";
  if (err.status === 403) return "Você não tem permissão para esta ação.";
  if (err.status === 404) return "Registro não encontrado.";
  if (err.status >= 500) return "Erro no servidor. Tente novamente.";

  // Default generic message
  return "Erro ao processar solicitação. Tente novamente.";
}
