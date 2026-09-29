# Plano de Implementação: Alinhamento da UI ao Figma

**Branch**: `feat/004-figma-ui-alignment` | **Data**: 2026-09-28 | **Spec**: [spec.md](./spec.md)

**Entrada**: Especificação da Feature 004 e arquivo Figma Planejador BNCC.

## Resumo

Atualizar a apresentação das três rotas web atualmente expostas — autenticação,
exploração BNCC e administração BNCC — para refletir o design Figma, incluindo
suas variantes desktop e mobile. A implementação usará o MCP Figma para obter o
contexto e os recursos de cada frame, mantendo as ações, sessões, chamadas à API,
RBAC e ownership já existentes. Não haverá alteração no backend, no banco, nem
nos contratos REST.

## Contexto Técnico

**Linguagem/versão**: TypeScript 5.9; React 19; Next.js 15.

**Dependências principais**: Next.js, React, `@testing-library/react`, Vitest e
Playwright; integração MCP Figma para inspeção dos frames e obtenção de assets.

**Armazenamento**: N/A — a feature não altera persistência nem migrations.

**Testes**: Vitest para componentes e Playwright para fluxos críticos nas rotas
web existentes.

**Plataforma-alvo**: Aplicação web Next.js para desktop e mobile.

**Tipo de projeto**: Monorepo TypeScript; mudança concentrada em `apps/web`.

**Objetivo de desempenho**: A atualização visual não deve introduzir chamadas
adicionais à API nem bloquear as ações interativas existentes.

**Restrições**: Preservar textos funcionais, dados reais, autenticação, RBAC,
ownership e tratamento de erro; não usar URLs temporárias de assets Figma em
código; toda divergência visual requer aprovação humana documentada.

**Escopo**: `/`, `/catalogo-bncc` e `/catalogo-bncc/admin`, seus componentes
BNCC, provedor de sessão e estilos compartilhados; desktop e mobile.

## Verificação da Constituição

| Princípio | Avaliação antes do design | Resultado |
|---|---|---|
| Segurança por padrão | Nenhum segredo, token ou dado privado será adicionado à UI. As chamadas existentes permanecem mediadas pela API. | Aprovado |
| Entrega orientada por especificação | Esta feature possui specification, clarifications, plano, pesquisa, contrato de UI e guia de validação. | Aprovado |
| Dados e API contratual | Não altera Prisma, PostgreSQL, endpoints ou acesso direto a integrações externas. | Aprovado |
| IA responsável | Não altera fluxos ou resultados de IA. | Aprovado |
| Qualidade verificável | Exige lint, typecheck, testes unitários e E2E das rotas atualizadas antes da publicação. | Aprovado |

**Reavaliação pós-design**: Aprovado. O desenho propõe somente adaptação de
apresentação e testes no frontend; não introduz exceções à Constituição.

## Estrutura do Projeto

### Documentação desta feature

```text
specs/004-figma-ui-alignment/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-alignment.md
└── tasks.md                 # criado posteriormente por $speckit-tasks
```

### Código-fonte

```text
apps/web/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── catalogo-bncc/
│       ├── page.tsx
│       └── admin/page.tsx
├── components/
│   ├── auth/auth-session-provider.tsx
│   └── bncc/
│       ├── catalog-explorer.tsx
│       └── catalog-admin.tsx
├── lib/
│   ├── auth.ts
│   ├── api-client.ts
│   └── bncc-api.ts
├── e2e/
│   ├── bncc-explorer.spec.ts
│   └── bncc-admin.spec.ts
└── *.spec.tsx
```

**Decisão de estrutura**: Usar as rotas e componentes existentes. Adicionar
estilos compartilhados em `apps/web/app/` e estilos ou subcomponentes locais
somente quando forem necessários para expressar o layout Figma, sem mover lógica
de sessão ou de catálogo para fora das áreas atuais.

## Complexidade

Não há violações à Constituição que precisem de justificativa.
