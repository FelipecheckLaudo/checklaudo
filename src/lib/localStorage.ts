import type { Cliente, Digitador, Visitador, Vistoria } from "./types";

const STORAGE_KEYS = {
  CLIENTES: 'vistorias_clientes',
  DIGITADORES: 'vistorias_digitadores',
  VISITADORES: 'vistorias_visitadores',
  VISTORIAS: 'vistorias_vistorias',
};

// Generic storage functions
const getFromStorage = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveToStorage = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

const generateId = () => crypto.randomUUID();

// Generic CRUD operations
const createCrudOperations = <T extends { id: string }>(storageKey: string) => ({
  getAll: async (): Promise<T[]> => {
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async
    return getFromStorage<T>(storageKey);
  },
  
  save: async (item: any): Promise<T> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const items = getFromStorage<T>(storageKey);
    const newItem: any = {
      ...item,
      id: generateId(),
      criadoEm: new Date().toISOString(),
    };
    items.unshift(newItem);
    saveToStorage(storageKey, items);
    return newItem;
  },
  
  update: async (id: string, updates: Partial<T>): Promise<T> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const items = getFromStorage<T>(storageKey);
    const index = items.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Item não encontrado');
    
    items[index] = { ...items[index], ...updates };
    saveToStorage(storageKey, items);
    return items[index];
  },
  
  delete: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const items = getFromStorage<T>(storageKey);
    const filtered = items.filter(item => item.id !== id);
    saveToStorage(storageKey, filtered);
  },
});

// Clientes
export const getClientes = () => createCrudOperations<Cliente>(STORAGE_KEYS.CLIENTES).getAll();
export const saveCliente = (cliente: any) => createCrudOperations<Cliente>(STORAGE_KEYS.CLIENTES).save(cliente);
export const updateCliente = (id: string, cliente: any) => createCrudOperations<Cliente>(STORAGE_KEYS.CLIENTES).update(id, cliente);
export const deleteCliente = (id: string) => createCrudOperations<Cliente>(STORAGE_KEYS.CLIENTES).delete(id);

// Visitadores
export const getVisitadores = () => createCrudOperations<Visitador>(STORAGE_KEYS.VISITADORES).getAll();
export const saveVisitador = (visitador: any) => createCrudOperations<Visitador>(STORAGE_KEYS.VISITADORES).save(visitador);
export const updateVisitador = (id: string, visitador: any) => createCrudOperations<Visitador>(STORAGE_KEYS.VISITADORES).update(id, visitador);
export const deleteVisitador = (id: string) => createCrudOperations<Visitador>(STORAGE_KEYS.VISITADORES).delete(id);

// Digitadores
export const getDigitadores = () => createCrudOperations<Digitador>(STORAGE_KEYS.DIGITADORES).getAll();
export const saveDigitador = (digitador: any) => createCrudOperations<Digitador>(STORAGE_KEYS.DIGITADORES).save(digitador);
export const updateDigitador = (id: string, digitador: any) => createCrudOperations<Digitador>(STORAGE_KEYS.DIGITADORES).update(id, digitador);
export const deleteDigitador = (id: string) => createCrudOperations<Digitador>(STORAGE_KEYS.DIGITADORES).delete(id);

// Vistorias
export const getVistorias = async (): Promise<Vistoria[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return getFromStorage<Vistoria>(STORAGE_KEYS.VISTORIAS);
};

export const saveVistoria = async (vistoria: any): Promise<Vistoria> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const vistorias = getFromStorage<Vistoria>(STORAGE_KEYS.VISTORIAS);
  const newVistoria = {
    ...vistoria,
    id: generateId(),
    criadoEm: new Date().toISOString(),
    valor: typeof vistoria.valor === 'string' ? parseFloat(vistoria.valor.replace(/[^\d,]/g, '').replace(',', '.')) : vistoria.valor,
    fotos: vistoria.fotos || [],
  } as Vistoria;
  vistorias.unshift(newVistoria);
  saveToStorage(STORAGE_KEYS.VISTORIAS, vistorias);
  return newVistoria;
};

export const updateVistoria = async (id: string, vistoria: any): Promise<Vistoria> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const vistorias = getFromStorage<Vistoria>(STORAGE_KEYS.VISTORIAS);
  const index = vistorias.findIndex(v => v.id === id);
  if (index === -1) throw new Error('Vistoria não encontrada');
  
  const updateData = { ...vistoria };
  if (vistoria.valor !== undefined) {
    updateData.valor = typeof vistoria.valor === 'string'
      ? parseFloat(vistoria.valor.replace(/[^\d,]/g, '').replace(',', '.'))
      : vistoria.valor;
  }
  
  vistorias[index] = { ...vistorias[index], ...updateData };
  saveToStorage(STORAGE_KEYS.VISTORIAS, vistorias);
  return vistorias[index];
};

export const deleteVistoria = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const vistorias = getFromStorage<Vistoria>(STORAGE_KEYS.VISTORIAS);
  const filtered = vistorias.filter(v => v.id !== id);
  saveToStorage(STORAGE_KEYS.VISTORIAS, filtered);
};

// Re-export types
export type { Cliente, Digitador, Visitador, Vistoria };
