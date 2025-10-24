import { supabase } from "@/integrations/supabase/client";

// Interfaces - mantendo compatibilidade com o código existente
export interface Cliente {
  id: string;
  nome: string;
  cpf: string;
  observacoes: string;
  created_at?: string;
  criadoEm?: string; // Para compatibilidade
}

export interface Visitador {
  id: string;
  nome: string;
  cpf: string;
  observacoes: string;
  created_at?: string;
  criadoEm?: string;
}

export interface Digitador {
  id: string;
  nome: string;
  cpf: string;
  observacoes: string;
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
  cliente_id: string | null;
  clienteId?: string; // Para compatibilidade
  cliente_nome: string;
  clienteNome?: string; // Para compatibilidade
  cliente_cpf?: string;
  digitador: string;
  liberador: string;
  fotos: string[];
  created_at?: string;
  criadoEm?: string;
}

// Clientes
export const getClientes = async (): Promise<Cliente[]> => {
  const { data, error } = await (supabase as any)
    .from('clientes')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  return (data || []).map(cliente => ({
    ...cliente,
    criadoEm: cliente.created_at
  }));
};

export const saveCliente = async (cliente: Omit<Cliente, 'id' | 'criadoEm' | 'created_at'>): Promise<Cliente> => {
  const { data, error } = await (supabase as any)
    .from('clientes')
    .insert({
      nome: cliente.nome,
      cpf: cliente.cpf,
      observacoes: cliente.observacoes
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    ...data!,
    criadoEm: data!.created_at
  };
};

export const updateCliente = async (id: string, cliente: Partial<Omit<Cliente, 'id' | 'criadoEm' | 'created_at'>>): Promise<Cliente> => {
  const { data, error } = await (supabase as any)
    .from('clientes')
    .update({
      nome: cliente.nome,
      cpf: cliente.cpf,
      observacoes: cliente.observacoes
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    ...data!,
    criadoEm: data!.created_at
  };
};

export const deleteCliente = async (id: string): Promise<void> => {
  const { error } = await (supabase as any)
    .from('clientes')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Visitadores
export const getVisitadores = async (): Promise<Visitador[]> => {
  const { data, error } = await (supabase as any)
    .from('vistoriadores')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  return (data || []).map(visitador => ({
    ...visitador,
    criadoEm: visitador.created_at
  }));
};

export const saveVisitador = async (visitador: Omit<Visitador, 'id' | 'criadoEm' | 'created_at'>): Promise<Visitador> => {
  const { data, error } = await (supabase as any)
    .from('vistoriadores')
    .insert({
      nome: visitador.nome,
      cpf: visitador.cpf,
      observacoes: visitador.observacoes
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    ...data!,
    criadoEm: data!.created_at
  };
};

export const updateVisitador = async (id: string, visitador: Partial<Omit<Visitador, 'id' | 'criadoEm' | 'created_at'>>): Promise<Visitador> => {
  const { data, error } = await (supabase as any)
    .from('vistoriadores')
    .update({
      nome: visitador.nome,
      cpf: visitador.cpf,
      observacoes: visitador.observacoes
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    ...data!,
    criadoEm: data!.created_at
  };
};

export const deleteVisitador = async (id: string): Promise<void> => {
  const { error } = await (supabase as any)
    .from('vistoriadores')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Digitadores
export const getDigitadores = async (): Promise<Digitador[]> => {
  const { data, error } = await (supabase as any)
    .from('digitadores')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  return (data || []).map(digitador => ({
    ...digitador,
    criadoEm: digitador.created_at
  }));
};

export const saveDigitador = async (digitador: Omit<Digitador, 'id' | 'criadoEm' | 'created_at'>): Promise<Digitador> => {
  const { data, error } = await (supabase as any)
    .from('digitadores')
    .insert({
      nome: digitador.nome,
      cpf: digitador.cpf,
      observacoes: digitador.observacoes
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    ...data!,
    criadoEm: data!.created_at
  };
};

export const updateDigitador = async (id: string, digitador: Partial<Omit<Digitador, 'id' | 'criadoEm' | 'created_at'>>): Promise<Digitador> => {
  const { data, error } = await (supabase as any)
    .from('digitadores')
    .update({
      nome: digitador.nome,
      cpf: digitador.cpf,
      observacoes: digitador.observacoes
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    ...data!,
    criadoEm: data!.created_at
  };
};

export const deleteDigitador = async (id: string): Promise<void> => {
  const { error } = await (supabase as any)
    .from('digitadores')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Vistorias
export const getVistorias = async (): Promise<Vistoria[]> => {
  const { data, error } = await (supabase as any)
    .from('vistorias')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  return (data || []).map(vistoria => ({
    ...vistoria,
    clienteId: vistoria.cliente_id,
    clienteNome: vistoria.cliente_nome,
    criadoEm: vistoria.created_at,
    valor: vistoria.valor.toString()
  }));
};

export const saveVistoria = async (vistoria: Omit<Vistoria, 'id' | 'criadoEm' | 'created_at'>): Promise<Vistoria> => {
  const { data, error } = await (supabase as any)
    .from('vistorias')
    .insert({
      modelo: vistoria.modelo,
      placa: vistoria.placa,
      pagamento: vistoria.pagamento,
      valor: parseFloat(vistoria.valor),
      situacao: vistoria.situacao,
      cliente_id: vistoria.clienteId || vistoria.cliente_id,
      cliente_nome: vistoria.clienteNome || vistoria.cliente_nome,
      cliente_cpf: vistoria.cliente_cpf,
      digitador: vistoria.digitador,
      liberador: vistoria.liberador,
      fotos: vistoria.fotos || []
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    ...data!,
    clienteId: data!.cliente_id,
    clienteNome: data!.cliente_nome,
    criadoEm: data!.created_at,
    valor: data!.valor.toString()
  };
};

export const updateVistoria = async (id: string, vistoria: Partial<Vistoria>): Promise<Vistoria> => {
  const updateData: any = {};
  
  if (vistoria.modelo !== undefined) updateData.modelo = vistoria.modelo;
  if (vistoria.placa !== undefined) updateData.placa = vistoria.placa;
  if (vistoria.pagamento !== undefined) updateData.pagamento = vistoria.pagamento;
  if (vistoria.valor !== undefined) updateData.valor = parseFloat(vistoria.valor);
  if (vistoria.situacao !== undefined) updateData.situacao = vistoria.situacao;
  if (vistoria.cliente_nome !== undefined) updateData.cliente_nome = vistoria.cliente_nome;
  if (vistoria.cliente_cpf !== undefined) updateData.cliente_cpf = vistoria.cliente_cpf;
  if (vistoria.digitador !== undefined) updateData.digitador = vistoria.digitador;
  if (vistoria.liberador !== undefined) updateData.liberador = vistoria.liberador;

  const { data, error } = await (supabase as any)
    .from('vistorias')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    ...data!,
    clienteId: data!.cliente_id,
    clienteNome: data!.cliente_nome,
    criadoEm: data!.created_at,
    valor: data!.valor.toString()
  };
};

export const deleteVistoria = async (id: string): Promise<void> => {
  const { error } = await (supabase as any)
    .from('vistorias')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};
