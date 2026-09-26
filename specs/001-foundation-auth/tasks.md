# Tarefas: Fundação e autenticação

## Fase 1 — Setup

- [ ] T001 Criar `package.json`, `pnpm-workspace.yaml` e `turbo.json` na raiz.
- [ ] T002 [P] Criar `apps/web` Next.js TypeScript e seus scripts em `apps/web/package.json`.
- [ ] T003 [P] Criar `apps/api` NestJS TypeScript e seus scripts em `apps/api/package.json`.
- [ ] T004 Criar `docker-compose.yml`, `.env.example` e configuração PostgreSQL de desenvolvimento.
- [ ] T005 Configurar gates raiz `lint`, `typecheck`, `test`, `test:integration`, `test:e2e` e `build`.

## Fase 2 — Fundação bloqueante

- [ ] T006 Criar `apps/api/prisma/schema.prisma` para User, Session e AuditEvent.
- [ ] T007 Criar migration inicial em `apps/api/prisma/migrations/` com enums, unicidade e índices.
- [ ] T008 Configurar Prisma, ambiente e conexão em `apps/api/src/common/`.
- [ ] T009 Configurar prefixo `/api/v1`, ValidationPipe, erros seguros e bootstrap do Swagger em `apps/api/src/main.ts`.
- [ ] T010 Configurar AuthGuard global, `@Public()`, `@Roles()` e RolesGuard em `apps/api/src/auth/`.
- [ ] T011 Configurar CORS com `WEB_ORIGIN`, cookies seguros, rate limit e logs sanitizados em `apps/api/src/common/`.
- [ ] T012 Criar infraestrutura de auditoria em `apps/api/src/audit/`.

## Fase 3 — US1 Cadastro e login (P1, MVP)

**Teste independente**: cadastro público cria PROFESSOR e login de conta ativa retorna sessão sem expor conta existente.

- [ ] T013 [P] [US1] Criar DTOs e testes de validação em `apps/api/src/auth/dto/` e `apps/api/src/auth/*.spec.ts`.
- [ ] T014 [US1] Implementar hash de senha e UserService em `apps/api/src/users/`.
- [ ] T015 [US1] Implementar e testar o CLI server-side idempotente `admin:bootstrap` em `apps/api/src/cli/` e `apps/api/src/users/`: ler e-mail e senha apenas de segredos de runtime, criar o primeiro ADMIN somente se não houver outro e falhar sem alteração caso já exista ADMIN, sem registrar credenciais.
- [ ] T016 [US1] Implementar registro, login e respostas genéricas em `apps/api/src/auth/`.
- [ ] T017 [US1] Implementar `POST /api/v1/auth/register` e `POST /api/v1/auth/login` conforme `contracts/openapi.yaml`.
- [ ] T018 [P] [US1] Criar telas e cliente REST de cadastro/login em `apps/web/app/` e `apps/web/lib/`.
- [ ] T019 [US1] Criar testes integração/E2E de cadastro, e-mail único e anti-enumeração em `apps/api/test/` e `apps/web/tests/`.

## Fase 4 — US2 Sessões (P1)

**Teste independente**: duas sessões coexistem; logout revoga somente a atual; refresh rotativo não reutiliza token anterior.

- [ ] T020 [US2] Implementar SessionService, família e rotação segura em `apps/api/src/auth/`.
- [ ] T021 [US2] Implementar refresh/logout e cookies em `apps/api/src/auth/`.
- [ ] T022 [US2] Implementar `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout` e `GET /api/v1/auth/me`.
- [ ] T023 [P] [US2] Criar renovação e logout no cliente em `apps/web/lib/` e `apps/web/app/`.
- [ ] T024 [US2] Criar testes de expiração: access token expirado renova com refresh válido; refresh/sessão expirado, revogado ou reutilizado exige novo login; incluir múltiplos dispositivos e logout atual em `apps/api/test/` e `apps/web/tests/`.

## Fase 5 — US3 Autorização (P2)

- [ ] T025 [US3] Implementar verificação de conta ativa e RBAC em `apps/api/src/auth/`.
- [ ] T026 [US3] Implementar helper de ownership obrigatório em `apps/api/src/common/`.
- [ ] T027 [US3] Documentar no Swagger `bearerAuth` e respostas 401/403 dos endpoints protegidos; documentar 429 somente para login e refresh, que possuem rate limit, em `apps/api/src/`.
- [ ] T028 [US3] Criar testes de rota privada, papéis e ownership em `apps/api/test/`.
- [ ] T029 [US3] Implementar `PATCH /api/v1/users/{userId}/status`, restrito a ADMIN, para ativar/inativar conta e negar sessões futuras em `apps/api/src/users/`.
- [ ] T030 [US3] Criar teste de integração para `PATCH /api/v1/users/{userId}/status`: ADMIN altera o estado, PROFESSOR recebe 403, ADMIN não inativa a própria conta nem o último ADMIN ativo, e conta inativada não inicia nem renova sessão em `apps/api/test/`.

## Fase 6 — US4 Auditoria (P2)

- [ ] T031 [US4] Registrar eventos de cadastro, login, refresh, logout, expiração, conta inativa e mudança de estado em `apps/api/src/audit/`.
- [ ] T032 [US4] Criar testes de auditoria sem senha, token ou segredo, incluindo mudança de estado, em `apps/api/test/`.

## Fase 7 — Polimento

- [ ] T033 Validar a compatibilidade entre Swagger gerado e `specs/001-foundation-auth/contracts/openapi.yaml`.
- [ ] T034 Executar cenários de `specs/001-foundation-auth/quickstart.md`.
- [ ] T035 Criar testes de integração de rate limit `429` para login e refresh em `apps/api/test/`.
- [ ] T036 Criar testes de integração de `WEB_ORIGIN`, origem negada e atributos do cookie refresh em `apps/api/test/`.
- [ ] T037 Criar cenário E2E cronometrado de cadastro e login contra o limite de SC-001 em `apps/web/tests/`.
- [ ] T038 Executar todos os quality gates e corrigir falhas antes do PR.

## Dependências

T001–T005 → T006–T012 → US1 → US2 → US3/US4 → T033–T038. US3 e US4 podem ocorrer em paralelo após US2; em particular, T029–T030 dependem do ciclo de sessão implementado em US2.

## Phase 8: Convergence

- [X] T039 CRITICAL Remover o fallback versionado de `JWT_ACCESS_SECRET`, exigir segredo de runtime forte e cobrir a falha segura de configuração, conforme Constituição I (contradicts).
- [X] T040 CRITICAL Vincular access token a uma sessão persistida e fazer o guard negar rotas privadas para sessão revogada/expirada ou conta inativa, conforme FR-006, FR-009 e SC-002 (partial).
- [X] T041 Implementar detecção de reuso de refresh com revogação de toda a família e registrar auditoria para expiração, revogação, reuso e conta inativa, conforme FR-007 e FR-012 (partial).
- [X] T042 Tratar conflito de e-mail no cadastro com resposta contratual segura e manter respostas indistinguíveis para credencial inválida, e-mail inexistente e conta inativa, conforme FR-002 e FR-011 (partial).
- [X] T043 Implementar o helper de ownership no backend e o fluxo web de refresh/logout, conforme FR-010, T023 e T026 (missing).
- [ ] T044 Criar e executar testes unitários, integração e E2E para cadastro, autenticação, sessões, RBAC, ownership, alteração de estado, auditoria, rate limit, CORS e cookies, conforme Constituição V e SC-001–SC-005 (missing).
- [X] T045 Alinhar decorators Swagger e a implementação HTTP ao `contracts/openapi.yaml`, incluindo `userId`, respostas 400/401/403/404/409/429 e atributos de cookie/CORS por ambiente, conforme Constituição III e T027/T033/T036 (partial).

## Phase 9: Convergence

- [X] T046 Alinhar a política de rate limit e o contrato de logout: aplicar e documentar `429` em logout ou remover a resposta não aplicável do OpenAPI, conforme T027 e `contracts/openapi.yaml` (partial).
- [X] T047 Exigir `WEB_ORIGIN` em runtime e falhar de forma segura quando estiver ausente, removendo o fallback de origem; cobrir CORS e cookies por ambiente conforme plan.md e Constituição I (partial).
- [X] T048 Registrar e testar eventos de auditoria distintos para tentativa de refresh em conta inativa, expiração e reutilização de refresh, sem senha, token ou segredo, conforme FR-012 e SC-004 (partial).
