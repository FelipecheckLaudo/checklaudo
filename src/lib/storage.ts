// Sistema de armazenamento local para dados do sistema

export interface Cliente {
  id: string;
  nome: string;
  cpf: string;
  observacoes: string;
  criadoEm: string;
}

export interface Visitador {
  id: string;
  nome: string;
  cpf: string;
  observacoes: string;
  criadoEm: string;
}

export interface Digitador {
  id: string;
  nome: string;
  cpf: string;
  observacoes: string;
  criadoEm: string;
}

export interface Vistoria {
  id: string;
  modelo: string;
  placa: string;
  pagamento: string;
  valor: string;
  situacao: string;
  clienteId: string;
  clienteNome: string;
  digitador: string;
  liberador: string;
  fotos: string[];
  criadoEm: string;
}

// Clientes
export const getClientes = (): Cliente[] => {
  const data = localStorage.getItem('clientes');
  return data ? JSON.parse(data) : [];
};

export const saveCliente = (cliente: Omit<Cliente, 'id' | 'criadoEm'>): Cliente => {
  const clientes = getClientes();
  const novoCliente: Cliente = {
    ...cliente,
    id: crypto.randomUUID(),
    criadoEm: new Date().toISOString(),
  };
  clientes.push(novoCliente);
  localStorage.setItem('clientes', JSON.stringify(clientes));
  return novoCliente;
};

export const deleteCliente = (id: string): void => {
  const clientes = getClientes().filter(c => c.id !== id);
  localStorage.setItem('clientes', JSON.stringify(clientes));
};

// Visitadores
export const getVisitadores = (): Visitador[] => {
  const data = localStorage.getItem('visitadores');
  return data ? JSON.parse(data) : [];
};

export const saveVisitador = (visitador: Omit<Visitador, 'id' | 'criadoEm'>): Visitador => {
  const visitadores = getVisitadores();
  const novoVisitador: Visitador = {
    ...visitador,
    id: crypto.randomUUID(),
    criadoEm: new Date().toISOString(),
  };
  visitadores.push(novoVisitador);
  localStorage.setItem('visitadores', JSON.stringify(visitadores));
  return novoVisitador;
};

export const deleteVisitador = (id: string): void => {
  const visitadores = getVisitadores().filter(v => v.id !== id);
  localStorage.setItem('visitadores', JSON.stringify(visitadores));
};

// Digitadores
export const getDigitadores = (): Digitador[] => {
  const data = localStorage.getItem('digitadores');
  return data ? JSON.parse(data) : [];
};

export const saveDigitador = (digitador: Omit<Digitador, 'id' | 'criadoEm'>): Digitador => {
  const digitadores = getDigitadores();
  const novoDigitador: Digitador = {
    ...digitador,
    id: crypto.randomUUID(),
    criadoEm: new Date().toISOString(),
  };
  digitadores.push(novoDigitador);
  localStorage.setItem('digitadores', JSON.stringify(digitadores));
  return novoDigitador;
};

export const deleteDigitador = (id: string): void => {
  const digitadores = getDigitadores().filter(d => d.id !== id);
  localStorage.setItem('digitadores', JSON.stringify(digitadores));
};

// Vistorias
export const getVistorias = (): Vistoria[] => {
  const data = localStorage.getItem('vistorias');
  return data ? JSON.parse(data) : [];
};

export const saveVistoria = (vistoria: Omit<Vistoria, 'id' | 'criadoEm'>): Vistoria => {
  const vistorias = getVistorias();
  const novaVistoria: Vistoria = {
    ...vistoria,
    id: crypto.randomUUID(),
    criadoEm: new Date().toISOString(),
  };
  vistorias.push(novaVistoria);
  localStorage.setItem('vistorias', JSON.stringify(vistorias));
  return novaVistoria;
};

export const deleteVistoria = (id: string): void => {
  const vistorias = getVistorias().filter(v => v.id !== id);
  localStorage.setItem('vistorias', JSON.stringify(vistorias));
};
