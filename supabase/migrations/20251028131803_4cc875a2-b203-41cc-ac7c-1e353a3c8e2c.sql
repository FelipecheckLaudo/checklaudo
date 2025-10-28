-- Adicionar coluna foto_url nas tabelas de cadastro
ALTER TABLE public.clientes 
ADD COLUMN foto_url text;

ALTER TABLE public.vistoriadores 
ADD COLUMN foto_url text;

ALTER TABLE public.digitadores 
ADD COLUMN foto_url text;