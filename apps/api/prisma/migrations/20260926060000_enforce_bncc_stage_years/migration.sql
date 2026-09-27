-- Enforce the BNCC level/year invariant in PostgreSQL, including writes that
-- do not pass through the NestJS DTO validation layer.
CREATE OR REPLACE FUNCTION "assert_bncc_stage_years"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  level_code TEXT;
  maximum_year INTEGER;
BEGIN
  SELECT "codigo" INTO level_code
  FROM "NivelEnsino"
  WHERE "id" = NEW."nivelEnsinoId";

  IF level_code IS NULL THEN
    RAISE EXCEPTION 'BNCC level % does not exist', NEW."nivelEnsinoId";
  END IF;

  IF level_code = 'EDUCACAO_INFANTIL' THEN
    IF NEW."anoInicial" IS NOT NULL OR NEW."anoFinal" IS NOT NULL THEN
      RAISE EXCEPTION 'Educação Infantil não possui ano';
    END IF;
    RETURN NEW;
  END IF;

  maximum_year := CASE level_code
    WHEN 'ENSINO_FUNDAMENTAL' THEN 9
    WHEN 'ENSINO_MEDIO' THEN 3
    ELSE NULL
  END;

  IF maximum_year IS NULL OR NEW."anoInicial" IS NULL OR NEW."anoFinal" IS NULL
     OR NEW."anoInicial" < 1 OR NEW."anoFinal" > maximum_year
     OR NEW."anoInicial" > NEW."anoFinal" THEN
    RAISE EXCEPTION 'Intervalo de anos inválido para nível BNCC %', level_code;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER "EtapaEnsino_assert_bncc_stage_years"
BEFORE INSERT OR UPDATE OF "nivelEnsinoId", "anoInicial", "anoFinal"
ON "EtapaEnsino"
FOR EACH ROW EXECUTE FUNCTION "assert_bncc_stage_years"();
