import { supabase } from "@/integrations/supabase/client";
import { getUserFriendlyError } from "./errorHandler";

export interface Cliente {
  id: string;
  nome: string;
  cpf: string;
  observacoes: string;
  foto_url?: string;
  user_id?: string;
  created_at?: string;
  criadoEm?: string;
}

export interface Visitador {
  id: string;
  nome: string;
  cpf: string;
  observacoes: string;
  foto_url?: string;
  user_id?: string;
  created_at?: string;
  criadoEm?: string;
}

export interface Digitador {
  id: string;
  nome: string;
  cpf: string;
  observacoes: string;
  foto_url?: string;
  user_id?: string;
  created_at?: string;
  criadoEm?: string;
}

export interface Vistoria {
  id: string;
  modelo: string;
  placa: string;
  pagamento: string;
  valor: string;
  situacao: string;
  tipo: string;
  cliente_id: string | null;
  clienteId?: string;
  cliente_nome: string;
  clienteNome?: string;
  cliente_cpf?: string;
  digitador: string;
  liberador: string;
  fotos: string[];
  modalidade: string;
  user_id?: string;
  created_at?: string;
  criadoEm?: string;
}

// ============================================
// GENERIC CRUD OPERATIONS
// ============================================

/**
 * Get authenticated user or throw error
 */
const getAuthUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  return user;
};

/**
 * Generic function to get all records from a table
 */
const getRecords = async <T>(tableName: string, operationName: string): Promise<T[]> => {
  await getAuthUser();

  const { data, error } = await (supabase as any)
    .from(tableName)
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    const friendlyMessage = getUserFriendlyError(error, operationName);
    throw new Error(friendlyMessage);
  }
  
  return (data || []).map((record: any) => ({
    ...record,
    criadoEm: record.created_at
  }));
};

/**
 * Generic function to save a record to a table
 */
const saveRecord = async <T>(
  tableName: string, 
  recordData: any, 
  operationName: string
): Promise<T> => {
  const user = await getAuthUser();

  const { data, error } = await (supabase as any)
    .from(tableName)
    .insert({ ...recordData, user_id: user.id })
    .select()
    .single();
  
  if (error) {
    const friendlyMessage = getUserFriendlyError(error, operationName);
    throw new Error(friendlyMessage);
  }
  
  return {
    ...data!,
    criadoEm: data!.created_at
  };
};

/**
 * Generic function to update a record in a table
 */
const updateRecord = async <T>(
  tableName: string,
  id: string,
  recordData: any,
  operationName: string
): Promise<T> => {
  await getAuthUser();

  const { data, error } = await (supabase as any)
    .from(tableName)
    .update(recordData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    const friendlyMessage = getUserFriendlyError(error, operationName);
    throw new Error(friendlyMessage);
  }
  
  return {
    ...data!,
    criadoEm: data!.created_at
  };
};

/**
 * Generic function to delete a record from a table
 */
const deleteRecord = async (tableName: string, id: string, operationName: string): Promise<void> => {
  await getAuthUser();

  const { error } = await (supabase as any)
    .from(tableName)
    .delete()
    .eq('id', id);
  
  if (error) {
    const friendlyMessage = getUserFriendlyError(error, operationName);
    throw new Error(friendlyMessage);
  }
};

// ============================================
// CLIENTES
// ============================================

export const getClientes = async (): Promise<Cliente[]> => 
  getRecords<Cliente>('clientes', 'getClientes');

export const saveCliente = async (cliente: Omit<Cliente, 'id' | 'criadoEm' | 'created_at' | 'user_id'>): Promise<Cliente> =>
  saveRecord<Cliente>('clientes', {
    nome: cliente.nome,
    cpf: cliente.cpf,
    observacoes: cliente.observacoes,
    foto_url: cliente.foto_url,
  }, 'saveCliente');

export const updateCliente = async (id: string, cliente: Partial<Omit<Cliente, 'id' | 'criadoEm' | 'created_at' | 'user_id'>>): Promise<Cliente> =>
  updateRecord<Cliente>('clientes', id, {
    nome: cliente.nome,
    cpf: cliente.cpf,
    observacoes: cliente.observacoes,
    foto_url: cliente.foto_url
  }, 'updateCliente');

export const deleteCliente = async (id: string): Promise<void> =>
  deleteRecord('clientes', id, 'deleteCliente');

// ============================================
// VISITADORES
// ============================================

export const getVisitadores = async (): Promise<Visitador[]> =>
  getRecords<Visitador>('vistoriadores', 'getVisitadores');

export const saveVisitador = async (visitador: Omit<Visitador, 'id' | 'criadoEm' | 'created_at' | 'user_id'>): Promise<Visitador> =>
  saveRecord<Visitador>('vistoriadores', {
    nome: visitador.nome,
    cpf: visitador.cpf,
    observacoes: visitador.observacoes,
    foto_url: visitador.foto_url,
  }, 'saveVisitador');

export const updateVisitador = async (id: string, visitador: Partial<Omit<Visitador, 'id' | 'criadoEm' | 'created_at' | 'user_id'>>): Promise<Visitador> =>
  updateRecord<Visitador>('vistoriadores', id, {
    nome: visitador.nome,
    cpf: visitador.cpf,
    observacoes: visitador.observacoes,
    foto_url: visitador.foto_url
  }, 'updateVisitador');

export const deleteVisitador = async (id: string): Promise<void> =>
  deleteRecord('vistoriadores', id, 'deleteVisitador');

// ============================================
// DIGITADORES
// ============================================

export const getDigitadores = async (): Promise<Digitador[]> =>
  getRecords<Digitador>('digitadores', 'getDigitadores');

export const saveDigitador = async (digitador: Omit<Digitador, 'id' | 'criadoEm' | 'created_at' | 'user_id'>): Promise<Digitador> =>
  saveRecord<Digitador>('digitadores', {
    nome: digitador.nome,
    cpf: digitador.cpf,
    observacoes: digitador.observacoes,
    foto_url: digitador.foto_url,
  }, 'saveDigitador');

export const updateDigitador = async (id: string, digitador: Partial<Omit<Digitador, 'id' | 'criadoEm' | 'created_at' | 'user_id'>>): Promise<Digitador> =>
  updateRecord<Digitador>('digitadores', id, {
    nome: digitador.nome,
    cpf: digitador.cpf,
    observacoes: digitador.observacoes,
    foto_url: digitador.foto_url
  }, 'updateDigitador');

export const deleteDigitador = async (id: string): Promise<void> =>
  deleteRecord('digitadores', id, 'deleteDigitador');

// ============================================
// VISTORIAS (has special logic, kept separate)
// ============================================

export const getVistorias = async (): Promise<Vistoria[]> => {
  await getAuthUser();

  const { data, error } = await (supabase as any)
    .from('vistorias')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    const friendlyMessage = getUserFriendlyError(error, "getVistorias");
    throw new Error(friendlyMessage);
  }
  
  return (data || []).map(vistoria => ({
    ...vistoria,
    criadoEm: vistoria.created_at,
    clienteId: vistoria.cliente_id,
    clienteNome: vistoria.cliente_nome
  }));
};

export const saveVistoria = async (vistoria: Omit<Vistoria, 'id' | 'criadoEm' | 'created_at' | 'user_id'>): Promise<Vistoria> => {
  const user = await getAuthUser();

  const { data, error } = await (supabase as any)
    .from('vistorias')
    .insert({
      modelo: vistoria.modelo,
      placa: vistoria.placa,
      pagamento: vistoria.pagamento,
      valor: typeof vistoria.valor === 'string' ? parseFloat(vistoria.valor.replace(/[^\d,]/g, '').replace(',', '.')) : vistoria.valor,
      situacao: vistoria.situacao,
      tipo: vistoria.tipo,
      modalidade: vistoria.modalidade,
      cliente_id: vistoria.cliente_id || vistoria.clienteId,
      cliente_nome: vistoria.cliente_nome || vistoria.clienteNome,
      cliente_cpf: vistoria.cliente_cpf,
      digitador: vistoria.digitador,
      liberador: vistoria.liberador,
      fotos: vistoria.fotos || [],
      user_id: user.id
    })
    .select()
    .single();
  
  if (error) {
    const friendlyMessage = getUserFriendlyError(error, "saveVistoria");
    throw new Error(friendlyMessage);
  }
  
  return {
    ...data!,
    criadoEm: data!.created_at,
    clienteId: data!.cliente_id,
    clienteNome: data!.cliente_nome
  };
};

export const updateVistoria = async (id: string, vistoria: Partial<Omit<Vistoria, 'id' | 'criadoEm' | 'created_at' | 'user_id'>>): Promise<Vistoria> => {
  await getAuthUser();

  const updateData: any = {};
  
  if (vistoria.modelo !== undefined) updateData.modelo = vistoria.modelo;
  if (vistoria.placa !== undefined) updateData.placa = vistoria.placa;
  if (vistoria.pagamento !== undefined) updateData.pagamento = vistoria.pagamento;
  if (vistoria.valor !== undefined) {
    updateData.valor = typeof vistoria.valor === 'string'
      ? parseFloat(vistoria.valor.replace(/[^\d,]/g, '').replace(',', '.'))
      : vistoria.valor;
  }
  if (vistoria.situacao !== undefined) updateData.situacao = vistoria.situacao;
  if (vistoria.tipo !== undefined) updateData.tipo = vistoria.tipo;
  if (vistoria.modalidade !== undefined) updateData.modalidade = vistoria.modalidade;
  if (vistoria.cliente_id !== undefined) updateData.cliente_id = vistoria.cliente_id;
  if (vistoria.cliente_nome !== undefined) updateData.cliente_nome = vistoria.cliente_nome;
  if (vistoria.cliente_cpf !== undefined) updateData.cliente_cpf = vistoria.cliente_cpf;
  if (vistoria.digitador !== undefined) updateData.digitador = vistoria.digitador;
  if (vistoria.liberador !== undefined) updateData.liberador = vistoria.liberador;
  if (vistoria.fotos !== undefined) updateData.fotos = vistoria.fotos;

  const { data, error } = await (supabase as any)
    .from('vistorias')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    const friendlyMessage = getUserFriendlyError(error, "updateVistoria");
    throw new Error(friendlyMessage);
  }
  
  return {
    ...data!,
    criadoEm: data!.created_at,
    clienteId: data!.cliente_id,
    clienteNome: data!.cliente_nome
  };
};

export const deleteVistoria = async (id: string): Promise<void> =>
  deleteRecord('vistorias', id, 'deleteVistoria');
