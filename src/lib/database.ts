import { supabase } from "@/integrations/supabase/client";
import { getUserFriendlyError } from "./errorHandler";
import type { Cliente, Digitador, Visitador, Vistoria } from "./types";

// Re-export types for backward compatibility
export type { Cliente, Digitador, Visitador, Vistoria };

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
const getRecords = async <T>(tableName: string): Promise<T[]> => {
  await getAuthUser();

  const { data, error } = await (supabase as any)
    .from(tableName)
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw new Error(getUserFriendlyError(error));
  
  return (data || []).map((record: any) => ({
    ...record,
    criadoEm: record.created_at
  }));
};

/**
 * Generic function to save a record to a table
 */
const saveRecord = async <T>(tableName: string, recordData: any): Promise<T> => {
  const user = await getAuthUser();

  const { data, error } = await (supabase as any)
    .from(tableName)
    .insert({ ...recordData, user_id: user.id })
    .select()
    .single();
  
  if (error) throw new Error(getUserFriendlyError(error));
  
  return {
    ...data!,
    criadoEm: data!.created_at
  };
};

/**
 * Generic function to update a record in a table
 */
const updateRecord = async <T>(tableName: string, id: string, recordData: any): Promise<T> => {
  await getAuthUser();

  const { data, error } = await (supabase as any)
    .from(tableName)
    .update(recordData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw new Error(getUserFriendlyError(error));
  
  return {
    ...data!,
    criadoEm: data!.created_at
  };
};

/**
 * Generic function to delete a record from a table
 */
const deleteRecord = async (tableName: string, id: string): Promise<void> => {
  await getAuthUser();

  const { error } = await (supabase as any)
    .from(tableName)
    .delete()
    .eq('id', id);
  
  if (error) throw new Error(getUserFriendlyError(error));
};

// ============================================
// CLIENTES
// ============================================

export const getClientes = async (): Promise<Cliente[]> => getRecords<Cliente>('clientes');
export const saveCliente = async (cliente: any): Promise<Cliente> => saveRecord<Cliente>('clientes', cliente);
export const updateCliente = async (id: string, cliente: any): Promise<Cliente> => updateRecord<Cliente>('clientes', id, cliente);
export const deleteCliente = async (id: string): Promise<void> => deleteRecord('clientes', id);

// ============================================
// VISITADORES
// ============================================

export const getVisitadores = async (): Promise<Visitador[]> => getRecords<Visitador>('vistoriadores');
export const saveVisitador = async (visitador: any): Promise<Visitador> => saveRecord<Visitador>('vistoriadores', visitador);
export const updateVisitador = async (id: string, visitador: any): Promise<Visitador> => updateRecord<Visitador>('vistoriadores', id, visitador);
export const deleteVisitador = async (id: string): Promise<void> => deleteRecord('vistoriadores', id);

// ============================================
// DIGITADORES
// ============================================

export const getDigitadores = async (): Promise<Digitador[]> => getRecords<Digitador>('digitadores');
export const saveDigitador = async (digitador: any): Promise<Digitador> => saveRecord<Digitador>('digitadores', digitador);
export const updateDigitador = async (id: string, digitador: any): Promise<Digitador> => updateRecord<Digitador>('digitadores', id, digitador);
export const deleteDigitador = async (id: string): Promise<void> => deleteRecord('digitadores', id);

// ============================================
// VISTORIAS (has special logic)
// ============================================

export const getVistorias = async (): Promise<Vistoria[]> => {
  await getAuthUser();

  const { data, error } = await (supabase as any)
    .from('vistorias')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw new Error(getUserFriendlyError(error));
  
  return (data || []).map((vistoria: any) => ({
    ...vistoria,
    criadoEm: vistoria.created_at,
    clienteId: vistoria.cliente_id,
    clienteNome: vistoria.cliente_nome
  }));
};

export const saveVistoria = async (vistoria: any): Promise<Vistoria> => {
  const user = await getAuthUser();

  const { data, error } = await (supabase as any)
    .from('vistorias')
    .insert({
      ...vistoria,
      valor: typeof vistoria.valor === 'string' ? parseFloat(vistoria.valor.replace(/[^\d,]/g, '').replace(',', '.')) : vistoria.valor,
      cliente_id: vistoria.cliente_id || vistoria.clienteId,
      cliente_nome: vistoria.cliente_nome || vistoria.clienteNome,
      fotos: vistoria.fotos || [],
      user_id: user.id
    })
    .select()
    .single();
  
  if (error) throw new Error(getUserFriendlyError(error));
  
  return {
    ...data!,
    criadoEm: data!.created_at,
    clienteId: data!.cliente_id,
    clienteNome: data!.cliente_nome
  };
};

export const updateVistoria = async (id: string, vistoria: any): Promise<Vistoria> => {
  await getAuthUser();

  const updateData: any = { ...vistoria };
  
  if (vistoria.valor !== undefined) {
    updateData.valor = typeof vistoria.valor === 'string'
      ? parseFloat(vistoria.valor.replace(/[^\d,]/g, '').replace(',', '.'))
      : vistoria.valor;
  }

  const { data, error } = await (supabase as any)
    .from('vistorias')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw new Error(getUserFriendlyError(error));
  
  return {
    ...data!,
    criadoEm: data!.created_at,
    clienteId: data!.cliente_id,
    clienteNome: data!.cliente_nome
  };
};

export const deleteVistoria = async (id: string): Promise<void> => deleteRecord('vistorias', id);
