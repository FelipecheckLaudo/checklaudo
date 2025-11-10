export function getUserFriendlyError(error: any): string {
  if (import.meta.env.DEV) console.error(error);
  
  if (!error) return "Erro desconhecido";
  
  const code = error.code;
  const msg = error.message?.toLowerCase() || "";
  
  // Database
  if (code === "23505") return "Registro duplicado";
  if (code === "23502") return "Campos obrigatórios faltando";
  
  // Auth
  if (msg.includes("invalid") || msg.includes("incorrect")) return "Credenciais inválidas";
  if (msg.includes("unauthorized")) return "Não autorizado";
  if (msg.includes("network")) return "Erro de conexão";
  
  return error.message || "Erro ao processar";
}
