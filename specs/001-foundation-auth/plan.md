# Plano de Implementação: Fundação e autenticação

**Branch planejada**: `feat/001-foundation-auth` | **Data**: 2026-09-23 | **Spec**: [spec.md](spec.md)

## Resumo

Criar durante Implement o monorepo pnpm/Turborepo, `apps/web` em Next.js e `apps/api` em NestJS, com PostgreSQL/Prisma, REST `/api/v1`, cadastro PROFESSOR, bootstrap controlado e idempotente do primeiro ADMIN, sessões múltiplas, refresh rotativo, RBAC, ownership, alteração administrativa de estado de conta, auditoria e quality gates.

## Contexto Técnico

**Linguagem**: TypeScript/Node.js LTS fixado no bootstrap. **Dependências**: pnpm, Turbo, Next App Router, NestJS, Prisma, PostgreSQL, OpenAPI/Swagger, Argon2id, DTO validation, throttling, Vitest, Supertest e Playwright. **Storage**: PostgreSQL com migrations em `apps/api/prisma`. **Testes**: unitários, integração e E2E. **Restrições**: access token curto em Bearer; refresh rotativo em cookie HttpOnly, Secure e SameSite; CORS somente `WEB_ORIGIN`; logs sem senha/token/segredo. Access token expirado pode ser renovado apenas por refresh válido de sessão ativa; refresh expirado, revogado ou reutilizado exige novo login. O primeiro ADMIN será criado somente por um CLI do backend, executado pelo operador autorizado, que lê e-mail e senha de segredos de runtime; o comando falha sem alterações se já houver ADMIN e nunca revela ou registra a senha. **Escopo**: recuperação/troca de senha, revogação em massa e gestão completa de usuários ficam fora desta feature.

## Verificação da Constituição

Todos os princípios passam: guards e ownership no backend; Prisma/migrations e API contratual; frontend sem acesso direto a dados; gates de lint/typecheck/test/build; branch `feat/001-foundation-auth` criada somente pelo hook antes de Implement.

## Estrutura Planejada

```text
apps/api/{prisma,src/{auth,users,audit,common,cli},test}
apps/web/{app,components,lib,tests}
specs/001-foundation-auth/{research.md,data-model.md,contracts/openapi.yaml,quickstart.md}
pnpm-workspace.yaml  turbo.json  package.json  .env.example
```

## Estratégia

1. Criar workspaces, scripts raiz `lint`, `typecheck`, `test`, `test:integration`, `test:e2e`, `build` e Turbo cacheando somente outputs.
2. Criar API `/api/v1`, DTO validation estrita, Swagger e erros seguros.
3. Criar schema/migration inicial para usuários, sessões e auditoria.
4. Criar o CLI server-side idempotente de bootstrap do primeiro ADMIN; não expor rota HTTP para essa operação.
5. Implementar cadastro, login, refresh, logout e `me`; aplicar guard global, roles e ownership.
6. Implementar `PATCH /api/v1/users/{userId}/status`, restrito a ADMIN, para ativar/inativar contas; negar novas entradas e renovações para contas inativadas, impedir a auto-inativação e a inativação do último ADMIN ativo, e auditar a mudança de estado.
7. Implementar páginas web e testes; executar todos os gates.

## Migrations

Versionar schema e diretórios de migration. Em desenvolvimento criar migration nomeada e revisar SQL; em CI/staging/produção aplicar somente migrations pendentes, sem sincronização de schema sem histórico. Falhar pipeline em divergência.

## Testes

Unidade: DTOs, senha, rotação, guards e ownership. Integração: PostgreSQL, unicidade, bootstrap único e seguro do ADMIN, cookie, auditoria, rate limit e alteração de estado autorizada. E2E: cadastro PROFESSOR, login, múltiplas sessões, logout atual, refresh e negação de sessão expirada/inativa.
