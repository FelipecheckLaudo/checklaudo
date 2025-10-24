-- Tabela de Clientes
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Vistoriadores  
CREATE TABLE vistoriadores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Digitadores
CREATE TABLE digitadores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Vistorias
CREATE TABLE vistorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modelo TEXT NOT NULL,
  placa TEXT NOT NULL,
  pagamento TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  situacao TEXT NOT NULL DEFAULT 'PENDENTE',
  cliente_id UUID REFERENCES clientes(id) ON DELETE RESTRICT,
  cliente_nome TEXT NOT NULL,
  digitador TEXT,
  liberador TEXT,
  fotos TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_vistorias_cliente ON vistorias(cliente_id);
CREATE INDEX idx_vistorias_placa ON vistorias(placa);
CREATE INDEX idx_vistorias_created ON vistorias(created_at DESC);
CREATE INDEX idx_clientes_cpf ON clientes(cpf);
CREATE INDEX idx_vistoriadores_cpf ON vistoriadores(cpf);
CREATE INDEX idx_digitadores_cpf ON digitadores(cpf);

-- Triggers para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clientes_updated_at
  BEFORE UPDATE ON clientes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vistoriadores_updated_at
  BEFORE UPDATE ON vistoriadores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_digitadores_updated_at
  BEFORE UPDATE ON digitadores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vistorias_updated_at
  BEFORE UPDATE ON vistorias
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS) em todas as tabelas
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vistoriadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE digitadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE vistorias ENABLE ROW LEVEL SECURITY;

-- Políticas temporárias de acesso público (será substituído por auth no futuro)
CREATE POLICY "Permitir todas operações em clientes" ON clientes FOR ALL USING (true);
CREATE POLICY "Permitir todas operações em vistoriadores" ON vistoriadores FOR ALL USING (true);
CREATE POLICY "Permitir todas operações em digitadores" ON digitadores FOR ALL USING (true);
CREATE POLICY "Permitir todas operações em vistorias" ON vistorias FOR ALL USING (true);

-- Criar bucket de storage para fotos de vistorias
INSERT INTO storage.buckets (id, name, public) 
VALUES ('vistoria-fotos', 'vistoria-fotos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para acesso público às fotos
CREATE POLICY "Fotos são publicamente acessíveis"
ON storage.objects FOR SELECT
USING (bucket_id = 'vistoria-fotos');

CREATE POLICY "Permitir upload de fotos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'vistoria-fotos');

CREATE POLICY "Permitir atualização de fotos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'vistoria-fotos');

CREATE POLICY "Permitir deleção de fotos"
ON storage.objects FOR DELETE
USING (bucket_id = 'vistoria-fotos');