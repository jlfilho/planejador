CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TYPE "EixoBNCC" AS ENUM ('PENSAMENTO_COMPUTACIONAL', 'MUNDO_DIGITAL', 'CULTURA_DIGITAL');
CREATE TABLE "NivelEnsino" (
  "id" TEXT NOT NULL, "codigo" TEXT NOT NULL, "nome" TEXT NOT NULL, "ativo" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "NivelEnsino_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "EtapaEnsino" (
  "id" TEXT NOT NULL, "nivelEnsinoId" TEXT NOT NULL, "codigo" TEXT NOT NULL, "nome" TEXT NOT NULL,
  "anoInicial" INTEGER, "anoFinal" INTEGER, "ativo" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EtapaEnsino_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "EtapaEnsino_years_check" CHECK (("anoInicial" IS NULL AND "anoFinal" IS NULL) OR ("anoInicial" IS NOT NULL AND "anoFinal" IS NOT NULL AND "anoInicial" <= "anoFinal"))
);
CREATE TABLE "HabilidadeBNCC" (
  "id" TEXT NOT NULL, "etapaEnsinoId" TEXT NOT NULL, "codigo" TEXT NOT NULL, "eixo" "EixoBNCC" NOT NULL,
  "descricao" TEXT NOT NULL, "explicacao" TEXT NOT NULL, "ativa" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HabilidadeBNCC_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ExemploHabilidadeBNCC" (
  "id" TEXT NOT NULL, "habilidadeBNCCId" TEXT NOT NULL, "ordem" INTEGER NOT NULL, "texto" TEXT NOT NULL,
  CONSTRAINT "ExemploHabilidadeBNCC_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ExemploHabilidadeBNCC_ordem_check" CHECK ("ordem" > 0)
);
CREATE UNIQUE INDEX "NivelEnsino_codigo_key" ON "NivelEnsino"("codigo");
CREATE UNIQUE INDEX "NivelEnsino_nome_key" ON "NivelEnsino"("nome");
CREATE UNIQUE INDEX "EtapaEnsino_nivelEnsinoId_codigo_key" ON "EtapaEnsino"("nivelEnsinoId", "codigo");
CREATE UNIQUE INDEX "EtapaEnsino_nivelEnsinoId_nome_key" ON "EtapaEnsino"("nivelEnsinoId", "nome");
CREATE INDEX "EtapaEnsino_nivelEnsinoId_ativo_idx" ON "EtapaEnsino"("nivelEnsinoId", "ativo");
CREATE UNIQUE INDEX "HabilidadeBNCC_codigo_key" ON "HabilidadeBNCC"("codigo");
CREATE INDEX "HabilidadeBNCC_etapaEnsinoId_ativa_eixo_codigo_idx" ON "HabilidadeBNCC"("etapaEnsinoId", "ativa", "eixo", "codigo");
CREATE INDEX "HabilidadeBNCC_codigo_trgm_idx" ON "HabilidadeBNCC" USING GIN ("codigo" gin_trgm_ops);
CREATE INDEX "HabilidadeBNCC_descricao_trgm_idx" ON "HabilidadeBNCC" USING GIN ("descricao" gin_trgm_ops);
CREATE INDEX "HabilidadeBNCC_explicacao_trgm_idx" ON "HabilidadeBNCC" USING GIN ("explicacao" gin_trgm_ops);
CREATE UNIQUE INDEX "ExemploHabilidadeBNCC_habilidadeBNCCId_ordem_key" ON "ExemploHabilidadeBNCC"("habilidadeBNCCId", "ordem");
ALTER TABLE "EtapaEnsino" ADD CONSTRAINT "EtapaEnsino_nivelEnsinoId_fkey" FOREIGN KEY ("nivelEnsinoId") REFERENCES "NivelEnsino"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "HabilidadeBNCC" ADD CONSTRAINT "HabilidadeBNCC_etapaEnsinoId_fkey" FOREIGN KEY ("etapaEnsinoId") REFERENCES "EtapaEnsino"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ExemploHabilidadeBNCC" ADD CONSTRAINT "ExemploHabilidadeBNCC_habilidadeBNCCId_fkey" FOREIGN KEY ("habilidadeBNCCId") REFERENCES "HabilidadeBNCC"("id") ON DELETE CASCADE ON UPDATE CASCADE;
