import { supabase } from "@/integrations/supabase/client";

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

// Clientes
export const getClientes = async (): Promise<Cliente[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

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

export const saveCliente = async (cliente: Omit<Cliente, 'id' | 'criadoEm' | 'created_at' | 'user_id'>): Promise<Cliente> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data, error } = await (supabase as any)
    .from('clientes')
    .insert({
      nome: cliente.nome,
      cpf: cliente.cpf,
      observacoes: cliente.observacoes,
      foto_url: cliente.foto_url,
      user_id: user.id
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    ...data!,
    criadoEm: data!.created_at
  };
};

export const updateCliente = async (id: string, cliente: Partial<Omit<Cliente, 'id' | 'criadoEm' | 'created_at' | 'user_id'>>): Promise<Cliente> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data, error } = await (supabase as any)
    .from('clientes')
    .update({
      nome: cliente.nome,
      cpf: cliente.cpf,
      observacoes: cliente.observacoes,
      foto_url: cliente.foto_url
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { error } = await (supabase as any)
    .from('clientes')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Visitadores
export const getVisitadores = async (): Promise<Visitador[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

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

export const saveVisitador = async (visitador: Omit<Visitador, 'id' | 'criadoEm' | 'created_at' | 'user_id'>): Promise<Visitador> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data, error } = await (supabase as any)
    .from('vistoriadores')
    .insert({
      nome: visitador.nome,
      cpf: visitador.cpf,
      observacoes: visitador.observacoes,
      foto_url: visitador.foto_url,
      user_id: user.id
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    ...data!,
    criadoEm: data!.created_at
  };
};

export const updateVisitador = async (id: string, visitador: Partial<Omit<Visitador, 'id' | 'criadoEm' | 'created_at' | 'user_id'>>): Promise<Visitador> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data, error } = await (supabase as any)
    .from('vistoriadores')
    .update({
      nome: visitador.nome,
      cpf: visitador.cpf,
      observacoes: visitador.observacoes,
      foto_url: visitador.foto_url
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { error } = await (supabase as any)
    .from('vistoriadores')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Digitadores
export const getDigitadores = async (): Promise<Digitador[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

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

export const saveDigitador = async (digitador: Omit<Digitador, 'id' | 'criadoEm' | 'created_at' | 'user_id'>): Promise<Digitador> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data, error } = await (supabase as any)
    .from('digitadores')
    .insert({
      nome: digitador.nome,
      cpf: digitador.cpf,
      observacoes: digitador.observacoes,
      foto_url: digitador.foto_url,
      user_id: user.id
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    ...data!,
    criadoEm: data!.created_at
  };
};

export const updateDigitador = async (id: string, digitador: Partial<Omit<Digitador, 'id' | 'criadoEm' | 'created_at' | 'user_id'>>): Promise<Digitador> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data, error } = await (supabase as any)
    .from('digitadores')
    .update({
      nome: digitador.nome,
      cpf: digitador.cpf,
      observacoes: digitador.observacoes,
      foto_url: digitador.foto_url
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { error } = await (supabase as any)
    .from('digitadores')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Vistorias
export const getVistorias = async (): Promise<Vistoria[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data, error } = await (supabase as any)
    .from('vistorias')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  return (data || []).map(vistoria => ({
    ...vistoria,
    criadoEm: vistoria.created_at,
    clienteId: vistoria.cliente_id,
    clienteNome: vistoria.cliente_nome
  }));
};

export const saveVistoria = async (vistoria: Omit<Vistoria, 'id' | 'criadoEm' | 'created_at' | 'user_id'>): Promise<Vistoria> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data, error } = await (supabase as any)
    .from('vistorias')
    .insert({
      modelo: vistoria.modelo,
      placa: vistoria.placa,
      pagamento: vistoria.pagamento,
      valor: typeof vistoria.valor === 'string' ? parseFloat(vistoria.valor.replace(/[^\d,]/g, '').replace(',', '.')) : vistoria.valor,
      situacao: vistoria.situacao,
      tipo: vistoria.tipo,
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
  
  if (error) throw error;
  
  return {
    ...data!,
    criadoEm: data!.created_at,
    clienteId: data!.cliente_id,
    clienteNome: data!.cliente_nome
  };
};

export const updateVistoria = async (id: string, vistoria: Partial<Omit<Vistoria, 'id' | 'criadoEm' | 'created_at' | 'user_id'>>): Promise<Vistoria> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

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
  
  if (error) throw error;
  
  return {
    ...data!,
    criadoEm: data!.created_at,
    clienteId: data!.cliente_id,
    clienteNome: data!.cliente_nome
  };
};

export const deleteVistoria = async (id: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { error } = await (supabase as any)
    .from('vistorias')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};
