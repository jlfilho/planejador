# Tarefas: Explorador BNCC

**Entrada**: Artefatos em `specs/002-bncc-explorer/`

**Pré-requisitos**: [plan.md](plan.md), [spec.md](spec.md), [data-model.md](data-model.md), [contracts/openapi.yaml](contracts/openapi.yaml)

**Testes**: obrigatórios conforme a Constituição e a solicitação desta feature.

## Formato

Cada tarefa segue `- [ ] T### [P?] [US?] descrição com caminho`. `[P]` indica arquivo distinto sem dependência direta; `[US#]` vincula a tarefa à história de usuário.

## Fase 1: Setup

**Propósito**: preparar scripts, dependências e suporte de teste para a feature.

- [X] T001 Atualizar `apps/api/package.json` e `package.json` com script Prisma de seed e comandos de execução necessários para o catálogo.
- [X] T002 [P] Configurar ambiente DOM e dependências de teste de componentes em `apps/web/package.json` e `apps/web/vitest.config.ts`.
- [X] T003 [P] Criar convenções de dados BNCC e rótulos dos eixos em `apps/api/src/bncc/bncc.constants.ts`.
- [X] T043 Configurar Playwright, navegador de teste, script `test:e2e` e servidor de testes em `apps/web/package.json`, `apps/web/playwright.config.ts` e `package.json`; esta tarefa bloqueia T037 e T038.

---

## Fase 2: Fundação Bloqueadora

**Propósito**: construir dados, persistência, autenticação de cliente e infraestrutura comum antes das histórias.

- [X] T004 Modelar `EixoBNCC`, `NivelEnsino`, `EtapaEnsino`, `HabilidadeBNCC` e `ExemploHabilidadeBNCC` em `apps/api/prisma/schema.prisma`, incluindo relações `NivelEnsino 1:N EtapaEnsino 1:N HabilidadeBNCC` e exemplos ordenados.
- [X] T005 Criar `apps/api/prisma/migrations/<timestamp>_add_bncc_catalog/migration.sql` com tabelas, FKs, `codigo` globalmente único de habilidade, unicidades de nível/etapa/ordem, CHECK de anos e índices de filtro/busca `pg_trgm`/GIN descritos em `data-model.md`.
- [X] T006 Criar dataset interno validável em `apps/api/prisma/seed-data/bncc-computacao.ts` com níveis canônicos, etapas EI/EF/EM, habilidades, eixo, explicação e ao menos um exemplo ordenado.
- [X] T007 Implementar seed transacional e idempotente em `apps/api/prisma/seed.ts`: validar dados integrais, normalizar códigos, criar apenas itens ausentes e relatar divergências sem sobrescrever curadoria ADMIN.
- [X] T008 Implementar validações compartilhadas de intervalo EI sem ano, EF 1–9 e EM 1–3 em `apps/api/src/bncc/bncc.validation.ts`.
- [X] T009 Criar módulo e registrar providers/controllers BNCC em `apps/api/src/bncc/bncc.module.ts` e `apps/api/src/app.module.ts`.
- [X] T010 Criar camada de sessão em memória e requisição autorizada com refresh único após 401 em `apps/web/components/auth/auth-session-provider.tsx` e `apps/web/lib/api-client.ts`, sem usar URL, logs, `localStorage` ou `sessionStorage` para tokens.
- [X] T044 Integrar `apps/web/lib/auth.ts`, `apps/web/app/page.tsx` e `apps/web/components/auth/auth-session-provider.tsx` para entregar ao provider o access token retornado por cadastro/login/refresh e limpá-lo no logout, sem persistir token no navegador.
- [X] T011 [P] Criar tipos e serialização de consulta BNCC em `apps/web/lib/bncc-query.ts` e `apps/web/lib/bncc-api.ts`.
- [X] T012 Criar fixtures isoladas de ADMIN, PROFESSOR e catálogo em `apps/api/test/bncc.fixtures.ts` para testes de integração/E2E.

**Checkpoint**: schema, migration, seed, infraestrutura de API e sessão web disponíveis; as histórias podem começar.

---

## Fase 3: História de Usuário 1 — Explorar habilidades BNCC (P1) 🎯 MVP

**Objetivo**: PROFESSOR autenticado localiza habilidades ativas por nível, etapa/faixa, ano, eixo, código ou texto.

**Teste independente**: com o seed aplicado, um PROFESSOR encontra habilidade conhecida por filtros combinados e busca, recebe página ordenada e não vê itens inativos.

### Testes da US1

- [ ] T013 [P] [US1] Criar testes unitários de query, paginação padrão 1/20/máximo 100, página além do total como lista vazia válida e busca combinada em `apps/api/src/bncc/bncc-query.dto.spec.ts`.
- [ ] T014 [P] [US1] Criar testes de integração de `GET /api/v1/bncc/levels`, etapas e habilidades ativas, filtros AND, busca por código completo/parcial/texto, ordenação e metadados, incluindo página além do total vazia, em `apps/api/test/bncc-catalog.integration.spec.ts`.
- [ ] T015 [P] [US1] Criar testes de componentes para filtros dependentes, ano oculto na EI, loading, vazio e paginação em `apps/web/components/bncc/catalog-explorer.spec.tsx`.

### Implementação da US1

- [ ] T016 [US1] Criar DTO de leitura em `apps/api/src/bncc/dto/catalog-query.dto.ts` com UUIDs, eixo enum, `q` aparada com máximo 100, `page >= 1` e `1 <= pageSize <= 100`.
- [ ] T017 [US1] Implementar consulta docente e mapeamento de respostas em `apps/api/src/bncc/bncc.service.ts`: cadeia ativa nível/etapa/habilidade, filtros AND, busca OR em código/descrição/explicação/exemplos, ordem crescente de código e página além do total com `data: []` e metadados válidos.
- [ ] T018 [US1] Implementar `GET /api/v1/bncc/levels`, `GET /api/v1/bncc/levels/:levelId/stages` e `GET /api/v1/bncc/skills` em `apps/api/src/bncc/bncc.controller.ts`, exigindo autenticação global e retornando `{ data, meta }` paginado.
- [ ] T019 [US1] Documentar rotas de leitura, parâmetros, schemas e erros em `apps/api/src/bncc/bncc.controller.ts` para gerar Swagger conforme `contracts/openapi.yaml`.
- [ ] T020 [US1] Criar página protegida `apps/web/app/catalogo-bncc/page.tsx` que reidrata sessão antes de solicitar o catálogo e não exibe conteúdo antes da autenticação válida.
- [ ] T021 [US1] Implementar `apps/web/components/bncc/catalog-explorer.tsx`, `catalog-filters.tsx`, `skills-results.tsx` e `pagination.tsx` com fluxo nível → etapa/faixa → ano → eixo → busca; toda mudança de critério volta à página 1.
- [ ] T022 [US1] Implementar estados de carregamento, vazio e falha de rede em `apps/web/components/bncc/catalog-explorer.tsx`, mantendo vazio distinto de erro de validação.

**Checkpoint**: a consulta docente é demonstrável de ponta a ponta com catálogo ativo.

---

## Fase 4: História de Usuário 2 — Validar consultas ao catálogo (P2)

**Objetivo**: filtros inválidos recebem orientação específica, sem serem confundidos com resultado vazio.

**Teste independente**: uma etapa de outro nível, ano da EI, ano fora de faixa e eixo inválido retornam falha de validação; consulta válida sem itens continua retornando lista vazia.

### Testes da US2

- [ ] T023 [P] [US2] Criar testes unitários das regras de compatibilidade nível/etapa/ano em `apps/api/src/bncc/bncc.validation.spec.ts`.
- [ ] T024 [P] [US2] Criar testes de integração de filtros inválidos e resultado vazio válido em `apps/api/test/bncc-catalog-validation.integration.spec.ts`.
- [ ] T025 [P] [US2] Criar testes de componente para erro 400 preservando critérios e sem renderizar estado vazio em `apps/web/components/bncc/catalog-explorer.spec.tsx`.

### Implementação da US2

- [ ] T026 [US2] Aplicar validação de domínio no método de consulta de `apps/api/src/bncc/bncc.service.ts`: `stageId` pertence ao nível, `year` exige nível, EI rejeita ano e etapa deve cobrir o ano.
- [ ] T027 [US2] Mapear conflitos de combinação/formato para erros públicos orientativos em `apps/api/src/bncc/bncc.controller.ts` e `apps/api/src/bncc/bncc.service.ts`.
- [ ] T028 [US2] Exibir orientação próxima aos filtros inválidos e preservar a seleção para correção em `apps/web/components/bncc/catalog-filters.tsx`.

**Checkpoint**: entrada inválida e ausência legítima de resultados são comportamentos independentes e claros.

---

## Fase 5: História de Usuário 3 — Administrar o catálogo BNCC (P2)

**Objetivo**: ADMIN cria, edita e desativa itens globais; PROFESSOR não realiza mutações nem vê inativos.

**Teste independente**: ADMIN altera um item válido e sua desativação o remove da consulta docente; PROFESSOR recebe 403 em todas as mutações, inclusive por chamada direta à API.

### Testes da US3

- [ ] T029 [P] [US3] Criar testes unitários de normalização do código, exemplos não vazios e imutabilidade de código/etapa em `apps/api/src/bncc/bncc-admin.dto.spec.ts`.
- [ ] T030 [P] [US3] Criar testes de integração de RBAC, criação, edição, código duplicado, auditoria e desativação de habilidade, etapa e nível: desativar ancestral oculta descendentes e reativá-lo não reativa descendente inativo individualmente, em `apps/api/test/bncc-admin.integration.spec.ts`.
- [ ] T031 [P] [US3] Criar testes de interface para visibilidade ADMIN/PROFESSOR e formulários que não permitem editar código existente em `apps/web/components/bncc/catalog-admin.spec.tsx`.

### Implementação da US3

- [ ] T032 [US3] Criar DTOs ADMIN em `apps/api/src/bncc/dto/bncc-admin.dto.ts` com campos obrigatórios, strings não vazias, enum de eixo, intervalos de ano e array de exemplos com mínimo um item; restringir criação de nível aos três códigos canônicos e omitir código e etapa dos DTOs de atualização de habilidade.
- [ ] T033 [US3] Implementar mutações e listas administrativas em `apps/api/src/bncc/bncc.service.ts`, permitindo criar somente nível canônico ausente, tratando violações de unicidade como 409, sem DELETE, sem `professorId`, com auditoria sem conteúdo sensível e com desativação de nível/etapa ocultando descendentes sem reativar descendentes individualmente inativos.
- [ ] T034 [US3] Implementar POST/PATCH e listas ADMIN em `apps/api/src/bncc/bncc-admin.controller.ts`, protegendo cada rota com `@Roles(Role.ADMIN)` e documentando Swagger conforme `contracts/openapi.yaml`.
- [ ] T035 [US3] Criar rota protegida `apps/web/app/catalogo-bncc/admin/page.tsx` e `apps/web/components/bncc/catalog-admin.tsx` para criar, editar e desativar níveis, etapas e habilidades; mostrar inativos apenas ao ADMIN.
- [ ] T036 [US3] Aplicar controle de papel como conveniência em `apps/web/components/bncc/catalog-admin.tsx`, mantendo a autorização efetiva somente no backend.

**Checkpoint**: gestão ADMIN e proteção contra mutação docente estão completas.

---

## Fase 6: Integração, E2E e Qualidade

**Propósito**: validar fluxos completos, contratos e qualidade transversal.

- [ ] T037 Criar testes E2E Playwright de PROFESSOR para filtros, busca, ano da EI, vazio e paginação em `apps/web/e2e/bncc-explorer.spec.ts`.
- [X] T038 Criar testes E2E Playwright de ADMIN desativando habilidade e comprovando ausência na consulta PROFESSOR em `apps/web/e2e/bncc-admin.spec.ts`.
- [ ] T039 Validar migration e seed idempotente contra banco vazio e banco com curadoria em `apps/api/test/bncc-seed.integration.spec.ts`.
- [ ] T040 Revisar `specs/002-bncc-explorer/contracts/openapi.yaml` e anotações Swagger geradas para manter contratos de leitura/admin alinhados.
- [ ] T041 Executar `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:integration`, `pnpm test:e2e` e `pnpm build`; registrar correções necessárias em arquivos afetados.
- [ ] T042 Executar os cenários de `specs/002-bncc-explorer/quickstart.md` e atualizar somente documentação de validação que esteja imprecisa.
- [ ] T045 Criar teste de desempenho de integração em `apps/api/test/bncc-performance.integration.spec.ts` com 20 consultas representativas de filtro e busca, verificando que ao menos 19 páginas são respondidas em até 1 segundo no ambiente de aceitação.

---

## Dependências e Ordem de Execução

- Fase 1 não depende de outras tarefas.
- T043 depende de T002 e bloqueia T037 e T038; T044 depende de T010 e deve concluir antes de T020.
- Fase 2 depende da Fase 1 e bloqueia as histórias.
- US1 depende da Fase 2 e é o MVP.
- US2 depende dos DTOs/serviço de consulta da US1.
- US3 depende da Fase 2; pode avançar em paralelo à US2 após os contratos compartilhados estarem estáveis.
- Fase 6 depende das histórias pretendidas concluídas.

## Oportunidades de Paralelismo

- T002 e T003 podem avançar em paralelo; T043 começa após T002.
- T013–T015, T023–T025 e T029–T031 podem ser distribuídas por arquivo de teste.
- Após T012 e os contratos compartilhados, US2 e os testes/DTOs da US3 podem avançar em paralelo.

## Estratégia de Implementação

1. Complete Setup e Fundação.
2. Entregue US1 e valide a consulta docente como MVP.
3. Adicione US2 para tornar os filtros seguros e claros.
4. Adicione US3 para a curadoria administrativa.
5. Finalize E2E, seed/migration e todos os gates antes de publicar.

## Phase 7: Convergence

- [X] T046 Completar o dataset interno com o catálogo BNCC Computação integral e validar cobertura, códigos únicos e exemplo obrigatório por habilidade em `apps/api/prisma/seed-data/bncc-computacao.ts` e testes de seed, conforme plano: seed BNCC (partial).
- [X] T047 Validar UUIDs de todos os parâmetros de rota BNCC e impedir que rotas docentes listem etapas de nível inativo em `apps/api/src/bncc/bncc.controller.ts` e `apps/api/src/bncc/bncc.service.ts`, conforme FR-009 e Constituição I (partial).
- [X] T048 Tornar atômicas as mutações administrativas BNCC e seus eventos de auditoria, inclusive nível e etapa, em `apps/api/src/bncc/bncc.service.ts`, conforme FR-017 e plano: auditoria transacional (partial).
- [X] T049 Completar schemas, parâmetros, respostas de erro e status Swagger dos controllers BNCC para corresponder a `specs/002-bncc-explorer/contracts/openapi.yaml`, conforme T019 e T034 (partial).
- [X] T050 Implementar `apps/web/components/bncc/catalog-admin.tsx` e integrar `apps/web/app/catalogo-bncc/admin/page.tsx` com operações de curadoria, inativos e conveniência de papel, conforme US3/T035/T036 (missing).
- [ ] T051 Criar fixtures e executar os testes de integração, componentes e E2E pendentes da Feature 002, incluindo autenticação PROFESSOR/ADMIN, catálogo, administração e filtros, conforme Constituição V e T012–T015, T023–T025, T029–T031 e T037–T039 (missing).
- [X] T052 Limpar o access token em memória quando a renovação falhar no retry de `apps/web/lib/api-client.ts` e `apps/web/components/auth/auth-session-provider.tsx`, conforme T010 e Constituição I (partial).
- [X] T053 Converter colisões de unicidade ao editar nível em resposta 409 controlada em `apps/api/src/bncc/bncc.service.ts`, conforme FR-003 (partial).

## Phase 8: Convergence

- [X] T054 CRITICAL Substituir ou configurar o runtime de desenvolvimento/teste da API para preservar `emitDecoratorMetadata` nos controllers NestJS e acrescentar testes HTTP que comprovem rejeições 400 de DTOs BNCC inválidos, conforme Constituição I e FR-009 (contradicts).
- [X] T055 Harmonizar a clarificação inicial e FR-011 de `specs/002-bncc-explorer/spec.md` com FR-008, explicitando que eixo pendente é permitido e que filtros por eixo o excluem, conforme decisão de domínio registrada (contradicts).
