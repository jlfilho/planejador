# Plano de Implementação: Gerador de planos de aula por IA

**Branch planejada**: `feat/003-ai-lesson-plans` | **Data**: 2026-09-29 | **Spec**: [spec.md](spec.md)

## Resumo

Adicionar planos de aula assistidos por IA ao monorepo. A web Next.js envia a
intenção do professor somente à API NestJS. A API valida o usuário e as
habilidades BNCC, registra uma execução `AiRun` pendente, chama o n8n por HTTPS
com a credencial HTTP Header Auth configurada, valida a resposta e só então cria
um `Plan` em `RASCUNHO`.

## Contexto técnico

**Linguagem/versão**: TypeScript/Node.js 22, Next.js 15 e NestJS 11.

**Dependências**: Prisma/PostgreSQL, class-validator, class-transformer, Swagger,
JWT, `crypto` e `fetch` nativos, Vitest, Supertest e Playwright; sem novo cliente
HTTP.

**Armazenamento**: PostgreSQL por Prisma, com migration aditiva para `Plan`,
`AiRun` e relações imutáveis às habilidades BNCC.

**Testes**: unitários, integração PostgreSQL/HTTP e E2E crítico; lint, typecheck,
test, test:integration, test:e2e e build são gates.

**Restrições**: n8n só por HTTPS e somente pelo backend. Browser não recebe JWT
de integração, cookie, senha, `DATABASE_URL`, chave Gemini ou
`N8N_INTEGRATION_SECRET`. Conteúdo só persiste após resposta externa válida;
geração nunca finaliza um plano.

## Verificação da Constituição

| Princípio | Resultado |
|---|---|
| Segurança | Passa: DTOs, schema externo, RBAC/ownership no backend, Header Auth e logs sem conteúdo sensível. |
| Specification-first | Passa: Feature 003 possui spec e plano antes de tarefas/código. |
| Dados e API | Passa: Prisma/migration e REST/OpenAPI; web não acessa n8n, Gemini ou Qdrant. |
| IA responsável | Passa: resultado válido nasce editável em rascunho; finalização é explícita. |
| Qualidade | Passa: plano inclui cobertura unitária, integração, E2E e gates. |

## Decisões de arquitetura

1. `AiRun` registra a solicitação em `PENDING` e termina em `SUCCEEDED` ou
   `FAILED`. Falha pode permanecer auditável, mas nunca cria plano parcial.
2. `Plan` existe somente após sucesso, inicia em `RASCUNHO` e muda para
   `FINALIZADO` exclusivamente por ação explícita. Ele aponta ao `AiRun`, que
   preserva entrada e habilidades originais.
3. A API cria `requestId` e `idempotencyKey` UUID para auditoria e associa-os à
   execução antes do HTTP. Como o workflow existente não recebe nem deduplica
   essa chave, não há retry automático que possa criar geração duplicada.
4. O cliente envia somente o corpo definido em
   [contracts/n8n-webhook.md](contracts/n8n-webhook.md) e o segredo no cabeçalho
   configurado por `N8N_AUTH_HEADER_NAME`; não envia JWT, cookie ou HMAC.
5. PROFESSOR usa somente `ownerId`; ADMIN pode consultar e alterar rascunhos de
   terceiros sem mudar proprietário, mas não pode finalizá-los. Ninguém altera
   plano finalizado. Salvamentos válidos concorrentes seguem último recebido.

## Integração n8n, API e UI

- O destino é `POST https://jlfilho.app.n8n.cloud/webhook/agente-planejador-bncc`;
  [contracts/n8n-webhook.md](contracts/n8n-webhook.md) define Header Auth, corpo
  e resposta válidos.
- `N8N_INTEGRATION_SECRET` e `N8N_AUTH_HEADER_NAME` ficam apenas no
  backend/secret store. `.env` local não é versionado; `.env.example` terá
  somente marcadores fictícios.
- `PlansModule` reúne controller, service, DTOs, cliente n8n e Swagger conforme
  [contracts/plans-api.yaml](contracts/plans-api.yaml). Em sucesso, a transação
  atualiza `AiRun` e cria o plano; em falha, registra código seguro e não persiste
  conteúdo.
- A web recebe `/planos` com seleção BNCC, formulário, estado pendente, erro com
  entrada preservada, editor Markdown, referências editáveis ou manuais quando
  ausentes, e ações explícitas de salvar/finalizar. Uma área administrativa
  dedicada, exclusiva a ADMIN, exibe planos privados de terceiros com o
  proprietário identificado. Ela fala somente com `/api/v1`.

## Alinhamento de interface

1. A listagem pessoal, o formulário, correção, processamento, revisão,
   confirmação, estado finalizado e falha são implementados conforme as oito
   referências correspondentes em `spec.md`, preservando seleção e campos na
   correção ou falha.
2. A administração de planos privados usa a nona referência Figma em uma rota
   administrativa dedicada. A UI só oferece essa navegação a ADMIN, mas a API
   continua responsável pelo RBAC e pela propriedade.
3. A revisão mostra a indicação de assistência por IA, as habilidades de origem
   e referências retornadas; sem referências retornadas, permite adicionar uma
   lista manual opcional antes de salvar ou finalizar o rascunho.

## Migrations e configuração

1. Atualizar `apps/api/prisma/schema.prisma`, criar migration nova e validar FKs,
   `onDelete: Restrict` para BNCC e índices por owner/estado e idempotência.
2. Usar `N8N_WEBHOOK_URL`, `N8N_INTEGRATION_SECRET`, `N8N_AUTH_HEADER_NAME` e
   `N8N_TIMEOUT_MS`; a URL deve ser HTTPS e corresponder exatamente ao endpoint
   do contrato n8n, e o timeout tem máximo de 30 segundos.
3. Executar `prisma generate` e `prisma migrate` em banco isolado; nunca editar
   migrations existentes.

## Estrutura do projeto

```text
apps/api/
├── prisma/{schema.prisma,migrations/}
├── src/plans/{dto,plans.controller,plans.service,plans.module,n8n.client}.ts
└── test/plans*.spec.ts
apps/web/
├── app/planos/page.tsx
├── app/admin/planos/page.tsx
├── components/plans/{plan-form,plan-editor,plan-list}.tsx
├── lib/plans-api.ts
└── e2e/plans.spec.ts
specs/003-ai-lesson-plans/
└── contracts/{plans-api.yaml,n8n-webhook.md}
```

**Decisão de estrutura**: os dois aplicativos existentes permanecem; n8n é
integração externa interna ao módulo `plans`, nunca dependência direta da web.
