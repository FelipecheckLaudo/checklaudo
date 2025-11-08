-- Fix search_path for validation functions to prevent security issues

-- Update validate_cpf with proper search_path
CREATE OR REPLACE FUNCTION validate_cpf(cpf_input text) 
RETURNS boolean 
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  clean_cpf text;
  sum_val integer;
  check_digit integer;
BEGIN
  clean_cpf := regexp_replace(cpf_input, '[^0-9]', '', 'g');
  
  IF length(clean_cpf) != 11 THEN
    RETURN false;
  END IF;
  
  IF clean_cpf ~ '^(\d)\1+$' THEN
    RETURN false;
  END IF;
  
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

-- Update validate_placa with proper search_path
CREATE OR REPLACE FUNCTION validate_placa(placa_input text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN placa_input ~ '^[A-Z]{3}-?[0-9][A-Z0-9][0-9]{2}$';
END;
$$;

-- Update validate_clientes_data with proper search_path
CREATE OR REPLACE FUNCTION validate_clientes_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF length(trim(NEW.nome)) < 3 THEN
    RAISE EXCEPTION 'Nome deve ter no mínimo 3 caracteres';
  END IF;
  IF length(NEW.nome) > 100 THEN
    RAISE EXCEPTION 'Nome deve ter no máximo 100 caracteres';
  END IF;
  
  IF NOT validate_cpf(NEW.cpf) THEN
    RAISE EXCEPTION 'CPF inválido';
  END IF;
  
  IF NEW.observacoes IS NOT NULL AND length(NEW.observacoes) > 1000 THEN
    RAISE EXCEPTION 'Observações devem ter no máximo 1000 caracteres';
  END IF;
  
  IF NEW.user_id != auth.uid() AND NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Não autorizado a criar registro para outro usuário';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update validate_digitadores_data with proper search_path
CREATE OR REPLACE FUNCTION validate_digitadores_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF length(trim(NEW.nome)) < 3 THEN
    RAISE EXCEPTION 'Nome deve ter no mínimo 3 caracteres';
  END IF;
  IF length(NEW.nome) > 100 THEN
    RAISE EXCEPTION 'Nome deve ter no máximo 100 caracteres';
  END IF;
  
  IF NOT validate_cpf(NEW.cpf) THEN
    RAISE EXCEPTION 'CPF inválido';
  END IF;
  
  IF NEW.observacoes IS NOT NULL AND length(NEW.observacoes) > 1000 THEN
    RAISE EXCEPTION 'Observações devem ter no máximo 1000 caracteres';
  END IF;
  
  IF NEW.user_id != auth.uid() AND NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Não autorizado a criar registro para outro usuário';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update validate_vistoriadores_data with proper search_path
CREATE OR REPLACE FUNCTION validate_vistoriadores_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF length(trim(NEW.nome)) < 3 THEN
    RAISE EXCEPTION 'Nome deve ter no mínimo 3 caracteres';
  END IF;
  IF length(NEW.nome) > 100 THEN
    RAISE EXCEPTION 'Nome deve ter no máximo 100 caracteres';
  END IF;
  
  IF NOT validate_cpf(NEW.cpf) THEN
    RAISE EXCEPTION 'CPF inválido';
  END IF;
  
  IF NEW.observacoes IS NOT NULL AND length(NEW.observacoes) > 1000 THEN
    RAISE EXCEPTION 'Observações devem ter no máximo 1000 caracteres';
  END IF;
  
  IF NEW.user_id != auth.uid() AND NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Não autorizado a criar registro para outro usuário';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update validate_vistorias_data with proper search_path
CREATE OR REPLACE FUNCTION validate_vistorias_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT validate_placa(NEW.placa) THEN
    RAISE EXCEPTION 'Formato de placa inválido';
  END IF;
  
  IF length(trim(NEW.modelo)) < 2 THEN
    RAISE EXCEPTION 'Modelo deve ter no mínimo 2 caracteres';
  END IF;
  IF length(NEW.modelo) > 50 THEN
    RAISE EXCEPTION 'Modelo deve ter no máximo 50 caracteres';
  END IF;
  
  IF NEW.valor <= 0 THEN
    RAISE EXCEPTION 'Valor deve ser positivo';
  END IF;
  IF NEW.valor > 999999 THEN
    RAISE EXCEPTION 'Valor muito alto';
  END IF;
  
  IF length(trim(NEW.cliente_nome)) < 3 THEN
    RAISE EXCEPTION 'Nome do cliente deve ter no mínimo 3 caracteres';
  END IF;
  IF length(NEW.cliente_nome) > 100 THEN
    RAISE EXCEPTION 'Nome do cliente deve ter no máximo 100 caracteres';
  END IF;
  
  IF NEW.cliente_cpf IS NOT NULL AND NOT validate_cpf(NEW.cliente_cpf) THEN
    RAISE EXCEPTION 'CPF do cliente inválido';
  END IF;
  
  IF NEW.user_id != auth.uid() AND NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Não autorizado a criar registro para outro usuário';
  END IF;
  
  RETURN NEW;
END;
$$;