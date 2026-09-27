# Plano de Implementação: Explorador BNCC

**Branch planejada**: `feat/002-bncc-explorer` | **Data**: 2026-09-26 | **Spec**: [spec.md](spec.md)

## Resumo

Evoluir o monorepo com um catálogo global BNCC de Computação. A API NestJS exporá consulta autenticada e gestão exclusiva de ADMIN; PostgreSQL/Prisma preservará níveis, etapas por ano/faixa e habilidades com exemplos ordenados. A web Next.js terá explorador protegido, filtros dependentes, busca, paginação e estados de carregamento, vazio e erro. O seed versionado será idempotente e não sobrescreverá curadoria administrativa.

## Contexto Técnico

**Linguagem/Versão**: TypeScript e Node.js 22; Next.js 15 em `apps/web`; NestJS 11 em `apps/api`.

**Dependências principais**: pnpm, Turborepo, Prisma 6, PostgreSQL 16, class-validator, Swagger/OpenAPI, JWT, Vitest, Supertest e Playwright. A migration usará `pg_trgm` e GIN para busca parcial/textual.

**Armazenamento**: PostgreSQL via Prisma, migration aditiva e dataset BNCC versionado internamente.

**Testes**: unitários, integração PostgreSQL e E2E crítico com Playwright; lint, typecheck, testes e build são gates obrigatórios.

**Plataforma-alvo**: web e API REST sob `/api/v1`.

**Tipo de projeto**: monorepo web full-stack.

**Objetivos de desempenho**: página padrão de 20 itens, máximo de 100; em ambiente de aceitação, ao menos 95% de vinte consultas representativas por filtros e busca devem responder em até um segundo, com índices para crescimento.

**Restrições**: access token só em memória no navegador; refresh continua em cookie HttpOnly. Nenhum token, segredo ou sessão é persistido em URL, storage ou logs. Não há exclusão física nesta feature.

**Escopo**: EI, EF e EM; três eixos; busca, paginação, gestão ADMIN e consulta PROFESSOR. Não inclui importação externa automática nem catálogo por escola ou professor.

## Verificação da Constituição

| Princípio | Resultado |
|---|---|
| Segurança | Passa: DTOs, AuthGuard global, RBAC e token somente em memória. |
| Specification-first | Passa: specification e clarificações estão completas antes do plano. |
| Dados e API | Passa: PostgreSQL/Prisma, migrations versionadas e OpenAPI. |
| IA responsável | Passa: a feature não usa IA. |
| Qualidade | Passa: plano inclui unitário, integração, E2E e gates. |

O catálogo é global; não há `professorId` ou ownership nestas entidades. Isso é uma exceção intencional de ownership para dados públicos globais, não uma exceção de RBAC: somente ADMIN altera itens pelo backend.

## Estratégia

1. Adicionar enum/modelos Prisma, migration revisada e constraints SQL.
2. Versionar dataset e criar seed transacional/idempotente.
3. Criar módulo BNCC, DTOs, serviço, controllers e Swagger.
4. Criar sessão web em memória e cliente autorizado para endpoints protegidos.
5. Criar explorador docente e área administrativa protegida.
6. Cobrir contratos, RBAC, filtros, seed e estados de UI; executar os gates.

## Migrations e Seed

- Criar migration `add_bncc_catalog`, sem editar migrations existentes; testar em banco vazio e já migrado.
- CHECK SQL: `anoInicial` e `anoFinal` são ambos nulos ou preenchidos, e o intervalo preenchido é crescente. Serviço e seed reforçam EI sem ano, EF 1–9 e EM 1–3.
- Habilitar `pg_trgm` e índices GIN para código, descrição, explicação e exemplo; falhar explicitamente se o ambiente não permitir a extensão.
- O seed valida o dataset completo antes de uma transação e cria apenas itens ausentes. Reexecução não duplica, reativa nem sobrescreve edições/desativações feitas por ADMIN; divergências são reportadas para curadoria humana.

## Consulta e Autorização

- `page` começa em 1; padrão 1, tamanho 20, máximo 100; ordem é sempre código crescente. Página além do total retorna `data: []` e metadados válidos, sem erro.
- Filtros são AND: nível, etapa, ano coberto e eixo. Busca é OR em código, descrição, explicação e exemplos, combinada com filtros.
- `year` requer `levelId`; não é válido para EI. `stageId` deve pertencer ao nível e cobrir o ano. Consulta válida sem correspondência retorna `200` vazio; entrada inválida retorna `400` orientativo.
- PROFESSOR e ADMIN leem rotas públicas autenticadas, porém somente ADMIN acessa leitura administrativa de inativos e POST/PATCH. Tentativa de alterar código ou etapa de habilidade existente é rejeitada. ADMIN só cria nível canônico ausente; desativar nível/etapa oculta descendentes docentes sem reativá-los individualmente.
- Cada criação, edição ou desativação administrativa registra evento transacional por meio do `AuditService`, com `actorId`, tipo e identificador do catálogo; o contexto não inclui token, segredo ou dado de credencial.

## Estrutura do Projeto

```text
apps/api/
├── prisma/{migrations,seed.ts,seed-data/bncc-computacao.ts}
├── src/bncc/{bncc.controller,bncc-admin.controller,bncc.service,dto}.ts
└── test/bncc*.spec.ts
apps/web/
├── app/catalogo-bncc/{page.tsx,admin/page.tsx}
├── components/{auth,bncc}/
├── e2e/bncc-*.spec.ts
├── playwright.config.ts
└── lib/{auth,api-client,bncc-api,bncc-query}.ts
specs/002-bncc-explorer/{plan,research,data-model,quickstart}.md
specs/002-bncc-explorer/contracts/openapi.yaml
```

**Decisão de estrutura**: manter os dois aplicativos existentes. O domínio fica no módulo `bncc` da API; a administração é rota protegida da mesma web, não um novo aplicativo.
