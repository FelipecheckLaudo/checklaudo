/**
 * Generic types for the application
 * Consolidates common data structures to reduce duplication
 */

// Base interface for person entities (Cliente, Digitador, Visitador)
export interface Person {
  id: string;
  nome: string;
  cpf: string;
  observacoes?: string;
  foto_url?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

// Specific types that extend Person
export type Cliente = Person;
export type Digitador = Person;
export type Visitador = Person;

// Vistoria type
export interface Vistoria {
  id: string;
  placa: string;
  modelo: string;
  tipo: string;
  valor: string;
  pagamento: string;
  situacao: string;
  modalidade: string;
  clienteId?: string;
  cliente_id?: string;
  clienteNome?: string;
  cliente_nome?: string;
  cliente_cpf?: string;
  digitador?: string;
  liberador?: string;
  fotos?: string[];
  criadoEm?: string;
  created_at?: string;
  user_id?: string;
}

// Generic CRUD operations type
export type CrudOperations<T> = {
  data: T[];
  isLoading: boolean;
  isSaving: boolean;
  save: (item: Partial<T>) => Promise<T>;
  update: (id: string, item: Partial<T>) => Promise<void>;
  remove: (id: string) => Promise<void>;
};
