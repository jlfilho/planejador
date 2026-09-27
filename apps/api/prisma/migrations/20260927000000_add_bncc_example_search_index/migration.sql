-- Busca textual do catálogo também consulta exemplos. O índice trigram evita
-- varreduras completas quando a coleção crescer.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX "ExemploHabilidadeBNCC_texto_trgm_idx"
  ON "ExemploHabilidadeBNCC" USING GIN ("texto" gin_trgm_ops);
