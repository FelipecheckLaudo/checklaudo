-- Adicionar coluna tipo na tabela vistorias
ALTER TABLE public.vistorias 
ADD COLUMN tipo text NOT NULL DEFAULT 'ECV/TRANSFERENCIA';

-- Adicionar comentário para documentar os valores possíveis
COMMENT ON COLUMN public.vistorias.tipo IS 'Tipos possíveis: ECV/TRANSFERENCIA, REVISTORIA/INFRAÇÃO DE TRÂNSITO, CAUTELAR, VISTORIA PRÉVIA, SEGURADORA, PESQUISA';