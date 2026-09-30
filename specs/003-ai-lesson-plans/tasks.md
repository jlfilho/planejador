# Tarefas: Gerador de planos de aula por IA

**Entrada**: Artefatos de `specs/003-ai-lesson-plans/`.

**Pré-requisitos**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md) e `contracts/`.

**Testes**: Unitários, integração e E2E são exigidos pela Constituição.

## Fase 1: Preparação

**Objetivo**: Configurar a integração segura sem expor segredos.

- [X] T001 [P] Atualizar `apps/api/.env.example` com valores fictícios para `N8N_WEBHOOK_URL`, `N8N_INTEGRATION_SECRET`, `N8N_AUTH_HEADER_NAME` e `N8N_TIMEOUT_MS`, confirmando em `.gitignore` que `apps/api/.env` permanece ignorado.
- [X] T002 [P] Implementar em `apps/api/src/common/security-config.ts` validação de URL HTTPS exatamente igual ao endpoint de `specs/003-ai-lesson-plans/contracts/n8n-webhook.md`, segredo não vazio, nome válido de cabeçalho e timeout máximo de 30 segundos, sem retornar esses valores por rotas ou logs.
- [X] T003 [P] Atualizar Swagger em `apps/api/src/main.ts` e `apps/api/src/plans/plans.controller.ts` conforme `specs/003-ai-lesson-plans/contracts/plans-api.yaml`.

---

## Fase 2: Fundação bloqueante

**Objetivo**: Disponibilizar persistência, validação, módulo e cliente n8n.

- [X] T004 Atualizar `apps/api/prisma/schema.prisma` com `PlanStatus` (`RASCUNHO`, `FINALIZADO`), `AiRunStatus` (`PENDING`, `SUCCEEDED`, `FAILED`) e `AiRun`, `AiRunSkill`, `Plan` e `PlanReference`, preservando “`durationMinutes` inteiro obrigatório e estritamente positivo”, “`aiAssisted` sempre `true`” e `onDelete: Restrict` para BNCC.
- [X] T005 Criar migration aditiva em `apps/api/prisma/migrations/<timestamp>_add_ai_lesson_plans/migration.sql` com FKs, unicidades de `requestId`, `idempotencyKey`, `(aiRunId, habilidadeBNCCId)`, `(aiRunId, ordem)`, `(planId, ordem)` e índices de `specs/003-ai-lesson-plans/data-model.md`.
- [X] T006 [P] Criar `apps/api/test/plans-schema.integration.spec.ts` para validar enums, relações, unicidades, índices e bloqueio da remoção de habilidade BNCC referenciada.
- [X] T007 [P] Criar DTOs de geração, edição, referência e resposta externa em `apps/api/src/plans/dto/`, validando instrução não vazia, duração inteira positiva, pelo menos uma habilidade, Markdown não vazio e URL HTTPS quando fornecida.
- [X] T008 [P] Criar `apps/api/src/plans/dto/plans.dto.spec.ts` para campos obrigatórios ausentes, duração inválida, UUID inválido, Markdown vazio, URL não HTTPS, referência inválida e resposta n8n incompatível.
- [X] T009 Implementar `apps/api/src/plans/n8n.client.ts` e `apps/api/src/plans/n8n.client.spec.ts` para enviar somente `sessao`, `habilidade`, `instrucao`, `duracao` e `recursos_digitais` por HTTPS, usando `N8N_AUTH_HEADER_NAME`, sem JWT, cookie, HMAC ou retry automático.
- [X] T010 Implementar em `apps/api/src/plans/n8n.client.ts` timeout, rejeição de URL insegura, divergente do endpoint contratado ou com redirecionamento, validação de HTTP 200, `success=true`, `answer` Markdown não vazio e `format=markdown`, conforme `specs/003-ai-lesson-plans/contracts/n8n-webhook.md`.
- [X] T011 Criar `apps/api/src/plans/plans.module.ts` e registrá-lo em `apps/api/src/app.module.ts`, reutilizando Prisma, auditoria, guardas de autenticação e decoradores de papéis.

**Checkpoint**: Persistência, contrato HTTP Header Auth e módulo estão prontos.

---

## Fase 3: História de Usuário 1 — Gerar rascunho de plano (Prioridade: P1) 🎯 MVP

**Objetivo**: PROFESSOR autenticado seleciona habilidades ativas e recebe um rascunho Markdown assistido por IA.

**Teste independente**: Com habilidades válidas, instrução, duração positiva e recursos digitais, o PROFESSOR recebe rascunho; entrada inválida não chama n8n nem cria plano.

### Testes da História de Usuário 1

- [X] T012 [P] [US1] Criar `apps/api/src/plans/plans.service.spec.ts` para habilidades BNCC ativas, `AiRun PENDING`, `AiRunSkill` imutável, `Plan RASCUNHO` com `aiAssisted=true` apenas após resposta válida e gerações independentes.
- [X] T013 [P] [US1] Criar `apps/api/test/plans-generation.integration.spec.ts` para `POST /api/v1/plans/generations`, resposta 201, entrada inválida 400 sem chamada externa, corpo n8n permitido e ausência de plano após resposta incompatível.
- [X] T014 [P] [US1] Criar `apps/web/e2e/plans-generation.spec.ts` para pesquisa/autocomplete de habilidades, seleção múltipla, submissão e visualização do rascunho assistido por IA.

### Implementação da História de Usuário 1

- [X] T015 [US1] Implementar em `apps/api/src/plans/plans.service.ts` a criação de `AiRun` e `AiRunSkill` imutáveis, validação de habilidades existentes/ativas e `requestId`/`idempotencyKey` auditáveis antes da chamada n8n.
- [X] T016 [US1] Implementar em `apps/api/src/plans/plans.service.ts` a transação de sucesso: `AiRun SUCCEEDED`, `Plan RASCUNHO`, `ownerId` do solicitante e `aiAssisted=true`, sem persistir plano com Markdown inválido.
- [X] T017 [US1] Implementar `POST /plans/generations` em `apps/api/src/plans/plans.controller.ts` com autenticação, DTOs, Swagger e erros 502/504 genéricos sem detalhes do n8n.
- [X] T018 [US1] Registrar em `apps/api/src/plans/plans.service.ts` os eventos `PLAN_GENERATION_STARTED`, `PLAN_GENERATION_SUCCEEDED` e falhas por código seguro, somente com IDs, estado e requestId.
- [X] T019 [P] [US1] Atualizar `apps/web/lib/plans-api.ts` para chamar apenas `/api/v1/plans` por `apiRequest`, sem URL, cabeçalho ou segredo do n8n no navegador.
- [X] T020 [US1] Implementar em `apps/web/components/plans/plan-form.tsx` o formulário com autocomplete de `apps/web/lib/bncc-api.ts`, uma ou mais habilidades, instrução, duração e recursos digitais, sem substituir a validação da API.
- [X] T021 [US1] Atualizar `apps/web/app/planos/page.tsx` e `apps/web/components/plans/plan-form.tsx` para os estados Figma de gerar, correção e preparando rascunho, preservando os campos em correção e falha.

**Checkpoint**: US1 produz rascunho demonstrável sem US2 ou US3.

---

## Fase 4: História de Usuário 2 — Revisar e decidir o destino do plano (Prioridade: P1)

**Objetivo**: O proprietário revisa, salva ou finaliza; ADMIN administra rascunhos de terceiros em área dedicada.

**Teste independente**: O PROFESSOR edita, salva e finaliza; outro PROFESSOR não vê conteúdo privado; ADMIN só altera RASCUNHO sem trocar proprietário.

### Testes da História de Usuário 2

- [X] T022 [P] [US2] Criar `apps/api/src/plans/plans.service.spec.ts` para ownership, exceção ADMIN restrita a consulta/edição de RASCUNHO, negação da finalização de plano alheio por ADMIN, estado finalizado, referências manuais opcionais e último salvamento recebido.
- [X] T023 [P] [US2] Criar `apps/api/test/plans-access.integration.spec.ts` para GET/PATCH/finalização, 403 sem vazamento, negação de finalização por ADMIN em plano alheio, ação ADMIN auditada e 409 para edição de `FINALIZADO`.
- [X] T024 [P] [US2] Criar `apps/web/e2e/plans-editor.spec.ts` para editar Markdown, adicionar referências manuais sem referências retornadas, salvar, confirmar finalização e remover controles de edição.
- [X] T025 [P] [US2] Criar `apps/web/e2e/admin-plans.spec.ts` que bloqueia PROFESSOR e permite a ADMIN a área dedicada com identificação do proprietário.

### Implementação da História de Usuário 2

- [X] T026 [US2] Implementar em `apps/api/src/plans/plans.service.ts` listagem/detalhe com predicado obrigatório de `ownerId` para PROFESSOR e exceção ADMIN, retornando habilidades e referências apenas quando autorizado.
- [X] T027 [US2] Implementar em `apps/api/src/plans/plans.service.ts` PATCH transacional de Markdown/referências e finalização condicionados a `status = RASCUNHO`, permitindo finalização exclusivamente ao professor proprietário e preservando `ownerId`, `aiAssisted` e dados originais.
- [X] T028 [US2] Implementar em `apps/api/src/plans/plans.controller.ts` GET, PATCH e finalização do plano com Swagger, RBAC/ownership no backend, finalização exclusiva ao proprietário e respostas sem conteúdo privado quando negadas.
- [X] T029 [US2] Adicionar em `apps/api/src/plans/plans.service.ts` auditoria transacional para consulta ADMIN, salvamento e finalização, armazenando actorId, planId e resultado, nunca Markdown, referências, token ou segredo.
- [X] T030 [P] [US2] Implementar `apps/web/components/plans/plan-list.tsx` e `apps/web/lib/plans-api.ts` para a tela Figma “Meus planos de aula”, usando somente planos retornados pela API autenticada.
- [X] T031 [US2] Implementar `apps/web/components/plans/plan-editor.tsx` e `apps/web/app/planos/page.tsx` para revisão, confirmação e plano finalizado, com referências retornadas ou referências manuais opcionais somente em rascunho.
- [X] T032 [US2] Criar `apps/web/app/admin/planos/page.tsx` e a navegação autorizada em `apps/web/components/` para a tela Figma de administração dedicada, identificando proprietário sem transferir ownership.

**Checkpoint**: Revisão humana, referências manuais, RBAC e finalização explícita estão completos.

---

## Fase 5: História de Usuário 3 — Lidar com falha de geração (Prioridade: P2)

**Objetivo**: Falhas n8n não deixam conteúdo parcial e permitem nova tentativa manual com dados preservados.

**Teste independente**: Cada falha deixa `AiRun FAILED`, não cria `Plan` e devolve o PROFESSOR ao formulário preenchido.

### Testes da História de Usuário 3

- [X] T033 [P] [US3] Estender `apps/api/src/plans/n8n.client.spec.ts` para timeout, indisponibilidade, credencial de cabeçalho rejeitada, HTTP não 200, schema inválido e ausência de retry automático.
- [X] T034 [P] [US3] Criar `apps/api/test/plans-generation-failures.integration.spec.ts` para `AiRun FAILED`, ausência de `Plan` e respostas 502/504 seguras para timeout, indisponibilidade e schema inválido.
- [X] T035 [P] [US3] Estender `apps/web/e2e/plans-generation.spec.ts` para a tela Figma de falha, mensagem segura, campos preservados e nova solicitação somente por ação explícita.

### Implementação da História de Usuário 3

- [X] T036 [US3] Implementar em `apps/api/src/plans/plans.service.ts` a transição segura para `AiRun FAILED`, classificação sem dados sensíveis, ausência garantida de plano parcial e mapeamento de timeout para 504 e demais falhas externas para 502.
- [X] T037 [US3] Implementar em `apps/web/components/plans/plan-form.tsx` a recuperação de falha com habilidades, instrução, duração e recursos digitais preservados, sem retry automático.

**Checkpoint**: Falhas externas não publicam nem finalizam conteúdo parcial.

---

## Fase 6: Polimento e validação transversal

- [X] T038 [P] Conferir `apps/api/src/plans/plans.controller.ts` e `specs/003-ai-lesson-plans/contracts/plans-api.yaml` para manter Swagger, DTOs e respostas alinhados ao contrato público.
- [X] T039 [P] Revisar `apps/api/.env.example`, `.gitignore`, `apps/api/src/common/security-config.ts` e `apps/api/src/plans/` para impedir versionamento, retorno ou logs de `N8N_INTEGRATION_SECRET`, JWT, cookie, senha, `DATABASE_URL` e chave Gemini.
- [X] T040 [P] Executar revisão visual e de acessibilidade dos nove estados de `specs/003-ai-lesson-plans/spec.md` contra o Figma, em `apps/web/app/planos/page.tsx`, `apps/web/app/admin/planos/page.tsx` e `apps/web/components/plans/`.
- [X] T041 Executar os cenários de `specs/003-ai-lesson-plans/quickstart.md` e `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:integration`, `pnpm test:e2e` e `pnpm build`, registrando resultados em `specs/003-ai-lesson-plans/quickstart.md`.

## Dependências e ordem de execução

- Fase 1 não possui dependências.
- Fase 2 depende da Fase 1 e bloqueia as histórias.
- US1 depende da Fase 2 e é o MVP.
- US2 depende do `Plan` criado por US1; seus testes podem ser preparados em paralelo.
- US3 depende do cliente n8n da Fase 2 e reutiliza a geração de US1.
- Fase 6 depende das histórias desejadas estarem concluídas.

## Oportunidades de paralelismo

- T001–T003 podem ocorrer em paralelo.
- T006–T008 podem ocorrer em paralelo após T004–T005.
- T012–T014, T022–T025 e T033–T035 podem ser escritos em paralelo por história.
- T019 e T030 podem avançar em paralelo às rotas depois da estabilização dos contratos.
- T038–T040 podem ocorrer em paralelo antes de T041.

## Estratégia de implementação

### MVP

1. Concluir Fases 1 e 2.
2. Concluir T012–T021 da US1.
3. Validar geração de rascunho, contrato Header Auth e ausência de segredos no browser.

### Entregas incrementais

1. Persistência segura e integração n8n.
2. Geração de rascunho (US1).
3. Revisão, finalização, referências manuais e administração dedicada (US2).
4. Falhas e nova tentativa manual (US3).
5. Revisão visual, segurança e gates.

## Validação de formato

Todas as tarefas usam checkbox, identificador sequencial, `[P]` apenas para trabalho independente, rótulo de história nas fases de história e caminho de arquivo explícito.

## Fase 7: Convergência

- [X] T042 Criar `apps/api/test/plans-schema.integration.spec.ts` com PostgreSQL real para validar a migration de planos, enums, FKs `Restrict`, unicidades e índices definidos no modelo de dados, conforme Constitution V e plano de migrations (missing).
- [X] T043 Atualizar `apps/api/src/plans/plans.service.ts`, `apps/api/src/plans/plans.controller.ts`, `apps/web/lib/plans-api.ts` e `apps/web/app/admin/planos/page.tsx` para devolver e exibir ao ADMIN a visão pública mínima do professor proprietário, além do ID, sem expor dados privados, conforme FR-025 e US2/AC5 (partial).

## Fase 8: Convergência

- [X] T044 Atualizar `apps/api/src/plans/dto/plans.dto.ts` e `apps/api/src/plans/n8n.client.spec.ts` para aceitar e validar `sessao` e `habilidade` ecoados pela resposta completa do workflow n8n, mantendo a rejeição de campos inesperados, conforme `contracts/n8n-webhook.md` e FR-011 (contradicts).
