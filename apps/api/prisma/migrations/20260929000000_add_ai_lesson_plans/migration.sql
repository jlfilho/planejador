CREATE TYPE "PlanStatus" AS ENUM ('RASCUNHO', 'FINALIZADO');
CREATE TYPE "AiRunStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED');

CREATE TABLE "AiRun" (
  "id" TEXT NOT NULL,
  "requesterId" TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "idempotencyKey" TEXT NOT NULL,
  "status" "AiRunStatus" NOT NULL DEFAULT 'PENDING',
  "instruction" TEXT NOT NULL,
  "durationMinutes" INTEGER NOT NULL,
  "usesDigitalResources" BOOLEAN NOT NULL,
  "attemptCount" INTEGER NOT NULL DEFAULT 1,
  "failureCode" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "AiRun_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AiRun_durationMinutes_check" CHECK ("durationMinutes" > 0),
  CONSTRAINT "AiRun_attemptCount_check" CHECK ("attemptCount" >= 1 AND "attemptCount" <= 2)
);
CREATE TABLE "AiRunSkill" (
  "id" TEXT NOT NULL,
  "aiRunId" TEXT NOT NULL,
  "habilidadeBNCCId" TEXT NOT NULL,
  "ordem" INTEGER NOT NULL,
  CONSTRAINT "AiRunSkill_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AiRunSkill_ordem_check" CHECK ("ordem" > 0)
);
CREATE TABLE "Plan" (
  "id" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "aiRunId" TEXT NOT NULL,
  "status" "PlanStatus" NOT NULL DEFAULT 'RASCUNHO',
  "markdown" TEXT NOT NULL,
  "aiAssisted" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "finalizedAt" TIMESTAMP(3),
  CONSTRAINT "Plan_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Plan_markdown_check" CHECK (length(trim("markdown")) > 0),
  CONSTRAINT "Plan_aiAssisted_check" CHECK ("aiAssisted" = true)
);
CREATE TABLE "PlanReference" (
  "id" TEXT NOT NULL,
  "planId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "url" TEXT,
  "citation" TEXT,
  "ordem" INTEGER NOT NULL,
  CONSTRAINT "PlanReference_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PlanReference_title_check" CHECK (length(trim("title")) > 0),
  CONSTRAINT "PlanReference_ordem_check" CHECK ("ordem" > 0)
);

CREATE UNIQUE INDEX "AiRun_requestId_key" ON "AiRun"("requestId");
CREATE UNIQUE INDEX "AiRun_idempotencyKey_key" ON "AiRun"("idempotencyKey");
CREATE INDEX "AiRun_requesterId_createdAt_idx" ON "AiRun"("requesterId", "createdAt");
CREATE INDEX "AiRun_status_createdAt_idx" ON "AiRun"("status", "createdAt");
CREATE UNIQUE INDEX "AiRunSkill_aiRunId_habilidadeBNCCId_key" ON "AiRunSkill"("aiRunId", "habilidadeBNCCId");
CREATE UNIQUE INDEX "AiRunSkill_aiRunId_ordem_key" ON "AiRunSkill"("aiRunId", "ordem");
CREATE UNIQUE INDEX "Plan_aiRunId_key" ON "Plan"("aiRunId");
CREATE INDEX "Plan_ownerId_status_updatedAt_idx" ON "Plan"("ownerId", "status", "updatedAt");
CREATE INDEX "Plan_status_updatedAt_idx" ON "Plan"("status", "updatedAt");
CREATE UNIQUE INDEX "PlanReference_planId_ordem_key" ON "PlanReference"("planId", "ordem");

ALTER TABLE "AiRun" ADD CONSTRAINT "AiRun_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AiRunSkill" ADD CONSTRAINT "AiRunSkill_aiRunId_fkey" FOREIGN KEY ("aiRunId") REFERENCES "AiRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiRunSkill" ADD CONSTRAINT "AiRunSkill_habilidadeBNCCId_fkey" FOREIGN KEY ("habilidadeBNCCId") REFERENCES "HabilidadeBNCC"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_aiRunId_fkey" FOREIGN KEY ("aiRunId") REFERENCES "AiRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PlanReference" ADD CONSTRAINT "PlanReference_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
