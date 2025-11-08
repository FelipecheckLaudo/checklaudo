-- Add server-side validation constraints and triggers for security

-- Function to validate CPF checksum
CREATE OR REPLACE FUNCTION validate_cpf(cpf_input text) 
RETURNS boolean 
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  clean_cpf text;
  sum_val integer;
  check_digit integer;
BEGIN
  -- Remove non-numeric characters
  clean_cpf := regexp_replace(cpf_input, '[^0-9]', '', 'g');
  
  -- Check length
  IF length(clean_cpf) != 11 THEN
    RETURN false;
  END IF;
  
  -- Check if all digits are the same
  IF clean_cpf ~ '^(\d)\1+$' THEN
    RETURN false;
  END IF;
  
  -- Validate first check digit
  sum_val := 0;
  FOR i IN 1..9 LOOP
    sum_val := sum_val + (substring(clean_cpf, i, 1)::integer * (11 - i));
  END LOOP;
  check_digit := 11 - (sum_val % 11);
  IF check_digit >= 10 THEN
    check_digit := 0;
  END IF;
  IF check_digit != substring(clean_cpf, 10, 1)::integer THEN
    RETURN false;
  END IF;
  
  -- Validate second check digit
  sum_val := 0;
  FOR i IN 1..10 LOOP
    sum_val := sum_val + (substring(clean_cpf, i, 1)::integer * (12 - i));
  END LOOP;
  check_digit := 11 - (sum_val % 11);
  IF check_digit >= 10 THEN
    check_digit := 0;
  END IF;
  IF check_digit != substring(clean_cpf, 11, 1)::integer THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Function to validate placa format (Brazilian license plates)
CREATE OR REPLACE FUNCTION validate_placa(placa_input text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Accept both old format (ABC-1234) and new Mercosul format (ABC1D23)
  RETURN placa_input ~ '^[A-Z]{3}-?[0-9][A-Z0-9][0-9]{2}$';
END;
$$;

-- Add validation triggers for clientes table
CREATE OR REPLACE FUNCTION validate_clientes_data()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Validate nome length (3-100 characters)
  IF length(trim(NEW.nome)) < 3 THEN
    RAISE EXCEPTION 'Nome deve ter no mínimo 3 caracteres';
  END IF;
  IF length(NEW.nome) > 100 THEN
    RAISE EXCEPTION 'Nome deve ter no máximo 100 caracteres';
  END IF;
  
  -- Validate CPF
  IF NOT validate_cpf(NEW.cpf) THEN
    RAISE EXCEPTION 'CPF inválido';
  END IF;
  
  -- Validate observacoes length (max 1000 characters)
  IF NEW.observacoes IS NOT NULL AND length(NEW.observacoes) > 1000 THEN
    RAISE EXCEPTION 'Observações devem ter no máximo 1000 caracteres';
  END IF;
  
  -- Validate user_id matches authenticated user
  IF NEW.user_id != auth.uid() AND NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Não autorizado a criar registro para outro usuário';
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_clientes_insert ON clientes;
CREATE TRIGGER validate_clientes_insert
  BEFORE INSERT ON clientes
  FOR EACH ROW
  EXECUTE FUNCTION validate_clientes_data();

DROP TRIGGER IF EXISTS validate_clientes_update ON clientes;
CREATE TRIGGER validate_clientes_update
  BEFORE UPDATE ON clientes
  FOR EACH ROW
  EXECUTE FUNCTION validate_clientes_data();

-- Add validation triggers for digitadores table
CREATE OR REPLACE FUNCTION validate_digitadores_data()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Validate nome length (3-100 characters)
  IF length(trim(NEW.nome)) < 3 THEN
    RAISE EXCEPTION 'Nome deve ter no mínimo 3 caracteres';
  END IF;
  IF length(NEW.nome) > 100 THEN
    RAISE EXCEPTION 'Nome deve ter no máximo 100 caracteres';
  END IF;
  
  -- Validate CPF
  IF NOT validate_cpf(NEW.cpf) THEN
    RAISE EXCEPTION 'CPF inválido';
  END IF;
  
  -- Validate observacoes length (max 1000 characters)
  IF NEW.observacoes IS NOT NULL AND length(NEW.observacoes) > 1000 THEN
    RAISE EXCEPTION 'Observações devem ter no máximo 1000 caracteres';
  END IF;
  
  -- Validate user_id matches authenticated user
  IF NEW.user_id != auth.uid() AND NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Não autorizado a criar registro para outro usuário';
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_digitadores_insert ON digitadores;
CREATE TRIGGER validate_digitadores_insert
  BEFORE INSERT ON digitadores
  FOR EACH ROW
  EXECUTE FUNCTION validate_digitadores_data();

DROP TRIGGER IF EXISTS validate_digitadores_update ON digitadores;
CREATE TRIGGER validate_digitadores_update
  BEFORE UPDATE ON digitadores
  FOR EACH ROW
  EXECUTE FUNCTION validate_digitadores_data();

-- Add validation triggers for vistoriadores table
CREATE OR REPLACE FUNCTION validate_vistoriadores_data()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Validate nome length (3-100 characters)
  IF length(trim(NEW.nome)) < 3 THEN
    RAISE EXCEPTION 'Nome deve ter no mínimo 3 caracteres';
  END IF;
  IF length(NEW.nome) > 100 THEN
    RAISE EXCEPTION 'Nome deve ter no máximo 100 caracteres';
  END IF;
  
  -- Validate CPF
  IF NOT validate_cpf(NEW.cpf) THEN
    RAISE EXCEPTION 'CPF inválido';
  END IF;
  
  -- Validate observacoes length (max 1000 characters)
  IF NEW.observacoes IS NOT NULL AND length(NEW.observacoes) > 1000 THEN
    RAISE EXCEPTION 'Observações devem ter no máximo 1000 caracteres';
  END IF;
  
  -- Validate user_id matches authenticated user
  IF NEW.user_id != auth.uid() AND NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Não autorizado a criar registro para outro usuário';
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_vistoriadores_insert ON vistoriadores;
CREATE TRIGGER validate_vistoriadores_insert
  BEFORE INSERT ON vistoriadores
  FOR EACH ROW
  EXECUTE FUNCTION validate_vistoriadores_data();

DROP TRIGGER IF EXISTS validate_vistoriadores_update ON vistoriadores;
CREATE TRIGGER validate_vistoriadores_update
  BEFORE UPDATE ON vistoriadores
  FOR EACH ROW
  EXECUTE FUNCTION validate_vistoriadores_data();

-- Add validation triggers for vistorias table
CREATE OR REPLACE FUNCTION validate_vistorias_data()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Validate placa format
  IF NOT validate_placa(NEW.placa) THEN
    RAISE EXCEPTION 'Formato de placa inválido';
  END IF;
  
  -- Validate modelo length (2-50 characters)
  IF length(trim(NEW.modelo)) < 2 THEN
    RAISE EXCEPTION 'Modelo deve ter no mínimo 2 caracteres';
  END IF;
  IF length(NEW.modelo) > 50 THEN
    RAISE EXCEPTION 'Modelo deve ter no máximo 50 caracteres';
  END IF;
  
  -- Validate valor (positive, max 999999)
  IF NEW.valor <= 0 THEN
    RAISE EXCEPTION 'Valor deve ser positivo';
  END IF;
  IF NEW.valor > 999999 THEN
    RAISE EXCEPTION 'Valor muito alto';
  END IF;
  
  -- Validate cliente_nome length (3-100 characters)
  IF length(trim(NEW.cliente_nome)) < 3 THEN
    RAISE EXCEPTION 'Nome do cliente deve ter no mínimo 3 caracteres';
  END IF;
  IF length(NEW.cliente_nome) > 100 THEN
    RAISE EXCEPTION 'Nome do cliente deve ter no máximo 100 caracteres';
  END IF;
  
  -- Validate cliente_cpf if provided
  IF NEW.cliente_cpf IS NOT NULL AND NOT validate_cpf(NEW.cliente_cpf) THEN
    RAISE EXCEPTION 'CPF do cliente inválido';
  END IF;
  
  -- Validate user_id matches authenticated user
  IF NEW.user_id != auth.uid() AND NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Não autorizado a criar registro para outro usuário';
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_vistorias_insert ON vistorias;
CREATE TRIGGER validate_vistorias_insert
  BEFORE INSERT ON vistorias
  FOR EACH ROW
  EXECUTE FUNCTION validate_vistorias_data();

DROP TRIGGER IF EXISTS validate_vistorias_update ON vistorias;
CREATE TRIGGER validate_vistorias_update
  BEFORE UPDATE ON vistorias
  FOR EACH ROW
  EXECUTE FUNCTION validate_vistorias_data();