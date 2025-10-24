-- Adicionar coluna cliente_cpf na tabela vistorias
ALTER TABLE public.vistorias 
ADD COLUMN IF NOT EXISTS cliente_cpf TEXT;